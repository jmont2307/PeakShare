import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  Share,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Animated,
  useColorScheme
} from 'react-native';
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
// Using React Native's StatusBar instead of Expo's
import { StatusBar } from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// No need to import here, it's imported in index.js
import { theme as lightTheme } from './src/theme';

// Create dark theme based on light theme
const darkTheme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    primary: '#0A84FF',
    background: '#1C1C1E',
    surface: '#2C2C2E',
    text: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    error: '#FF453A',
    mountain: '#8E8E93',
    midnight: '#FFFFFF',
    silver: '#38383A',
    deepBlue: '#0A84FF',
    skyBlue: '#64D2FF',
    snow: '#1C1C1E',
    ice: '#2C2C2E',
  }
};

// Theme context
const ThemeContext = createContext();

// Auth context
const AuthUserContext = createContext();

// Sample data for the app
const SAMPLE_USERS = [
  {
    id: '1',
    username: 'YourStory',
    profileImageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    hasStory: false,
  },
  {
    id: '2',
    username: 'skiPro1',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    hasStory: true,
  },
  {
    id: '3',
    username: 'powderGirl',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    hasStory: true,
  },
  {
    id: '4',
    username: 'alpineRider',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    hasStory: true,
  },
  {
    id: '5',
    username: 'snowBro',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    hasStory: false,
  }
];

const SAMPLE_RESORTS = [
  {
    id: '1',
    name: 'Whistler',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    newSnow: 5
  },
  {
    id: '2',
    name: 'Aspen',
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    newSnow: 3
  },
  {
    id: '3',
    name: 'Park City',
    imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=60',
    newSnow: 8
  }
];

const SAMPLE_POSTS = [
  {
    id: '1',
    user: SAMPLE_USERS[1],
    imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { name: 'Whistler Blackcomb' },
    caption: 'Perfect powder day at Whistler today! #skiing #powderday',
    likeCount: 245,
    commentCount: 37,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    weather: { temperature: -2, conditions: 'Snowing' },
    liked: false,
    saved: false,
    comments: [
      { id: '1', user: SAMPLE_USERS[2], text: 'Looks amazing! Wish I was there!' },
      { id: '2', user: SAMPLE_USERS[4], text: 'Epic powder day!' }
    ]
  },
  {
    id: '2',
    user: SAMPLE_USERS[2],
    imageUrl: 'https://images.unsplash.com/photo-1549042261-f29e367fee85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { name: 'Aspen Snowmass' },
    caption: 'Blue bird day at Aspen! #skiing #bluebird',
    likeCount: 183,
    commentCount: 21,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    weather: { temperature: 5, conditions: 'Clear' },
    liked: true,
    saved: false,
    comments: [
      { id: '1', user: SAMPLE_USERS[1], text: 'What a view! 😍' },
      { id: '2', user: SAMPLE_USERS[3], text: 'Perfect conditions!' }
    ]
  }
];

// Story Circle Component with gradient border
const StoryCircle = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.storyContainer} onPress={onPress}>
      <View style={styles.storyCircleWrapper}>
        {user.hasStory ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.skyBlue, theme.colors.deepBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.storyCircleInner}>
              <Image 
                source={{ uri: user.profileImageUrl }} 
                style={styles.storyAvatar}
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.storyCircle, styles.inactiveStoryBorder]}>
            <Image 
              source={{ uri: user.profileImageUrl }} 
              style={styles.storyAvatar}
            />
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1} ellipsizeMode="tail">
        {user.username}
      </Text>
    </TouchableOpacity>
  );
};

// Resort Story Component
const ResortStory = ({ resort, onPress }) => {
  return (
    <TouchableOpacity style={styles.resortContainer} onPress={onPress}>
      <View style={styles.storyCircleWrapper}>
        <LinearGradient
          colors={[theme.colors.glacier, theme.colors.skyBlue, theme.colors.deepBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.storyCircleInner}>
            <Image 
              source={{ uri: resort.imageUrl }} 
              style={styles.storyAvatar}
            />
          </View>
        </LinearGradient>
        <View style={styles.snowBadge}>
          <Text style={styles.snowText}>{resort.newSnow}"</Text>
        </View>
      </View>
      <Text style={styles.storyUsername} numberOfLines={1} ellipsizeMode="tail">
        {resort.name}
      </Text>
    </TouchableOpacity>
  );
};

// Post Card Component
const PostCard = ({ post, onLike, onSave, onComment, onViewComments, onUserPress, onImagePress, onShare }) => {
  const formatTimestamp = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHrs >= 24) {
      return `${Math.floor(diffHrs / 24)} days ago`;
    } else if (diffHrs >= 1) {
      return `${diffHrs} hours ago`;
    } else {
      return `${diffMins} minutes ago`;
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => onUserPress(post.user)}
        >
          <Image 
            source={{ uri: post.user.profileImageUrl }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{post.user.username}</Text>
            {post.location && (
              <Text style={styles.location}>{post.location.name}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      {/* Post Image */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(post)}>
        <View style={styles.postImageContainer}>
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.weather && (
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherText}>
                {post.weather.conditions.toLowerCase().includes('snow') ? '❄️ ' : '☀️ '}
                {post.weather.temperature}° {post.weather.conditions}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={() => onLike(post.id)}>
            <Text style={[styles.actionIcon, post.liked && styles.liked]}>
              {post.liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onComment(post)}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onShare(post)}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => onSave(post.id)}>
          <Text style={styles.actionIcon}>{post.saved ? '🔖' : '🔖'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.likesCount}>{post.likeCount} likes</Text>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{post.user.username}</Text> {post.caption}
        </Text>
        {post.commentCount > 0 && (
          <TouchableOpacity onPress={() => onViewComments(post)}>
            <Text style={styles.viewComments}>
              View all {post.commentCount} comments
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timestamp}>
          {formatTimestamp(post.timestamp)}
        </Text>
      </View>
    </View>
  );
};

// Story Viewer Component
const StoryViewer = ({ visible, story, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.storyViewerContainer}>
        <View style={styles.storyViewerHeader}>
          <View style={styles.storyUserInfo}>
            <Image 
              source={{ uri: story?.user?.profileImageUrl }} 
              style={styles.storyViewerAvatar} 
            />
            <Text style={styles.storyViewerUsername}>{story?.user?.username}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Image 
          source={{ uri: story?.imageUrl }} 
          style={styles.storyViewerImage}
          resizeMode="cover"
        />
        
        <View style={styles.storyViewerFooter}>
          <TextInput
            style={styles.storyReplyInput}
            placeholder="Send message"
            placeholderTextColor={theme.colors.silver}
          />
        </View>
      </View>
    </Modal>
  );
};

