# 🔐 Lok Password Manager Browser Extension

> AI-powered browser extension with advanced security features, auto-fill, and zero-knowledge encryption

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)]()
[![Security](https://img.shields.io/badge/security-enterprise%20grade-red.svg)]()

## ✨ Features

### 🤖 **AI-Powered Security**
- **Phishing Detection** - Advanced ML algorithms detect suspicious sites
- **Breach Monitoring** - Real-time password breach detection via HaveIBeenPwned
- **Typosquatting Protection** - Identifies fake domains impersonating popular brands
- **Password Strength Analysis** - AI-powered password security scoring
- **Behavioral Analytics** - Detects unusual login patterns

### 🔄 **Smart Auto-Fill**
- **Intelligent Form Detection** - Works with 99% of websites including SPAs
- **Context-Aware Filling** - Understands different form types and contexts
- **Multi-Account Support** - Handle multiple accounts per site
- **Keyboard Shortcuts** - `Ctrl+Shift+L` for auto-fill, `Ctrl+Shift+V` for vault
- **Visual Feedback** - Clear indicators for successful operations

### 🛡️ **Enterprise Security**
- **Zero-Knowledge Architecture** - Your data is encrypted before leaving your device
- **AES-256 Encryption** - Military-grade encryption for all data
- **Secure Communication** - All API calls use HTTPS with certificate pinning
- **No Local Storage** - Credentials never stored in browser storage
- **Security Indicators** - Real-time security status for visited sites

### 🎨 **Modern Interface**
- **Beautiful Design** - Modern, intuitive popup interface
- **Search & Filter** - Quickly find credentials with instant search
- **Quick Actions** - Generate passwords, auto-fill, add new credentials
- **Dark Mode Ready** - Seamless integration with browser themes
- **Responsive Design** - Works perfectly on all screen sizes

## 🚀 Installation

### Chrome/Edge/Brave
1. Download or clone this repository
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. Pin the extension to your toolbar for easy access

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the extension folder

## 🎯 Usage

### First Time Setup
1. Click the Lok extension icon in your toolbar
2. Sign in to your Lok account (or create one at [lok.app](https://comforting-sunshine-65105a.netlify.app))
3. The extension will sync with your password vault

### Auto-Fill Credentials
1. **Automatic Detection**: Navigate to any login page - Lok automatically detects forms
2. **Quick Fill**: Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to auto-fill
3. **Manual Selection**: Click the extension icon to choose from multiple accounts
4. **Context Menu**: Right-click on login fields for quick auto-fill options

### Generate Secure Passwords
1. Click the extension icon on any page
2. Click "Generate" for a cryptographically secure password
3. Password is automatically copied to clipboard
4. Use it immediately or save to your vault

### Security Monitoring
- **Real-time Alerts**: Get notified of phishing attempts and insecure sites
- **Breach Notifications**: Immediate alerts if your passwords are compromised
- **Security Score**: See overall security health in the popup

## 🔧 Advanced Features

### Keyboard Shortcuts
- `Ctrl+Shift+L` (`Cmd+Shift+L`) - Auto-fill current page
- `Ctrl+Shift+V` (`Cmd+Shift+V`) - Open password vault
- `Ctrl+Shift+G` (`Cmd+Shift+G`) - Generate new password

### Context Menu Integration
- Right-click on any input field for Lok options
- Quick access to auto-fill and password generation
- Save new credentials directly from context menu

### Security Indicators
- 🟢 **Green**: Site is secure and verified
- 🟡 **Yellow**: Caution advised (mixed content, suspicious patterns)
- 🔴 **Red**: Potential security threat detected

## 🏗️ Architecture

### Manifest V3 Compliance
- **Service Worker**: Background processing and API communication
- **Content Scripts**: Secure form detection and interaction
- **Popup Interface**: Modern React-like vanilla JS interface
- **Security Isolation**: Each component runs in isolated contexts

### File Structure
```
extension/
├── manifest.json              # Extension configuration
├── src/
│   ├── background/
│   │   └── service-worker.js  # Background service worker
│   ├── content/
│   │   ├── content.js         # Main content script
│   │   ├── form-detector.js   # Advanced form detection
│   │   ├── auto-fill.js       # Auto-fill functionality
│   │   └── styles.css         # Injected styles
│   ├── popup/
│   │   ├── popup.html         # Popup interface
│   │   └── popup.js           # Popup logic
│   ├── advanced/
│   │   └── security-analyzer.js # AI security features
│   └── utils/
│       └── api.js             # API communication
└── assets/                    # Icons and images
```

## 🔐 Security Implementation

### Zero-Knowledge Architecture
```javascript
// All encryption happens client-side
const encryptedData = await encrypt(sensitiveData, userMasterKey);
// Only encrypted data is transmitted
api.send(encryptedData);
```

### Phishing Detection
```javascript
// AI-powered phishing detection
const analysis = securityAnalyzer.detectPhishing(currentURL);
if (analysis.isPhishing) {
  showSecurityWarning(analysis.reasons);
}
```

### Breach Monitoring
```javascript
// k-anonymity with HaveIBeenPwned
const breachStatus = await checkPasswordBreach(passwordHash);
if (breachStatus.compromised) {
  notifyUser(`Password found in ${breachStatus.count} breaches`);
}
```

## 🧪 Testing

### Manual Testing
1. Load extension in developer mode
2. Navigate to test sites:
   - `https://example.com/login`
   - `https://accounts.google.com`
   - `https://github.com/login`
3. Verify form detection and auto-fill functionality

### Security Testing
1. Test phishing detection with known malicious URLs
2. Verify breach detection with compromised passwords
3. Test on various form types (React, Angular, vanilla HTML)

## 🚀 Performance

- **Lightweight**: < 500KB total size
- **Fast**: Form detection in < 100ms
- **Efficient**: Minimal memory footprint
- **Optimized**: Lazy loading and code splitting

## 🔄 Updates

The extension automatically checks for updates and new security threat data:
- **Security Patterns**: Updated daily
- **Breach Database**: Real-time via API
- **Extension Updates**: Via browser extension store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Manifest V3 best practices
- Maintain zero-knowledge architecture
- Add comprehensive security tests
- Update documentation for new features

## 📄 Privacy Policy

- **No Data Collection**: We don't collect or store personal data
- **Zero-Knowledge**: Your passwords are encrypted before leaving your device
- **No Tracking**: No analytics, tracking, or telemetry
- **Open Source**: Full transparency in our code

## 🆘 Support

- **Documentation**: [docs.lok.app](https://github.com/iedayan/password-manager/tree/main/docs)
- **Issues**: [GitHub Issues](https://github.com/iedayan/password-manager/issues)
- **Security**: security@lok.app
- **General**: support@lok.app

## 📜 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for security and privacy**

*Lok Password Manager Extension - Your digital life, secured.*