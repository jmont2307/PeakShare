import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Appbar, Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostInteractions } from '../../redux/slices/postsSlice';
import PostInteractions from '../../components/feed/PostInteractions';
import { theme } from '../../theme';

const PostInteractionsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { post } = route.params;
  const { postInteractions, loadingInteractions } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    if (post && post.id) {
      dispatch(fetchPostInteractions(post.id));
    }
  }, [dispatch, post]);
  
  const handleUserPress = (userId) => {
    // Navigate to user profile
    navigation.navigate('Profile', { userId });
  };
  
  const interactions = postInteractions[post?.id] || { likes: [], comments: [] };
  const { likes, comments } = interactions;
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Post Interactions" />
      </Appbar.Header>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 0 && styles.activeTab]} 
          onPress={() => setActiveTab(0)}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 0 ? theme.colors.primary : theme.colors.mountain}
          />
          <Text style={[styles.tabLabel, activeTab === 0 && styles.activeTabLabel]}>
            Likes ({post.likeCount || 0})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 1 && styles.activeTab]} 
          onPress={() => setActiveTab(1)}
        >
          <Ionicons 
            name="chatbubble-outline" 
            size={20} 
            color={activeTab === 1 ? theme.colors.primary : theme.colors.mountain}
          />
          <Text style={[styles.tabLabel, activeTab === 1 && styles.activeTabLabel]}>
            Comments ({post.commentCount || 0})
          </Text>
        </TouchableOpacity>
      </View>
      
      {loadingInteractions ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {activeTab === 0 ? (
            // Likes tab
            <View>
              {likes.length > 0 ? (
                likes.map((like, index) => (
                  <View key={`like-${index}`} style={styles.userItem}>
                    <TouchableOpacity 
                      style={styles.userInfo}
                      onPress={() => handleUserPress(like.user.id)}
                    >
                      <Avatar.Image
                        size={40}
                        source={{ uri: like.user.profileImageUrl || 'https://via.placeholder.com/40' }}
                        style={styles.userAvatar}
                      />
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{like.user.username}</Text>
                        <Text style={styles.timeText}>
                          {formatDistanceToNow(new Date(like.timestamp), { addSuffix: true })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="heart-outline" size={60} color={theme.colors.silver} />
                  <Text style={styles.emptyText}>No likes yet</Text>
                </View>
              )}
            </View>
          ) : (
            // Comments tab
            <View>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <View key={`comment-${index}`} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <TouchableOpacity 
                        style={styles.userInfo}
                        onPress={() => handleUserPress(comment.user.id)}
                      >
                        <Avatar.Image
                          size={40}
                          source={{ uri: comment.user.profileImageUrl || 'https://via.placeholder.com/40' }}
                          style={styles.userAvatar}
                        />
                        <View style={styles.userDetails}>
                          <Text style={styles.userName}>{comment.user.username}</Text>
                          <Text style={styles.timeText}>
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble-outline" size={60} color={theme.colors.silver} />
                  <Text style={styles.emptyText}>No comments yet</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.silver + '40',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    marginLeft: 6,
    color: theme.colors.mountain,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.silver + '40',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.midnight,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.mountain,
    marginTop: 2,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.silver + '40',
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.midnight,
    paddingLeft: 52, // align with avatar
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.mountain,
    textAlign: 'center',
  },
});

export default PostInteractionsScreen;