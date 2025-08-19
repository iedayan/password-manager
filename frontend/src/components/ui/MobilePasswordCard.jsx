import { useState } from 'react';
import { EyeIcon, ClipboardIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StrengthIndicator, FavoriteButton } from '../dashboard/VisualEnhancements';

const MobilePasswordCard = ({ 
  password, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onCopy,
  onView 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleSwipeLeft = () => {
    setShowActions(true);
  };

  const handleSwipeRight = () => {
    setShowActions(false);
  };

  return (
    <div className="relative bg-slate-700/60 border border-slate-600/40 rounded-xl overflow-hidden">
      {/* Main Card Content */}
      <div 
        className={`p-4 transition-transform duration-200 ${showActions ? '-translate-x-20' : ''}`}
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          
          const handleTouchMove = (e) => {
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (diff > 50) {
              handleSwipeLeft();
            } else if (diff < -50) {
              handleSwipeRight();
            }
          };
          
          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('touchend', handleTouchEnd);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center border border-slate-500/30">
            <span className="text-slate-200 font-bold text-lg">
              {password.site_name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white truncate text-lg">
                {password.site_name}
              </h3>
              <FavoriteButton 
                isFavorite={password.is_favorite}
                onToggle={() => onToggleFavorite(password.id)}
                size="small"
              />
            </div>
            
            <p className="text-slate-300 text-sm truncate mb-2">
              {password.username}
            </p>
            
            <StrengthIndicator 
              score={password.strength_score} 
              showLabel={false} 
              size="small" 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onCopy(password.username)}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardIcon className="w-4 h-4" />
            Copy User
          </button>
          
          <button
            onClick={() => onView(password)}
            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
        </div>
      </div>

      {/* Swipe Actions */}
      {showActions && (
        <div className="absolute right-0 top-0 h-full flex">
          <button
            onClick={() => onEdit(password)}
            className="w-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onDelete(password)}
            className="w-16 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MobilePasswordCard;