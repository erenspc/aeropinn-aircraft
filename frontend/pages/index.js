import React, { useState } from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout';
import { FileUpload } from '../components/FileUpload';
import { ParameterForm } from '../components/ParameterForm';
import { analyzeAerodynamics } from './api/analyze';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState({
    chord: 0.5,
    span: 2.0,
    velocity: 30,
    air_density: 1.225,
    temperature: 288.15,
    aoa: 5,
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv') {
        setUploadedFile(file);
        setError(null);
      } else {
        setError('Please upload a valid CSV file');
      }
    }
  };

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setParameters((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      Object.entries(parameters).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const data = await analyzeAerodynamics(formData);
      
      if (data.status === 'success') {
        setResults(data);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'aeropinn_results.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Head>
        <title>AeroPINN - Aerodynamic Analysis</title>
        <meta name="description" content="Physics-Informed Neural Networks for Aircraft Wing Analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">AeroPINN Aerodynamic Analysis</h1>
          <p className="text-lg text-gray-600 mb-8">Physics-Informed Neural Networks for Aircraft Wing Aerodynamic Analysis</p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FileUpload onFileSelect={handleFileUpload} />
              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                  File loaded: {uploadedFile.name}
                </div>
              )}
              
              <ParameterForm params={parameters} onChange={handleParameterChange} />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !uploadedFile}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Guide</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>1. Upload CSV file with aerodynamic data</li>
                <li>2. Configure wing parameters</li>
                <li>3. Click Run Analysis</li>
                <li>4. View results and download data</li>
              </ul>
              <hr className="my-4" />
              <h3 className="font-bold mb-2">CSV Format:</h3>
              <code className="text-xs bg-gray-100 p-2 rounded block text-gray-800">
                AoA_deg,CL,CD,Cm,Reynolds
              </code>
            </div>
          </div>

          {results && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Reynolds Number</p>
                  <p className="text-2xl font-bold text-blue-600">{results.Reynolds?.toFixed(0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Mach Number</p>
                  <p className="text-2xl font-bold text-green-600">{results.Mach?.toFixed(3)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Efficiency (L/D)</p>
                  <p className="text-2xl font-bold text-purple-600">{results.efficiency?.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Stall Angle</p>
                  <p className="text-2xl font-bold text-orange-600">{results.stall_angle?.toFixed(2)}°</p>
                </div>
              </div>
              
              <button
                onClick={downloadResults}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Download Results (JSON)
              </button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
