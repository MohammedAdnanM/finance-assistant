import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import * as Haptics from 'expo-haptics';

export default function ChatScreen() {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your AI financial coach. How can I help you today?', sender: 'ai' },
    ]);
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleSend = async () => {
        if (!msg.trim() || loading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMsg = { id: Date.now().toString(), text: msg, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setMsg('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { message: msg });
            if (res && res.ok) {
                const data = await res.json();
                const aiMsg = {
                    id: Date.now().toString(),
                    text: data.response || "Something went wrong.",
                    sender: 'ai'
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm having trouble connecting.", sender: 'ai' }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "Connection error.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <ThemedText type="title">AI Coach</ThemedText>
                </View>

                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.msgBubble,
                            item.sender === 'user'
                                ? { alignSelf: 'flex-end', backgroundColor: theme.tint }
                                : { alignSelf: 'flex-start', backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e5e5' }
                        ]}>
                            <ThemedText style={{ color: item.sender === 'user' ? '#fff' : theme.text }}>
                                {item.text}
                            </ThemedText>
                        </View>
                    )}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={[styles.inputContainer, { borderTopColor: colorScheme === 'dark' ? '#333' : '#eee', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }]}
                            placeholder="Ask me anything..."
                            placeholderTextColor="gray"
                            value={msg}
                            onChangeText={setMsg}
                            multiline={false}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            style={[styles.sendBtn, { backgroundColor: theme.tint }]}
                            disabled={loading}
                        >
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    chatContent: {
        padding: 16,
        gap: 12,
    },
    msgBubble: {
        padding: 12,
        borderRadius: 16,
        maxWidth: '80%',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        padding: 12,
        borderRadius: 24,
        fontSize: 16,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
