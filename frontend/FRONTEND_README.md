# AeroPINN Aircraft - Frontend Implementation Guide

## Overview

This is a professional, fully-integrated Next.js frontend for the AeroPINN aircraft aerodynamic analysis system. The frontend features:

- **Modern UI**: Light theme, professional design with Tailwind CSS
- **File Upload**: CSV import with validation and preview
- **Parameter Configuration**: Intuitive form for aerodynamic parameters
- **Results Dashboard**: Multi-tab interface for comprehensive analysis
- **Performance Charts**: Interactive visualizations using Chart.js
- **3D Visualization**: Real-time wing flow visualization with React Three Fiber
- **API Integration**: Seamless FastAPI backend integration

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Backend running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Complete File Structure

```
frontend/
├── pages/
│   ├── _app.js              # Next.js App wrapper
│   ├── index.js             # Upload & Parameters page
│   └── results.js           # Results Dashboard
├── components/
│   ├── FileUpload.jsx       # CSV file upload with drag-drop
│   ├── ParameterForm.jsx    # Aerodynamic parameters form
│   ├── MetricCard.jsx       # KPI card component
│   ├── Tabs.jsx             # Tabbed interface
│   ├── PerformanceCharts.jsx# Chart.js visualizations
│   ├── ResultsTable.jsx     # Data table display
│   ├── WindTunnel3D.jsx     # React Three Fiber 3D scene
│   ├── LoadingSkeleton.jsx  # Loading state UI
│   └── Toasts.js            # Toast notifications
├── api/
│   └── analyze.js           # API wrapper for /visualize
├── styles/
│   └── globals.css          # Global Tailwind styles
├── public/                  # Static assets
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API=http://localhost:8000
```

For production:

```env
NEXT_PUBLIC_API=https://your-backend-domain.com
```

## Component Implementation Details

### 1. FileUpload Component

Handles CSV file upload with:
- Drag-and-drop support
- File validation (CSV only)
- CSV header validation (AoA, CL, CD)
- Preview of first 8 rows

### 2. ParameterForm Component

Input fields for:
- Chord length (meters)
- Span (meters)
- Velocity (m/s)
- Altitude (meters)
- Training epochs

### 3. Results Dashboard (Multi-Tab)

**Overview Tab**:
- 4 MetricCards displaying:
  - Maximum Lift Coefficient (CLmax)
  - Minimum Drag Coefficient (CDmin)
  - Aerodynamic Efficiency (CL/CD)
  - Stall Angle

**Performance Tab**:
- 3 Interactive Charts:
  - CL vs Angle of Attack (Line)
  - CD vs Angle of Attack (Line)
  - CL vs CD (Scatter/Polar)
- Hover tooltips and legend

**3D Visualization Tab**:
- Interactive 3D wing mesh
- Pressure coefficient color mapping
- Mouse orbit controls
- Real-time rendering

**Raw Data Tab**:
- Collapsible JSON viewer
- Download raw analysis data
- Copy-to-clipboard functionality

### 4. WindTunnel3D Component

React Three Fiber implementation:
- Loads geometry from backend JSON
- Maps pressure values to HSV color spectrum
- Vertex-based coloring for pressure visualization
- OrbitControls for interactive viewing
- Optimized rendering for 10,000+ vertices

## API Integration

### POST /visualize

**Request**:
```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('chord', 1.0);
formData.append('span', 2.0);
formData.append('velocity', 30.0);
formData.append('altitude', 0);
formData.append('epochs', 100);

const response = await axios.post(`${API}/visualize`, formData, {
  headers: {'Content-Type': 'multipart/form-data'},
  onUploadProgress: (progress) => {
    console.log(`Upload: ${Math.round(progress.loaded * 100 / progress.total)}%`);
  }
});
```

**Response**:
```json
{
  "analysis_id": "uuid-string",
  "cl_max": 1.2,
  "cd_min": 0.008,
  "stall_angle": 15.5,
  "efficiency": 150.0,
  "aoa_values": [0, 2, 4, ...],
  "cl_values": [0.1, 0.4, 0.8, ...],
  "cd_values": [0.01, 0.012, 0.018, ...],
  "pressure_distribution": {
    "chord_points": 100,
    "span_points": 20,
    "pressure_values": [...]
  },
  "geometry_url": "/static/initial_geom.json"
}
```

## Styling & Theming

Light theme color palette (in `globals.css`):

```css
:root {
  --bg: #f9fafb;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --primary: #1e3a8a;
  --primary-light: #3b82f6;
  --primary-dark: #1e40af;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #dc2626;
}
```

## Performance Optimization

1. **3D Visualization**:
   - Vertex limit: 10,000 (configurable)
   - LOD (Level of Detail) culling
   - Instanced rendering for multiple wings

2. **Charts**:
   - Lazy loading with React.lazy()
   - Cached datasets
   - Debounced resize handlers

3. **API Calls**:
   - SWR for automatic caching and revalidation
   - Request deduplication
   - Axios interceptors for error handling

## Error Handling

The frontend provides:
- **CSV Validation**: Headers, data format, type checking
- **API Error Messages**: User-friendly error toasts
- **Network Recovery**: Automatic retry with exponential backoff
- **Fallback UI**: Loading skeletons and error boundaries

## Testing

### Manual Test Scenarios

1. **Valid Upload**:
   ```bash
   npm run dev
   # Upload sample CSV → Verify parameters auto-fill → Click Analyze
   # Expected: Redirect to results with data
   ```

2. **Invalid CSV**:
   ```bash
   # Upload CSV without required columns
   # Expected: Toast error message
   ```

3. **Backend Offline**:
   ```bash
   # Kill backend process → Try to upload
   # Expected: Offline indicator + error toast
   ```

### Unit Tests (Optional)

```bash
npm run test
```

Using Jest + React Testing Library for component testing.

## Deployment

### Local Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t aeropinn-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API=http://backend:8000 aeropinn-frontend
```

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variable: `NEXT_PUBLIC_API`
4. Deploy with one click

## Troubleshooting

### "Cannot GET /" error
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Chart not rendering
```javascript
// In PerformanceCharts.jsx
import { Chart as ChartJS, ... } from 'chart.js';
ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend);
```

### 3D scene not showing
- Check console for Three.js errors
- Verify geometry JSON is valid
- Ensure WebGL is enabled in browser

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires WebGL 2.0 for 3D visualization

## Development Tips

1. **Hot Reload**: Changes to components auto-refresh
2. **API Mocking**: Use `mock-server` for offline development
3. **Debug 3D**: Use `THREE.GridHelper` and `THREE.AxesHelper`
4. **Performance**: Use Chrome DevTools Profiler for bottlenecks

## Known Limitations

- Maximum CSV file size: 50MB
- Maximum vertices in 3D mesh: 50,000
- Chart data points limited to 1,000 for performance
- CORS must be enabled on backend

## Future Enhancements

- [ ] Comparison analysis (multiple runs)
- [ ] Custom color schemes
- [ ] Export results as PDF report
- [ ] Real-time analysis progress updates
- [ ] Multi-wing comparison visualization
- [ ] AI-powered parameter suggestions

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review component JSDoc comments
3. Open GitHub issue with reproduction steps

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-23  
**Maintained by**: AeroPINN Team
