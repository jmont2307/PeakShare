import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Appbar, ActivityIndicator, Divider, Badge } from 'react-native-paper';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { AuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { theme } from '../../theme';

const NotificationItem = ({ notification, onPress }) => {
  let icon = 'heart';
  let color = theme.colors.error;
  let message = '';
  
  switch(notification.type) {
    case 'like':
      icon = 'heart';
      color = theme.colors.error;
      message = `liked your post`;
      break;
    case 'comment':
      icon = 'chatbubble';
      color = theme.colors.primary;
      message = `commented: ${notification.commentText}`;
      break;
    case 'follow':
      icon = 'person-add';
      color = theme.colors.success;
      message = `started following you`;
      break;
    default:
      icon = 'notifications';
      color = theme.colors.primary;
      message = 'sent you a notification';
  }
  
  return (
    <TouchableOpacity style={styles.notificationItem} onPress={() => onPress(notification)}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: notification.fromUserProfileImageUrl || 'https://via.placeholder.com/40' }} 
          style={styles.avatar} 
        />
        <View style={[styles.iconBadge, { backgroundColor: color }]}>
          <Ionicons name={icon} size={12} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.username}>{notification.fromUsername}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        
        <View style={styles.rightContainer}>
          <Text style={styles.time}>
            {formatTime(notification.createdAt)}
          </Text>
          
          {notification.type === 'like' || notification.type === 'comment' ? (
            <Image 
              source={{ uri: notification.postImageUrl || 'https://via.placeholder.com/40' }} 
              style={styles.postThumbnail} 
            />
          ) : null}
        </View>
      </View>
      
      {!notification.read && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // If it's a Firestore timestamp, convert to Date
    if (timestamp instanceof Timestamp) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    
    // If it's already a string ISO date
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return '';
  }
};

const NotificationsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNotifications(notificationsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const handleNotificationPress = async (notification) => {
    // Mark as read if not already
    if (!notification.read) {
      try {
        const notificationRef = doc(db, 'notifications', notification.id);
        await updateDoc(notificationRef, { read: true });
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    switch(notification.type) {
      case 'like':
      case 'comment':
        navigation.navigate('PostDetail', { postId: notification.postId });
        break;
      case 'follow':
        navigation.navigate('Profile', { userId: notification.fromUserId });
        break;
      default:
        // Default navigation if type is unknown
        break;
    }
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={handleNotificationPress}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
          showsVerticalScrollIndicator={false}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  postThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.colors.primary,
  },
});

export default NotificationsScreen;