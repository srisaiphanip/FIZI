import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';
import { generateChatResponse } from './groqService';
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
     * Request permissions for local notifications (needed for Android 13+)
     */
    async requestPermissionsAsync(): Promise<boolean> {
        if (!Device.isDevice) return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    }

    /**
     * Schedule a week of dynamic motivational notifications
     */
    async scheduleDynamicNotifications() {
        try {
            const { notificationsEnabled } = store.getState().settings;
            if (!notificationsEnabled) return;

            // Check if we already scheduled them recently (once every 5 days)
            const lastScheduled = await AsyncStorage.getItem('last_notification_schedule');
            const now = Date.now();
            if (lastScheduled && now - parseInt(lastScheduled) < 5 * 24 * 60 * 60 * 1000) {
                if (__DEV__) console.log('Notifications already scheduled recently.');
                return;
            }

            if (__DEV__) console.log('Fetching dynamic notifications from Groq...');

            const prompt = "Generate 7 extremely short and highly motivational workout reminders (max 60 chars each) for an app called FIZI. Return ONLY a JSON array of 7 strings. No extra text.";
            
            const response = await generateChatResponse([
                { role: 'system', content: 'You are a supportive and high-energy fitness coach for the FIZI app.' },
                { role: 'user', content: prompt }
            ]);

            // Simple parsing - clean up the response string if it has markdown or extra text
            let messages: string[] = [];
            try {
                const cleanedResponse = response.replace(/```json|```/g, '').trim();
                messages = JSON.parse(cleanedResponse);
            } catch (e) {
                console.error('Failed to parse Groq response for notifications:', e);
                // Fallback messages
                messages = [
                    "Time to level up your fitness!",
                    "A 30-minute workout is only 2% of your day. No excuses!",
                    "Sweat is just fat crying. Keep going!",
                    "Your future self will thank you for this workout.",
                    "Discipline is doing what needs to be done, even when you don't feel like it.",
                    "One workout at a time, one day at a time.",
                    "Stronger than yesterday! Let's hit it!"
                ];
            }

            // Cancel all existing scheduled notifications
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Schedule for the next 7 days at 7:00 AM
            for (let i = 0; i < messages.length; i++) {
                const triggerDate = new Date();
                triggerDate.setDate(triggerDate.getDate() + (i + 1));
                triggerDate.setHours(7, 0, 0, 0);

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "FIZI Fitness Coach ⚡",
                        body: messages[i],
                        sound: true,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                        date: triggerDate,
                        repeats: false,
                    } as Notifications.NotificationTriggerInput,
                });
            }

            await AsyncStorage.setItem('last_notification_schedule', now.toString());
            if (__DEV__) console.log('Successfully scheduled 7 dynamic notifications.');

        } catch (error) {
            console.error('Error scheduling dynamic notifications:', error);
        }
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
