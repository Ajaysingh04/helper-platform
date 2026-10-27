import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';

const DEFAULT_UPI_LIST = [
  { id: 'upi-1', vpa: 'ajaysingh@okaxis', bank: 'Google Pay / Axis Bank', isDefault: true },
  { id: 'upi-2', vpa: '7389451349@ybl', bank: 'PhonePe / Yes Bank', isDefault: false },
];

const DEFAULT_CARDS = [
  {
    id: 'card-1',
    holder: 'Ajay Singh',
    last4: '4829',
    brand: 'VISA',
    exp: '08/29',
    type: 'Credit Card',
    gradient: '#1E3A8A',
  },
  {
    id: 'card-2',
    holder: 'Ajay Singh',
    last4: '9102',
    brand: 'Mastercard',
    exp: '11/27',
    type: 'Debit Card',
    gradient: '#831843',
  },
];

export default function PaymentMethodsScreen({ navigation }) {
  const { primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || colors.primary;

  const [walletBalance, setWalletBalance] = useState(350);
  const [upis, setUpis] = useState(DEFAULT_UPI_LIST);
  const [cards, setCards] = useState(DEFAULT_CARDS);

  // Modals
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [newVpa, setNewVpa] = useState('');

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('250');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const raw = await AsyncStorage.getItem('helper_saved_payments');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.walletBalance !== undefined) setWalletBalance(parsed.walletBalance);
        if (parsed.upis) setUpis(parsed.upis);
        if (parsed.cards) setCards(parsed.cards);
      }
    } catch (e) {
      console.log('Error reading payments storage', e);
    }
  };

  const persistPayments = async (updated) => {
    try {
      await AsyncStorage.setItem('helper_saved_payments', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving payments storage', e);
    }
  };

  const handleAddUpi = () => {
    if (!newVpa.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    const newEntry = {
      id: `upi-${Date.now()}`,
      vpa: newVpa.trim(),
      bank: 'UPI Linked Account',
      isDefault: upis.length === 0,
    };
    const updated = [newEntry, ...upis];
    setUpis(updated);
    persistPayments({ walletBalance, upis: updated, cards });
    setNewVpa('');
    setShowAddUpi(false);
    Alert.alert('UPI Added! ⚡', `${newEntry.vpa} has been added for 1-click payments.`);
  };

  const handleDeleteUpi = (upiId) => {
    Alert.alert('Remove UPI?', 'Are you sure you want to delete this UPI ID?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = upis.filter((u) => u.id !== upiId);
          setUpis(updated);
          persistPayments({ walletBalance, upis: updated, cards });
        },
      },
    ]);
  };

  const handleAddCard = () => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 12) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Cardholder Name', 'Please enter cardholder name as on card.');
      return;
    }
    const newCard = {
      id: `card-${Date.now()}`,
      holder: cardHolder.trim().toUpperCase(),
      last4: cleanNum.slice(-4),
      brand: cleanNum.startsWith('4') ? 'VISA' : cleanNum.startsWith('5') ? 'Mastercard' : 'RuPay',
      exp: cardExp.trim() || '12/28',
      type: 'Debit / Credit Card',
      gradient: '#1E293B',
    };
    const updated = [newCard, ...cards];
    setCards(updated);
    persistPayments({ walletBalance, upis, cards: updated });
    setCardHolder('');
    setCardNumber('');
    setCardExp('');
    setShowAddCard(false);
    Alert.alert('Card Saved! 💳', `Card ending in ${newCard.last4} saved securely.`);
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert('Remove Card?', 'Are you sure you want to delete this saved card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = cards.filter((c) => c.id !== cardId);
          setCards(updated);
          persistPayments({ walletBalance, upis, cards: updated });
        },
      },
    ]);
  };

  const handleRechargeWallet = () => {
    const amt = parseInt(rechargeAmt, 10);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter valid recharge amount.');
      return;
    }
    const updatedBal = walletBalance + amt;
    setWalletBalance(updatedBal);
    persistPayments({ walletBalance: updatedBal, upis, cards });
    setShowAddMoney(false);
    Alert.alert('Wallet Recharged! 💰', `₹${amt} added successfully. New balance: ₹${updatedBal}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Wallet</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>HELPER COINS & WALLET</Text>
              <Text style={styles.walletAmount}>₹{walletBalance}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addMoneyBtn, { backgroundColor: activeColor }]}
              activeOpacity={0.8}
              onPress={() => setShowAddMoney(true)}
            >
              <Text style={styles.addMoneyText}>+ Add Coins</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.walletSub}>
            🎁 1 Coin = ₹1. Usable across all home bookings for instant checkout discounts.
          </Text>
        </View>

        {/* UPI Accounts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SAVED UPI IDs</Text>
          <TouchableOpacity onPress={() => setShowAddUpi(true)}>
            <Text style={[styles.sectionAction, { color: activeColor }]}>+ Add UPI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardBox}>
          {upis.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.upiRow,
                index < upis.length - 1 && styles.upiBorder,
              ]}
            >
              <View style={styles.upiIconBox}>
                <Text style={styles.upiIcon}>⚡</Text>
              </View>
              <View style={styles.upiMeta}>
                <Text style={styles.upiVpa}>{item.vpa}</Text>
                <Text style={styles.upiBank}>{item.bank}</Text>
              </View>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => handleDeleteUpi(item.id)}
              >
                <Text style={styles.delText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Cards Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SAVED CARDS</Text>
          <TouchableOpacity onPress={() => setShowAddCard(true)}>
            <Text style={[styles.sectionAction, { color: activeColor }]}>+ Add Card</Text>
          </TouchableOpacity>
        </View>

        {cards.map((card) => (
          <View key={card.id} style={[styles.debitCardView, { backgroundColor: card.gradient }]}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardBrand}>{card.brand}</Text>
              <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                <Text style={styles.cardDelIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardNumbers}>••••  ••••  ••••  {card.last4}</Text>
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardSmallLabel}>CARDHOLDER</Text>
                <Text style={styles.cardHolderName}>{card.holder}</Text>
              </View>
              <View>
                <Text style={styles.cardSmallLabel}>EXPIRES</Text>
                <Text style={styles.cardExpDate}>{card.exp}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Pay After Service */}
        <View style={styles.codBox}>
          <View style={styles.codIconWrap}>
            <Text style={styles.codIcon}>💵</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.codTitle}>Pay After Service (Cash / Online)</Text>
            <Text style={styles.codSub}>
              Always available. Pay pro via Cash or QR code once the job is completed to your satisfaction.
            </Text>
          </View>
        </View>

        {/* Security Badge */}
        <View style={styles.securityRow}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            100% Safe & RBI Compliant • 256-Bit SSL Encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Add UPI Modal */}
      <Modal visible={showAddUpi} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link New UPI ID</Text>
              <TouchableOpacity onPress={() => setShowAddUpi(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>ENTER UPI ID (VPA)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. mobile@paytm or name@okaxis"
                placeholderTextColor="#64748B"
                value={newVpa}
                onChangeText={setNewVpa}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: activeColor }]}
                onPress={handleAddUpi}
              >
                <Text style={styles.primaryActionText}>Verify & Save UPI ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Debit / Credit Card</Text>
              <TouchableOpacity onPress={() => setShowAddCard(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>CARD NUMBER</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor="#64748B"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
              <Text style={styles.modalLabel}>NAME ON CARD</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Ajay Singh"
                placeholderTextColor="#64748B"
                value={cardHolder}
                onChangeText={setCardHolder}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>EXPIRY (MM/YY)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="12/28"
                    placeholderTextColor="#64748B"
                    value={cardExp}
                    onChangeText={setCardExp}
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>CVV</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="•••"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    maxLength={3}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: activeColor }]}
                onPress={handleAddCard}
              >
                <Text style={styles.primaryActionText}>Save Card Securely 💳</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Recharge Wallet Modal */}
      <Modal visible={showAddMoney} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recharge Helper Wallet</Text>
              <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>ENTER AMOUNT (₹)</Text>
              <TextInput
                style={[styles.modalInput, { fontSize: 20, fontWeight: '900' }]}
                value={rechargeAmt}
                onChangeText={setRechargeAmt}
                keyboardType="number-pad"
              />
              <View style={styles.quickChipsRow}>
                {['100', '250', '500', '1000'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={[
                      styles.quickChip,
                      rechargeAmt === chip && { borderColor: activeColor, backgroundColor: `${activeColor}20` },
                    ]}
                    onPress={() => setRechargeAmt(chip)}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        rechargeAmt === chip && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      +₹{chip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: activeColor }]}
                onPress={handleRechargeWallet}
              >
                <Text style={styles.primaryActionText}>Add ₹{rechargeAmt} to Wallet 💰</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    backgroundColor: '#090D16',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  walletCard: {
    backgroundColor: 'rgba(255, 77, 45, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 45, 0.3)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  addMoneyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  walletSub: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  cardBox: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: 'hidden',
    marginBottom: 20,
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  upiBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  upiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upiIcon: {
    fontSize: 16,
  },
  upiMeta: {
    flex: 1,
  },
  upiVpa: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  upiBank: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  delBtn: {
    padding: 6,
  },
  delText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
  },
  debitCardView: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardDelIcon: {
    fontSize: 16,
  },
  cardNumbers: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 18,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardSmallLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  cardExpDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  codBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  codIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codIcon: {
    fontSize: 20,
  },
  codTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  codSub: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  quickChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
});
