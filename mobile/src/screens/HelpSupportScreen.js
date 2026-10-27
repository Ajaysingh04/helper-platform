import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';
import { openVideoPicker } from '../utils/imagePickerHelper';

const FAQS_EN = [
  {
    q: 'How do I request a 100% refund for defective work?',
    a: 'If the technician did not complete the job properly, you can submit a complaint ticket with a short video clip showing the defect. Our quality assurance team will inspect the video and credit a 100% refund directly to your original payment method within 2-4 hours.',
  },
  {
    q: 'How do I reschedule or cancel my service booking?',
    a: 'You can reschedule or cancel anytime before the technician arrives from the "Bookings" tab. No cancellation fee is charged if done at least 2 hours prior to the slot.',
  },
  {
    q: 'Are all service professionals background verified?',
    a: 'Yes, 100% of Helper Crew professionals undergo strict police verification, Aadhaar government ID authentication, and hands-on technical skill evaluation before being dispatched.',
  },
  {
    q: 'What is the Helper Re-work Warranty?',
    a: 'We provide a 30-day service warranty on all completed jobs. If any issue arises, a senior specialist technician will revisit your home free of cost.',
  },
  {
    q: 'Is there property damage protection?',
    a: 'Yes, Helper covers accidental property damages up to ₹10,000 under our Safe Shield protection guarantee for every booking booked on the platform.',
  },
];

