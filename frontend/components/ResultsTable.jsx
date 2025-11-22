'use client';

import React from 'react';

const ResultsTable = ({ results }) => {
  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No results to display. Run an analysis first.</p>
      </div>
    );
  }

  // Create metric cards for key results
  const metrics = [
    {
      label: 'Lift Coefficient',
      value: results.cl?.toFixed(4) || 'N/A',
      unit: '',
      icon: 'arrow-up'
    },
    {
      label: 'Drag Coefficient',
      value: results.cd?.toFixed(4) || 'N/A',
      unit: '',
      icon: 'arrow-down'
    },
    {
      label: 'Lift to Drag Ratio',
      value: (results.cl / results.cd)?.toFixed(2) || 'N/A',
      unit: '',
      icon: 'scale'
    },
    {
      label: 'Pressure Coefficient',
      value: results.cp?.toFixed(4) || 'N/A',
      unit: '',
      icon: 'gauge'
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
          >
            <p className="text-slate-600 text-sm font-medium">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metric.value}
              {metric.unit && <span className="text-lg text-slate-500 ml-1">{metric.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Parameter</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results).map(([key, value], index) => (
              <tr
                key={key}
                className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                <td className="px-6 py-3 text-sm text-slate-700 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </td>
                <td className="px-6 py-3 text-sm text-slate-900 text-right">
                  {typeof value === 'number' ? value.toFixed(6) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
