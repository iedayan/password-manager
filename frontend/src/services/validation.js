export const validatePasswordForm = (formData) => {
  const errors = {};

  // Site name validation
  if (!formData.site_name?.trim()) {
    errors.site_name = 'Site name is required';
  } else if (formData.site_name.length > 100) {
    errors.site_name = 'Site name must be less than 100 characters';
  }

  // Username validation
  if (!formData.username?.trim()) {
    errors.username = 'Username/email is required';
  } else if (formData.username.length > 255) {
    errors.username = 'Username must be less than 255 characters';
  }

  // URL validation (optional but if provided, should be valid)
  if (formData.site_url && formData.site_url.trim()) {
    try {
      new URL(formData.site_url.startsWith('http') ? formData.site_url : `https://${formData.site_url}`);
    } catch {
      errors.site_url = 'Please enter a valid URL';
    }
  }

  // Password validation
  if (!formData.password?.trim()) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (formData.password.length > 500) {
    errors.password = 'Password is too long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeFormData = (formData) => {
  return {
    site_name: formData.site_name?.trim() || '',
    site_url: formData.site_url?.trim() || '',
    username: formData.username?.trim() || '',
    password: formData.password || ''
  };
};

export const formatUrl = (url) => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};