import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, ChatMessage, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getChatId,
  sendMessage,
  sendLocationMessage,
  subscribeToMessages,
  markConversationAsRead
} from '../../services/chatService';
import { subscribeToUserStatus } from '../../services/userService';
import { ChatBubble } from '../../components/ChatBubble';
import { colors } from '../../theme/colors';
import { formatLastSeen } from '../../utils/dateFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { receiverId, receiverName, receiverAvatar } = route.params;
  const { firebaseUser, userProfile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerStatus, setPartnerStatus] = useState<UserProfile | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const currentUserId = firebaseUser?.uid || '';
  const chatId = getChatId(currentUserId, receiverId);

  // 1. Lắng nghe trạng thái Online/Offline theo thời gian thực của người nhận
  useEffect(() => {
    const unsubscribeStatus = subscribeToUserStatus(receiverId, (profile) => {
      setPartnerStatus(profile);
    });

    return () => {
      unsubscribeStatus();
    };
  }, [receiverId]);

  // 2. Lắng nghe tin nhắn trong phòng chat theo thời gian thực
  useEffect(() => {
    if (!chatId) return;

    // Đánh dấu đã đọc ngay khi mở cuộc trò chuyện
    markConversationAsRead(currentUserId, receiverId);

    const unsubscribeMessages = subscribeToMessages(chatId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    // BẮT BUỘC: Hủy lắng nghe trong cleanup của useEffect để tin nhắn không bị hiện lặp
    return () => {
      unsubscribeMessages();
    };
  }, [chatId, currentUserId, receiverId]);

  // Tự cuộn xuống tin nhắn mới nhất khi danh sách tin nhắn thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return; // Không cho gửi tin rỗng

    setInputText('');
    setSending(true);

    try {
      const senderName = userProfile?.displayName || firebaseUser?.displayName || 'Người dùng';
      const senderAvatar = userProfile?.avatar || '';

      await sendMessage(
        currentUserId,
        senderName,
        senderAvatar,
        receiverId,
        receiverName,
        receiverAvatar,
        trimmed
      );
    } catch (error) {
      console.log('Lỗi khi gửi tin nhắn:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendLocation = async () => {
    if (loadingLocation) return;
    setLoadingLocation(true);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Từ chối quyền', 'Bạn cần cấp quyền vị trí để gửi toạ độ.');
          setLoadingLocation(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const senderName = userProfile?.displayName || firebaseUser?.displayName || 'Người dùng';
          const senderAvatar = userProfile?.avatar || '';

          await sendLocationMessage(
            currentUserId,
            senderName,
            senderAvatar,
            receiverId,
            receiverName,
            receiverAvatar,
            latitude,
            longitude
          );
          setLoadingLocation(false);
        },
        (error) => {
          console.log('Lỗi lấy vị trí:', error);
          // Dự phòng tọa độ nếu máy ảo không có GPS phần cứng
          const senderName = userProfile?.displayName || firebaseUser?.displayName || 'Người dùng';
          const senderAvatar = userProfile?.avatar || '';
          sendLocationMessage(
            currentUserId,
            senderName,
            senderAvatar,
            receiverId,
            receiverName,
            receiverAvatar,
            10.776888,
            106.700805
          ).finally(() => setLoadingLocation(false));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    } catch (e) {
      console.log('Lỗi chia sẻ vị trí:', e);
      setLoadingLocation(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header tùy biến hiển thị tên và trạng thái Online realtime */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                receiverAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName)}&background=2563EB&color=fff`
            }}
            style={styles.avatar}
          />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: partnerStatus?.isOnline
                  ? colors.online
                  : colors.offline
              }
            ]}
          />
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {receiverName}
          </Text>
          <Text
            style={[
              styles.onlineStatusText,
              { color: partnerStatus?.isOnline ? colors.online : colors.textSecondary }
            ]}
          >
            {partnerStatus?.isOnline
              ? 'Đang hoạt động'
              : formatLastSeen(partnerStatus?.lastSeen)}
          </Text>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyPrompt}>Hãy gửi lời chào đến {receiverName}!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isMyMessage={item.senderId === currentUserId}
            />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Thanh nhập và gửi tin nhắn */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSendLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.locationButtonText}>📍</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.disabledSendButton
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6
  },
  backArrow: {
    fontSize: 32,
    lineHeight: 34,
    color: colors.primary,
    fontWeight: '300'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.inputBg
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white
  },
  headerTitleContainer: {
    marginLeft: 12,
    flex: 1
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  onlineStatusText: {
    fontSize: 12,
    marginTop: 1
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyPrompt: {
    color: colors.textSecondary,
    fontSize: 15
  },
  messagesList: {
    paddingVertical: 12
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  locationButtonText: {
    fontSize: 18
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.text,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: colors.primary,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledSendButton: {
    backgroundColor: colors.border
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14
  }
});
