import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps
} from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}) => {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  let btnBackground = colors.primary;
  let textColor = colors.white;

  if (isOutline) {
    btnBackground = 'transparent';
    textColor = colors.primary;
  } else if (isDanger) {
    btnBackground = colors.error;
    textColor = colors.white;
  } else if (isSecondary) {
    btnBackground = colors.primaryLight;
    textColor = colors.primary;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: btnBackground },
        isOutline && styles.outlineButton,
        (disabled || loading) && styles.disabledButton,
        style
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%'
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  disabledButton: {
    opacity: 0.6
  },
  text: {
    fontSize: 16,
    fontWeight: '700'
  }
});
