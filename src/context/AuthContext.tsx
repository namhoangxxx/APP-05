import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { subscribeToAuthState } from '../services/authService';
import { setupPresence, subscribeToUserStatus, updateUserLocation } from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Yêu cầu quyền vị trí và cập nhật tọa độ
  const requestLocationAndSync = async (userId: string) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message: 'Ứng dụng cần quyền vị trí để cập nhật trạng thái hoạt động.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối'
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateUserLocation(userId, latitude, longitude);
        },
        (error) => {
          console.log('Lỗi định vị vị trí:', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      console.log('Lỗi yêu cầu quyền vị trí:', e);
    }
  };

  useEffect(() => {
    let unsubscribePresence: (() => void) | null = null;
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthState((user) => {
      setFirebaseUser(user);
      if (user) {
        // Thiết lập trạng thái online/offline tự động
        unsubscribePresence = setupPresence(user.uid);

        // Lắng nghe thông tin profile người dùng
        unsubscribeProfile = subscribeToUserStatus(user.uid, (profile) => {
          setUserProfile(profile);
          setIsLoading(false);
        });

        // Cập nhật vị trí
        requestLocationAndSync(user.uid);
      } else {
        setUserProfile(null);
        setIsLoading(false);
        if (unsubscribePresence) unsubscribePresence();
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePresence) unsubscribePresence();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
