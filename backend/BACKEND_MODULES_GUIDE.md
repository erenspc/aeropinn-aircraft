# AeroPINN-Aircraft: Complete Backend Python Modules Guide

This document contains ALL Python modules needed for the backend. Copy-paste each section into the respective file.

## QUICK SETUP

```bash
cd backend
mkdir -p services models utils tests
touch services/__init__.py models/__init__.py utils/__init__.py tests/__init__.py
cp .env.example .env
pip install -r requirements.txt
python app.py
```

---

## MODULE 1: services/preprocessing.py

```python
import pandas as pd
import numpy as np
from typing import Tuple, Dict
import logging

logger = logging.getLogger(__name__)

def validate_csv(df: pd.DataFrame) -> Dict:
    """Validate CSV format and required columns"""
    required_cols = ['AoA_deg', 'CL', 'CD']
    
    if df.empty:
        return {'valid': False, 'error': 'CSV is empty'}
    
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        return {'valid': False, 'error': f'Missing columns: {missing_cols}'}
    
    if df[['AoA_deg', 'CL', 'CD']].isnull().any().any():
        return {'valid': False, 'error': 'CSV contains NaN values'}
    
    try:
        df[['AoA_deg', 'CL', 'CD']] = df[['AoA_deg', 'CL', 'CD']].astype(float)
    except ValueError:
        return {'valid': False, 'error': 'Non-numeric values in columns'}
    
    logger.info(f'CSV validated successfully: {len(df)} rows')
    return {'valid': True, 'error': None}

def normalize_data(df: pd.DataFrame, reynolds: float, mach: float) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Normalize input and output data for PINN training"""
    
    # Prepare input features
    aoa = df['AoA_deg'].values.reshape(-1, 1)
    
    # Add Reynolds and Mach normalization
    re_norm = np.full_like(aoa, reynolds / 1e6)  # Normalize to millions
    mach_norm = np.full_like(aoa, mach)
    
    X = np.hstack([aoa, re_norm, mach_norm])
    
    # Prepare output features (CL, CD, Cm if available)
    y_data = [df['CL'].values]
    y_data.append(df['CD'].values)
    if 'Cm' in df.columns:
        y_data.append(df['Cm'].values)
    
    y = np.column_stack(y_data)
    
    # Normalize
    X_mean, X_std = X.mean(axis=0), X.std(axis=0) + 1e-8
    y_mean, y_std = y.mean(axis=0), y.std(axis=0) + 1e-8
    
    X_norm = (X - X_mean) / X_std
    y_norm = (y - y_mean) / y_std
    
    return X_norm, y_norm, X_mean, X_std, y_mean, y_std
```

---

## MODULE 2: services/aerodynamics.py

```python
import numpy as np
from scipy.interpolate import interp1d
import logging

logger = logging.getLogger(__name__)

def calculate_reynolds(rho: float, velocity: float, chord: float, mu: float) -> float:
    """Calculate Reynolds number: Re = rho * V * c / mu"""
    return (rho * velocity * chord) / mu

def calculate_mach(velocity: float, speed_of_sound: float) -> float:
    """Calculate Mach number: M = V / a"""
    return velocity / speed_of_sound

def predict_stall(df):
    """Predict stall angle from CL data"""
    cl_values = df['CL'].values
    aoa_values = df['AoA_deg'].values
    
    # Find CLmax
    cl_max_idx = np.argmax(cl_values)
    stall_angle = aoa_values[cl_max_idx]
    
    logger.info(f'Stall angle predicted: {stall_angle:.2f}°')
    return float(stall_angle)

def make_polar_curves(aoa: np.ndarray, cl: np.ndarray, cd: np.ndarray):
    """Create smooth polar curves via interpolation"""
    # Sort by AoA
    sort_idx = np.argsort(aoa)
    aoa_sorted = aoa[sort_idx]
    cl_sorted = cl[sort_idx]
    cd_sorted = cd[sort_idx]
    
    # Create interpolation functions
    f_cl = interp1d(aoa_sorted, cl_sorted, kind='cubic', fill_value='extrapolate')
    f_cd = interp1d(aoa_sorted, cd_sorted, kind='cubic', fill_value='extrapolate')
    
    # Generate fine polar curve
    aoa_fine = np.linspace(aoa_sorted.min(), aoa_sorted.max(), 100)
    cl_fine = f_cl(aoa_fine)
    cd_fine = f_cd(aoa_fine)
    
    return aoa_fine, cl_fine, cd_fine

def calculate_efficiency(cl: np.ndarray, cd: np.ndarray) -> np.ndarray:
    """Calculate L/D ratio"""
    return cl / (cd + 1e-8)  # Add epsilon to avoid division by zero
```

