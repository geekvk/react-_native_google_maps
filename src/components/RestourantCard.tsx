import React, {memo, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {RestaurantWithDistance} from '../types';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../constants';
import {
  generatePriceLevel,
  getRestaurantPhotoUrl,
  isRestaurantOpen,
} from '../utils';

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
  isDistanceLoading: boolean;
  onClose: () => void;
  onDirections: () => void;
}

const CloseButton: React.FC<{onPress: () => void}> = memo(({onPress}) => (
  <TouchableOpacity
    style={styles.closeButton}
    onPress={onPress}
    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
    accessibilityLabel="Close restaurant details"
    accessibilityRole="button">
    <Text style={styles.closeButtonText}>✕</Text>
  </TouchableOpacity>
));

const StatusBadge: React.FC<{isOpen: boolean}> = memo(({isOpen}) => (
  <View
    style={[
      styles.statusBadge,
      {backgroundColor: isOpen ? COLORS.success : COLORS.error},
    ]}>
    <Text style={styles.statusBadgeText}>{isOpen ? 'Open' : 'Closed'}</Text>
  </View>
));

const RestaurantImage: React.FC<{
  photoUrl?: string;
  isOpen?: boolean;
}> = memo(({photoUrl, isOpen}) => (
  <View style={styles.imageContainer}>
    {photoUrl ? (
      <Image
        source={{uri: photoUrl}}
        style={styles.image}
        resizeMode="cover"
        accessibilityLabel="Restaurant photo"
      />
    ) : (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>🍽️</Text>
      </View>
    )}
    {isOpen !== undefined && <StatusBadge isOpen={isOpen} />}
  </View>
));

const RatingSection: React.FC<{
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
}> = memo(({rating, reviewCount, priceLevel}) => (
  <View style={styles.ratingContainer}>
    <Text style={styles.starIcon}>★</Text>
    <Text style={styles.ratingValue}>{rating?.toFixed(1) ?? 'N/A'}</Text>
    <Text style={styles.reviewCount}>
      ({reviewCount ?? 0} reviews)
    </Text>
    {priceLevel !== undefined && (
      <Text style={styles.priceLevel}>{generatePriceLevel(priceLevel)}</Text>
    )}
  </View>
));

const DistanceSection: React.FC<{
  distance?: {distance: string; duration: string};
  isLoading: boolean;
}> = memo(({distance, isLoading}) => {
  if (isLoading) {
    return (
      <View style={styles.distanceLoadingContainer}>
        <ActivityIndicator size="small" color={COLORS.secondary} />
        <Text style={styles.distanceLoadingText}>Calculating distance...</Text>
      </View>
    );
  }

  if (!distance) return null;

  return (
    <View style={styles.distanceContainer}>
      <View style={styles.distanceItem}>
        <Text style={styles.distanceIcon}>📍</Text>
        <Text style={styles.distanceLabel}>Distance</Text>
        <Text style={styles.distanceValue}>{distance.distance}</Text>
      </View>
      <View style={styles.distanceItem}>
        <Text style={styles.distanceIcon}>🚗</Text>
        <Text style={styles.distanceLabel}>Drive</Text>
        <Text style={styles.distanceValue}>{distance.duration}</Text>
      </View>
    </View>
  );
});

const ActionButtons: React.FC<{
  onDirections: () => void;
}> = memo(({onDirections}) => (
  <View style={styles.actionContainer}>
    <TouchableOpacity
      style={styles.directionsButton}
      onPress={onDirections}
      accessibilityLabel="Get directions"
      accessibilityRole="button">
      <Text style={styles.directionsButtonIcon}>🧭</Text>
      <Text style={styles.directionsButtonText}>Directions</Text>
    </TouchableOpacity>
  </View>
));

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isDistanceLoading,
  onClose,
  onDirections,
}) => {
  const photoUrl = useMemo(
    () => getRestaurantPhotoUrl(restaurant, 'fullSize'),
    [restaurant],
  );

  const isOpen = useMemo(
    () => isRestaurantOpen(restaurant),
    [restaurant],
  );

  return (
    <View style={styles.container}>
      <CloseButton onPress={onClose} />

      <RestaurantImage photoUrl={photoUrl} isOpen={isOpen} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>

        <RatingSection
          rating={restaurant.rating}
          reviewCount={restaurant.user_ratings_total}
          priceLevel={restaurant.price_level}
        />

        <Text style={styles.vicinity} numberOfLines={2}>
          {restaurant.vicinity}
        </Text>

        <DistanceSection
          distance={restaurant.distance}
          isLoading={isDistanceLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
     left: SPACING.md, 
    right: SPACING.md,  
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.background.secondary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
  },
  statusBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  statusBadgeText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  content: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  starIcon: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.xs,
  },
  ratingValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.text.primary,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.tertiary,
    marginLeft: SPACING.xs,
  },
  priceLevel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    marginLeft: SPACING.sm,
  },
  vicinity: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  distanceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  distanceLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.tertiary,
  },
  distanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  distanceIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  distanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
  distanceValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.round,
    flex: 1,
  },
  directionsButtonIcon: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    marginRight: SPACING.sm,
  },
  directionsButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default memo(RestaurantCard);