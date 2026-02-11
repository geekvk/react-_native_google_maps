import React, {memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, SPACING, SHADOWS, TYPOGRAPHY} from '../constants';

interface MapControlsProps {
  onRefresh: () => void;
  onToggleList: () => void;
  isListVisible: boolean;
}

interface FloatingButtonProps {
  icon: string;
  onPress: () => void;
  isActive?: boolean;
  accessibilityLabel: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = memo(
  ({icon, onPress, isActive = false, accessibilityLabel}) => (
    <TouchableOpacity
      style={[styles.button, isActive && styles.activeButton]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button">
      <Text style={styles.buttonIcon}>{icon}</Text>
    </TouchableOpacity>
  ),
);

const MapControls: React.FC<MapControlsProps> = ({
  onRefresh,
  onToggleList,
  isListVisible,
}) => (
  <View style={styles.container}>
    <FloatingButton
      icon="🔄"
      onPress={onRefresh}
      accessibilityLabel="Refresh restaurants"
    />
    <FloatingButton
      icon="📋"
      onPress={onToggleList}
      isActive={isListVisible}
      accessibilityLabel={isListVisible ? 'Hide restaurant list' : 'Show restaurant list'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.background.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
  },
});

export default memo(MapControls);