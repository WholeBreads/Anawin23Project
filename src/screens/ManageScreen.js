import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DATA_KEY = 'social_posts_data';

export default function ManageScreen() {
    const [posts, setPosts] = useState([]);

    const loadPosts = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(DATA_KEY);
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];
            setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPosts();
        }, [])
    );

    const handleDelete = async (item) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedPosts = posts.filter(post => post.id !== item.id);
                            await AsyncStorage.setItem(DATA_KEY, JSON.stringify(updatedPosts));
                            setPosts(updatedPosts);
                        } catch (e) {
                            console.error("Error deleting post", e);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.textContainer}>
                <Text style={styles.listContent} numberOfLines={1}>{item.content || "Image Post"}</Text>
                <Text style={styles.listDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Posts</Text>
            </View>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No posts found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 10,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    listContent: {
        fontSize: 16,
        color: '#333',
    },
    listDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    deleteButton: {
        padding: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontSize: 16,
    },
});
