import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { db } from '../../firebase';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { likePost } from '../../redux/slices/postsSlice';
import { theme } from '../../theme';

const PostCard = ({ post, onPress }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const likedPosts = useSelector((state) => state.posts.likedPosts);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [saved, setSaved] = useState(false);

  // Check if post is liked whenever likedPosts or post.id changes
  useEffect(() => {
    if (userData && post.id) {
      // Just use the Redux state for the like status
      if (likedPosts[post.id] !== undefined) {
        setLiked(likedPosts[post.id]);
      } else {
        // Default to not liked if not in Redux state
        setLiked(false);
      }
    }
  }, [post.id, userData, likedPosts]);

  useEffect(() => {
    setLikeCount(post.likeCount || 0);
  }, [post.likeCount]);

  const handleLike = () => {
    if (!userData) return;
    
    dispatch(likePost({
      postId: post.id,
      userId: userData.uid
    }));
    
    // Optimistically update UI
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prevCount => newLiked ? prevCount + 1 : prevCount - 1);
  };
  
  const handleSave = () => {
    setSaved(!saved);
  };
  
  const navigateToUserProfile = () => {
    navigation.navigate('Profile', { userId: post.userId });
  };
  
  const handleShare = async () => {
    try {
      // Prepare share content
      const title = `Check out this post by ${post.username} on PeakShare`;
      const message = post.caption 
        ? `${post.caption}\n\nShared from PeakShare - Connect with Skiers & Snowboarders`
        : 'Shared from PeakShare - Connect with Skiers & Snowboarders';
      
      // Call native share functionality
      const options = {
        title,
        message,
        url: post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : null
      };
      
      // Use React Native's Share API
      const { Share } = require('react-native');
      const result = await Share.share(options);
      
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
      console.error('Error sharing post:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return '';
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfoContainer} onPress={navigateToUserProfile}>
          <Avatar.Image 
            source={{ uri: post.userProfileImageUrl || 'https://via.placeholder.com/40' }} 
            size={32}
            style={styles.avatar}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.username}>{post.username}</Text>
            {post.location?.name && (
              <Text style={styles.location}>{post.location.name}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.midnight} />
        </TouchableOpacity>
      </View>
      
      {/* Image (if exists) */}
      {post.imageUrls && post.imageUrls.length > 0 ? (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: post.imageUrls[0] }} 
              style={styles.image}
              resizeMode="cover"
            />
            
            {post.weather && (
              <View style={styles.weatherBadge}>
                <Ionicons 
                  name={post.weather.conditions.toLowerCase().includes('snow') ? 'snow-outline' : 'sunny-outline'} 
                  size={16} 
                  color={theme.colors.snow} 
                  style={styles.weatherIcon}
                />
                <Text style={styles.temperature}>{post.weather.temperature}°C / {post.weather.temperatureF}°F</Text>
                <Text style={styles.conditions}>{post.weather.conditions}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View style={styles.textOnlyContainer}>
            <Text style={styles.textOnlyCaption}>{post.caption}</Text>
            
            {post.weather && (
              <View style={styles.textOnlyWeather}>
                <Ionicons 
                  name={post.weather.conditions.toLowerCase().includes('snow') ? 'snow-outline' : 'sunny-outline'} 
                  size={18} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.textOnlyWeatherText}>
                  {post.weather.temperature}°C / {post.weather.temperatureF}°F • {post.weather.conditions}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
      
      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={26} 
              color={liked ? theme.colors.error : theme.colors.midnight} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('PostDetail', { post, focusComment: true })}
          >
            <Ionicons name="chatbubble-outline" size={24} color={theme.colors.midnight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={24} color={theme.colors.midnight} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={handleSave}>
          <Ionicons 
            name={saved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={theme.colors.midnight} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Like count */}
      <View style={styles.contentContainer}>
        <View style={styles.likeRow}>
          <Text style={styles.likeCount}>{likeCount} likes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PostInteractions', { post })}>
            <Text style={styles.viewInteractions}>View interactions</Text>
          </TouchableOpacity>
        </View>
        
        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.usernameCaption}>{post.username}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
        
        {/* Comments */}
        {post.commentCount > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post })}>
            <Text style={styles.viewComments}>
              View all {post.commentCount} comments
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatTimestamp(post.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.snow,
  },
  headerTextContainer: {
    marginLeft: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
    color: theme.colors.midnight,
  },
  location: {
    fontSize: 11,
    color: theme.colors.mountain,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 400,
  },
  weatherBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 4,
  },
  temperature: {
    color: theme.colors.snow,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  conditions: {
    color: theme.colors.snow,
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 14,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  likeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  likeCount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.midnight,
  },
  viewInteractions: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  usernameCaption: {
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 14,
    color: theme.colors.midnight,
  },
  caption: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.midnight,
  },
  viewComments: {
    color: theme.colors.mountain,
    marginTop: 4,
    fontSize: 14,
  },
  timestamp: {
    color: theme.colors.mountain,
    fontSize: 12,
    marginTop: 4,
  },
  // Styles for text-only posts
  textOnlyContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    minHeight: 120,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.silver,
  },
  textOnlyCaption: {
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.midnight,
    fontWeight: '500',
    textAlign: 'center',
  },
  textOnlyWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  textOnlyWeatherText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.primary,
  },
});

export default PostCard;