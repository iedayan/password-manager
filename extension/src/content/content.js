class LokContentScript {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.detectLoginForms();
    this.observeFormChanges();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'fillPassword':
          this.fillPassword(message.username, message.passwordId, message.token);
          break;
        case 'fillGeneratedPassword':
          this.fillGeneratedPassword(message.password);
          break;
      }
    });
  }

  detectLoginForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const passwordField = form.querySelector('input[type="password"]');
      const emailField = form.querySelector('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="username"]');
      
      if (passwordField && emailField) {
        this.addLokButton(form, passwordField);
        this.setupFormSubmitListener(form);
      }
    });
  }

  addLokButton(form, passwordField) {
    // Check if button already exists
    if (form.querySelector('.lok-autofill-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lok-autofill-btn';
    button.innerHTML = '🔐 Lok';
    button.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Position relative to password field
    passwordField.style.position = 'relative';
    passwordField.style.paddingRight = '60px';
    
    const container = passwordField.parentElement;
    container.style.position = 'relative';
    container.appendChild(button);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
  }

  setupFormSubmitListener(form) {
    form.addEventListener('submit', (e) => {
      this.handleFormSubmit(form);
    });
  }

  async handleFormSubmit(form) {
    const passwordField = form.querySelector('input[type="password"]');
    const emailField = form.querySelector('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="username"]');
    
    if (!passwordField || !emailField) return;

    const password = passwordField.value;
    const username = emailField.value;
    
    if (!password || !username) return;

    // Check if user is logged in
    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    // Ask user if they want to save this password
    setTimeout(() => {
      this.showSavePasswordPrompt(username, password, window.location.hostname);
    }, 1000);
  }

  showSavePasswordPrompt(username, password, siteName) {
    // Create save prompt overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 300px;
      border: 1px solid #e0e0e0;
    `;

    overlay.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; margin-right: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">L</div>
        <strong>Save Password?</strong>
      </div>
      <div style="margin-bottom: 16px; color: #666; font-size: 14px;">
        Save password for <strong>${siteName}</strong>?
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="lokSaveBtn" style="flex: 1; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Save</button>
        <button id="lokCancelBtn" style="flex: 1; padding: 8px 16px; background: #f0f0f0; color: #666; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Handle save
    overlay.querySelector('#lokSaveBtn').addEventListener('click', async () => {
      await this.savePassword(username, password, siteName);
      overlay.remove();
    });

    // Handle cancel
    overlay.querySelector('#lokCancelBtn').addEventListener('click', () => {
      overlay.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
      }
    }, 10000);
  }

  async savePassword(username, password, siteName) {
    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    try {
      const response = await fetch(`${this.apiUrl}/passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        },
        body: JSON.stringify({
          site_name: siteName,
          site_url: window.location.href,
          username: username,
          password: password
        })
      });

      if (response.ok) {
        this.showNotification('Password saved successfully!', 'success');
      } else {
        this.showNotification('Failed to save password', 'error');
      }
    } catch (error) {
      this.showNotification('Connection error', 'error');
    }
  }

  async fillPassword(username, passwordId, token) {
    // First decrypt the password
    try {
      const response = await fetch(`${this.apiUrl}/passwords/${passwordId}/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          master_key: prompt('Enter your master key to decrypt password:')
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.fillFormFields(username, data.password);
      } else {
        this.showNotification('Failed to decrypt password', 'error');
      }
    } catch (error) {
      this.showNotification('Connection error', 'error');
    }
  }

  fillGeneratedPassword(password) {
    const passwordField = document.querySelector('input[type="password"]');
    if (passwordField) {
      passwordField.value = password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      this.showNotification('Password generated and filled!', 'success');
    }
  }

  fillFormFields(username, password) {
    const emailField = document.querySelector('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="username"]');
    const passwordField = document.querySelector('input[type="password"]');

    if (emailField) {
      emailField.value = username;
      emailField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (passwordField) {
      passwordField.value = password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.showNotification('Password filled successfully!', 'success');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10002;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  observeFormChanges() {
    const observer = new MutationObserver(() => {
      this.detectLoginForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LokContentScript());
} else {
  new LokContentScript();
}