// Comments Modal Component
const CommentsModal = ({ visible, post, onClose, onAddComment, onLikeComment }) => {
  const { theme } = useContext(ThemeContext);
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState({});
  
  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };
  
  const handleLikeComment = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    
    if (onLikeComment) {
      onLikeComment(post.id, commentId);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={[styles.commentsContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.commentsHeader, { borderBottomColor: theme.colors.silver }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.backButton, { color: theme.colors.midnight }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.commentsTitle, { color: theme.colors.midnight }]}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.colors.midnight }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={post?.comments}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={[styles.commentItem, { borderBottomColor: theme.colors.silver }]}>
                <TouchableOpacity>
                  <Image 
                    source={{ uri: item.user.profileImageUrl }} 
                    style={styles.commentAvatar} 
                  />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <Text style={[styles.commentUsername, { color: theme.colors.midnight }]}>{item.user.username}</Text>
                  <Text style={[styles.commentText, { color: theme.colors.midnight }]}>{item.text}</Text>
                  <View style={styles.commentActions}>
                    <Text style={[styles.commentTimestamp, { color: theme.colors.mountain }]}>2m</Text>
                    <TouchableOpacity>
                      <Text style={[styles.commentReply, { color: theme.colors.mountain }]}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.commentLikeButton}
                  onPress={() => handleLikeComment(item.id)}
                >
                  <Text style={[
                    styles.commentLikeIcon, 
                    likedComments[item.id] && { color: theme.colors.error }
                  ]}>
                    {likedComments[item.id] ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          
          <View style={[styles.commentInputContainer, { 
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.silver 
          }]}>
            <Image 
              source={{ uri: SAMPLE_USERS[0].profileImageUrl }} 
              style={styles.commentInputAvatar} 
            />
            <TextInput
              style={[styles.commentInput, { color: theme.colors.midnight }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.mountain}
              value={commentText}
              onChangeText={setCommentText}
              autoFocus={true}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity
              disabled={!commentText.trim()}
              style={[
                styles.postButton,
                !commentText.trim() && styles.postButtonDisabled
              ]}
              onPress={handleAddComment}
            >
              <Text style={[styles.postButtonText, { color: theme.colors.primary }]}>Post</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// TabBar Item Component
const TabBarItem = ({ icon, isActive, onPress }) => {
  return (
    <TouchableOpacity style={styles.tabBarItem} onPress={onPress}>
      <Text style={[styles.tabIcon, isActive && styles.activeTab]}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

// Profile Edit Modal Component
const ProfileEditModal = ({ visible, onClose, userData, onSave }) => {
  const { theme } = useContext(ThemeContext);
  const [fullName, setFullName] = useState(userData?.fullName || '');
  const [username, setUsername] = useState(userData?.username || '');
  const [bio, setBio] = useState(userData?.bio || 'Skiing enthusiast | 15 resorts visited this season | Follow for daily snow updates ❄️');
  const [website, setWebsite] = useState(userData?.website || '');
  
  const handleSaveProfile = () => {
    const updatedProfile = {
      ...userData,
      fullName,
      username,
      bio,
      website
    };
    
    onSave(updatedProfile);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.editProfileContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.editProfileHeader, { borderBottomColor: theme.colors.silver }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.midnight }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.editProfileTitle, { color: theme.colors.midnight }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile}>
            <Text style={[styles.saveButton, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.editProfileContent}>
          <View style={styles.profilePictureEdit}>
            <Image 
              source={{ uri: userData?.profileImageUrl }} 
              style={styles.editProfileImage}
            />
            <TouchableOpacity>
              <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
                Change Profile Photo
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.editFieldContainer}>
            <Text style={[styles.editFieldLabel, { color: theme.colors.mountain }]}>Name</Text>
            <TextInput
              style={[styles.editField, { color: theme.colors.midnight }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={theme.colors.mountain}
            />
          </View>
          
          <View style={styles.editFieldContainer}>
            <Text style={[styles.editFieldLabel, { color: theme.colors.mountain }]}>Username</Text>
            <TextInput
              style={[styles.editField, { color: theme.colors.midnight }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              placeholderTextColor={theme.colors.mountain}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.editFieldContainer}>
            <Text style={[styles.editFieldLabel, { color: theme.colors.mountain }]}>Bio</Text>
            <TextInput
              style={[styles.editBioField, { color: theme.colors.midnight }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself and your skiing passion..."
              placeholderTextColor={theme.colors.mountain}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.editFieldContainer}>
            <Text style={[styles.editFieldLabel, { color: theme.colors.mountain }]}>Website</Text>
            <TextInput
              style={[styles.editField, { color: theme.colors.midnight }]}
              value={website}
              onChangeText={setWebsite}
              placeholder="Your website"
              placeholderTextColor={theme.colors.mountain}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.skiStatsEdit}>
            <Text style={[styles.skiStatsEditTitle, { color: theme.colors.midnight }]}>Skiing Stats</Text>
            <Text style={[styles.skiStatsEditDesc, { color: theme.colors.mountain }]}>
              These stats are automatically calculated based on your posts and activities
            </Text>
            
            <View style={[styles.skiStats, { backgroundColor: theme.colors.ice }]}>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>127</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Days on Snow</Text>
              </View>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>15</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Resorts</Text>
              </View>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>48,920</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Vertical ft</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Profile Screen Component
const ProfileScreen = ({ user, posts, isOwnProfile, onClose, onEditProfile }) => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // If we don't have posts passed in, use dummy data
  const userPosts = posts || [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: '4', imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: '5', imageUrl: 'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
    { id: '6', imageUrl: 'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  ];
  
  const handleSaveProfile = (updatedProfile) => {
    if (onEditProfile) {
      onEditProfile(updatedProfile);
    }
  };
  
  return (
    <Modal
      visible={!!user}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.profileContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.profileHeader, { borderBottomColor: theme.colors.silver }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.backButton, { color: theme.colors.midnight }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.profileUsername, { color: theme.colors.midnight }]}>{user?.username || ''}</Text>
          <TouchableOpacity>
            <Text style={[styles.menuIcon, { color: theme.colors.midnight }]}>⋯</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: user?.profileImageUrl }} 
                style={styles.profileImage}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.midnight }]}>{userPosts.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.mountain }]}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.midnight }]}>843</Text>
                <Text style={[styles.statLabel, { color: theme.colors.mountain }]}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.midnight }]}>428</Text>
                <Text style={[styles.statLabel, { color: theme.colors.mountain }]}>Following</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.bioContainer}>
            <Text style={[styles.realName, { color: theme.colors.midnight }]}>{user?.fullName || user?.username}</Text>
            <Text style={[styles.bioText, { color: theme.colors.midnight }]}>{user?.bio || 'Skiing enthusiast | 15 resorts visited this season | Follow for daily snow updates ❄️'}</Text>
            {user?.website && (
              <Text style={[styles.websiteText, { color: theme.colors.primary }]}>{user.website}</Text>
            )}
            <View style={[styles.skiStats, { backgroundColor: theme.colors.ice }]}>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>127</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Days on Snow</Text>
              </View>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>15</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Resorts</Text>
              </View>
              <View style={styles.skiStatItem}>
                <Text style={[styles.skiStatValue, { color: theme.colors.deepBlue }]}>48,920</Text>
                <Text style={[styles.skiStatLabel, { color: theme.colors.mountain }]}>Vertical ft</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            {isOwnProfile ? (
              <TouchableOpacity 
                style={[styles.editProfileButton, { borderColor: theme.colors.silver }]}
                onPress={() => setShowEditProfile(true)}
              >
                <Text style={[styles.editProfileButtonText, { color: theme.colors.midnight }]}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[styles.followButton, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.messageButton, { 
                  backgroundColor: theme.colors.snow,
                  borderColor: theme.colors.silver 
                }]}>
                  <Text style={[styles.messageButtonText, { color: theme.colors.midnight }]}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <View style={[styles.profileTabsContainer, { 
            borderTopColor: theme.colors.silver,
            borderBottomColor: theme.colors.silver 
          }]}>
            <TouchableOpacity 
              style={[styles.profileTab, activeTab === 'posts' && styles.activeProfileTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.profileTabIcon, { color: theme.colors.midnight }]}>▦</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.profileTab, activeTab === 'tagged' && styles.activeProfileTab]}
              onPress={() => setActiveTab('tagged')}
            >
              <Text style={[styles.profileTabIcon, { color: theme.colors.midnight }]}>🏷️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.postsGrid}>
            {userPosts.map(post => (
              <TouchableOpacity key={post.id} style={styles.gridItem}>
                <Image 
                  source={{ uri: post.imageUrl }} 
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <ProfileEditModal 
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          userData={user}
          onSave={handleSaveProfile}
        />
      </SafeAreaView>
    </Modal>
  );
};

// DMs Screen Component
const DMsScreen = ({ visible, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const conversationList = [
    { id: '1', user: SAMPLE_USERS[1], lastMessage: 'Awesome powder day!', time: '2h' },
    { id: '2', user: SAMPLE_USERS[2], lastMessage: 'Are you going to Aspen this weekend?', time: '1d' },
    { id: '3', user: SAMPLE_USERS[3], lastMessage: 'Check out this new gear I got', time: '3d' },
    { id: '4', user: SAMPLE_USERS[4], lastMessage: 'Hey! Looking forward to hitting the slopes with you.', time: '1w' },
  ];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.dmsContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.dmsHeader, { borderBottomColor: theme.colors.silver }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.backButton, { color: theme.colors.midnight }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.dmsTitle, { color: theme.colors.midnight }]}>Messages</Text>
          <TouchableOpacity>
            <Text style={[styles.newMessageIcon, { color: theme.colors.primary }]}>+</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={conversationList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.conversationItem, { borderBottomColor: theme.colors.silver }]}>
              <Image 
                source={{ uri: item.user.profileImageUrl }} 
                style={styles.conversationAvatar} 
              />
              <View style={styles.conversationContent}>
                <Text style={[styles.conversationUsername, { color: theme.colors.midnight }]}>{item.user.username}</Text>
                <Text style={[styles.conversationMessage, { color: theme.colors.mountain }]}>{item.lastMessage}</Text>
              </View>
              <Text style={[styles.conversationTime, { color: theme.colors.mountain }]}>{item.time}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

