import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, SHADOWS, TYPOGRAPHY} from '../constants';

interface RestaurantCountBadgeProps {
  count: number;
  isLoading: boolean;
}

const RestaurantCountBadge: React.FC<RestaurantCountBadgeProps> = ({
  count,
  isLoading,
}) => (
  <View style={styles.container}>
    <Text style={styles.text}>
      {isLoading
        ? 'Loading...'
        : `${count} restaurant${count !== 1 ? 's' : ''} nearby`}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: SPACING.xl,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.xl,
    ...SHADOWS.medium,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.text.primary,
  },
});

export default memo(RestaurantCountBadge);