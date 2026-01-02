import { createNavigationContainerRef } from '@react-navigation/native';

// Create navigation ref that can be used anywhere in the app
export const navigationRef = createNavigationContainerRef();

// Helper function to navigate safely
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  } else {
    // If navigation is not ready, wait a bit and try again
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name as never, params as never);
      }
    }, 100);
  }
}

// Helper function to navigate to nested screens (e.g., Main -> Chat)
export function navigateToNestedScreen(
  tabName: string,
  screenName: string,
  params?: any,
) {
  if (navigationRef.isReady()) {
    // First navigate to Main tab, then to the specific screen
    navigationRef.navigate('Main' as never);
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(screenName as never, params as never);
      }
    }, 100);
  }
}

