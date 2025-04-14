const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const db = admin.firestore();

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { lastVisible, limit = 20 } = req.query;
    
    let query = db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (lastVisible) {
      const lastDoc = await db.collection('comments').doc(lastVisible).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const commentsSnapshot = await query.get();
    
    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get user info for each comment
    const userIds = [...new Set(comments.map(comment => comment.userId))];
    
    if (userIds.length > 0) {
      const usersSnapshot = await db.collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
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
      comments.forEach(comment => {
        comment.user = users[comment.userId] || null;
      });
    }
    
    const lastVisibleId = comments.length > 0 ? comments[comments.length - 1].id : null;
    
    res.status(200).json({
      comments,
      lastVisible: lastVisibleId,
      hasMore: comments.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

// Create a new comment on a post
exports.createComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId, text } = req.body;
    
    if (!userId || !text) {
      return res.status(400).json({ error: 'User ID and comment text are required' });
    }
    
    // Check if post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const commentData = {
      id: uuidv4(),
      postId,
      userId,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('comments').doc(commentData.id).set(commentData);
    
    res.status(201).json({
      ...commentData
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    
    const commentDoc = await db.collection('comments').doc(commentId).get();
    
    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentData = commentDoc.data();
    
    // Check if the comment belongs to the requested post
    if (commentData.postId !== postId) {
      return res.status(400).json({ error: 'Comment does not belong to this post' });
    }
    
    // Check if the current user is the comment owner or post owner
    const userId = req.body.userId;
    if (commentData.userId !== userId) {
      // If not the comment owner, check if they're the post owner
      const postDoc = await db.collection('posts').doc(postId).get();
      
      if (!postDoc.exists) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      const postData = postDoc.data();
      
      if (postData.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
    }
    
    // Delete the comment
    await db.collection('comments').doc(commentId).delete();
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
