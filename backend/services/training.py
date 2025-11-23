import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from typing import Tuple, Dict
import logging
from pathlib import Path

from models.physics_loss import PhysicsLoss
from models.pinn_model import PINNModel

logger = logging.getLogger(__name__)

class PINNTrainer:
    """Trainer for Physics-Informed Neural Networks with hybrid loss.
    L_total = L_data + lambda * L_physics
    """
    
    def __init__(self, model: PINNModel, device='cuda', physics_weight=1.0, lr=1e-3):
        self.device = device
        self.model = model.to(device)
        self.physics_weight = physics_weight
        self.optimizer = optim.Adam(model.parameters(), lr=lr)
        self.scheduler = optim.lr_scheduler.StepLR(self.optimizer, step_size=50, gamma=0.9)
        self.physics_loss = PhysicsLoss()
        self.mse_loss = nn.MSELoss()
        self.history = {'epoch': [], 'data_loss': [], 'physics_loss': [], 'total_loss': []}
    
    def _data_loss(self, pred, target):
        u_p, v_p, p_p = pred
        u_t, v_t, p_t = target
        return self.mse_loss(u_p, u_t) + self.mse_loss(v_p, v_t) + self.mse_loss(p_p, p_t)
    
    def train_epoch(self, train_loader, reynolds, mach):
        self.model.train()
        total_data_loss, total_physics_loss, total_loss = 0, 0, 0
        
        for x, y, u_t, v_t, p_t, aoa in train_loader:
            x, y = x.to(self.device).requires_grad_(True), y.to(self.device).requires_grad_(True)
            u_t, v_t, p_t = u_t.to(self.device), v_t.to(self.device), p_t.to(self.device)
            aoa = aoa.to(self.device)
            
            u_p, v_p, p_p = self.model(x, y, aoa, reynolds, mach)
            
            data_l = self._data_loss((u_p, v_p, p_p), (u_t, v_t, p_t))
            phys_l = self.physics_loss((u_p, v_p, p_p), x, y, reynolds, mach)
            loss = data_l + self.physics_weight * phys_l
            
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            
            total_data_loss += data_l.item()
            total_physics_loss += phys_l.item()
            total_loss += loss.item()
        
        n = len(train_loader)
        return {'data': total_data_loss/n, 'physics': total_physics_loss/n, 'total': total_loss/n}
    
    def train(self, train_loader, epochs, reynolds, mach, checkpoint_dir='./checkpoints'):
        Path(checkpoint_dir).mkdir(exist_ok=True)
        logger.info(f'Training PINN for {epochs} epochs | Re={reynolds}, M={mach}')
        
        for epoch in range(epochs):
            metrics = self.train_epoch(train_loader, reynolds, mach)
            self.history['epoch'].append(epoch)
            self.history['data_loss'].append(metrics['data'])
            self.history['physics_loss'].append(metrics['physics'])
            self.history['total_loss'].append(metrics['total'])
            
            if (epoch + 1) % 10 == 0:
                logger.info(f"Epoch {epoch+1}/{epochs} | Data: {metrics['data']:.6f} | Physics: {metrics['physics']:.6f} | Total: {metrics['total']:.6f}")
                self.save(f"{checkpoint_dir}/epoch_{epoch+1}.pt")
            
            self.scheduler.step()
        
        return self.history
    
    def save(self, path):
        torch.save(self.model.state_dict(), path)
        logger.info(f'Model saved to {path}')

def create_dataloader(df, batch_size=32, test_split=0.2):
    x = torch.FloatTensor(df[['x']].values)
    y = torch.FloatTensor(df[['y']].values)
    u = torch.FloatTensor(df[['u']].values)
    v = torch.FloatTensor(df[['v']].values)
    p = torch.FloatTensor(df[['p']].values)
    aoa = torch.FloatTensor(df[['AoA']].values)
    
    dataset = TensorDataset(x, y, u, v, p, aoa)
    train_size = int((1 - test_split) * len(dataset))
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, len(dataset) - train_size])
    
    return DataLoader(train_ds, batch_size, shuffle=True), DataLoader(val_ds, batch_size)