// Settings Screen Component
const SettingsScreen = ({ visible, onClose, onToggleTheme, isDarkMode }) => {
  const { theme } = useContext(ThemeContext);
  const { handleLogout } = useContext(AuthUserContext);
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.settingsContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.settingsHeader, { borderBottomColor: theme.colors.silver }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.backButton, { color: theme.colors.midnight }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.settingsTitle, { color: theme.colors.midnight }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView>
          <View style={styles.settingSection}>
            <Text style={[styles.settingSectionTitle, { color: theme.colors.midnight }]}>Account</Text>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Edit Profile</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.mountain }]}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Notifications</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.mountain }]}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Privacy</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.mountain }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={[styles.settingSectionTitle, { color: theme.colors.midnight }]}>Appearance</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={onToggleTheme}
                trackColor={{ false: theme.colors.silver, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={[styles.settingSectionTitle, { color: theme.colors.midnight }]}>Preferences</Text>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Resort Preferences</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.mountain }]}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.silver }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.midnight }]}>Snow Reports</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.mountain }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin, onNavigateToSignup, onCancel }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <SafeAreaView style={[styles.authContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      
      {onCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelButtonText, { color: theme.colors.midnight }]}>← Back to Explore</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.primary, fontSize: 34 }]}>PeakShare</Text>
        <Text style={[styles.logoTagline, { color: theme.colors.midnight }]}>Connect with ski enthusiasts worldwide</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.mountain}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.mountain}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity style={styles.forgotPasswordLink}>
          <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Forgot password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onLogin(email, password)}
        >
          <Text style={styles.authButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.authFooter}>
        <Text style={[styles.authFooterText, { color: theme.colors.mountain }]}>
          Don't have an account? 
        </Text>
        <TouchableOpacity onPress={onNavigateToSignup}>
          <Text style={[styles.authFooterLink, { color: theme.colors.primary }]}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Signup Screen Component
