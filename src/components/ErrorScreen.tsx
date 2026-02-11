import React, {memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppError, ErrorType} from '../types';
import {COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '../constants';

interface ErrorScreenProps {
  error: AppError;
  onRetry?: () => void;
}

const getErrorIcon = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.LOCATION:
      return '📍';
    case ErrorType.PERMISSION:
      return '🔒';
    case ErrorType.NETWORK:
      return '📡';
    case ErrorType.API:
      return '⚠️';
    default:
      return '❌';
  }
};

const getErrorTitle = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.LOCATION:
      return 'Location Error';
    case ErrorType.PERMISSION:
      return 'Permission Required';
    case ErrorType.NETWORK:
      return 'Network Error';
    case ErrorType.API:
      return 'Service Error';
    default:
      return 'Something Went Wrong';
  }
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({error, onRetry}) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.icon}>{getErrorIcon(error.type)}</Text>
      <Text style={styles.title}>{getErrorTitle(error.type)}</Text>
      <Text style={styles.message}>{error.message}</Text>
      
      {error.retryable && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel="Retry"
          accessibilityRole="button">
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
      
      {error.code && (
        <Text style={styles.errorCode}>Error Code: {error.code}</Text>
      )}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  errorCode: {
    marginTop: SPACING.xl,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
  },
});

export default memo(ErrorScreen);