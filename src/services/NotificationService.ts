import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authService } from './authService';
import { store } from '../store';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => {
        const { notificationsEnabled } = store.getState().settings;

        // If notifications are globally disabled, don't show anything
        if (!notificationsEnabled) {
            return {
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
                shouldShowBanner: false,
                shouldShowList: false,
            };
        }

        return {
            shouldShowAlert: true,
            shouldPlaySound: true, // Default to true if notifications are allowed
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});

class NotificationService {
    /**
     * Register for push notifications and get the token
     */
    async registerForPushNotificationsAsync(): Promise<string | undefined> {
        let token;

        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return undefined;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return undefined;
        }

        try {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: '4362db1a-f495-48f5-8129-1dfa113c7b85', // From app.json
            })).data;

            if (token) {
                console.log('🚀 FIZI Push Token:', token);
                await authService.updatePushToken(token);
            }
        } catch (e) {
            console.error('Error getting push token:', e);
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }

    /**
     * Listen for incoming notifications
     */
    addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Listen for notification responses (when user taps on notification)
     */
    addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Clear all displayed notifications
     */
    async dismissAllNotifications() {
        await Notifications.dismissAllNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
export default notificationService;
