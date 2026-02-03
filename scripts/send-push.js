/**
 * TEST SCRIPT: Send Push Notification
 * 
 * This script demonstrates how your server would send a push notification
 * to a user using their stored Expo Push Token.
 * 
 * Usage: 
 * 1. Replace 'YOUR_EXPO_PUSH_TOKEN' with the token found in your Firestore 'users' collection.
 * 2. Run: node scripts/send-push.js
 */

const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    console.log('Sending push notification to:', expoPushToken);

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log('Expo API Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

// Example Usage (FOR TESTING ONLY)
const TEST_TOKEN = 'ExponentPushToken[hmYz7RLp2CEeeh1etWU588]'; // Updated with provided token
sendPushNotification(
    TEST_TOKEN,
    '💪 FIZI: Workout Time!',
    'Your personalized "Upper Body Power" session is ready. Let\'s get moving!',
    { screen: 'Home', workoutId: 'daily-session-123' }
);
