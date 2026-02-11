import React, {useCallback, useState, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {PROVIDER_GOOGLE, Marker, Circle} from 'react-native-maps';

import {
  RestaurantCard,
  RestaurantList,
  MapControls,
  RestaurantCountBadge,
  LoadingScreen,
  ErrorScreen,
} from '../components';

import {useLocation, useRestaurants, useMapRef} from '../hooks';
import {Restaurant, Coordinates} from '../types';
import {COLORS, SEARCH_CONFIG, MAP_CONFIG} from '../constants';
import {openDirections, createRegion} from '../utils';

const GoogleMapScreen: React.FC = () => {
  const [showList, setShowList] = useState(false);
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);
  const {
    location,
    error: locationError,
    isLoading: isLocationLoading,
    refresh: refreshLocation,
    isTracking,
  } = useLocation();

  const {
    restaurants,
    isLoading: isRestaurantsLoading,
    selectedRestaurant,
    selectRestaurant,
    clearSelection,
    refresh: refreshRestaurants,
  } = useRestaurants({
    location,
    radius: SEARCH_CONFIG.radius,
    autoFetch: true,
    sortByDistance: true,
  });

  const {mapRef, animateTo} = useMapRef();

  const initialRegion = useMemo(() => {
    if (!location) return undefined;
    return createRegion(location);
  }, [location]);

  const userCoordinates = useMemo(() => {
    if (!location) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }, [location]);
  const handleMarkerPress = useCallback(
    async (restaurant: Restaurant) => {
      setIsDistanceLoading(true);
      animateTo(
        {latitude: restaurant.latitude, longitude: restaurant.longitude},
        true,
      );
      await selectRestaurant(restaurant);
      setIsDistanceLoading(false);
    },
    [animateTo, selectRestaurant],
  );

  const handleListItemPress = useCallback(
    async (restaurant: Restaurant) => {
      setShowList(false);
      setIsDistanceLoading(true);
      animateTo(
        {latitude: restaurant.latitude, longitude: restaurant.longitude},
        true,
      );
      await selectRestaurant(restaurant);
      setIsDistanceLoading(false);
    },
    [animateTo, selectRestaurant],
  );

  const handleDirections = useCallback(() => {
    if (!location || !selectedRestaurant) return;

    const destination: Coordinates = {
      latitude: selectedRestaurant.latitude,
      longitude: selectedRestaurant.longitude,
    };

    openDirections(location, destination);
  }, [location, selectedRestaurant]);

  const handleRefresh = useCallback(() => {
    if (location) {
      refreshRestaurants();
    } else {
      refreshLocation();
    }
  }, [location, refreshRestaurants, refreshLocation]);

  const handleToggleList = useCallback(() => {
    setShowList((prev) => !prev);
  }, []);

  const handleCloseList = useCallback(() => {
    setShowList(false);
  }, []);

  const handleCloseCard = useCallback(() => {
    clearSelection();
  }, [clearSelection]);
  


  if (isLocationLoading) {
    return <LoadingScreen message="Getting your location..." />;
  }

  if (locationError && !location) {
    return <ErrorScreen error={locationError} onRetry={refreshLocation} />;
  }

  if (!location) {
    return <LoadingScreen message="Waiting for location..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType="standard"
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={isTracking}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor={COLORS.primary}
          loadingBackgroundColor={COLORS.background.secondary}>
          {userCoordinates && (
            <Circle
              center={userCoordinates}
              radius={SEARCH_CONFIG.radius}
              fillColor={COLORS.overlay.light}
              strokeColor={COLORS.overlay.medium}
              strokeWidth={1}
            />
          )}

          {restaurants.map((restaurant : Restaurant) => (
            <Marker
              key={restaurant.place_id}
              identifier={restaurant.place_id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              description={restaurant.vicinity}
              pinColor={
                selectedRestaurant?.place_id === restaurant.place_id
                  ? COLORS.marker.selected
                  : COLORS.marker.default
              }
              onPress={() => handleMarkerPress(restaurant)}
            />
          ))}
        </MapView>

        <MapControls
          onRefresh={handleRefresh}
          onToggleList={handleToggleList}
          isListVisible={showList}
        />

        <RestaurantCountBadge
          count={restaurants.length}
          isLoading={isRestaurantsLoading}
        />

        {showList && (
          <RestaurantList
            restaurants={restaurants}
            selectedRestaurantId={selectedRestaurant?.place_id}
            isLoading={isRestaurantsLoading}
            onClose={handleCloseList}
            onItemPress={handleListItemPress}
            onRefresh={handleRefresh}
          />
        )}

        {selectedRestaurant && !showList && (
          <RestaurantCard
            restaurant={selectedRestaurant}
            isDistanceLoading={isDistanceLoading}
            onClose={handleCloseCard}
            onDirections={handleDirections}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GoogleMapScreen;