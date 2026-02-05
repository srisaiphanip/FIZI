/**
 * DAILY MORNING REMINDER
 * 
 * Sends a motivational notification to all FIZI users every morning at 7 AM IST.
 * 
 * SETUP:
 * 1. Ensure service-account.json exists in the root directory.
 * 2. Deploy as a Cron Job on Render with schedule: 30 1 * * * (7 AM IST)
 * 
 * USAGE:
 * node scripts/daily-morning-reminder.js
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sendMorningReminder = async () => {
    console.log('🌅 Starting Daily Morning Reminder...');
    
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

        console.log(`🚀 Found ${tokens.length} users. Sending morning reminders...`);

        // Prepare messages for Expo
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: '🌞 Good Morning from FIZI!',
            body: 'Start your day strong! Your personalized workout is ready. Let\'s crush those fitness goals! 💪',
            data: { 
                screen: 'Home',
                type: 'morning_reminder'
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
            console.log(`Batch ${Math.floor(i/100) + 1} sent:`, result.data ? result.data.length : 0, 'notifications');
        }

        console.log('✅ Morning reminders sent successfully!');

    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('service-account.json')) {
            console.error('\n❌ ERROR: Missing "service-account.json".');
            console.error('Please ensure the service account key is uploaded to Render as a Secret File.\n');
        } else {
            console.error('❌ Error sending morning reminders:', error);
        }
    } finally {
        process.exit();
    }
};

sendMorningReminder();
