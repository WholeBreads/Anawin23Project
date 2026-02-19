import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DATA_KEY = 'social_posts_data';

export default function AddPostScreen() {
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState('');
    const navigation = useNavigation();

    const handlePost = async () => {
        if (!content.trim() && !imageUri.trim()) {
            Alert.alert('Error', 'Please enter some content or add an image link.');
            return;
        }

        const newPost = {
            id: Date.now().toString(),
            content: content,
            imageUri: imageUri,
            timestamp: Date.now(),
        };

        try {
            const jsonValue = await AsyncStorage.getItem(DATA_KEY);
            const currentPosts = jsonValue != null ? JSON.parse(jsonValue) : [];
            const updatedPosts = [newPost, ...currentPosts]; // Add new post to top
            await AsyncStorage.setItem(DATA_KEY, JSON.stringify(updatedPosts));

            Alert.alert('Success', 'Post created successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Feed') }
            ]);
            setContent('');
            setImageUri('');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save post.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Create Post</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.contentInput}
                        placeholder="What's on your mind?"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        maxLength={500}
                    />

                    <TextInput
                        style={styles.imageInput}
                        placeholder="Image URL (optional)"
                        value={imageUri}
                        onChangeText={setImageUri}
                        autoCapitalize="none"
                    />

                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.previewImage}
                            resizeMode="contain"
                            onError={() => Alert.alert('Invalid Link', 'Could not load image from URL')}
                        />
                    ) : null}
                </View>

                <Button title="Post" onPress={handlePost} color="#1877f2" />

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#050505',
    },
    inputContainer: {
        marginBottom: 20,
    },
    contentInput: {
        fontSize: 18,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
    },
    imageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#eee',
    },
});
