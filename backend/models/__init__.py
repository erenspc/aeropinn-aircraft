"""Models package for AeroPINN-Aircraft."""
from .pinn_model import PINNModel
from .physics_loss import PhysicsLoss, pinn_loss

__all__ = ['PINNModel', 'PhysicsLoss', 'pinn_loss']
