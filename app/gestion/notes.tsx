import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { notesRepo } from '../../src/repositories/notesRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

dayjs.locale('fr');

// Config Calendar Locale
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

const TIME_FILTERS = ['TOUT', 'JOUR', 'MOIS', 'ANNÉE'];
const TYPE_FILTERS = ['TOUT', 'RÉUNION', 'AUTRE'];

export default function NotesScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTimeFilter, setActiveTimeFilter] = useState('TOUT');
  const [activeTypeFilter, setActiveTypeFilter] = useState('TOUT');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [calendarVisible, setCalendarVisible] = useState(false);
  
  // Form
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadNotes = async () => {
    setLoading(true);
    let results;
    if (searchQuery) {
        results = await notesRepo.search(searchQuery);
    } else {
        results = await notesRepo.getAll();
    }

    // Apply Filters
    let filtered = results;

    // Type Filter
    if (activeTypeFilter === 'RÉUNION') {
        filtered = filtered.filter((n: any) => n.meetingId !== null);
    } else if (activeTypeFilter === 'AUTRE') {
        filtered = filtered.filter((n: any) => n.meetingId === null);
    }

    // Time Filter
    if (activeTimeFilter !== 'TOUT') {
        filtered = filtered.filter((n: any) => {
            const noteDate = dayjs(n.createdAt);
            if (activeTimeFilter === 'JOUR') {
                return noteDate.isSame(currentDate, 'day');
            } else if (activeTimeFilter === 'MOIS') {
                return noteDate.isSame(currentDate, 'month');
            } else if (activeTimeFilter === 'ANNÉE') {
                return noteDate.isSame(currentDate, 'year');
            }
            return true;
        });
    }

    setNotes(filtered as any);
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        loadNotes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTimeFilter, activeTypeFilter, currentDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
      let unit: 'day' | 'month' | 'year' = 'day';
      if (activeTimeFilter === 'MOIS') unit = 'month';
      if (activeTimeFilter === 'ANNÉE') unit = 'year';

      if (direction === 'prev') {
          setCurrentDate(currentDate.subtract(1, unit));
      } else {
          setCurrentDate(currentDate.add(1, unit));
      }
  };

  const getFormatDate = () => {
      if (activeTimeFilter === 'MOIS') return currentDate.format('MMMM YYYY').toUpperCase();
      if (activeTimeFilter === 'ANNÉE') return currentDate.format('YYYY');
      return currentDate.format('DD MMMM YYYY').toUpperCase();
  };

  const handleSave = async () => {
      if (!content.trim()) {
          Alert.alert('Erreur', 'La note ne peut pas être vide');
          return;
      }

      if (editingId) {
          await notesRepo.update(editingId, content);
      } else {
          await notesRepo.create(content);
      }

      setModalVisible(false);
      setContent('');
      setEditingId(null);
      loadNotes();
  };

  const handleEdit = (note: any) => {
      setEditingId(note.id);
      setContent(note.content);
      setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer cette note ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
                await notesRepo.delete(id);
                loadNotes(); 
            }
        }
    ]);
  };

  const handleCloseModal = () => {
      setModalVisible(false);
      setContent('');
      setEditingId(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>NOTES</Text>
      </View>

      <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} style={styles.searchIcon} />
              <TextInput 
                  style={styles.searchInput}
                  placeholder="Rechercher..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <MaterialCommunityIcons name="close" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
              )}
          </View>
      </View>

      <View style={styles.filtersContainer}>
           <FlatList 
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TIME_FILTERS}
              keyExtractor={item => item}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => (
                  <TouchableOpacity 
                      style={[
                          styles.filterTab, 
                          activeTimeFilter === item && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => setActiveTimeFilter(item)}
                  >
                      <Text style={[
                          styles.filterText,
                          activeTimeFilter === item && { color: Colors.dark }
                      ]}>{item}</Text>
                  </TouchableOpacity>
              )}
          />

           <FlatList 
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TYPE_FILTERS}
              keyExtractor={item => item}
              contentContainerStyle={[styles.filterList, { marginTop: 8 }]}
              renderItem={({ item }) => (
                  <TouchableOpacity 
                      style={[
                          styles.filterTab, 
                          activeTypeFilter === item && { backgroundColor: theme.secondary, borderColor: theme.secondary }
                      ]}
                      onPress={() => setActiveTypeFilter(item)}
                  >
                      <Text style={[
                          styles.filterText,
                          activeTypeFilter === item && { color: Colors.dark }
                      ]}>{item}</Text>
                  </TouchableOpacity>
              )}
          />
      </View>

      {activeTimeFilter !== 'TOUT' && (
          <View style={[styles.dateNavCard, { backgroundColor: Colors.card, borderColor: theme.primary, borderWidth: 1, borderRadius: 12 }]}>
              <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navBtn}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={theme.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => activeTimeFilter === 'JOUR' && setCalendarVisible(true)} activeOpacity={activeTimeFilter === 'JOUR' ? 0.7 : 1}>
                <Text style={[styles.dateNavText, { color: theme.primary }]}>{getFormatDate()}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navBtn}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.primary} />
              </TouchableOpacity>
          </View>
      )}

      <View style={styles.actionContainer}>
          <CyberButton 
            title="NOUVELLE NOTE" 
            onPress={() => setModalVisible(true)}
            icon={<MaterialCommunityIcons name="plus" size={20} color={themeVariant === 'cyan' ? '#000' : '#fff'} />} 
          />
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadNotes}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune note.</Text>
        }
        renderItem={({ item }: { item: any }) => (
            <NeonCard style={styles.card}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                         <View style={styles.dateBadge}>
                            <MaterialCommunityIcons name="calendar-clock" size={12} color={Colors.textMuted} />
                            <Text style={styles.date}>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </View>
                        {item.meetingId && (
                            <View style={[styles.meetingBadge, { borderColor: theme.secondary }]}>
                                <MaterialCommunityIcons name="account-group" size={12} color={theme.secondary} />
                                <Text style={[styles.meetingText, { color: theme.secondary }]}>Réunion</Text>
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.noteContent} numberOfLines={4}>
                        {item.content}
                    </Text>

                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={styles.delBtn}>
                            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </NeonCard>
        )}
      />

      <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleCloseModal}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { borderColor: theme.primary, backgroundColor: Colors.card }]}>
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>
                        {editingId ? 'MODIFIER LA NOTE' : 'NOUVELLE NOTE'}
                    </Text>

                    <TextInput 
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                        placeholder="Écrivez votre note ici..."
                        placeholderTextColor={Colors.textMuted}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={styles.modalActions}>
                        <CyberButton title="ENREGISTRER" onPress={handleSave} style={{ width: '100%', marginBottom: 12 }} />
                        <CyberButton title="ANNULER" onPress={handleCloseModal} variant="outline" style={{ width: '100%' }} />
                    </View>
                </View>
            </View>
        </Modal>

        <Modal
            visible={calendarVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setCalendarVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.calendarContent, { backgroundColor: Colors.card, borderColor: theme.primary }]}>
                     <Calendar
                        current={currentDate.format('YYYY-MM-DD')}
                        onDayPress={(day: any) => {
                            setCurrentDate(dayjs(day.dateString));
                            setCalendarVisible(false);
                        }}
                        theme={{
                            backgroundColor: Colors.card,
                            calendarBackground: Colors.card,
                            textSectionTitleColor: Colors.textMuted,
                            selectedDayBackgroundColor: theme.primary,
                            selectedDayTextColor: '#000',
                            todayTextColor: theme.primary,
                            dayTextColor: Colors.text,
                            textDisabledColor: '#444',
                            monthTextColor: theme.primary,
                            arrowColor: theme.primary,
                            textDayFontFamily: 'Orbitron',
                            textMonthFontFamily: 'Orbitron-Bold',
                            textDayHeaderFontFamily: 'Orbitron',
                        }}
                    />
                    <View style={{ padding: 10 }}>
                         <CyberButton title="FERMER" onPress={() => setCalendarVisible(false)} variant="outline" style={{ width: '100%' }} />
                    </View>
                </View>
            </View>
        </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  searchContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
  },
  searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
      marginRight: 8,
  },
  searchInput: {
      flex: 1,
      height: 40,
      color: Colors.text,
      fontFamily: 'Orbitron',
      fontSize: 14,
  },
  filtersContainer: {
      height: 90,
      marginBottom: 0,
  },
  filterList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  filterText: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
  },
  dateNavCard: {
      marginHorizontal: 16,
      marginBottom: 10,
      marginTop: 0,
      padding: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 50,
      paddingHorizontal: 10,
  },
  navBtn: {
      padding: 8,
  },
  dateNavText: {
      fontFamily: 'Orbitron-Bold',
      fontSize: 16,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  card: {
    marginBottom: 12,
    padding: 0, 
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  date: {
      color: Colors.textMuted,
      fontSize: 10,
  },
  meetingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  meetingText: {
      fontSize: 10,
      fontFamily: 'Orbitron-Bold',
  },
  noteContent: {
      color: Colors.text,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
  },
  cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 4,
  },
  delBtn: {
      padding: 4,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 20,
      maxHeight: '80%',
      width: '90%',
  },
  calendarContent: {
      borderRadius: 12,
      borderWidth: 1,
      width: '90%',
      overflow: 'hidden',
  },
  modalTitle: {
      fontFamily: 'Orbitron-Bold',
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 1,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontFamily: 'Orbitron',
      fontSize: 14,
      backgroundColor: 'rgba(0,0,0,0.2)',
      minHeight: 150,
  },
  modalActions: {
      flexDirection: 'column',
      width: '100%',
  }
});
