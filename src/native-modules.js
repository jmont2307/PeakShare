// Native module stubs for web compatibility

// Simple logging function that's safe to use anywhere
const safeLog = (...args) => {
  try {
    if (typeof console !== 'undefined' && console.log) {
      console.log(...args);
    }
  } catch (e) {
    // Silent fallback
  }
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// @react-native-firebase/firestore stub
const firestoreStub = {
  collection: () => ({
    where: () => ({
      get: () => Promise.resolve({ 
        docs: [] 
      }),
    }),
    limit: () => ({
      get: () => Promise.resolve({ 
        docs: [] 
      }),
    }),
    orderBy: () => ({
      limit: () => ({
        get: () => Promise.resolve({ 
          docs: [] 
        }),
      }),
    }),
  }),
};

// Memory fallback when localStorage isn't available
const memoryStorage = {
  _data: {},
  getItem: (key) => memoryStorage._data[key] || null,
  setItem: (key, value) => memoryStorage._data[key] = value,
  removeItem: (key) => delete memoryStorage._data[key],
  clear: () => memoryStorage._data = {},
  key: (index) => Object.keys(memoryStorage._data)[index] || null,
  get length() { return Object.keys(memoryStorage._data).length; }
};

// Choose the appropriate storage implementation
const getStorage = () => {
  try {
    if (isBrowser && localStorage) {
      // Test localStorage to make sure it's working
      localStorage.setItem('_test', '1');
      localStorage.removeItem('_test');
      return localStorage;
    }
  } catch (e) {
    safeLog('localStorage not available, using memory storage instead:', e);
  }
  
  return memoryStorage;
};

// AsyncStorage stub for web with enhanced safety
export const AsyncStorage = {
  setItem: (key, value) => {
    try {
      if (key && typeof value !== 'undefined') {
        const storage = getStorage();
        storage.setItem(key, value);
      }
      return Promise.resolve(true);
    } catch (error) {
      safeLog('AsyncStorage setItem error:', error);
      return Promise.resolve(null); // Always resolve
    }
  },
  getItem: (key) => {
    try {
      if (!key) return Promise.resolve(null);
      
      const storage = getStorage();
      const value = storage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      safeLog('AsyncStorage getItem error:', error);
      return Promise.resolve(null);
    }
  },
  removeItem: (key) => {
    try {
      if (key) {
        const storage = getStorage();
        storage.removeItem(key);
      }
      return Promise.resolve(true);
    } catch (error) {
      safeLog('AsyncStorage removeItem error:', error);
      return Promise.resolve(true);
    }
  },
  clear: () => {
    try {
      const storage = getStorage();
      storage.clear();
      return Promise.resolve(true);
    } catch (error) {
      safeLog('AsyncStorage clear error:', error);
      return Promise.resolve(true);
    }
  },
  getAllKeys: () => {
    try {
      const storage = getStorage();
      const keys = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null) keys.push(key);
      }
      return Promise.resolve(keys);
    } catch (error) {
      safeLog('AsyncStorage getAllKeys error:', error);
      return Promise.resolve([]);
    }
  },
  multiSet: (keyValuePairs) => {
    try {
      if (Array.isArray(keyValuePairs)) {
        const storage = getStorage();
        keyValuePairs.forEach(([key, value]) => {
          if (key && typeof value !== 'undefined') {
            storage.setItem(key, value);
          }
        });
      }
      return Promise.resolve(true);
    } catch (error) {
      safeLog('AsyncStorage multiSet error:', error);
      return Promise.resolve(true);
    }
  },
  multiGet: (keys) => {
    try {
      const values = [];
      if (Array.isArray(keys)) {
        const storage = getStorage();
        keys.forEach(key => {
          if (key) {
            values.push([key, storage.getItem(key)]);
          }
        });
      }
      return Promise.resolve(values);
    } catch (error) {
      safeLog('AsyncStorage multiGet error:', error);
      return Promise.resolve([]);
    }
  },
  multiRemove: (keys) => {
    try {
      if (Array.isArray(keys)) {
        const storage = getStorage();
        keys.forEach(key => {
          if (key) {
            storage.removeItem(key);
          }
        });
      }
      return Promise.resolve(true);
    } catch (error) {
      safeLog('AsyncStorage multiRemove error:', error);
      return Promise.resolve(true);
    }
  }
};

export default {
  firestore: () => firestoreStub,
  AsyncStorage
};