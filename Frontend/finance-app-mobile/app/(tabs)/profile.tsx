import { StyleSheet, View, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const iconColor = theme.text;

    const SettingItem = ({ icon, label, isSwitch = false, value = false }: { icon: any, label: string, isSwitch?: boolean, value?: boolean }) => (
        <TouchableOpacity style={styles.item} disabled={isSwitch}>
            <View style={styles.itemLeft}>
                <IconSymbol name={icon} size={24} color={iconColor} />
                <ThemedText style={styles.itemLabel}>{label}</ThemedText>
            </View>
            {isSwitch ? (
                <Switch value={value} />
            ) : (
                <IconSymbol name="chevron.right" size={20} color="gray" />
            )}
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.tint }]}>
                        <ThemedText style={[styles.avatarText, { color: theme.background }]}>JD</ThemedText>
                    </View>
                    <ThemedText type="title" style={{ marginTop: 16 }}>John Doe</ThemedText>
                    <ThemedText style={{ color: 'gray' }}>john.doe@example.com</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Preferences</ThemedText>
                    <SettingItem icon="gear" label="Budget Settings" />
                    <SettingItem icon="bell.fill" label="Notifications" isSwitch value={true} />
                    <SettingItem icon="person.fill" label="Account Security" />
                </View>

                <TouchableOpacity style={styles.logoutBtn}>
                    <ThemedText style={{ color: '#ff4444', fontWeight: 'bold', fontSize: 16 }}>Log Out</ThemedText>
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
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    itemLabel: {
        fontSize: 16,
    },
    logoutBtn: {
        marginTop: 'auto',
        marginBottom: 32,
        alignSelf: 'center',
        padding: 16,
    },
});
