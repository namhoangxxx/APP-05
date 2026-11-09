import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { colors } from '../theme/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightIconText?: string;
  onRightIconPress?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  rightIconText,
  onRightIconPress,
  style,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...rest}
        />
        {rightIconText && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Text style={styles.rightIconText}>{rightIconText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2'
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.text
  },
  rightIcon: {
    padding: 8
  },
  rightIconText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600'
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2
  }
});
