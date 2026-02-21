import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import type {
    Purchase,
    PurchaseError,
    Product,
    ProductSubscription,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebaseConfig';

// --- Constants ---
const SUBSCRIPTION_IDS = ['fizi_premium_3month'];

let RNIap: any;
try {
    RNIap = require('react-native-iap');
} catch (e) {

}

interface BillingContextType {
    connected: boolean;
    products: (Product | ProductSubscription)[];
    purchased: boolean;
    loading: boolean;
    purchaseSubscription: (productId: string) => Promise<void>;
    restorePurchases: () => Promise<void>;
    checkSubscriptionStatus: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Dummy product for Expo Go visualization
const MOCK_PRODUCTS: any[] = [
    {
        id: 'fizi_premium_3month',
        productId: 'fizi_premium_3month',
        title: 'FIZI Premium (Quarterly)',
        description: '3 Month Plan (Mock)',
        price: '₹299',
        currency: 'INR',
        subscriptionOffers: [{
            offerTokenAndroid: 'mock_token_3m',
            displayPrice: '₹299',
            pricingPhasesAndroid: {
                pricingPhaseList: [{ formattedPrice: '₹299' }]
            }
        }]
    }
];

export const BillingProvider = ({ children }: { children: ReactNode }) => {
    const [connected, setConnected] = useState(false);
    const [products, setProducts] = useState<(Product | ProductSubscription)[]>([]);
    const [purchased, setPurchased] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeBilling = async () => {
            if (!RNIap) {
                setProducts(MOCK_PRODUCTS); // Set mock products so UI shows up
                return;
            }

            try {
                const result = await RNIap.initConnection();
                setConnected(result);
                if (result) {
                    await fetchSubscriptions();
                    // We don't check status here anymore, we wait for auth state or explicit check
                }
            } catch (err) {
                console.warn('IAP Init Error', err);
            }
        };

        initializeBilling();

        if (RNIap) {
            // Listener for successful purchases
            purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: Purchase) => {
                const user = auth.currentUser;
                if (purchase) {
                    try {
                        await RNIap.finishTransaction({ purchase, isConsumable: false });
                        setPurchased(true);

                        if (user) {
                            await AsyncStorage.setItem(`is_premium_${user.uid}`, 'true'); // Cache locally for specific user
                        }

                        Alert.alert('Success', 'Subscription active! Premium features unlocked.');
                    } catch (ackErr) {
                        console.warn('ackErr', ackErr);
                    }
                }
            });

            // Listener for purchase errors
            purchaseErrorSubscription = RNIap.purchaseErrorListener((error: PurchaseError) => {
                setLoading(false);
                console.warn('Purchase error:', error);
                // safe access to responseCode
                const code = 'responseCode' in error ? (error as any).responseCode : null;
                if (code !== 6) { // 6 = User canceled
                    Alert.alert('Purchase Failed', error.message);
                }
            });
        }

        return () => {
            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            if (RNIap) RNIap.endConnection();
        };
    }, []);

    // Listen for Auth Changes to update subscription status
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await checkSubscriptionStatus();
            } else {
                setPurchased(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchSubscriptions = async () => {
        if (!RNIap) return;
        try {
            // Using fetchProducts with type 'subs' instead of getSubscriptions
            const result = await RNIap.fetchProducts({ skus: SUBSCRIPTION_IDS, type: 'subs' });
            if (result && Array.isArray(result)) {
                setProducts(result);
            }
        } catch (err) {
            console.warn('Error fetching subscriptions:', err);
        }
    };

    const purchaseSubscription = async (productId: string) => {
        if (!RNIap) {
            Alert.alert('Expo Go', 'In-App Purchases are not supported in Expo Go. Use a development build on a physical device.');
            return;
        }

        if (!connected) {
            Alert.alert('Error', 'Billing service not connected');
            return;
        }

        setLoading(true);
        try {
            // Find the product details
            // v14 uses 'id' instead of 'productId' for Products
            const sub = products.find(p => p.id === productId) as ProductSubscription | undefined;
            if (!sub) {
                Alert.alert('Error', 'Subscription product not found');
                setLoading(false);
                return;
            }

            // Extract offer token (Android)
            // v14 uses subscriptionOffers array
            const offerToken = sub.subscriptionOffers?.[0]?.offerTokenAndroid;

            if (!offerToken && Platform.OS === 'android') {
                Alert.alert('Error', 'Offer token not found for subscription');
                setLoading(false);
                return;
            }

            const requestParams: any = {
                type: 'subs',
            };

            if (Platform.OS === 'android') {
                requestParams.request = {
                    google: {
                        skus: [sub.id],
                        subscriptionOffers: [{ sku: sub.id, offerToken }],
                    }
                };
            } else {
                requestParams.request = {
                    apple: {
                        sku: sub.id,
                    }
                };
            }

            await RNIap.requestPurchase(requestParams);
        } catch (err: any) {
            setLoading(false);
            console.warn('Request subscription failed', err);
        }
    };

    const restorePurchases = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to restore purchases.');
                setLoading(false);
                return;
            }

            const purchases = await getAvailablePurchases();

            if (purchases === null) {
                Alert.alert('Error', 'Could not fetch purchases. Please try again later.');
                return;
            }

            // Check if user has active subscription (using p.productId because Purchase object still has productId)
            // Wait, types.ts says PurchaseCommon has productId.
            const hasPremium = purchases.find((p: any) => SUBSCRIPTION_IDS.includes(p.productId));

            if (hasPremium) {
                setPurchased(true);
                await AsyncStorage.setItem(`is_premium_${user.uid}`, 'true');
                Alert.alert('Restore Successful', 'Your subscription has been restored.');
            } else {
                Alert.alert('Restore', 'No active subscription found.');
                // Optional: setPurchased(false) if strict check needed
            }

        } catch (err) {
            console.warn('Restore failed', err);
            Alert.alert('Error', 'Failed to restore purchases');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get available purchases (for restore/check)
    const getAvailablePurchases = async () => {
        if (!RNIap) return null;
        try {
            return await RNIap.getAvailablePurchases();
        } catch (error) {
            console.warn('getAvailablePurchases error', error);
            return null; // Return null on error to distinguish from "no purchases"
        }
    }


    const checkSubscriptionStatus = async () => {
        const user = auth.currentUser;
        if (!user) {
            setPurchased(false);
            return;
        }

        // 1. Check local storage first for speed (User Specific)
        const localPremium = await AsyncStorage.getItem(`is_premium_${user.uid}`);
        if (localPremium === 'true') {
            setPurchased(true);
        } else {
            setPurchased(false); // Validating resetting if not found locally for new user
        }

        // 2. Verify with store (async)
        // Note: In production you might want to skip this if local is true to save network,
        // but for now checking store is safer to detect expirations.
        if (localPremium === 'true') return; // If local says true (via coupon/expiry or Mock RNIap), keep it without revoking via Empty RNIap.

        const purchases = await getAvailablePurchases();

        // If query failed (null), stop here and rely on local storage (don't revoke)
        if (purchases === null) return;

        // Check productId (Purchase object validation)
        const hasPremium = purchases.some((p: any) => SUBSCRIPTION_IDS.includes(p.productId));

        if (hasPremium) {
            setPurchased(true);
            await AsyncStorage.setItem(`is_premium_${user.uid}`, 'true');
        } else {
            // Purchases fetched successfully but no active subscription found -> Revoke
            if (connected) {
                setPurchased(false);
                await AsyncStorage.removeItem(`is_premium_${user.uid}`);
            }
        }
    };

    return (
        <BillingContext.Provider
            value={{
                connected,
                products,
                purchased,
                loading,
                purchaseSubscription,
                restorePurchases,
                checkSubscriptionStatus,
            }}
        >
            {children}
        </BillingContext.Provider>
    );
};

export const useBilling = () => {
    const context = useContext(BillingContext);
    if (!context) {
        throw new Error('useBilling must be used within a BillingProvider');
    }
    return context;
};
