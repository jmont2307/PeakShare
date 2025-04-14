const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// API routes setup
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Import route controllers
const postController = require('./controllers/postController');
const userController = require('./controllers/userController');
const commentController = require('./controllers/commentController');

// -------------------------------------------
// API Routes
// -------------------------------------------

// Post routes
app.get('/posts', postController.getFeed);
app.get('/posts/:postId', postController.getPost);
app.post('/posts', postController.createPost);
app.put('/posts/:postId', postController.updatePost);
app.delete('/posts/:postId', postController.deletePost);

// Comment routes
app.get('/posts/:postId/comments', commentController.getComments);
app.post('/posts/:postId/comments', commentController.createComment);
app.delete('/posts/:postId/comments/:commentId', commentController.deleteComment);

// User routes
app.get('/users/:userId', userController.getUser);
app.put('/users/:userId', userController.updateUser);
app.get('/users/:userId/followers', userController.getFollowers);
app.get('/users/:userId/following', userController.getFollowing);
app.post('/users/:userId/follow', userController.followUser);
app.delete('/users/:userId/follow', userController.unfollowUser);

// Export the api as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);

// -------------------------------------------
// Cloud Functions (Triggers)
// -------------------------------------------

// Function to create image thumbnails when new post images are uploaded
exports.generateThumbnails = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  
  // Exit if this is triggered on a file that is not an image or is already a thumbnail
  if (!filePath.startsWith('posts/') || 
      filePath.includes('_thumb_') || 
      !object.contentType.startsWith('image/')) {
    return null;
  }
  
  const fileDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));
  
  const thumbFileSmall = `${fileDir}${fileNameWithoutExt}_thumb_small${fileExt}`;
  const thumbFileMedium = `${fileDir}${fileNameWithoutExt}_thumb_medium${fileExt}`;
  
  const bucket = storage.bucket(object.bucket);
  const file = bucket.file(filePath);
  
  const [fileContent] = await file.download();
  
  // Generate small thumbnail (200x200)
  const smallThumbBuffer = await sharp(fileContent)
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  
  // Generate medium thumbnail (600x600)
  const mediumThumbBuffer = await sharp(fileContent)
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  
  // Upload thumbnails to storage
  const smallThumbFile = bucket.file(thumbFileSmall);
  const mediumThumbFile = bucket.file(thumbFileMedium);
  
  await smallThumbFile.save(smallThumbBuffer, {
    metadata: {
      contentType: object.contentType,
      metadata: {
        originalFilePath: filePath
      }
    }
  });
  
  await mediumThumbFile.save(mediumThumbBuffer, {
    metadata: {
      contentType: object.contentType,
      metadata: {
        originalFilePath: filePath
      }
    }
  });
  
  // Make thumbnails publicly accessible
  await smallThumbFile.makePublic();
  await mediumThumbFile.makePublic();
  
  return null;
});

// Function to send notification when someone likes a post
exports.sendLikeNotification = functions.firestore
  .document('likes/{likeId}')
  .onCreate(async (snapshot, context) => {
    const likeData = snapshot.data();
    const { userId, postId } = likeData;
    
    try {
      // Get post information
      const postDoc = await db.collection('posts').doc(postId).get();
      
      if (!postDoc.exists) {
        console.log('Post not found');
        return null;
      }
      
      const postData = postDoc.data();
      const postOwnerUserId = postData.userId;
      
      // Don't send notification if user likes their own post
      if (userId === postOwnerUserId) {
        return null;
      }
      
      // Get the user who liked the post
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.log('User not found');
        return null;
      }
      
      const userData = userDoc.data();
      
      // Create notification
      const notification = {
        id: uuidv4(),
        type: 'like',
        userId: postOwnerUserId, // user receiving the notification
        fromUserId: userId, // user who triggered the notification
        fromUsername: userData.username,
        fromUserProfileImageUrl: userData.profileImageUrl || '',
        postId,
        postImageUrl: postData.imageUrls[0] || '',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Save notification to Firestore
      await db.collection('notifications').doc(notification.id).set(notification);
      
      // Get user's FCM token for push notification
      const ownerUserDoc = await db.collection('users').doc(postOwnerUserId).get();
      
      if (!ownerUserDoc.exists) {
        console.log('Post owner not found');
        return null;
      }
      
      const ownerUserData = ownerUserDoc.data();
      const fcmToken = ownerUserData.fcmToken;
      
      if (fcmToken) {
        const message = {
          token: fcmToken,
          notification: {
            title: 'New Like',
            body: `${userData.username} liked your post`
          },
          data: {
            type: 'like',
            postId,
            userId
          },
          android: {
            notification: {
              icon: 'ic_notification',
              color: '#0066CC'
            }
          },
          apns: {
            payload: {
              aps: {
                badge: 1
              }
            }
          }
        };
        
        await admin.messaging().send(message);
      }
      
      return null;
    } catch (error) {
      console.error('Error sending like notification:', error);
      return null;
    }
  });

