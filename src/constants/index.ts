import {MapConfig, SearchConfig, TravelMode} from '../types';
import { API_KEY } from '@env';

export const GOOGLE_CONFIG = {
  API_KEY: API_KEY,
  PLACES_BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  DISTANCE_MATRIX_URL: 'https://maps.googleapis.com/maps/api/distancematrix',
  GEOCODING_URL: 'https://maps.googleapis.com/maps/api/geocode',
} as const;


export const MAP_CONFIG: MapConfig = {
  defaultLatitudeDelta: 0.02,
  defaultLongitudeDelta: 0.02,
  selectedLatitudeDelta: 0.005,
  selectedLongitudeDelta: 0.005,
  animationDuration: 500,
} as const;

export const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: MAP_CONFIG.defaultLatitudeDelta,
  longitudeDelta: MAP_CONFIG.defaultLongitudeDelta,
} as const;


export const SEARCH_CONFIG: SearchConfig = {
  radius: 1500,
  type: 'restaurant',
  maxResults: 20,
} as const;

export const DEFAULT_TRAVEL_MODE: TravelMode = 'driving';

export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
  distanceFilter: 10,
} as const;


export const UI_CONFIG = {
  photoMaxWidth: {
    thumbnail: 100,
    card: 400,
    fullSize: 600,
  },
  animationDuration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  listConfig: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 5,
  },
} as const;


export const ERROR_MESSAGES = {
  location: {
    permissionDenied: 'Location permission is required to find nearby restaurants',
    unavailable: 'Unable to determine your location. Please try again.',
    timeout: 'Location request timed out. Please check your connection.',
  },
  network: {
    general: 'Network error. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
  },
  api: {
    zeroResults: 'No restaurants found in this area',
    overQueryLimit: 'Too many requests. Please try again later.',
    requestDenied: 'API request was denied. Please check configuration.',
    invalidRequest: 'Invalid request. Please try again.',
    general: 'Failed to fetch data. Please try again.',
  },
} as const;

export const COLORS = {
  primary: '#4285F4',
  secondary: '#8B5CF6',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#F9F9F9',
  },
  
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#888888',
    inverse: '#FFFFFF',
  },
  
  border: {
    light: '#EEEEEE',
    medium: '#DDDDDD',
  },
  
  marker: {
    default: '#FF6347',
    selected: '#4285F4',
  },
  
  overlay: {
    light: 'rgba(66, 133, 244, 0.1)',
    medium: 'rgba(66, 133, 244, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
} as const;


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
} as const;

export const ICON_SIZE = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;


export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;


export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;