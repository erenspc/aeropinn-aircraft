import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ParameterForm } from '../components/ParameterForm';
import Head from 'next/head';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleAnalyze = async (parameters) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('parameters', JSON.stringify(parameters));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Head>
        <title>AeroPINN Aircraft - Analysis</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">AeroPINN Aircraft</h1>
          <p className="text-blue-100 mb-8">Physics-Informed Neural Networks for Wing Aerodynamic Analysis</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload onFileUpload={handleFileUpload} />
            <ParameterForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
          </div>
          
          {results && (
            <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
