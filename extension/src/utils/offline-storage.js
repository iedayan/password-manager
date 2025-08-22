/**
 * Offline storage with encryption
 */

class OfflineStorage {
  constructor() {
    this.storageKey = 'lok_offline_data';
    this.encryptionKey = null;
  }

  async setEncryptionKey(key) {
    this.encryptionKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    if (!this.encryptionKey) throw new Error('No encryption key');
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encoded
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  }

  async decrypt(encryptedData) {
    if (!this.encryptionKey) throw new Error('No encryption key');
    
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async store(data) {
    const encrypted = await this.encrypt(data);
    await chrome.storage.local.set({ [this.storageKey]: encrypted });
  }

  async retrieve() {
    const result = await chrome.storage.local.get([this.storageKey]);
    if (!result[this.storageKey]) return null;
    
    return await this.decrypt(result[this.storageKey]);
  }
}

window.OfflineStorage = OfflineStorage;