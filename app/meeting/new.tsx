import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

export default function NewMeetingScreen() {
  const router = useRouter();
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    dayjs().add(1, 'hour').toDate()
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

    await meetingsRepo.create({
      title,
      description,
      location,
      startAt,
      endAt,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.primary }]}>
            NEW_PROTOCOL
          </Text>
        </View>

        <NeonCard>
          {/* TITRE */}
          <Text style={styles.label}>TITRE DE LA RÉUNION</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Assemblée Générale"
            placeholderTextColor={Colors.textMuted}
          />

          {/* DESCRIPTION */}
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: theme.primary, color: Colors.text }]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="..."
            placeholderTextColor={Colors.textMuted}
          />

          {/* LIEU */}
          <Text style={styles.label}>LIEU</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primary, color: Colors.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Salle 404 / Matrix"
            placeholderTextColor={Colors.textMuted}
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

        <CyberButton title="INITIALISER" onPress={handleSave} />
        <CyberButton title="ANNULER" variant="outline" onPress={() => router.back()} />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* START TIME PICKER */}
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(_, selectedTime) => {
            setShowStartPicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {/* END TIME PICKER */}
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(_, selectedTime) => {
            setShowEndPicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

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
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  label: {
    color: Colors.textMuted,
    fontFamily: 'Orbitron',
    fontSize: 10,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  touchable: {
    justifyContent: 'center',
  },
  inputText: {
    color: Colors.text,
    fontFamily: 'Orbitron',
    fontSize: 14,
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: 'row',
  },
});
