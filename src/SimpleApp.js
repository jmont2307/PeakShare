import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';

// For web localStorage implementation
const localStorageAvailable = typeof window !== 'undefined' && window.localStorage;

// SVG Mountain Background Component
const MountainBackground = () => (
  <View style={styles.mountainBackground}>
    <View style={styles.mountain1} />
    <View style={styles.mountain2} />
    <View style={styles.mountain3} />
  </View>
);

// Sample data for resorts
const SAMPLE_RESORTS = [
  {
    id: '1',
    name: 'Whistler Blackcomb',
    location: 'British Columbia, Canada',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    newSnow: 15,
    description: 'North America\'s largest ski resort with over 8,000 acres of skiable terrain.',
    weather: {
      temperature: -5,
      conditions: 'Partly Cloudy',
      snowDepth: 120
    }
  },
  {
    id: '2',
    name: 'Aspen Snowmass',
    location: 'Colorado, USA',
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    newSnow: 8,
    description: 'Four mountains of world-class skiing and snowboarding in the heart of the Colorado Rockies.',
    weather: {
      temperature: -2,
      conditions: 'Sunny',
      snowDepth: 95
    }
  },
  {
    id: '3',
    name: 'Park City Mountain',
    location: 'Utah, USA',
    imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    newSnow: 12,
    description: 'America\'s largest single ski resort with over 7,300 acres of terrain.',
    weather: {
      temperature: -1,
      conditions: 'Snowing',
      snowDepth: 110
    }
  },
  {
    id: '4',
    name: 'Zermatt',
    location: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    newSnow: 20,
    description: 'Iconic Swiss resort with the majestic Matterhorn as its backdrop.',
    weather: {
      temperature: -8,
      conditions: 'Clear',
      snowDepth: 140
    }
  },
  {
    id: '5',
    name: 'Niseko United',
    location: 'Hokkaido, Japan',
    imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    newSnow: 25,
    description: 'Japan\'s premier powder destination, famous for its consistent snowfall.',
    weather: {
      temperature: -4,
      conditions: 'Heavy Snow',
      snowDepth: 180
    }
  }
];