const SignupScreen = ({ onSignup, onNavigateToLogin, onCancel }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <SafeAreaView style={[styles.authContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      
      {onCancel ? (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelButtonText, { color: theme.colors.midnight }]}>← Back to Explore</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.backButtonContainer} onPress={onNavigateToLogin}>
          <Text style={[styles.backButton, { color: theme.colors.midnight }]}>←</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.primary, fontSize: 34 }]}>PeakShare</Text>
        <Text style={[styles.logoTagline, { color: theme.colors.midnight }]}>Join the skiing community</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.mountain}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Full Name"
            placeholderTextColor={theme.colors.mountain}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Username"
            placeholderTextColor={theme.colors.mountain}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.silver }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.midnight }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.mountain}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onSignup(email, fullName, username, password)}
        >
          <Text style={styles.authButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.authFooter}>
        <Text style={[styles.authFooterText, { color: theme.colors.mountain }]}>
          Already have an account? 
        </Text>
        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={[styles.authFooterLink, { color: theme.colors.primary }]}> Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// New Post Screen Component
const NewPostScreen = ({ visible, onClose, onSubmitPost }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthUserContext);
  const [postType, setPostType] = useState('photo'); // 'photo' or 'status'
  const [captionText, setCaptionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [location, setLocation] = useState('');
  
  // Mock image picker - in a real app, we would use Image Picker library
  const mockImageOptions = [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548133750-129e3168eb56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ];
  
  const handlePickImage = () => {
    // For demo, just randomly select an image from our options
    const randomImageUrl = mockImageOptions[Math.floor(Math.random() * mockImageOptions.length)];
    setSelectedImage(randomImageUrl);
  };
  
  const handleSubmitPost = () => {
    if ((postType === 'photo' && !selectedImage) || !captionText.trim()) {
      alert('Please add all required content for your post');
      return;
    }
    
    const newPost = {
      id: `post-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl || SAMPLE_USERS[0].profileImageUrl,
        hasStory: false
      },
      imageUrl: selectedImage,
      caption: captionText,
      location: location ? { name: location } : null,
      likeCount: 0,
      commentCount: 0,
      timestamp: new Date(),
      weather: { temperature: -2, conditions: 'Snowing' }, // Mock weather data
      liked: false,
      saved: false,
      comments: []
    };
    
    onSubmitPost(newPost);
    
    // Reset form
    setCaptionText('');
    setSelectedImage(null);
    setLocation('');
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.newPostContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.newPostHeader, { borderBottomColor: theme.colors.silver }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.colors.midnight }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.newPostTitle, { color: theme.colors.midnight }]}>
            {postType === 'photo' ? 'New Photo Post' : 'Status Update'}
          </Text>
          <TouchableOpacity onPress={handleSubmitPost}>
            <Text style={[styles.postActionText, { color: theme.colors.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.newPostContent}>
            <View style={styles.postTypeSelector}>
              <TouchableOpacity 
                style={[
                  styles.postTypeButton, 
                  postType === 'photo' && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setPostType('photo')}
              >
                <Text style={[
                  styles.postTypeText, 
                  { color: postType === 'photo' ? theme.colors.snow : theme.colors.midnight }
                ]}>
                  Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.postTypeButton, 
                  postType === 'status' && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setPostType('status')}
              >
                <Text style={[
                  styles.postTypeText, 
                  { color: postType === 'status' ? theme.colors.snow : theme.colors.midnight }
                ]}>
                  Status
                </Text>
              </TouchableOpacity>
            </View>
            
            {postType === 'photo' && (
              <View style={styles.imagePickerContainer}>
                {selectedImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image 
                      source={{ uri: selectedImage }} 
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity 
                      style={styles.changeImageButton}
                      onPress={handlePickImage}
                    >
                      <Text style={styles.changeImageText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.imagePicker, { backgroundColor: theme.colors.silver }]}
                    onPress={handlePickImage}
                  >
                    <Text style={[styles.imagePickerText, { color: theme.colors.midnight }]}>
                      Tap to select a photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <View style={styles.captionContainer}>
              <TextInput
                style={[styles.captionInput, { color: theme.colors.midnight }]}
                placeholder={postType === 'photo' ? "Write a caption..." : "What's on your mind?"}
                placeholderTextColor={theme.colors.mountain}
                value={captionText}
                onChangeText={setCaptionText}
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <View style={[styles.locationContainer, { borderTopColor: theme.colors.silver }]}>
              <Text style={[styles.locationLabel, { color: theme.colors.midnight }]}>Add Location</Text>
              <TextInput
                style={[styles.locationInput, { color: theme.colors.midnight }]}
                placeholder="Search for a ski resort..."
                placeholderTextColor={theme.colors.mountain}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            
            <View style={styles.weatherContainer}>
              <Text style={[styles.weatherLabel, { color: theme.colors.midnight }]}>Current Snow Conditions</Text>
              <View style={styles.weatherInfo}>
                <Text style={[styles.weatherValue, { color: theme.colors.deepBlue }]}>❄️ -2°C Snowing</Text>
                <Text style={[styles.weatherSubtext, { color: theme.colors.mountain }]}>
                  Weather data automatically added from your location
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Main App Component with functional UI
const InstagramApp = ({ user, isDarkMode, toggleTheme }) => {
  const { theme } = useContext(ThemeContext);
  const { handleLogout } = useContext(AuthUserContext);
  
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [viewingStory, setViewingStory] = useState(null);
  const [viewingComments, setViewingComments] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  
  // Handle like button press
  const handleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newLiked = !post.liked;
          const likeChange = newLiked ? 1 : -1;
          return {
            ...post,
            liked: newLiked,
            likeCount: post.likeCount + likeChange
          };
        }
        return post;
      })
    );
  };
  
  // Handle save button press
  const handleSave = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            saved: !post.saved
          };
        }
        return post;
      })
    );
  };
  
  // Handle viewing a story
  const handleViewStory = (user) => {
    // For simplicity, we're using a mock story based on user
    const mockStory = {
      user,
      imageUrl: user.id === '1' 
        ? 'https://images.unsplash.com/photo-1521080755838-d2311117f767?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        : (user.hasStory 
          ? 'https://images.unsplash.com/photo-1579489225013-3763e8be349c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          : null)
    };
    
    if (mockStory.imageUrl) {
      setViewingStory(mockStory);
    } else {
      alert('No story available');
    }
  };
  
  // Handle viewing a resort story
  const handleViewResort = (resort) => {
    const mockResortStory = {
      user: { username: resort.name, profileImageUrl: resort.imageUrl },
      imageUrl: 'https://images.unsplash.com/photo-1488591216063-cb6ab485cece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    setViewingStory(mockResortStory);
  };
  
  // Handle sharing a post
  const handleSharePost = async (post) => {
    try {
      const result = await Share.share({
        message: `Check out this amazing snow at ${post.location?.name || 'the mountains'}! #PeakShare`,
        url: post.imageUrls || post.imageUrl
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      alert(error.message);
    }
  };
  
  // Handle adding a comment
  const handleAddComment = (postId, commentText) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      user: { ...user, profileImageUrl: SAMPLE_USERS[0].profileImageUrl },
      text: commentText,
      timestamp: new Date()
    };
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
            commentCount: (post.commentCount || 0) + 1
          };
        }
        return post;
      })
    );
  };
  
  // Handle liking a comment
  const handleLikeComment = (postId, commentId) => {
    // Implementation would go here for a real app
    console.log(`Liked comment ${commentId} on post ${postId}`);
  };
  
  // Handle user profile navigation
  const handleUserPress = (profileUser) => {
    handleUserProfile(profileUser);
  };
  
  // Handle own profile navigation
  const handleOwnProfile = () => {
    // Use the logged in user for profile
    const currentUser = {
      ...user,
      profileImageUrl: SAMPLE_USERS[0].profileImageUrl
    };
    
    const userPosts = posts.filter(post => post.user.id === user.id);
    setViewingProfile({
      user: currentUser,
      posts: userPosts,
      isOwnProfile: true
    });
  };
  
  // Handle user profile navigation
  const handleUserProfile = (profileUser) => {
    const userPosts = posts.filter(post => post.user.id === profileUser.id);
    setViewingProfile({
      user: profileUser,
      posts: userPosts,
      isOwnProfile: false
    });
  };
  
  // Handle profile edit
  const handleEditProfile = (updatedProfile) => {
    // This would typically update the user in a real backend
    console.log('Profile updated:', updatedProfile);
    
    // Update local state for demo purposes
    const { handleUpdateUserProfile } = useContext(AuthUserContext);
    if (handleUpdateUserProfile) {
      handleUpdateUserProfile(updatedProfile);
    }
  };
  
  // Handle new post creation
  const handleCreatePost = () => {
    setShowNewPost(true);
  };
  
  // Handle post submission
  const handleSubmitPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  // Handle DMs navigation
  const handleOpenDMs = () => {
    setShowDMs(true);
  };
  
  // Handle settings navigation
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.silver, backgroundColor: theme.colors.background }]}>
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>PeakShare</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={[styles.iconPlaceholder, { color: theme.colors.midnight }]}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleOpenDMs}>
            <Text style={[styles.iconPlaceholder, { color: theme.colors.midnight }]}>✉️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        {/* Stories Row */}
        <View style={[styles.storiesRow, { borderBottomColor: theme.colors.silver, backgroundColor: theme.colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <StoryCircle 
              user={{
                ...user, 
                username: 'Your Story',
                profileImageUrl: SAMPLE_USERS[0].profileImageUrl,
                hasStory: false
              }} 
              onPress={() => handleViewStory(SAMPLE_USERS[0])}
            />
            
            {SAMPLE_USERS.slice(1).map(storyUser => (
              <StoryCircle 
                key={storyUser.id} 
                user={storyUser} 
                onPress={() => handleViewStory(storyUser)}
              />
            ))}
            
            {SAMPLE_RESORTS.map(resort => (
              <ResortStory 
                key={resort.id} 
                resort={resort} 
                onPress={() => handleViewResort(resort)}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Posts Feed */}
        {posts.map(post => (
          <PostCard 
            key={post.id}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onComment={() => setViewingComments(post)}
            onViewComments={() => setViewingComments(post)}
            onUserPress={() => handleUserPress(post.user)}
            onImagePress={() => handleLike(post.id)}
            onShare={() => handleSharePost(post)}
          />
        ))}
      </ScrollView>
      
      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { 
        borderTopColor: theme.colors.silver, 
        backgroundColor: theme.colors.background 
      }]}>
        <TabBarItem 
          icon="🏠" 
          isActive={activeTab === 'home'} 
          onPress={() => setActiveTab('home')}
        />
        <TabBarItem 
          icon="🔍" 
          isActive={activeTab === 'explore'} 
          onPress={() => setActiveTab('explore')}
        />
        <TabBarItem 
          icon="➕" 
          isActive={activeTab === 'create'} 
          onPress={handleCreatePost}
        />
        <TabBarItem 
          icon="❤️" 
          isActive={activeTab === 'activity'} 
          onPress={() => setActiveTab('activity')}
        />
        <TabBarItem 
          icon="👤" 
          isActive={activeTab === 'profile'} 
          onPress={handleOwnProfile}
        />
      </View>
      
      {/* Long Press Action for Profile - Opens Settings */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={handleOpenSettings}
        onLongPress={handleLogout}
      >
        <Text style={[styles.settingsButtonText, { color: theme.colors.primary }]}>⚙️</Text>
      </TouchableOpacity>
      
      {/* Modals */}
      <StoryViewer 
        visible={viewingStory !== null}
        story={viewingStory}
        onClose={() => setViewingStory(null)}
      />
      
      <CommentsModal 
        visible={viewingComments !== null}
        post={viewingComments}
        onClose={() => setViewingComments(null)}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />
      
      {viewingProfile && (
        <ProfileScreen
          user={viewingProfile.user}
          posts={viewingProfile.posts}
          isOwnProfile={viewingProfile.isOwnProfile}
          onClose={() => setViewingProfile(null)}
          onEditProfile={handleEditProfile}
        />
      )}
      
      <DMsScreen
        visible={showDMs}
        onClose={() => setShowDMs(false)}
      />
      
      <SettingsScreen
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      
      <NewPostScreen
        visible={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmitPost={handleSubmitPost}
      />
    </SafeAreaView>
  );
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  
  // Load saved theme preference - modified for web
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        let savedThemePreference = null;
        
        try {
          savedThemePreference = await AsyncStorage.getItem('themePreference');
        } catch (storageError) {
          console.warn('AsyncStorage not available in this environment:', storageError);
          // Fallback for web - use localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            savedThemePreference = window.localStorage.getItem('themePreference');
          }
        }
        
        if (savedThemePreference !== null) {
          const isDark = savedThemePreference === 'dark';
          setIsDarkMode(isDark);
          setTheme(isDark ? darkTheme : lightTheme);
        } else {
          // Use system preference by default
          const systemIsDark = systemColorScheme === 'dark';
          setIsDarkMode(systemIsDark);
          setTheme(systemIsDark ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };
    
    loadThemePreference();
  }, [systemColorScheme]);
  
  // Toggle theme function - modified for web
  const toggleTheme = async () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    setTheme(newIsDarkMode ? darkTheme : lightTheme);
    
    try {
      try {
        await AsyncStorage.setItem('themePreference', newIsDarkMode ? 'dark' : 'light');
      } catch (storageError) {
        console.warn('AsyncStorage not available in this environment:', storageError);
        // Fallback for web - use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('themePreference', newIsDarkMode ? 'dark' : 'light');
        }
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in - modified for web
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        let savedUser = null;
        
        try {
          savedUser = await AsyncStorage.getItem('user');
        } catch (storageError) {
          console.warn('AsyncStorage not available in this environment:', storageError);
          // Fallback for web - use localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            savedUser = window.localStorage.getItem('user');
          }
        }
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Login function - modified for web
  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, just check if email and password are not empty
      if (email && password) {
        const mockUser = {
          id: '1',
          email,
          username: email.split('@')[0],
          fullName: '',
          bio: 'Skiing enthusiast | New to PeakShare | Looking forward to sharing my adventures!',
          website: '',
          profileImageUrl: SAMPLE_USERS[0].profileImageUrl
        };
        
        try {
          await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        } catch (storageError) {
          console.warn('AsyncStorage not available in this environment:', storageError);
          // Fallback for web - use localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('user', JSON.stringify(mockUser));
          }
        }
        
        setUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Signup function - modified for web
  const handleSignup = async (email, fullName, username, password) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, just check if all fields are filled
      if (email && fullName && username && password) {
        const mockUser = {
          id: Date.now().toString(),
          email,
          fullName,
          username,
          bio: 'Skiing enthusiast | New to PeakShare | Looking forward to sharing my adventures!',
          website: '',
          profileImageUrl: SAMPLE_USERS[0].profileImageUrl
        };
        
        try {
          await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        } catch (storageError) {
          console.warn('AsyncStorage not available in this environment:', storageError);
          // Fallback for web - use localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('user', JSON.stringify(mockUser));
          }
        }
        
        setUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile function - modified for web
  const handleUpdateUserProfile = async (updatedProfile) => {
    try {
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedProfile));
      } catch (storageError) {
        console.warn('AsyncStorage not available in this environment:', storageError);
        // Fallback for web - use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('user', JSON.stringify(updatedProfile));
        }
      }
      
      setUser(updatedProfile);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };
  
  // Logout function - modified for web
  const handleLogout = async () => {
    try {
      try {
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.warn('AsyncStorage not available in this environment:', storageError);
        // Fallback for web - use localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('user');
        }
      }
      
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <AuthUserContext.Provider value={{ 
      user, 
      isLoading, 
      handleLogin, 
      handleSignup,
      handleUpdateUserProfile,
      handleLogout 
    }}>
      {children}
    </AuthUserContext.Provider>
  );
};

