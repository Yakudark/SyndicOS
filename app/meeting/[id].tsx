import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { documentsRepo } from '../../src/repositories/documentsRepo';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { notesRepo } from '../../src/repositories/notesRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];

  const [meeting, setMeeting] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

  // preview
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const loadData = async () => {
    try {
      const meetingId = Number(id);
      const m = await meetingsRepo.getById(meetingId);
      const n = await notesRepo.getByMeetingId(meetingId);
      const d = await documentsRepo.getByMeetingId(meetingId);

      setMeeting(m);
      setNotes(n as any);
      setDocuments(d as any);
    } catch (e) {
      console.error('Erreur chargement réunion', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /* ---------- NOTES ---------- */

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await notesRepo.create(newNote, Number(id));
    setNewNote('');
    loadData();
  };

  const handleDeleteNote = async (noteId: number) => {
    await notesRepo.delete(noteId);
    loadData();
  };

  /* ---------- DOCUMENTS ---------- */

  const isImage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '');
  };

  const handleOpenDocument = async (doc: any) => {
    if (isImage(doc.name)) {
      setSelectedDoc(doc);
      setPreviewVisible(true);
    } else {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(doc.uri);
      }
    }
  };

  const handleUnlinkDocument = async (docId: number) => {
    Alert.alert(
      'Détacher le document',
      'Le document restera dans les archives mais sera retiré de cette réunion.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Détacher',
          style: 'destructive',
          onPress: async () => {
            await documentsRepo.update(docId, { meetingId: null });
            loadData();
          },
        },
      ]
    );
  };

  if (!meeting) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.primary}
            onPress={() => router.back()}
          />
          <Text style={[styles.title, { color: theme.primary }]}>
            DATA_ENTRY
          </Text>
          <View style={{ flex: 1 }} />
          <Link href={`/meeting/edit/${id}`} asChild>
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color={theme.primary}
            />
          </Link>
        </View>

        {/* MEETING INFO */}
        <NeonCard>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.primary} />
            <Text style={styles.infoText}>
              {dayjs(meeting.startAt).format('DD MMMM YYYY')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.primary} />
            <Text style={styles.infoText}>
              {dayjs(meeting.startAt).format('HH:mm')} –{' '}
              {dayjs(meeting.endAt).format('HH:mm')}
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

        {/* DOCUMENTS */}
        <Text style={styles.sectionTitle}>DOCUMENTS</Text>

        {documents.length > 0 ? (
          documents.map(doc => (
            <NeonCard key={doc.id} style={{ marginBottom: 8 }}>
              <View style={styles.docRow}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleOpenDocument(doc)}
                >
                  <Text style={styles.docTitle}>{doc.name}</Text>
                  <Text style={styles.docMeta}>
                    {dayjs(doc.createdAt).format('DD/MM/YYYY')} • {doc.category}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleUnlinkDocument(doc.id)}>
                  <MaterialCommunityIcons
                    name="link-off"
                    size={20}
                    color={Colors.red}
                  />
                </TouchableOpacity>
              </View>
            </NeonCard>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun document lié.</Text>
        )}

        {/* NOTES */}
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
            title="MÉMORISER"
            onPress={handleAddNote}
            style={{ marginTop: 10 }}
          />
        </NeonCard>

        {notes.length > 0 ? (
          notes.map(note => (
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
          <Text style={styles.emptyText}>Aucune note.</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* PREVIEW IMAGE */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewVisible(false)}
          >
            <MaterialCommunityIcons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {selectedDoc && (
            <Image
              source={{ uri: selectedDoc.uri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  title: { fontFamily: 'Orbitron-Bold', fontSize: 24, letterSpacing: 2 },
  meetingTitle: { color: Colors.text, fontFamily: 'Orbitron-Bold', fontSize: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { color: Colors.text, fontFamily: 'Orbitron', fontSize: 14 },
  description: { color: Colors.textMuted, marginTop: 12 },
  sectionTitle: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  docRow: { flexDirection: 'row', alignItems: 'center' },
  docTitle: { color: Colors.text, fontFamily: 'Orbitron-Bold', fontSize: 14 },
  docMeta: { color: Colors.textMuted, fontSize: 10 },
  noteInputCard: { padding: 12 },
  input: { minHeight: 60, fontFamily: 'Orbitron' },
  noteCard: { padding: 12, marginVertical: 6 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  noteDate: { color: Colors.textMuted, fontSize: 10 },
  noteContent: { color: Colors.text },
  emptyText: { color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '80%' },
  previewClose: { position: 'absolute', top: 50, right: 20 },
});
