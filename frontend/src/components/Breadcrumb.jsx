import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap = {
    '/': 'Home',
    '/login': 'Sign In',
    '/signup': 'Sign Up',
    '/dashboard': 'Dashboard',
    '/vault': 'Password Vault',
    '/app': 'Dashboard'
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  const breadcrumbs = [
    { name: 'Home', path: '/', icon: HomeIcon },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      return {
        name: pathMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path,
        current: index === pathSegments.length - 1
      };
    })
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />}
          <button
            onClick={() => navigate(breadcrumb.path)}
            className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
              breadcrumb.current ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}
          >
            {index === 0 && breadcrumb.icon && (
              <breadcrumb.icon className="w-4 h-4" />
            )}
            {breadcrumb.name}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;