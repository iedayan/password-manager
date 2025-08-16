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
    if (form.querySelector('.lok-autofill-btn')) return;

    const container = passwordField.parentElement;
    const existingButtons = container.querySelectorAll('button, [role="button"], .eye-icon, [class*="eye"], [class*="show"], [class*="toggle"]');
    
    let rightOffset = 8;
    let paddingRight = 45;
    
    if (existingButtons.length > 0) {
      rightOffset = 45;
      paddingRight = 80;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lok-autofill-btn';
    button.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="6" y="11" width="12" height="7" rx="1"></rect>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
      </svg>
    `;
    button.style.cssText = `
      position: absolute;
      right: ${rightOffset}px;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 145, 178, 0.12) 100%);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 7px;
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0.85;
      color: #0891b2;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .lok-autofill-btn:hover {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.2) 100%) !important;
        border-color: rgba(6, 182, 212, 0.4) !important;
        opacity: 1 !important;
        transform: translateY(-50%) scale(1.08) !important;
        box-shadow: 0 4px 16px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
        color: #06b6d4 !important;
      }
      
      .lok-autofill-btn:active {
        transform: translateY(-50%) scale(0.96) !important;
        box-shadow: 0 1px 4px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
    `;
    
    if (!document.querySelector('#lok-button-styles')) {
      style.id = 'lok-button-styles';
      document.head.appendChild(style);
    }

    passwordField.style.paddingRight = `${paddingRight}px`;
    container.style.position = 'relative';
    container.appendChild(button);

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.handleButtonClick(button);
    });
  }
  
  async handleButtonClick(button) {
    if (button.disabled) return;
    button.disabled = true;
    
    try {
      button.style.opacity = '0.7';
      button.innerHTML = 'Loading...';
      
      const result = await chrome.storage.local.get(['token']);
      
      if (!result.token) {
        this.showLoginPrompt();
      } else {
        await this.showPasswordOptions();
      }
    } catch (error) {
      console.error('Lok button error:', error);
      this.showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      setTimeout(() => {
        button.style.opacity = '0.85';
        button.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="6" y="11" width="12" height="7" rx="1"></rect>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
          </svg>
        `;
        button.disabled = false;
      }, 500);
    }
  }

  async showPasswordOptions() {
    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    try {
      const response = await fetch(`${this.apiUrl}/passwords`, {
        headers: { 'Authorization': `Bearer ${result.token}` }
      });

      if (response.ok) {
        const passwords = await response.json();
        const currentSite = window.location.hostname.replace('www.', '');
        const sitePasswords = passwords.filter(p => 
          p.site_url.toLowerCase().includes(currentSite.toLowerCase()) || 
          p.site_name.toLowerCase().includes(currentSite.toLowerCase())
        );

        if (sitePasswords.length > 0) {
          this.showPasswordDropdown(sitePasswords);
        } else {
          this.showNoPasswordsFound();
        }
      }
    } catch (error) {
      this.showNotification('Connection error', 'error');
    }
  }

  showPasswordDropdown(passwords) {
    const existing = document.querySelector('.lok-password-dropdown');
    if (existing) existing.remove();

    const dropdown = document.createElement('div');
    dropdown.className = 'lok-password-dropdown';
    dropdown.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 10003;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 280px;
      color: white;
    `;

    const header = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); border-radius: 6px; margin-right: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">L</div>
          <span style="font-weight: 600; font-size: 14px;">Choose Password</span>
        </div>
        <button class="lok-close-btn" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 16px;">×</button>
      </div>
    `;

    const passwordItems = passwords.map(password => `
      <div class="lok-password-option" data-id="${password.id}" style="
        padding: 12px;
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.05);
      ">
        <div style="font-weight: 600; margin-bottom: 4px;">${password.site_name}</div>
        <div style="font-size: 12px; opacity: 0.8;">${password.username}</div>
      </div>
    `).join('');

    dropdown.innerHTML = header + passwordItems;
    document.body.appendChild(dropdown);

    dropdown.querySelectorAll('.lok-password-option').forEach(option => {
      option.addEventListener('mouseenter', () => {
        option.style.background = 'rgba(6, 182, 212, 0.1)';
        option.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      });
      
      option.addEventListener('mouseleave', () => {
        option.style.background = 'rgba(255, 255, 255, 0.05)';
        option.style.borderColor = 'rgba(6, 182, 212, 0.2)';
      });

      option.addEventListener('click', async () => {
        const passwordId = option.dataset.id;
        const password = passwords.find(p => p.id == passwordId);
        await this.fillPasswordSecurely(password);
        dropdown.remove();
      });
    });

    dropdown.querySelector('.lok-close-btn').addEventListener('click', () => {
      dropdown.remove();
    });

    setTimeout(() => {
      if (dropdown.parentElement) dropdown.remove();
    }, 30000);
  }

  showNoPasswordsFound() {
    this.showNotification('No passwords found for this site', 'info');
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

    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    if (password.length < 6) return;

    setTimeout(() => {
      this.showSavePasswordPrompt(username, password, window.location.hostname);
    }, 1000);
  }

  showSavePasswordPrompt(username, password, siteName) {
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
        <strong>Save Password?</strong>
      </div>
      <div style="margin-bottom: 16px; color: #666; font-size: 14px;">
        Save password for <strong>${siteName}</strong>?
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="lokSaveBtn" style="flex: 1; padding: 8px 16px; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
        <button id="lokCancelBtn" style="flex: 1; padding: 8px 16px; background: #f0f0f0; color: #666; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#lokSaveBtn').addEventListener('click', async () => {
      await this.savePassword(username, password, siteName);
      overlay.remove();
    });

    overlay.querySelector('#lokCancelBtn').addEventListener('click', () => {
      overlay.remove();
    });

    setTimeout(() => {
      if (overlay.parentElement) overlay.remove();
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

  async fillPasswordSecurely(passwordData) {
    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    try {
      const response = await fetch(`${this.apiUrl}/passwords/${passwordData.id}`, {
        headers: { 'Authorization': `Bearer ${result.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.fillFormFields(passwordData.username, data.password);
      } else {
        this.showNotification('Failed to retrieve password', 'error');
      }
    } catch (error) {
      this.showNotification('Connection error', 'error');
    }
  }

  async fillPassword(username, passwordId, token) {
    try {
      const response = await fetch(`${this.apiUrl}/passwords/${passwordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.fillFormFields(username, data.password);
      } else {
        this.showNotification('Failed to retrieve password', 'error');
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

  showLoginPrompt() {
    const prompt = document.createElement('div');
    prompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      z-index: 10003;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      color: white;
      min-width: 300px;
    `;
    
    prompt.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); border-radius: 12px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">L</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Login Required</div>
        <div style="color: rgba(255,255,255,0.8); font-size: 14px;">Please login to Lok to save and fill passwords</div>
      </div>
      <div style="display: flex; gap: 12px;">
        <button id="lokLoginBtn" style="flex: 1; padding: 12px 20px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Open Lok</button>
        <button id="lokCancelBtn" style="flex: 1; padding: 12px 20px; background: rgba(255, 255, 255, 0.1); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; cursor: pointer; font-weight: 600;">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    prompt.querySelector('#lokLoginBtn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
      prompt.remove();
    });
    
    prompt.querySelector('#lokCancelBtn').addEventListener('click', () => {
      prompt.remove();
    });
    
    setTimeout(() => {
      if (prompt.parentElement) prompt.remove();
    }, 10000);
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    const bgColor = {
      'success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'info': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }[type] || 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 12px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 10002;
      background: ${bgColor};
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  observeFormChanges() {
    let throttleTimer = null;
    const observer = new MutationObserver(() => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        this.detectLoginForms();
        throttleTimer = null;
      }, 200);
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