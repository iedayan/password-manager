import { useState, useEffect } from 'react';
import { ShieldExclamationIcon, ExclamationTriangleIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';
import { analyzePasswordHealth } from '../utils/passwordHealth';
import { api } from '../lib/api';

const PasswordHealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchPasswordHealth();
  }, []);

  const fetchPasswordHealth = async () => {
    try {
      const response = await api.passwords.getAll();
      const passwords = response.data || [];
      const analysis = analyzePasswordHealth(passwords);
      setHealthData(analysis);
    } catch (error) {
      console.error('Failed to fetch password health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Unable to load password health data</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  const categories = [
    { id: 'all', name: 'All Issues', count: healthData.weakPasswords.length + healthData.reusedPasswords.length + healthData.oldPasswords.length + healthData.compromisedPasswords.length },
    { id: 'weak', name: 'Weak', count: healthData.weakPasswords.length },
    { id: 'reused', name: 'Reused', count: healthData.reusedPasswords.length },
    { id: 'old', name: 'Old', count: healthData.oldPasswords.length },
    { id: 'compromised', name: 'Compromised', count: healthData.compromisedPasswords.length }
  ];

  const getIssuesByCategory = () => {
    switch (selectedCategory) {
      case 'weak': return healthData.weakPasswords;
      case 'reused': return healthData.reusedPasswords;
      case 'old': return healthData.oldPasswords;
      case 'compromised': return healthData.compromisedPasswords;
      default: return [
        ...healthData.weakPasswords,
        ...healthData.reusedPasswords,
        ...healthData.oldPasswords,
        ...healthData.compromisedPasswords
      ];
    }
  };

  return (
    <div className="space-y-8">
      {/* Health Score Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border ${getScoreBg(healthData.overallScore)}`}>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(healthData.overallScore)}`}>
              {Math.round(healthData.overallScore)}
            </div>
            <div className="text-slate-300 text-sm">Security Score</div>
          </div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ShieldExclamationIcon className="w-6 h-6 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{healthData.weakPasswords.length}</span>
          </div>
          <div className="text-slate-300 text-sm">Weak Passwords</div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <KeyIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{healthData.reusedPasswords.length}</span>
          </div>
          <div className="text-slate-300 text-sm">Reused Passwords</div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-6 h-6 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">{healthData.oldPasswords.length}</span>
          </div>
          <div className="text-slate-300 text-sm">Old Passwords</div>
        </div>
      </div>

      {/* Recommendations */}
      {healthData.recommendations.length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {healthData.recommendations.map((rec, index) => (
              <li key={index} className="text-slate-300 flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {getIssuesByCategory().map((issue, index) => (
          <div key={index} className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{issue.site_name}</h4>
                <p className="text-slate-400 text-sm">{issue.username}</p>
                <p className="text-red-400 text-sm mt-1">{issue.issue}</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Fix
              </button>
            </div>
          </div>
        ))}
        {getIssuesByCategory().length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No issues found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordHealthCheck;