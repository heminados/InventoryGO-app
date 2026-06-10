import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

// Shared navigation reference — wired to NavigationContainer in App.tsx.
// Allows navigation from outside React components (e.g. API response handlers).
export const navigationRef = createNavigationContainerRef();

// Clears the stored token and resets the navigation stack to the Login screen.
// Call this whenever any screen receives a 401 or 403 from the server.
export const forceLogout = async (message?: string) => {
    await AsyncStorage.removeItem('token');
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login', params: message ? { errorMessage: message } : undefined }],
            })
        );
    }
};
