import {
  ref,
  push,
  set,
  update,
  onValue,
  increment,
  Unsubscribe
} from 'firebase/database';
import { database } from './firebaseConfig';
import { ChatMessage, ConversationSummary } from '../types';

/**
 * Sinh ID duy nhất cho phòng chat 1-1 bất kể ai là người gửi trước
 */
export const getChatId = (uid1: string, uid2: string): string => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

/**
 * Gửi tin nhắn 1-1 và đồng bộ cuộc trò chuyện gần đây (Home Screen)
 */
export const sendMessage = async (
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  receiverId: string,
  receiverName: string,
  receiverAvatar: string | undefined,
  text: string
): Promise<void> => {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Nội dung tin nhắn không được rỗng.');
  }

  const chatId = getChatId(senderId, receiverId);
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);
  const messageId = newMessageRef.key;
  const now = Date.now();

  const messageData: ChatMessage = {
    id: messageId || '',
    chatId,
    senderId,
    receiverId,
    text: trimmedText,
    timestamp: now,
    isRead: false
  };

  // 1. Lưu tin nhắn vào phòng chat
  await set(newMessageRef, messageData);

  // 2. Cập nhật conversation cho người gửi (unreadCount giữ nguyên hoặc là 0)
  const senderConvRef = ref(database, `conversations/${senderId}/${receiverId}`);
  await update(senderConvRef, {
    chatId,
    partnerId: receiverId,
    partnerName: receiverName,
    partnerAvatar: receiverAvatar || '',
    lastMessage: trimmedText,
    lastTimestamp: now,
    unreadCount: 0
  });

  // 3. Cập nhật conversation cho người nhận và tăng unreadCount bằng phép tăng trên máy chủ
  const receiverConvRef = ref(database, `conversations/${receiverId}/${senderId}`);
  await update(receiverConvRef, {
      chatId,
      partnerId: senderId,
      partnerName: senderName,
      partnerAvatar: senderAvatar || '',
      lastMessage: trimmedText,
      lastTimestamp: now,
      unreadCount: increment(1)
  });
};

/**
 * Gửi tin nhắn định vị vị trí GPS
 */
export const sendLocationMessage = async (
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  receiverId: string,
  receiverName: string,
  receiverAvatar: string | undefined,
  latitude: number,
  longitude: number
): Promise<void> => {
  const chatId = getChatId(senderId, receiverId);
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);
  const messageId = newMessageRef.key;
  const now = Date.now();
  const summaryText = '📍 [Vị trí được chia sẻ]';

  const messageData: ChatMessage = {
    id: messageId || '',
    chatId,
    senderId,
    receiverId,
    text: summaryText,
    type: 'location',
    latitude,
    longitude,
    timestamp: now,
    isRead: false
  };

  await set(newMessageRef, messageData);

  const senderConvRef = ref(database, `conversations/${senderId}/${receiverId}`);
  await update(senderConvRef, {
    chatId,
    partnerId: receiverId,
    partnerName: receiverName,
    partnerAvatar: receiverAvatar || '',
    lastMessage: summaryText,
    lastTimestamp: now,
    unreadCount: 0
  });

  const receiverConvRef = ref(database, `conversations/${receiverId}/${senderId}`);
  await update(receiverConvRef, {
      chatId,
      partnerId: senderId,
      partnerName: senderName,
      partnerAvatar: senderAvatar || '',
      lastMessage: summaryText,
      lastTimestamp: now,
      unreadCount: increment(1)
  });
};

/**
 * Lắng nghe toàn bộ tin nhắn trong phòng chat theo thời gian thực
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = ref(database, `messages/${chatId}`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const messages: ChatMessage[] = Object.keys(data)
      .map((key) => ({
        ...data[key],
        id: key
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Sắp xếp tin nhắn tăng dần theo thời gian

    callback(messages);
  });

  return unsubscribe;
};

/**
 * Đánh dấu đã đọc toàn bộ tin nhắn khi mở cuộc trò chuyện
 * Đưa unreadCount về 0
 */
export const markConversationAsRead = async (
  currentUserId: string,
  partnerId: string
): Promise<void> => {
  const convRef = ref(database, `conversations/${currentUserId}/${partnerId}/unreadCount`);
  await set(convRef, 0);
};

/**
 * Lắng nghe danh sách các cuộc trò chuyện gần đây ở màn hình Home
 * Tự động sắp xếp cuộc trò chuyện mới nhất lên đầu
 */
export const subscribeToConversations = (
  currentUserId: string,
  callback: (conversations: ConversationSummary[]) => void
): Unsubscribe => {
  const conversationsRef = ref(database, `conversations/${currentUserId}`);

  const unsubscribe = onValue(conversationsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const list: ConversationSummary[] = Object.keys(data)
      .map((key) => data[key])
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp); // Mới nhất lên đầu

    callback(list);
  });

  return unsubscribe;
};
