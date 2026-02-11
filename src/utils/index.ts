
import {Platform, Linking} from 'react-native';
import {
  Coordinates,
  MapRegion,
  Restaurant,
  PlaceResult,
  AppError,
  ErrorType,
  LocationErrorCode,
} from '../types';
import {
  GOOGLE_CONFIG,
  MAP_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
} from '../constants';

// ============================================================================
// Coordinate Utilities
// ============================================================================

/**
 * Creates a map region from coordinates with default deltas
 */
export const createRegion = (
  coordinates: Coordinates,
  options?: {latitudeDelta?: number; longitudeDelta?: number},
): MapRegion => ({
  latitude: coordinates.latitude,
  longitude: coordinates.longitude,
  latitudeDelta: options?.latitudeDelta ?? MAP_CONFIG.defaultLatitudeDelta,
  longitudeDelta: options?.longitudeDelta ?? MAP_CONFIG.defaultLongitudeDelta,
});

/**
 * Creates a zoomed-in region for selected items
 */
export const createSelectedRegion = (coordinates: Coordinates): MapRegion => ({
  latitude: coordinates.latitude,
  longitude: coordinates.longitude,
  latitudeDelta: MAP_CONFIG.selectedLatitudeDelta,
  longitudeDelta: MAP_CONFIG.selectedLongitudeDelta,
});

/**
 * Calculates haversine distance between two coordinates (in meters)
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Formats distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// ============================================================================
// Photo Utilities
// ============================================================================

/**
 * Generates Google Places photo URL
 */
export const getPhotoUrl = (
  photoReference: string,
  maxWidth: number = UI_CONFIG.photoMaxWidth.card,
): string => {
  return `${GOOGLE_CONFIG.PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_CONFIG.API_KEY}`;
};

/**
 * Gets the first photo URL from a restaurant or returns undefined
 */
export const getRestaurantPhotoUrl = (
  restaurant: Restaurant,
  size: keyof typeof UI_CONFIG.photoMaxWidth = 'card',
): string | undefined => {
  const photoRef = restaurant.photos?.[0]?.photo_reference;
  if (!photoRef) return undefined;
  return getPhotoUrl(photoRef, UI_CONFIG.photoMaxWidth[size]);
};

// ============================================================================
// Data Transformation
// ============================================================================

/**
 * Transforms Place API result to Restaurant model
 */
export const transformPlaceToRestaurant = (place: PlaceResult): Restaurant => ({
  place_id: place.place_id,
  name: place.name,
  latitude: place.geometry.location.lat,
  longitude: place.geometry.location.lng,
  rating: place.rating,
  vicinity: place.vicinity,
  user_ratings_total: place.user_ratings_total,
  opening_hours: place.opening_hours,
  price_level: place.price_level,
  photos: place.photos,
});

/**
 * Sorts restaurants by distance from a point
 */
export const sortByDistance = (
  restaurants: Restaurant[],
  from: Coordinates,
): Restaurant[] => {
  return [...restaurants].sort((a, b) => {
    const distA = calculateDistance(from, {latitude: a.latitude, longitude: a.longitude});
    const distB = calculateDistance(from, {latitude: b.latitude, longitude: b.longitude});
    return distA - distB;
  });
};

// ============================================================================
// Display Utilities
// ============================================================================

/**
 * Generates star rating display
 */
export const generateStars = (rating?: number): string => {
  if (!rating) return '';
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
};

/**
 * Generates price level display
 */
export const generatePriceLevel = (priceLevel?: number): string => {
  if (priceLevel === undefined) return '';
  return '$'.repeat(priceLevel + 1);
};

/**
 * Formats rating with review count
 */
export const formatRating = (
  rating?: number,
  reviewCount?: number,
): string => {
  if (!rating) return 'No rating';
  const formattedRating = rating.toFixed(1);
  if (reviewCount !== undefined) {
    return `${formattedRating} (${reviewCount})`;
  }
  return formattedRating;
};

// ============================================================================
// Navigation Utilities
// ============================================================================

/**
 * Opens navigation to a destination
 */
export const openDirections = async (
  from: Coordinates,
  to: Coordinates,
): Promise<boolean> => {
  const url = Platform.select({
    ios: `maps://app?saddr=${from.latitude},${from.longitude}&daddr=${to.latitude},${to.longitude}`,
    android: `google.navigation:q=${to.latitude},${to.longitude}`,
  });

  if (!url) return false;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }

    // Fallback to web URL
    const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=driving`;
    await Linking.openURL(webUrl);
    return true;
  } catch (error) {
    console.error('Error opening directions:', error);
    return false;
  }
};

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Creates a standardized AppError from location error code
 */
export const createLocationError = (
  code: LocationErrorCode,
  message?: string,
): AppError => {
  const defaultMessages: Record<LocationErrorCode, string> = {
    [LocationErrorCode.PERMISSION_DENIED]: ERROR_MESSAGES.location.permissionDenied,
    [LocationErrorCode.POSITION_UNAVAILABLE]: ERROR_MESSAGES.location.unavailable,
    [LocationErrorCode.TIMEOUT]: ERROR_MESSAGES.location.timeout,
    [LocationErrorCode.UNKNOWN]: ERROR_MESSAGES.location.unavailable,
  };

  return {
    type: code === LocationErrorCode.PERMISSION_DENIED
      ? ErrorType.PERMISSION
      : ErrorType.LOCATION,
    message: message || defaultMessages[code],
    code: String(code),
    retryable: code !== LocationErrorCode.PERMISSION_DENIED,
  };
};

/**
 * Creates a standardized AppError from API response
 */
export const createApiError = (
  status: string,
  errorMessage?: string,
): AppError => {
  const messageMap: Record<string, string> = {
    ZERO_RESULTS: ERROR_MESSAGES.api.zeroResults,
    OVER_QUERY_LIMIT: ERROR_MESSAGES.api.overQueryLimit,
    REQUEST_DENIED: ERROR_MESSAGES.api.requestDenied,
    INVALID_REQUEST: ERROR_MESSAGES.api.invalidRequest,
  };

  return {
    type: ErrorType.API,
    message: errorMessage || messageMap[status] || ERROR_MESSAGES.api.general,
    code: status,
    retryable: status !== 'REQUEST_DENIED' && status !== 'INVALID_REQUEST',
  };
};

/**
 * Creates a network error
 */
export const createNetworkError = (error: unknown): AppError => {
  const message = error instanceof Error ? error.message : ERROR_MESSAGES.network.general;
  return {
    type: ErrorType.NETWORK,
    message,
    retryable: true,
  };
};

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates coordinates
 */
export const isValidCoordinates = (coords: unknown): coords is Coordinates => {
  if (!coords || typeof coords !== 'object') return false;
  const c = coords as Record<string, unknown>;
  return (
    typeof c.latitude === 'number' &&
    typeof c.longitude === 'number' &&
    c.latitude >= -90 &&
    c.latitude <= 90 &&
    c.longitude >= -180 &&
    c.longitude <= 180
  );
};

export const isRestaurantOpen = (restaurant: Restaurant): boolean | undefined => {
  return restaurant.opening_hours?.open_now;
};

// ============================================================================
// Debounce Utility
// ============================================================================

/**
 * Creates a debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};