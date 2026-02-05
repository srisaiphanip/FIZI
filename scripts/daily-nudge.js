/**
 * DAILY NUDGE SCRIPT
 * 
 * Logic:
 * 1. Fetch all users from Firestore.
 * 2. Check the 'stats' collection for today's entry (userId_YYYY-MM-DD).
 * 3. If no workout recorded today, send a push notification.
 * 
 * Setup:
 * Requires 'service-account.json' in the root directory.
 * 
 * Implementation for Render Cron Job:
 * Set command to: node scripts/daily-nudge.js
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('../service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const sendDailyNudge = async () => {
    console.log('🌅 Starting Daily Nudge process...');

    // Get today's date string (UTC)
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Checking for workouts on: ${today}`);

    try {
        const usersSnapshot = await db.collection('users').get();
        const nudgeList = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            if (!userData.pushToken) continue;

            // Check if user has worked out today
            const statsId = `${userId}_${today}`;
            const statsDoc = await db.collection('stats').doc(statsId).get();

            if (!statsDoc.exists() || (statsDoc.data().workoutCount || 0) === 0) {
                nudgeList.push({
                    token: userData.pushToken,
                    name: userData.displayName || 'Athlete'
                });
            }
        }

        if (nudgeList.length === 0) {
            console.log('✅ All active users have worked out today! No nudges needed.');
            return;
        }

        console.log(`🔔 Found ${nudgeList.length} users who need a nudge.`);

        // Prepare messages for Expo
        const messages = nudgeList.map(user => ({
            to: user.token,
            sound: 'default',
            title: '💪 FIZI: Daily Reminder',
            body: `Hey ${user.name}, don't break your streak! Your daily workout is waiting for you. 🏋️`,
            data: { screen: 'Home' },
        }));

        // Send to Expo API (in batches of 100 as per Expo limits)
        for (let i = 0; i < messages.length; i += 100) {
            const batch = messages.slice(i, i + 100);
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batch),
            });
        }

        console.log('🚀 All nudges sent successfully!');

    } catch (error) {
        console.error('❌ Error in Daily Nudge:', error);
    } finally {
        process.exit();
    }
};

sendDailyNudge();
