class SmartFormDetection {
  constructor() {
    this.patterns = {
      email: [
        'email', 'e-mail', 'mail', 'user', 'username', 'login', 'account',
        'signin', 'sign-in', 'log-in', 'userid', 'user_id', 'user-id'
      ],
      password: [
        'password', 'pass', 'pwd', 'secret', 'pin', 'passcode', 'auth',
        'credential', 'key', 'security', 'login-password', 'user-password'
      ],
      confirmPassword: [
        'confirm', 'repeat', 'verify', 'again', 'confirmation', 'retype',
        'confirm-password', 'password-confirm', 'repeat-password'
      ]
    };
  }

  detectLoginForms() {
    const forms = document.querySelectorAll('form');
    const detectedForms = [];

    forms.forEach(form => {
      const analysis = this.analyzeForm(form);
      if (analysis.isLoginForm) {
        detectedForms.push({
          form,
          emailField: analysis.emailField,
          passwordField: analysis.passwordField,
          confidence: analysis.confidence
        });
      }
    });

    return detectedForms.sort((a, b) => b.confidence - a.confidence);
  }

  analyzeForm(form) {
    const inputs = form.querySelectorAll('input');
    let emailField = null;
    let passwordField = null;
    let confirmPasswordField = null;
    let confidence = 0;

    inputs.forEach(input => {
      const analysis = this.analyzeInput(input);
      
      if (analysis.type === 'email' && !emailField) {
        emailField = input;
        confidence += analysis.confidence;
      } else if (analysis.type === 'password' && !passwordField) {
        passwordField = input;
        confidence += analysis.confidence;
      } else if (analysis.type === 'confirmPassword') {
        confirmPasswordField = input;
      }
    });

    // Boost confidence for forms with both email and password
    if (emailField && passwordField) {
      confidence += 30;
    }

    // Reduce confidence if it's likely a registration form
    if (confirmPasswordField) {
      confidence -= 20;
    }

    // Check form context
    const formText = form.textContent.toLowerCase();
    if (formText.includes('sign in') || formText.includes('log in')) {
      confidence += 20;
    }
    if (formText.includes('register') || formText.includes('sign up')) {
      confidence -= 15;
    }

    return {
      isLoginForm: confidence > 50 && emailField && passwordField,
      emailField,
      passwordField,
      confirmPasswordField,
      confidence: Math.min(confidence, 100)
    };
  }

  analyzeInput(input) {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const type = input.type.toLowerCase();
    const className = (input.className || '').toLowerCase();

    let confidence = 0;
    let detectedType = null;

    // Check input type first
    if (type === 'email') {
      detectedType = 'email';
      confidence = 80;
    } else if (type === 'password') {
      detectedType = 'password';
      confidence = 90;
    } else if (type === 'text' || type === '') {
      // Analyze text inputs for email patterns
      const allText = `${name} ${id} ${placeholder} ${className}`;
      
      for (const pattern of this.patterns.email) {
        if (allText.includes(pattern)) {
          detectedType = 'email';
          confidence += 15;
        }
      }

      for (const pattern of this.patterns.confirmPassword) {
        if (allText.includes(pattern)) {
          detectedType = 'confirmPassword';
          confidence += 20;
        }
      }
    }

    // Additional heuristics
    if (input.autocomplete) {
      const autocomplete = input.autocomplete.toLowerCase();
      if (autocomplete.includes('email') || autocomplete.includes('username')) {
        detectedType = 'email';
        confidence += 25;
      } else if (autocomplete.includes('current-password')) {
        detectedType = 'password';
        confidence += 25;
      } else if (autocomplete.includes('new-password')) {
        detectedType = 'confirmPassword';
        confidence += 25;
      }
    }

    return {
      type: detectedType,
      confidence: Math.min(confidence, 100)
    };
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  getFormContext(form) {
    const context = {
      url: window.location.href,
      title: document.title,
      formAction: form.action || window.location.href,
      submitButtons: [],
      labels: []
    };

    // Find submit buttons
    const buttons = form.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(button => {
      const text = (button.textContent || button.value || '').toLowerCase();
      context.submitButtons.push(text);
    });

    // Find associated labels
    const labels = form.querySelectorAll('label');
    labels.forEach(label => {
      context.labels.push(label.textContent.toLowerCase());
    });

    return context;
  }
}

export default SmartFormDetection;