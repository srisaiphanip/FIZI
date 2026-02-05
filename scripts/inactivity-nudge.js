/**
 * INACTIVITY NUDGE
 * 
 * Sends a nudge to users who haven't been active in the last 1-2 hours.
 * Runs every hour.
 * 
 * SETUP:
 * 1. Ensure service-account.json exists in the root directory.
 * 2. Deploy as a Cron Job on Render with schedule: 0 * * * * (Every hour)
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

const sendInactivityNudge = async () => {
    console.log('🕵️ Checking for inactive users...');

    // Calculate timestamp for 1 hour ago and 2 hours ago
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const twoHoursAgo = now - (120 * 60 * 1000);

    try {
        // Query users active between 1 and 2 hours ago
        // Note: In a production app with many users, you'd use Firestore queries
        // For simplicity, we'll fetch users and filter in memory since we check pushToken anyway
        const snapshot = await db.collection('users').get();
        const inactiveUsers = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.pushToken && data.lastActiveAt) {
                const lastActive = data.lastActiveAt.toMillis ? data.lastActiveAt.toMillis() : new Date(data.lastActiveAt).getTime();

                // If they were active between 1 and 2 hours ago
                if (lastActive < oneHourAgo && lastActive > twoHoursAgo) {
                    inactiveUsers.push({
                        token: data.pushToken,
                        name: data.displayName
                    });
                }
            }
        });

        if (inactiveUsers.length === 0) {
            console.log('✅ No users qualify for an inactivity nudge right now.');
            return;
        }

        console.log(`🚀 Found ${inactiveUsers.length} users who have been away for 1 hour. Sending nudges...`);

        const messages = inactiveUsers.map(user => ({
            to: user.token,
            sound: 'default',
            title: `Hey ${user.name || 'there'}! 👋`,
            body: 'We missed you! Ready to crush your next set? Open FIZI and let\'s get back to work! 🏋️‍♂️',
            data: { screen: 'Home', type: 'inactivity_nudge' },
        }));

        // Send to Expo API
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

        console.log('✅ Inactivity nudges sent!');

    } catch (error) {
        console.error('❌ Error sending inactivity nudges:', error);
    } finally {
        process.exit();
    }
};

sendInactivityNudge();
