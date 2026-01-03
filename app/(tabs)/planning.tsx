import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function PlanningScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [meetings, setMeetings] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const router = useRouter();

  const loadMeetings = async () => {
    const startOfMonth = dayjs(selectedDate).startOf('month').toDate();
    const endOfMonth = dayjs(selectedDate).endOf('month').toDate();
    const allMeetings = await meetingsRepo.getAll();
    
    // Mark dates on calendar
    const marks: any = {};
    allMeetings.forEach((m: any) => {
      const date = dayjs(m.startAt).format('YYYY-MM-DD');
      marks[date] = { marked: true, dotColor: theme.primary };
    });
    
    marks[selectedDate] = { 
      ...marks[selectedDate], 
      selected: true, 
      selectedColor: theme.primary 
    };
    
    setMarkedDates(marks);

    // List for selected date
    const dayMeetings = allMeetings.filter((m: any) => 
      dayjs(m.startAt).format('YYYY-MM-DD') === selectedDate
    );
    setMeetings(dayMeetings as any);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMeetings();
    }, [selectedDate, themeVariant])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>PLANNING</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.dark,
          calendarBackground: Colors.dark,
          textSectionTitleColor: theme.primary,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.secondary,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.border,
          dotColor: theme.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.primary,
          monthTextColor: Colors.text,
          indicatorColor: theme.primary,
          textDayFontFamily: 'Orbitron',
          textMonthFontFamily: 'Orbitron-Bold',
          textDayHeaderFontFamily: 'Orbitron',
        }}
        style={styles.calendar}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {dayjs(selectedDate).format('DD MMMM YYYY').toUpperCase()}
        </Text>
        <CyberButton 
            title="NOUVEAU" 
            onPress={() => router.push('/meeting/new')} 
            style={{ marginVertical: 0, paddingVertical: 4 }}
            textStyle={{ fontSize: 10 }}
        />
      </View>

      <FlatList
        data={meetings}
        keyExtractor={item => (item as any).id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: any }) => (
          <NeonCard style={styles.item}>
            <View style={styles.itemContent}>
              <View style={{ flex: 1 }} onTouchEnd={() => router.push(`/meeting/${item.id}`)}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemTime}>
                    {dayjs(item.startAt).format('HH:mm')} - {dayjs(item.endAt).format('HH:mm')}
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.primary} 
                onPress={() => router.push(`/meeting/${item.id}`)}
              />
            </View>
          </NeonCard>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucune réunion prévue</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  listTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    marginVertical: 6,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
  },
  itemTime: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    marginTop: 8,
  },
});
