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

export default {
  firestore: () => firestoreStub
};