// Function to send notification when someone comments on a post
exports.sendCommentNotification = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const commentData = snapshot.data();
    const { userId, postId, text } = commentData;
    
    try {
      // Get post information
      const postDoc = await db.collection('posts').doc(postId).get();
      
      if (!postDoc.exists) {
        console.log('Post not found');
        return null;
      }
      
      const postData = postDoc.data();
      const postOwnerUserId = postData.userId;
      
      // Don't send notification if user comments on their own post
      if (userId === postOwnerUserId) {
        return null;
      }
      
      // Get the user who commented
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.log('User not found');
        return null;
      }
      
      const userData = userDoc.data();
      
      // Create notification
      const notification = {
        id: uuidv4(),
        type: 'comment',
        userId: postOwnerUserId,
        fromUserId: userId,
        fromUsername: userData.username,
        fromUserProfileImageUrl: userData.profileImageUrl || '',
        postId,
        postImageUrl: postData.imageUrls[0] || '',
        commentText: text.length > 50 ? `${text.substring(0, 47)}...` : text,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Save notification to Firestore
      await db.collection('notifications').doc(notification.id).set(notification);
      
      // Get user's FCM token for push notification
      const ownerUserDoc = await db.collection('users').doc(postOwnerUserId).get();
      
      if (!ownerUserDoc.exists) {
        console.log('Post owner not found');
        return null;
      }
      
      const ownerUserData = ownerUserDoc.data();
      const fcmToken = ownerUserData.fcmToken;
      
      if (fcmToken) {
        const message = {
          token: fcmToken,
          notification: {
            title: 'New Comment',
            body: `${userData.username}: ${notification.commentText}`
          },
          data: {
            type: 'comment',
            postId,
            commentId: snapshot.id
          },
          android: {
            notification: {
              icon: 'ic_notification',
              color: '#0066CC'
            }
          },
          apns: {
            payload: {
              aps: {
                badge: 1
              }
            }
          }
        };
        
        await admin.messaging().send(message);
      }
      
      return null;
    } catch (error) {
      console.error('Error sending comment notification:', error);
      return null;
    }
  });

// Function to update comment count when a comment is added or deleted
exports.updateCommentCount = functions.firestore
  .document('comments/{commentId}')
  .onWrite(async (change, context) => {
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    
    // Comment was deleted
    if (beforeData && !afterData) {
      try {
        await db.collection('posts').doc(beforeData.postId).update({
          commentCount: admin.firestore.FieldValue.increment(-1)
        });
      } catch (error) {
        console.error('Error updating comment count on delete:', error);
      }
    }
    
    // New comment was added
    if (!beforeData && afterData) {
      try {
        await db.collection('posts').doc(afterData.postId).update({
          commentCount: admin.firestore.FieldValue.increment(1)
        });
      } catch (error) {
        console.error('Error updating comment count on create:', error);
      }
    }
    
    return null;
  });

