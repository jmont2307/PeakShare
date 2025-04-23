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
      profileImageUrl: 'https://via.placeholder.com/200/e0f2ff/0066cc?text=TU',
      bio: 'Snow enthusiast',
      location: 'Denver, CO',
      postCount: 8,
      followerCount: 120,
      followingCount: 45,
      skiStats: {
        resortCount: 5,
        totalDistance: 480,
        preferredTerrain: 'Powder'
      }
    },
    {
      uid: 'test-user-456',
      email: 'jane@example.com',
      username: 'janedoe',
      displayName: 'Jane Doe',
      profileImageUrl: 'https://via.placeholder.com/200/e0f2ff/0066cc?text=JD',
      bio: 'Backcountry explorer',
      location: 'Salt Lake City, UT',
      postCount: 12,
      followerCount: 253,
      followingCount: 187,
      skiStats: {
        resortCount: 7,
        totalDistance: 620,
        preferredTerrain: 'Backcountry'
      }
    }
  ]);
  
  const dispatch = useDispatch();

  // Handle user state changes - with safer initialization
  useEffect(() => {
    // Check for saved login in development mode
    const checkForSavedLogin = async () => {
      try {
        // For development, you might want to auto-login
        // This is just for testing - remove for production
        const autoLogin = false;  // Set to true to auto-login in dev

        if (autoLogin) {
          // Use the first mock account
          const mockAccount = savedAccounts[0];
          if (mockAccount) {
            setUser({
              uid: mockAccount.uid,
              email: mockAccount.email,
              displayName: mockAccount.displayName,
            });
            
            setLocalUserData(mockAccount);
            dispatch(setUserData(mockAccount));
          }
        } else {
          // Force login screen
          setUser(null);
          setLocalUserData(null);
          dispatch(clearUserData());
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        // Make sure to clear auth state on error
        setUser(null);
        setLocalUserData(null);
        dispatch(clearUserData());
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };
    
    checkForSavedLogin();
    return () => {}; 
  }, [dispatch, savedAccounts]);

  const login = async (email, password) => {
    try {
      // For testing: allow any email/password
      if (email && password) {
        // First create the user object
        const mockUser = {
          uid: 'test-user-123',
          email: email,
          displayName: 'Test User',
        };
        
        // Create mock user data with placeholder image
        const mockUserData = {
          uid: 'test-user-123',
          email: email,
          username: 'testuser',
          displayName: 'Test User',
          profileImageUrl: 'https://via.placeholder.com/200/e0f2ff/0066cc?text=PS',
          bio: 'Test user account',
          location: 'Test Location',
          postCount: 5,
          followerCount: 120,
          followingCount: 45,
          skiStats: {
            resortCount: 3,
            totalDistance: 250,
            preferredTerrain: 'Powder'
          }
        };
        
        // Update the state and Redux
        dispatch(setUserData(mockUserData));
        setLocalUserData(mockUserData);
        setUser(mockUser);
        
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Please enter both email and password.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error?.message || 'An error occurred while logging in.'
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
      // For mock auth, just clear local state
      setUser(null);
      setLocalUserData(null);
      dispatch(clearUserData());
      
      // Only attempt to sign out if using real Firebase auth
      try {
        if (auth) {
          await signOut(auth);
        }
      } catch (e) {
        console.log('Error during sign out, but continuing:', e);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Error logging out'
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

  // Add switchAccount function with improved error handling
  const switchAccount = (accountId) => {
    try {
      const selectedAccount = savedAccounts.find(account => account.uid === accountId);
      
      if (selectedAccount) {
        // Set user data first
        const mockUser = {
          uid: selectedAccount.uid,
          email: selectedAccount.email,
          displayName: selectedAccount.displayName,
        };
        
        // Use the full account data which already has proper fields
        const mockUserData = {
          ...selectedAccount,
          // Ensure we don't have missing fields
          bio: selectedAccount.bio || `${selectedAccount.displayName}'s profile`,
          location: selectedAccount.location || 'Mountain View, CA',
          postCount: selectedAccount.postCount || Math.floor(Math.random() * 20) + 5,
          followerCount: selectedAccount.followerCount || Math.floor(Math.random() * 500) + 100,
          followingCount: selectedAccount.followingCount || Math.floor(Math.random() * 200) + 40,
          skiStats: selectedAccount.skiStats || {
            resortCount: Math.floor(Math.random() * 10) + 1,
            totalDistance: Math.floor(Math.random() * 500) + 100,
            preferredTerrain: 'All'
          }
        };
        
        // Update Redux first, then local state
        dispatch(setUserData(mockUserData));
        setLocalUserData(mockUserData);
        setUser(mockUser);
        
        return { success: true };
      } else {
        console.warn('Account not found:', accountId);
        return { success: false, error: 'Account not found' };
      }
    } catch (error) {
      console.error('Switch account error:', error);
      return { success: false, error: error?.message || 'Error switching accounts' };
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