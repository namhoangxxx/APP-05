import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, update, serverTimestamp } from 'firebase/database';
import { auth, database } from './firebaseConfig';
import { UserProfile } from '../types';

export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Cập nhật tên hiển thị trên Auth profile
  await updateProfile(user, {
    displayName: fullName.trim()
  });

  // Tạo bản ghi người dùng trong Realtime Database
  const userProfile: UserProfile = {
    uid: user.uid,
    displayName: fullName.trim(),
    email: user.email?.toLowerCase() || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=2563EB&color=fff`,
    isOnline: true,
    lastSeen: Date.now(),
    createdAt: Date.now()
  };

  await set(ref(database, `users/${user.uid}`), userProfile);
  return user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Cập nhật trạng thái online khi đăng nhập
  await update(ref(database, `users/${user.uid}`), {
    isOnline: true,
    lastSeen: serverTimestamp()
  });

  return user;
};

export const logoutUser = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await update(ref(database, `users/${currentUser.uid}`), {
        isOnline: false,
        lastSeen: serverTimestamp()
      });
    } catch (e) {
      console.warn('Lỗi cập nhật trạng thái offline trước khi logout:', e);
    }
  }
  await signOut(auth);
};

export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản của bạn đã bị khóa.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Sai tài khoản hoặc mật khẩu.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng bởi một tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau vài phút.';
    default:
      return 'Đã xảy ra lỗi đăng nhập. Vui lòng thử lại sau.';
  }
};
