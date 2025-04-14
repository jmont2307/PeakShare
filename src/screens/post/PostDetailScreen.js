import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput as RNTextInput, FlatList, Text } from 'react-native';
import { Appbar, TextInput, Button, ActivityIndicator, Divider, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../../contexts/AuthContext';
import PostCard from '../../components/feed/PostCard';

const CommentItem = ({ comment, currentUserId, onDelete }) => {
  const isOwnComment = comment.userId === currentUserId;
  
  return (
    <View style={styles.commentContainer}>
      <Avatar.Image 
        source={{ uri: comment.user?.profileImageUrl || 'https://via.placeholder.com/40' }} 
        size={36} 
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.user?.username || 'User'}</Text>
          <Text style={styles.commentTime}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
      {isOwnComment && (
        <Button 
          icon="delete" 
          compact 
          mode="text" 
          onPress={() => onDelete(comment.id)}
          style={styles.deleteButton}
        />
      )}
    </View>
  );
};

const PostDetailScreen = ({ route, navigation }) => {
  const { post, focusComment } = route.params;
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const commentInputRef = useRef(null);
  
  // Focus comment input if focusComment is true
  useEffect(() => {
    if (focusComment && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 500);
    }
  }, [focusComment]);
  
  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsSnapshot = await firestore()
          .collection('comments')
          .where('postId', '==', post.id)
          .orderBy('createdAt', 'desc')
          .get();
        
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString()
        }));
        
        // Get user info for each comment
        const userIds = [...new Set(commentsData.map(comment => comment.userId))];
        
        if (userIds.length > 0) {
          const usersSnapshot = await firestore()
            .collection('users')
            .where(firestore.FieldPath.documentId(), 'in', userIds)
            .get();
          
          const users = {};
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            users[doc.id] = {
              id: doc.id,
              username: userData.username,
              profileImageUrl: userData.profileImageUrl || ''
            };
          });
          
          // Add user info to each comment
          commentsData.forEach(comment => {
            comment.user = users[comment.userId] || null;
          });
        }
        
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [post.id]);
  
  const handlePostComment = async () => {
    if (!commentText.trim() || !user) return;
    
    setPosting(true);
    
    try {
      const commentData = {
        postId: post.id,
        userId: user.uid,
        text: commentText.trim(),
        createdAt: firestore.FieldValue.serverTimestamp()
      };
      
      const commentRef = await firestore().collection('comments').add(commentData);
      
      // Get user data for the newly created comment
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      // Add the new comment to the local state
      const newComment = {
        id: commentRef.id,
        ...commentData,
        createdAt: new Date().toISOString(),
        user: {
          id: user.uid,
          username: userData.username,
          profileImageUrl: userData.profileImageUrl || ''
        }
      };
      
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      await firestore().collection('comments').doc(commentId).delete();
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Post" />
        </Appbar.Header>
        
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              <PostCard post={post} />
              <View style={styles.commentsHeaderContainer}>
                <Text style={styles.commentsHeader}>
                  {comments.length > 0 
                    ? `Comments (${comments.length})` 
                    : 'No comments yet'}
                </Text>
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <CommentItem 
              comment={item} 
              currentUserId={user?.uid}
              onDelete={handleDeleteComment}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={() => (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
              </View>
            ) : null
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={handlePostComment}
                disabled={!commentText.trim() || posting}
                color={!commentText.trim() || posting ? '#999' : '#0066CC'}
              />
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  commentsHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentTime: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    height: 40,
  },
  deleteButton: {
    marginLeft: 8,
  },
});

export default PostDetailScreen;