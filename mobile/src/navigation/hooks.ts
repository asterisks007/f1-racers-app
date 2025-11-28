import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../models';

/**
 * Type-safe navigation hook
 * Provides typed navigation methods for all screens in the app
 * 
 * @example
 * const navigation = useTypedNavigation();
 * navigation.navigate('DriverDetail', { driverId: '123' });
 */
export function useTypedNavigation() {
  return useNavigation<StackNavigationProp<RootStackParamList>>();
}

/**
 * Type-safe route hook
 * Provides typed access to route parameters
 * 
 * @example
 * const route = useTypedRoute<'DriverDetail'>();
 * const { driverId } = route.params;
 */
export function useTypedRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}
