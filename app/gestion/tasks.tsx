import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { tasksRepo } from '../../src/repositories/tasksRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

const FILTERS = ['TOUT', 'AFFAIRE', 'TERMINÉ'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function TasksScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState('AFFAIRE');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const loadTasks = async () => {
    setLoading(true);
    const all = await tasksRepo.getAll();
    let filtered = all;

    if (activeFilter === 'AFFAIRE') {
        filtered = all.filter((t: any) => t.status === 'TODO');
    } else if (activeFilter === 'TERMINÉ') {
        filtered = all.filter((t: any) => t.status === 'DONE');
    }

    setTasks(filtered as any);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [activeFilter]);

  const handleSave = async () => {
      if (!title) {
          Alert.alert('Erreur', 'Le titre est requis');
          return;
      }

      await tasksRepo.create({
          title,
          description,
          priority,
          status: 'TODO',
          createdAt: new Date(),
      });

      setModalVisible(false);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      loadTasks();
  };

  const handleToggle = async (task: any) => {
      await tasksRepo.toggleStatus(task.id, task.status);
      loadTasks();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer cette tâche ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
                await tasksRepo.delete(id);
                loadTasks(); 
            }
        }
    ]);
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'HIGH': return Colors.red;
          case 'MEDIUM': return Colors.green; // or orange/yellow
          default: return Colors.textMuted;
      }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>TÂCHES</Text>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={item => item}
            contentContainerStyle={styles.tabsList}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={[
                        styles.tab, 
                        activeFilter === item && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setActiveFilter(item)}
                >
                    <Text style={[
                        styles.tabText,
                        activeFilter === item && { color: Colors.dark }
                    ]}>{item}</Text>
                </TouchableOpacity>
            )}
        />
      </View>

      <View style={styles.actionContainer}>
          <CyberButton 
            title="NOUVELLE TÂCHE" 
            onPress={() => setModalVisible(true)}
            icon={<MaterialCommunityIcons name="plus" size={20} color={themeVariant === 'cyan' ? '#000' : '#fff'} />} 
          />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadTasks}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune tâche.</Text>
        }
        renderItem={({ item }: { item: any }) => (
            <NeonCard style={styles.card}>
                <View style={styles.cardContent}>
                    <TouchableOpacity onPress={() => handleToggle(item)}>
                        <MaterialCommunityIcons 
                            name={item.status === 'DONE' ? "checkbox-marked" : "checkbox-blank-outline"} 
                            size={28} 
                            color={item.status === 'DONE' ? theme.primary : Colors.textMuted} 
                        />
                    </TouchableOpacity>
                    
                    <View style={styles.cardInfo}>
                        <Text style={[
                            styles.cardTitle,
                            item.status === 'DONE' && { textDecorationLine: 'line-through', color: Colors.textMuted }
                        ]}>{item.title}</Text>
                        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
                        
                        <View style={styles.meta}>
                            <View style={[styles.priorityBadge, { borderColor: getPriorityColor(item.priority) }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
                            </View>
                            <Text style={styles.date}>{dayjs(item.createdAt).format('DD/MM')}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
                         <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.red} />
                    </TouchableOpacity>
                </View>
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
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>NOUVELLE TÂCHE</Text>

                    <TextInput 
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                        placeholder="Titre..."
                        placeholderTextColor={Colors.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.prioritySelector}>
                        {PRIORITIES.map(p => (
                             <TouchableOpacity 
                                key={p}
                                style={[
                                    styles.prioOption, 
                                    priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[
                                    styles.prioText,
                                    priority === p && { color: Colors.dark }
                                ]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput 
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text, height: 80 }]}
                        placeholder="Description (optionnel)"
                        placeholderTextColor={Colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <View style={styles.modalActions}>
                        <CyberButton title="ANNULER" onPress={() => setModalVisible(false)} variant="outline" style={{ flex: 1, marginRight: 8 }} />
                        <CyberButton title="AJOUTER" onPress={handleSave} style={{ flex: 1 }} />
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
  cardInfo: {
      flex: 1,
      marginLeft: 12,
  },
  cardTitle: {
      color: Colors.text,
      fontFamily: 'Orbitron',
      fontSize: 14,
      marginBottom: 4,
  },
  desc: {
      color: Colors.textMuted,
      fontSize: 12,
      fontStyle: 'italic',
      marginBottom: 6,
  },
  meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  priorityBadge: {
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  priorityText: {
      fontSize: 10,
      fontFamily: 'Orbitron-Bold',
  },
  date: {
      color: Colors.textMuted,
      fontSize: 10,
  },
  delBtn: {
      padding: 8,
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
  prioritySelector: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
  },
  prioOption: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
  },
  prioText: {
      color: Colors.text,
      fontFamily: 'Orbitron-Bold',
      fontSize: 10,
  },
  modalActions: {
      flexDirection: 'row',
      marginTop: 10,
  }
});
