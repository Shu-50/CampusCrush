import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Multiple API URLs to try in order (working URL first for faster connection)
const API_URLS = __DEV__ ? [
    'http://10.156.157.133:5001/api', // Working URL - put first for speed
    Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api',
    'http://127.0.0.1:5001/api',
    'http://192.168.1.100:5001/api', // Common router IP range
] : ['https://your-production-api.com/api'];

const API_BASE_URL = API_URLS[0]; // Start with first URL (now the working one)

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.workingURL = null; // Cache for working URL
        this.lastConnectionTest = 0; // Timestamp of last connection test
        console.log('🔗 API Service initialized with URL:', this.baseURL);
        console.log('📱 Platform:', Platform.OS);
    }

    // Test connectivity with multiple URLs
    async testConnection() {
        // If we have a cached working URL and it was tested recently (within 30 seconds), use it
        const now = Date.now();
        if (this.workingURL && (now - this.lastConnectionTest) < 30000) {
            console.log('🚀 Using cached working URL:', this.workingURL);
            this.baseURL = this.workingURL;
            return { success: true, workingURL: this.workingURL };
        }

        console.log('🧪 Testing connection with multiple URLs...');

        for (let i = 0; i < API_URLS.length; i++) {
            const testURL = API_URLS[i];
            try {
                console.log(`🔍 Trying URL ${i + 1}/${API_URLS.length}:`, testURL);

                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

                const response = await fetch(`${testURL.replace('/api', '')}/api/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Connection successful with URL:', testURL);

                    // Update the base URL and cache the working URL
                    this.baseURL = testURL;
                    this.workingURL = testURL;
                    this.lastConnectionTest = Date.now();

                    return { success: true, data, workingURL: testURL };
                }
            } catch (error) {
                console.log(`❌ URL ${i + 1} failed:`, error.message);
                continue;
            }
        }

        return {
            success: false,
            error: 'All connection attempts failed. Please check if backend is running.'
        };
    }

    async getAuthToken() {
        try {
            return await AsyncStorage.getItem('authToken');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    async setAuthToken(token) {
        try {
            await AsyncStorage.setItem('authToken', token);
        } catch (error) {
            console.error('Error setting auth token:', error);
        }
    }

    async removeAuthToken() {
        try {
            await AsyncStorage.removeItem('authToken');
        } catch (error) {
            console.error('Error removing auth token:', error);
        }
    }

    async makeRequest(endpoint, options = {}) {
        const token = await this.getAuthToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        const fullUrl = `${this.baseURL}${endpoint}`;
        console.log('📡 Making API request to:', fullUrl);

        try {
            // Add timeout to main request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for main requests

            const response = await fetch(fullUrl, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', response.status, errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || 'API request failed' };
                }

                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Success:', endpoint, data.success);
            return data;
        } catch (error) {
            console.error('❌ API request error:', error);

            if (error.name === 'AbortError') {
                console.log('⏱️ Request timed out, testing connection...');
            }

            if (error.message === 'Network request failed' || error.message.includes('fetch') || error.name === 'AbortError') {
                // Try to find a working URL
                console.log('🔄 Network failed, testing connection...');
                const testResult = await this.testConnection();

                if (testResult.success) {
                    console.log('🔄 Retrying with working URL:', this.baseURL);
                    // Retry the request with the working URL
                    const retryUrl = `${this.baseURL}${endpoint}`;
                    const retryResponse = await fetch(retryUrl, config);

                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        console.log('✅ Retry successful');
                        return retryData;
                    }
                }

                throw new Error('Cannot connect to server. Please check if the backend is running on port 5001.');
            }

            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        // Validate required fields
        if (!userData.name || !userData.email || !userData.password) {
            throw new Error('Name, email, and password are required');
        }

        if (!userData.email.includes('@') || !userData.email.includes('.edu')) {
            throw new Error('Please use a valid college email address');
        }

        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        // Validate required fields
        if (!credentials.email || !credentials.password) {
            throw new Error('Email and password are required');
        }

        if (!credentials.email.includes('@') || !credentials.email.includes('.edu')) {
            throw new Error('Please use a valid college email address');
        }

        const response = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data.token) {
            await this.setAuthToken(response.data.token);
        }

        return response;
    }

    async logout() {
        await this.makeRequest('/auth/logout', { method: 'POST' });
        await this.removeAuthToken();
    }

    async getCurrentUser() {
        // Use the profile endpoint to get complete user data
        try {
            const response = await this.makeRequest('/users/profile');
            return response;
        } catch (error) {
            // Fallback to auth/me if profile endpoint fails
            console.log('Profile endpoint failed, trying auth/me:', error.message);
            return this.makeRequest('/auth/me');
        }
    }

    // User endpoints
    async updateProfile(profileData) {
        return this.makeRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async getProfileOptions() {
        return this.makeRequest('/users/profile-options');
    }

    async uploadPhoto(imageUri) {
        const token = await this.getAuthToken();

        const formData = new FormData();
        formData.append('photo', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        });

        // Make request directly to avoid Content-Type conflicts
        const fullUrl = `${this.baseURL}/users/upload-photo`;
        console.log('📡 Making API request to:', fullUrl);

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                    // Don't set Content-Type for multipart/form-data
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', response.status, errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || 'Upload failed' };
                }

                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Success: /users/upload-photo', data.success);
            return data;
        } catch (error) {
            console.error('❌ Upload error:', error);
            throw error;
        }
    }

    async deletePhoto(publicId) {
        console.log('🗑️ Deleting photo with publicId:', publicId);
        const encodedPublicId = encodeURIComponent(publicId);
        console.log('🔗 Encoded publicId:', encodedPublicId);
        console.log('🔗 Delete URL:', `/users/photo/${encodedPublicId}`);
        return this.makeRequest(`/users/photo/${encodedPublicId}`, {
            method: 'DELETE',
        });
    }

    async setMainPhoto(publicId) {
        console.log('⭐ Setting main photo with publicId:', publicId);
        const encodedPublicId = encodeURIComponent(publicId);
        console.log('🔗 Encoded publicId for main photo:', encodedPublicId);
        return this.makeRequest(`/users/photo/${encodedPublicId}/main`, {
            method: 'PUT',
        });
    }

    async getDiscoverUsers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.makeRequest(`/users/discover?${queryParams}`);
    }

    // Matching endpoints
    async swipeUser(targetUserId, action) {
        return this.makeRequest('/matches/swipe', {
            method: 'POST',
            body: JSON.stringify({ targetUserId, action }),
        });
    }

    async getMatches(page = 1) {
        return this.makeRequest(`/matches?page=${page}`);
    }

    async getMatch(matchId) {
        return this.makeRequest(`/matches/${matchId}`);
    }

    async unmatch(matchId, reason) {
        return this.makeRequest(`/matches/${matchId}`, {
            method: 'DELETE',
            body: JSON.stringify({ reason }),
        });
    }

    // Chat endpoints
    async getChatMessages(matchId, page = 1) {
        return this.makeRequest(`/chat/matches/${matchId}/messages?page=${page}`);
    }

    async sendMessage(matchId, content, type = 'text', replyTo = null) {
        return this.makeRequest(`/chat/matches/${matchId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, type, replyTo }),
        });
    }

    async sendMediaMessage(matchId, mediaUri, type = 'image') {
        const formData = new FormData();
        formData.append('media', {
            uri: mediaUri,
            type: type === 'image' ? 'image/jpeg' : 'video/mp4',
            name: type === 'image' ? 'image.jpg' : 'video.mp4',
        });

        return this.makeRequest(`/chat/matches/${matchId}/messages/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });
    }

    async markMessageAsRead(messageId) {
        return this.makeRequest(`/chat/messages/${messageId}/read`, {
            method: 'PUT',
        });
    }

    async deleteMessage(messageId) {
        return this.makeRequest(`/chat/messages/${messageId}`, {
            method: 'DELETE',
        });
    }

    async getUnreadCount() {
        return this.makeRequest('/chat/unread-count');
    }



    // Notification endpoints
    async getNotifications(page = 1, type = null, unreadOnly = false) {
        const params = new URLSearchParams({
            page,
            ...(type && { type }),
            unreadOnly,
            _t: Date.now() // Prevent caching
        });
        return this.makeRequest(`/notifications?${params}`);
    }

    async markNotificationAsRead(id) {
        return this.makeRequest(`/notifications/${id}/read`, {
            method: 'PUT',
        });
    }

    async markAllNotificationsAsRead() {
        return this.makeRequest('/notifications/mark-all-read', {
            method: 'PUT',
        });
    }

    async getUnreadNotificationCount() {
        return this.makeRequest('/notifications/unread-count');
    }

    // Photo like endpoint - TODO: Implement backend endpoint
    // Backend should expect: { photoUrl: "url", isLike: true/false }
    // Backend should return: { success: true, data: { likeCount: 25 } }
    // Currently disabled in frontend until backend is ready
    async likePhoto(photoUrl, isLike) {
        return this.makeRequest('/photos/like', {
            method: 'POST',
            body: JSON.stringify({ photoUrl, isLike }),
        });
    }

    // Confession endpoints
    async getConfessions(category = 'all', page = 1) {
        const params = new URLSearchParams({ category, page });
        return this.makeRequest(`/confessions?${params}`);
    }

    async createConfession(content, category = 'secret') {
        return this.makeRequest('/confessions', {
            method: 'POST',
            body: JSON.stringify({ content, category }),
        });
    }



    async reactToConfession(confessionId, type) {
        return this.makeRequest(`/confessions/${confessionId}/react`, {
            method: 'POST',
            body: JSON.stringify({ type }),
        });
    }
}

export default new ApiService();