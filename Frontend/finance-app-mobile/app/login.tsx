import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (isRegistering) {
            const success = await signUp(email, password);
            if (success) {
                Alert.alert('Success', 'Account created! Please log in.');
                setIsRegistering(false);
            } else {
                Alert.alert('Error', 'Registration failed. Try again.');
            }
        } else {
            const success = await signIn(email, password);
            if (success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', 'Login failed. Check your credentials.');
            }
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Finance Assistant</ThemedText>
                        <ThemedText style={{ color: 'gray' }}>
                            {isRegistering ? 'Create a new account' : 'Welcome back, please login'}
                        </ThemedText>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Email</ThemedText>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }]}
                                placeholder="admin@example.com"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }]}
                                placeholder="••••••••"
                                placeholderTextColor="gray"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.tint, opacity: loading ? 0.7 : 1 }]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.btnText}>
                                    {isRegistering ? 'Sign Up' : 'Login'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.linkBtn}>
                            <ThemedText style={{ color: theme.tint }}>
                                {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
        color: 'gray',
        textTransform: 'uppercase',
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    btn: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkBtn: {
        alignItems: 'center',
        marginTop: 16,
    }
});
