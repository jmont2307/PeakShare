import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { theme } from '../../theme';

const InteractionItem = ({ icon, color, label, count, onPress }) => (
  <TouchableOpacity style={styles.interactionItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.interactionContent}>
      <Text style={styles.interactionCount}>{count}</Text>
      <Text style={styles.interactionLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const UserInteraction = ({ user, time, action, onPress }) => (
  <View style={styles.userInteraction}>
    <Avatar.Image
      size={30}
      source={{ uri: user.profileImageUrl || 'https://via.placeholder.com/30' }}
      style={styles.userAvatar}
    />
    <View style={styles.userInteractionContent}>
      <Text style={styles.userInteractionText}>
        <Text style={styles.username} onPress={onPress}>{user.username}</Text> {action}
      </Text>
      <Text style={styles.interactionTime}>{time}</Text>
    </View>
  </View>
);

const PostInteractions = ({ 
  post, 
  recentLikes = [], 
  recentComments = [], 
  onLikesPress, 
  onCommentsPress,
  onUserPress 
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Post Interactions" />
      <Card.Content>
        <View style={styles.interactionStats}>
          <InteractionItem 
            icon="heart" 
            color={theme.colors.error} 
            label="Likes"
            count={post.likeCount || 0}
            onPress={onLikesPress}
          />
          <InteractionItem 
            icon="chatbubble-outline" 
            color={theme.colors.mountain} 
            label="Comments"
            count={post.commentCount || 0}
            onPress={onCommentsPress}
          />
        </View>
        
        {recentLikes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Likes</Text>
            {recentLikes.map((like, index) => (
              <UserInteraction
                key={`like-${index}`}
                user={like.user}
                time={formatDistanceToNow(new Date(like.timestamp), { addSuffix: true })}
                action="liked your post"
                onPress={() => onUserPress(like.user.id)}
              />
            ))}
            {post.likeCount > recentLikes.length && (
              <TouchableOpacity onPress={onLikesPress} style={styles.viewMore}>
                <Text style={styles.viewMoreText}>
                  View all {post.likeCount} likes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {recentComments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Comments</Text>
            {recentComments.map((comment, index) => (
              <UserInteraction
                key={`comment-${index}`}
                user={comment.user}
                time={formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                action={`commented: "${comment.text.length > 30 ? comment.text.substring(0, 30) + '...' : comment.text}"`}
                onPress={() => onUserPress(comment.user.id)}
              />
            ))}
            {post.commentCount > recentComments.length && (
              <TouchableOpacity onPress={onCommentsPress} style={styles.viewMore}>
                <Text style={styles.viewMoreText}>
                  View all {post.commentCount} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {recentLikes.length === 0 && recentComments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={theme.colors.silver} />
            <Text style={styles.emptyText}>No interactions yet</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  interactionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  interactionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  interactionContent: {
    flexDirection: 'column',
  },
  interactionCount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  interactionLabel: {
    fontSize: 14,
    color: theme.colors.mountain,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.midnight,
  },
  userInteraction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    marginRight: 8,
  },
  userInteractionContent: {
    flex: 1,
  },
  userInteractionText: {
    fontSize: 14,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  username: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  interactionTime: {
    fontSize: 12,
    color: theme.colors.mountain,
  },
  viewMore: {
    marginTop: 8,
    marginBottom: 8,
  },
  viewMoreText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.mountain,
  },
});

export default PostInteractions;