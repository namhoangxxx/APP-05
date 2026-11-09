import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { ChatMessage } from '../types';
import { formatMessageTime } from '../utils/dateFormatter';

interface ChatBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMyMessage }) => {
  const isLocation =
    message.type === 'location' &&
    typeof message.latitude === 'number' &&
    typeof message.longitude === 'number';

  const handleOpenMap = () => {
    if (isLocation) {
      const url = `https://maps.google.com/?q=${message.latitude},${message.longitude}`;
      Linking.openURL(url).catch((err) => console.log('Không thể mở bản đồ:', err));
    }
  };

  return (
    <View style={[styles.container, isMyMessage ? styles.myContainer : styles.theirContainer]}>
      <View
        style={[
          styles.bubble,
          isMyMessage ? styles.myBubble : styles.theirBubble,
          isLocation ? styles.locationBubble : undefined
        ]}
      >
        {isLocation ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleOpenMap}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text
                style={[
                  styles.locationTitle,
                  isMyMessage ? styles.myText : styles.theirText
                ]}
              >
                Vị trí được chia sẻ
              </Text>
            </View>

            <View style={styles.coordsBox}>
              <Text style={styles.coordsText}>
                {message.latitude?.toFixed(6)}, {message.longitude?.toFixed(6)}
              </Text>
              <Text style={styles.openMapText}>Chạm để mở bản đồ ↗</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, isMyMessage ? styles.myText : styles.theirText]}>
            {message.text}
          </Text>
        )}

        <Text style={[styles.timeText, isMyMessage ? styles.myTimeText : styles.theirTimeText]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row'
  },
  myContainer: {
    justifyContent: 'flex-end'
  },
  theirContainer: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  myBubble: {
    backgroundColor: colors.myMessageBg,
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: colors.theirMessageBg,
    borderBottomLeftRadius: 4
  },
  locationBubble: {
    paddingVertical: 12,
    minWidth: 200
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 6
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  coordsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4
  },
  coordsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  openMapText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  myText: {
    color: colors.myMessageText
  },
  theirText: {
    color: colors.theirMessageText
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)'
  },
  theirTimeText: {
    color: colors.textSecondary
  }
});
