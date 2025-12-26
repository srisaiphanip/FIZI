import { Exercise } from '../types';

/**
 * Exercise definitions for the MVP
 * Starting with 4 core exercises: push-ups, squats, plank, bicep curls
 */

export const exercises: Exercise[] = [
    {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        keypoints: [5, 6, 7, 8, 11, 12, 13, 14, 15, 16], // Shoulders, elbows, wrists, hips, knees, ankles
        equipment: [], // Bodyweight only
        difficulty: 'beginner',
        primaryGoal: 'strength',
        contraindications: ['wrist_pain', 'shoulder_injury', 'rotator_cuff_injury'],
        alternatives: ['wall-push-ups', 'knee-push-ups'],
        description: 'A fundamental upper body exercise targeting chest, shoulders, and triceps.',
        steps: [
            'Start in a high plank position with hands slightly wider than shoulders',
            'Keep your body in a straight line from head to heels',
            'Lower your body until chest nearly touches the ground',
            'Push back up to starting position'
        ],
        tips: [
            'Keep core engaged throughout',
            'Don\'t let hips sag or pike up',
            'Breathe in on the way down, out on the way up'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    {
                        joint: 'left_elbow',
                        min: 60,
                        max: 90,
                        optimal: 75
                    },
                    {
                        joint: 'right_elbow',
                        min: 60,
                        max: 90,
                        optimal: 75
                    }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    {
                        joint: 'left_elbow',
                        min: 160,
                        max: 180,
                        optimal: 170
                    },
                    {
                        joint: 'right_elbow',
                        min: 160,
                        max: 180,
                        optimal: 170
                    }
                ]
            }
        ],
        formChecks: [
            {
                name: 'body_alignment',
                description: 'Keep body straight from shoulders to ankles',
                severity: 'error',
                checkFunction: (pose) => {
                    // Check if shoulders, hips, and ankles are aligned
                    // Implementation in FormAnalyzer
                    return true;
                },
                feedback: {
                    visual: 'Keep your body straight',
                    audio: 'Straighten your back and core'
                }
            },
            {
                name: 'elbow_position',
                description: 'Elbows should be at 45-degree angle to body',
                severity: 'warning',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Tuck your elbows in',
                    audio: 'Keep elbows closer to your body'
                }
            }
        ]
    },
    {
        id: 'squats',
        name: 'Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26], // Hips, knees, ankles
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        contraindications: ['knee_pain', 'knee_injury', 'hip_injury'],
        alternatives: ['wall-sits', 'leg-press'],
        description: 'A compound lower body exercise that builds leg and glute strength.',
        steps: [
            'Stand with feet shoulder-width apart, toes slightly out',
            'Keep chest up and core engaged',
            'Lower down by bending knees and pushing hips back',
            'Go until thighs are parallel to ground',
            'Push through heels to return to standing'
        ],
        tips: [
            'Keep knees tracking over toes',
            'Don\'t let knees cave inward',
            'Weight should be on your heels'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    {
                        joint: 'left_knee',
                        min: 60,
                        max: 90,
                        optimal: 80
                    },
                    {
                        joint: 'right_knee',
                        min: 60,
                        max: 90,
                        optimal: 80
                    }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    {
                        joint: 'left_knee',
                        min: 160,
                        max: 180,
                        optimal: 170
                    },
                    {
                        joint: 'right_knee',
                        min: 160,
                        max: 180,
                        optimal: 170
                    }
                ]
            }
        ],
        formChecks: [
            {
                name: 'knee_alignment',
                description: 'Knees should not extend past toes',
                severity: 'error',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Knees over toes!',
                    audio: 'Push your hips back more'
                }
            },
            {
                name: 'depth',
                description: 'Squat to at least 90 degrees',
                severity: 'warning',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Go deeper',
                    audio: 'Squat lower for full range of motion'
                }
            }
        ]
    },
    {
        id: 'plank',
        name: 'Plank',
        category: 'strength',
        muscleGroups: ['core', 'shoulders', 'back'],
        keypoints: [5, 6, 11, 12, 15, 16], // Shoulders, hips, ankles
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'endurance',
        contraindications: ['lower_back_pain', 'wrist_pain', 'shoulder_injury'],
        alternatives: ['side-plank', 'forearm-plank'],
        description: 'An isometric core exercise that builds overall stability.',
        steps: [
            'Start in a forearm plank position',
            'Keep elbows directly under shoulders',
            'Body should form a straight line',
            'Hold the position'
        ],
        tips: [
            'Don\'t let hips sag or pike up',
            'Squeeze glutes and core',
            'Breathe steadily throughout'
        ],
        stages: [
            {
                name: 'hold',
                angleRanges: [
                    {
                        joint: 'left_shoulder',
                        min: 80,
                        max: 100,
                        optimal: 90
                    },
                    {
                        joint: 'right_shoulder',
                        min: 80,
                        max: 100,
                        optimal: 90
                    }
                ],
                duration: 30 // Default hold time in seconds
            }
        ],
        formChecks: [
            {
                name: 'hip_sag',
                description: 'Keep hips level with shoulders',
                severity: 'error',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Lift your hips',
                    audio: 'Engage your core and lift your hips'
                }
            },
            {
                name: 'hip_pike',
                description: 'Do not raise hips too high',
                severity: 'error',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Lower your hips',
                    audio: 'Bring your hips down to form a straight line'
                }
            }
        ]
    },
    {
        id: 'bicep-curls',
        name: 'Bicep Curls',
        category: 'strength',
        muscleGroups: ['biceps', 'forearms'],
        keypoints: [5, 6, 7, 8, 9, 10], // Shoulders, elbows, wrists
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        contraindications: ['elbow_pain', 'bicep_tendonitis'],
        alternatives: ['resistance-band-curls', 'hammer-curls'],
        description: 'An isolation exercise targeting the biceps.',
        steps: [
            'Stand with feet hip-width apart',
            'Hold weights with arms fully extended',
            'Curl weights up toward shoulders',
            'Lower back down with control'
        ],
        tips: [
            'Keep elbows close to body',
            'Don\'t swing or use momentum',
            'Control the weight on the way down'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    {
                        joint: 'left_elbow',
                        min: 30,
                        max: 50,
                        optimal: 40
                    },
                    {
                        joint: 'right_elbow',
                        min: 30,
                        max: 50,
                        optimal: 40
                    }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    {
                        joint: 'left_elbow',
                        min: 160,
                        max: 180,
                        optimal: 170
                    },
                    {
                        joint: 'right_elbow',
                        min: 160,
                        max: 180,
                        optimal: 170
                    }
                ]
            }
        ],
        formChecks: [
            {
                name: 'elbow_stability',
                description: 'Keep elbows fixed at sides',
                severity: 'warning',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Stabilize elbows',
                    audio: 'Keep your elbows close to your body'
                }
            },
            {
                name: 'controlled_movement',
                description: 'Avoid swinging or using momentum',
                severity: 'warning',
                checkFunction: (pose) => true,
                feedback: {
                    visual: 'Control the movement',
                    audio: 'Slow down and control the weight'
                }
            }
        ]
    },
    {
        id: 'lunges',
        name: 'Lunges',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        contraindications: ['knee_pain', 'balance_issues'],
        alternatives: ['step-ups', 'split-squats'],
        description: 'A lower body exercise that improves balance and leg strength.',
        steps: [
            'Stand tall with feet hip-width apart',
            'Step forward with one leg, lowering your hips',
            'Both knees should bend at approximately 90-degree angles',
            'Keep your front knee directly above your ankle',
            'Push back to the starting position'
        ],
        tips: [
            'Keep your torso upright',
            'Take a large enough step to maintain balance',
            'Don\'t let your back knee hit the floor hard'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 80, max: 100, optimal: 90 },
                    { joint: 'right_knee', min: 80, max: 100, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 160, max: 180, optimal: 170 },
                    { joint: 'right_knee', min: 160, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: [
            {
                name: 'depth',
                description: 'Lower back knee close to ground',
                severity: 'warning',
                checkFunction: (pose) => true,
                feedback: { visual: 'Go lower', audio: 'Lower your back knee' }
            }
        ]
    },
    {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        category: 'cardio',
        muscleGroups: ['core', 'shoulders', 'legs'],
        keypoints: [5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'endurance',
        contraindications: ['wrist_pain', 'lower_back_pain'],
        alternatives: ['high-knees', 'running-in-place'],
        description: 'A dynamic core exercise that mimics the motion of climbing a mountain.',
        steps: [
            'Start in a high plank position',
            'Drive your right knee toward your chest',
            'Quickly switch legs, driving the left knee forward',
            'Keep your hips low and back flat',
            'Continue alternating legs at a fast pace'
        ],
        tips: [
            'Keep shoulders directly over wrists',
            'Don\'t let your butt pike up in the air',
            'Breathe rhythmically'
        ],
        stages: [
            // Simplified: Just detecting one leg up vs plank
            {
                name: 'run',
                angleRanges: [
                    { joint: 'left_knee', min: 30, max: 100, optimal: 60 } // One knee up
                ]
            },
            {
                name: 'plank',
                angleRanges: [
                    { joint: 'left_knee', min: 150, max: 180, optimal: 170 }, // Both extended
                    { joint: 'right_knee', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'burpees',
        name: 'Burpees',
        category: 'cardio',
        muscleGroups: ['full_body', 'core', 'legs', 'chest'],
        keypoints: [5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'endurance',
        contraindications: ['knee_pain', 'wrist_pain', 'heart_condition'],
        alternatives: ['squat-thrusts', 'step-back-burpees'],
        description: 'A full-body explosive exercise that builds strength and cardio endurance.',
        steps: [
            'Stand with feet shoulder-width apart',
            'Lower into a squat position and place hands on floor',
            'Kick feet back into a plank position',
            'Perform a push-up (optional)',
            'Jump feet back toward hands',
            'Explode up into a jump with arms overhead'
        ],
        tips: [
            'Maintain a strong core during the plank',
            'Land softly on your feet',
            'Move at a steady, rhythmic pace'
        ],
        stages: [
            {
                name: 'crouch', // Hands on ground
                angleRanges: [
                    { joint: 'left_knee', min: 30, max: 80, optimal: 45 },
                    { joint: 'right_knee', min: 30, max: 80, optimal: 45 }
                ]
            },
            {
                name: 'stand', // Upright
                angleRanges: [
                    { joint: 'left_knee', min: 160, max: 180, optimal: 180 },
                    { joint: 'left_shoulder', min: 150, max: 180, optimal: 170 } // Arms up ideally
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        muscleGroups: ['legs', 'shoulders', 'core'],
        keypoints: [5, 6, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'endurance',
        contraindications: ['knee_pain', 'ankle_injury'],
        alternatives: ['step-jacks', 'arm-circles'],
        description: 'A classic cardio move that works the whole body.',
        steps: [
            'Stand with feet together and arms at sides',
            'Jump while spreading legs and raising arms overhead',
            'Jump again to return to the starting position',
            'Repeat in a fluid motion'
        ],
        tips: [
            'Keep a slight bend in your knees',
            'Coordinate your arms and legs',
            'Stay light on the balls of your feet'
        ],
        stages: [
            {
                name: 'open', // Legs wide, arms up
                angleRanges: [
                    { joint: 'left_shoulder', min: 120, max: 180, optimal: 160 },
                    { joint: 'right_shoulder', min: 120, max: 180, optimal: 160 }
                ]
            },
            {
                name: 'closed', // Legs together, arms down. Using shoulder angle < 40
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 40, optimal: 10 },
                    { joint: 'right_shoulder', min: 0, max: 40, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'dumbbell-rows',
        name: 'Dumbbell Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10, 11, 12],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        contraindications: ['lower_back_pain', 'shoulder_injury'],
        alternatives: ['resistance-band-rows', 'bodyweight-rows'],
        description: 'A back exercise that targets the lats and rhomboids.',
        steps: [
            'Bend forward with knees slightly bent and back flat',
            'Hold dumbbells with arms fully extended toward the floor',
            'Pull the weights toward your waist, keeping elbows close',
            'Lower back to starting position with control'
        ],
        tips: [
            'Keep your back straight, don\'t arch it',
            'Squeeze your shoulder blades at the top',
            'Avoid using momentum'
        ],
        stages: [
            {
                name: 'up', // Elbow pulled back
                angleRanges: [
                    { joint: 'left_elbow', min: 20, max: 90, optimal: 45 },
                    { joint: 'right_elbow', min: 20, max: 90, optimal: 45 }
                ]
            },
            {
                name: 'down', // Arm extended
                angleRanges: [
                    { joint: 'left_elbow', min: 160, max: 180, optimal: 175 },
                    { joint: 'right_elbow', min: 160, max: 180, optimal: 175 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'shoulder-press',
        name: 'Shoulder Press',
        category: 'strength',
        muscleGroups: ['shoulders', 'triceps', 'upper_chest'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        contraindications: ['shoulder_injury', 'rotator_cuff_injury', 'neck_pain'],
        alternatives: ['lateral-raises', 'front-raises'],
        description: 'A strength exercise targeting the shoulders and upper body.',
        steps: [
            'Stand or sit with weights at shoulder level',
            'Push the weights straight up until arms are extended',
            'Keep your core engaged and back straight',
            'Lower the weights back to shoulder level with control'
        ],
        tips: [
            'Don\'t lock your elbows at the top',
            'Keep your wrists stable',
            'Breathe out as you press up'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 60 },
                    { joint: 'right_elbow', min: 45, max: 90, optimal: 60 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'leg-press-machine',
        name: 'Leg Press Machine',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A lower body machine exercise targeting quadriceps, glutes, and hamstrings.',
        steps: [
            'Sit in the machine with your back and head flat against the padded support',
            'Place your feet on the footplate hip-width apart',
            'Unlock the safety bars and lower the weights toward you by bending your knees',
            'Push the weight away until your legs are fully extended (do not lock knees)'
        ],
        tips: [
            'Keep your back flat against the seat',
            'Do not lock your knees at the top of the movement',
            'Ensure your feet are flat on the plate throughout'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 70, max: 110, optimal: 90 },
                    { joint: 'right_knee', min: 70, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_knee', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'leg-press',
        name: 'Leg Press',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A lower body machine exercise targeting quadriceps, glutes, and hamstrings.',
        steps: [
            'Sit in the machine with your back and head flat against the padded support',
            'Place your feet on the footplate hip-width apart',
            'Unlock the safety bars and lower the weights toward you by bending your knees',
            'Push the weight away until your legs are fully extended (do not lock knees)'
        ],
        tips: [
            'Keep your back flat against the seat',
            'Do not lock your knees at the top of the movement',
            'Ensure your feet are flat on the plate throughout'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 70, max: 110, optimal: 90 },
                    { joint: 'right_knee', min: 70, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_knee', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'lat-pulldowns',
        name: 'Lat Pulldowns',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A machine exercise focusing on the latissimus dorsi muscles in the back.',
        steps: [
            'Sit at the machine and grab the bar with a wide grip',
            'Pull the bar down toward your upper chest mientras squeeze your shoulder blades',
            'Maintain a slight lean back but keep your torso stable',
            'Slowly return the bar to the starting position'
        ],
        tips: [
            'Pull with your elbows, not just your hands',
            'Don\'t use momentum by rocking your body',
            'Keep your chest up and shoulders down'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 20, max: 90, optimal: 45 },
                    { joint: 'right_elbow', min: 20, max: 90, optimal: 45 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'machine-row',
        name: 'Machine Row',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A machine exercise for targeting the back muscles with a controlled rowing motion.',
        steps: [
            'Sit at the machine with chest against the pad',
            'Grip the handles and pull them toward your body',
            'Squeeze your shoulder blades together at the peak',
            'Slowly return to the starting position'
        ],
        tips: [
            'Keep your chest against the pad at all times',
            'Focus on pulling with your back rather than your biceps',
            'Exhale as you pull, inhale as you return'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 90, optimal: 50 },
                    { joint: 'right_elbow', min: 30, max: 90, optimal: 50 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'shoulder-press-machine',
        name: 'Shoulder Press Machine',
        category: 'strength',
        muscleGroups: ['shoulders', 'triceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A machine version of the shoulder press for building shoulder strength with added stability.',
        steps: [
            'Sit in the machine and adjust the seat height',
            'Grip the handles and press them overhead until arms are nearly straight',
            'Control the weight as you lower it back to the starting position',
            'Keep your back flat against the seat throughout'
        ],
        tips: [
            'Avoid arching your back',
            'Do not lock your elbows at the top',
            'Maintain a slow and controlled tempo'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 60, max: 100, optimal: 80 },
                    { joint: 'right_elbow', min: 60, max: 100, optimal: 80 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'tricep-pushdowns',
        name: 'Tricep Pushdowns',
        category: 'strength',
        muscleGroups: ['triceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['cable'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise targeting the triceps using a cable machine.',
        steps: [
            'Stand in front of the cable machine and grab the bar/rope',
            'Keep your elbows tucked into your sides',
            'Push the bar down until your arms are fully extended',
            'Slowly return to the starting position'
        ],
        tips: [
            'Only your forearms should move',
            'Keep your core engaged',
            'Squeeze your triceps at the bottom'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 90, optimal: 60 },
                    { joint: 'right_elbow', min: 30, max: 90, optimal: 60 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'leg-curl-machine',
        name: 'Leg Curl Machine',
        category: 'strength',
        muscleGroups: ['hamstrings'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'An isolation exercise for the hamstrings using a seated or lying leg curl machine.',
        steps: [
            'Sit or lie in the machine and place the pad behind your lower legs',
            'Grip the handles for stability',
            'Curl your legs toward your body as far as possible',
            'Slowly return to the starting position'
        ],
        tips: [
            'Keep your hips down against the pad',
            'Maintain a controlled movement',
            'Squeeze your hamstrings at the top of the curl'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 30, max: 90, optimal: 60 },
                    { joint: 'right_knee', min: 30, max: 90, optimal: 60 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_knee', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'calf-raises',
        name: 'Calf Raises',
        category: 'strength',
        muscleGroups: ['calves'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['none'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'An exercise for building calf strength and definition.',
        steps: [
            'Stand tall with feet hip-width apart',
            'Push through the balls of your feet to raise your heels',
            'Pause at the top for a moment',
            'Lower your heels back to the floor'
        ],
        tips: [
            'Move through the full range of motion',
            'Keep your knees slightly bent',
            'Squeeze your calves at the top'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_ankle', min: 120, max: 150, optimal: 140 },
                    { joint: 'right_ankle', min: 120, max: 150, optimal: 140 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_ankle', min: 80, max: 110, optimal: 90 },
                    { joint: 'right_ankle', min: 80, max: 110, optimal: 90 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'chest-dips',
        name: 'Chest Dips (Assisted)',
        category: 'strength',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'An upper body pushing exercise that targets the chest and triceps, performed on a dip station (assisted if needed).',
        steps: [
            'Grip the handles and push yourself up to the starting position',
            'Lower your body by bending your arms until your shoulders are below your elbows',
            'Lean slightly forward to focus on the chest',
            'Push yourself back up to the starting position'
        ],
        tips: [
            'Keep your elbows slightly out',
            'Control the descent',
            'Maintain a stable core'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 60, max: 100, optimal: 80 },
                    { joint: 'right_elbow', min: 60, max: 100, optimal: 80 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'bodyweight-rows',
        name: 'Bodyweight Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['none'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A foundational pulling exercise using your own body weight to strengthen the back and biceps.',
        steps: [
            'Find a bar at waist height',
            'Hang under the bar with a straight body and heels on the ground',
            'Pull your chest toward the bar by squeezing your shoulder blades',
            'Lower yourself back down with control'
        ],
        tips: [
            'Keep your body in a straight line',
            'Don\'t let your hips sag',
            'Pull with your elbows'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 90, optimal: 60 },
                    { joint: 'right_elbow', min: 30, max: 90, optimal: 60 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        category: 'strength',
        muscleGroups: ['shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise targeting the lateral deltoids for broader shoulders.',
        steps: [
            'Stand with weights at your sides, palms facing in',
            'Raise your arms out to the sides with a slight bend in your elbows',
            'Stop when your arms are parallel to the floor',
            'Lower the weights back down with control'
        ],
        tips: [
            'Avoid using momentum or swinging',
            'Keep your core engaged',
            'Focus on leading with your elbows'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_shoulder', min: 80, max: 100, optimal: 90 },
                    { joint: 'right_shoulder', min: 80, max: 100, optimal: 90 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 30, optimal: 10 },
                    { joint: 'right_shoulder', min: 0, max: 30, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'barbell-curls',
        name: 'Barbell Curls',
        category: 'strength',
        muscleGroups: ['biceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['barbell'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A classic bicep exercise using a barbell to build arm strength and size.',
        steps: [
            'Stand tall holding a barbell with an underhand grip',
            'Curl the bar toward your shoulders while keeping elbows at your sides',
            'Squeeze your biceps at the top',
            'Lower the bar back down slowly'
        ],
        tips: [
            'Don\'t swing your body to lift the weight',
            'Keep your elbows fixed at your sides',
            'Move through the full range of motion'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 60, optimal: 45 },
                    { joint: 'right_elbow', min: 30, max: 60, optimal: 45 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'overhead-tricep-extension',
        name: 'Overhead Tricep Extension',
        category: 'strength',
        muscleGroups: ['triceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbell'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise for the triceps performed by extending a weight overhead.',
        steps: [
            'Hold a dumbbell overhead with both hands',
            'Lower the weight behind your head by bending your elbows',
            'Keep your upper arms stationary and close to your head',
            'Extend your arms to lift the weight back up'
        ],
        tips: [
            'Keep your elbows pointed forward',
            'Don\'t let your elbows flare out too much',
            'Maintain a stable core'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 60, optimal: 45 },
                    { joint: 'right_elbow', min: 30, max: 60, optimal: 45 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'leg-extensions',
        name: 'Leg Extensions',
        category: 'strength',
        muscleGroups: ['quadriceps'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A machine exercise that isolates the quadriceps muscles.',
        steps: [
            'Sit in the machine with your back against the pad',
            'Place your feet under the roller pad',
            'Extend your legs until they are straight',
            'Lower the weight back down with control'
        ],
        tips: [
            'Don\'t lock your knees at the top',
            'Keep your back flat against the seat',
            'Squeeze your quads at the peak'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 160, max: 180, optimal: 175 },
                    { joint: 'right_knee', min: 160, max: 180, optimal: 175 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 80, max: 110, optimal: 90 },
                    { joint: 'right_knee', min: 80, max: 110, optimal: 90 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'bulgarian-split-squats',
        name: 'Bulgarian Split Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        equipment: ['none'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'An advanced single-leg squat that targets the quads and glutes while improving balance.',
        steps: [
            'Stand a few feet in front of a bench or step',
            'Place one foot behind you on the bench',
            'Lower your hips until your front thigh is parallel to the ground',
            'Push through your front heel to return to the starting position'
        ],
        tips: [
            'Keep your front knee aligned with your foot',
            'Maintain an upright torso',
            'Focus on your balance'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 80, max: 110, optimal: 90 },
                    { joint: 'right_knee', min: 80, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 160, max: 180, optimal: 170 },
                    { joint: 'right_knee', min: 160, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'adductor-machine',
        name: 'Adductor Machine',
        category: 'strength',
        muscleGroups: ['adductors'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A machine exercise for targeting the inner thigh muscles (adductors).',
        steps: [
            'Sit in the machine with your legs against the pads',
            'Squeeze your legs together toward the center',
            'Maintain a controlled motion',
            'Slowly return to the starting position'
        ],
        tips: [
            'Keep your back flat against the seat',
            'Don\'t use momentum',
            'Focus on the squeeze in your inner thighs'
        ],
        stages: [
            {
                name: 'closed',
                angleRanges: [
                    { joint: 'left_hip', min: 0, max: 20, optimal: 10 },
                    { joint: 'right_hip', min: 0, max: 20, optimal: 10 }
                ]
            },
            {
                name: 'open',
                angleRanges: [
                    { joint: 'left_hip', min: 40, max: 70, optimal: 60 },
                    { joint: 'right_hip', min: 40, max: 70, optimal: 60 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'db-bench-press',
        name: 'Dumbbell Bench Press',
        category: 'strength',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A compound pushing exercise using dumbbells to build chest and tricep strength.',
        steps: [
            'Lie on a bench with a dumbbell in each hand',
            'Lower the weights to the sides of your chest',
            'Press the weights back up until your arms are extended',
            'Keep your feet flat on the floor and back on the bench'
        ],
        tips: [
            'Don\'t let the weights clank at the top',
            'Control the descent',
            'Maintain a slight arch in your lower back if comfortable'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 },
                    { joint: 'right_elbow', min: 45, max: 90, optimal: 70 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'incline-db-press',
        name: 'Incline Dumbbell Press',
        category: 'strength',
        muscleGroups: ['upper_chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'A dumbbell bench press performed on an incline to target the upper chest.',
        steps: [
            'Lie on an incline bench (30-45 degrees)',
            'Lower dumbbells to the sides of your upper chest',
            'Press them up until arms are extended',
            'Maintain control throughout the movement'
        ],
        tips: [
            'Keep your shoulders retracted',
            'Ensure the bench angle is not too steep (don\'t turn it into a shoulder press)',
            'Focus on the upper chest contraction'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 },
                    { joint: 'right_elbow', min: 45, max: 90, optimal: 70 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'bb-bench-press',
        name: 'Barbell Bench Press',
        category: 'strength',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'The classic chest-building exercise using a barbell.',
        steps: [
            'Lie flat on the bench and grip the bar slightly wider than shoulder width',
            'Lower the bar to your mid-chest',
            'Press the bar back up until arms are extended',
            'Keep your core tight and feet planted'
        ],
        tips: [
            'Tuck your elbows slightly (45-degree angle)',
            'Don\'t bounce the bar off your chest',
            'Maintain three points of contact: head, shoulders, and glutes'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 },
                    { joint: 'right_elbow', min: 45, max: 90, optimal: 70 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'incline-bb-press',
        name: 'Incline Barbell Press',
        category: 'strength',
        muscleGroups: ['upper_chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A barbell bench press on an incline for upper chest development.',
        steps: [
            'Lie on an incline bench and grip the bar',
            'Lower the bar to your upper chest (near the collarbones)',
            'Press the bar back up to the starting position',
            'Control the weight on the way down'
        ],
        tips: [
            'Use a slightly narrower grip than flat bench',
            'Keep your wrists straight',
            'Maintain shoulder stability'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 },
                    { joint: 'right_elbow', min: 45, max: 90, optimal: 70 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'db-flyes',
        name: 'Dumbbell Flyes',
        category: 'strength',
        muscleGroups: ['chest'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise that stretches and contracts the chest muscles.',
        steps: [
            'Lie on a bench with weights held above your chest, palms facing each other',
            'Lower the weights in a wide arc out to the sides',
            'Keep a slight bend in your elbows',
            'Bring the weights back together over your chest'
        ],
        tips: [
            'Focus on the stretch at the bottom',
            'Don\'t go too heavy; form is key',
            'Avoid letting the weights touch at the top to maintain tension'
        ],
        stages: [
            {
                name: 'open',
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 30, optimal: 10 } // Close to horizontal
                ]
            },
            {
                name: 'closed',
                angleRanges: [
                    { joint: 'left_shoulder', min: 70, max: 100, optimal: 90 } // Near vertical
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'face-pulls',
        name: 'Face Pulls',
        category: 'strength',
        muscleGroups: ['rear_delts', 'upper_back'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['cable'],
        difficulty: 'intermediate',
        primaryGoal: 'endurance',
        description: 'A cable exercise for the rear deltoids and upper back, excellent for shoulder health.',
        steps: [
            'Grip the rope handles on a cable machine at face height',
            'Pull the rope towards your face, pulling the handles apart',
            'Squeeze your shoulder blades together at the peak',
            'Return to the starting position with control'
        ],
        tips: [
            'Lead with your elbows',
            'Pull high, toward your forehead or eyes',
            'Maintain a stable stance'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 80, optimal: 45 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'hammer-curls',
        name: 'Hammer Curls',
        category: 'strength',
        muscleGroups: ['brachialis', 'biceps', 'forearms'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A variation of bicep curls with a neutral grip to target the brachialis and forearms.',
        steps: [
            'Stand with weights at your sides, palms facing in (neutral grip)',
            'Curl the weights toward your shoulders',
            'Keep your palms facing each other throughout',
            'Lower back down with control'
        ],
        tips: [
            'Don\'t let your elbows move forward',
            'Keep your grip firm but not excessively tight',
            'Avoid swaying your body'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 30, max: 70, optimal: 45 },
                    { joint: 'right_elbow', min: 30, max: 70, optimal: 45 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 },
                    { joint: 'right_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'romanian-deadlifts',
        name: 'Romanian Deadlifts',
        category: 'strength',
        muscleGroups: ['hamstrings', 'glutes', 'lower_back'],
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24],
        equipment: ['barbell', 'dumbbells'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A deadlift variation focusing on the posterior chain with a hinge motion.',
        steps: [
            'Stand holding a bar in front of your thighs',
            'Hinge at the hips, lowering the bar while keeping your legs nearly straight',
            'Lower until you feel a deep stretch in your hamstrings',
            'Drive your hips forward to return to the starting position'
        ],
        tips: [
            'Keep the bar Close to your legs',
            'Maintain a flat back at all times',
            'Don\'t bend your knees too much (it\'s a hinge, not a squat)'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_hip', min: 80, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_hip', min: 160, max: 180, optimal: 180 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'deadlifts',
        name: 'Deadlifts',
        category: 'strength',
        muscleGroups: ['full_body', 'lower_back', 'hamstrings', 'glutes'],
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24],
        equipment: ['barbell'],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'A fundamental compound movement for building total body strength and power.',
        steps: [
            'Stand with feet hip-width apart, bar over mid-foot',
            'Hinge at hips and grip the bar',
            'Keep your back flat and chest up',
            'Drive through your heels to stand up, keeping the bar close to your body',
            'Lower the bar back to the floor by hinging at the hips'
        ],
        tips: [
            'Keep your spine neutral throughout',
            'Don\'t round your back',
            'Engage your core before lifting'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_hip', min: 160, max: 180, optimal: 180 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_hip', min: 70, max: 100, optimal: 90 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'pull-ups',
        name: 'Pull-ups',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['pull-up bar'],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'A challenging upper body pulling exercise that builds back and arm strength.',
        steps: [
            'Grip the pull-up bar with palms facing away from you (overhand grip)',
            'Hang with arms fully extended',
            'Pull yourself up until your chin is over the bar',
            'Lower yourself back down with control'
        ],
        tips: [
            'Lead with your chest',
            'Avoid using your legs to kick (kipping)',
            'Squeeze your shoulder blades together'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 20, max: 60, optimal: 45 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 175 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'barbell-rows',
        name: 'Barbell Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A compound pulling exercise targeting the back muscles.',
        steps: [
            'Bend forward at the hips with knees slightly bent',
            'Grip the barbell with an overhand grip',
            'Pull the bar toward your lower chest/waist',
            'Lower the bar back down with control while maintaining a flat back'
        ],
        tips: [
            'Keep your core tight and back flat',
            'Don\'t use momentum to lift the weight',
            'Pull your elbows back past your torso'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 20, max: 80, optimal: 50 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 175 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'hack-squats',
        name: 'Hack Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A squat variation performed on a machine which focuses more on the quadriceps.',
        steps: [
            'Place your back against the pad and shoulders under the pads',
            'Position your feet shoulder-width apart on the platform',
            'Lower the weights by bending your knees',
            'Drive through your heels to return to the starting position'
        ],
        tips: [
            'Don\'t lock your knees at the top',
            'Ensure your feet are flat on the platform',
            'Keep your back against the pad'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_knee', min: 80, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_knee', min: 160, max: 180, optimal: 175 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'pec-deck-machine',
        name: 'Pec Deck Machine',
        category: 'strength',
        muscleGroups: ['chest'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A machine isolation exercise for the chest that mimics a fly motion.',
        steps: [
            'Sit in the machine and place your arms against the pads or grip handles',
            'Bring the pads/handles together in front of your chest',
            'Squeeze your chest muscles at the center',
            'Slowly return to the starting position'
        ],
        tips: [
            'Keep your back flat against the seat',
            'Don\'t clank the weights together',
            'Maintain a slow and controlled tempo'
        ],
        stages: [
            {
                name: 'closed',
                angleRanges: [
                    { joint: 'left_shoulder', min: 70, max: 100, optimal: 90 }
                ]
            },
            {
                name: 'open',
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 30, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'close-grip-bench-press',
        name: 'Close Grip Bench Press',
        category: 'strength',
        muscleGroups: ['triceps', 'chest', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A bench press variation with a narrower grip to emphasize the triceps.',
        steps: [
            'Lie on the bench and grip the barbell with hands about shoulder-width apart',
            'Lower the bar toward your lower chest',
            'Press the bar back up while keeping your elbows close to your sides',
            'Focus on the tricep extension at the top'
        ],
        tips: [
            'Grip should be narrower than standard bench but not so close that it hurts your wrists',
            'Keep your elbows tucked',
            'Maintain control of the bar throughout'
        ],
        stages: [
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 }
                ]
            },
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'machine-chest-press',
        name: 'Machine Chest Press',
        category: 'strength',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A machine version of the chest press, providing stability and controlled movement.',
        steps: [
            'Sit in the machine and adjust the handles to chest height',
            'Press the handles forward until arms are extended',
            'Slowly return the handles to the starting position',
            'Keep your back flat against the seat'
        ],
        tips: [
            'Maintain a controlled pace',
            'Exhale as you press, inhale as you return',
            'Don\'t lock your elbows fully'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 170 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 45, max: 90, optimal: 70 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'cable-flyes',
        name: 'Cable Flyes',
        category: 'strength',
        muscleGroups: ['chest'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['cable'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'A chest isolation exercise using cables for constant tension throughout the movement.',
        steps: [
            'Stand in the middle of a cable station with handles in each hand',
            'Bring the handles together in a wide arc in front of your chest',
            'Keep a slight bend in your elbows',
            'Return to the starting position with control'
        ],
        tips: [
            'Focus on the chest squeeze',
            'Maintain a stable core and stance',
            'Don\'t let your elbows go too far back'
        ],
        stages: [
            {
                name: 'closed',
                angleRanges: [
                    { joint: 'left_shoulder', min: 70, max: 100, optimal: 90 }
                ]
            },
            {
                name: 'open',
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 30, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'chest-supported-rows',
        name: 'Chest-Supported Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['machine', 'dumbbells'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A rowing variation where your chest is supported by a pad to isolate the back and minimize lower back strain.',
        steps: [
            'Lie face down on an incline bench or sit at a machine with chest against the pad',
            'Grip the weights or handles',
            'Pull the weight toward your body by driving your elbows back',
            'Lower the weight back down with control'
        ],
        tips: [
            'Keep your chest against the pad',
            'Squeeze your shoulder blades at the top',
            'Avoid using your lower back to pull'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_elbow', min: 20, max: 80, optimal: 50 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_elbow', min: 150, max: 180, optimal: 175 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'reverse-flyes',
        name: 'Reverse Flyes',
        category: 'strength',
        muscleGroups: ['rear_delts', 'upper_back'],
        keypoints: [5, 6, 7, 8, 9, 10],
        equipment: ['dumbbells', 'machine'],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise for the rear deltoids and upper back.',
        steps: [
            'Hinge forward at the hips or sit at a machine',
            'Raise your arms out to the sides while keeping a slight bend in the elbows',
            'Focus on squeezing the back of your shoulders',
            'Return to the starting position with control'
        ],
        tips: [
            'Don\'t use momentum',
            'Control the weight on the way down',
            'Lead with your elbows'
        ],
        stages: [
            {
                name: 'up',
                angleRanges: [
                    { joint: 'left_shoulder', min: 80, max: 110, optimal: 90 }
                ]
            },
            {
                name: 'down',
                angleRanges: [
                    { joint: 'left_shoulder', min: 0, max: 30, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    {
        id: 'abductor-machine',
        name: 'Abductor Machine',
        category: 'strength',
        muscleGroups: ['abductors', 'glutes'],
        keypoints: [11, 12, 13, 14, 15, 16],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'A machine exercise for targeting the outer thigh and glute muscles.',
        steps: [
            'Sit in the machine and place your legs against the outer pads',
            'Push your legs apart against the resistance',
            'Squeeze your glutes at the peak of the movement',
            'Return to the starting position with control'
        ],
        tips: [
            'Keep your back flat against the seat',
            'Focus on the contraction in your outer hips',
            'Maintain a slow and controlled tempo'
        ],
        stages: [
            {
                name: 'open',
                angleRanges: [
                    { joint: 'left_hip', min: 40, max: 70, optimal: 60 }
                ]
            },
            {
                name: 'closed',
                angleRanges: [
                    { joint: 'left_hip', min: 0, max: 20, optimal: 10 }
                ]
            }
        ],
        formChecks: []
    },
    // ============================================
    // AI / ML GUIDED SLOTS (LEVEL 4 & 5)
    // ============================================
    {
        id: 'accessory-push',
        name: 'Accessory Push (AI-Selected)',
        category: 'strength',
        muscleGroups: ['shoulders', 'triceps', 'chest'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An AI-selected accessory pushing movement targeting shoulders or triceps.',
        steps: [
            'Perform the pushing movement recommended by your AI trainer',
            'Focus on isolation and muscle contraction',
            'Maintain a slow and controlled tempo'
        ],
        tips: [
            'Pick a weight that allows for 12-15 clean reps',
            'Mind-muscle connection is key here',
            'Minimize rest between sets'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'accessory-pull',
        name: 'Accessory Pull (AI-Selected)',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'rear_delts'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An AI-selected accessory pulling movement targeting the back or biceps.',
        steps: [
            'Perform the pulling movement recommended by your AI trainer',
            'Squeeze the target muscle at the peak of the movement',
            'Control the weight on the way down'
        ],
        tips: [
            'Focus on the stretch at the bottom',
            'Don\'t use momentum',
            'Breathe rhythmically'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-push--ai-selected-',
        name: 'Primary Push (AI-Selected)',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your primary heavy pushing movement selected by the AI based on your goals.',
        steps: [
            'Setup for your primary compound push (e.g., Bench Press or Overhead Press)',
            'Prepare your core and establish a stable base',
            'Execute the movement with maximum intent and control'
        ],
        tips: [
            'Prioritize proper safety and spotting',
            'Stick to the prescribed rep range for strength',
            'Focus on explosive concentric power'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-pull--ai-selected-',
        name: 'Primary Pull (AI-Selected)',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your primary heavy pulling movement selected by the AI.',
        steps: [
            'Setup for your primary compound pull (e.g., Deadlift or Row)',
            'Engage your back and core before beginning',
            'Pull with control and intent'
        ],
        tips: [
            'Protect your lower back',
            'Pull with your elbows',
            'Squeeze your shoulder blades'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'weak-point-1--ml-identified-',
        name: 'Weak Point 1 (ML-Identified)',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'hypertrophy',
        description: 'An exercise specifically selected to target a weak point identified by machine learning analysis.',
        steps: [
            'Focus on the specific weak point area identified by the AI',
            'Use a weight that allows for perfect technical execution',
            'Prioritize feel and contraction over heavy load'
        ],
        tips: [
            'This slot is for correction and balance',
            'Listen to the AI\'s feedback on your form',
            'Slow down the eccentric phase'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'accessory-work',
        name: 'Accessory Work',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'Supplemental exercise work to support your primary lifts.',
        steps: [
            'Select an exercise that supports your main training focus',
            'Perform with moderate weight and high control',
            'Ensure the target muscle is fully engaged'
        ],
        tips: [
            'Quality over quantity',
            'Keep your focus sharp even on accessories',
            'Rest 60-90 seconds between sets'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'compound-movement',
        name: 'Compound Movement',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A multi-joint exercise targeting multiple major muscle groups.',
        steps: [
            'Establish a strong, stable stance',
            'Execute the compound movement as prescribed',
            'Coordinate your breathing with the movement'
        ],
        tips: [
            'Engage your core throughout',
            'Control the entire range of motion',
            'Prioritize safety'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-compound',
        name: 'Primary Compound',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your main lift for the session, focusing on raw power and strength.',
        steps: [
            'Warm up thoroughly before this primary movement',
            'Setup exactly as required for the specific lift',
            'Execute with maximum efficiency and strength'
        ],
        tips: [
            'Focus on the lift path',
            'Maintain total body tension',
            'Stay mentally focused'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'conditioning',
        name: 'Conditioning',
        category: 'cardio',
        muscleGroups: ['full_body'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'endurance',
        description: 'A high-intensity finisher to improve cardiovascular performance.',
        steps: [
            'Perform the conditioning activity at a high effort level',
            'Keep movement fluid and relentless',
            'Push through the final minutes'
        ],
        tips: [
            'Stay hydrated',
            'Monitor your heart rate',
            'Don\'t sacrifice form for speed'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'compound-push',
        name: 'Compound Push',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A multi-joint pushing movement targeting the upper body.',
        steps: [
            'Setup for a compound pushing movement (e.g., Push-ups, Dips, or Bench)',
            'Execute the movement with control',
            'Focus on the push intensity'
        ],
        tips: [
            'Keep your core engaged',
            'Full range of motion',
            'Control the descent'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'compound-pull',
        name: 'Compound Pull',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A multi-joint pulling movement targeting the back and arms.',
        steps: [
            'Setup for a compound pulling movement (e.g., Rows or Pull-ups)',
            'Pull with your elbows',
            'Maintain a flat back'
        ],
        tips: [
            'Squeeze your shoulder blades',
            'Don\'t use momentum',
            'Secure your grip'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'compound-leg',
        name: 'Compound Leg',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A multi-joint lower body movement.',
        steps: [
            'Setup for a compound leg exercise (e.g., Squats or Lunges)',
            'Establish a stable base',
            'Drive through your heels'
        ],
        tips: [
            'Keep your chest up',
            'Control the depth',
            'Maintain knee alignment'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'isolation-1',
        name: 'Isolation Exercise 1',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An isolation exercise focusing on a specific muscle group.',
        steps: [
            'Perform the isolation exercise for the target muscle',
            'Focus exclusively on the muscle contraction',
            'Control the weight throughout'
        ],
        tips: [
            'Minimize use of other muscles',
            'Focus on the mind-muscle connection',
            'Higher reps are usually better for isolation'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'isolation-2',
        name: 'Isolation Exercise 2',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'A secondary isolation exercise focusing on a specific muscle group.',
        steps: [
            'Perform the isolation exercise for the target muscle',
            'Focus exclusively on the muscle contraction',
            'Control the weight throughout'
        ],
        tips: [
            'Maintain a slow tempo',
            'Focus on the stretch and squeeze',
            'Breathe rhythmically'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'cardio-finisher',
        name: 'Cardio Finisher',
        category: 'cardio',
        muscleGroups: ['full_body'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'endurance',
        description: 'A final cardiovascular burst to maximize calorie burn and endurance.',
        steps: [
            'Perform the finisher activity with high intensity',
            'Maintain movement until the time is up',
            'Push your limits for the final stretch'
        ],
        tips: [
            'Stay focused on your breathing',
            'Keep your energy high',
            'Finish strong'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-barbell-movement',
        name: 'Primary Barbell Movement',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: ['barbell'],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your main barbell lift for the session, focusing on core strength development.',
        steps: [
            'Setup for the primary barbell movement',
            'Focus on stability and core engagement',
            'Exert maximum force under control'
        ],
        tips: [
            'Maintain strict form',
            'Prioritize safety',
            'Rest fully between sets'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'accessories--ml-selected-',
        name: 'Accessories (ML-Selected)',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'Supplemental movements selected by ML to balance your training volume.',
        steps: [
            'Perform the ML-recommended accessory movement',
            'Focus on isolation and quality reps',
            'Maintain a consistent tempo'
        ],
        tips: [
            'Don\'t rush through accessories',
            'Focus on the mind-muscle connection',
            'Adjust weight as needed for form'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-leg-exercise',
        name: 'Primary Leg Exercise',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'Your main lower body compound lift.',
        steps: [
            'Setup for your primary leg movement',
            'Establish a strong base',
            'Execute with power and control'
        ],
        tips: [
            'Maintain upright posture',
            'Control the depth',
            'Breath deeply'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'hamstring-isolation',
        name: 'Hamstring Isolation',
        category: 'strength',
        muscleGroups: ['hamstrings'],
        keypoints: [],
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'An isolation movement targeting the back of your legs.',
        steps: [
            'Focus exclusively on the hamstrings',
            'Perform the isolation with control',
            'Squeeze at the peak of the contraction'
        ],
        tips: [
            'Slow down the eccentric phase',
            'Avoid using momentum',
            'Maintain constant tension'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'quad-isolation',
        name: 'Quad Isolation',
        category: 'strength',
        muscleGroups: ['quadriceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'beginner',
        primaryGoal: 'hypertrophy',
        description: 'An isolation movement targeting the front of your legs.',
        steps: [
            'Focus exclusively on the quads',
            'Perform the isolation with control',
            'Squeeze at the peak'
        ],
        tips: [
            'Control the weight on the way down',
            'Avoid locking out aggressively',
            'Squeeze hard at the top'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'weak-point-exercise-1',
        name: 'Weak Point Exercise 1',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'hypertrophy',
        description: 'Focused work on a specific area identified for improvement.',
        steps: [
            'Target the specific weak point area',
            'Execute with perfect technique',
            'Prioritize the contraction'
        ],
        tips: [
            'Be very deliberate with these reps',
            'Lower the weight if form falters',
            'Focus and visualize the muscle working'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'supporting-exercise-1',
        name: 'Supporting Exercise 1',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'Work that supports and reinforces your main lifts.',
        steps: [
            'Perform the supporting movement with control',
            'Focus on stability and reinforcement',
            'Control the entire range of motion'
        ],
        tips: [
            'This builds the foundation for your big lifts',
            'Stay disciplined with your form',
            'Breathe rhythmically'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'secondary-compound',
        name: 'Secondary Compound',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'strength',
        description: 'A secondary mult-joint movement following your main lift.',
        steps: [
            'Setup for the secondary compound movement',
            'Maintain control and intent',
            'Execute with consistent tempo'
        ],
        tips: [
            'Complement your primary lift',
            'Focus on technical refinement',
            'Moderate to heavy load'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'hyperextensions',
        name: 'Hyperextensions',
        category: 'strength',
        muscleGroups: ['lower_back', 'glutes', 'hamstrings'],
        keypoints: [],
        equipment: ['machine'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'An exercise performed on a Roman chair or hyperextension bench to strengthen the lower back and posterior chain.',
        steps: [
            'Place your hips on the pad and secure your ankles',
            'Lower your torso while keeping your back flat',
            'Raise your torso until your body is in a straight line',
            'Avoid overextending at the top'
        ],
        tips: [
            'Maintain a neutral spine',
            'Squeeze your glutes at the top',
            'Keep movement slow and controlled'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'cable-rows',
        name: 'Cable Rows',
        category: 'strength',
        muscleGroups: ['back', 'biceps', 'shoulders'],
        keypoints: [],
        equipment: ['cable'],
        difficulty: 'beginner',
        primaryGoal: 'strength',
        description: 'A seated rowing exercise using a cable machine to target the back muscles.',
        steps: [
            'Sit at the machine with feet on the pads and knees slightly bent',
            'Grip the handle and pull it toward your stomach',
            'Squeeze your shoulder blades together',
            'Slowly return the weight to the starting position'
        ],
        tips: [
            'Keep your back straight and chest up',
            'Pull with your elbows',
            'Don\'t use your body to swing the weight'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-pull-compound',
        name: 'Primary Pull Compound',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your main heavy compound pulling movement for the session.',
        steps: [
            'Setup for your primary pulling movement',
            'Engage your core and back',
            'Pull with maximum efficiency and intent'
        ],
        tips: [
            'Maintain a strong grip',
            'Focus on the target muscles',
            'Maintain technical perfection'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'secondary-lower',
        name: 'Secondary Lower Body Movement',
        category: 'strength',
        muscleGroups: ['legs', 'glutes'],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'A secondary lower body movement to complement your main lift.',
        steps: [
            'Setup for the secondary lower body movement',
            'Maintain control and intensity',
            'Focus on the specific muscle groups'
        ],
        tips: [
            'Complement your primary training',
            'Maintain a slow and steady tempo',
            'Breathe rhythmically'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'secondary-movement',
        name: 'Secondary Movement',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'A secondary movement to support your main training focus.',
        steps: [
            'Perform the secondary movement with control',
            'Focus on technical focus and muscle feel',
            'Keep rest periods consistent'
        ],
        tips: [
            'Drive volume and hypertrophy',
            'Maintain a focused mind-muscle connection',
            'Listen to your body\'s fatigue levels'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'primary-lower--adjusted-by-hrv-',
        name: 'Primary Lower (HRV-Adjusted)',
        category: 'strength',
        muscleGroups: ['legs', 'glutes', 'core'],
        keypoints: [],
        equipment: [],
        difficulty: 'advanced',
        primaryGoal: 'strength',
        description: 'Your primary lower body movement, with volume adjusted based on your Heart Rate Variability (HRV).',
        steps: [
            'Assess your current energy and recovery based on HRV',
            'Setup for the primary lower body movement',
            'Execute with the intensity recommended by the AI'
        ],
        tips: [
            'Prioritize quality over load if feeling fatigued',
            'Maintain strict adherence to form',
            'The AI will adjust sets/reps dynamically'
        ],
        stages: [],
        formChecks: []
    },
    {
        id: 'hypertophy-isolation-1',
        name: 'Hypertophy Isolation 1',
        category: 'strength',
        muscleGroups: [],
        keypoints: [],
        equipment: [],
        difficulty: 'intermediate',
        primaryGoal: 'hypertrophy',
        description: 'An isolation movement targeting muscle growth in a specific area.',
        steps: [
            'Perform the isolation exercise with a focus on hypertrophy',
            'Keep the muscle under tension throughout the set',
            'Apply a slow eccentric phase'
        ],
        tips: [
            'Chasing the "pump" is okay here',
            'Maintain perfect control',
            'Go to near-failure if scheduled'
        ],
        stages: [],
        formChecks: []
    }
];

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
    if (!id) return undefined;
    const normalizedId = id.toLowerCase().trim().replace(/[-_]/g, ' ');
    const idWithDashes = id.toLowerCase().trim().replace(/\s+/g, '-');

    // 1. Direct ID match (dashes)
    let exercise = exercises.find(ex => ex.id === idWithDashes);
    if (exercise) return exercise;

    // 2. Direct Name match
    exercise = exercises.find(ex => ex.name.toLowerCase() === normalizedId);
    if (exercise) return exercise;

    // 3. Substring match (e.g. "leg-press" matches "leg-press-machine")
    exercise = exercises.find(ex =>
        ex.id.includes(idWithDashes) ||
        idWithDashes.includes(ex.id) ||
        ex.name.toLowerCase().includes(normalizedId) ||
        normalizedId.includes(ex.name.toLowerCase())
    );
    if (exercise) return exercise;

    // 4. Try singular/plural fallback
    const singularPath = idWithDashes.endsWith('s') ? idWithDashes.slice(0, -1) : idWithDashes;
    const pluralPath = idWithDashes.endsWith('s') ? idWithDashes : idWithDashes + 's';

    exercise = exercises.find(ex => ex.id === singularPath || ex.id === pluralPath);
    if (exercise) return exercise;

    return undefined;
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: 'strength' | 'cardio' | 'flexibility'): Exercise[] {
    return exercises.filter(ex => ex.category === category);
}
