/**
 * BROADCAST SCRIPT: Send Push Notification to ALL Users
 * 
 * This script queries your Firestore 'users' collection, collects all tokens,
 * and sends a notification to everyone at once.
 * 
 * SETUP:
 * 1. Go to Firebase Console > Project Settings > Service Accounts.
 * 2. Click "Generate New Private Key" and save the JSON file.
 * 3. Place that JSON file in this project as 'service-account.json'.
 * 
 * USAGE:
 * node scripts/broadcast-notifications.js "Your Title" "Your Message"
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch'); // You might need: npm install node-fetch@2

// 1. Initialize Firebase Admin
// Make sure service-account.json exists in the root directory
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const broadcast = async (title, body, data = {}) => {
    console.log('🔍 Fetching all user tokens from Firestore...');

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

        console.log(`🚀 Found ${tokens.length} users. Sending broadcast...`);

        // Prepare messages for Expo
        // Expo allows sending up to 100 notifications at once
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }));

        // Send to Expo API
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        const result = await response.json();
        console.log('✅ Broadcast complete!');
        console.log('Expo API Summary:', JSON.stringify(result, null, 2));

    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('service-account.json')) {
            console.error('\n❌ ERROR: Missing "service-account.json".');
            console.error('Please download your service account key from the Firebase Console and save it as "service-account.json" in the root folder.\n');
        } else {
            console.error('❌ Error during broadcast:', error);
        }
    } finally {
        process.exit();
    }
};

// Handle CLI Arguments
const args = process.argv.slice(2);
const title = args[0] || '💪 FIZI Update';
const message = args[1] || 'New workout features are live! Check them out now.';

broadcast(title, message);
