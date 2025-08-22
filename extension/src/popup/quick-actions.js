/**
 * Enhanced quick actions for popup
 */

class QuickActions {
  constructor() {
    this.passwordGenerator = new PasswordGenerator();
  }

  async showPasswordGenerator() {
    const modal = document.createElement('div');
    modal.className = 'lok-modal-overlay';
    modal.innerHTML = `
      <div class="lok-modal">
        <div class="lok-modal-header">
          <h3>Generate Password</h3>
          <button class="lok-modal-close">&times;</button>
        </div>
        <div class="lok-modal-body">
          <div class="password-display">
            <input type="text" id="generated-password" readonly>
            <button id="copy-password" class="copy-btn">📋</button>
          </div>
          <div class="strength-indicator">
            <div class="strength-bar">
              <div class="strength-fill"></div>
            </div>
            <span class="strength-text">Strong</span>
          </div>
          <div class="password-options">
            <label>
              <input type="range" id="length-slider" min="8" max="32" value="20">
              Length: <span id="length-value">20</span>
            </label>
            <label>
              <input type="checkbox" id="uppercase" checked> Uppercase
            </label>
            <label>
              <input type="checkbox" id="lowercase" checked> Lowercase
            </label>
            <label>
              <input type="checkbox" id="numbers" checked> Numbers
            </label>
            <label>
              <input type="checkbox" id="symbols" checked> Symbols
            </label>
          </div>
        </div>
        <div class="lok-modal-footer">
          <button id="regenerate-btn" class="lok-btn lok-btn-secondary">Regenerate</button>
          <button id="use-password-btn" class="lok-btn lok-btn-primary">Use Password</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupPasswordGenerator(modal);
  }

  setupPasswordGenerator(modal) {
    const passwordInput = modal.querySelector('#generated-password');
    const strengthFill = modal.querySelector('.strength-fill');
    const strengthText = modal.querySelector('.strength-text');
    const lengthSlider = modal.querySelector('#length-slider');
    const lengthValue = modal.querySelector('#length-value');

    const generatePassword = () => {
      const options = {
        length: parseInt(lengthSlider.value),
        includeUppercase: modal.querySelector('#uppercase').checked,
        includeLowercase: modal.querySelector('#lowercase').checked,
        includeNumbers: modal.querySelector('#numbers').checked,
        includeSymbols: modal.querySelector('#symbols').checked
      };

      const password = this.passwordGenerator.generate(options);
      const strength = this.passwordGenerator.calculateStrength(password);

      passwordInput.value = password;
      strengthFill.style.width = `${strength.score}%`;
      strengthFill.style.background = strength.color;
      strengthText.textContent = strength.strength;
      strengthText.style.color = strength.color;
    };

    // Initial generation
    generatePassword();

    // Event listeners
    lengthSlider.addEventListener('input', () => {
      lengthValue.textContent = lengthSlider.value;
      generatePassword();
    });

    modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', generatePassword);
    });

    modal.querySelector('#regenerate-btn').addEventListener('click', generatePassword);

    modal.querySelector('#copy-password').addEventListener('click', async () => {
      await navigator.clipboard.writeText(passwordInput.value);
      modal.querySelector('#copy-password').textContent = '✓';
      setTimeout(() => {
        modal.querySelector('#copy-password').textContent = '📋';
      }, 1000);
    });

    modal.querySelector('#use-password-btn').addEventListener('click', async () => {
      await navigator.clipboard.writeText(passwordInput.value);
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'fill_generated_password',
          password: passwordInput.value
        });
      });
      modal.remove();
      window.close();
    });

    modal.querySelector('.lok-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}

window.QuickActions = QuickActions;