import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTransactions } from '@/context/TransactionContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addTransaction, updateTransaction, transactions } = useTransactions();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const isEditing = !!params.id;

  useEffect(() => {
    if (isEditing) {
      const tx = transactions.find(t => t.id === params.id);
      if (tx) {
        setTitle(tx.title);
        setAmount(Math.abs(tx.amount).toString());
        setType(tx.type);
      }
    }
  }, [params.id]);

  const handleSave = async () => {
    if (!title || !amount) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEditing) {
      await updateTransaction(params.id as string, title, parseFloat(amount), type);
    } else {
      await addTransaction(title, parseFloat(amount), type);
    }
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.form}>
            <ThemedText type="subtitle" style={{ marginBottom: 24, textAlign: 'center' }}>
              {isEditing ? 'Edit Transaction' : 'New Transaction'}
            </ThemedText>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && { backgroundColor: '#ff4444', borderColor: '#ff4444' }]}
                onPress={() => setType('expense')}
              >
                <ThemedText style={{ color: type === 'expense' ? '#fff' : theme.text }}>Expense</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && { backgroundColor: '#00aa00', borderColor: '#00aa00' }]}
                onPress={() => setType('income')}
              >
                <ThemedText style={{ color: type === 'income' ? '#fff' : theme.text }}>Income</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }]}
              placeholder="e.g. Grocery, Salary"
              placeholderTextColor="gray"
              value={title}
              onChangeText={setTitle}
            />

            <ThemedText style={styles.label}>Amount (₹)</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }]}
              placeholder="0.00"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.tint }]} onPress={handleSave}>
              <ThemedText style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, alignSelf: 'center' }}>
              <ThemedText style={{ color: 'gray' }}>Cancel</ThemedText>
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
    padding: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: 'gray',
    textTransform: 'uppercase',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  btn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  }
});
