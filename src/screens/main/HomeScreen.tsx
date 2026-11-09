import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ConversationSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToConversations, markConversationAsRead } from '../../services/chatService';
import { ConversationItem } from '../../components/ConversationItem';
import { colors } from '../../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { firebaseUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Đăng ký lắng nghe các cuộc trò chuyện gần đây theo thời gian thực
    const unsubscribe = subscribeToConversations(firebaseUser.uid, (data) => {
      setConversations(data);
      setLoading(false);
    });

    // BẮT BUỘC: Hủy lắng nghe trong cleanup của useEffect để tránh rò rỉ bộ nhớ
    return () => {
      unsubscribe();
    };
  }, [firebaseUser?.uid]);

  const handleOpenChat = async (conv: ConversationSummary) => {
    if (!firebaseUser?.uid) return;

    // Đặt số tin chưa đọc về 0 ngay khi mở cuộc trò chuyện
    await markConversationAsRead(firebaseUser.uid, conv.partnerId);

    navigation.navigate('Chat', {
      receiverId: conv.partnerId,
      receiverName: conv.partnerName,
      receiverAvatar: conv.partnerAvatar
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>
            {userProfile?.displayName || firebaseUser?.displayName || 'Bạn'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySubtitle}>
            Hãy chuyển sang tab "Danh bạ" để bắt đầu trò chuyện với bạn bè!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.chatId || item.partnerId}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => handleOpenChat(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  },
  listContent: {
    flexGrow: 1
  }
});