// Function to update follower/following counts when a follow relationship changes
exports.updateFollowCounts = functions.firestore
  .document('follows/{followId}')
  .onWrite(async (change, context) => {
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    
    const batch = db.batch();
    
    try {
      // Follow relationship was deleted
      if (beforeData && !afterData) {
        const followerId = beforeData.followerId;
        const followingId = beforeData.followingId;
        
        // Decrement follower count for the user being followed
        const followingRef = db.collection('users').doc(followingId);
        batch.update(followingRef, {
          followerCount: admin.firestore.FieldValue.increment(-1)
        });
        
        // Decrement following count for the user who was following
        const followerRef = db.collection('users').doc(followerId);
        batch.update(followerRef, {
          followingCount: admin.firestore.FieldValue.increment(-1)
        });
      }
      
      // New follow relationship was created
      if (!beforeData && afterData) {
        const followerId = afterData.followerId;
        const followingId = afterData.followingId;
        
        // Increment follower count for the user being followed
        const followingRef = db.collection('users').doc(followingId);
        batch.update(followingRef, {
          followerCount: admin.firestore.FieldValue.increment(1)
        });
        
        // Increment following count for the user who is following
        const followerRef = db.collection('users').doc(followerId);
        batch.update(followerRef, {
          followingCount: admin.firestore.FieldValue.increment(1)
        });
        
        // Create notification for follow
        const followerDoc = await db.collection('users').doc(followerId).get();
        if (followerDoc.exists) {
          const followerData = followerDoc.data();
          
          const notification = {
            id: uuidv4(),
            type: 'follow',
            userId: followingId,
            fromUserId: followerId,
            fromUsername: followerData.username,
            fromUserProfileImageUrl: followerData.profileImageUrl || '',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          batch.set(db.collection('notifications').doc(notification.id), notification);
          
          // Send push notification
          const followingDoc = await db.collection('users').doc(followingId).get();
          if (followingDoc.exists) {
            const followingData = followingDoc.data();
            const fcmToken = followingData.fcmToken;
            
            if (fcmToken) {
              const message = {
                token: fcmToken,
                notification: {
                  title: 'New Follower',
                  body: `${followerData.username} started following you`
                },
                data: {
                  type: 'follow',
                  userId: followerId
                }
              };
              
              await admin.messaging().send(message);
            }
          }
        }
      }
      
      await batch.commit();
      return null;
    } catch (error) {
      console.error('Error updating follow counts:', error);
      return null;
    }
  });

// Function to analyze content for inappropriate images
exports.moderateImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  
  // Only run this function on original post images
  if (!filePath.startsWith('posts/') || 
      filePath.includes('_thumb_') || 
      !object.contentType.startsWith('image/')) {
    return null;
  }
  
  try {
    // Extract user ID and image path for database updates
    const pathParts = filePath.split('/');
    if (pathParts.length < 3) return null;
    
    const userId = pathParts[1];
    const imageFileName = pathParts[2];
    
    // Here you would typically call a content moderation API
    // This is a placeholder for where you'd implement Google Cloud Vision API or similar
    
    // For demonstration purposes, let's assume we have a result
    const moderationResult = {
      isInappropriate: false,
      containsAdult: false,
      containsViolence: false,
      confidence: 0.1
    };
    
    // If the image is flagged, mark it for review
    if (moderationResult.isInappropriate) {
      await db.collection('contentModeration').add({
        userId,
        filePath,
        result: moderationResult,
        status: 'flagged',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // For highly confident detections, you might want to make the image private
      if (moderationResult.confidence > 0.8) {
        const bucket = storage.bucket(object.bucket);
        const file = bucket.file(filePath);
        await file.makePrivate();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error moderating image:', error);
    return null;
  }
});

// Function to calculate and update ski statistics
exports.updateSkiStats = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const postData = snapshot.data();
    const { userId, location } = postData;
    
    if (!userId || !location) return null;
    
    try {
      // Check if this resort has been visited before by this user
      const resortVisitsQuery = await db.collection('posts')
        .where('userId', '==', userId)
        .where('location.name', '==', location.name)
        .orderBy('createdAt', 'asc')
        .limit(2)
        .get();
      
      // If this is the first visit to this resort, increment resortCount
      let isFirstVisit = resortVisitsQuery.size === 1;
      
      if (isFirstVisit) {
        await db.collection('users').doc(userId).update({
          'skiStats.resortCount': admin.firestore.FieldValue.increment(1)
        });
      }
      
      // You could add more sophisticated ski statistics here, such as:
      // - Calculate elevation based on resort data
      // - Estimate distance skied based on activity data
      // - Track consecutive days skied
      
      return null;
    } catch (error) {
      console.error('Error updating ski stats:', error);
      return null;
    }
  });