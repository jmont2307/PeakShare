const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const db = admin.firestore();
const storage = admin.storage();

// Get feed of posts (sorted by date, paginated)
exports.getFeed = async (req, res) => {
  try {
    const { lastVisible, userId, limit = 10 } = req.query;
    
    let query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    // If user ID is provided, only get posts from users they follow
    if (userId) {
      // Get list of users the current user follows
      const followingSnapshot = await db.collection('follows')
        .where('followerId', '==', userId)
        .get();
      
      const followingIds = [];
      followingSnapshot.forEach(doc => {
        followingIds.push(doc.data().followingId);
      });
      
      // Add the user's own ID to see their own posts
      followingIds.push(userId);
      
      query = query.where('userId', 'in', followingIds);
    }
    
    // If pagination cursor provided
    if (lastVisible) {
      const lastDoc = await db.collection('posts').doc(lastVisible).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    
    const posts = [];
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const lastVisibleId = posts.length > 0 ? posts[posts.length - 1].id : null;
    
    res.status(200).json({
      posts,
      lastVisible: lastVisibleId,
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting posts feed:', error);
    res.status(500).json({ error: 'Failed to get posts feed' });
  }
};

// Get a single post by ID
exports.getPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = {
      id: postDoc.id,
      ...postDoc.data()
    };
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { userId, imageUrls, caption, location, tags } = req.body;
    
    if (!userId || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: 'User ID and at least one image URL are required' });
    }
    
    const postData = {
      userId,
      imageUrls,
      caption: caption || '',
      location: location || null,
      tags: tags || [],
      likeCount: 0,
      commentCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const postRef = await db.collection('posts').add(postData);
    
    res.status(201).json({
      id: postRef.id,
      ...postData
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Update an existing post
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { caption, location, tags } = req.body;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postData = postDoc.data();
    
    // Check if the current user is the owner (in a real app, you'd verify this with authentication)
    const userId = req.body.userId;
    if (postData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (caption !== undefined) updateData.caption = caption;
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = tags;
    
    await db.collection('posts').doc(postId).update(updateData);
    
    res.status(200).json({
      id: postId,
      ...postData,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postData = postDoc.data();
    
    // Check if the current user is the owner (in a real app, you'd verify this with authentication)
    const userId = req.body.userId;
    if (postData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // Delete any images from storage
    const imageUrls = postData.imageUrls || [];
    const bucket = storage.bucket();
    
    const deletePromises = imageUrls.map(async (imageUrl) => {
      // Extract the image path from the URL
      const imagePathMatch = imageUrl.match(/\/o\/(.+)\?alt=media/);
      if (imagePathMatch && imagePathMatch[1]) {
        const imagePath = decodeURIComponent(imagePathMatch[1]);
        try {
          // Delete the original image
          await bucket.file(imagePath).delete();
          
          // Delete thumbnails
          const fileDir = imagePath.substring(0, imagePath.lastIndexOf('/') + 1);
          const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
          const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
          const fileExt = fileName.substring(fileName.lastIndexOf('.'));
          
          const thumbFileSmall = `${fileDir}${fileNameWithoutExt}_thumb_small${fileExt}`;
          const thumbFileMedium = `${fileDir}${fileNameWithoutExt}_thumb_medium${fileExt}`;
          
          await bucket.file(thumbFileSmall).delete().catch(() => {});
          await bucket.file(thumbFileMedium).delete().catch(() => {});
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
        }
      }
    });
    
    await Promise.all(deletePromises);
    
    // Delete the post document
    await db.collection('posts').doc(postId).delete();
    
    // Delete associated comments
    const commentsSnapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .get();
    
    const commentDeletePromises = [];
    commentsSnapshot.forEach(doc => {
      commentDeletePromises.push(doc.ref.delete());
    });
    
    // Delete associated likes
    const likesSnapshot = await db.collection('likes')
      .where('postId', '==', postId)
      .get();
    
    const likeDeletePromises = [];
    likesSnapshot.forEach(doc => {
      likeDeletePromises.push(doc.ref.delete());
    });
    
    await Promise.all([...commentDeletePromises, ...likeDeletePromises]);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
