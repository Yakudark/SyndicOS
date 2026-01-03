import { Orbitron_700Bold } from '@expo-google-fonts/orbitron';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { StatChip } from '../../src/components/ui/StatChip';
import { useDashboardStats } from '../../src/hooks/useDashboardStats';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';
import { formatMinutes } from '../../src/utils/time';

export default function DashboardScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const monthlyQuotaMinutes = useSettingsStore(state => state.monthlyQuotaMinutes);
  const theme = Themes[themeVariant];
  const { upcomingMeetings, recentNotes, totalMinutesMonth, dailyMinutes, loading, refresh } = useDashboardStats();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Orbitron: require('@expo-google-fonts/orbitron').Orbitron_400Regular,
    'Orbitron-Bold': Orbitron_700Bold,
  });

  const remainingMinutes = Math.max(0, monthlyQuotaMinutes - totalMinutesMonth);
  const progress = Math.min(1, totalMinutesMonth / monthlyQuotaMinutes);

  const chartData = dailyMinutes.map((d: any) => ({
    value: d.minutes,
    label: dayjs(d.date).format('DD'),
    frontColor: theme.primary,
  }));

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} />}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>SYNDIC_OS</Text>
          <Text style={styles.subtitle}>STATUS: ONLINE</Text>
        </View>

        {/* Quota Section */}
        <NeonCard>
          <Text style={styles.sectionTitle}>QUOTA MENSUEL</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
            <View style={[styles.progressGlow, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
          </View>
          <View style={styles.statsRow}>
            <StatChip 
              label="Réalisé" 
              value={formatMinutes(totalMinutesMonth)} 
              icon={<MaterialCommunityIcons name="clock-check-outline" size={16} color={theme.primary} />}
            />
            <StatChip 
              label="Restant" 
              value={formatMinutes(remainingMinutes)} 
              icon={<MaterialCommunityIcons name="clock-alert-outline" size={16} color={theme.primary} />}
            />
          </View>
        </NeonCard>

        {/* Upcoming Meetings */}
        <View style={styles.row}>
           <Text style={styles.sectionTitle}>PROCHAINES RÉUNIONS</Text>
           <CyberButton 
            title="VERIF" 
            variant="outline" 
            onPress={() => router.push('/(tabs)/planning')} 
            style={{ marginVertical: 0, paddingVertical: 4 }}
            textStyle={{ fontSize: 10 }}
           />
        </View>
        
        {upcomingMeetings.map((m: any) => (
          <NeonCard key={m.id} style={styles.meetingCard}>
            <View style={styles.meetingHeader}>
                <Text style={styles.meetingTitle}>{m.title}</Text>
                <Text style={[styles.meetingDate, { color: theme.secondary }]}>
                    {dayjs(m.startAt).format('DD MMM - HH:mm')}
                </Text>
            </View>
          </NeonCard>
        ))}

        {/* Quick Actions */}
        <View style={styles.actions}>
<CyberButton
  title="NOUVELLE RÉUNION"
  onPress={() => router.push('/meeting/new')}
/>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.cyan,
    paddingLeft: 12,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 28,
    letterSpacing: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 12,
    letterSpacing: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: 1,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    zIndex: 2,
  },
  progressGlow: {
    position: 'absolute',
    height: '100%',
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  meetingCard: {
    padding: 12,
    marginVertical: 4,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron',
    fontSize: 14,
  },
  meetingDate: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 20,
  }
});
