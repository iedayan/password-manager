/**
 * Biometric authentication for extension
 */

class BiometricAuth {
  constructor() {
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return 'credentials' in navigator && 'create' in navigator.credentials;
  }

  async authenticate() {
    if (!this.isSupported) return false;

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required'
        }
      });
      return !!credential;
    } catch {
      return false;
    }
  }
}

window.BiometricAuth = BiometricAuth;