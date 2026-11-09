import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';

export const SettingsScreen: React.FC = () => {
  const { firebaseUser, userProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logoutUser();
            } catch (error) {
              console.log('Lỗi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất lúc này. Vui lòng thử lại.');
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              userProfile?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userProfile?.displayName || 'User'
              )}&background=2563EB&color=fff`
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {userProfile?.displayName || firebaseUser?.displayName || 'Chưa cập nhật tên'}
        </Text>
        <Text style={styles.email}>
          {userProfile?.email || firebaseUser?.email}
        </Text>

        <View style={styles.badgeOnline}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineBadgeText}>Đang trực tuyến</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã định danh (UID):</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {firebaseUser?.uid}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức:</Text>
          <Text style={styles.infoValue}>Email / Password</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Button
          title="Đăng xuất"
          variant="danger"
          loading={loggingOut}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 14,
    backgroundColor: colors.inputBg
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12
  },
  badgeOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
    marginRight: 6
  },
  onlineBadgeText: {
    fontSize: 12,
    color: colors.online,
    fontWeight: '600'
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%'
  },
  actionSection: {
    marginTop: 8
  }
});
