/**
 * useMapRef Hook
 * Provides map control functionality with animation helpers
 */

import {useRef, useCallback, useMemo} from 'react';
import MapView from 'react-native-maps';
import {Coordinates, MapRegion} from '../types';
import {MAP_CONFIG} from '../constants';
import {createRegion, createSelectedRegion} from '../utils';

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseMapRefResult {
  /** MapView ref to attach to the component */
  mapRef: React.RefObject<MapView>;
  /** Animate to a specific coordinate */
  animateTo: (coordinates: Coordinates, zoom?: boolean) => void;
  /** Animate to a specific region */
  animateToRegion: (region: MapRegion, duration?: number) => void;
  /** Fit the map to show all provided coordinates */
  fitToCoordinates: (coordinates: Coordinates[], options?: FitOptions) => void;
  /** Get the current region (requires async operation) */
  getRegion: () => Promise<MapRegion | null>;
}

interface FitOptions {
  edgePadding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  animated?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_EDGE_PADDING = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export const useMapRef = (): UseMapRefResult => {
  const mapRef = useRef<MapView>(null);

  // Animate to coordinates
  const animateTo = useCallback(
    (coordinates: Coordinates, zoom = false) => {
      if (!mapRef.current) return;

      const region = zoom
        ? createSelectedRegion(coordinates)
        : createRegion(coordinates);

      mapRef.current.animateToRegion(region, MAP_CONFIG.animationDuration);
    },
    [],
  );

  // Animate to a specific region
  const animateToRegion = useCallback(
    (region: MapRegion, duration = MAP_CONFIG.animationDuration) => {
      if (!mapRef.current) return;
      mapRef.current.animateToRegion(region, duration);
    },
    [],
  );

  // Fit map to show all coordinates
  const fitToCoordinates = useCallback(
    (coordinates: Coordinates[], options?: FitOptions) => {
      if (!mapRef.current || coordinates.length === 0) return;

      mapRef.current.fitToCoordinates(
        coordinates.map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
        })),
        {
          edgePadding: options?.edgePadding ?? DEFAULT_EDGE_PADDING,
          animated: options?.animated ?? true,
        },
      );
    },
    [],
  );

  // Get current region
  const getRegion = useCallback(async (): Promise<MapRegion | null> => {
    if (!mapRef.current) return null;

    try {
      const camera = await mapRef.current.getCamera();
      if (!camera) return null;

      return {
        latitude: camera.center.latitude,
        longitude: camera.center.longitude,
        // These are approximations based on zoom level
        latitudeDelta: 360 / Math.pow(2, camera.zoom ?? 15),
        longitudeDelta: 360 / Math.pow(2, camera.zoom ?? 15),
      };
    } catch {
      return null;
    }
  }, []);

  return useMemo(
    () => ({
      mapRef,
      animateTo,
      animateToRegion,
      fitToCoordinates,
      getRegion,
    }),
    [animateTo, animateToRegion, fitToCoordinates, getRegion],
  );
};

export default useMapRef;