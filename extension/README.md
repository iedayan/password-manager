# Lok Chrome Extension

AI-powered password manager Chrome extension with automatic password updates.

## Features

- 🔐 Auto-detect and fill login forms
- 🎯 Generate secure passwords
- 💾 Save passwords automatically
- 🔄 Sync with Lok backend
- 🛡️ Zero-knowledge encryption

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The Lok extension icon should appear in your toolbar

## Usage

1. Click the Lok extension icon to login
2. Navigate to any login form
3. Click the 🔐 Lok button to autofill
4. Or use the extension popup to manage passwords

## Development

The extension connects to your local backend at `http://localhost:5000/api`.

Make sure your backend is running before using the extension.

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── popup/            # Extension popup UI
│   ├── content/          # Content script for web pages
│   ├── background/       # Background service worker
│   └── utils/            # Shared utilities
└── assets/               # Icons and images
```