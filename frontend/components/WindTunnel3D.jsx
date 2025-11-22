'use client';

import React from 'react';

const WindTunnel3D = ({ wingParameters, results }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">3D Flow Visualization</h2>
      
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-12 min-h-96 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-32 h-32 mx-auto text-slate-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M14.828 14.828a4 4 0 01-5.656 0M17.657 17.657a8 8 0 01-11.314 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">3D Visualization Engine</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Powered by Three.js - renders aerodynamic flow field visualization
            </p>
            
            <div className="mt-6 space-y-2 text-sm">
              {wingParameters && (
                <div className="bg-white rounded p-3 inline-block">
                  <p className="text-slate-700">
                    <span className="font-semibold">Wing Span:</span> {wingParameters.wingSpan || 'N/A'} m
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Chord:</span> {wingParameters.chord || 'N/A'} m
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Angle of Attack:</span> {wingParameters.angleOfAttack || 'N/A'}°
                  </p>
                </div>
              )}
            </div>
            
            {results && Object.keys(results).length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium mb-2">Analysis Results Summary:</p>
                <div className="text-sm text-blue-800 space-y-1">
                  {results.cl && <p>Lift Coefficient: {results.cl.toFixed(4)}</p>}
                  {results.cd && <p>Drag Coefficient: {results.cd.toFixed(4)}</p>}
                  {results.cl && results.cd && <p>L/D Ratio: {(results.cl / results.cd).toFixed(2)}</p>}
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-8">
            Integration with Three.js and visualization backend in progress
          </p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded p-4">
          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Visualization Options</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Pressure Field</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Velocity Vectors</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Streamlines</span>
            </label>
          </div>
        </div>
        
        <div className="border border-slate-200 rounded p-4">
          <h4 className="font-semibold text-slate-700 mb-2 text-sm">Color Scheme</h4>
          <div className="space-y-2">
            <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm">
              <option>Pressure Coefficient</option>
              <option>Velocity Magnitude</option>
              <option>Mach Number</option>
              <option>Turbulence Intensity</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindTunnel3D;
