'use client';

import React from 'react';
import Layout from '../components/Layout';
import ResultsTable from '../components/ResultsTable';
import WindTunnel3D from '../components/WindTunnel3D';
import Link from 'next/link';

export default function ResultsPage() {
  const [results, setResults] = React.useState({});
  const [wingParameters, setWingParameters] = React.useState({});

  React.useEffect(() => {
    // Get results from URL params or session storage
    const params = new URLSearchParams(window.location.search);
    const storedResults = sessionStorage.getItem('analysisResults');
    const storedParams = sessionStorage.getItem('wingParameters');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedParams) {
      setWingParameters(JSON.parse(storedParams));
    }
  }, []);

  const handleDownload = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aeropinn-results-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Analysis Results</h1>
                <p className="text-slate-600 mt-2">Comprehensive aerodynamic analysis output</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Download Results
                </button>
                <Link
                  href="/"
                  className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
                >
                  New Analysis
                </Link>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="space-y-8">
            {/* Results Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Aerodynamic Coefficients</h2>
              <ResultsTable results={results} />
            </div>

            {/* 3D Visualization */}
            <div>
              <WindTunnel3D wingParameters={wingParameters} results={results} />
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wing Parameters */}
              {Object.keys(wingParameters).length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Wing Parameters</h3>
                  <div className="space-y-3">
                    {Object.entries(wingParameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-600 font-medium">{key}:</span>
                        <span className="text-slate-900">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Analysis Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Analysis Date:</span>
                    <span className="text-slate-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Method:</span>
                    <span className="text-slate-900">Physics-Informed Neural Networks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Status:</span>
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
