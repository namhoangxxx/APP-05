export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: number;
  createdAt: number;
  latitude?: number;
  longitude?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type?: 'text' | 'location';
  latitude?: number;
  longitude?: number;
  timestamp: number;
  isRead: boolean;
}

export interface ConversationSummary {
  chatId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: {
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Settings: undefined;
};
