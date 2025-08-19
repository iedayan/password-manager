# Frontend Architecture

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   ├── modals/          # Modal dialogs
│   ├── security/        # Security-related components
│   ├── ui/              # Generic UI components
│   └── index.js         # Barrel exports
├── contexts/            # React contexts
├── features/            # Feature-specific components
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API calls, utilities, business logic
├── types/               # Type definitions (documentation)
├── App.jsx              # Main app component
├── index.css            # Global styles
└── main.jsx             # App entry point
```

## Import Conventions

### Organized Imports
```javascript
// ✅ Good - Use barrel exports
import { Login, TwoFactorAuth } from './components/auth';
import { Dashboard, PasswordVault } from './components/dashboard';
import { api, auth } from './services';

// ❌ Avoid - Direct file imports
import Login from './components/auth/Login.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
```

### Component Categories

- **auth/**: Login, registration, 2FA components
- **dashboard/**: Main dashboard, vault, quick actions
- **forms/**: Import/export, settings forms
- **layout/**: Header, footer, hero sections
- **modals/**: All modal dialogs
- **security/**: Security dashboard, password health
- **ui/**: Reusable UI elements (buttons, spinners, etc.)

### Services

- **api.js**: API client and endpoints
- **auth.js**: Authentication utilities
- **utils.js**: General utilities
- **validation.js**: Form validation
- **passwordHealth.js**: Password analysis
- **advancedSecurity.js**: Security features

## Benefits

1. **Better Organization**: Components grouped by functionality
2. **Easier Imports**: Barrel exports reduce import complexity
3. **Scalability**: Clear structure for adding new features
4. **Maintainability**: Easier to find and modify components
5. **Team Collaboration**: Clear conventions for all developers