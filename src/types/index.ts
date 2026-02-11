
export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface LocationData extends Coordinates {
  readonly accuracy: number;
  readonly timestamp?: number;
}

export interface LocationError {
  readonly code: LocationErrorCode;
  readonly message: string;
}

export enum LocationErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
  UNKNOWN = 4,
}

export interface MapRegion extends Coordinates {
  readonly latitudeDelta: number;
  readonly longitudeDelta: number;
}

// ============================================================================
// Restaurant Types
// ============================================================================

export interface RestaurantPhoto {
  readonly photo_reference: string;
  readonly height?: number;
  readonly width?: number;
}

export interface OpeningHours {
  readonly open_now: boolean;
  readonly weekday_text?: string[];
}

export interface Restaurant {
  readonly place_id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly rating?: number;
  readonly vicinity?: string;
  readonly user_ratings_total?: number;
  readonly opening_hours?: OpeningHours;
  readonly price_level?: number;
  readonly photos?: RestaurantPhoto[];
}

export interface RestaurantWithDistance extends Restaurant {
  readonly distance?: DistanceInfo;
}

export interface DistanceInfo {
  readonly distance: string;
  readonly duration: string;
  readonly distanceValue?: number;
  readonly durationValue?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PlaceResult {
  readonly place_id: string;
  readonly name: string;
  readonly geometry: {
    readonly location: {
      readonly lat: number;
      readonly lng: number;
    };
  };
  readonly rating?: number;
  readonly vicinity?: string;
  readonly user_ratings_total?: number;
  readonly opening_hours?: OpeningHours;
  readonly price_level?: number;
  readonly photos?: RestaurantPhoto[];
}

export interface PlacesApiResponse {
  readonly status: PlacesApiStatus;
  readonly results: PlaceResult[];
  readonly error_message?: string;
  readonly next_page_token?: string;
}

export type PlacesApiStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

export interface DistanceMatrixElement {
  readonly status: string;
  readonly distance?: {
    readonly text: string;
    readonly value: number;
  };
  readonly duration?: {
    readonly text: string;
    readonly value: number;
  };
}

export interface DistanceMatrixResponse {
  readonly status: string;
  readonly rows: Array<{
    readonly elements: DistanceMatrixElement[];
  }>;
  readonly error_message?: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface LoadingState {
  readonly location: boolean;
  readonly restaurants: boolean;
  readonly distance: boolean;
}

export interface AppError {
  readonly type: ErrorType;
  readonly message: string;
  readonly code?: string;
  readonly retryable: boolean;
}

export enum ErrorType {
  LOCATION = 'LOCATION',
  NETWORK = 'NETWORK',
  API = 'API',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface MarkerData {
  readonly id: string;
  readonly coordinate: Coordinates;
  readonly title: string;
  readonly description?: string;
  readonly isSelected: boolean;
}

export interface RestaurantCardProps {
  readonly restaurant: RestaurantWithDistance;
  readonly isLoading: boolean;
  readonly onClose: () => void;
  readonly onDirections: () => void;
  readonly photoUrl?: string;
}

export interface RestaurantListItemProps {
  readonly restaurant: Restaurant;
  readonly isSelected: boolean;
  readonly onPress: () => void;
  readonly getPhotoUrl: (ref: string, width?: number) => string;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseLocationResult {
  readonly location: LocationData | null;
  readonly error: AppError | null;
  readonly isLoading: boolean;
  readonly refresh: () => Promise<void>;
  readonly startTracking: () => void;
  readonly stopTracking: () => void;
  readonly isTracking: boolean;
}

export interface UseRestaurantsResult {
  readonly restaurants: Restaurant[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refresh: () => Promise<void>;
  readonly selectedRestaurant: RestaurantWithDistance | null;
  readonly selectRestaurant: (restaurant: Restaurant) => Promise<void>;
  readonly clearSelection: () => void;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface MapConfig {
  readonly defaultLatitudeDelta: number;
  readonly defaultLongitudeDelta: number;
  readonly selectedLatitudeDelta: number;
  readonly selectedLongitudeDelta: number;
  readonly animationDuration: number;
}

export interface SearchConfig {
  readonly radius: number;
  readonly type: string;
  readonly maxResults?: number;
}

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';