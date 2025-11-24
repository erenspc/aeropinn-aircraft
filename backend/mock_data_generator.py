import pandas as pd
import numpy as np
from pathlib import Path

def generate_mock_data(num_samples=1000, output_path='datasets/mock_data.csv'):
    """Generate realistic mock CFD data for PINN training.
    
    Columns: x, y, AoA, Re, Mach, u, v, p, CL, CD
    """
    np.random.seed(42)
    
    # Generate coordinate grid
    x_range = np.linspace(-1, 1, int(np.sqrt(num_samples)))
    y_range = np.linspace(-1, 1, int(np.sqrt(num_samples)))
    x_grid, y_grid = np.meshgrid(x_range, y_range)
    
    x = x_grid.flatten()[:num_samples]
    y = y_grid.flatten()[:num_samples]
    
    # Generate aerodynamic parameters
    aoa = np.random.uniform(-5, 15, num_samples)  # Angle of attack in degrees
    reynolds = np.random.uniform(1e5, 1e7, num_samples)  # Reynolds number
    mach = np.random.uniform(0.1, 0.8, num_samples)  # Mach number
    
    # Generate velocity field (realistic airflow)
    u = np.cos(np.deg2rad(aoa)) + 0.1 * np.sin(y * np.pi) + 0.05 * np.random.randn(num_samples)
    v = np.sin(np.deg2rad(aoa)) + 0.1 * np.sin(x * np.pi) + 0.05 * np.random.randn(num_samples)
    
    # Generate pressure field (based on velocity via Bernoulli)
    p = 1.0 - 0.5 * (u**2 + v**2) + 0.1 * np.random.randn(num_samples)
    
    # Generate aerodynamic coefficients
    cl = np.mean(p) * 2.0 + 0.1 * np.random.randn(num_samples)
    cd = 0.05 + 0.01 * mach + 0.001 * (reynolds / 1e6) + 0.01 * np.random.randn(num_samples)
    
    # Create DataFrame
    df = pd.DataFrame({
        'x': x,
        'y': y,
        'AoA': aoa,
        'Re': reynolds,
        'Mach': mach,
        'u': u,
        'v': v,
        'p': p,
        'CL': cl,
        'CD': cd
    })
    
    # Save to CSV
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f'Mock data saved to {output_path}')
    print(f'Shape: {df.shape}')
    print(f'\nSample data:\n{df.head()}')
    
    return df

if __name__ == '__main__':
    generate_mock_data(num_samples=5000)
