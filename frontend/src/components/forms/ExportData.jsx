import { useState } from 'react';
import { DocumentArrowDownIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from "../../services/api";

const ExportData = () => {
  const [exportFormat, setExportFormat] = useState('json');
  const [includePasswords, setIncludePasswords] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exportFormats = [
    { id: 'json', name: 'JSON', description: 'Structured data format' },
    { id: 'csv', name: 'CSV', description: 'Spreadsheet compatible' },
    { id: '1password', name: '1Password', description: '1Password import format' },
    { id: 'lastpass', name: 'LastPass', description: 'LastPass import format' },
    { id: 'bitwarden', name: 'Bitwarden', description: 'Bitwarden import format' }
  ];

  const handleExport = async () => {
    if (includePasswords && !masterPassword) {
      setError('Master password is required to export passwords');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch passwords
      const response = await api.passwords.getAll();
      const passwords = response.data || [];

      let exportData;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case 'json':
          exportData = formatAsJSON(passwords, includePasswords);
          filename = 'lok-passwords.json';
          mimeType = 'application/json';
          break;
        case 'csv':
          exportData = formatAsCSV(passwords, includePasswords);
          filename = 'lok-passwords.csv';
          mimeType = 'text/csv';
          break;
        case '1password':
          exportData = formatAs1Password(passwords, includePasswords);
          filename = 'lok-passwords-1password.csv';
          mimeType = 'text/csv';
          break;
        case 'lastpass':
          exportData = formatAsLastPass(passwords, includePasswords);
          filename = 'lok-passwords-lastpass.csv';
          mimeType = 'text/csv';
          break;
        case 'bitwarden':
          exportData = formatAsBitwarden(passwords, includePasswords);
          filename = 'lok-passwords-bitwarden.json';
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Create and download file
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clear sensitive data
      setMasterPassword('');
    } catch (error) {
      setError('Failed to export data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAsJSON = (passwords, includePasswords) => {
    const data = passwords.map(password => ({
      site_name: password.site_name,
      site_url: password.site_url,
      username: password.username,
      password: includePasswords ? password.password : '[HIDDEN]',
      notes: password.notes || '',
      created_at: password.created_at,
      updated_at: password.updated_at
    }));

    return JSON.stringify({
      exported_at: new Date().toISOString(),
      source: 'Lok Password Manager',
      passwords: data
    }, null, 2);
  };

  const formatAsCSV = (passwords, includePasswords) => {
    const headers = ['Site Name', 'Site URL', 'Username', 'Password', 'Notes', 'Created', 'Updated'];
    const rows = passwords.map(password => [
      password.site_name,
      password.site_url,
      password.username,
      includePasswords ? password.password : '[HIDDEN]',
      password.notes || '',
      password.created_at,
      password.updated_at
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatAs1Password = (passwords, includePasswords) => {
    const headers = ['Title', 'Website', 'Username', 'Password', 'Notes'];
    const rows = passwords.map(password => [
      password.site_name,
      password.site_url,
      password.username,
      includePasswords ? password.password : '[HIDDEN]',
      password.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatAsLastPass = (passwords, includePasswords) => {
    const headers = ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'];
    const rows = passwords.map(password => [
      password.site_url,
      password.username,
      includePasswords ? password.password : '[HIDDEN]',
      password.notes || '',
      password.site_name,
      '',
      '0'
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const formatAsBitwarden = (passwords, includePasswords) => {
    const data = {
      encrypted: false,
      folders: [],
      items: passwords.map(password => ({
        id: password.id,
        organizationId: null,
        folderId: null,
        type: 1,
        name: password.site_name,
        notes: password.notes || '',
        favorite: false,
        login: {
          username: password.username,
          password: includePasswords ? password.password : '[HIDDEN]',
          uris: password.site_url ? [{ match: null, uri: password.site_url }] : []
        }
      }))
    };

    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <DocumentArrowDownIcon className="w-5 h-5 text-blue-400 mr-2" />
          Export Your Data
        </h3>

        {/* Format Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Export Format</label>
            <div className="grid md:grid-cols-2 gap-3">
              {exportFormats.map(format => (
                <label key={format.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={exportFormat === format.id}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-colors ${
                    exportFormat === format.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}>
                    <div className="font-medium text-white">{format.name}</div>
                    <div className="text-sm text-slate-400">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Include Passwords Option */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="includePasswords"
              checked={includePasswords}
              onChange={(e) => setIncludePasswords(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <div>
              <label htmlFor="includePasswords" className="text-sm font-medium text-white cursor-pointer">
                Include actual passwords in export
              </label>
              <p className="text-xs text-slate-400 mt-1">
                If unchecked, passwords will be replaced with [HIDDEN] for security
              </p>
            </div>
          </div>

          {/* Master Password Input */}
          {includePasswords && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Master Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter your master password"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">
                Required to decrypt and export your passwords
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={loading || (includePasswords && !masterPassword)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">Security Notice</h4>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• Exported files contain sensitive data - store them securely</li>
              <li>• Delete exported files after importing to your new password manager</li>
              <li>• Never share exported files or store them in unsecured locations</li>
              <li>• Consider using encrypted storage for exported files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;