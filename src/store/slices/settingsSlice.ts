import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/authService';

interface SettingsState {
    notificationsEnabled: boolean;
    loading: boolean;
}

const initialState: SettingsState = {
    notificationsEnabled: true,
    loading: true,
};

export const loadSettings = createAsyncThunk(
    'settings/loadSettings',
    async () => {
        try {
            const result = await AsyncStorage.getItem('settings_notifications');
            return {
                notificationsEnabled: result !== 'false', // Default true
            };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {
                notificationsEnabled: true,
            };
        }
    }
);

export const toggleSetting = createAsyncThunk(
    'settings/toggleSetting',
    async (setting: { key: keyof Omit<SettingsState, 'loading'>, value: boolean }) => {
        try {
            const storageKey = 'settings_notifications';
            await AsyncStorage.setItem(storageKey, setting.value.toString());

            // Sync with server if it's the main notification toggle
            if (setting.key === 'notificationsEnabled') {
                await authService.updateNotificationPreference(setting.value);
            }

            return setting;
        } catch (error) {
            console.error('Failed to save setting:', error);
            throw error;
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadSettings.fulfilled, (state, action) => {
            state.notificationsEnabled = action.payload.notificationsEnabled;
            state.loading = false;
        });
        builder.addCase(toggleSetting.fulfilled, (state, action) => {
            state[action.payload.key] = action.payload.value;
        });
    },
});

export default settingsSlice.reducer;
