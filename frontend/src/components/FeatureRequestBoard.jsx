import { useState, useEffect } from 'react';
import { HandThumbUpIcon, PlusIcon, FireIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

const FeatureRequestBoard = () => {
  const [requests, setRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [filter, setFilter] = useState('popular');

  // Mock data
  useEffect(() => {
    setRequests([
      {
        id: 1,
        title: 'Dark Mode Theme',
        description: 'Add a dark mode option for better usability in low-light environments',
        votes: 47,
        status: 'planned',
        category: 'UI/UX',
        author: 'Beta User',
        createdAt: '2024-01-15',
        voted: false
      },
      {
        id: 2,
        title: 'Password Sharing',
        description: 'Ability to securely share passwords with team members or family',
        votes: 32,
        status: 'in-progress',
        category: 'Feature',
        author: 'Beta User',
        createdAt: '2024-01-14',
        voted: true
      },
      {
        id: 3,
        title: 'Biometric Authentication',
        description: 'Support for fingerprint and face recognition login',
        votes: 28,
        status: 'under-review',
        category: 'Security',
        author: 'Beta User',
        createdAt: '2024-01-13',
        voted: false
      },
      {
        id: 4,
        title: 'Bulk Password Import',
        description: 'Import passwords from CSV files and other password managers',
        votes: 19,
        status: 'planned',
        category: 'Feature',
        author: 'Beta User',
        createdAt: '2024-01-12',
        voted: false
      }
    ]);
  }, []);

  const handleVote = (id) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, votes: req.voted ? req.votes - 1 : req.votes + 1, voted: !req.voted }
        : req
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim()) return;

    const request = {
      id: Date.now(),
      ...newRequest,
      votes: 1,
      status: 'under-review',
      category: 'Feature',
      author: 'You',
      createdAt: new Date().toISOString().split('T')[0],
      voted: true
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({ title: '', description: '' });
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (filter === 'popular') return b.votes - a.votes;
    if (filter === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Feature Requests</h2>
          <p className="text-gray-600">Vote on features you'd like to see in the beta</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Request Feature
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('popular')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            filter === 'popular' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FireIcon className="w-4 h-4" />
          Most Popular
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'recent' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Most Recent
        </button>
      </div>

      {/* Feature Requests */}
      <div className="space-y-4">
        {sortedRequests.map((request) => (
          <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {request.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>by {request.author}</span>
                  <span>•</span>
                  <span>{request.createdAt}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleVote(request.id)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-all ${
                  request.voted 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {request.voted ? (
                  <HandThumbUpSolidIcon className="w-5 h-5" />
                ) : (
                  <HandThumbUpIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{request.votes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Feature Request Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Request a Feature</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feature Title</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Dark Mode Theme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the feature and why it would be useful..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureRequestBoard;