/**
 * useRestaurants Hook
 * Manages restaurant data fetching, selection, and distance calculations
 */

import {useState, useCallback, useRef, useEffect} from 'react';
import {Alert} from 'react-native';
import {
  Restaurant,
  RestaurantWithDistance,
  Coordinates,
  AppError,
  UseRestaurantsResult,
} from '../types';
import {PlacesService, DistanceService} from '../services';
import {SEARCH_CONFIG} from '../constants';
import {sortByDistance} from '../utils';


interface UseRestaurantsOptions {
  /** User's current location for distance calculations */
  location: Coordinates | null;
  /** Search radius in meters */
  radius?: number;
  /** Whether to auto-fetch when location changes */
  autoFetch?: boolean;
  /** Whether to sort results by distance */
  sortByDistance?: boolean;
}

export const useRestaurants = (
  options: UseRestaurantsOptions,
): UseRestaurantsResult => {
  const {
    location,
    radius = SEARCH_CONFIG.radius,
    autoFetch = true,
    sortByDistance: shouldSort = true,
  } = options;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantWithDistance | null>(null);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to safely update state
  const safeSetState = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T | ((prev: T) => T),
  ) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  // Fetch nearby restaurants
  const fetchRestaurants = useCallback(async (): Promise<void> => {
    if (!location) {
      return;
    }

    // Cancel any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    safeSetState<boolean>(setIsLoading, true);
    safeSetState<AppError | null>(setError, null);

    const result = await PlacesService.getNearbyRestaurants(location, {
      radius,
    });

    if (!isMountedRef.current) return;

    if (result.success) {
      let restaurantList = result.data;
      
      // Sort by distance if enabled
      if (shouldSort && restaurantList.length > 0) {
        restaurantList = sortByDistance(restaurantList, location);
      }

      safeSetState(setRestaurants, restaurantList);

      if (restaurantList.length === 0) {
        Alert.alert('No Results', 'No restaurants found nearby');
      }
    } else {
      safeSetState<AppError | null>(setError, result.error);
      if (result.error.retryable) {
        Alert.alert('Error', result.error.message);
      }
    }

    safeSetState<boolean>(setIsLoading, false);
  }, [location, radius, shouldSort, safeSetState]);

  // Select a restaurant and fetch distance
  const selectRestaurant = useCallback(
    async (restaurant: Restaurant): Promise<void> => {
      // Immediately set selected restaurant without distance
      safeSetState<RestaurantWithDistance | null>(setSelectedRestaurant, {
        ...restaurant,
        distance: undefined,
      });

      // If we have location, fetch distance
      if (location) {
        const result = await DistanceService.getDistance(location, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        });

        if (!isMountedRef.current) return;

        if (result.success) {
          safeSetState<RestaurantWithDistance | null>(setSelectedRestaurant, (prev) =>
            prev?.place_id === restaurant.place_id
              ? {...prev, distance: result.data}
              : prev,
          );
        }
      }
    },
    [location, safeSetState],
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    safeSetState<RestaurantWithDistance | null>(setSelectedRestaurant, null);
  }, [safeSetState]);

  // Refresh restaurants
  const refresh = useCallback(async (): Promise<void> => {
    await fetchRestaurants();
  }, [fetchRestaurants]);

  // Auto-fetch when location changes
  useEffect(() => {
    if (autoFetch && location) {
      fetchRestaurants();
    }
  }, [autoFetch, location, fetchRestaurants]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    restaurants,
    isLoading,
    error,
    refresh,
    selectedRestaurant,
    selectRestaurant,
    clearSelection,
  };
};

export default useRestaurants;