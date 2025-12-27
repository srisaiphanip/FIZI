
# Exercise Configuration for AI Trainer
# This file mirrors the TypeScript exercise definitions to provide the Python backend
# with the necessary metadata for dynamic angle calculation and rep counting.

EXERCISE_CONFIGS = {
    'push-ups': {
        'name': 'Push-ups',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (50, 115), 'right_elbow': (50, 115)}},
            {'name': 'up', 'ranges': {'left_elbow': (150, 185), 'right_elbow': (150, 185)}}
        ],
        'form_checks': [
            {'name': 'body_alignment', 'type': 'alignment', 'threshold': 15}
        ]
    },
    'squats': {
        'name': 'Squats',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'down', 'ranges': {'left_knee': (60, 120), 'right_knee': (60, 120)}},
            {'name': 'up', 'ranges': {'left_knee': (150, 185), 'right_knee': (150, 185)}}
        ],
        'form_checks': [
            {'name': 'knee_stability', 'type': 'alignment', 'threshold': 10}
        ]
    },
    'bicep-curls': {
        'name': 'Bicep Curls',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (20, 100), 'right_elbow': (20, 100)}},
            {'name': 'down', 'ranges': {'left_elbow': (135, 185), 'right_elbow': (135, 185)}}
        ],
        'form_checks': [
            {'name': 'elbow_fixed', 'type': 'position', 'threshold': 10}
        ]
    },
    'plank': {
        'name': 'Plank',
        'key_angles': ['left_elbow', 'left_hip', 'left_knee'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (160, 185), 'left_elbow': (70, 110)}}
        ],
        'form_checks': []
    },
    'lunges': {
        'name': 'Lunges',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'down', 'ranges': {'left_knee': (80, 100), 'right_knee': (80, 100)}},
            {'name': 'up', 'ranges': {'left_knee': (160, 180), 'right_knee': (160, 180)}}
        ],
        'form_checks': []
    },
    'jumping-jacks': {
        'name': 'Jumping Jacks',
        'key_angles': ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'open', 'ranges': {'left_shoulder': (150, 180), 'right_shoulder': (150, 180)}},
            {'name': 'closed', 'ranges': {'left_shoulder': (0, 30), 'right_shoulder': (0, 30)}}
        ],
        'form_checks': []
    },
    'shoulder-press': {
        'name': 'Shoulder Press',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (150, 180), 'right_elbow': (150, 180)}},
            {'name': 'down', 'ranges': {'left_elbow': (60, 90), 'right_elbow': (60, 90)}}
        ],
        'form_checks': []
    },
    'dumbbell-rows': {
        'name': 'Dumbbell Rows',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (30, 70), 'right_elbow': (30, 70)}},
            {'name': 'down', 'ranges': {'left_elbow': (150, 180), 'right_elbow': (150, 180)}}
        ],
        'form_checks': []
    },
    'mountain-climbers': {
        'name': 'Mountain Climbers',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'left_in', 'ranges': {'left_knee': (40, 80)}},
            {'name': 'right_in', 'ranges': {'right_knee': (40, 80)}}
        ],
        'form_checks': []
    },
    'burpees': {
        'name': 'Burpees',
        'key_angles': ['left_hip', 'left_knee', 'left_elbow'],
        'stages': [
            {'name': 'plank', 'ranges': {'left_elbow': (160, 180), 'left_hip': (160, 180)}},
            {'name': 'stand', 'ranges': {'left_hip': (160, 180), 'left_knee': (160, 180)}}
        ],
        'form_checks': []
    }
}

# Add more exercises as needed, following the pattern in exercises.ts
