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
import { loginUser, getAuthErrorMessage } from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
    } catch (error: any) {
      const msg = getAuthErrorMessage(error.code);
      setErrorMsg(msg);
      Alert.alert('Đăng nhập thất bại', msg);
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
          <Text style={styles.appTitle}>Chat Realtime</Text>
          <Text style={styles.subtitle}>Đăng nhập để kết nối với bạn bè</Text>
        </View>

        {!!errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.form}>
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
            label="Mật khẩu"
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

          <Button
            title="Đăng nhập"
            loading={loading}
            onPress={handleLogin}
            style={styles.loginBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    marginBottom: 32
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
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
  loginBtn: {
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
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});