// Import SimpleExploreScreen
import SimpleExploreScreen from './src/screens/explore/SimpleExploreScreen';

// Main App Container Component
const AppContainer = () => {
  const { user, loading } = useContext(AuthUserContext);
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // Use the AppNavigator component that handles all navigation
  return <AppNavigator />;
  
  // The AppNavigator handles the authentication state internally based on the AuthContext
  // It will show login/register screens when user is null
  // It will show the main app screens when user is authenticated
};

// Import navigation components
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Minimal App component
export default function App() {
  return (
    <PaperProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            <AppContainer />
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </PaperProvider>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.deepBlue,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    fontSize: 24,
    marginLeft: 16,
  },
  storiesRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  resortContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  storyCircleWrapper: {
    position: 'relative',
  },
  gradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCircleInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
    overflow: 'hidden',
  },
  storyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
  },
  inactiveStoryBorder: {
    borderWidth: 2,
    borderColor: theme.colors.silver,
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    color: theme.colors.midnight,
  },
  snowBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.deepBlue,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: theme.colors.snow,
  },
  snowText: {
    color: theme.colors.snow,
    fontSize: 10,
    fontWeight: 'bold',
  },
  postCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.background,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.midnight,
  },
  location: {
    fontSize: 12,
    color: theme.colors.mountain,
  },
  moreIcon: {
    fontSize: 24,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  weatherBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weatherText: {
    color: theme.colors.snow,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  liked: {
    color: theme.colors.error,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likesCount: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.midnight,
  },
  caption: {
    marginBottom: 4,
    color: theme.colors.midnight,
  },
  captionUsername: {
    fontWeight: 'bold',
  },
  viewComments: {
    color: theme.colors.mountain,
    marginBottom: 4,
  },
  timestamp: {
    color: theme.colors.mountain,
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.silver,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    color: theme.colors.midnight,
  },
  activeTab: {
    color: theme.colors.primary,
  },
  
  // Story Viewer Styles
  storyViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyViewerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 10,
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: theme.colors.snow,
  },
  storyViewerUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.snow,
  },
  closeButton: {
    fontSize: 20,
    color: theme.colors.snow,
    padding: 8,
  },
  storyViewerImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  storyViewerFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    padding: 12,
  },
  storyReplyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 12,
    color: theme.colors.snow,
  },
  
  // Comments Modal Styles
  commentsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: theme.colors.midnight,
  },
  commentText: {
    color: theme.colors.midnight,
  },
  commentLikeButton: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  commentLikeIcon: {
    fontSize: 16,
    color: theme.colors.midnight,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.silver,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    color: theme.colors.midnight,
  },
  postButton: {
    marginLeft: 10,
  },
  postButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  
  // Profile Screen Styles
  profileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  backButton: {
    fontSize: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: theme.colors.midnight,
  },
  profileUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  menuIcon: {
    fontSize: 24,
    color: theme.colors.midnight,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileImageContainer: {
    marginRight: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.mountain,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  realName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.midnight,
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.midnight,
    marginBottom: 10,
  },
  skiStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.ice,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  skiStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  skiStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.deepBlue,
  },
  skiStatLabel: {
    fontSize: 12,
    color: theme.colors.mountain,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: theme.colors.snow,
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    backgroundColor: theme.colors.snow,
    borderRadius: 6,
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.silver,
  },
  messageButtonText: {
    color: theme.colors.midnight,
    fontWeight: '500',
  },
  profileTabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.silver,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  profileTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeProfileTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  profileTabIcon: {
    fontSize: 22,
    color: theme.colors.midnight,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: width / 3,
    height: width / 3,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  
  // DMs Screen Styles
  dmsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  dmsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  newMessageIcon: {
    fontSize: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: theme.colors.primary,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.midnight,
  },
  conversationMessage: {
    fontSize: 14,
    color: theme.colors.mountain,
  },
  conversationTime: {
    fontSize: 12,
    color: theme.colors.mountain,
    marginLeft: 10,
  },
  
  // Settings Screen Styles
  settingsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  settingSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  settingSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 12,
    color: theme.colors.midnight,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.midnight,
  },
  settingArrow: {
    fontSize: 20,
    color: theme.colors.mountain,
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  
  // Auth Screens Styles
  authContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
  },
  cancelButton: {
    marginTop: 16,
    marginLeft: 0,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logoTagline: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.midnight,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: theme.colors.midnight,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  authButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  authButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  authFooterText: {
    fontSize: 14,
    color: theme.colors.mountain,
  },
  authFooterLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  backButtonContainer: {
    marginTop: 16,
    marginLeft: -8,
  },
  
  // Comment Styles (Additional)
  commentActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: theme.colors.mountain,
    marginRight: 12,
  },
  commentReply: {
    fontSize: 12,
    color: theme.colors.mountain,
    fontWeight: '500',
  },
  
  // Loading Container
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  
  // Icon Button
  iconButton: {
    marginLeft: 16,
  },
  
  // Edit Profile Modal Styles
  editProfileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  editProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  editProfileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.colors.midnight,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  editProfileContent: {
    padding: 16,
  },
  profilePictureEdit: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  editFieldContainer: {
    marginBottom: 20,
  },
  editFieldLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.colors.mountain,
  },
  editField: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    borderRadius: 6,
    color: theme.colors.midnight,
  },
  editBioField: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    borderRadius: 6,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.midnight,
  },
  skiStatsEdit: {
    marginTop: 20,
  },
  skiStatsEditTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.midnight,
  },
  skiStatsEditDesc: {
    fontSize: 14,
    color: theme.colors.mountain,
    marginBottom: 12,
  },
  
  // Profile Screen Additional Styles
  websiteText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: theme.colors.snow,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.silver,
  },
  editProfileButtonText: {
    fontWeight: '500',
    color: theme.colors.midnight,
  },
  
  // New Post Screen Styles
  newPostContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  newPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.silver,
  },
  newPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  postActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  newPostContent: {
    flex: 1,
    padding: 16,
  },
  postTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  postTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    marginHorizontal: 5,
  },
  postTypeText: {
    fontWeight: '500',
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePicker: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.silver,
  },
  imagePickerText: {
    fontSize: 16,
    color: theme.colors.midnight,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  changeImageButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    borderRadius: 6,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.midnight,
  },
  locationContainer: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.silver,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: theme.colors.midnight,
  },
  locationInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.silver,
    borderRadius: 6,
    color: theme.colors.midnight,
  },
  weatherContainer: {
    marginBottom: 20,
  },
  weatherLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: theme.colors.midnight,
  },
  weatherInfo: {
    backgroundColor: theme.colors.ice,
    padding: 12,
    borderRadius: 8,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.deepBlue,
  },
  weatherSubtext: {
    fontSize: 12,
    color: theme.colors.mountain,
  }
});