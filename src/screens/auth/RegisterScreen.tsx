import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { registerUser, getAuthErrorMessage } from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên.');
      return false;
    }
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Địa chỉ email không hợp lệ.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!validate()) return;

    try {
      setLoading(true);
      await registerUser(fullName, email, password);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    } catch (error: any) {
      const msg = getAuthErrorMessage(error.code);
      setErrorMsg(msg);
      Alert.alert('Đăng ký thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Tạo Tài Khoản</Text>
          <Text style={styles.subtitle}>Đăng ký thông tin để bắt đầu trò chuyện</Text>
        </View>

        {!!errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.form}>
          <InputField
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={(txt) => {
              setFullName(txt);
              setErrorMsg('');
            }}
          />

          <InputField
            label="Email"
            placeholder="example@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrorMsg('');
            }}
          />

          <InputField
            label="Mật khẩu (tối thiểu 6 ký tự)"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMsg('');
            }}
            rightIconText={showPassword ? 'Ẩn' : 'Hiện'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <InputField
            label="Nhập lại mật khẩu"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setErrorMsg('');
            }}
          />

          <Button
            title="Đăng ký"
            loading={loading}
            onPress={handleRegister}
            style={styles.registerBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center'
  },
  form: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  registerBtn: {
    marginTop: 8
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});
