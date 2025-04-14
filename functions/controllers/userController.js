const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const db = admin.firestore();

// Get a user profile
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Remove sensitive information
    delete userData.email;
    delete userData.fcmToken;
    
    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update a user profile
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, bio, profileImageUrl, fcmToken } = req.body;
    
    // Check if the current user is the owner (in a real app, you'd verify this with authentication)
    if (userId !== req.body.userId) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }
    
    const updateData = {};
    
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (fcmToken !== undefined) updateData.fcmToken = fcmToken;
    
    await db.collection('users').doc(userId).update(updateData);
    
    res.status(200).json({
      id: userId,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Get a user's followers
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lastVisible, limit = 20 } = req.query;
    
    let query = db.collection('follows')
      .where('followingId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (lastVisible) {
      const lastDoc = await db.collection('follows').doc(lastVisible).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const followersSnapshot = await query.get();
    
    const followerIds = [];
    const follows = [];
    
    followersSnapshot.forEach(doc => {
      const followData = doc.data();
      followerIds.push(followData.followerId);
      follows.push({
        id: doc.id,
        ...followData
      });
    });
    
    // Get user info for each follower
    const followers = [];
    
    if (followerIds.length > 0) {
      const usersSnapshot = await db.collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', followerIds)
        .get();
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Remove sensitive information
        delete userData.email;
        delete userData.fcmToken;
        
        followers.push({
          id: doc.id,
          ...userData
        });
      });
    }
    
    const lastVisibleId = follows.length > 0 ? follows[follows.length - 1].id : null;
    
    res.status(200).json({
      followers,
      lastVisible: lastVisibleId,
      hasMore: follows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
};

// Get users that a user is following
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lastVisible, limit = 20 } = req.query;
    
    let query = db.collection('follows')
      .where('followerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (lastVisible) {
      const lastDoc = await db.collection('follows').doc(lastVisible).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const followingSnapshot = await query.get();
    
    const followingIds = [];
    const follows = [];
    
    followingSnapshot.forEach(doc => {
      const followData = doc.data();
      followingIds.push(followData.followingId);
      follows.push({
        id: doc.id,
        ...followData
      });
    });
    
    // Get user info for each following
    const following = [];
    
    if (followingIds.length > 0) {
      const usersSnapshot = await db.collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', followingIds)
        .get();
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Remove sensitive information
        delete userData.email;
        delete userData.fcmToken;
        
        following.push({
          id: doc.id,
          ...userData
        });
      });
    }
    
    const lastVisibleId = follows.length > 0 ? follows[follows.length - 1].id : null;
    
    res.status(200).json({
      following,
      lastVisible: lastVisibleId,
      hasMore: follows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followingId = req.params.userId; // The user being followed
    const followerId = req.body.userId; // The user doing the following
    
    if (followingId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if the follow relationship already exists
    const existingFollow = await db.collection('follows')
      .where('followerId', '==', followerId)
      .where('followingId', '==', followingId)
      .limit(1)
      .get();
    
    if (!existingFollow.empty) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    const followData = {
      id: uuidv4(),
      followerId,
      followingId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('follows').doc(followData.id).set(followData);
    
    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followingId = req.params.userId; // The user being unfollowed
    const followerId = req.body.userId; // The user doing the unfollowing
    
    // Find the follow relationship
    const followsSnapshot = await db.collection('follows')
      .where('followerId', '==', followerId)
      .where('followingId', '==', followingId)
      .limit(1)
      .get();
    
    if (followsSnapshot.empty) {
      return res.status(404).json({ error: 'Not following this user' });
    }
    
    // Delete the follow document
    await followsSnapshot.docs[0].ref.delete();
    
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};
