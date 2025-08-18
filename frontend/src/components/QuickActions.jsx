import { useNavigate } from 'react-router-dom';
import { PlusIcon, KeyIcon, ShieldCheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const QuickActions = ({ onAddPassword }) => {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Add Password',
      description: 'Save a new password',
      icon: PlusIcon,
      onClick: () => {
        try {
          onAddPassword?.();
        } catch (error) {
          console.error('Error in onAddPassword:', error);
        }
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Generate Password',
      description: 'Create strong password',
      icon: KeyIcon,
      onClick: () => navigate('/dashboard?tab=generator'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Security Check',
      description: 'Scan for weak passwords',
      icon: ShieldCheckIcon,
      onClick: () => navigate('/dashboard?tab=security'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      name: 'Settings',
      description: 'Account preferences',
      icon: Cog6ToothIcon,
      onClick: () => navigate('/settings'),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <button
          key={action.name}
          onClick={action.onClick}
          className={`${action.color} text-white p-4 rounded-xl transition-all hover:shadow-lg transform hover:scale-105 group`}
        >
          <action.icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium">{action.name}</div>
          <div className="text-xs opacity-90 mt-1">{action.description}</div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;