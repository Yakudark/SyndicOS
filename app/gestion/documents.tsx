import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { documentsRepo } from '../../src/repositories/documentsRepo';
import { meetingsRepo } from '../../src/repositories/meetingsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

const CATEGORIES = ['TOUS', 'PV', 'CONTRAT', 'FACTURE', 'AUTRE'];
const IMPORT_CATEGORIES = ['PV', 'CONTRAT', 'FACTURE', 'AUTRE'];

export default function DocumentScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<any>(null);

  // Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  // Import/Edit State
  const [docName, setDocName] = useState('');
  const [docDate, setDocDate] = useState(new Date());
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Link to meeting
  const [availableMeetings, setAvailableMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadDocs = async () => {
    setLoading(true);
    let results;
    if (activeCategory === 'TOUS') {
        results = await documentsRepo.getAll();
    } else {
        results = await documentsRepo.getByCategory(activeCategory);
    }
    setDocs(results as any);
    setLoading(false);
  };

  useEffect(() => {
    loadDocs();
  }, [activeCategory]);

  useEffect(() => {
      loadMeetingsForDate(docDate);
  }, [docDate]);

  const loadMeetingsForDate = async (date: Date) => {
      const allMeetings = await meetingsRepo.getAll();
      const targetStr = dayjs(date).format('YYYY-MM-DD');
      
      const filtered = allMeetings.filter((m: any) => 
          dayjs(m.startAt).format('YYYY-MM-DD') === targetStr
      );
      setAvailableMeetings(filtered as any);
  };

  const handleImport = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            type: '*/*',
        });

        if (result.canceled) return;
        setPendingAsset(result.assets[0]);
        setPendingAsset(result.assets[0]);
        setDocName(result.assets[0].name);
        setDocDate(new Date());
        setSelectedMeetingId(null);
        setIsEditing(false);
        setEditId(null);
        setModalVisible(true);
    } catch (error) {
        console.error(error);
        Alert.alert('Erreur', "Impossible de sélectionner le document");
    }
  };

  const saveDocument = async (category: string) => {
      // Validation common to both modes
      if (!docName.trim()) {
        Alert.alert('Erreur', 'Le nom du document est requis');
        return;
      }
      setModalVisible(false);

      if (isEditing && editId) {
          // UPDATE MODE
          try {
             await documentsRepo.update(editId, {
                 name: docName,
                 category: category,
                 createdAt: docDate,
                 meetingId: selectedMeetingId
             });

             loadDocs();
             resetForm();
             Alert.alert('Succès', 'Document modifié');
          } catch (e) {
              console.error(e);
              Alert.alert('Erreur', 'Modification impossible');
          }
      } else {
        // IMPORT MODE
        if (!pendingAsset) return;

        try {
            let fileName = docName.trim();
            const originalExt = pendingAsset.name.split('.').pop();
            
            if (originalExt && !fileName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
                fileName = `${fileName}.${originalExt}`;
            }
    
            const newUri = (FileSystem as any).documentDirectory + fileName;
    
            await FileSystem.copyAsync({
                from: pendingAsset.uri,
                to: newUri
            });
    
            await documentsRepo.create({
                name: fileName,
                uri: newUri,
                size: pendingAsset.size,
                category: category,
                createdAt: docDate,
                meetingId: selectedMeetingId
            });
    
            loadDocs();
            resetForm();
            Alert.alert('Succès', 'Document archivé avec succès');
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "Échec de l'enregistrement");
        }
      }
  };

  const resetForm = () => {
      setEditId(null);
      setIsEditing(false);
      setDocName('');
      setPendingAsset(null);
      setSelectedMeetingId(null);
  };

  const handleEditInit = (doc: any) => {
      setDocName(doc.name);
      setEditId(doc.id);
      setDocDate(doc.createdAt ? new Date(doc.createdAt) : new Date());
      setSelectedMeetingId(doc.meetingId || null);
      setIsEditing(true);
      setPendingAsset(null); // Not needed for edit
      setModalVisible(true);
  };

  const isImage = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '');
  };

  const handleOpen = async (doc: any) => {
    if (isImage(doc.name)) {
        setSelectedDoc(doc);
        setPreviewVisible(true);
    } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(doc.uri);
        } else {
            Alert.alert('Info', 'Le partage n\'est pas disponible sur ce simulateur/appareil');
        }
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer ce document ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
                await documentsRepo.delete(id);
                loadDocs(); 
            }
        }
    ]);
  };

  const getIcon = (cat: string) => {
      switch(cat) {
          case 'PV': return 'gavel';
          case 'CONTRAT': return 'file-sign';
          case 'FACTURE': return 'receipt';
          default: return 'file-outline';
      }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>ARCHIVES</Text>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={item => item}
            contentContainerStyle={styles.tabsList}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={[
                        styles.tab, 
                        activeCategory === item && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setActiveCategory(item)}
                >
                    <Text style={[
                        styles.tabText,
                        activeCategory === item && { color: Colors.dark }
                    ]}>{item}</Text>
                </TouchableOpacity>
            )}
        />
      </View>

      <View style={styles.actionContainer}>
          <CyberButton 
            title="IMPORTER UN DOCUMENT" 
            onPress={handleImport} 
            icon={<MaterialCommunityIcons name="upload" size={20} color={themeVariant === 'cyan' ? '#000' : '#fff'} />} 
          />
      </View>

      <FlatList
        data={docs}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadDocs}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun document archivé.</Text>
        }
        renderItem={({ item }: { item: any }) => (
            <NeonCard style={styles.card}>
                <TouchableOpacity 
                    style={styles.cardContent}
                    onPress={() => handleOpen(item)}
                >
                    <View style={[styles.iconBox, { borderColor: theme.secondary }]}>
                        <MaterialCommunityIcons name={getIcon(item.category) as any} size={24} color={theme.secondary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.cardMeta}>
                            <Text style={[styles.badge, { color: theme.primary, borderColor: theme.primary }]}>{item.category}</Text>
                            <Text style={styles.date}>{dayjs(item.createdAt).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.red} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEditInit(item)} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.primary} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </NeonCard>
        )}
      />

        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { borderColor: theme.primary }]}>
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>
                        {isEditing ? 'MODIFIER LE DOCUMENT' : 'IMPORTER LE DOCUMENT'}
                    </Text>
                    
                    <Text style={[styles.label, { color: Colors.textMuted }]}>Nom du fichier</Text>
                    <TextInput
                        style={[styles.input, { color: Colors.text, borderColor: 'rgba(255,255,255,0.2)' }]}
                        value={docName}
                        onChangeText={setDocName}
                        placeholder="Nom du document"
                        placeholderTextColor={Colors.textMuted}
                    />

                    <Text style={[styles.label, { color: Colors.textMuted }]}>Date du document</Text>
                    <TouchableOpacity 
                        style={[styles.input, { justifyContent: 'center' }]} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ color: Colors.text, fontFamily: 'Orbitron' }}>
                            {dayjs(docDate).format('DD MMMM YYYY').toUpperCase()}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={docDate}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) {
                                    setDocDate(date);
                                    setSelectedMeetingId(null);
                                }
                            }}
                        />
                    )}

                    <Text style={[styles.label, { color: Colors.textMuted, marginTop: 10 }]}>Lier à une réunion (Optionnel)</Text>
                    <View style={styles.meetingList}>
                        {availableMeetings.length > 0 ? (
                            availableMeetings.map((m: any) => (
                                <TouchableOpacity 
                                    key={m.id}
                                    style={[
                                        styles.meetingOption, 
                                        selectedMeetingId === m.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => setSelectedMeetingId(selectedMeetingId === m.id ? null : m.id)}
                                >
                                    <Text style={[
                                        styles.meetingOptionText,
                                        selectedMeetingId === m.id && { color: Colors.dark }
                                    ]}>
                                        {dayjs(m.startAt).format('HH:mm')} - {m.title}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noMeetingText}>Aucune réunion à cette date.</Text>
                        )}
                    </View>

                    <Text style={[styles.label, { color: Colors.textMuted, marginTop: 10 }]}>Catégorie (Valider)</Text>
                    {IMPORT_CATEGORIES.map(cat => (
                        <TouchableOpacity 
                            key={cat} 
                            style={styles.modalOption} 
                            onPress={() => saveDocument(cat)}
                        >
                            <Text style={styles.modalOptionText}>{cat}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={CommonColors.textMuted} />
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity 
                        style={[styles.modalOption, styles.modalCancel]} 
                        onPress={() => setModalVisible(false)}
                    >
                         <Text style={styles.modalCancelText}>ANNULER</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        <Modal
            visible={previewVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setPreviewVisible(false)}
        >
            <View style={styles.previewOverlay}>
                <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewVisible(false)}>
                    <MaterialCommunityIcons name="close-circle" size={40} color="#fff" />
                </TouchableOpacity>
                {selectedDoc && (
                    <Image
                        source={{ uri: selectedDoc.uri }}
                        style={styles.previewImage}
                        contentFit="contain"
                    />
                )}
                 {selectedDoc && (
                    <Text style={styles.previewTitle}>{selectedDoc.name}</Text>
                )}
            </View>
        </Modal>

    </SafeAreaView>
  );
}

const CommonColors = Colors;

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
  tabsContainer: {
    height: 50,
    marginBottom: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  tabText: {
    color: Colors.text,
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'Orbitron',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 10,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Orbitron-Bold',
  },
  date: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  deleteBtn: {
    padding: 8,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      backgroundColor: Colors.card,
      borderRadius: 12,
      borderWidth: 1,
      padding: 20,
  },
  modalTitle: {
      fontFamily: 'Orbitron-Bold',
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 1,
  },
  modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalOptionText: {
      color: Colors.text,
      fontFamily: 'Orbitron',
      fontSize: 14,
  },
  modalCancel: {
      marginTop: 10,
      borderBottomWidth: 0,
      justifyContent: 'center',
  },
  modalCancelText: {
      color: Colors.red,
      fontFamily: 'Orbitron-Bold',
  },
  previewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  previewImage: {
      width: '100%',
      height: '80%',
  },
  previewClose: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
  },
  previewTitle: {
      color: '#fff',
      fontFamily: 'Orbitron',
      marginTop: 20,
      fontSize: 14,
  },
  label: {
      fontFamily: 'Orbitron',
      fontSize: 12,
      marginBottom: 6,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      fontFamily: 'Orbitron',
      fontSize: 14,
      marginBottom: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
  },
  meetingList: {
      maxHeight: 120,
      marginBottom: 10,
  },
  meetingOption: {
      padding: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: 8,
      marginBottom: 6,
  },
  meetingOptionText: {
      color: Colors.text,
      fontFamily: 'Orbitron',
      fontSize: 12,
  },
  noMeetingText: {
      color: Colors.textMuted,
      fontStyle: 'italic',
      fontSize: 12,
  }
});
