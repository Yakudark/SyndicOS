import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { notesRepo } from '../../src/repositories/notesRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const loadData = async () => {
    const m = await meetingsRepo.getById(Number(id));
    setMeeting(m);
    const n = await notesRepo.getByMeetingId(Number(id));
    setNotes(n as any);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote) return;
    await notesRepo.create(Number(id), newNote);
    setNewNote('');
    loadData();
  };

  const handleDeleteNote = async (noteId: number) => {
    await notesRepo.delete(noteId);
    loadData();
  };

  if (!meeting) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.primary} 
                onPress={() => router.back()} 
            />
            <Text style={[styles.title, { color: theme.primary }]}>DATA_ENTRY</Text>
            <View style={{ flex: 1 }} />
<Link
  href={`/meeting/edit/${Array.isArray(id) ? id[0] : id}`}
  asChild
>
              <MaterialCommunityIcons 
                  name="pencil" 
                  size={24} 
                  color={theme.primary} 
              />
            </Link>
        </View>

        <NeonCard>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.primary} />
            <Text style={styles.infoText}>{dayjs(meeting.startAt).format('DD MMMM YYYY')}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.primary} />
            <Text style={styles.infoText}>
                {dayjs(meeting.startAt).format('HH:mm')} - {dayjs(meeting.endAt).format('HH:mm')}
            </Text>
          </View>
          {meeting.location && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={theme.primary} />
                <Text style={styles.infoText}>{meeting.location}</Text>
              </View>
          )}
          {meeting.description && (
              <Text style={styles.description}>{meeting.description}</Text>
          )}
        </NeonCard>

        <Text style={styles.sectionTitle}>NOTES</Text>
        
        <NeonCard style={styles.noteInputCard}>
            <TextInput
                style={[styles.input, { color: Colors.text }]}
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Ajouter une note..."
                placeholderTextColor={Colors.textMuted}
                multiline
            />
            <CyberButton 
                title="MEMORISER" 
                onPress={handleAddNote} 
                style={{ marginTop: 10, marginVertical: 0 }}
            />
        </NeonCard>

        {notes.length > 0 ? (
            notes.map((note: any) => (
                <NeonCard key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                        <Text style={styles.noteDate}>
                            {dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <MaterialCommunityIcons 
                            name="delete-outline" 
                            size={20} 
                            color={Colors.red} 
                            onPress={() => handleDeleteNote(note.id)} 
                        />
                    </View>
                    <Text style={styles.noteContent}>{note.content}</Text>
                </NeonCard>
            ))
        ) : (
            <Text style={styles.emptyText}>Aucune note pour le moment.</Text>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  meetingTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    color: Colors.text,
    fontFamily: 'Orbitron',
    fontSize: 14,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  noteInputCard: {
    padding: 12,
  },
  input: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  noteCard: {
    padding: 12,
    marginVertical: 6,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteDate: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  noteContent: {
    color: Colors.text,
    fontSize: 14,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  }
});
