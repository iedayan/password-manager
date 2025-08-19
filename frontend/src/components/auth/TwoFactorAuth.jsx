import { useState, useEffect } from 'react';
import { QrCodeIcon, KeyIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from "../../services/api";

const TwoFactorAuth = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      // Mock API call - replace with actual API
      const enabled = localStorage.getItem('2fa_enabled') === 'true';
      setIs2FAEnabled(enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock 2FA setup - in real app, this would call backend
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQR = `otpauth://totp/Lok%20Password%20Manager:user@example.com?secret=${mockSecret}&issuer=Lok`;
      
      setSecret(mockSecret);
      setQrCode(mockQR);
      setShowSetup(true);
    } catch (error) {
      setError('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Mock verification - in real app, verify with backend
      if (verificationCode === '123456') { // Mock valid code
        const mockBackupCodes = [
          'A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6',
          'Q7R8S9T0', 'U1V2W3X4', 'Y5Z6A7B8', 'C9D0E1F2'
        ];
        
        setBackupCodes(mockBackupCodes);
        setIs2FAEnabled(true);
        localStorage.setItem('2fa_enabled', 'true');
        setShowSetup(false);
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) {
      return;
    }

    setLoading(true);
    try {
      // Mock disable - in real app, call backend
      setIs2FAEnabled(false);
      localStorage.setItem('2fa_enabled', 'false');
      setBackupCodes([]);
    } catch (error) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const generateNewBackupCodes = async () => {
    setLoading(true);
    try {
      // Mock new backup codes
      const newCodes = [
        'X1Y2Z3A4', 'B5C6D7E8', 'F9G0H1I2', 'J3K4L5M6',
        'N7O8P9Q0', 'R1S2T3U4', 'V5W6X7Y8', 'Z9A0B1C2'
      ];
      setBackupCodes(newCodes);
    } catch (error) {
      setError('Failed to generate new backup codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Status */}
      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
            <p className="text-slate-300 text-sm">
              {is2FAEnabled 
                ? 'Your account is protected with 2FA' 
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${is2FAEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-sm font-medium ${is2FAEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {is2FAEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {!is2FAEnabled ? (
            <button
              onClick={setup2FA}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          ) : (
            <>
              <button
                onClick={disable2FA}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
              <button
                onClick={generateNewBackupCodes}
                disabled={loading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
              >
                New Backup Codes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Setup Two-Factor Authentication</h3>
                <button
                  onClick={() => setShowSetup(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Step 1: QR Code */}
                <div>
                  <h4 className="text-white font-medium mb-3">1. Scan QR Code</h4>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <QrCodeIcon className="w-32 h-32 mx-auto text-gray-400" />
                    <p className="text-gray-600 text-sm mt-2">QR Code would appear here</p>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>

                {/* Step 2: Manual Entry */}
                <div>
                  <h4 className="text-white font-medium mb-3">2. Or Enter Manually</h4>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <code className="text-green-400 text-sm break-all">{secret}</code>
                  </div>
                </div>

                {/* Step 3: Verification */}
                <div>
                  <h4 className="text-white font-medium mb-3">3. Enter Verification Code</h4>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={verify2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes */}
      {is2FAEnabled && backupCodes.length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <KeyIcon className="w-5 h-5 text-yellow-400 mr-2" />
            Backup Codes
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, index) => (
              <div key={index} className="bg-slate-800 p-2 rounded text-center">
                <code className="text-green-400 text-sm">{code}</code>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = backupCodes.join('\n');
                navigator.clipboard.writeText(text);
              }}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-sm"
            >
              Copy Codes
            </button>
            <button
              onClick={() => {
                const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lok-backup-codes.txt';
                a.click();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;