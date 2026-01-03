import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { contactsRepo } from '../../src/repositories/contactsRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

const CATEGORIES = ['TOUS', 'SYNDICAT', 'AVOCAT', 'AUTRE'];
const FORM_TYPES = ['SYNDICAT', 'AVOCAT', 'AUTRE'];

export default function DirectoryScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('SYNDICAT');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    let results;
    if (activeCategory === 'TOUS') {
        results = await contactsRepo.getAll();
    } else {
        results = await contactsRepo.getByType(activeCategory);
    }
    setContacts(results as any);
    setLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, [activeCategory]);

  const resetForm = () => {
      setName('');
      setType('SYNDICAT');
      setPhone('');
      setEmail('');
      setAddress('');
      setDescription('');
      setEditingContact(null);
  };
  const handleSave = async () => {
    if (!name) {
        Alert.alert('Erreur', 'Le nom est obligatoire');
        return;
    }

    try {
        const payload = { name, type, phone, email, address, description };
        
        if (editingContact) {
            await contactsRepo.update(editingContact.id, payload);
        } else {
            await contactsRepo.create(payload);
        }

        setModalVisible(false);
        resetForm();
        loadContacts();
        Alert.alert('Succès', 'Contact enregistré');
    } catch (e) {
        console.error(e);
        Alert.alert('Erreur', 'Impossible d\'enregistrer');
    }
  };

  const handleEdit = (contact: any) => {
      setEditingContact(contact);
      setName(contact.name);
      setType(contact.type);
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      setAddress(contact.address || '');
      setDescription(contact.description || '');
      setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer ce contact ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
                await contactsRepo.delete(id);
                loadContacts(); 
            }
        }
    ]);
  };

  const handleCall = (phoneNumber: string) => {
      if (!phoneNumber) return;
      Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (emailAddress: string) => {
      if (!emailAddress) return;
      Linking.openURL(`mailto:${emailAddress}`);
  };

  const getIcon = (t: string) => {
      switch(t) {
          case 'SYNDICAT': return 'domain';
          case 'AVOCAT': return 'briefcase-account';
          default: return 'account';
      }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>RÉPERTOIRE</Text>
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
            title="NOUVEAU CONTACT" 
            onPress={() => { resetForm(); setModalVisible(true); }} 
            icon={<MaterialCommunityIcons name="account-plus" size={20} color={themeVariant === 'cyan' ? '#000' : '#fff'} />} 
          />
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadContacts}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun contact.</Text>
        }
        renderItem={({ item }: { item: any }) => (
            <NeonCard style={styles.card}>
                <TouchableOpacity 
                    style={styles.cardContent}
                    onPress={() => handleEdit(item)}
                >
                    <View style={[styles.iconBox, { borderColor: theme.secondary }]}>
                        <MaterialCommunityIcons name={getIcon(item.type) as any} size={24} color={theme.secondary} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.cardMeta}>
                            <Text style={[styles.badge, { color: theme.primary, borderColor: theme.primary }]}>{item.type}</Text>
                            {item.description ? <Text style={styles.desc} numberOfLines={1}>{item.description}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.actions}>
                         {item.phone && (
                             <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.actionBtn}>
                                 <MaterialCommunityIcons name="phone" size={20} color={Colors.green} />
                             </TouchableOpacity>
                         )}
                         {item.email && (
                             <TouchableOpacity onPress={() => handleEmail(item.email)} style={styles.actionBtn}>
                                 <MaterialCommunityIcons name="email" size={20} color={theme.primary} />
                             </TouchableOpacity>
                         )}
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.red} />
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
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { borderColor: theme.primary, backgroundColor: Colors.card }]}>
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>
                        {editingContact ? 'MODIFIER CONTACT' : 'NOUVEAU CONTACT'}
                    </Text>

                    <ScrollView>
                        <TextInput 
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                            placeholder="Nom"
                            placeholderTextColor={Colors.textMuted}
                            value={name}
                            onChangeText={setName}
                        />

                        <View style={styles.typeSelector}>
                            {FORM_TYPES.map(t => (
                                <TouchableOpacity 
                                    key={t}
                                    style={[
                                        styles.typeOption, 
                                        type === t && { backgroundColor: theme.primary }
                                    ]}
                                    onPress={() => setType(t)}
                                >
                                    <Text style={[
                                        styles.typeText,
                                        type === t && { color: Colors.dark }
                                    ]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput 
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                            placeholder="Téléphone"
                            placeholderTextColor={Colors.textMuted}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <TextInput 
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={Colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TextInput 
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                            placeholder="Adresse"
                            placeholderTextColor={Colors.textMuted}
                            value={address}
                            onChangeText={setAddress}
                        />

                         <TextInput 
                            style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text, height: 80 }]}
                            placeholder="Description / Notes"
                            placeholderTextColor={Colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <CyberButton title="ANNULER" onPress={() => setModalVisible(false)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
                        <CyberButton title="ENREGISTRER" onPress={handleSave} style={{ flex: 1 }} />
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
    marginBottom: 4,
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
  desc: {
    color: Colors.textMuted,
    fontSize: 10,
    flex: 1,
  },
  actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  actionBtn: {
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
      maxHeight: '90%',
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
      marginBottom: 12,
      fontFamily: 'Orbitron',
      fontSize: 14,
      backgroundColor: 'rgba(0,0,0,0.2)',
  },
  typeSelector: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
  },
  typeOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
  },
  typeText: {
      color: Colors.text,
      fontFamily: 'Orbitron',
      fontSize: 10,
  },
  modalActions: {
      flexDirection: 'row',
      marginTop: 20,
  }
});
