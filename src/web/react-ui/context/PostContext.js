import React, { createContext, useContext, useState } from 'react';

const PostContext = createContext();

export const usePostContext = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePostContext must be used within a PostProvider');
    }
    return context;
};

export const PostProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generatePost = async (postType, customPrompt = '') => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: postType,
                    customPrompt
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate post');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const postToLinkedIn = async (postData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/post-to-linkedin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Failed to post to LinkedIn');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const saveToDatabase = async (postData) => {
        try {
            const response = await fetch('/api/save-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Failed to save post');
            }

            return await response.json();
        } catch (err) {
            console.error('Error saving post:', err);
            // Don't throw here as this is not critical
        }
    };

    const value = {
        loading,
        error,
        generatePost,
        postToLinkedIn,
        saveToDatabase,
        clearError: () => setError(null)
    };

    return (
        <PostContext.Provider value={value}>
            {children}
        </PostContext.Provider>
    );
}; 