// Enhanced functional app component
export default function SimpleApp() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedResort, setSelectedResort] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState(null); // null, 'login', or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [follows, setFollows] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  
  // Load data from local storage on mount
  useEffect(() => {
    if (localStorageAvailable) {
      // Check if user has seen welcome screen
      const hasSeenWelcome = localStorage.getItem('peakshare_has_seen_welcome');
      if (hasSeenWelcome === 'true') {
        setShowWelcomeScreen(false);
      }
      
      // Load registered users
      const storedUsers = localStorage.getItem('peakshare_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      
      // Load posts
      const storedPosts = localStorage.getItem('peakshare_posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
      
      // Load follows
      const storedFollows = localStorage.getItem('peakshare_follows');
      if (storedFollows) {
        setFollows(JSON.parse(storedFollows));
      }
      
      // Check for logged in user
      const storedUser = localStorage.getItem('peakshare_current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setUsername(user.username);
        setFullName(user.fullName);
        setEmail(user.email);
        setShowWelcomeScreen(false); // Skip welcome screen if logged in
      }
    }
  }, []);
  
  // Save users whenever they change
  useEffect(() => {
    if (localStorageAvailable && users.length > 0) {
      localStorage.setItem('peakshare_users', JSON.stringify(users));
    }
  }, [users]);
  
  // Save posts whenever they change
  useEffect(() => {
    if (localStorageAvailable) {
      localStorage.setItem('peakshare_posts', JSON.stringify(posts));
    }
  }, [posts]);
  
  // Save follows whenever they change
  useEffect(() => {
    if (localStorageAvailable) {
      localStorage.setItem('peakshare_follows', JSON.stringify(follows));
    }
  }, [follows]);
  
  // Helper function to get user stats
  const getUserStats = (userId) => {
    const userPosts = posts.filter(post => post.userId === userId);
    const followers = follows.filter(follow => follow.followingId === userId);
    const following = follows.filter(follow => follow.followerId === userId);
    
    return {
      postCount: userPosts.length,
      followerCount: followers.length,
      followingCount: following.length
    };
  };
  
  // Check if current user is following another user
  const isFollowing = (targetUserId) => {
    if (!currentUser) return false;
    
    return follows.some(follow => 
      follow.followerId === currentUser.id && 
      follow.followingId === targetUserId
    );
  };
  
  // Follow/unfollow a user
  const toggleFollow = (targetUserId) => {
    if (!currentUser) {
      setAuthMode('login');
      return;
    }
    
    // Can't follow yourself
    if (currentUser.id === targetUserId) return;
    
    const alreadyFollowing = isFollowing(targetUserId);
    
    if (alreadyFollowing) {
      // Unfollow
      const updatedFollows = follows.filter(follow => 
        !(follow.followerId === currentUser.id && follow.followingId === targetUserId)
      );
      setFollows(updatedFollows);
    } else {
      // Follow
      const newFollow = {
        id: Date.now().toString(),
        followerId: currentUser.id,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      };
      setFollows([...follows, newFollow]);
    }
  };
  
  // Create a new post
  const createPost = (content, resortId) => {
    if (!currentUser) {
      setAuthMode('login');
      return;
    }
    
    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content,
      resortId,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    setPosts([...posts, newPost]);
    return newPost;
  };
  
  // Get lists of followers and following for current user
  const getFollowers = () => {
    if (!currentUser) return [];
    
    return follows
      .filter(follow => follow.followingId === currentUser.id)
      .map(follow => {
        const follower = users.find(user => user.id === follow.followerId);
        return follower;
      })
      .filter(Boolean); // Remove any undefined values
  };
  
  const getFollowing = () => {
    if (!currentUser) return [];
    
    return follows
      .filter(follow => follow.followerId === currentUser.id)
      .map(follow => {
        const following = users.find(user => user.id === follow.followingId);
        return following;
      })
      .filter(Boolean); // Remove any undefined values
  };

  // Filter resorts based on search query
  const filteredResorts = SAMPLE_RESORTS.filter(resort => 
    resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resort.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Render resort detail view
  const renderResortDetail = () => {
    const resort = selectedResort;
    if (!resort) return null;
    
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedResort(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{resort.name}</Text>
        </View>
        
        <ScrollView style={styles.detailContent}>
          <Image source={{ uri: resort.imageUrl }} style={styles.detailImage} />
          
          <View style={styles.detailInfo}>
            <Text style={styles.detailLocation}>{resort.location}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{resort.rating}</Text>
              <Text style={styles.ratingLabel}>★ Rating</Text>
            </View>
            
            <View style={styles.weatherCard}>
              <Text style={styles.weatherTitle}>Current Conditions</Text>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherValue}>{resort.weather.temperature}°C</Text>
                  <Text style={styles.weatherLabel}>Temperature</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherValue}>{resort.weather.conditions}</Text>
                  <Text style={styles.weatherLabel}>Conditions</Text>
                </View>
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherValue}>{resort.weather.snowDepth}cm</Text>
                  <Text style={styles.weatherLabel}>Snow Depth</Text>
                </View>
                {resort.newSnow > 0 && (
                  <View style={styles.weatherItem}>
                    <Text style={styles.weatherValue}>{resort.newSnow}cm</Text>
                    <Text style={styles.weatherLabel}>New Snow</Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={styles.descriptionTitle}>About</Text>
            <Text style={styles.descriptionText}>{resort.description}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };
  
  // Render resort card
  const renderResortCard = (resort) => (
    <TouchableOpacity 
      key={resort.id}
      style={styles.resortCard}
      onPress={() => setSelectedResort(resort)}
    >
      <Image source={{ uri: resort.imageUrl }} style={styles.resortImage} />
      <View style={styles.resortInfo}>
        <Text style={styles.resortName}>{resort.name}</Text>
        <Text style={styles.resortLocation}>{resort.location}</Text>
        <View style={styles.resortStats}>
          <View style={styles.resortStat}>
            <Text style={styles.statValue}>{resort.rating}</Text>
            <Text style={styles.statLabel}>★ Rating</Text>
          </View>
          <View style={styles.resortStat}>
            <Text style={styles.statValue}>{resort.weather.temperature}°C</Text>
            <Text style={styles.statLabel}>{resort.weather.conditions}</Text>
          </View>
          {resort.newSnow > 0 && (
            <View style={styles.resortStat}>
              <Text style={styles.statValue}>+{resort.newSnow}cm</Text>
              <Text style={styles.statLabel}>New Snow</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render explore tab
  const renderExploreTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resorts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.resortsList}>
        {filteredResorts.length > 0 ? (
          filteredResorts.map(resort => renderResortCard(resort))
        ) : (
          <Text style={styles.noResultsText}>No resorts found matching "{searchQuery}"</Text>
        )}
      </ScrollView>
    </View>
  );
  
  // Render feed tab with real posts
  const renderFeedTab = () => {
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedResortForPost, setSelectedResortForPost] = useState(null);
    const [showResortSelector, setShowResortSelector] = useState(false);
    
    const handleCreatePost = () => {
      if (!newPostContent.trim()) return;
      
      createPost(
        newPostContent, 
        selectedResortForPost ? selectedResortForPost.id : null
      );
      
      setNewPostContent('');
      setSelectedResortForPost(null);
    };
    
    // Get user's posts and posts from users they follow
    const feedPosts = isLoggedIn 
      ? posts
          .filter(post => {
            // Include user's own posts
            if (post.userId === currentUser.id) return true;
            
            // Include posts from users they follow
            return follows.some(follow => 
              follow.followerId === currentUser.id && 
              follow.followingId === post.userId
            );
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];
    
    const renderPostItem = (post) => {
      const postUser = users.find(user => user.id === post.userId);
      const postResort = post.resortId 
        ? SAMPLE_RESORTS.find(resort => resort.id === post.resortId)
        : null;
      
      return (
        <View style={styles.postCard} key={post.id}>
          <View style={styles.postHeader}>
            <View style={styles.postHeaderLeft}>
              <View style={styles.userAvatarSmall}>
                <Text style={styles.userInitialsSmall}>
                  {postUser?.username.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.postUserName}>{postUser?.fullName || 'Unknown User'}</Text>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            {postResort && (
              <TouchableOpacity 
                style={styles.postResortTag}
                onPress={() => setSelectedResort(postResort)}
              >
                <Text style={styles.postResortTagText}>{postResort.name}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.postContent}>{post.content}</Text>
          
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction}>
              <Text style={styles.postActionText}>♥ {post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Text style={styles.postActionText}>💬 {post.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };
    
    return (
      <View style={styles.tabContent}>
        {isLoggedIn ? (
          <>
            <View style={styles.newPostContainer}>
              <TextInput
                style={styles.newPostInput}
                placeholder="Share your skiing experience..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
              />
              
              {selectedResortForPost ? (
                <View style={styles.selectedResortTag}>
                  <Text style={styles.selectedResortText}>{selectedResortForPost.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedResortForPost(null)}>
                    <Text style={styles.removeResortText}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.tagResortButton}
                  onPress={() => setShowResortSelector(true)}
                >
                  <Text style={styles.tagResortButtonText}>+ Tag a resort</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.postButton, 
                  !newPostContent.trim() && styles.postButtonDisabled
                ]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.feedScroll}>
              {feedPosts.length > 0 ? (
                feedPosts.map(post => renderPostItem(post))
              ) : (
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyFeedTitle}>No Posts Yet</Text>
                  <Text style={styles.emptyFeedText}>
                    Create your first post or follow other users to see their posts in your feed.
                  </Text>
                </View>
              )}
            </ScrollView>
            
            {/* Resort selector modal */}
            {showResortSelector && (
              <View style={styles.modalOverlay}>
                <View style={styles.usersModal}>
                  <View style={styles.usersModalHeader}>
                    <Text style={styles.usersModalTitle}>Select a Resort</Text>
                    <TouchableOpacity 
                      style={styles.usersModalClose}
                      onPress={() => setShowResortSelector(false)}
                    >
                      <Text style={styles.usersModalCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.resortSelectorList}>
                    {SAMPLE_RESORTS.map(resort => (
                      <TouchableOpacity 
                        key={resort.id}
                        style={styles.resortSelectorItem}
                        onPress={() => {
                          setSelectedResortForPost(resort);
                          setShowResortSelector(false);
                        }}
                      >
                        <Image 
                          source={{ uri: resort.imageUrl }} 
                          style={styles.resortSelectorImage} 
                        />
                        <View style={styles.resortSelectorInfo}>
                          <Text style={styles.resortSelectorName}>{resort.name}</Text>
                          <Text style={styles.resortSelectorLocation}>{resort.location}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedTitle}>Sign In to View Posts</Text>
            <Text style={styles.emptyFeedText}>
              Create an account or sign in to view and share posts with the skiing community.
            </Text>
            <TouchableOpacity 
              style={styles.feedSignInButton}
              onPress={() => setAuthMode('login')}
            >
              <Text style={styles.feedSignInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  // Auth Modal - handles both login and signup
  const renderAuthModal = () => {
    const isSignUp = authMode === 'signup';
    
    const handleSubmit = () => {
      setIsSubmitting(true);
      setErrorMessage('');
      
      if (isSignUp) {
        // Validate signup fields
        if (!email || !password || !confirmPassword || !fullName || !username) {
          setErrorMessage('All fields are required');
          setIsSubmitting(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        
        if (username.length < 3) {
          setErrorMessage('Username must be at least 3 characters');
          setIsSubmitting(false);
          return;
        }
        
        // Check if email or username already exists
        const emailExists = users.some(user => user.email === email);
        const usernameExists = users.some(user => user.username === username);
        
        if (emailExists) {
          setErrorMessage('Email already registered');
          setIsSubmitting(false);
          return;
        }
        
        if (usernameExists) {
          setErrorMessage('Username already taken');
          setIsSubmitting(false);
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email,
          username,
          fullName,
          password, // In a real app, this would be encrypted
          createdAt: new Date().toISOString(),
          profileImageUrl: '',
          bio: '',
          postCount: 0,
          followerCount: 0,
          followingCount: 0
        };
        
        // Add user to list and log them in
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        
        if (localStorageAvailable) {
          localStorage.setItem('peakshare_current_user', JSON.stringify(newUser));
          localStorage.setItem('peakshare_has_seen_welcome', 'true');
        }
        
        setIsLoggedIn(true);
        setAuthMode(null);
        setShowWelcomeScreen(false);
        
      } else {
        // Validate login fields
        if (!email || !password) {
          setErrorMessage('Email and password are required');
          setIsSubmitting(false);
          return;
        }
        
        // Find user by email
        const user = users.find(user => user.email === email);
        
        if (!user) {
          setErrorMessage('User not found');
          setIsSubmitting(false);
          return;
        }
        
        if (user.password !== password) {
          setErrorMessage('Incorrect password');
          setIsSubmitting(false);
          return;
        }
        
        // Log in user
        setCurrentUser(user);
        setUsername(user.username);
        setFullName(user.fullName);
        
        if (localStorageAvailable) {
          localStorage.setItem('peakshare_current_user', JSON.stringify(user));
          localStorage.setItem('peakshare_has_seen_welcome', 'true');
        }
        
        setIsLoggedIn(true);
        setAuthMode(null);
        setShowWelcomeScreen(false);
      }
      
      // Reset form and state
      setIsSubmitting(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Only clear these if signing up
      if (isSignUp) {
        setFullName('');
        setUsername('');
      }
    };
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.authModal}>
          <Text style={styles.authTitle}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
          
          {/* Error message display */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          
          {isSignUp && (
            <>
              <TextInput
                style={styles.authInput}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                editable={!isSubmitting}
              />
              <TextInput
                style={styles.authInput}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </>
          )}
          
          <TextInput
            style={styles.authInput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          
          <TextInput
            style={styles.authInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
          />
          
          {isSignUp && (
            <TextInput
              style={styles.authInput}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isSubmitting}
            />
          )}
          
          <TouchableOpacity 
            style={[styles.authButton, isSubmitting && styles.authButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.authButtonText}>
              {isSubmitting ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.switchAuthMode}
            onPress={() => {
              setAuthMode(isSignUp ? 'login' : 'signup');
              setErrorMessage('');
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.switchAuthModeText, isSubmitting && styles.textDisabled]}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : 'Don\'t have an account? Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setAuthMode(null);
              setErrorMessage('');
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.closeButtonText, isSubmitting && styles.textDisabled]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render profile tab (simplified)
  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {isLoggedIn ? (currentUser?.username?.charAt(0).toUpperCase() || 'U') : 'G'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.profileName}>
            {isLoggedIn ? (currentUser?.fullName || currentUser?.username || "User") : "Guest User"}
          </Text>
          <Text style={styles.profileBio}>
            {isLoggedIn ? "@" + (currentUser?.username || "username") : "Welcome to PeakShare"}
          </Text>
          
          {isLoggedIn ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                // Log out user
                setIsLoggedIn(false);
                setCurrentUser(null);
                
                // Remove from local storage
                if (localStorageAvailable) {
                  localStorage.removeItem('peakshare_current_user');
                }
              }}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.loginButtonProfile}
                onPress={() => setAuthMode('login')}
              >
                <Text style={styles.loginButtonTextProfile}>Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.signupButtonProfile}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={styles.signupButtonTextProfile}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statBox} onPress={() => isLoggedIn && setActiveTab('feed')}>
            <Text style={styles.statBoxValue}>
              {isLoggedIn ? getUserStats(currentUser.id).postCount : '0'}
            </Text>
            <Text style={styles.statBoxLabel}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statBox} 
            onPress={() => isLoggedIn && setShowFollowersModal(true)}
          >
            <Text style={styles.statBoxValue}>
              {isLoggedIn ? getUserStats(currentUser.id).followerCount : '0'}
            </Text>
            <Text style={styles.statBoxLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statBox} 
            onPress={() => isLoggedIn && setShowFollowingModal(true)}
          >
            <Text style={styles.statBoxValue}>
              {isLoggedIn ? getUserStats(currentUser.id).followingCount : '0'}
            </Text>
            <Text style={styles.statBoxLabel}>Following</Text>
          </TouchableOpacity>
        </View>
        
        {isLoggedIn && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <View style={styles.activityEmptyState}>
              <Text style={styles.activityEmptyText}>
                {getUserStats(currentUser.id).postCount > 0 
                  ? 'Your posts will appear in the Feed tab'
                  : 'No posts yet. Share your first ski experience!'}
              </Text>
              <TouchableOpacity 
                style={styles.newPostButton}
                onPress={() => setActiveTab('feed')}
              >
                <Text style={styles.newPostButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>About PeakShare</Text>
          <Text style={styles.infoCardText}>
            PeakShare is a social platform for ski and snowboard enthusiasts.
            Share your mountain experiences, discover new resorts, check snow conditions, 
            and connect with other winter sports fans.
          </Text>
        </View>
        
        <View style={styles.featuredResorts}>
          <Text style={styles.featuredResortsTitle}>Featured Resorts</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.featuredResortsList}>
            {SAMPLE_RESORTS.slice(0, 3).map(resort => (
              <TouchableOpacity 
                key={resort.id} 
                style={styles.featuredResortCard}
                onPress={() => setSelectedResort(resort)}
              >
                <Image source={{ uri: resort.imageUrl }} style={styles.featuredResortImage} />
                <Text style={styles.featuredResortName}>{resort.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
  
  // Render user list for followers/following modals
  const renderUserListItem = (user, isFollowers = true) => (
    <View style={styles.userListItem} key={user.id}>
      <View style={styles.userListItemLeft}>
        <View style={styles.userAvatarSmall}>
          <Text style={styles.userInitialsSmall}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userListItemInfo}>
          <Text style={styles.userListItemName}>{user.fullName}</Text>
          <Text style={styles.userListItemUsername}>@{user.username}</Text>
        </View>
      </View>
      
      {user.id !== currentUser?.id && (
        <TouchableOpacity 
          style={[
            styles.followButton, 
            isFollowing(user.id) && styles.followingButton
          ]}
          onPress={() => toggleFollow(user.id)}
        >
          <Text style={[
            styles.followButtonText,
            isFollowing(user.id) && styles.followingButtonText
          ]}>
            {isFollowing(user.id) ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render followers modal
  const renderFollowersModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.usersModal}>
        <View style={styles.usersModalHeader}>
          <Text style={styles.usersModalTitle}>Followers</Text>
          <TouchableOpacity 
            style={styles.usersModalClose}
            onPress={() => setShowFollowersModal(false)}
          >
            <Text style={styles.usersModalCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.usersList}>
          {getFollowers().length > 0 ? (
            getFollowers().map(user => renderUserListItem(user, true))
          ) : (
            <Text style={styles.emptyListText}>No followers yet</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
  
  // Render following modal
  const renderFollowingModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.usersModal}>
        <View style={styles.usersModalHeader}>
          <Text style={styles.usersModalTitle}>Following</Text>
          <TouchableOpacity 
            style={styles.usersModalClose}
            onPress={() => setShowFollowingModal(false)}
          >
            <Text style={styles.usersModalCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.usersList}>
          {getFollowing().length > 0 ? (
            getFollowing().map(user => renderUserListItem(user, false))
          ) : (
            <Text style={styles.emptyListText}>Not following anyone yet</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
  
  // Welcome Screen Component
  const renderWelcomeScreen = () => {
    const handleContinueAsGuest = () => {
      if (localStorageAvailable) {
        localStorage.setItem('peakshare_has_seen_welcome', 'true');
      }
      setShowWelcomeScreen(false);
    };
    
    const handleSignIn = () => {
      setAuthMode('login');
    };
    
    const handleSignUp = () => {
      setAuthMode('signup');
    };
    
    return (
      <View style={styles.welcomeContainer}>
        <MountainBackground />
        
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeLogoContainer}>
            <Text style={styles.welcomeLogoText}>PeakShare</Text>
            <View style={styles.welcomeLogoIcon}>
              <Text style={styles.welcomeLogoIconText}>⛷️</Text>
            </View>
          </View>
          
          <Text style={styles.welcomeTitle}>Welcome to PeakShare</Text>
          <Text style={styles.welcomeSubtitle}>
            Connect with skiing and snowboarding enthusiasts, share your mountain experiences, 
            and discover new resorts around the world.
          </Text>
          
          <View style={styles.welcomeButtons}>
            <TouchableOpacity 
              style={styles.welcomeSignUpButton}
              onPress={handleSignUp}
            >
              <Text style={styles.welcomeSignUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.welcomeSignInButton}
              onPress={handleSignIn}
            >
              <Text style={styles.welcomeSignInButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.welcomeGuestButton}
              onPress={handleContinueAsGuest}
            >
              <Text style={styles.welcomeGuestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Auth Modal Overlay - shows when authMode is set */}
        {authMode && renderAuthModal()}
      </View>
    );
  };
  
  // If welcome screen should be shown, render it
  if (showWelcomeScreen) {
    return renderWelcomeScreen();
  }
  
  // If a resort is selected, show its detail page
  if (selectedResort) {
    return renderResortDetail();
  }
  
  // Main application view with tabs
  return (
    <View style={styles.container}>
      {/* Mountain Background */}
      <MountainBackground />
      
      {/* App Header with Logo and Auth Status */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PeakShare</Text>
        {isLoggedIn ? (
          <TouchableOpacity 
            onPress={() => setActiveTab('profile')}
            style={styles.userAvatarButton}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.headerLoginButton}
            onPress={() => setAuthMode('login')}
          >
            <Text style={styles.headerLoginText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Top Tab Bar */}
      <View style={styles.topTabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'explore' && styles.activeTabButton]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'explore' && styles.activeTabText]}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'feed' && styles.activeTabButton]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'feed' && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'explore' && renderExploreTab()}
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </View>
      
      {/* Modals */}
      {authMode && renderAuthModal()}
      {showFollowersModal && renderFollowersModal()}
      {showFollowingModal && renderFollowingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container and layout
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 0,
  },
  header: {
    height: 60,
    backgroundColor: 'rgba(0, 119, 204, 0.9)',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    position: 'relative',
    zIndex: 5,
  },
  // Top tab bar
  topTabBar: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
    zIndex: 9,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#0077cc',
  },
  tabButtonText: {
    color: '#888',
    fontSize: 15,
  },
  activeTabText: {
    color: '#0077cc',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    position: 'relative',
    zIndex: 8,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  
  // Search bar
  searchBar: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  
  // Resort Cards
  resortsList: {
    flex: 1,
    padding: 10,
  },
  resortCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resortImage: {
    width: '100%',
    height: 180,
  },
  resortInfo: {
    padding: 15,
  },
  resortName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resortLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resortStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resortStat: {
    alignItems: 'center',
    marginRight: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0077cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  
  // Resort Detail
  detailContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detailHeader: {
    height: 60,
    backgroundColor: '#0077cc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  detailTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  detailContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 240,
  },
  detailInfo: {
    padding: 15,
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077cc',
    marginRight: 5,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#888',
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weatherItem: {
    marginRight: 20,
    marginBottom: 10,
    minWidth: 80,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0077cc',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#888',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  
  // Feed Tab
  emptyFeed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyFeedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyFeedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    maxWidth: 300,
    lineHeight: 22,
  },
  
  // Profile Tab
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0077cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  authButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  loginButtonProfile: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  loginButtonTextProfile: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  signupButtonProfile: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0077cc',
    minWidth: 100,
    alignItems: 'center',
  },
  signupButtonTextProfile: {
    color: '#0077cc',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityEmptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  activityEmptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 20,
  },
  newPostButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  newPostButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 15,
    padding: 18,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  // Featured resorts in profile
  featuredResorts: {
    padding: 15,
    backgroundColor: 'white',
    marginTop: 15,
    marginBottom: 20,
  },
  featuredResortsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuredResortsList: {
    flexDirection: 'row',
  },
  featuredResortCard: {
    width: 150,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuredResortImage: {
    width: '100%',
    height: 100,
  },
  featuredResortName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
  },
  
  // Login related styles
  loginPrompt: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#0077cc',
    borderRadius: 4,
  },
  loginPromptText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Auth modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  authModal: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#B71C1C',
    fontSize: 14,
    textAlign: 'center',
  },
  authInput: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  authButton: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  authButtonDisabled: {
    backgroundColor: '#7fb9e2',
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchAuthMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthModeText: {
    color: '#0077cc',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 8,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  textDisabled: {
    color: '#aaa',
  },
  
  // User list modals
  usersModal: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  usersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  usersModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  usersModalClose: {
    padding: 5,
  },
  usersModalCloseText: {
    fontSize: 22,
    color: '#888',
    fontWeight: 'bold',
  },
  usersList: {
    paddingHorizontal: 15,
  },
  userListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0077cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userInitialsSmall: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userListItemInfo: {
    flexDirection: 'column',
  },
  userListItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  userListItemUsername: {
    fontSize: 13,
    color: '#888',
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0077cc',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#0077cc',
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  followingButton: {
    backgroundColor: 'white',
    borderColor: '#0077cc',
  },
  followingButtonText: {
    color: '#0077cc',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  
  // Feed and Post styles
  newPostContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  newPostInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  selectedResortTag: {
    flexDirection: 'row',
    backgroundColor: '#e6f7ff',
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedResortText: {
    color: '#0077cc',
    fontSize: 13,
    marginRight: 5,
  },
  removeResortText: {
    color: '#0077cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagResortButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tagResortButtonText: {
    color: '#0077cc',
    fontSize: 14,
  },
  postButton: {
    backgroundColor: '#0077cc',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 80,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feedScroll: {
    flex: 1,
  },
  postCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  postResortTag: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  postResortTagText: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  postAction: {
    marginRight: 20,
  },
  postActionText: {
    color: '#888',
    fontSize: 14,
  },
  feedSignInButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  feedSignInButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Resort selector styles
  resortSelectorList: {
    padding: 10,
    maxHeight: 400,
  },
  resortSelectorItem: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resortSelectorImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
  },
  resortSelectorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resortSelectorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resortSelectorLocation: {
    fontSize: 13,
    color: '#888',
  },
  
  // Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  welcomeContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    marginHorizontal: 'auto',
    zIndex: 2,
  },
  welcomeLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeLogoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0077cc',
    marginRight: 10,
  },
  welcomeLogoIcon: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeLogoIconText: {
    fontSize: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 400,
  },
  welcomeButtons: {
    width: '100%',
    maxWidth: 300,
  },
  welcomeSignUpButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeSignUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeSignInButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0077cc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeSignInButtonText: {
    color: '#0077cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeGuestButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  welcomeGuestButtonText: {
    color: '#888',
    fontSize: 14,
  },
  
  // Mountain Background Styles
  mountainBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  mountain1: {
    position: 'absolute',
    width: '70%',
    height: '35%',
    backgroundColor: '#e0e5eb',
    bottom: 0,
    left: '5%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 150,
    transform: [{ scaleX: 1.5 }],
    zIndex: 1,
  },
  mountain2: {
    position: 'absolute',
    width: '60%',
    height: '30%',
    backgroundColor: '#d0d5dc',
    bottom: 0,
    right: '-10%',
    borderTopLeftRadius: 150,
    borderTopRightRadius: 50,
    transform: [{ scaleX: 1.3 }],
    zIndex: 2,
  },
  mountain3: {
    position: 'absolute',
    width: '55%',
    height: '25%',
    backgroundColor: '#c0c5cc',
    bottom: 0,
    left: '25%',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    transform: [{ scaleX: 1.4 }],
    zIndex: 3,
  },
  // Header user controls
  userAvatarButton: {
    marginLeft: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#005299',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerLoginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  headerLoginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});