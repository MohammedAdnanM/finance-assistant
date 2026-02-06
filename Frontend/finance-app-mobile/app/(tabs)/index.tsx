import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactions } from '@/context/TransactionContext';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const iconBg = colorScheme === 'dark' ? '#333' : '#eee';
  const { balance, income, expense, transactions } = useTransactions();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Good Morning 👋</ThemedText>
      </ThemedView>

      <View style={[styles.card, { backgroundColor: '#0a7ea4' }]}>
        <ThemedText style={styles.cardLabel}>Total Balance</ThemedText>
        <ThemedText style={styles.cardBalance}>₹{balance.toFixed(2)}</ThemedText>
        <View style={styles.row}>
          <View>
            <ThemedText style={styles.cardLabel}>Income</ThemedText>
            <ThemedText style={styles.cardValue}>₹{income.toFixed(0)}</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.cardLabel}>Expense</ThemedText>
            <ThemedText style={styles.cardValue}>₹{expense.toFixed(0)}</ThemedText>
          </View>
        </View>
      </View>

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">Recent Transactions</ThemedText>
      </ThemedView>

      {transactions.slice(0, 5).map((t) => (
        <ThemedView key={t.id} style={styles.transactionItem}>
          <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
            <IconSymbol name="house.fill" size={24} color={theme.text} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">{t.title}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: 'gray' }}>{t.date}</ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={{ color: t.type === 'expense' ? '#ff4444' : '#00aa00' }}>
            {t.amount < 0 ? `- ₹${Math.abs(t.amount)}` : `+ ₹${t.amount}`}
          </ThemedText>
        </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  card: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  cardBalance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  cardValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
