import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import {
  Appbar,
  Text,
  ActivityIndicator,
  Avatar,
  Divider
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchNotifications, markNotificationAsRead } from '../../redux/slices/userSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like':
      return { name: 'heart', color: '#FF4136' };
    case 'comment':
      return { name: 'comment-text', color: '#0074D9' };
    case 'follow':
      return { name: 'account-plus', color: '#2ECC40' };
    case 'tag':
      return { name: 'tag', color: '#FF851B' };
    case 'mention':
      return { name: 'at', color: '#B10DC9' };
    default:
      return { name: 'bell', color: '#AAAAAA' };
  }
};

const NotificationItem = ({ notification, onPress, onUserPress }) => {
  const icon = getNotificationIcon(notification.type);
  
  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        notification.unread ? styles.unreadNotification : null
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.notificationIconContainer}>
        <MaterialCommunityIcons
          name={icon.name}
          size={24}
          color={icon.color}
          style={styles.notificationTypeIcon}
        />
      </View>
      
      <TouchableOpacity
        style={styles.userAvatarContainer}
        onPress={() => onUserPress(notification.fromUser)}
      >
        <Avatar.Image
          source={{ uri: notification.fromUser.profileImageUrl || 'https://via.placeholder.com/40' }}
          size={40}
        />
      </TouchableOpacity>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <TouchableOpacity onPress={() => onUserPress(notification.fromUser)}>
            <Text style={styles.username}>{notification.fromUser.displayName}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </Text>
        </View>
        
        <Text style={styles.notificationText}>{notification.text}</Text>
      </View>
      
      {notification.postImage && (
        <TouchableOpacity
          style={styles.postImageContainer}
          onPress={() => onPress(notification)}
        >
          <Image
            source={{ uri: notification.postImage }}
            style={styles.postImage}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { notifications, loading } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };
  
  const handleNotificationPress = (notification) => {
    // Mark notification as read if it's unread
    if (notification.unread) {
      dispatch(markNotificationAsRead(notification.id));
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'tag':
        navigation.navigate('PostDetail', { postId: notification.postId });
        break;
      case 'follow':
        navigation.navigate('OtherUserProfile', { userId: notification.fromUser.id });
        break;
      case 'mention':
        navigation.navigate('PostDetail', { postId: notification.postId });
        break;
      default:
        break;
    }
  };
  
  const handleUserPress = (user) => {
    if (user.id === user.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('OtherUserProfile', { userId: user.id });
    }
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bell-off" size={60} color="#AAAAAA" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>
        When someone likes or comments on your posts, you'll see it here
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      
      {loading && !refreshing && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
              onUserPress={handleUserPress}
            />
          )}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0066CC']}
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
  },
  notificationIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTypeIcon: {
    
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  postImageContainer: {
    marginLeft: 8,
  },
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default NotificationsScreen;