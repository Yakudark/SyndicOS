import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CyberButton } from '../../src/components/ui/CyberButton';
import { NeonCard } from '../../src/components/ui/NeonCard';
import { financesRepo } from '../../src/repositories/financesRepo';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Colors, Themes } from '../../src/theme/colors';

const CATEGORIES = ['CHARGES', 'TRAVAUX', 'HONORAIRES', 'AUTRE'];

export default function FinancesScreen() {
  const themeVariant = useSettingsStore(state => state.themeVariant);
  const theme = Themes[themeVariant];
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('AUTRE');

  const loadData = async () => {
    setLoading(true);
    const [all, newStats] = await Promise.all([
        financesRepo.getAll(),
        financesRepo.getStats()
    ]);
    setItems(all as any);
    setStats(newStats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
      if (!title || !amount) {
          Alert.alert('Erreur', 'Titre et montant requis');
          return;
      }

      await financesRepo.create({
          title,
          amount: parseFloat(amount),
          type,
          category,
          date: new Date(),
          createdAt: new Date(),
      });

      setModalVisible(false);
      setTitle('');
      setAmount('');
      setType('EXPENSE');
      loadData();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer cette entrée ?', [
        { text: 'Annuler', style: 'cancel' },
        { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
                await financesRepo.delete(id);
                loadData(); 
            }
        }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.primary }]}>FINANCES</Text>
      </View>

      <View style={styles.statsContainer}>
          <NeonCard style={styles.statCard}>
              <Text style={styles.statLabel}>SOLDE</Text>
              <Text 
                style={[styles.statValue, { color: stats.balance >= 0 ? Colors.green : Colors.red, fontSize: 24 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                  {stats.balance.toFixed(2)} €
              </Text>
          </NeonCard>
          <View style={styles.row}>
            <NeonCard style={[styles.statCard, styles.halfCard] as any}>
                <Text style={styles.statLabel}>RECETTES</Text>
                <Text 
                    style={[styles.statValue, { color: Colors.green }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    +{stats.income.toFixed(2)}
                </Text>
            </NeonCard>
            <NeonCard style={[styles.statCard, styles.halfCard] as any}>
                <Text style={styles.statLabel}>DÉPENSES</Text>
                <Text 
                    style={[styles.statValue, { color: Colors.red }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    -{stats.expense.toFixed(2)}
                </Text>
            </NeonCard>
          </View>
      </View>

      <View style={styles.actionContainer}>
          <CyberButton 
            title="NOUVELLE ENTRÉE" 
            onPress={() => setModalVisible(true)}
            icon={<MaterialCommunityIcons name="plus" size={20} color={themeVariant === 'cyan' ? '#000' : '#fff'} />} 
          />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune opération.</Text>
        }
        renderItem={({ item }: { item: any }) => (
            <NeonCard style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={[styles.iconBox, { borderColor: item.type === 'INCOME' ? Colors.green : Colors.red }]}>
                        <MaterialCommunityIcons 
                            name={item.type === 'INCOME' ? "arrow-bottom-left" : "arrow-top-right"} 
                            size={24} 
                            color={item.type === 'INCOME' ? Colors.green : Colors.red} 
                        />
                    </View>
                    
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.desc}>{item.category} • {dayjs(item.date).format('DD/MM/YYYY')}</Text>
                    </View>

                    <Text style={[styles.amount, { color: item.type === 'INCOME' ? Colors.green : Colors.red }]}>
                        {item.type === 'INCOME' ? '+' : '-'}{item.amount.toFixed(2)} €
                    </Text>

                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
                         <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textMuted} />
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
                    <Text style={[styles.modalTitle, { color: theme.primary }]}>NOUVELLE OPÉRATION</Text>

                    <View style={styles.typeSelector}>
                        <TouchableOpacity 
                            style={[styles.typeOption, type === 'EXPENSE' && { backgroundColor: Colors.red, borderColor: Colors.red }]}
                            onPress={() => setType('EXPENSE')}
                        >
                            <Text style={[styles.typeText, type === 'EXPENSE' && { color: '#fff' }]}>DÉPENSE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.typeOption, type === 'INCOME' && { backgroundColor: Colors.green, borderColor: Colors.green }]}
                            onPress={() => setType('INCOME')}
                        >
                            <Text style={[styles.typeText, type === 'INCOME' && { color: '#000' }]}>RECETTE</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput 
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                        placeholder="Titre..."
                        placeholderTextColor={Colors.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput 
                        style={[styles.input, { borderColor: 'rgba(255,255,255,0.2)', color: Colors.text }]}
                        placeholder="Montant (€)"
                        placeholderTextColor={Colors.textMuted}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />

                    <View style={styles.catSelector}>
                        {CATEGORIES.map(c => (
                             <TouchableOpacity 
                                key={c}
                                style={[
                                    styles.catOption, 
                                    category === c && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                                onPress={() => setCategory(c)}
                            >
                                <Text style={[
                                    styles.catText,
                                    category === c && { color: Colors.dark }
                                ]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

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
  statsContainer: {
      padding: 16,
  },
  statCard: {
      alignItems: 'center',
      padding: 16,
      marginBottom: 12,
  },
  row: {
      flexDirection: 'row',
      gap: 12,
  },
  halfCard: {
      flex: 1,
  },
  statLabel: {
      color: Colors.textMuted,
      fontFamily: 'Orbitron',
      fontSize: 12,
      marginBottom: 4,
  },
  statValue: {
      fontFamily: 'Orbitron-Bold',
      fontSize: 16,
      color: Colors.text,
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
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  cardInfo: {
      flex: 1,
  },
  cardTitle: {
      color: Colors.text,
      fontFamily: 'Orbitron-Bold',
      fontSize: 14,
      marginBottom: 2,
  },
  desc: {
      color: Colors.textMuted,
      fontSize: 10,
  },
  amount: {
      fontFamily: 'Orbitron-Bold',
      fontSize: 14,
      marginRight: 10,
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
      gap: 12,
  },
  typeOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
  },
  typeText: {
      color: Colors.textMuted,
      fontFamily: 'Orbitron-Bold',
      fontSize: 12,
  },
  catSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
  },
  catOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  catText: {
      color: Colors.text,
      fontSize: 10,
      fontFamily: 'Orbitron',
  },
  modalActions: {
      flexDirection: 'row',
      marginTop: 10,
  }
});
