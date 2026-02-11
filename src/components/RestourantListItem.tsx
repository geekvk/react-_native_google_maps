import React, {memo, useMemo, useCallback} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Restaurant} from '../types';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../constants';
import {
  generateStars,
  generatePriceLevel,
  getRestaurantPhotoUrl,
  isRestaurantOpen,
} from '../utils';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onPress: (restaurant: Restaurant) => void;
}

const RestaurantThumbnail: React.FC<{photoUrl?: string}> = memo(({photoUrl}) => {
  if (photoUrl) {
    return (
      <Image
        source={{uri: photoUrl}}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="Restaurant thumbnail"
      />
    );
  }

  return (
    <View style={styles.placeholderImage}>
      <Text style={styles.placeholderText}>🍽️</Text>
    </View>
  );
});

const RatingDisplay: React.FC<{
  rating?: number;
  reviewCount?: number;
}> = memo(({rating, reviewCount}) => {
  if (!rating) return null;

  const stars = useMemo(() => generateStars(rating), [rating]);

  return (
    <View style={styles.ratingContainer}>
      <Text style={styles.stars}>{stars}</Text>
      <Text style={styles.ratingText}>
        {rating.toFixed(1)} ({reviewCount ?? 0})
      </Text>
    </View>
  );
});

const StatusDisplay: React.FC<{
  isOpen?: boolean;
  priceLevel?: number;
}> = memo(({isOpen, priceLevel}) => (
  <View style={styles.statusContainer}>
    {isOpen !== undefined && (
      <Text
        style={[
          styles.openStatus,
          {color: isOpen ? COLORS.success : COLORS.error},
        ]}>
        {isOpen ? 'Open' : 'Closed'}
      </Text>
    )}
    {priceLevel !== undefined && (
      <Text style={styles.priceLevel}>{generatePriceLevel(priceLevel)}</Text>
    )}
  </View>
));

const RestaurantListItem: React.FC<RestaurantListItemProps> = ({
  restaurant,
  isSelected,
  onPress,
}) => {
  const photoUrl = useMemo(
    () => getRestaurantPhotoUrl(restaurant, 'thumbnail'),
    [restaurant],
  );

  const isOpen = useMemo(
    () => isRestaurantOpen(restaurant),
    [restaurant],
  );

  const handlePress = useCallback(() => {
    onPress(restaurant);
  }, [onPress, restaurant]);

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${restaurant.name}, ${restaurant.rating ? `rated ${restaurant.rating}` : 'no rating'}`}
      accessibilityRole="button">
      <RestaurantThumbnail photoUrl={photoUrl} />

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>

        <RatingDisplay
          rating={restaurant.rating}
          reviewCount={restaurant.user_ratings_total}
        />

        <Text style={styles.vicinity} numberOfLines={1}>
          {restaurant.vicinity}
        </Text>

        <StatusDisplay
          isOpen={isOpen}
          priceLevel={restaurant.price_level}
        />
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  selectedContainer: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 30,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stars: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  vicinity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  openStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  priceLevel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default memo(RestaurantListItem);