import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { ConversationSummary } from '../types';
import { formatMessageTime } from '../utils/dateFormatter';

interface ConversationItemProps {
  conversation: ConversationSummary;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress
}) => {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, hasUnread && styles.unreadContainer]}
      onPress={onPress}
    >
      <Image
        source={{
          uri:
            conversation.partnerAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.partnerName)}&background=2563EB&color=fff`
        }}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, hasUnread && styles.unreadText]} numberOfLines={1}>
            {conversation.partnerName}
          </Text>
          <Text
            style={[styles.time, hasUnread && styles.unreadTimeText]}
            numberOfLines={1}
          >
            {formatMessageTime(conversation.lastTimestamp)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>

          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  unreadContainer: {
    backgroundColor: '#F8FAFF'
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.inputBg
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8
  },
  unreadText: {
    fontWeight: '700',
    color: colors.black
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary
  },
  unreadTimeText: {
    color: colors.primary,
    fontWeight: '600'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8
  },
  unreadLastMessage: {
    color: colors.text,
    fontWeight: '600'
  },
  badge: {
    backgroundColor: colors.badge,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700'
  }
});
