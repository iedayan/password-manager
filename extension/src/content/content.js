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
    button.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
      </svg>
      Lok
    `;
    button.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
      transition: all 0.2s ease;
      opacity: 0.9;
    `;

    // Position relative to password field
    passwordField.style.paddingRight = '70px';
    
    const container = passwordField.parentElement;
    container.style.position = 'relative';
    container.appendChild(button);

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(-50%) scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.9';
      button.style.transform = 'translateY(-50%) scale(1)';
    });

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Show loading state
      button.style.opacity = '0.6';
      button.innerHTML = 'Loading...';
      
      // Check if user is logged in first
      const result = await chrome.storage.local.get(['token']);
      if (!result.token) {
        this.showLoginPrompt();
      } else {
        await this.showPasswordOptions();
      }
      
      // Reset button
      setTimeout(() => {
        button.style.opacity = '0.9';
        button.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
          </svg>
          Lok
        `;
      }, 500);
    });
  }

  async showPasswordOptions() {
    const result = await chrome.storage.local.get(['token']);
    if (!result.token) return;

    try {
      // Get passwords for current site
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
    // Remove existing dropdown
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

    // Add hover effects
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

    // Close button
    dropdown.querySelector('.lok-close-btn').addEventListener('click', () => {
      dropdown.remove();
    });

    // Auto-close after 15 seconds
    setTimeout(() => {
      if (dropdown.parentElement) dropdown.remove();
    }, 15000);
  }

  showNoPasswordsFound() {
    this.showNotification('No passwords found for this site', 'info');
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

    // Don't save if password is too short or common
    if (password.length < 6) return;

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

  showNotification(message, type) {
    const notification = document.createElement('div');
    const bgColor = {
      'success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'info': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
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

    // Slide in animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Slide out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
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