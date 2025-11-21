import React, { useState, useRef } from 'react';
import { Text, View, TextInput, Pressable, FlatList, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';

const MESSAGES = [
  { 
    id: '1', 
    from: 'them', 
    text: 'Slaam wa Slaam',
    timestamp: 'Nov 5, 7:01 AM'
  },
  { id: '2', from: 'me', text: 'Slaam wa Slaam', timestamp: 'Nov 5, 7:02 AM' },
];

export default function ChatScreen({ navigation, route }: any) {
  const { id } = route.params ?? {};
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSuggestTimeModal, setShowSuggestTimeModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isOnline] = useState(false); // Mock status
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const downArrowRef = useRef<View>(null);
  const threeDotsRef = useRef<View>(null);
  const attachButtonRef = useRef<View>(null);
  
  // Mock user data - in real app, this would come from route params or state
  const userInitials = 'SN';
  
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleStartCall = () => {
    setShowCallMenu(false);
    navigation.navigate('Call', { id, type: 'audio' });
  };

  const handleSuggestCallTime = () => {
    setShowCallMenu(false);
    setShowSuggestTimeModal(true);
    setSelectedDateTime(new Date());
  };

  const handleConfirmSuggestTime = () => {
    const formattedDate = selectedDateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = selectedDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const suggestionMessage = `📞 Call suggestion: ${formattedDate} at ${formattedTime}`;
    
    // In real app, this would send the message to the chat
    setMessageText(suggestionMessage);
    setShowSuggestTimeModal(false);
    
    Alert.alert(
      'Success',
      `Call time suggestion sent!\n${formattedDate} at ${formattedTime}`,
      [{ text: 'OK' }]
    );
  };

  const handleBlockUser = () => {
    setShowUserMenu(false);
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'User has been blocked');
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleReportUser = () => {
    setShowUserMenu(false);
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Report submitted. We will review it shortly.') 
        },
      ]
    );
  };

  const handleShowCallMenu = () => {
    if (downArrowRef.current) {
      downArrowRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({ x: x + width - 200, y: y + height + 4 });
        setShowCallMenu(true);
      });
    } else {
      setShowCallMenu(true);
    }
  };

  const handleShowUserMenu = () => {
    if (threeDotsRef.current) {
      threeDotsRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({ x: x + width - 200, y: y + height + 4 });
        setShowUserMenu(true);
      });
    } else {
      setShowUserMenu(true);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In real app, this would send the message
      setMessageText('');
      Alert.alert('Message sent', 'Your message has been sent');
    }
  };

  const handleAttachDocument = () => {
    setShowAttachMenu(true);
  };

  const handleDocumentOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open document picker
    Alert.alert('Document Picker', 'Document picker would open here');
  };

  const handleGalleryOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open image picker
    Alert.alert('Image Picker', 'Image picker would open here');
  };

  const handleCameraOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open camera
    Alert.alert('Camera', 'Camera would open here');
  };

  const renderMessage = (item: any, index: number) => {
    const showTimestamp = index === 0 || 
      (index > 0 && MESSAGES[index - 1].timestamp !== item.timestamp);
    
    return (
      <View key={item.id}>
        {showTimestamp && (
          <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
        )}
        <View
          style={[
            styles.messageContainer,
            item.from === 'me' ? styles.myMessageContainer : styles.theirMessageContainer,
          ]}>
          <View
            style={[
              styles.messageBubble,
              item.from === 'me' ? styles.myMessage : styles.theirMessage,
            ]}>
            <Text style={[
              styles.messageText, 
              item.from === 'me' ? styles.myMessageText : styles.theirMessageText
            ]}>
              {item.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.customHeader}>
        <Pressable 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        
        <View style={styles.headerMainContent}>
          <View style={styles.headerTopSection}>
            <View style={styles.profileSection}>
              <View style={styles.profileIconContainer}>
                <View style={styles.profileIcon}>
                  <Text style={styles.profileInitials}>{userInitials}</Text>
                </View>
                <View style={[styles.statusIndicator, !isOnline && styles.statusOffline]} />
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable 
                onPress={handleToggleFavorite}
                style={styles.starButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon 
                  name={isFavorite ? "star" : "star-outline"} 
                  size={22} 
                  color={isFavorite ? "#FFD700" : "#D4AF37"} 
                />
              </Pressable>
              <View ref={downArrowRef} collapsable={false}>
                <Pressable 
                  onPress={handleShowCallMenu}
                  style={styles.downArrowButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="chevron-down" size={18} color="#D4AF37" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        
        <View ref={threeDotsRef} collapsable={false}>
          <Pressable 
            onPress={handleShowUserMenu}
            style={styles.threeDotsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="ellipsis-vertical" size={20} color="#D4AF37" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>
        {MESSAGES.map((item, index) => renderMessage(item, index))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View ref={attachButtonRef} collapsable={false}>
          <Pressable 
            style={styles.attachButton}
            onPress={handleAttachDocument}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="attach-outline" size={24} color="#D4AF37" />
          </Pressable>
        </View>
        <TextInput
          placeholder="Send a message..."
          placeholderTextColor="#8C8A9A"
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <Pressable 
          style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}>
          <Icon 
            name="paper-plane" 
            size={24} 
            color={messageText.trim() ? "#FFFFFF" : "#8C8A9A"} 
          />
        </Pressable>
      </View>

      {/* Call Menu Modal */}
      <Modal
        visible={showCallMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallMenu(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCallMenu(false)}>
          <View 
            style={[
              styles.menuContainer, 
              styles.callMenuContainer,
              { top: menuPosition.y, left: menuPosition.x }
            ]}
            onStartShouldSetResponder={() => true}>
            <Pressable 
              style={styles.menuItem}
              onPress={handleStartCall}>
              <Icon name="call" size={20} color="#D4AF37" />
              <Text style={styles.menuItemText}>Start a call</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={handleSuggestCallTime}>
              <Icon name="time-outline" size={20} color="#D4AF37" />
              <Text style={styles.menuItemText}>Suggest a call time</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowUserMenu(false)}>
          <View 
            style={[
              styles.menuContainer, 
              styles.userMenuContainer,
              { top: menuPosition.y, left: menuPosition.x }
            ]}
            onStartShouldSetResponder={() => true}>
            <Pressable 
              style={styles.menuItem}
              onPress={handleBlockUser}>
              <Icon name="lock-closed-outline" size={20} color="#FF4444" />
              <Text style={[styles.menuItemText, styles.dangerText]}>Block this user</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={handleReportUser}>
              <Icon name="warning-outline" size={20} color="#FF4444" />
              <Text style={[styles.menuItemText, styles.dangerText]}>Report this user</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Attach File Menu Modal */}
      <Modal
        visible={showAttachMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachMenu(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAttachMenu(false)}>
          <View 
            style={styles.attachMenuContainer}
            onStartShouldSetResponder={() => true}>
            <Text style={styles.attachMenuTitle}>Attach File</Text>
            <Text style={styles.attachMenuSubtitle}>Choose an option</Text>
            <View style={styles.attachMenuOptions}>
              <Pressable 
                style={styles.attachMenuOption}
                onPress={handleDocumentOption}>
                <Text style={styles.attachMenuOptionText}>DOCUMENT</Text>
              </Pressable>
              <Pressable 
                style={styles.attachMenuOption}
                onPress={handleGalleryOption}>
                <Text style={styles.attachMenuOptionText}>GALLERY</Text>
              </Pressable>
              <Pressable 
                style={styles.attachMenuOption}
                onPress={handleCameraOption}>
                <Text style={styles.attachMenuOptionText}>CAMERA</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Suggest Call Time Modal */}
      <Modal
        visible={showSuggestTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuggestTimeModal(false)}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowSuggestTimeModal(false)}>
          <View 
            style={styles.suggestTimeContainer}
            onStartShouldSetResponder={() => true}>
            <View style={styles.suggestTimeHeader}>
              <Text style={styles.suggestTimeTitle}>Suggest Call Time</Text>
              <Pressable 
                onPress={() => setShowSuggestTimeModal(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            
            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionLabel}>Select Date & Time</Text>
              <View style={styles.dateTimeDisplay}>
                <Icon name="calendar-outline" size={20} color="#D4AF37" />
                <Text style={styles.dateTimeText}>
                  {selectedDateTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.dateTimeDisplay}>
                <Icon name="time-outline" size={20} color="#D4AF37" />
                <Text style={styles.dateTimeText}>
                  {selectedDateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <DatePicker
                date={selectedDateTime}
                onDateChange={setSelectedDateTime}
                mode="datetime"
                theme="dark"
                textColor="#FFFFFF"
                style={styles.datePicker}
              />
            </View>

            <View style={styles.suggestTimeActions}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowSuggestTimeModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={styles.suggestButton}
                onPress={handleConfirmSuggestTime}>
                <Text style={styles.suggestButtonText}>Suggest Time</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop:'10%',
    paddingBottom:5,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginTop: 4,
  },
  headerMainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  headerTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#20B2AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000000',
  },
  statusOffline: {
    backgroundColor: '#808080',
  },
  userInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  offlineBadge: {
    backgroundColor: '#808080',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  lastSeen: {
    color: '#8C8A9A',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  downArrowButton: {
    padding: 4,
  },
  userStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userStatusText: {
    color: '#8C8A9A',
    fontSize: 12,
  },
  threeDotsButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageTimestamp: {
    textAlign: 'center',
    color: '#8C8A9A',
    fontSize: 12,
    marginVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000000',
  },
  theirMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#D4AF37',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    minWidth: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
  },
  callMenuContainer: {
    // Position will be set dynamically
  },
  userMenuContainer: {
    // Position will be set dynamically
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#FF4444',
  },
  attachMenuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: 340,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  attachMenuTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  attachMenuSubtitle: {
    color: '#8C8A9A',
    fontSize: 14,
    marginBottom: 20,
  },
  attachMenuOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
  },
  attachMenuOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  attachMenuOptionText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  suggestTimeContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: '90%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestTimeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  dateTimeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 10,
  },
  datePicker: {
    backgroundColor: 'transparent',
  },
  suggestTimeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8C8A9A',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  suggestButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});

