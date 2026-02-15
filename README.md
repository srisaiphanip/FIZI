<div align="center">
  <img src="https://res.cloudinary.com/ddtslpjdf/image/upload/v1767885071/ChatGPT_Image_Jan_1_2026_02_00_59_PM_gqwae7.png" width="400" alt="FIZI Banner"/>
  
  # 🏋️ FIZI - AI Fitness Trainer
  
  **The future of decentralized, AI-driven personal training.**
  
  ![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue?style=for-the-badge&logo=react)
  ![Engine](https://img.shields.io/badge/Engine-Python%20%7C%20MediaPipe-green?style=for-the-badge&logo=python)
  ![Stack](https://img.shields.io/badge/Stack-React%20Native%20%7C%20Firebase-orange?style=for-the-badge&logo=firebase)
</div>

---

**FIZI** is a comprehensive, AI-driven fitness ecosystem that transforms your smartphone into a high-performance personal trainer. By integrating real-time computer vision, sophisticated periodized planning, a dedicated nutrition engine, and deep gamification, FIZI provides a professional-grade training experience completely autonomously.

---

## 🚀 Core Pillars

### 👁️ AI Computer Vision Engine
Powered by **MediaPipe** and **OpenCV**, FIZI's vision system analyzes your movements with sub-millisecond precision.
- **Real-Time Pose Analysis**: Tracks 33+ body landmarks to identify exercise form and posture.
- **Intelligent Rep Counting**: Features a stateful counting machine with form-aware rejections (e.g., "Depth insufficient" or "Straighten your back").
- **Voice & Visual Coaching**: Provides instant feedback during a set to correct form and encourage performance.
- **50+ Supported Exercises**: Comprehensive coverage from bodyweight basics to barbell compound movements and recovery stretches.

### 📅 Dynamic Periodized Planning
Unlike static workout apps, FIZI generates adaptive schedules based on your unique physiological profile and goals.
- **Automated 4-Week Cycles**: Includes built-in deload weeks (Week 4) to ensure optimal recovery and prevent overtraining.
- **Goal-Based Scaling**: Automatically adjusts sets, reps, and rest times based on objectives like **Muscle Gain**, **Weight Loss**, or **Endurance**.
- **Muscle Group Balancing**: Intelligent exercise selection ensures balanced development across chest, back, legs, and core.
- **Equipment Flexibility**: Tailors plans to **Bodyweight**, **Home Gym**, or **Full Gym** access.

### 🥗 Personalized Nutrition & Diet Engine
A full-stack nutrition suite integrated directly into your training volume.
- **TDEE/BMR Intelligence**: Calculates precise caloric needs using the **Mifflin-St Jeor** equation, dynamically adjusted for real-time activity levels.
- **Macro Optimization**: Goal-oriented protein, carb, and fat distributions automatically scaled to your specific fitness objective.
- **Smart Meal Scheduling**: Generates 3-6 meal timings per day with specific pre and post-workout nutrition windows.
- **Hydration Tracking**: Calculated water intake goals based on body weight and workout intensity.
- **Food Library**: Curated database of food suggestions categorized by nutrient density and dietary type (Veg/Non-Veg).

### 🛠️ Empowered Customization
FIZI puts the user in total control, allowing for a hybrid experience between AI-driven guidance and manual tailoring.
- **Custom Plan Builder**: Create entirely bespoke workout plans from scratch or duplicate and modify AI-generated plans.
- **Granular Session Tuning**: Manually add, remove, or reorder exercises; precisely adjust sets, reps, and rest durations.
- **Active Plan Management**: Seamlessly switch between multiple custom plans or return to AI-managed periodization at any time.

### 🎮 Deep Gamification System
Your fitness journey is visualized through a 7-tier progression system that mirrors an RPG.
- **Interactive Leveling**: Progress from **Beginner** up to **Legend** by earning XP through workouts.
- **Multi-Factor XP**: Earn experience based on total reps, session duration, and "Live Performance" scores.
- **Achievements & Streaks**: 10 hard-coded milestones and daily streak tracking to build long-term consistency.
- **Avatar Evolution**: Unlock higher intensity workouts and advanced exercise variations as you grow.

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    User([Athlete]) <--> MobileApp[Mobile App - React Native/Expo]
    
    subgraph "Local Execution (Frontend)"
        MobileApp <--> Store[Redux Store - slices for Auth, Workout, Goal, UI]
        MobileApp <--> Camera[Camera Feed Handler]
    end

    subgraph "Cloud Infrastructure"
        MobileApp <--> RenderServer[AI Engine - Python/Flask/MediaPipe]
        MobileApp <--> Firebase[Database - Firestore | Auth]
        MobileApp <--> Cloudinary[Media Assets - CDN]
        MobileApp <--> GitHubActions[Automated Workflows - Reminder Engine]
    end

    RenderServer -- "Live Pose & Rep Feedback" --> MobileApp
    Firebase -- "User Data & History" --> MobileApp
    GitHubActions -- "Daily Reminders & Nudges" --> MobileApp
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Frontend** | React Native, Expo, Redux Toolkit, TypeScript, Reanimated |
| **AI Backend** | Python, Flask, MediaPipe, OpenCV, NumPy |
| **Infrastructure** | Firebase (Auth/Store), Render (Compute), Cloudinary (CDN) |
| **Automation** | GitHub Actions, Node.js scripts |

---

## 👨‍💻 Developer
**Mahesh Challa**  
GitHub: [@MaheshChalla2701](https://github.com/MaheshChalla2701)  
Email: maheshchalla2701@gmail.com

---
<div align="center">
**Built for the future of decentralized fitness.**
</div>
