import { configureStore } from '@reduxjs/toolkit';
import feedReducer from './slices/feedSlice';
import postsReducer from './slices/postsSlice';
import userReducer from './slices/userSlice';
import resortsReducer from './slices/resortsSlice';

export const store = configureStore({
  reducer: {
    feed: feedReducer,
    posts: postsReducer,
    user: userReducer,
    resorts: resortsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specified action types and paths
        ignoredActions: ['posts/createPost/fulfilled'],
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        ignoredPaths: [
          'feed.posts.*.createdAt',
          'feed.posts.*.updatedAt',
          'posts.userPosts.*.createdAt',
          'posts.userPosts.*.updatedAt',
          'posts.currentPost.createdAt',
          'posts.currentPost.updatedAt',
        ],
      },
    }),
});