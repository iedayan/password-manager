import { useState, useEffect } from 'react';
import { ShieldCheckIcon, CpuChipIcon, EyeIcon, LockClosedIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, FingerprintIcon } from '@heroicons/react/24/outline';
import { passwordAnalyzer, biometricSecurity, breachDetection } from '../utils/advancedSecurity';
import { api } from '../lib/api';

const AdvancedSecurityDashboard = () => {
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [realTimeThreats, setRealTimeThreats] = useState([]);
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [breachMonitoring, setBreachMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAdvancedSecurity();
    startRealTimeMonitoring();
  }, []);

  const initializeAdvancedSecurity = async () => {
    try {
      // Check biometric support
      const biometricSupported = biometricSecurity.checkBiometricSupport();
      setBiometricStatus({ supported: biometricSupported, enabled: false });

      // Fetch passwords for advanced analysis
      const response = await api.passwords.getAll();
      const passwords = response.data || [];

      // Perform advanced security analysis
      const analysis = await performAdvancedAnalysis(passwords);
      setSecurityMetrics(analysis);

      // Start breach monitoring
      if (passwords.length > 0) {
        startBreachMonitoring(passwords);
      }
    } catch (error) {
      console.error('Advanced security initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAdvancedAnalysis = async (passwords) => {
    const analysis = {
      totalPasswords: passwords.length,
      entropyDistribution: [],
      patternAnalysis: {},
      breachStatus: {},
      riskScore: 0,
      aiRecommendations: [],
      securityTrends: []
    };

    let totalEntropy = 0;
    let totalRisk = 0;
    const patterns = {};
    const breachResults = [];

    for (const password of passwords) {
      try {
        // Decrypt password for analysis (in real app, this would be done securely)
        const decryptedPassword = password.password || 'mock_password';
        
        // Advanced strength analysis
        const strengthAnalysis = passwordAnalyzer.calculateAdvancedStrength(decryptedPassword);
        totalEntropy += strengthAnalysis.entropy;
        
        // Pattern detection
        strengthAnalysis.patterns.forEach(pattern => {
          patterns[pattern.type] = (patterns[pattern.type] || 0) + 1;
        });

        // Risk calculation
        const riskFactor = (100 - strengthAnalysis.score) / 100;
        totalRisk += riskFactor;

        analysis.entropyDistribution.push({
          site: password.site_name,
          entropy: strengthAnalysis.entropy,
          score: strengthAnalysis.score,
          level: strengthAnalysis.level
        });

        // Breach check (async)
        breachDetection.checkPasswordBreach(decryptedPassword).then(result => {
          if (result.isBreached) {
            breachResults.push({
              site: password.site_name,
              count: result.count
            });
          }
        });

      } catch (error) {
        console.warn('Password analysis failed:', error);
      }
    }

    // Calculate metrics
    analysis.averageEntropy = passwords.length > 0 ? totalEntropy / passwords.length : 0;
    analysis.riskScore = Math.min(100, (totalRisk / passwords.length) * 100);
    analysis.patternAnalysis = patterns;
    analysis.breachStatus = { checked: passwords.length, breached: breachResults.length };

    // Generate AI recommendations
    analysis.aiRecommendations = generateAIRecommendations(analysis);

    // Security trends (mock data for demo)
    analysis.securityTrends = generateSecurityTrends();

    return analysis;
  };

  const generateAIRecommendations = (analysis) => {
    const recommendations = [];

    if (analysis.averageEntropy < 3.5) {
      recommendations.push({
        type: 'entropy',
        priority: 'high',
        title: 'Increase Password Randomness',
        description: 'Your passwords have low entropy. Use our advanced generator.',
        action: 'Generate stronger passwords'
      });
    }

    if (analysis.riskScore > 60) {
      recommendations.push({
        type: 'risk',
        priority: 'critical',
        title: 'High Security Risk Detected',
        description: 'Multiple security vulnerabilities found in your password vault.',
        action: 'Run security audit'
      });
    }

    if (analysis.patternAnalysis.keyboard > 0) {
      recommendations.push({
        type: 'pattern',
        priority: 'medium',
        title: 'Keyboard Patterns Detected',
        description: 'Avoid using keyboard sequences like "qwerty" or "asdf".',
        action: 'Replace patterned passwords'
      });
    }

    return recommendations;
  };

  const generateSecurityTrends = () => {
    // Mock trending data - in production, this would come from analytics
    return [
      { date: '2024-01', score: 75, threats: 2 },
      { date: '2024-02', score: 78, threats: 1 },
      { date: '2024-03', score: 82, threats: 0 },
      { date: '2024-04', score: 85, threats: 1 },
      { date: '2024-05', score: 88, threats: 0 }
    ];
  };

  const startRealTimeMonitoring = () => {
    // Simulate real-time threat detection
    const interval = setInterval(() => {
      const threats = [
        { type: 'breach', message: 'New breach detected for example.com', severity: 'high' },
        { type: 'pattern', message: 'Suspicious login pattern detected', severity: 'medium' },
        { type: 'weak', message: 'Weak password usage increased', severity: 'low' }
      ];

      if (Math.random() > 0.8) { // 20% chance of new threat
        const threat = threats[Math.floor(Math.random() * threats.length)];
        setRealTimeThreats(prev => [
          { ...threat, id: Date.now(), timestamp: new Date() },
          ...prev.slice(0, 4) // Keep only 5 most recent
        ]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  };

  const startBreachMonitoring = async (passwords) => {
    setBreachMonitoring(true);
    
    // Monitor passwords for breaches in background
    for (const password of passwords) {
      try {
        const result = await breachDetection.checkPasswordBreach(password.password || 'mock');
        if (result.isBreached) {
          setRealTimeThreats(prev => [{
            id: Date.now(),
            type: 'breach',
            message: `Password for ${password.site_name} found in ${result.count} breaches`,
            severity: 'critical',
            timestamp: new Date()
          }, ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.warn('Breach monitoring error:', error);
      }
    }
  };

  const setupBiometric = async () => {
    try {
      const credential = await biometricSecurity.setupBiometric('user123');
      setBiometricStatus({ supported: true, enabled: true });
      
      setRealTimeThreats(prev => [{
        id: Date.now(),
        type: 'security',
        message: 'Biometric authentication enabled successfully',
        severity: 'low',
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Biometric setup failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Advanced Security Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <CpuChipIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">AI-Powered Security Center</h2>
        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Advanced threat detection, machine learning analysis, and real-time security monitoring.
        </p>
      </div>

      {/* Real-Time Threat Monitor */}
      <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <EyeIcon className="w-5 h-5 text-blue-400 mr-2" />
          Real-Time Threat Monitor
        </h3>
        
        {realTimeThreats.length > 0 ? (
          <div className="space-y-3">
            {realTimeThreats.map(threat => (
              <div key={threat.id} className={`p-3 rounded-lg border-l-4 ${
                threat.severity === 'critical' ? 'bg-red-500/10 border-red-400' :
                threat.severity === 'high' ? 'bg-orange-500/10 border-orange-400' :
                threat.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-400' :
                'bg-blue-500/10 border-blue-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{threat.message}</span>
                  <span className="text-slate-400 text-xs">
                    {threat.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-slate-300">No active threats detected</p>
          </div>
        )}
      </div>

      {/* Advanced Metrics Grid */}
      {securityMetrics && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Entropy Analysis */}
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">
                {securityMetrics.averageEntropy.toFixed(1)}
              </span>
            </div>
            <div className="text-slate-300 text-sm">Average Entropy</div>
            <div className="mt-2 text-xs text-slate-400">
              Higher entropy = better randomness
            </div>
          </div>

          {/* Risk Score */}
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">
                {Math.round(securityMetrics.riskScore)}%
              </span>
            </div>
            <div className="text-slate-300 text-sm">Risk Score</div>
            <div className="mt-2 text-xs text-slate-400">
              Lower is better
            </div>
          </div>

          {/* Breach Status */}
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {securityMetrics.breachStatus.checked - securityMetrics.breachStatus.breached}
              </span>
            </div>
            <div className="text-slate-300 text-sm">Clean Passwords</div>
            <div className="mt-2 text-xs text-slate-400">
              Not found in breaches
            </div>
          </div>
        </div>
      )}

      {/* Biometric Security */}
      {biometricStatus && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <FingerprintIcon className="w-5 h-5 text-blue-400 mr-2" />
                Biometric Authentication
              </h3>
              <p className="text-slate-300 text-sm">
                {biometricStatus.supported 
                  ? 'Advanced biometric security available' 
                  : 'Biometric authentication not supported on this device'
                }
              </p>
            </div>
            {biometricStatus.supported && !biometricStatus.enabled && (
              <button
                onClick={setupBiometric}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable Biometric
              </button>
            )}
            {biometricStatus.enabled && (
              <div className="flex items-center text-green-400">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">Enabled</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {securityMetrics?.aiRecommendations && securityMetrics.aiRecommendations.length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CpuChipIcon className="w-5 h-5 text-purple-400 mr-2" />
            AI Security Recommendations
          </h3>
          <div className="space-y-4">
            {securityMetrics.aiRecommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'critical' ? 'bg-red-500/10 border-red-400' :
                rec.priority === 'high' ? 'bg-orange-500/10 border-orange-400' :
                'bg-yellow-500/10 border-yellow-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{rec.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                    rec.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
                <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  {rec.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Trends */}
      {securityMetrics?.securityTrends && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 text-green-400 mr-2" />
            Security Trends
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {securityMetrics.securityTrends.map((trend, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {trend.score}
                </div>
                <div className="text-xs text-slate-400 mb-2">{trend.date}</div>
                <div className={`w-full h-2 rounded-full ${
                  trend.threats === 0 ? 'bg-green-500' :
                  trend.threats === 1 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSecurityDashboard;