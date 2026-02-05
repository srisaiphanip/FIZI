/**
 * DAILY SLEEP REMINDER
 * 
 * Sends a wind-down notification to all FIZI users every evening at 10 PM IST.
 * 
 * SETUP:
 * 1. Ensure service-account.json exists in the root directory.
 * 2. Deploy as a Cron Job on Render with schedule: 30 16 * * * (10 PM IST)
 * 
 * USAGE:
 * node scripts/daily-sleep-reminder.js
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const sendSleepReminder = async () => {
    console.log('🌙 Starting Daily Sleep Reminder...');

    try {
        const snapshot = await db.collection('users').get();
        const tokens = [];

        snapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.pushToken && userData.pushToken.startsWith('ExponentPushToken')) {
                tokens.push(userData.pushToken);
            }
        });

        if (tokens.length === 0) {
            console.log('⚠️ No users with push tokens found.');
            return;
        }

        console.log(`🚀 Found ${tokens.length} users. Sending sleep reminders...`);

        // Prepare messages for Expo
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: '🌙 Time to Wind Down',
            body: 'Great work today! Get some rest so you can crush tomorrow\'s workout. Sweet dreams! 😴',
            data: {
                screen: 'Home',
                type: 'sleep_reminder'
            },
        }));

        // Send to Expo API (in batches of 100)
        for (let i = 0; i < messages.length; i += 100) {
            const batch = messages.slice(i, i + 100);
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batch),
            });

            const result = await response.json();
            console.log(`Batch ${Math.floor(i / 100) + 1} sent successfully.`);
        }

        console.log('✅ Sleep reminders sent successfully!');

    } catch (error) {
        console.error('❌ Error sending sleep reminders:', error);
    } finally {
        process.exit();
    }
};

sendSleepReminder();
