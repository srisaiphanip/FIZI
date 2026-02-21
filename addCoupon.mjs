import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDCquX8QEQbXd5_bn7K221BMSdeLn0SrGA",
    authDomain: "advi-fc220.firebaseapp.com",
    projectId: "advi-fc220"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addCoupon() {
    try {
        await setDoc(doc(db, 'coupons', 'FIZIFREE'), {
            type: '100_percent_off',
            durationMonths: 3,
            active: true
        });
        console.log("Coupon FIZIFREE successfully created!");

        await setDoc(doc(db, 'coupons', 'FIZI50'), {
            type: 'discount',
            discountPercentage: 50,
            active: true
        });
        console.log("Coupon FIZI50 successfully created!");
        process.exit(0);
    } catch (error) {
        console.error("Error writing document: ", error);
        process.exit(1);
    }
}

addCoupon();
