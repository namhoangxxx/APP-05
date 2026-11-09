import {
  ref,
  onValue,
  set,
  update,
  onDisconnect,
  serverTimestamp,
  Unsubscribe
} from 'firebase/database';
import { database, auth } from './firebaseConfig';
import { UserProfile } from '../types';

/**
 * Thiết lập cơ chế tự động ghi nhận Online/Offline (Presence System)
 * Sử dụng node đặc biệt `/.info/connected` và `onDisconnect()` của Firebase
 */
export const setupPresence = (userId: string): Unsubscribe => {
  const connectedRef = ref(database, '.info/connected');
  const userStatusRef = ref(database, `users/${userId}`);

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // Khi mất kết nối (tắt app, mất mạng, crash): tự động set isOnline = false
      onDisconnect(userStatusRef).update({
        isOnline: false,
        lastSeen: serverTimestamp()
      });

      // Khi đang kết nối: set isOnline = true
      update(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
      });
    }
  });

  return unsubscribe;
};

/**
 * Lắng nghe danh sách tất cả người dùng theo thời gian thực (loại trừ chính mình)
 */
export const subscribeToUsersList = (
  currentUserId: string,
  callback: (users: UserProfile[]) => void
): Unsubscribe => {
  const usersRef = ref(database, 'users');

  const unsubscribe = onValue(usersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const users: UserProfile[] = Object.keys(data)
      .filter((uid) => uid !== currentUserId)
      .map((uid) => ({
        ...data[uid],
        uid
      }));

    callback(users);
  });

  return unsubscribe;
};

/**
 * Lắng nghe thông tin và trạng thái online của một người dùng cụ thể
 */
export const subscribeToUserStatus = (
  userId: string,
  callback: (user: UserProfile | null) => void
): Unsubscribe => {
  const userRef = ref(database, `users/${userId}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

/**
 * Cập nhật vị trí toạ độ địa lý (Geolocation) của người dùng vào Realtime Database
 */
export const updateUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, {
    latitude,
    longitude,
    lastLocationUpdate: serverTimestamp()
  });
};
