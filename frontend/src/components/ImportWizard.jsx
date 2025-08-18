import { useState } from 'react';
import { CloudArrowUpIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';

const ImportWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedManager, setSelectedManager] = useState('');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');

  const passwordManagers = [
    { id: '1password', name: '1Password', icon: '🔐', format: 'csv' },
    { id: 'lastpass', name: 'LastPass', icon: '🔒', format: 'csv' },
    { id: 'chrome', name: 'Google Chrome', icon: '🌐', format: 'csv' },
    { id: 'firefox', name: 'Mozilla Firefox', icon: '🦊', format: 'csv' },
    { id: 'bitwarden', name: 'Bitwarden', icon: '🛡️', format: 'json' },
    { id: 'dashlane', name: 'Dashlane', icon: '🔑', format: 'csv' },
    { id: 'csv', name: 'Generic CSV', icon: '📄', format: 'csv' },
    { id: 'json', name: 'Generic JSON', icon: '📋', format: 'json' }
  ];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file || !selectedManager) {
      setError('Please select a file and password manager');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', selectedManager);

      const response = await fetch('/api/v1/passwords/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      setImportResult(result);
      setStep(4);
    } catch (error) {
      setError(error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleComplete = () => {
    onComplete?.(importResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Import Your Passwords</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {step > stepNum ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Password Manager */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Which password manager are you using?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {passwordManagers.map((manager) => (
                  <button
                    key={manager.id}
                    onClick={() => {
                      setSelectedManager(manager.id);
                      setStep(2);
                    }}
                    className="p-4 border-2 border-slate-600 rounded-xl hover:border-blue-500 hover:bg-slate-700/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{manager.icon}</span>
                      <div>
                        <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {manager.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {manager.format.toUpperCase()} format
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Export Instructions */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Export from {passwordManagers.find(m => m.id === selectedManager)?.name}
              </h3>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <h4 className="text-white font-medium mb-3">Export Instructions:</h4>
                <ExportInstructions manager={selectedManager} />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I've Exported My Passwords
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload File */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Upload Your Password File
              </h3>
              
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center mb-6">
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <CloudArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <div className="text-white font-medium mb-2">
                    {file ? file.name : 'Choose file to upload'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Supports CSV, JSON files up to 10MB
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-200">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                      Import Passwords
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Import Results */}
          {step === 4 && importResult && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Import Complete!
              </h3>
              
              <div className="bg-green-900/50 border border-green-600 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-green-200 font-medium">
                    Successfully imported {importResult.imported_count} passwords
                  </span>
                </div>
              </div>

              {importResult.statistics && (
                <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Import Summary:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Total Processed:</span>
                      <span className="text-white ml-2">{importResult.total_processed}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Successfully Imported:</span>
                      <span className="text-white ml-2">{importResult.imported_count}</span>
                    </div>
                    {importResult.statistics.weak_passwords > 0 && (
                      <div>
                        <span className="text-slate-400">Weak Passwords:</span>
                        <span className="text-yellow-400 ml-2">{importResult.statistics.weak_passwords}</span>
                      </div>
                    )}
                    {importResult.statistics.duplicate_passwords > 0 && (
                      <div>
                        <span className="text-slate-400">Duplicates:</span>
                        <span className="text-orange-400 ml-2">{importResult.statistics.duplicate_passwords}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExportInstructions = ({ manager }) => {
  const instructions = {
    '1password': [
      'Open 1Password and go to File > Export',
      'Choose "All Items" and select CSV format',
      'Save the file to a secure location'
    ],
    'lastpass': [
      'Log in to LastPass web vault',
      'Go to Advanced Options > Export',
      'Choose "LastPass CSV File"'
    ],
    'chrome': [
      'Open Chrome Settings > Passwords',
      'Click three dots menu > "Export passwords"',
      'Save the CSV file securely'
    ],
    'firefox': [
      'Open Firefox and go to about:logins',
      'Click three dots menu > "Export Logins"',
      'Save the CSV file'
    ],
    'bitwarden': [
      'Log in to Bitwarden web vault',
      'Go to Tools > Export Vault',
      'Choose JSON format'
    ],
    'dashlane': [
      'Open Dashlane and go to File > Export',
      'Choose CSV format',
      'Save the exported file'
    ]
  };

  const defaultInstructions = [
    'Look for export or backup options in your password manager',
    'Choose CSV or JSON format if available',
    'Save the file to a secure location'
  ];

  const steps = instructions[manager] || defaultInstructions;

  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start">
          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-slate-300">{step}</span>
        </li>
      ))}
    </ol>
  );
};

export default ImportWizard;