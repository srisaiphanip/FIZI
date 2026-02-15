import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import type {
    Purchase,
    PurchaseError,
    Product,
    ProductSubscription,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Constants ---
const SUBSCRIPTION_IDS = ['fizi_premium_3month', 'fizi_premium_1year'];

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
    },
    {
        id: 'fizi_premium_1year',
        productId: 'fizi_premium_1year',
        title: 'FIZI Premium (Yearly)',
        description: '1 Year Plan (Mock)',
        price: '₹999',
        currency: 'INR',
        subscriptionOffers: [{
            offerTokenAndroid: 'mock_token_1y',
            displayPrice: '₹999',
            pricingPhasesAndroid: {
                pricingPhaseList: [{ formattedPrice: '₹999' }]
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
                    await checkSubscriptionStatus(); // Check if already purchased
                }
            } catch (err) {

            }
        };

        initializeBilling();

        if (RNIap) {
            // Listener for successful purchases
            purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: Purchase) => {
                // v14: Purchase object contains id, productId, transactionId, etc.
                if (purchase) {
                    try {
                        await RNIap.finishTransaction({ purchase, isConsumable: false });
                        setPurchased(true);
                        await AsyncStorage.setItem('is_premium', 'true'); // Cache locally
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
            const purchases = await getAvailablePurchases();
            // Check if user has active subscription (using p.productId because Purchase object still has productId)
            // Wait, types.ts says PurchaseCommon has productId.
            const hasPremium = purchases.find((p: any) => SUBSCRIPTION_IDS.includes(p.productId));

            if (hasPremium) {
                setPurchased(true);
                await AsyncStorage.setItem('is_premium', 'true');
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
        if (!RNIap) return [];
        try {
            return await RNIap.getAvailablePurchases();
        } catch (error) {
            console.warn('getAvailablePurchases error', error);
            return [];
        }
    }


    const checkSubscriptionStatus = async () => {
        // 1. Check local storage first for speed
        const localPremium = await AsyncStorage.getItem('is_premium');
        if (localPremium === 'true') {
            setPurchased(true);
        }

        // 2. Verify with store (async)
        const purchases = await getAvailablePurchases();
        // Check productId (Purchase object validation)
        const hasPremium = purchases.some((p: any) => SUBSCRIPTION_IDS.includes(p.productId));

        if (hasPremium) {
            setPurchased(true);
            await AsyncStorage.setItem('is_premium', 'true');
        } else {
            // Only invalidating if we are sure (e.g., expiration check). 
            // For now, if getAvailablePurchases returns empty, it implies no active sub.
            // However, be careful not to lock user out offline.
            // Ideally, verify receipt with backend.
            if (connected) {
                // setPurchased(false); 
                // AsyncStorage.removeItem('is_premium');
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