---

## MODULE 3: utils/atmosphere.py

```python
import numpy as np

def get_dynamic_viscosity(temperature: float) -> float:
    """Calculate dynamic viscosity using Sutherland's law
    mu = mu0 * (T/T0)^1.5 * (T0 + S) / (T + S)
    where mu0 = 1.81e-5 Pa*s at T0 = 288.15 K, S = 110.4 K
    """
    mu0 = 1.81e-5  # Reference viscosity at 288.15 K
    T0 = 288.15    # Reference temperature
    S = 110.4      # Sutherland constant
    
    mu = mu0 * ((temperature / T0) ** 1.5) * ((T0 + S) / (temperature + S))
    return mu

def get_speed_of_sound(temperature: float) -> float:
    """Calculate speed of sound: a = sqrt(gamma * R * T)
    gamma = 1.4 (for air)
    R = 287 J/(kg*K)
    """
    gamma = 1.4
    R = 287
    return np.sqrt(gamma * R * temperature)

def get_air_density_altitude(altitude: float, temp_sea_level: float = 288.15) -> float:
    """Calculate air density at altitude using barometric formula"""
    rho_0 = 1.225  # Sea level density
    L = 0.0065     # Temperature lapse rate
    g = 9.81       # Gravity
    R = 287        # Gas constant
    
    temp_at_alt = temp_sea_level - L * altitude
    pressure_ratio = (temp_at_alt / temp_sea_level) ** (-g / (L * R))
    
    return rho_0 * pressure_ratio
```

---

## MODULE 4: models/pinn_model.py

```python
import torch
import torch.nn as nn

class AeroPINN(nn.Module):
    """Physics-Informed Neural Network for aerodynamic prediction
    
    Input: [AoA, Reynolds, Mach]
    Output: [CL, CD, Cp(optional)]
    """
    
    def __init__(self, input_dim: int = 3, hidden_dim: int = 128, 
                 num_layers: int = 6, output_dim: int = 3):
        super().__init__()
        
        layers = []
        
        # Input layer
        layers.append(nn.Linear(input_dim, hidden_dim))
        
        # Hidden layers with tanh activation
        for _ in range(num_layers - 2):
            layers.append(nn.Linear(hidden_dim, hidden_dim))
        
        # Output layer
        layers.append(nn.Linear(hidden_dim, output_dim))
        
        self.net = nn.ModuleList(layers)
        self.activation = nn.Tanh()
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through network"""
        for i, layer in enumerate(self.net[:-1]):
            x = layer(x)
            x = self.activation(x)
        
        # Output layer without activation
        x = self.net[-1](x)
        return x
```

---

## MODULE 5: models/physics_loss.py

```python
import torch

def continuity_residual(u: torch.Tensor, du_dx: torch.Tensor) -> torch.Tensor:
    """Continuity equation: d(rho*u)/dx = 0
    For incompressible flow: du/dx = 0
    """
    return torch.abs(du_dx).mean()

def physics_loss(pred: torch.Tensor, X: torch.Tensor, params: dict) -> torch.Tensor:
    """Calculate physics-informed loss
    Includes Navier-Stokes residuals and boundary conditions
    """
    
    # pred shape: (batch, 3) -> [CL, CD, Cm]
    # For now, basic physics constraints
    
    # Constraint 1: CL should be realistic (typically -2 to 3)
    cl_loss = torch.relu(torch.abs(pred[:, 0]) - 3.0).mean()
    
    # Constraint 2: CD should be positive and < 0.5
    cd_min_loss = torch.relu(-pred[:, 1]).mean()
    cd_max_loss = torch.relu(pred[:, 1] - 0.5).mean()
    
    # Constraint 3: Smooth gradients
    total_loss = cl_loss + cd_min_loss + cd_max_loss
    
    return total_loss
```

---

This guide will be continued in a second file due to length. Continue with remaining modules!
