import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import {Restaurant} from '../types';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  UI_CONFIG,
} from '../constants';
import { RestaurantListItem } from '.';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  isLoading: boolean;
  onClose: () => void;
  onItemPress: (restaurant: Restaurant) => void;
  onRefresh: () => void;
}

const ListHeader: React.FC<{
  title: string;
  onClose: () => void;
}> = memo(({title, onClose}) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
    <TouchableOpacity
      onPress={onClose}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      accessibilityLabel="Close list"
      accessibilityRole="button">
      <Text style={styles.closeButton}>✕</Text>
    </TouchableOpacity>
  </View>
));

const LoadingState: React.FC = memo(() => (
  <ActivityIndicator
    size="large"
    color={COLORS.primary}
    style={styles.loader}
  />
));

const EmptyState: React.FC<{onRefresh: () => void}> = memo(({onRefresh}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🔍</Text>
    <Text style={styles.emptyText}>No restaurants found</Text>
    <Text style={styles.emptySubtext}>Try expanding your search area</Text>
    <TouchableOpacity
      style={styles.refreshButton}
      onPress={onRefresh}
      accessibilityLabel="Refresh restaurants"
      accessibilityRole="button">
      <Text style={styles.refreshButtonText}>Refresh</Text>
    </TouchableOpacity>
  </View>
));

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  selectedRestaurantId,
  isLoading,
  onClose,
  onItemPress,
  onRefresh,
}) => {
  const keyExtractor = useCallback(
    (item: Restaurant) => item.place_id,
    [],
  );

  const renderItem: ListRenderItem<Restaurant> = useCallback(
    ({item}) => (
      <RestaurantListItem
        restaurant={item}
        isSelected={item.place_id === selectedRestaurantId}
        onPress={onItemPress}
      />
    ),
    [selectedRestaurantId, onItemPress],
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (restaurants.length === 0) {
      return <EmptyState onRefresh={onRefresh} />;
    }

    return (
      <FlatList
        data={restaurants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={UI_CONFIG.listConfig.initialNumToRender}
        maxToRenderPerBatch={UI_CONFIG.listConfig.maxToRenderPerBatch}
        windowSize={UI_CONFIG.listConfig.windowSize}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 104, // Item height + margin
          offset: 104 * index,
          index,
        })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ListHeader title="Nearby Restaurants" onClose={onClose} />
      {renderContent()}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    color: COLORS.text.secondary,
    padding: SPACING.xs,
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  refreshButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default memo(RestaurantList);