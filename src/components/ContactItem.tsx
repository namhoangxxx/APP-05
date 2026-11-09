import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { UserProfile } from '../types';
import { formatLastSeen } from '../utils/dateFormatter';

interface ContactItemProps {
  user: UserProfile;
  onPress: () => void;
}

export const ContactItem: React.FC<ContactItemProps> = ({ user, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=2563EB&color=fff` }}
          style={styles.avatar}
        />
        <View
          style={[
            styles.statusDot,
            { backgroundColor: user.isOnline ? colors.online : colors.offline }
          ]}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {user.displayName}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: user.isOnline ? colors.online : colors.textSecondary }
          ]}
          numberOfLines={1}
        >
          {user.isOnline ? 'Đang hoạt động' : formatLastSeen(user.lastSeen)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.inputBg
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  statusText: {
    fontSize: 13
  }
});