const FAQS_HI = [
  {
    q: 'खराब काम के लिए 100% रिफंड कैसे प्राप्त करें?',
    a: 'यदि कारीगर ने काम सही से नहीं किया है, तो आप शिकायत टिकट में खराब काम का छोटा वीडियो अपलोड कर सकते हैं। हमारी गुणवत्ता जांच टीम वीडियो देखकर 2-4 घंटों के भीतर आपके मूल बैंक या यूपीआई खाते में 100% राशि वापस कर देगी।',
  },
  {
    q: 'मैं अपनी सेवा बुकिंग का समय कैसे बदलूं या रद्द करूं?',
    a: 'कारीगर के आने से पहले आप "बुकिंग" टैब से कभी भी समय बदल सकते हैं या रद्द कर सकते हैं। निर्धारित समय से 2 घंटे पहले रद्द करने पर कोई शुल्क नहीं लिया जाता है।',
  },
  {
    q: 'क्या सभी सेवा प्रदाता पुलिस सत्यापित हैं?',
    a: 'हाँ, हेल्पर के सभी विशेषज्ञ पुलिस सत्यापन, आधार कार्ड जांच एवं व्यावहारिक कौशल परीक्षा उत्तीर्ण करने के पश्चात ही सेवा के लिए भेजे जाते हैं।',
  },
  {
    q: 'हेल्पर पुनः सेवा गारंटी क्या है?',
    a: 'हम प्रत्येक सेवा पर 30 दिनों की वारंटी प्रदान करते हैं। यदि काम में कोई कमी रह जाती है, तो वरिष्ठ विशेषज्ञ बिना किसी अतिरिक्त शुल्क के पुनः सेवा प्रदान करते हैं।',
  },
  {
    q: 'क्या घर के सामान की सुरक्षा गारंटी है?',
    a: 'हाँ, हेल्पर सुरक्षा कवच के अंतर्गत सेवा के दौरान किसी भी आकस्मिक क्षति पर ₹10,000 तक का सुरक्षा कवर प्रदान किया जाता है।',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const { primaryColor, language, showCustomAlert } = useContext(AppContext);
  const activeColor = primaryColor || colors.primary;
  const isHi = language === 'hi';

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Ticket & Dispute Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState(isHi ? 'काम सही से नहीं किया' : 'Work Defect / Poor Quality');
  const [ticketDesc, setTicketDesc] = useState('');
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [ticketVideo, setTicketVideo] = useState(null);
  const [ticketResolution, setTicketResolution] = useState('refund');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Chat Simulator Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'agent',
      text: 'Namaste! 🙏 Main Helper 24x7 AI Assistant hoon. Booking, refund, technician tracking ya pricing me main aapki kya sahayata kar sakta hoon? (Session limit: 5 messages) 🛠️',
    },
  ]);
  const [msgInput, setMsgInput] = useState('');

  const faqs = isHi ? FAQS_HI : FAQS_EN;

  const toggleFaq = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCallSupport = () => {
    if (showCustomAlert) {
      showCustomAlert({
        title: isHi ? 'हेल्पर सपोर्ट को कॉल करें 📞' : 'Call Helper Support 📞',
        message: isHi
          ? 'त्वरित ग्राहक सहायता हेतु 1800-202-6000 (टोल फ्री) डायल करें?'
          : 'Dial 1800-202-6000 (Toll Free) for instant customer support?',
        type: 'info',
        icon: '📞',
        buttons: [
          { text: isHi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
          {
            text: isHi ? 'अभी कॉल करें' : 'Call Now',
            style: 'default',
            onPress: () => {
              Linking.openURL('tel:18002026000').catch(() => {
                showCustomAlert({
                  title: isHi ? 'फ़ोन कॉल' : 'Phone Call',
                  message: '1800-202-6000',
                  type: 'info',
                  icon: '📞',
                  buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
                });
              });
            },
          },
        ],
      });
      return;
    }
  };

  const handleWhatsAppSupport = () => {
    const phone = '917389451349';
    const text = isHi
      ? 'नमस्ते हेल्पर टीम, मुझे अपनी सेवा बुकिंग के संबंध में सहायता चाहिए।'
      : 'Hi Helper Team, I need assistance with my home service booking.';
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      if (showCustomAlert) {
        showCustomAlert({
          title: 'WhatsApp',
          message: '+91 7389451349',
          type: 'info',
          icon: '💬',
          buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
        });
      }
    });
  };

  const handlePickTicketVideo = () => {
    openVideoPicker(
      (asset) => {
        setTicketVideo(asset);
        if (showCustomAlert) {
          showCustomAlert({
            title: isHi ? 'वीडियो प्रमाण जुड़ा ✓' : 'Video Attached ✓',
            message: isHi
              ? 'खराब काम का वीडियो सफलतापूर्वक संलग्न कर दिया गया है।'
              : 'Defect video evidence has been attached successfully.',
            type: 'success',
            icon: '📹',
            buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
          });
        }
      },
      { language }
    );
  };

  const handleSubmitTicket = () => {
    if (!ticketDesc.trim()) {
      if (showCustomAlert) {
        showCustomAlert({
          title: isHi ? 'विवरण आवश्यक है' : 'Details Required',
          message: isHi
            ? 'कृपया समस्या का विवरण दर्ज करें ताकि हमारी टीम तुरंत समाधान कर सके।'
            : 'Please explain your issue so our team can resolve it quickly.',
          type: 'warning',
          icon: '⚠️',
          buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
        });
      }
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      setShowTicketModal(false);
      const hasVideo = !!ticketVideo;
      setTicketDesc('');
      setBookingIdInput('');
      setTicketVideo(null);

      if (showCustomAlert) {
        showCustomAlert({
          title: isHi ? 'शिकायत एवं गारंटी टिकट दर्ज 🎫' : 'Complaint Ticket Raised 🎫',
          message: isHi
            ? `टिकट #HLP-${ticketNum} सफलतापूर्वक दर्ज कर लिया गया है। ${hasVideo ? 'आपका वीडियो प्रमाण संलग्न है। ' : ''}समाधान विकल्प: ${ticketResolution === 'refund' ? '100% पूरा रिफंड' : 'निःशुल्क पुनः सेवा'}। हमारे वरिष्ठ अधिकारी 15 मिनट के भीतर आपसे संपर्क करेंगे।`
            : `Ticket #HLP-${ticketNum} registered for "${ticketCategory}". ${hasVideo ? 'Video evidence attached. ' : ''}Resolution: ${ticketResolution === 'refund' ? '100% Full Refund' : 'Free Re-work'}. Senior resolution manager will call you within 15 minutes.`,
          type: 'success',
          icon: '🛡️',
          buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
        });
      }
    }, 700);
  };

  const handleSendMessage = () => {
    if (!msgInput.trim() || isAiTyping) return;

    if (userMsgCount >= 5) {
      Alert.alert(
        'Chat Limit Reached (5/5)',
        'Aapki is session ki 5 messages ki सीमा poori ho chuki hai. Kripya Call ya WhatsApp support ka upyog karein! 📞'
      );
      return;
    }

    const currentMsgText = msgInput.trim();
    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentMsgText,
    };
    const textLower = currentMsgText.toLowerCase();

    setChatMessages((prev) => [...prev, userMsg]);
    setMsgInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      setIsAiTyping(false);
      let reply = '';

      // Intelligent Hinglish comprehension & answers
      if (
        textLower.includes('refund') ||
        textLower.includes('paise') ||
        textLower.includes('paisa') ||
        textLower.includes('wapas') ||
        textLower.includes('kharab') ||
        textLower.includes('bekar') ||
        textLower.includes('cheat')
      ) {
        reply = 'Aap bilkul chinta mat karein! Agar technician ne kaam sahi se nahi kiya hai, toh aap isi screen par "Complaint Ticket" me defect ka video clip upload kar sakte hain. Hamari QA team 2 ghante me check karke aapke bank/UPI me 100% full refund direct credit kar degi! 💳';
      } else if (
        textLower.includes('cancel') ||
        textLower.includes('radd') ||
        textLower.includes('reschedule') ||
        textLower.includes('change') ||
        textLower.includes('samay')
      ) {
        reply = 'Aap "Bookings" tab me jakar kisi bhi service ko easily cancel ya reschedule kar sakte hain. Service time se 2 ghante pehle cancel karne par ₹0 cancellation fee lagti hai aur instant refund mil jata hai! 🔄';
      } else if (
        textLower.includes('technician') ||
        textLower.includes('worker') ||
        textLower.includes('pro') ||
        textLower.includes('late') ||
        textLower.includes('kab aayega') ||
        textLower.includes('kahan hai') ||
        textLower.includes('kitni der')
      ) {
        reply = 'Aapke technician ka live GPS radar on hai! Aap app me "Live Tracking" screen par jakar unki live bike location track kar sakte hain aur unhe seedha Call karke puchh sakte hain! 📍🛵';
      } else if (
        textLower.includes('coupon') ||
        textLower.includes('discount') ||
        textLower.includes('offer') ||
        textLower.includes('chhoot') ||
        textLower.includes('promo')
      ) {
        reply = 'Naye orders par flat ₹100 ki chhoot ke liye checkout screen par coupon code "HELPERPLUS" apply karein! Iske alawa wallet payments par 5% extra cashback bhi milta hai! 🎁';
      } else if (
        textLower.includes('price') ||
        textLower.includes('rate') ||
        textLower.includes('charge') ||
        textLower.includes('kitna') ||
        textLower.includes('kharcha')
      ) {
        reply = 'Helper par transparent pricing milti hai: Basic inspection fee sirf ₹99 hai, AC cleaning ₹299 se shuru hai, aur sabhi completed jobs par 30 Dino ki free revisit warranty milti hai! 🛠️';
      } else if (
        textLower.includes('hi') ||
        textLower.includes('hello') ||
        textLower.includes('hey') ||
        textLower.includes('namaste') ||
        textLower.includes('kya hal')
      ) {
        reply = 'Namaste! 🙏 Main Helper AI Assistant hoon. Booking status, refund, technician tracking ya repair rates me main aapki kya sahayata kar sakta hoon?';
      } else if (
        textLower.includes('payment') ||
        textLower.includes('paytm') ||
        textLower.includes('upi') ||
        textLower.includes('kat gaya') ||
        textLower.includes('failed')
      ) {
        reply = 'Agar aapka payment cut ho gaya hai lekin booking pending dikha raha hai, toh banking server se 15 minute me auto-sync ho jayega. Agar booking nahi bani toh 100% paise 24 ghante me aapke bank me laut aayenge. 🛡️';
      } else {
        reply = `Maine aapki request "${currentMsgText}" note kar li hai. Helper support team iski jaanch kar rahi hai. Kisi urgent issue ke liye aap hume 1800-202-6000 par direct call bhi kar sakte hain! ⚡`;
      }

      const newReplies = [
        { id: (Date.now() + 1).toString(), sender: 'agent', text: reply },
      ];

      // If reached 5 user messages, append final session closure warning
      if (newCount >= 5) {
        newReplies.push({
          id: (Date.now() + 2).toString(),
          sender: 'agent',
          text: '⚠️ Aapki 5 messages ki AI chat limit poori ho chuki hai. Aage ki baat karne ya urgent solution ke liye kripya Toll Free Call (1800-202-6000) ya WhatsApp (+91 7389451349) button par click karein! 📞💬',
        });
      }

      setChatMessages((prev) => [...prev, ...newReplies]);
    }, 700);
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
        <Text style={styles.headerTitle}>
          {isHi ? 'सहायता एवं 24x7 सपोर्ट' : 'Help & 24x7 Support'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>
            {isHi ? '🎧 24x7 समर्पित ग्राहक सेवा' : '🎧 24x7 DEDICATED CARE'}
          </Text>
          <Text style={styles.heroTitle}>
            {isHi ? 'हम आपकी सहायता के लिए सदैव उपलब्ध हैं' : 'We are here to help you'}
          </Text>
          <Text style={styles.heroSub}>
            {isHi
              ? 'सेवा की गुणवत्ता, कारीगर आगमन अथवा रिफंड में कोई समस्या? तुरंत सहायता प्राप्त करें।'
              : 'Facing an issue with your service quality, pro arrival, or payment? Connect with us instantly.'}
          </Text>
        </View>

        {/* Quick Contact Buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={handleCallSupport}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <Text style={styles.contactTitle}>{isHi ? 'कॉल करें' : 'Call Us'}</Text>
            <Text style={styles.contactSub}>{isHi ? 'टोल फ्री' : 'Toll Free'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={handleWhatsAppSupport}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <Text style={styles.contactTitle}>{isHi ? 'व्हाट्सएप' : 'WhatsApp'}</Text>
            <Text style={styles.contactSub}>{isHi ? 'तुरंत चैट' : 'Instant Chat'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => setShowChatModal(true)}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: `${activeColor}20` }]}>
              <Text style={styles.contactIcon}>🤖</Text>
            </View>
            <Text style={styles.contactTitle}>{isHi ? 'लाइव बॉट' : 'Live Bot'}</Text>
            <Text style={styles.contactSub}>{isHi ? 'स्वचालित' : 'Interactive'}</Text>
          </TouchableOpacity>
        </View>

        {/* 100% Refund & Defect Video Evidence Card */}
        <TouchableOpacity
          style={[styles.raiseTicketBtn, { borderColor: `${activeColor}70` }]}
          activeOpacity={0.8}
          onPress={() => setShowTicketModal(true)}
        >
          <View style={styles.ticketBtnLeft}>
            <Text style={styles.ticketIcon}>🛡️</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.ticketTitle}>
                  {isHi ? 'शिकायत एवं 100% रिफंड दावा' : 'Raise Complaint & 100% Refund'}
                </Text>
                <View style={[styles.activePill, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.activePillText}>{isHi ? 'वीडियो प्रमाण' : 'Video Proof'}</Text>
                </View>
              </View>
              <Text style={styles.ticketSub}>
                {isHi
                  ? 'काम सही से नहीं हुआ? वीडियो प्रमाण अपलोड करके 100% रिफंड या पुनः सेवा पाएं'
                  : 'Work not done properly? Attach defect video for full refund or re-work'}
              </Text>
            </View>
          </View>
          <Text style={[styles.ticketArrow, { color: activeColor }]}>➔</Text>
        </TouchableOpacity>

        {/* Helper Shield Guarantee */}
        <View style={styles.shieldCard}>
          <View style={styles.shieldIconWrap}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shieldTitle}>
              {isHi ? 'हेल्पर सुरक्षा कवच गारंटी' : 'Helper Safe Shield Guarantee'}
            </Text>
            <Text style={styles.shieldDesc}>
              {isHi
                ? 'प्रत्येक सेवा ₹10,000 क्षति बीमा, 30 दिन की पुनः सेवा वारंटी एवं पुलिस सत्यापित कारीगरों से सुरक्षित है।'
                : 'Every booking is protected by ₹10,000 damage insurance, 30-day re-work warranty, and verified experts.'}
            </Text>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.faqSectionTitle}>
          {isHi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'FREQUENTLY ASKED QUESTIONS'}
        </Text>

        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, isExpanded && { borderColor: `${activeColor}60` }]}
              activeOpacity={0.8}
              onPress={() => toggleFaq(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={[styles.faqChevron, { color: isExpanded ? activeColor : '#64748B' }]}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>
              {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Complaint / Refund Modal with Video Upload */}
      <Modal visible={showTicketModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isHi ? 'शिकायत एवं रिफंड अनुरोध' : 'File Complaint & Claim Refund'}
                </Text>
                <Text style={styles.modalSub}>
                  {isHi ? 'काम सही से नहीं हुआ तो वीडियो प्रमाण दें' : 'Submit defect video for quick resolution'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTicketModal(false)} style={styles.closeBtnCircle}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }}>
              {/* Category selector */}
              <Text style={styles.modalLabel}>
                {isHi ? 'समस्या का प्रकार चुनें' : 'SELECT ISSUE CATEGORY'}
              </Text>
              <View style={styles.catChipsRow}>
                {[
                  { en: 'Work Defect / Poor Quality', hi: 'काम सही से नहीं किया / खराबी' },
                  { en: '100% Refund Request', hi: '100% पूरा रिफंड अनुरोध' },
                  { en: 'Property Damage', hi: 'सेवा के दौरान क्षति' },
                  { en: 'Technician Delay', hi: 'कारीगर आगमन में देरी' },
                  { en: 'Billing Dispute', hi: 'अतिरिक्त शुल्क विवाद' },
                ].map((item) => {
                  const label = isHi ? item.hi : item.en;
                  const isSelected = ticketCategory === label || ticketCategory === item.en;
                  return (
                    <TouchableOpacity
                      key={item.en}
                      style={[
                        styles.catChip,
                        isSelected && { borderColor: activeColor, backgroundColor: `${activeColor}20` },
                      ]}
                      onPress={() => setTicketCategory(label)}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          isSelected && { color: activeColor, fontWeight: '800' },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Booking ID Input */}
              <Text style={styles.modalLabel}>
                {isHi ? 'बुकिंग आईडी (वैकल्पिक)' : 'BOOKING ID (OPTIONAL)'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={isHi ? 'उदा. #ORD-8492' : 'e.g. #ORD-8492'}
                placeholderTextColor="#64748B"
                value={bookingIdInput}
                onChangeText={setBookingIdInput}
              />

              {/* VIDEO EVIDENCE UPLOAD BUTTON */}
              <Text style={styles.modalLabel}>
                {isHi ? 'खराब काम का वीडियो प्रमाण (अनुशंसित) 📹' : 'DEFECT VIDEO EVIDENCE (RECOMMENDED) 📹'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.videoUploadBtn,
                  ticketVideo && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)' },
                ]}
                activeOpacity={0.8}
                onPress={handlePickTicketVideo}
              >
                <Text style={styles.videoIconEmoji}>{ticketVideo ? '✅' : '📹'}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.videoTitle, ticketVideo && { color: '#10B981' }]}>
                    {ticketVideo
                      ? (isHi ? 'वीडियो प्रमाण संलग्न है' : 'Video Evidence Attached ✓')
                      : (isHi ? 'खराब काम का वीडियो रिकॉर्ड / अपलोड करें' : 'Record / Upload Defect Video')}
                  </Text>
                  <Text style={styles.videoSub} numberOfLines={1}>
                    {ticketVideo
                      ? (ticketVideo.fileName || 'defect_video.mp4')
                      : (isHi ? 'कैमरे से लाइव रिकॉर्ड करें या गैलरी से चुनें (MP4/MOV)' : 'Capture defect via camera or choose video from phone')}
                  </Text>
                </View>
                {ticketVideo ? (
                  <TouchableOpacity onPress={() => setTicketVideo(null)} style={styles.removeVideoBtn}>
                    <Text style={styles.removeVideoText}>✕</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.addBadge, { backgroundColor: activeColor }]}>
                    <Text style={styles.addBadgeText}>{isHi ? '+ जोड़ें' : '+ Add'}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Explanation Textarea */}
              <Text style={styles.modalLabel}>
                {isHi ? 'समस्या का विस्तार से विवरण दें *' : 'EXPLAIN YOUR ISSUE *'}
              </Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder={
                  isHi
                    ? 'कारीगर ने क्या काम खराब किया अथवा क्या समस्या हुई...'
                    : 'Describe what happened with the technician or service...'
                }
                placeholderTextColor="#64748B"
                value={ticketDesc}
                onChangeText={setTicketDesc}
                multiline
              />

              {/* Resolution Choice */}
              <Text style={styles.modalLabel}>
                {isHi ? 'आप क्या समाधान चाहते हैं?' : 'DESIRED RESOLUTION'}
              </Text>
              <View style={styles.resolutionRow}>
                <TouchableOpacity
                  style={[
                    styles.resolutionCard,
                    ticketResolution === 'refund' && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                  ]}
                  onPress={() => setTicketResolution('refund')}
                >
                  <Text style={styles.resolutionEmoji}>💸</Text>
                  <Text style={[styles.resolutionTitle, ticketResolution === 'refund' && { color: '#10B981', fontWeight: '900' }]}>
                    {isHi ? '100% पूरा रिफंड' : '100% Full Refund'}
                  </Text>
                  <Text style={styles.resolutionSub}>
                    {isHi ? 'मूल खाते में वापस' : 'Direct to UPI / Bank'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.resolutionCard,
                    ticketResolution === 'rework' && { borderColor: activeColor, backgroundColor: `${activeColor}15` },
                  ]}
                  onPress={() => setTicketResolution('rework')}
                >
                  <Text style={styles.resolutionEmoji}>🔁</Text>
                  <Text style={[styles.resolutionTitle, ticketResolution === 'rework' && { color: activeColor, fontWeight: '900' }]}>
                    {isHi ? 'निःशुल्क पुनः सेवा' : 'Free Senior Re-work'}
                  </Text>
                  <Text style={styles.resolutionSub}>
                    {isHi ? 'वरिष्ठ विशेषज्ञ द्वारा' : 'By Senior Specialist'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: activeColor }]}
                onPress={handleSubmitTicket}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionText}>
                  {isSubmitting
                    ? (isHi ? 'दावा दर्ज हो रहा है...' : 'Submitting Claim...')
                    : (isHi ? 'शिकायत एवं गारंटी टिकट दर्ज करें 🛡️' : 'Submit Complaint Ticket 🛡️')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Live Chat Simulator Modal */}
      <Modal visible={showChatModal} animationType="slide">
        <SafeAreaView style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.chatHeaderTitle}>Helper AI 24x7 Assistant 🤖</Text>
              <View style={styles.chatHeaderBadgeRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.chatHeaderSub}>AI Support • </Text>
                <View style={[
                  styles.msgCountBadge,
                  userMsgCount >= 5 ? styles.msgCountBadgeFull : null
                ]}>
                  <Text style={styles.msgCountBadgeText}>
                    💬 {userMsgCount}/5 Messages
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setUserMsgCount(0);
                setChatMessages([
                  {
                    id: Date.now().toString(),
                    sender: 'agent',
                    text: 'Namaste! 🙏 Naya chat session shuru ho gaya hai. Aap apna sawal poochh sakte hain! (Limit: 5 messages)',
                  },
                ]);
              }}
              style={styles.refreshChatBtn}
            >
              <Text style={styles.refreshChatBtnText}>🔄</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatBody} contentContainerStyle={{ padding: 16 }}>
            {chatMessages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.msgBubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: activeColor }]
                      : styles.agentBubble,
                  ]}
                >
                  <Text style={styles.msgText}>{m.text}</Text>
                </View>
              );
            })}

            {isAiTyping && (
              <View style={[styles.msgBubble, styles.agentBubble, { width: 90 }]}>
                <Text style={[styles.msgText, { color: '#94A3B8' }]}>AI typing...</Text>
              </View>
            )}

            {/* When limit is reached, show direct Call & WhatsApp CTAs */}
            {userMsgCount >= 5 && (
              <View style={styles.limitReachedBox}>
                <Text style={styles.limitReachedTitle}>
                  📞 Connect with Direct Support Team
                </Text>
                <Text style={styles.limitReachedSub}>
                  You have reached the 5-message session limit. Please connect directly with our support executive:
                </Text>
                <View style={styles.limitActionsRow}>
                  <TouchableOpacity
                    style={[styles.limitActionBtn, { backgroundColor: '#22C55E' }]}
                    onPress={handleCallSupport}
                  >
                    <Text style={styles.limitActionBtnText}>📞 Call 1800-202-6000</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.limitActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={handleWhatsAppSupport}
                  >
                    <Text style={styles.limitActionBtnText}>💬 WhatsApp Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputBar}>
            <TextInput
              style={[
                styles.chatInput,
                userMsgCount >= 5 && { opacity: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.02)' }
              ]}
              placeholder={
                userMsgCount >= 5
                  ? 'Limit reached (5/5). Use Call/WhatsApp above'
                  : 'Ask anything in Hinglish (e.g. refund, late pro, coupon)...'
              }
              placeholderTextColor="#64748B"
              value={msgInput}
              onChangeText={setMsgInput}
              editable={userMsgCount < 5 && !isAiTyping}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: userMsgCount >= 5 ? '#475569' : activeColor },
              ]}
              onPress={handleSendMessage}
              disabled={userMsgCount >= 5 || isAiTyping}
            >
              <Text style={styles.sendBtnText}>➔</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heroBadge: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    alignItems: 'center',
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  contactSub: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 2,
  },
  raiseTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.darkCard,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ticketBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ticketIcon: {
    fontSize: 24,
  },
  ticketTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  ticketSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  ticketArrow: {
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
  },
  shieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  shieldIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 20,
  },
  shieldTitle: {
    color: '#10B981',
    fontSize: 13.5,
    fontWeight: '900',
  },
  shieldDesc: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  faqSectionTitle: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    paddingRight: 8,
  },
  faqChevron: {
    fontSize: 12,
  },
  faqAnswer: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 8,
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
    maxHeight: '90%',
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
    fontSize: 16.5,
    fontWeight: '900',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  modalLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 14,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  catChipText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  videoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  videoIconEmoji: {
    fontSize: 24,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  videoSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  removeVideoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeVideoText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '900',
  },
  addBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  resolutionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  resolutionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  resolutionEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  resolutionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resolutionSub: {
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  primaryActionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    backgroundColor: '#090D16',
  },
  chatHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  chatHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  chatHeaderSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  msgCountBadge: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  msgCountBadgeFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  msgCountBadgeText: {
    color: '#FF6B4A',
    fontSize: 10,
    fontWeight: '800',
  },
  refreshChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshChatBtnText: {
    fontSize: 16,
  },
  chatBody: {
    flex: 1,
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderBottomLeftRadius: 2,
  },
  msgText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 19,
  },
  limitReachedBox: {
    backgroundColor: '#131C31',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
  },
  limitReachedTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  limitReachedSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  limitActionsRow: {
    gap: 8,
  },
  limitActionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  limitActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    backgroundColor: '#090D16',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 20,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
