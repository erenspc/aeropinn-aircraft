'use client';

import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AeroPINN</h1>
                <p className="text-xs text-slate-500">Physics-Informed Neural Networks</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition">
                Analysis
              </a>
              <a href="/results" className="text-slate-600 hover:text-slate-900 font-medium transition">
                Results
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">AeroPINN</h3>
              <p className="text-sm">Advanced aerodynamic analysis using Physics-Informed Neural Networks</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Features</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Wing Analysis</a></li>
                <li><a href="#" className="hover:text-white transition">Flow Visualization</a></li>
                <li><a href="#" className="hover:text-white transition">Performance Metrics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Support</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
            <p>Copyright 2024 AeroPINN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
