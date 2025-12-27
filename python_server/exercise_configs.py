
# Exercise Configuration for AI Trainer
# This file mirrors the TypeScript exercise definitions to provide the Python backend
# with the necessary metadata for dynamic angle calculation and rep counting.

EXERCISE_CONFIGS = {
    'push-ups': {
        'name': 'Push-ups',
        'key_angles': ['left_elbow', 'right_elbow', 'torso_inclination'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (130, 200), 'right_elbow': (130, 200), 'torso_inclination': (45, 105)}},
            {'name': 'down', 'ranges': {'left_elbow': (30, 135), 'right_elbow': (30, 135), 'torso_inclination': (45, 105)}}
        ],
        'form_checks': [
            {'name': 'body_alignment', 'type': 'alignment', 'threshold': 15}
        ]
    },
    'squats': {
        'name': 'Squats',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'torso_inclination'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (130, 200), 'right_knee': (130, 200), 'torso_inclination': (-15, 45)}},
            {'name': 'down', 'ranges': {'left_knee': (40, 140), 'right_knee': (40, 140)}}
        ],
        'form_checks': [
            {'name': 'knee_stability', 'type': 'alignment', 'threshold': 15}
        ]
    },
    'bicep-curls': {
        'name': 'Bicep Curls',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (115, 200), 'right_elbow': (115, 200)}},
            {'name': 'up', 'ranges': {'left_elbow': (5, 120), 'right_elbow': (5, 120)}}
        ],
        'form_checks': [
            {'name': 'elbow_fixed', 'type': 'position', 'threshold': 15}
        ]
    },
    'plank': {
        'name': 'Plank',
        'key_angles': ['left_elbow', 'left_hip', 'left_knee', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (140, 200), 'left_elbow': (50, 130), 'torso_inclination': (50, 100)}}
        ],
        'form_checks': []
    },
    'lunges': {
        'name': 'Lunges',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (140, 200), 'right_knee': (140, 200)}},
            {'name': 'down', 'ranges': {'left_knee': (60, 120), 'right_knee': (60, 120)}}
        ],
        'form_checks': []
    },
    'jumping-jacks': {
        'name': 'Jumping Jacks',
        'key_angles': ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'closed', 'ranges': {'left_shoulder': (-10, 50), 'right_shoulder': (-10, 50)}},
            {'name': 'open', 'ranges': {'left_shoulder': (130, 200), 'right_shoulder': (130, 200)}}
        ],
        'form_checks': []
    },
    'shoulder-press': {
        'name': 'Shoulder Press',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (40, 120), 'right_elbow': (40, 120)}},
            {'name': 'up', 'ranges': {'left_elbow': (130, 200), 'right_elbow': (130, 200)}}
        ],
        'form_checks': []
    },
    'dumbbell-rows': {
        'name': 'Dumbbell Rows',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (130, 200), 'right_elbow': (130, 200)}},
            {'name': 'up', 'ranges': {'left_elbow': (10, 100), 'right_elbow': (10, 100)}}
        ],
        'form_checks': []
    },
    'mountain-climbers': {
        'name': 'Mountain Climbers',
        'key_angles': ['left_knee', 'right_knee', 'torso_inclination'],
        'stages': [
            {'name': 'neutral', 'ranges': {'left_knee': (120, 200), 'right_knee': (120, 200), 'torso_inclination': (50, 100)}},
            {'name': 'active', 'ranges': {'left_knee': (20, 110), 'right_knee': (20, 110), 'torso_inclination': (50, 100)}} 
        ],
        'form_checks': []
    },
    'burpees': {
        'name': 'Burpees',
        'key_angles': ['left_hip', 'left_knee', 'left_elbow', 'torso_inclination'],
        'stages': [
            {'name': 'stand', 'ranges': {'torso_inclination': (-10, 50)}},
            {'name': 'plank', 'ranges': {'torso_inclination': (60, 100), 'left_elbow': (130, 200)}}
        ],
        'form_checks': []
    }
}

# Add more exercises as needed, following the pattern in exercises.ts
