'use client';

import fs from 'fs';
import path from 'path';

// API route handler for aerodynamic analysis
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, parameters } = req.body;

    if (!file || !parameters) {
      return res.status(400).json({ error: 'Missing file or parameters' });
    }

    // Prepare the data for backend API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parameters', JSON.stringify(parameters));

    // Call the backend API (Django/FastAPI)
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      results: data,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to complete analysis',
    });
  }
}
