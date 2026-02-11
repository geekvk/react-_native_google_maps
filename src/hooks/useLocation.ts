/**
 * useLocation Hook
 * Manages device location with permission handling and error recovery
 */

import {useState, useEffect, useRef, useCallback} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';
import {
  LocationData,
  AppError,
  UseLocationResult,
  LocationErrorCode,
} from '../types';
import {GEOLOCATION_CONFIG} from '../constants';
import {createLocationError} from '../utils';


const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled by the system automatically
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location to find nearby restaurants',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('Permission request error:', error);
    return false;
  }
};


export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);


  const safeSetState = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T | ((prev: T) => T),
  ) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  const transformPosition = useCallback(
    (position: GeolocationResponse): LocationData => ({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    }),
    [],
  );

 
  const handleSuccess = useCallback(
    (position: GeolocationResponse) => {
      const locationData = transformPosition(position);
      safeSetState<LocationData | null>(setLocation, locationData);
      safeSetState<AppError | null>(setError, null);
      safeSetState<boolean>(setIsLoading, false);
    },
    [transformPosition, safeSetState],
  );

  const handleError = useCallback(
    (geoError: GeolocationError) => {
      const appError = createLocationError(
        geoError.code as LocationErrorCode,
        geoError.message,
      );
      safeSetState<AppError | null>(setError, appError);
      safeSetState<boolean>(setIsLoading, false);
      
      if (__DEV__) {
        console.warn('Geolocation error:', geoError);
      }
    },
    [safeSetState],
  );

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<void> => {
    safeSetState<boolean>(setIsLoading, true);
    safeSetState<AppError | null>(setError, null);

    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      const permissionError = createLocationError(LocationErrorCode.PERMISSION_DENIED);
      safeSetState<AppError | null>(setError, permissionError);
      safeSetState<boolean>(setIsLoading, false);
      
      Alert.alert(
        'Permission Required',
        'Location permission is required to find nearby restaurants. Please enable it in settings.',
      );
      return;
    }

    Geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      GEOLOCATION_CONFIG,
    );
  }, [handleSuccess, handleError, safeSetState]);

  // Start watching position
  const startTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      return; // Already tracking
    }

    watchIdRef.current = Geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        ...GEOLOCATION_CONFIG,
        distanceFilter: GEOLOCATION_CONFIG.distanceFilter,
      },
    );

    safeSetState<boolean>(setIsTracking, true);
  }, [handleSuccess, handleError, safeSetState]);

  // Stop watching position
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    safeSetState<boolean>(setIsTracking, false);
  }, [safeSetState]);

  // Refresh location
  const refresh = useCallback(async (): Promise<void> => {
    await getCurrentLocation();
  }, [getCurrentLocation]);

  // Initial location fetch
  useEffect(() => {
    isMountedRef.current = true;
    getCurrentLocation();

    return () => {
      isMountedRef.current = false;
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [getCurrentLocation]);

  return {
    location,
    error,
    isLoading,
    refresh,
    startTracking,
    stopTracking,
    isTracking,
  };
};

export default useLocation;