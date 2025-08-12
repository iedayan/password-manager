import { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, EyeSlashIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [passwords, setPasswords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passwords', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPasswords(data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = async (id) => {
    const masterKey = prompt('Enter master key to view password:');
    if (!masterKey) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passwords/${id}/decrypt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ master_key: masterKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        setVisiblePasswords(prev => new Set([...prev, id]));
        // Store decrypted password temporarily
        setPasswords(prev => prev.map(p => 
          p.id === id ? { ...p, decrypted_password: data.password } : p
        ));
      } else {
        alert('Invalid master key');
      }
    } catch (error) {
      console.error('Failed to decrypt password:', error);
    }
  };

  const deletePassword = async (id) => {
    if (!confirm('Delete this password?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/passwords/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPasswords(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete password:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Password Manager</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add Password
        </button>
      </div>

      <div className="grid gap-4">
        {passwords.map((password) => (
          <div key={password.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{password.site_name}</h3>
                <p className="text-gray-600">{password.site_url}</p>
                <p className="text-sm text-gray-500">Username: {password.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Password:</span>
                  {visiblePasswords.has(password.id) ? (
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {password.decrypted_password}
                    </span>
                  ) : (
                    <span className="text-gray-400">••••••••</span>
                  )}
                  <button
                    onClick={() => togglePasswordVisibility(password.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {visiblePasswords.has(password.id) ? 
                      <EyeSlashIcon className="w-4 h-4" /> : 
                      <EyeIcon className="w-4 h-4" />
                    }
                  </button>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    password.strength_score >= 80 ? 'bg-green-100 text-green-800' :
                    password.strength_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Strength: {password.strength_score}/100
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-500 hover:text-blue-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deletePassword(password.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <AddPasswordForm 
          onClose={() => setShowAddForm(false)}
          onAdd={(newPassword) => {
            setPasswords(prev => [...prev, newPassword]);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
};

const AddPasswordForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passwords', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        onAdd(data);
      }
    } catch (error) {
      console.error('Failed to add password:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Site Name"
            value={formData.site_name}
            onChange={(e) => setFormData(prev => ({...prev, site_name: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="url"
            placeholder="Site URL"
            value={formData.site_url}
            onChange={(e) => setFormData(prev => ({...prev, site_url: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;