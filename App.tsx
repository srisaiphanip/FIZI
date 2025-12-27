import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, RootState } from './src/store';
import { auth } from './src/services/firebaseConfig';
import { authService } from './src/services/authService';
import { setUser } from './src/store/slices/authSlice';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ExerciseInstructionsScreen from './src/screens/ExerciseInstructionsScreen';
import LevelProgressScreen from './src/screens/LevelProgressScreen';
import ExerciseLibraryScreen from './src/screens/ExerciseLibraryScreen';

export type ScreenType = 'Login' | 'Signup' | 'ProfileSetup' | 'Home' | 'Camera' | 'History' | 'Avatar' | 'Onboarding' | 'ExerciseInstructions' | 'LevelProgress' | 'ExerciseLibrary';

export interface CameraScreenParams {
  exerciseId?: string;
  exerciseName?: string;
  targetSets?: number;
  targetReps?: string;
  fromPlan?: boolean;
}

export interface NavigationParams {
  Camera?: CameraScreenParams;
  ExerciseInstructions?: CameraScreenParams;
}


function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Login');
  const navigationParamsRef = useRef<NavigationParams>({});
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_complete');
      if (value !== 'true') {
        setCurrentScreen('Onboarding');
      }
    } catch (e) {
      console.error('Error checking onboarding:', e);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      setCurrentScreen('Login');
    } catch (e) {
      console.error('Error saving onboarding status:', e);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await authService.getUserProfile(firebaseUser.uid);
        store.dispatch(setUser(userProfile));
      } else {
        store.dispatch(setUser(null));
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation Logic - Only run for auth/onboarding, don't override other screens
  useEffect(() => {
    if (checkingOnboarding) return;
    if (currentScreen === 'Onboarding') return;

    // Don't override these screens - user navigated there manually
    if (currentScreen === 'Camera' || currentScreen === 'History' || currentScreen === 'Avatar' || currentScreen === 'ExerciseInstructions' || currentScreen === 'LevelProgress' || currentScreen === 'ExerciseLibrary') {
      return;
    }

    if (isAuthenticated && user) {
      // Check if profile is complete
      if (user.age > 0 && user.weight > 0 && user.height > 0 && user.workoutPlanId) {
        // Profile is complete - only auto-navigate from auth screens
        if (currentScreen === 'Login' || currentScreen === 'Signup' || currentScreen === 'ProfileSetup') {
          setCurrentScreen('Home');
        }
      } else {
        // Profile not complete
        if (currentScreen !== 'ProfileSetup') {
          setCurrentScreen('ProfileSetup');
        }
      }
    } else {
      // Not authenticated
      if (currentScreen !== 'Login' && currentScreen !== 'Signup') {
        setCurrentScreen('Login');
      }
    }
  }, [isAuthenticated, user, checkingOnboarding]);

  // Navigation functions to pass to screens
  const navigation = {
    navigate: (screen: ScreenType, params?: any) => {
      if (params) {
        navigationParamsRef.current = { ...navigationParamsRef.current, [screen]: params };
      }
      setCurrentScreen(screen);
    },
    get params() {
      return navigationParamsRef.current[currentScreen as keyof NavigationParams];
    },
  };

  // Render current screen
  const renderScreen = () => {
    if (checkingOnboarding) {
      return null; // Or a loading spinner
    }

    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Signup':
        return <SignupScreen navigation={navigation} />;
      case 'ProfileSetup':
        return <ProfileSetupScreen navigation={navigation} />;
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Camera':
        return <CameraScreen navigation={navigation} />;
      case 'History':
        return <HistoryScreen navigation={navigation} />;
      case 'Avatar':
        return <AvatarScreen navigation={navigation} />;
      case 'Onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'ExerciseInstructions':
        return <ExerciseInstructionsScreen navigation={navigation} />;
      case 'LevelProgress':
        return <LevelProgressScreen navigation={navigation} />;
      case 'ExerciseLibrary':
        return <ExerciseLibraryScreen navigation={navigation} />;
      default:
        return <LoginScreen navigation={navigation} />;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

