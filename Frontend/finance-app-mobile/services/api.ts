import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// -------------------------------------------------------------------------------- //
// 🔧 API CONFIGURATION
// If using a physical device, replace 'localhost' with your computer's LAN IP (e.g. 192.168.1.5)
// -------------------------------------------------------------------------------- //
const LAN_IP = '192.168.0.100'; // <-- CHANGE THIS IF TESTING ON PHYSICAL DEVICE

const API_URL = Platform.select({
    // Android Physical Device (Expo Go) needs LAN IP
    android: `http://${LAN_IP}:5000`,
    ios: 'http://127.0.0.1:5000',
    web: 'http://127.0.0.1:5000',
    default: `http://${LAN_IP}:5000`,
});

async function getToken() {
    if (Platform.OS === 'web') {
        return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
}

export async function setToken(token: string) {
    if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
    } else {
        await SecureStore.setItemAsync('token', token);
    }
}

export async function removeToken() {
    if (Platform.OS === 'web') {
        localStorage.removeItem('token');
    } else {
        await SecureStore.deleteItemAsync('token');
    }
}

async function request(endpoint: string, method: string = 'GET', body: any = null) {
    const token = await getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log(`[API] ${method} ${API_URL}${endpoint}`);
        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (res.status === 401) {
            await removeToken();
            // You might want to trigger a global logout event here
            return null;
        }

        return res;
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error);
        return null;
    }
}

export const api = {
    get: (endpoint: string) => request(endpoint, 'GET'),
    post: (endpoint: string, body: any) => request(endpoint, 'POST', body),
    put: (endpoint: string, body: any) => request(endpoint, 'PUT', body),
    delete: (endpoint: string) => request(endpoint, 'DELETE'),
};
