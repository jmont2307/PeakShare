// Native module stubs for web compatibility

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

// AsyncStorage stub for web
export const AsyncStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getAllKeys: () => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return Promise.resolve(keys);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  multiSet: (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  multiGet: (keys) => {
    try {
      const values = keys.map(key => [key, localStorage.getItem(key)]);
      return Promise.resolve(values);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  multiRemove: (keys) => {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default {
  firestore: () => firestoreStub,
  AsyncStorage
};