import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, ImageBackground, ActivityIndicator } from 'react-native';
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
  
  // Sample demo users (for first-time visitors)
  const SAMPLE_USERS = [
    {
      id: 'user1',
      email: 'alex@example.com',
      username: 'alexski',
      fullName: 'Alex Patterson',
      password: 'password123',
      createdAt: '2023-11-10T14:30:00Z',
      profileImageUrl: '',
      bio: 'Skiing enthusiast from Colorado. Love hitting the powder!',
      postCount: 3,
      followerCount: 120,
      followingCount: 85
    },
    {
      id: 'user2',
      email: 'emma@example.com',
      username: 'emma_slopes',
      fullName: 'Emma Johnson',
      password: 'password123',
      createdAt: '2023-10-15T11:20:00Z',
      profileImageUrl: '',
      bio: 'Snowboarding is my passion. Always chasing winter!',
      postCount: 4,
      followerCount: 210,
      followingCount: 93
    },
    {
      id: 'user3',
      email: 'mike@example.com',
      username: 'mountain_mike',
      fullName: 'Mike Chen',
      password: 'password123',
      createdAt: '2023-12-05T09:45:00Z',
      profileImageUrl: '',
      bio: 'Backcountry skier and photographer',
      postCount: 5,
      followerCount: 320,
      followingCount: 102
    }
  ];

  // Sample demo posts (for first-time visitors)
  const SAMPLE_POSTS = [
    {
      id: 'post1',
      userId: 'user1',
      content: 'Amazing day at Whistler Blackcomb! Fresh powder and blue skies - doesn\'t get better than this! ⛷️☀️ #PowderDay',
      resortId: '1',
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 28,
      comments: [
        {
          id: 'comment1',
          userId: 'user2',
          content: 'Looks incredible! How many inches of fresh powder did you get?',
          createdAt: '2024-01-15T11:45:00Z'
        },
        {
          id: 'comment2',
          userId: 'user3',
          content: 'Jealous! I need to plan a trip to Whistler soon.',
          createdAt: '2024-01-15T14:20:00Z'
        }
      ],
      likedBy: ['user2', 'user3']
    },
    {
      id: 'post2',
      userId: 'user2',
      content: 'Carved some perfect lines at Aspen today. The conditions were absolutely perfect for some serious speed runs! 🏂💨 #Snowboarding #SpeedRuns',
      resortId: '2',
      imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: '2024-01-18T15:45:00Z',
      likes: 42,
      comments: [
        {
          id: 'comment3',
          userId: 'user1',
          content: 'Those runs at Aspen are legendary! Did you hit the terrain park too?',
          createdAt: '2024-01-18T16:30:00Z'
        }
      ],
      likedBy: ['user1', 'user3']
    },
    {
      id: 'post3',
      userId: 'user3',
      content: 'Just conquered the back bowls at Vail! Challenging terrain but the views were worth every turn. Anyone else been there recently? #BackBowls #EpicViews',
      resortId: '3',
      imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: '2024-01-20T11:15:00Z',
      likes: 37,
      comments: [
        {
          id: 'comment4',
          userId: 'user2',
          content: 'I was there last month! The back bowls are a real test of skill. What was your favorite run?',
          createdAt: '2024-01-20T12:05:00Z'
        },
        {
          id: 'comment5',
          userId: 'user1',
          content: 'Beautiful shot! The view alone is worth the trip.',
          createdAt: '2024-01-20T13:45:00Z'
        },
        {
          id: 'comment6',
          userId: 'user3',
          content: 'Thanks everyone! @user2 I really enjoyed Sun Down Bowl - definitely challenging but so rewarding!',
          createdAt: '2024-01-20T15:30:00Z'
        }
      ],
      likedBy: ['user1', 'user2']
    },
    {
      id: 'post4',
      userId: 'user1',
      content: 'Nothing beats spring skiing at Park City! Soft snow and sunny weather made for the perfect day on the slopes. ☀️⛷️ #SpringSkiing',
      resortId: '3',
      createdAt: '2024-01-25T14:20:00Z',
      likes: 19,
      comments: [],
      likedBy: ['user2']
    },
    {
      id: 'post5',
      userId: 'user2',
      content: 'Just experienced the most incredible powder day at Niseko! The Japan powder lives up to the hype! 30cm of fresh snow overnight. 🏂❄️ #JapanPowder #PowderHeaven',
      resortId: '5',
      imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      createdAt: '2024-01-28T08:10:00Z',
      likes: 53,
      comments: [],
      likedBy: ['user1', 'user3']
    }
  ];

  // Sample demo follows (for first-time visitors)
  const SAMPLE_FOLLOWS = [
    {
      id: 'follow1',
      followerId: 'user1',
      followingId: 'user2',
      createdAt: '2023-12-10T08:30:00Z'
    },
    {
      id: 'follow2',
      followerId: 'user1',
      followingId: 'user3',
      createdAt: '2023-12-15T14:20:00Z'
    },
    {
      id: 'follow3',
      followerId: 'user2',
      followingId: 'user1',
      createdAt: '2023-12-12T11:45:00Z'
    },
    {
      id: 'follow4',
      followerId: 'user2',
      followingId: 'user3',
      createdAt: '2023-12-18T16:30:00Z'
    },
    {
      id: 'follow5',
      followerId: 'user3',
      followingId: 'user1',
      createdAt: '2023-12-20T09:15:00Z'
    }
  ];

  // Load data from local storage on mount
  useEffect(() => {
    if (localStorageAvailable) {
      // Check if user has seen welcome screen
      const hasSeenWelcome = localStorage.getItem('peakshare_has_seen_welcome');
      if (hasSeenWelcome === 'true') {
        setShowWelcomeScreen(false);
      }
      
      // Load registered users or initialize with samples if empty
      const storedUsers = localStorage.getItem('peakshare_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(SAMPLE_USERS);
        localStorage.setItem('peakshare_users', JSON.stringify(SAMPLE_USERS));
      }
      
      // Load posts or initialize with samples if empty
      const storedPosts = localStorage.getItem('peakshare_posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        setPosts(SAMPLE_POSTS);
        localStorage.setItem('peakshare_posts', JSON.stringify(SAMPLE_POSTS));
      }
      
      // Load follows or initialize with samples if empty
      const storedFollows = localStorage.getItem('peakshare_follows');
      if (storedFollows) {
        setFollows(JSON.parse(storedFollows));
      } else {
        setFollows(SAMPLE_FOLLOWS);
        localStorage.setItem('peakshare_follows', JSON.stringify(SAMPLE_FOLLOWS));
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
  
  // Add comment to a post
  const addComment = (postId) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: newComment,
      createdAt: new Date().toISOString()
    };
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), comment]
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    setNewComment('');
  };
  
  // Delete comment from a post
  const deleteComment = (postId, commentId) => {
    if (!isLoggedIn) return;
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId)
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };
  
  // Delete a post
  const deletePost = (postId) => {
    if (!isLoggedIn) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    // Filter out the post to delete
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    
    // Close comments view if it was open for the deleted post
    if (showComments === postId) {
      setShowComments(null);
    }
    
    // If viewing profile modal and this was the last post, update stats
    if (viewingProfile) {
      const remainingUserPosts = updatedPosts.filter(post => post.userId === viewingProfile.id);
      if (remainingUserPosts.length === 0) {
        // Refresh the profile view
        setViewingProfile({...viewingProfile});
      }
    }
    
    // If viewing full profile and this was the last post, update stats
    if (viewingFullProfile) {
      const remainingUserPosts = updatedPosts.filter(post => post.userId === viewingFullProfile.id);
      if (remainingUserPosts.length === 0) {
        // Refresh the full profile view
        setViewingFullProfile({...viewingFullProfile});
      }
    }
  };
  
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
  const createPost = (content, resortId, imageUrl = null) => {
    if (!currentUser) {
      setAuthMode('login');
      return;
    }
    
    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content,
      resortId,
      imageUrl, // Image URL from the file input
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: []
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
  
  // State for feed tab
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedResortForPost, setSelectedResortForPost] = useState(null);
  const [showResortSelector, setShowResortSelector] = useState(false);
  const [feedActiveTab, setFeedActiveTab] = useState('following'); // following or global
  const [showComments, setShowComments] = useState(null); // post ID for which comments are shown
  const [newComment, setNewComment] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null); // User being viewed in profile modal
  const [selectedImage, setSelectedImage] = useState(null); // Selected image for new post
  const [isUploadingImage, setIsUploadingImage] = useState(false); // Flag for image upload
  const fileInputRef = useRef(null); // Reference to the file input
  const [viewingFullProfile, setViewingFullProfile] = useState(null); // User for full profile view
  
  // Render feed tab with real posts
  // Format post content with hashtag highlighting
  const formatPostContent = (content) => {
    if (!content) return null;
    
    // Split by hashtags and create an array of text and hashtags
    const parts = content.split(/(#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Text key={index} style={styles.postHashtag}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };
  
  const renderFeedTab = () => {
    
    // Handle file selection
    const handleImageSelect = (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage({
          file,
          url: imageUrl
        });
      }
    };
    
    // Handle image upload button click
    const handleImageButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    // Remove selected image
    const handleRemoveImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    const handleCreatePost = () => {
      if (!newPostContent.trim() && !selectedImage) return;
      
      createPost(
        newPostContent, 
        selectedResortForPost ? selectedResortForPost.id : null,
        selectedImage ? selectedImage.url : null
      );
      
      setNewPostContent('');
      setSelectedResortForPost(null);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    // Get user's posts and posts from users they follow (for Following tab)
    const followingPosts = isLoggedIn 
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
      
    // Get all posts (for Global tab)  
    const globalPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    // Determine which posts to display based on active tab
    const displayPosts = feedActiveTab === 'following' ? followingPosts : globalPosts;
    
    // Toggle like on a post
    const toggleLike = (postId) => {
      if (!isLoggedIn) {
        setAuthMode('login');
        return;
      }
      
      // Find the post
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          // Check if user already liked the post
          const hasLiked = post.likedBy?.includes(currentUser.id);
          
          if (hasLiked) {
            // Unlike
            return {
              ...post,
              likes: Math.max(0, post.likes - 1),
              likedBy: post.likedBy.filter(id => id !== currentUser.id)
            };
          } else {
            // Like
            return {
              ...post,
              likes: post.likes + 1,
              likedBy: [...(post.likedBy || []), currentUser.id]
            };
          }
        }
        return post;
      });
      
      setPosts(updatedPosts);
    };
    
    const renderPostItem = (post) => {
      const postUser = users.find(user => user.id === post.userId);
      const postResort = post.resortId 
        ? SAMPLE_RESORTS.find(resort => resort.id === post.resortId)
        : null;
      
      // Check if current user has liked this post
      const isLiked = isLoggedIn && post.likedBy?.includes(currentUser.id);
      
      // Format date
      const postDate = new Date(post.createdAt);
      const now = new Date();
      const diffMs = now - postDate;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let timeAgo;
      if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`;
      } else if (diffDays < 30) {
        timeAgo = `${diffDays}d ago`;
      } else {
        timeAgo = postDate.toLocaleDateString();
      }
      
      return (
        <View style={styles.postCard} key={post.id}>
          <TouchableOpacity 
            style={styles.postHeader}
            onPress={() => {
              if (postUser) {
                setViewingProfile(postUser);
              }
            }}
          >
            <View style={styles.postHeaderLeft}>
              <View style={styles.userAvatarSmall}>
                <Text style={styles.userInitialsSmall}>
                  {postUser?.username.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.postUserName}>{postUser?.fullName || 'Unknown User'}</Text>
                <Text style={styles.postTime}>
                  {timeAgo}
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
          </TouchableOpacity>
          
          {/* Add post menu/options for current user's posts */}
          {isLoggedIn && postUser?.id === currentUser.id && (
            <TouchableOpacity 
              style={styles.postOptionsButton}
              onPress={() => deletePost(post.id)}
            >
              <Text style={styles.postOptionsButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.postContent}>
            {formatPostContent(post.content)}
          </View>
          
          {/* Post image (if available) */}
          {post.imageUrl && (
            <View style={styles.postImageContainer}>
              <Image 
                source={{ uri: post.imageUrl }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            </View>
          )}
          
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.postAction}
              onPress={() => toggleLike(post.id)}
            >
              <Text style={[
                styles.postActionText,
                isLiked && styles.postActionTextActive
              ]}>
                {isLiked ? '❤️' : '♡'} {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.postAction}
              onPress={() => setShowComments(post.id === showComments ? null : post.id)}
            >
              <Text style={[
                styles.postActionText, 
                showComments === post.id && styles.postActionTextActive
              ]}>
                💬 {post.comments?.length || 0}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Comments Section - only show for the selected post */}
          {showComments === post.id && (
            <View style={styles.commentsSection}>
              <View style={styles.commentsList}>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map(comment => {
                    const commentUser = users.find(u => u.id === comment.userId);
                    return (
                      <View key={comment.id} style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                          <TouchableOpacity
                            style={styles.commentUser}
                            onPress={() => commentUser && setViewingProfile(commentUser)}
                          >
                            <View style={styles.commentUserAvatar}>
                              <Text style={styles.commentUserInitials}>
                                {commentUser?.username.charAt(0).toUpperCase() || '?'}
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.commentUserName}>
                                {commentUser?.fullName || 'Unknown User'}
                              </Text>
                              <Text style={styles.commentTime}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          
                          {/* Delete button for own comments */}
                          {isLoggedIn && commentUser?.id === currentUser.id && (
                            <TouchableOpacity
                              style={styles.deleteCommentButton}
                              onPress={() => deleteComment(post.id, comment.id)}
                            >
                              <Text style={styles.deleteCommentText}>×</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        <Text style={styles.commentContent}>{comment.content}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                )}
              </View>
              
              {/* Add comment form */}
              {isLoggedIn && (
                <View style={styles.addCommentForm}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addCommentButton,
                      !newComment.trim() && styles.addCommentButtonDisabled
                    ]}
                    disabled={!newComment.trim()}
                    onPress={() => addComment(post.id)}
                  >
                    <Text style={styles.addCommentButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      );
    };
    
    return (
      <View style={styles.tabContent}>
        {isLoggedIn ? (
          <>
            <View style={styles.newPostContainer}>
              <View style={styles.newPostHeader}>
                <View style={styles.userAvatarSmall}>
                  <Text style={styles.userInitialsSmall}>
                    {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <Text style={styles.newPostPrompt}>What's on your mind, {currentUser?.fullName?.split(' ')[0] || 'skier'}?</Text>
              </View>
              
              <TextInput
                style={styles.newPostInput}
                placeholder="Share your skiing experience... (Try using #hashtags!)"
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={3}
              />
              
              {/* Image preview */}
              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: selectedImage.url }} 
                    style={styles.imagePreview} 
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                  >
                    <Text style={styles.removeImageButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.newPostFooter}>
                <View style={styles.newPostOptions}>
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
                      <Text style={styles.tagResortButtonText}>⛰️ Tag Resort</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  
                  {/* Image upload button */}
                  {!selectedImage && (
                    <TouchableOpacity 
                      style={styles.addImageButton}
                      onPress={handleImageButtonClick}
                    >
                      <Text style={styles.addImageButtonText}>📷 Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.postButton, 
                    (!newPostContent.trim() && !selectedImage) && styles.postButtonDisabled
                  ]}
                  onPress={handleCreatePost}
                  disabled={!newPostContent.trim() && !selectedImage}
                >
                  <Text style={styles.postButtonText}>Share Post</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Feed Tabs */}
            <View style={styles.feedTabs}>
              <TouchableOpacity 
                style={[styles.feedTab, feedActiveTab === 'following' && styles.activeFeedTab]}
                onPress={() => setFeedActiveTab('following')}
              >
                <Text style={[styles.feedTabText, feedActiveTab === 'following' && styles.activeFeedTabText]}>
                  Following
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.feedTab, feedActiveTab === 'global' && styles.activeFeedTab]}
                onPress={() => setFeedActiveTab('global')}
              >
                <Text style={[styles.feedTabText, feedActiveTab === 'global' && styles.activeFeedTabText]}>
                  Global
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.feedScroll}>
              {displayPosts.length > 0 ? (
                displayPosts.map(post => renderPostItem(post))
              ) : (
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyFeedTitle}>
                    {feedActiveTab === 'following' 
                      ? 'No Posts in Your Feed Yet'
                      : 'No Posts Yet'}
                  </Text>
                  <Text style={styles.emptyFeedText}>
                    {feedActiveTab === 'following'
                      ? 'Create your first post or follow other users to see their posts in your feed.'
                      : 'Be the first to share your skiing adventure!'}
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
  
  // Function to render the full profile page
  const renderFullProfilePage = () => {
    if (!viewingFullProfile) return null;
    
    // Get user stats
    const stats = getUserStats(viewingFullProfile.id);
    
    // Check if the current user is following this user
    const isFollowingUser = isLoggedIn ? 
      isFollowing(viewingFullProfile.id) : false;
    
    // Get user's posts
    const userPosts = posts
      .filter(post => post.userId === viewingFullProfile.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    // Get following and followers
    const userFollowers = follows
      .filter(follow => follow.followingId === viewingFullProfile.id)
      .map(follow => users.find(user => user.id === follow.followerId))
      .filter(Boolean);
      
    const userFollowing = follows
      .filter(follow => follow.followerId === viewingFullProfile.id)
      .map(follow => users.find(user => user.id === follow.followingId))
      .filter(Boolean);
    
    return (
      <View style={styles.container}>
        {/* Mountain Background */}
        <MountainBackground />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setViewingFullProfile(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{viewingFullProfile.fullName}'s Profile</Text>
          <View style={{width: 40}} /> {/* Empty view for spacing */}
        </View>
        
        <ScrollView style={styles.fullProfileContent}>
          {/* Profile Header with Avatar and Bio */}
          <View style={styles.fullProfileHeader}>
            <View style={styles.fullProfileAvatar}>
              <Text style={styles.fullProfileAvatarText}>
                {viewingFullProfile.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.fullProfileInfo}>
              <Text style={styles.fullProfileName}>{viewingFullProfile.fullName}</Text>
              <Text style={styles.fullProfileUsername}>@{viewingFullProfile.username}</Text>
              {viewingFullProfile.bio && (
                <Text style={styles.fullProfileBio}>{viewingFullProfile.bio}</Text>
              )}
              
              {isLoggedIn && viewingFullProfile.id !== currentUser?.id && (
                <TouchableOpacity
                  style={[
                    styles.followFullProfileButton,
                    isFollowingUser && styles.unfollowButton
                  ]}
                  onPress={() => toggleFollow(viewingFullProfile.id)}
                >
                  <Text style={[
                    styles.followFullProfileButtonText,
                    isFollowingUser && styles.unfollowButtonText
                  ]}>
                    {isFollowingUser ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Stats Row */}
          <View style={styles.fullProfileStatsRow}>
            <View style={styles.fullProfileStat}>
              <Text style={styles.fullProfileStatValue}>{stats.postCount}</Text>
              <Text style={styles.fullProfileStatLabel}>Posts</Text>
            </View>
            <TouchableOpacity style={styles.fullProfileStat}>
              <Text style={styles.fullProfileStatValue}>{stats.followerCount}</Text>
              <Text style={styles.fullProfileStatLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fullProfileStat}>
              <Text style={styles.fullProfileStatValue}>{stats.followingCount}</Text>
              <Text style={styles.fullProfileStatLabel}>Following</Text>
            </TouchableOpacity>
          </View>
          
          {/* Posts Section */}
          <View style={styles.fullProfilePosts}>
            <Text style={styles.fullProfileSectionTitle}>Posts</Text>
            {userPosts.length > 0 ? (
              userPosts.map(post => {
                const postResort = post.resortId 
                  ? SAMPLE_RESORTS.find(resort => resort.id === post.resortId)
                  : null;
                  
                return (
                  <View key={post.id} style={styles.fullProfilePostCard}>
                    <View style={styles.fullProfilePostHeader}>
                      <Text style={styles.fullProfilePostTime}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                      <View style={styles.fullProfilePostHeaderRight}>
                        {postResort && (
                          <TouchableOpacity
                            onPress={() => {
                              setViewingFullProfile(null);
                              setSelectedResort(postResort);
                            }}
                          >
                            <Text style={styles.fullProfilePostResort}>{postResort.name}</Text>
                          </TouchableOpacity>
                        )}
                        
                        {/* Delete option for user's own posts */}
                        {isLoggedIn && viewingFullProfile.id === currentUser?.id && (
                          <TouchableOpacity
                            style={styles.fullProfileDeleteButton}
                            onPress={() => deletePost(post.id)}
                          >
                            <Text style={styles.fullProfileDeleteButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.fullProfilePostContent}>
                      {formatPostContent(post.content)}
                    </View>
                    
                    {post.imageUrl && (
                      <View style={styles.fullProfilePostImageContainer}>
                        <Image 
                          source={{ uri: post.imageUrl }} 
                          style={styles.fullProfilePostImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                    
                    <View style={styles.fullProfilePostStats}>
                      <Text style={styles.fullProfilePostStat}>
                        ❤️ {post.likes}
                      </Text>
                      <Text style={styles.fullProfilePostStat}>
                        💬 {post.comments?.length || 0}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noPostsText}>No posts yet</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };
  
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
  
  // If viewing a full profile, show the full profile page
  if (viewingFullProfile) {
    return renderFullProfilePage();
  }
  
  // Render profile view modal
  const renderProfileModal = () => {
    if (!viewingProfile) return null;
    
    // Get user stats
    const stats = getUserStats(viewingProfile.id);
    
    // Check if the current user is following this user
    const isFollowingUser = isLoggedIn ? 
      isFollowing(viewingProfile.id) : false;
    
    // Get user's posts
    const userPosts = posts
      .filter(post => post.userId === viewingProfile.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.profileModal}>
          <View style={styles.profileModalHeader}>
            <View style={styles.profileHeaderContent}>
              <Text style={styles.profileModalTitle}>{viewingProfile.fullName}'s Profile</Text>
              <TouchableOpacity 
                style={styles.closeProfileButton}
                onPress={() => setViewingProfile(null)}
              >
                <Text style={styles.closeProfileText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.profileModalContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <View style={styles.profileModalAvatar}>
                  <Text style={styles.profileModalAvatarText}>
                    {viewingProfile.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.profileModalDetails}>
                  <Text style={styles.profileModalName}>{viewingProfile.fullName}</Text>
                  <Text style={styles.profileModalUsername}>@{viewingProfile.username}</Text>
                  {viewingProfile.bio && (
                    <Text style={styles.profileModalBio}>{viewingProfile.bio}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.profileActionRow}>
                {isLoggedIn && viewingProfile.id !== currentUser.id && (
                  <TouchableOpacity
                    style={[
                      styles.followActionButton,
                      isFollowingUser && styles.unfollowButton
                    ]}
                    onPress={() => toggleFollow(viewingProfile.id)}
                  >
                    <Text style={[
                      styles.followActionButtonText,
                      isFollowingUser && styles.unfollowButtonText
                    ]}>
                      {isFollowingUser ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.viewFullProfileButton}
                  onPress={() => {
                    setViewingFullProfile(viewingProfile);
                    setViewingProfile(null);
                  }}
                >
                  <Text style={styles.viewFullProfileButtonText}>View Full Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.profileStatsRow}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{stats.postCount}</Text>
                <Text style={styles.profileStatLabel}>Posts</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{stats.followerCount}</Text>
                <Text style={styles.profileStatLabel}>Followers</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{stats.followingCount}</Text>
                <Text style={styles.profileStatLabel}>Following</Text>
              </View>
            </View>
            
            <View style={styles.userPostsSection}>
              <Text style={styles.userPostsTitle}>Posts</Text>
              {userPosts.length > 0 ? (
                userPosts.map(post => {
                  const postResort = post.resortId 
                    ? SAMPLE_RESORTS.find(resort => resort.id === post.resortId)
                    : null;
                  
                  // Check if current user has liked this post
                  const isLiked = isLoggedIn && post.likedBy?.includes(currentUser.id);
                  
                  return (
                    <View key={post.id} style={styles.userPostCard}>
                      <View style={styles.userPostHeader}>
                        <Text style={styles.userPostTime}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                        {postResort && (
                          <Text style={styles.userPostResort}>{postResort.name}</Text>
                        )}
                      </View>
                      
                      <View style={styles.userPostContent}>
                        {formatPostContent(post.content)}
                      </View>
                      
                      {/* Post image in user profile (if available) */}
                      {post.imageUrl && (
                        <View style={styles.userPostImageContainer}>
                          <Image 
                            source={{ uri: post.imageUrl }} 
                            style={styles.userPostImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      
                      <View style={styles.userPostStats}>
                        <Text style={styles.userPostStat}>
                          {isLiked ? '❤️' : '♡'} {post.likes}
                        </Text>
                        <Text style={styles.userPostStat}>
                          💬 {post.comments?.length || 0}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noPostsText}>No posts yet</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };
  
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
      {viewingProfile && renderProfileModal()}
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
  
  // Profile Modal Styles
  profileModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileModalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 15,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeProfileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeProfileText: {
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  profileModalContent: {
    flex: 1,
  },
  profileSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileModalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0077cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileModalAvatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  profileModalDetails: {
    flex: 1,
  },
  profileModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  profileModalUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  profileModalBio: {
    fontSize: 14,
    color: '#444',
  },
  followActionButton: {
    backgroundColor: '#0077cc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  followActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unfollowButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0077cc',
  },
  unfollowButtonText: {
    color: '#0077cc',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  userPostsSection: {
    padding: 15,
  },
  userPostsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  userPostCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userPostTime: {
    fontSize: 12,
    color: '#666',
  },
  userPostResort: {
    fontSize: 12,
    color: '#0077cc',
    fontWeight: 'bold',
  },
  userPostContent: {
    marginBottom: 10,
  },
  userPostStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  userPostStat: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  noPostsText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Image upload and display styles
  imagePreviewContainer: {
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  addImageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  addImageButtonText: {
    color: '#555',
    fontSize: 14,
  },
  postImageContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 240,
  },
  userPostImageContainer: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  userPostImage: {
    width: '100%',
    height: 180,
  },
  
  // Post delete buttons
  postOptionsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30, 
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  postOptionsButtonText: {
    fontSize: 16,
    color: '#666',
  },
  fullProfilePostHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullProfileDeleteButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullProfileDeleteButtonText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Profile action row
  profileActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  viewFullProfileButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewFullProfileButtonText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Full profile page styles
  fullProfileContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullProfileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fullProfileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0077cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  fullProfileAvatarText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  fullProfileInfo: {
    flex: 1,
  },
  fullProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  fullProfileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  fullProfileBio: {
    fontSize: 14,
    color: '#444',
    marginBottom: 15,
    lineHeight: 20,
  },
  followFullProfileButton: {
    backgroundColor: '#0077cc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  followFullProfileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullProfileStatsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
  },
  fullProfileStat: {
    flex: 1,
    alignItems: 'center',
  },
  fullProfileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  fullProfileStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fullProfilePosts: {
    padding: 20,
  },
  fullProfileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  fullProfilePostCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
  },
  fullProfilePostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fullProfilePostTime: {
    fontSize: 14,
    color: '#888',
  },
  fullProfilePostResort: {
    fontSize: 14,
    color: '#0077cc',
    fontWeight: '500',
  },
  fullProfilePostContent: {
    marginBottom: 12,
  },
  fullProfilePostImageContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fullProfilePostImage: {
    width: '100%',
    height: 240,
  },
  fullProfilePostStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 5,
  },
  fullProfilePostStat: {
    fontSize: 14,
    color: '#666',
    marginRight: 20,
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
    paddingHorizontal: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  feedTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  feedTab: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  activeFeedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0077cc',
  },
  feedTabText: {
    fontSize: 15,
    color: '#777',
  },
  activeFeedTabText: {
    color: '#0077cc',
    fontWeight: 'bold',
  },
  newPostContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  newPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  newPostPrompt: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  newPostInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    fontSize: 16,
  },
  newPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newPostOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedResortTag: {
    flexDirection: 'row',
    backgroundColor: '#e6f7ff',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedResortText: {
    color: '#0077cc',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  removeResortText: {
    color: '#0077cc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagResortButton: {
    backgroundColor: '#f0f7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0e1f9',
  },
  tagResortButtonText: {
    color: '#0077cc',
    fontSize: 14,
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postButtonDisabled: {
    backgroundColor: '#bbb',
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
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 5,
  },
  postHashtag: {
    color: '#0077cc',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  postAction: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    color: '#888',
    fontSize: 14,
  },
  postActionTextActive: {
    color: '#e74c3c',
  },
  
  // Comments styles
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  commentsList: {
    padding: 10,
  },
  commentItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0077cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentUserInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  deleteCommentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCommentText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  noCommentsText: {
    color: '#999',
    textAlign: 'center',
    padding: 15,
    fontStyle: 'italic',
  },
  addCommentForm: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingHorizontal: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addCommentButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0077cc',
    borderRadius: 18,
  },
  addCommentButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addCommentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
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