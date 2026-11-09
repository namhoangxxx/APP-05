import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUsersList } from '../../services/userService';
import { ContactItem } from '../../components/ContactItem';
import { colors } from '../../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { firebaseUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Đăng ký lắng nghe danh sách người dùng (không gồm bản thân) theo thời gian thực
    const unsubscribe = subscribeToUsersList(firebaseUser.uid, (data) => {
      setUsers(data);
      setLoading(false);
    });

    // BẮT BUỘC: Hủy lắng nghe trong cleanup của useEffect
    return () => {
      unsubscribe();
    };
  }, [firebaseUser?.uid]);

  // Bộ lọc tìm kiếm theo họ tên hoặc email
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleOpenChat = (user: UserProfile) => {
    navigation.navigate('Chat', {
      receiverId: user.uid,
      receiverName: user.displayName,
      receiverAvatar: user.avatar
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc email..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh bạ người dùng...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Vui lòng thử lại với từ khóa tìm kiếm khác.'
              : 'Hãy rủ bạn bè đăng ký tài khoản để bắt đầu trò chuyện.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <ContactItem
              user={item}
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchBar: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: 'center'
  },
  searchInput: {
    fontSize: 14,
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  listContent: {
    flexGrow: 1
  }
});
