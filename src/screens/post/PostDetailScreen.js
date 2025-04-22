import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Appbar, Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import { likePost, setCurrentPost } from '../../redux/slices/postsSlice';
import { theme } from '../../theme';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Comment component - individual comment display
 */
const Comment = ({ comment, onUserPress }) => {
  return (
    <View style={styles.commentContainer}>
      <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
        <Avatar.Image
          size={36}
          source={{ uri: comment.userProfileImageUrl || 'https://via.placeholder.com/36' }}
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
            <Text style={styles.commentUsername}>{comment.username}</Text>
          </TouchableOpacity>
          <Text style={styles.commentTime}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </Text>
        </View>
        
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    </View>
  );
};

/**
 * PostDetailScreen - Displays a single post with comments
 */
const PostDetailScreen = ({ navigation, route }) => {
  const { post: initialPost, postId, focusComment } = route.params;
  const dispatch = useDispatch();
  const { user, userData } = useContext(AuthContext);
  const { currentPost } = useSelector((state) => state.posts);
  const likedPosts = useSelector((state) => state.posts.likedPosts);
  
  const [post, setPost] = useState(initialPost || currentPost);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const commentInputRef = useRef(null);
  
  // Fetch post details if not provided
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (initialPost) {
        setPost(initialPost);
        setLikeCount(initialPost.likeCount || 0);
        dispatch(setCurrentPost(initialPost));
        return;
      }
      
      if (currentPost && currentPost.id === postId) {
        setPost(currentPost);
        setLikeCount(currentPost.likeCount || 0);
        return;
      }
      
      if (postId) {
        try {
          const postRef = doc(db, 'posts', postId);
          const postDoc = await getDoc(postRef);
          
          if (postDoc.exists()) {
            const postData = {
              id: postDoc.id,
              ...postDoc.data(),
              createdAt: postDoc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: postDoc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
            
            setPost(postData);
            setLikeCount(postData.likeCount || 0);
            dispatch(setCurrentPost(postData));
          }
        } catch (error) {
          console.error('Error fetching post details:', error);
        }
      }
    };
    
    fetchPostDetails();
  }, [initialPost, currentPost, postId, dispatch]);
  
  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return;
      
      try {
        setLoading(true);
        
        const commentsRef = collection(db, 'comments');
        const q = query(
          commentsRef,
          where('postId', '==', post.id),
          orderBy('createdAt', 'asc')
        );
        
        const commentsSnapshot = await getDocs(q);
        
        const commentsData = commentsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          };
        });
        
        setComments(commentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [post]);
  
  // Check if the post is liked by current user
  useEffect(() => {
    if (post && user && post.id) {
      // Check Redux store first
      if (likedPosts[post.id] !== undefined) {
        setLiked(likedPosts[post.id]);
      } else {
        setLiked(false);
      }
    }
  }, [post, user, likedPosts]);
  
  // Focus comment input if focusComment is true
  useEffect(() => {
    if (focusComment && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 300);
    }
  }, [focusComment, commentInputRef.current]);
  
  // Update like count when post changes
  useEffect(() => {
    if (post) {
      setLikeCount(post.likeCount || 0);
    }
  }, [post?.likeCount]);
  
  // Handle like post
  const handleLike = () => {
    if (!user) return;
    
    dispatch(likePost({
      postId: post.id,
      userId: user.uid
    }));
    
    // Optimistically update UI
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prevCount => newLiked ? prevCount + 1 : prevCount - 1);
  };
  
  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!user || !userData || !commentText.trim() || !post) return;
    
    try {
      setSubmittingComment(true);
      
      // Create comment document
      const commentData = {
        postId: post.id,
        userId: user.uid,
        username: userData.username,
        userProfileImageUrl: userData.profileImageUrl || '',
        text: commentText.trim(),
        createdAt: serverTimestamp()
      };
      
      const commentRef = await addDoc(collection(db, 'comments'), commentData);
      
      // Add the comment to the local state
      setComments([
        ...comments,
        {
          id: commentRef.id,
          ...commentData,
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Clear the input
      setCommentText('');
      setSubmittingComment(false);
      
      // Dismiss keyboard
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error adding comment:', error);
      setSubmittingComment(false);
    }
  };
  
  // Navigate to user profile
  const handleUserPress = (userId) => {
    navigation.navigate('Profile', { userId });
  };
  
  // Handle share
  const handleShare = () => {
    // Implement share functionality
    // This would typically use the Share API in a real app
    console.log('Share post:', post.id);
  };
  
  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Post" />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>
      
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* Post header */}
            <View style={styles.postHeader}>
              <TouchableOpacity 
                style={styles.postUser}
                onPress={() => handleUserPress(post.userId)}
              >
                <Avatar.Image
                  size={40}
                  source={{ uri: post.userProfileImageUrl || 'https://via.placeholder.com/40' }}
                  style={styles.userAvatar}
                />
                <View>
                  <Text style={styles.username}>{post.username}</Text>
                  {post.location?.name && (
                    <Text style={styles.location}>{post.location.name}</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.midnight} />
              </TouchableOpacity>
            </View>
            
            {/* Post image or text-only post */}
            {post.imageUrls && post.imageUrls.length > 0 ? (
              <Image
                source={{ uri: post.imageUrls[0] }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.textOnlyPostContainer}>
                <Text style={styles.textOnlyPostText}>{post.caption}</Text>
                
                {post.weather && (
                  <View style={styles.textOnlyPostWeather}>
                    <Ionicons 
                      name={post.weather.conditions.toLowerCase().includes('snow') ? 'snow-outline' : 'sunny-outline'} 
                      size={18} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.textOnlyPostWeatherText}>
                      {post.weather.temperature}° • {post.weather.conditions}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Post actions */}
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
                  onPress={() => commentInputRef.current?.focus()}
                >
                  <Ionicons name="chatbubble-outline" size={24} color={theme.colors.midnight} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="paper-plane-outline" size={24} color={theme.colors.midnight} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color={theme.colors.midnight} />
              </TouchableOpacity>
            </View>
            
            {/* Like count */}
            <View style={styles.contentContainer}>
              <Text style={styles.likeCount}>{likeCount} likes</Text>
              
              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.usernameCaption}>{post.username}</Text>
                <Text style={styles.caption}>{post.caption}</Text>
              </View>
              
              {/* Post timestamp */}
              <Text style={styles.timestamp}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Text>
            </View>
            
            <Divider />
            
            {/* Comments header */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                {comments.length > 0 ? `Comments (${comments.length})` : 'No comments yet'}
              </Text>
            </View>
            
            {loading && (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.commentsLoading} />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Comment comment={item} onUserPress={handleUserPress} />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyCommentsContainer}>
              <Text style={styles.emptyCommentsText}>No comments yet. Be the first to comment!</Text>
            </View>
          )
        }
        contentContainerStyle={styles.commentsList}
      />
      
      {/* Comment input */}
      <View style={styles.commentInputContainer}>
        <Avatar.Image
          size={32}
          source={{ uri: userData?.profileImageUrl || 'https://via.placeholder.com/32' }}
          style={styles.commentInputAvatar}
        />
        <TextInput
          ref={commentInputRef}
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || submittingComment}
          style={[
            styles.postCommentButton,
            (!commentText.trim() || submittingComment) && styles.disabledButton
          ]}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text 
              style={[
                styles.postCommentButtonText,
                (!commentText.trim() || submittingComment) && styles.disabledButtonText
              ]}
            >
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
    color: theme.colors.midnight,
  },
  location: {
    fontSize: 13,
    color: theme.colors.mountain,
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  likeCount: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 15,
    color: theme.colors.midnight,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  usernameCaption: {
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 15,
    color: theme.colors.midnight,
  },
  caption: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.midnight,
    lineHeight: 22,
  },
  timestamp: {
    color: theme.colors.mountain,
    fontSize: 13,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.midnight,
  },
  commentsLoading: {
    padding: 16,
  },
  commentsList: {
    paddingBottom: 16,
  },
  emptyCommentsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 15,
    color: theme.colors.mountain,
    textAlign: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentAvatar: {
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.midnight,
  },
  commentTime: {
    fontSize: 12,
    color: theme.colors.mountain,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.midnight,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.silver,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  commentInputAvatar: {
    marginRight: 8,
    backgroundColor: theme.colors.surface,
  },
  commentInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  postCommentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postCommentButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  // Text-only post styles
  textOnlyPostContainer: {
    padding: 24,
    backgroundColor: theme.colors.surface,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.silver,
  },
  textOnlyPostText: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.midnight,
    fontWeight: '500',
    textAlign: 'center',
  },
  textOnlyPostWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  textOnlyPostWeatherText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
  },
});

export default PostDetailScreen;