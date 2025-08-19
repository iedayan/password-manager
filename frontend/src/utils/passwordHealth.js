// Password health analysis utilities
export const analyzePasswordHealth = (passwords) => {
  const analysis = {
    totalPasswords: passwords.length,
    weakPasswords: [],
    reusedPasswords: [],
    oldPasswords: [],
    compromisedPasswords: [],
    overallScore: 0,
    recommendations: []
  };

  const passwordCounts = {};
  const now = new Date();

  passwords.forEach(password => {
    const strength = calculatePasswordStrength(password.password);
    const age = password.created_at ? Math.floor((now - new Date(password.created_at)) / (1000 * 60 * 60 * 24)) : 0;

    // Check for weak passwords
    if (strength < 60) {
      analysis.weakPasswords.push({
        ...password,
        strength,
        issue: 'Weak password'
      });
    }

    // Check for reused passwords
    const passHash = btoa(password.password); // Simple hash for demo
    passwordCounts[passHash] = (passwordCounts[passHash] || []);
    passwordCounts[passHash].push(password);

    // Check for old passwords (>365 days)
    if (age > 365) {
      analysis.oldPasswords.push({
        ...password,
        age,
        issue: 'Password older than 1 year'
      });
    }

    // Mock breach check (in real app, this would call HaveIBeenPwned API)
    if (isCommonPassword(password.password)) {
      analysis.compromisedPasswords.push({
        ...password,
        issue: 'Found in common password lists'
      });
    }
  });

  // Find reused passwords
  Object.values(passwordCounts).forEach(group => {
    if (group.length > 1) {
      group.forEach(password => {
        analysis.reusedPasswords.push({
          ...password,
          issue: `Reused ${group.length} times`
        });
      });
    }
  });

  // Calculate overall score
  const issues = analysis.weakPasswords.length + 
                analysis.reusedPasswords.length + 
                analysis.oldPasswords.length + 
                analysis.compromisedPasswords.length;
  
  analysis.overallScore = Math.max(0, 100 - (issues / passwords.length) * 100);

  // Generate recommendations
  if (analysis.weakPasswords.length > 0) {
    analysis.recommendations.push(`Update ${analysis.weakPasswords.length} weak passwords`);
  }
  if (analysis.reusedPasswords.length > 0) {
    analysis.recommendations.push(`Replace ${analysis.reusedPasswords.length} reused passwords`);
  }
  if (analysis.oldPasswords.length > 0) {
    analysis.recommendations.push(`Refresh ${analysis.oldPasswords.length} old passwords`);
  }
  if (analysis.compromisedPasswords.length > 0) {
    analysis.recommendations.push(`Change ${analysis.compromisedPasswords.length} compromised passwords`);
  }

  return analysis;
};

export const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  
  return Math.min(100, score);
};

const isCommonPassword = (password) => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  return commonPasswords.includes(password.toLowerCase());
};