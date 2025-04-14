import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUserData, clearUserData } from '../redux/slices/userSlice';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setLocalUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();

  // Handle user state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (userState) => {
      if (userState) {
        // User is signed in
        const userDocRef = doc(db, 'users', userState.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userDocData = userDoc.data();
          setLocalUserData(userDocData);
          
          // Save user data to Redux
          dispatch(setUserData({
            uid: userState.uid,
            ...userDocData
          }));
          
          // Note: FCM token handling is removed as we're not using push notifications in this version
          // This would require additional setup with Expo or the native Firebase SDK
        } else {
          // User document doesn't exist (shouldn't happen, but handle just in case)
          console.log('User document not found for authenticated user');
        }
        
        setUser(userState);
      } else {
        // User is signed out
        setUser(null);
        setLocalUserData(null);
        dispatch(clearUserData());
      }
      
      setLoading(false);
    });

    return unsubscribeAuth;
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (email, password, username, displayName) => {
    try {
      // Check if username is already taken
      const usernameRef = collection(db, 'users');
      const q = query(usernameRef, where('username', '==', username));
      const usernameCheck = await getDocs(q);
      
      if (!usernameCheck.empty) {
        return {
          success: false,
          error: 'Username already taken. Please choose another one.'
        };
      }
      
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        username,
        displayName,
        profileImageUrl: '',
        bio: '',
        location: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
        skiStats: {
          resortCount: 0,
          totalDistance: 0,
          preferredTerrain: ''
        }
      });
      
      return { success: true };
    } catch (error) {
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Update user's FCM token is removed from this version
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.'
      };
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData: userData,
      loading,
      login,
      register,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};