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
  const [savedAccounts, setSavedAccounts] = useState([
    {
      uid: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=60',
    },
    {
      uid: 'test-user-456',
      email: 'jane@example.com',
      username: 'janedoe',
      displayName: 'Jane Doe',
      profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=60',
    }
  ]);
  
  const dispatch = useDispatch();

  // Handle user state changes
  useEffect(() => {
    // Always set user to null to force login screen initially
    setUser(null);
    setLocalUserData(null);
    dispatch(clearUserData());
    setLoading(false);
    
    // In a real app, this would check Firebase auth state
    return () => {}; 
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      // For testing: allow any email/password
      if (email && password) {
        // Simulate successful login
        const mockUser = {
          uid: 'test-user-123',
          email: email,
          displayName: 'Test User',
        };
        
        setUser(mockUser);
        
        // Create mock user data
        const mockUserData = {
          uid: 'test-user-123',
          email: email,
          username: 'testuser',
          displayName: 'Test User',
          profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=60',
          bio: 'Test user account',
          location: 'Test Location',
          postCount: 5,
          followerCount: 120,
          followingCount: 45,
        };
        
        setLocalUserData(mockUserData);
        dispatch(setUserData(mockUserData));
        
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Please enter both email and password.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred while logging in.'
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

  // Add switchAccount function
  const switchAccount = (accountId) => {
    try {
      const selectedAccount = savedAccounts.find(account => account.uid === accountId);
      
      if (selectedAccount) {
        // Set user and userData
        const mockUser = {
          uid: selectedAccount.uid,
          email: selectedAccount.email,
          displayName: selectedAccount.displayName,
        };
        
        setUser(mockUser);
        
        // Create mock user data
        const mockUserData = {
          ...selectedAccount,
          bio: `${selectedAccount.displayName}'s profile`,
          location: 'Mountain View, CA',
          postCount: Math.floor(Math.random() * 20) + 5,
          followerCount: Math.floor(Math.random() * 500) + 100,
          followingCount: Math.floor(Math.random() * 200) + 40,
        };
        
        setLocalUserData(mockUserData);
        dispatch(setUserData(mockUserData));
        
        return { success: true };
      } else {
        return { success: false, error: 'Account not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
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
      resetPassword,
      savedAccounts,
      switchAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};