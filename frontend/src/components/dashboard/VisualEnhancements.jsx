import { useState, useEffect } from 'react';
import { StarIcon, ClockIcon, ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Category Icons Mapping
const categoryIcons = {
  Banking: '🏦',
  Social: '👥', 
  Work: '💼',
  Personal: '👤',
  Shopping: '🛒',
  Entertainment: '🎬',
  Email: '📧',
  Gaming: '🎮',
  Travel: '✈️',
  Health: '🏥',
  Education: '🎓',
  Default: '🔐'
};

// Category Colors
const categoryColors = {
  Banking: 'from-green-500 to-emerald-500',
  Social: 'from-blue-500 to-cyan-500',
  Work: 'from-purple-500 to-indigo-500',
  Personal: 'from-gray-500 to-slate-500',
  Shopping: 'from-orange-500 to-amber-500',
  Entertainment: 'from-pink-500 to-rose-500',
  Email: 'from-red-500 to-pink-500',
  Gaming: 'from-violet-500 to-purple-500',
  Travel: 'from-sky-500 to-blue-500',
  Health: 'from-teal-500 to-cyan-500',
  Education: 'from-indigo-500 to-blue-500',
  Default: 'from-slate-500 to-gray-500'
};

export const CategoryIcon = ({ category, size = 'w-8 h-8' }) => {
  const icon = categoryIcons[category] || categoryIcons.Default;
  const colorClass = categoryColors[category] || categoryColors.Default;
  
  return (
    <div className={`${size} bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center text-white font-semibold shadow-lg`}>
      <span className="text-lg">{icon}</span>
    </div>
  );
};

export const StrengthIndicator = ({ score, showLabel = true, size = 'normal' }) => {
  const getStrengthConfig = (score) => {
    if (score >= 90) return { color: 'emerald', label: 'Excellent', icon: CheckCircleIcon };
    if (score >= 80) return { color: 'green', label: 'Strong', icon: CheckCircleIcon };
    if (score >= 60) return { color: 'yellow', label: 'Medium', icon: ExclamationTriangleIcon };
    if (score >= 40) return { color: 'orange', label: 'Weak', icon: ExclamationTriangleIcon };
    return { color: 'red', label: 'Critical', icon: ExclamationTriangleIcon };
  };

  const config = getStrengthConfig(score || 0);
  const Icon = config.icon;
  
  const sizeClasses = {
    small: { bar: 'h-1', width: 'w-12', text: 'text-xs', icon: 'w-3 h-3' },
    normal: { bar: 'h-2', width: 'w-16', text: 'text-sm', icon: 'w-4 h-4' },
    large: { bar: 'h-3', width: 'w-20', text: 'text-base', icon: 'w-5 h-5' }
  };
  
  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`${classes.width} ${classes.bar} bg-slate-600 rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-400 transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(5, score || 0)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center gap-1">
          <Icon className={`${classes.icon} text-${config.color}-400`} />
          <span className={`${classes.text} text-${config.color}-300 font-medium`}>
            {config.label}
          </span>
        </div>
      )}
    </div>
  );
};

export const RecentlyAccessedSection = ({ passwords, onPasswordClick }) => {
  const [recentPasswords, setRecentPasswords] = useState([]);

  const trackPasswordAccess = (passwordId) => {
    const recent = JSON.parse(localStorage.getItem('recentPasswords') || '[]');
    const updated = [passwordId, ...recent.filter(id => id !== passwordId)].slice(0, 10);
    localStorage.setItem('recentPasswords', JSON.stringify(updated));
  };

  const clearRecentActivity = () => {
    localStorage.removeItem('recentPasswords');
    setRecentPasswords([]);
  };

  useEffect(() => {
    // Clear any existing mock data and start fresh
    const recent = JSON.parse(localStorage.getItem('recentPasswords') || '[]');
    
    // Only show passwords that actually exist and were genuinely accessed
    const recentPasswordsData = passwords
      .filter(p => recent.includes(p.id))
      .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id))
      .slice(0, 5);
    
    setRecentPasswords(recentPasswordsData);
  }, [passwords]);

  if (recentPasswords.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Recently Accessed</h3>
        </div>
        <button
          onClick={clearRecentActivity}
          className="text-xs text-slate-400 hover:text-slate-300 underline"
        >
          Clear
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentPasswords.map((password) => (
          <button
            key={password.id}
            onClick={() => {
              trackPasswordAccess(password.id);
              onPasswordClick(password);
            }}
            className="flex-shrink-0 p-3 bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/40 rounded-xl transition-all hover:scale-105 min-w-[200px]"
          >
            <div className="flex items-center gap-3">
              <CategoryIcon category={password.category} size="w-10 h-10" />
              <div className="text-left">
                <div className="font-medium text-white text-sm">{password.site_name}</div>
                <div className="text-xs text-slate-400">{password.username}</div>
                <StrengthIndicator score={password.strength_score} showLabel={false} size="small" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const PasswordHealthBadges = ({ password, allPasswords = [] }) => {
  const badges = [];
  
  // Strength badge
  const score = password.strength_score || 0;
  if (score >= 80) {
    badges.push({ type: 'strong', label: 'Strong', color: 'green' });
  } else if (score < 60) {
    badges.push({ type: 'weak', label: 'Weak', color: 'red' });
  }
  
  // Age badge
  const daysOld = password.created_at ? 
    Math.floor((new Date() - new Date(password.created_at)) / (1000 * 60 * 60 * 24)) : 0;
  
  if (daysOld > 365) {
    badges.push({ type: 'old', label: 'Old', color: 'orange' });
  } else if (daysOld < 7) {
    badges.push({ type: 'new', label: 'New', color: 'blue' });
  }
  
  // Duplicate detection using real password data
  const isDuplicate = allPasswords.filter(p => 
    p.id !== password.id && p.password === password.password
  ).length > 0;
  
  if (isDuplicate) {
    badges.push({ type: 'duplicate', label: 'Duplicate', color: 'yellow' });
  }
  
  // Compromised badge
  if (password.is_compromised) {
    badges.push({ type: 'compromised', label: 'Compromised', color: 'red' });
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {badges.map((badge, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-${badge.color}-900/60 text-${badge.color}-300 border border-${badge.color}-600/60`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export const FavoriteButton = ({ isFavorite, onToggle, size = 'normal' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    normal: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-1 hover:bg-slate-600/60 rounded transition-colors group"
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <StarIconSolid className={`${sizeClasses[size]} text-yellow-400 group-hover:text-yellow-300`} />
      ) : (
        <StarIcon className={`${sizeClasses[size]} text-slate-400 group-hover:text-yellow-400`} />
      )}
    </button>
  );
};

export const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export const LoadingSkeletons = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-slate-700/40 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-600/60 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-600/60 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-slate-600/60 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  CategoryIcon,
  StrengthIndicator,
  RecentlyAccessedSection,
  PasswordHealthBadges,
  FavoriteButton,
  AnimatedCounter,
  LoadingSkeletons
};