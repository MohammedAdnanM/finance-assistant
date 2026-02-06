import { StyleSheet, FlatList, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/context/TransactionContext';

import * as Haptics from 'expo-haptics';

export default function TransactionsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const iconBg = colorScheme === 'dark' ? '#333' : '#eee';
    const router = useRouter();
    const { transactions, deleteTransaction } = useTransactions();

    const handleDelete = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Delete Transaction",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        deleteTransaction(id);
                    }
                }
            ]
        );
    };

    const handleEdit = (id: string) => {
        Haptics.selectionAsync();
        router.push({ pathname: '/modal', params: { id } });
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <ThemedText type="title">Transactions</ThemedText>
                </View>

                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleEdit(item.id)}
                            onLongPress={() => handleDelete(item.id)}
                        >
                            <View style={styles.transactionItem}>
                                <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
                                    <IconSymbol
                                        name={item.type === 'expense' ? "cart.fill" : "arrow.up.circle.fill"}
                                        size={24}
                                        color={item.type === 'expense' ? '#ff4444' : '#00aa00'}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: 'gray' }}>{item.date}</ThemedText>
                                </View>
                                <ThemedText type="defaultSemiBold" style={{ color: item.type === 'expense' ? '#ff4444' : '#00aa00' }}>
                                    {item.amount < 0 ? `- ₹${Math.abs(item.amount)}` : `+ ₹${item.amount}`}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    )}
                />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.tint }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/modal');
                    }}
                >
                    <IconSymbol name="plus" size={32} color={theme.background} />
                </TouchableOpacity>
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
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
        marginBottom: 8,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});
