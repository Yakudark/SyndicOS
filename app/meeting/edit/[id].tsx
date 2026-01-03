import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CyberButton } from '../../../src/components/ui/CyberButton';
import { NeonCard } from '../../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../../src/theme/colors';

export default function EditMeetingScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeeting = async () => {
      if (!id) {
        router.back();
        return;
      }

      try {
        const meeting = await meetingsRepo.getById(Number(id));

        if (!meeting) {
          Alert.alert('Erreur', 'Réunion introuvable');
          router.back();
          return;
        }

        setTitle(meeting.title);
        setDescription(meeting.description || '');
        setLocation(meeting.location || '');

        const start = dayjs(meeting.startAt);
        const end = dayjs(meeting.endAt);

        setDate(start.toDate());
        setStartTime(start.toDate());
        setEndTime(end.toDate());
      } catch (e) {
        console.error(e);
        Alert.alert('Erreur', 'Impossible de charger la réunion');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      return Alert.alert('Erreur', 'Titre obligatoire');
    }

    const startAt = dayjs(date)
      .hour(dayjs(startTime).hour())
      .minute(dayjs(startTime).minute())
      .toDate();

    const endAt = dayjs(date)
      .hour(dayjs(endTime).hour())
      .minute(dayjs(endTime).minute())
      .toDate();

    if (endAt <= startAt) {
      return Alert.alert(
        'Erreur',
        'L’heure de fin doit être après l’heure de début'
      );
    }

    await meetingsRepo.update(Number(id), {
      title,
      description,
      location,
      startAt,
      endAt,
    });

    Alert.alert('Succès', 'Réunion mise à jour');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la réunion',
      'Voulez-vous vraiment supprimer cette réunion ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await meetingsRepo.delete(Number(id));
            router.replace('/(tabs)/planning');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { alignItems: 'center' }]}>
          <Text style={[styles.title, { color: theme.primary }]}>
            CHARGEMENT…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            EDIT_PROTOCOL
          </Text>
        </View>

        <NeonCard>
          {/* TITRE */}
          <Text style={styles.label}>TITRE DE LA RÉUNION</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={title}
            onChangeText={setTitle}
          />

          {/* DESCRIPTION */}
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: theme.primary, color: Colors.text }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* LIEU */}
          <Text style={styles.label}>LIEU</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={location}
            onChangeText={setLocation}
          />

          {/* DATE */}
          <Text style={styles.label}>DATE</Text>
          <TouchableOpacity
            style={[styles.input, styles.touchable]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {dayjs(date).format('DD MMMM YYYY').toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* HEURES */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>DÉBUT</Text>
              <TouchableOpacity
                style={[styles.input, styles.touchable]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.inputText}>
                  {dayjs(startTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>FIN</Text>
              <TouchableOpacity
                style={[styles.input, styles.touchable]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.inputText}>
                  {dayjs(endTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </NeonCard>

        <CyberButton title="METTRE À JOUR" onPress={handleSave} />
        <CyberButton title="ANNULER" variant="outline" onPress={() => router.back()} />

        {/* ZONE DE DANGER */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>ZONE DE DANGER</Text>
          <CyberButton
            title="SUPPRIMER"
            variant="outline"
            onPress={handleDelete}
            style={{ borderColor: Colors.red }}
            textStyle={{ color: Colors.red }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {/* START PICKER */}
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(_, selected) => {
            setShowStartPicker(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      {/* END PICKER */}
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(_, selected) => {
            setShowEndPicker(false);
            if (selected) setEndTime(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  title: { fontFamily: 'Orbitron-Bold', fontSize: 24, letterSpacing: 2 },
  label: { color: Colors.textMuted, fontFamily: 'Orbitron', fontSize: 10, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  inputText: { color: Colors.text, fontFamily: 'Orbitron', fontSize: 14 },
  textArea: { height: 80 },
  touchable: { justifyContent: 'center' },
  row: { flexDirection: 'row' },
  dangerZone: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,0,0.2)',
    paddingTop: 20,
  },
  dangerTitle: {
    color: Colors.red,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
});
