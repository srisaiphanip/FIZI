# FIZI (Fitness Genie)

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-007AFF?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)

**FIZI** is an advanced, AI-powered mobile fitness companion that brings personal training to your living room. By leveraging real-time computer vision and machine learning, FIZI analyzes your workout form, counts your reps, and provides instant audio/visual feedback—just like a real trainer.

What makes FIZI unique is its **Gamification Engine**: your physical effort fuels a custom digital avatar that grows, evolves, and transforms alongside you.

---

## ✨ Core Features

### 📡 AI-Powered Vision Engine
*   **Real-Time Pose Tracking**: Utilizes a robust Python Flask backend integrated with **MediaPipe** and **OpenCV** to track 33 body keypoints with high precision.
*   **Smart Rep Counting**: Features a state-machine based counter that analyzes exercise phases (eccentric/concentric) to ensure you complete full reps.
*   **Instant Form Correction**: dynamic geometry analysis calculates joint angles in real-time to detect bad form (e.g., flaring elbows, shallow squats) and provides immediate audio feedback.

### 🎮 Gamified Fitness Journey
*   **Evolving Avatar System**: Your hard work is visualized through a dynamic 3D-style avatar that physically transforms (builds muscle, changes posture) as you level up.
*   **XP & Leveling**: Earn Experience Points (XP) for every valid rep and completed workout to unlock new ranks and badges.
*   **Streaks & Achievements**: Daily streak tracking and milestone awards keep you motivated.

### 📅 Intelligent Coaching
*   **Adaptive Workouts**: Generates personalized weekly schedules based on your fitness level (Beginner/Intermediate/Advanced) and available equipment.
*   **Recovery Monitoring**: A user-centric recovery system suggests rest days or lighter loads based on your reported fatigue levels.
*   **Comprehensive Library**: detailed instructions and animations for supported exercises (Push-ups, Squats, Lunges, etc.).

### 📊 Deep Analytics
*   **Workout History**: Complete logs of past sessions including duration, total reps, accuracy scores, and caloric burn.
*   **Progress Visualization**: Interactive charts showing your improvement trends over time.

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **Language**: TypeScript
- **State Management**: Redux Toolkit (Slices for Auth, Workouts, Stats)
- **UI/UX**: Expo Linear Gradient, BlurView, Animated (React Native), Custom SVG Charts
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Backend Integration**: REST API (Fetch)

### Backend (AI Server)
- **Runtime**: Python 3.10+
- **Framework**: Flask (Web Server), Flask-CORS
- **Computer Vision**: MediaPipe (Pose Solution), OpenCV (Image Processing), NumPy
- **Logic**: Custom geometry engines for angle calculation and form validation

### Infrastructure
- **Database**: Firebase Firestore (User Profiles, Workouts, Plans)
- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Storage**: Firebase Storage (Assets)

---

## 🚀 Getting Started

Follow these steps to run FIZI locally on your machine and mobile device.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Expo Go** app installed on your Android/iOS device.

### 2. Clone the Repository
```bash
git clone https://github.com/MaheshChalla2701/FIZI.git
cd FIZI
```

### 3. Frontend Setup
```bash
# Install Node dependencies
npm install --legacy-peer-deps

# Configure Firebase
# 1. Create a project at console.firebase.google.com
# 2. Add a Web App to your project
# 3. Copy the config object
# 4. Open src/services/firebaseConfig.ts and paste your credentials
```

### 4. AI Server Setup
```bash
cd python_server

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask Server
python main.py
```
*The server will start on port `5001`. Keep this terminal open.*

### 5. ⚠️ CRITICAL: Connect Mobile to Localhost
Since the app runs on your phone and the server runs on your PC, they must be on the **same Wi-Fi network**.

1.  Find your computer's Local IP Address:
    *   **Windows**: run `ipconfig` (Look for IPv4 Address, e.g., `192.168.1.5`)
    *   **Mac/Linux**: run `ifconfig` or `ip a`
2.  Open `src/services/PoseDetectionService.ts` in your code editor.
3.  Locate the line:
    ```typescript
    const POSE_API_URL = "http://<YOUR_IP>:5001";
    ```
4.  Replace the IP address with your computer's actual Local IP.

### 6. Run the App
```bash
# Return to the root directory
cd .. 

# Start Expo
npx expo start
```
*   Scan the QR code with **Expo Go**.
*   Accept camera permissions.
*   Start a workout!

---

## 📂 Project Structure

```text
root/
├── python_server/           # AI Backend
│   ├── main.py              # Flask entry point & endpoints
│   ├── exercise_configs.py  # Rules for form validation (angles, thresholds)
│   ├── angle_calculator.py  # Geometry logic
│   ├── rep_counter.py       # State machine for counting reps
│   └── form_validator.py    # Feedback generation logic
├── src/                     # React Native Frontend
│   ├── components/          # Reusable UI (Cards, Modals, Overlays)
│   ├── services/            # API & Business Logic (PoseService, Firebase)
│   ├── screens/             # App Screens (Home, Camera, Avatar, Stats)
│   ├── store/               # Redux State definitions
│   ├── hooks/               # Custom Hooks (useSmartCamera, useAuth)
│   ├── theme/               # Global styles & colors
│   └── navigation/          # React Navigation setup
├── App.tsx                  # Main Entry
└── app.json                 # Expo Configuration
```

---

## ❓ Troubleshooting

**"Cannot connect to AI Server"**
*   Ensure your phone and PC are on the **same Wi-Fi**.
*   Verify the IP in `PoseDetectionService.ts` matches your PC's IP.
*   Check if your firewall is blocking port `5001`.
*   Ensure `python main.py` is running and says "Running on http://0.0.0.0:5001".

**"Camera access denied"**
*   Go to your phone settings -> Expo Go -> Allow Camera access.

**"No pose detected"**
*   Ensure good lighting.
*   Stand back so your full body (head to toe) is visible.
*   Wear contrasting clothes if possible.
