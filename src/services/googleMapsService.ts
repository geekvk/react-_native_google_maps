import axios, {AxiosInstance, AxiosError} from 'axios';
import {
  Restaurant,
  DistanceInfo,
  PlacesApiResponse,
  DistanceMatrixResponse,
  Coordinates,
  TravelMode,
  AppError,
} from '../types';
import {GOOGLE_CONFIG, SEARCH_CONFIG, DEFAULT_TRAVEL_MODE} from '../constants';
import {transformPlaceToRestaurant, createApiError, createNetworkError} from '../utils';

// ============================================================================
// API Client Configuration
// ============================================================================

const createApiClient = (baseURL: string, timeout = 10000): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for logging/debugging
  client.interceptors.request.use(
    (config) => {
      if (__DEV__) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      if (__DEV__) {
        console.error('[API Request Error]', error);
      }
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(`[API Response] Status: ${response.status}`);
      }
      return response;
    },
    (error: AxiosError) => {
      if (__DEV__) {
        console.error('[API Response Error]', error.message);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

// ============================================================================
// API Clients
// ============================================================================

const placesClient = createApiClient(GOOGLE_CONFIG.PLACES_BASE_URL);
const distanceClient = createApiClient(GOOGLE_CONFIG.DISTANCE_MATRIX_URL);

// ============================================================================
// Result Types
// ============================================================================

export type ApiResult<T> =
  | {success: true; data: T}
  | {success: false; error: AppError};

// ============================================================================
// Places API Service
// ============================================================================

export const PlacesService = {
  /**
   * Fetches nearby restaurants
   */
  async getNearbyRestaurants(
    coordinates: Coordinates,
    options?: {
      radius?: number;
      type?: string;
    },
  ): Promise<ApiResult<Restaurant[]>> {
    try {
      const response = await placesClient.get<PlacesApiResponse>(
        '/nearbysearch/json',
        {
          params: {
            location: `${coordinates.latitude},${coordinates.longitude}`,
            radius: options?.radius ?? SEARCH_CONFIG.radius,
            type: options?.type ?? SEARCH_CONFIG.type,
            key: GOOGLE_CONFIG.API_KEY,
          },
        },
      );

      const {data} = response;

      if (data.status === 'OK') {
        const restaurants = data.results.map(transformPlaceToRestaurant);
        return {success: true, data: restaurants};
      }

      if (data.status === 'ZERO_RESULTS') {
        return {success: true, data: []};
      }

      return {
        success: false,
        error: createApiError(data.status, data.error_message),
      };
    } catch (error) {
      return {
        success: false,
        error: createNetworkError(error),
      };
    }
  },

  /**
   * Fetches place details
   */
  async getPlaceDetails(placeId: string): Promise<ApiResult<Restaurant>> {
    try {
      const response = await placesClient.get('/details/json', {
        params: {
          place_id: placeId,
          fields: 'place_id,name,geometry,rating,formatted_address,user_ratings_total,opening_hours,price_level,photos',
          key: GOOGLE_CONFIG.API_KEY,
        },
      });

      const {data} = response;

      if (data.status === 'OK' && data.result) {
        const restaurant = transformPlaceToRestaurant({
          ...data.result,
          vicinity: data.result.formatted_address,
        });
        return {success: true, data: restaurant};
      }

      return {
        success: false,
        error: createApiError(data.status, data.error_message),
      };
    } catch (error) {
      return {
        success: false,
        error: createNetworkError(error),
      };
    }
  },

  /**
   * Generates photo URL
   */
  getPhotoUrl(photoReference: string, maxWidth = 400): string {
    return `${GOOGLE_CONFIG.PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_CONFIG.API_KEY}`;
  },
};

// ============================================================================
// Distance Matrix API Service
// ============================================================================

export const DistanceService = {
  /**
   * Fetches distance and duration between two points
   */
  async getDistance(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = DEFAULT_TRAVEL_MODE,
  ): Promise<ApiResult<DistanceInfo>> {
    try {
      const response = await distanceClient.get<DistanceMatrixResponse>('/json', {
        params: {
          origins: `${origin.latitude},${origin.longitude}`,
          destinations: `${destination.latitude},${destination.longitude}`,
          mode,
          key: GOOGLE_CONFIG.API_KEY,
        },
      });

      const {data} = response;

      if (
        data.status === 'OK' &&
        data.rows[0]?.elements[0]?.status === 'OK'
      ) {
        const element = data.rows[0].elements[0];
        return {
          success: true,
          data: {
            distance: element.distance?.text ?? 'N/A',
            duration: element.duration?.text ?? 'N/A',
            distanceValue: element.distance?.value,
            durationValue: element.duration?.value,
          },
        };
      }

      return {
        success: false,
        error: createApiError(
          data.rows[0]?.elements[0]?.status ?? data.status,
          data.error_message,
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: createNetworkError(error),
      };
    }
  },

  /**
   * Fetches distances to multiple destinations
   */
  async getDistanceToMultiple(
    origin: Coordinates,
    destinations: Coordinates[],
    mode: TravelMode = DEFAULT_TRAVEL_MODE,
  ): Promise<ApiResult<DistanceInfo[]>> {
    if (destinations.length === 0) {
      return {success: true, data: []};
    }

    try {
      const destinationString = destinations
        .map((d) => `${d.latitude},${d.longitude}`)
        .join('|');

      const response = await distanceClient.get<DistanceMatrixResponse>('/json', {
        params: {
          origins: `${origin.latitude},${origin.longitude}`,
          destinations: destinationString,
          mode,
          key: GOOGLE_CONFIG.API_KEY,
        },
      });

      const {data} = response;

      if (data.status === 'OK') {
        const distances = data.rows[0]?.elements.map((element) => ({
          distance: element.distance?.text ?? 'N/A',
          duration: element.duration?.text ?? 'N/A',
          distanceValue: element.distance?.value,
          durationValue: element.duration?.value,
        })) ?? [];

        return {success: true, data: distances};
      }

      return {
        success: false,
        error: createApiError(data.status, data.error_message),
      };
    } catch (error) {
      return {
        success: false,
        error: createNetworkError(error),
      };
    }
  },
};

export const GoogleMapsService = {
  places: PlacesService,
  distance: DistanceService,
};

export default GoogleMapsService;