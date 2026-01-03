import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { documentsRepo } from '../../src/repositories/documentsRepo';
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

  const handleImport = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            type: '*/*',
        });

        if (result.canceled) return;
        setPendingAsset(result.assets[0]);
        setModalVisible(true);
    } catch (error) {
        console.error(error);
        Alert.alert('Erreur', "Impossible de sélectionner le document");
    }
  };

  const saveDocument = async (category: string) => {
      if (!pendingAsset) return;
      setModalVisible(false);

      try {
        const fileName = pendingAsset.name;
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
            createdAt: new Date(),
        });

        loadDocs();
        setPendingAsset(null);
        Alert.alert('Succès', 'Document archivé avec succès');
      } catch (error) {
          console.error(error);
          Alert.alert('Erreur', "Échec de l'enregistrement");
      }
  };

  const handleOpen = async (uri: string) => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(uri);
    } else {
        Alert.alert('Info', 'Le partage n\'est pas disponible sur ce simulateur/appareil');
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
                    onPress={() => handleOpen(item.uri)}
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
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>CHOISIR CATÉGORIE</Text>
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
  }
});
