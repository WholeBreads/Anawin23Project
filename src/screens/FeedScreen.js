import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Share, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DATA_KEY = 'social_posts_data';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const loadPosts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(DATA_KEY);
      const data = jsonValue != null ? JSON.parse(jsonValue) : [];
      setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error(e);
    }
  };

  const savePosts = async (updatedPosts) => {
    try {
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(updatedPosts));
      setPosts([...updatedPosts].sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  // --- Like ---
  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  // --- Comment ---
  const toggleComment = (postId) => {
    if (commentingPostId === postId) {
      setCommentingPostId(null);
      setCommentText('');
    } else {
      setCommentingPostId(postId);
      setCommentText('');
    }
  };

  const handleAddComment = (postId) => {
    if (!commentText.trim()) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const existingComments = post.comments || [];
        return {
          ...post,
          comments: [
            ...existingComments,
            {
              id: Date.now().toString(),
              text: commentText.trim(),
              timestamp: Date.now(),
            },
          ],
        };
      }
      return post;
    });
    savePosts(updatedPosts);
    setCommentText('');
  };

  // --- Share ---
  const handleShare = async (item) => {
    try {
      const message = item.content
        ? item.content
        : 'Check out this post!';
      await Share.share({
        message: item.imageUri
          ? `${message}\n\n${item.imageUri}`
          : message,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share this post.');
    }
  };

  const renderItem = ({ item }) => {
    const likeCount = item.likes || 0;
    const comments = item.comments || [];
    const isCommenting = commentingPostId === item.id;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.username}>User</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content}>{item.content}</Text>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.postImage} resizeMode="cover" />
        ) : null}

        {/* Like & Comment counts */}
        {(likeCount > 0 || comments.length > 0) && (
          <View style={styles.countsRow}>
            {likeCount > 0 && (
              <Text style={styles.countText}>👍 {likeCount}</Text>
            )}
            {comments.length > 0 && (
              <TouchableOpacity onPress={() => toggleComment(item.id)}>
                <Text style={styles.countText}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Text style={[styles.actionText, item.liked && styles.actionTextActive]}>
              {item.liked ? '👍 Liked' : '👍 Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => toggleComment(item.id)}>
            <Text style={[styles.actionText, isCommenting && styles.actionTextActive]}>
              💬 Comment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Text style={styles.actionText}>🔗 Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comment section */}
        {isCommenting && (
          <View style={styles.commentSection}>
            {/* Existing comments */}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentBubble}>
                <Text style={styles.commentUser}>User</Text>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            ))}

            {/* New comment input */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={() => handleAddComment(item.id)}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => handleAddComment(item.id)}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet.</Text>
            <Text style={styles.emptySubText}>Create your first post!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877f2',
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countText: {
    color: '#666',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  actionText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },
  actionTextActive: {
    color: '#1877f2',
  },
  commentSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#1877f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
});
