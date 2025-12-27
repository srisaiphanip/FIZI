import { Exercise, EquipmentItem, MuscleGroup } from '../types';

// =================================================================
// BODYWEIGHT ONLY EXERCISES (No Equipment Required)
// =================================================================

export const BODYWEIGHT_EXERCISES: Exercise[] = [
    {
        id: 'push-ups',
        name: 'pushup',
        displayName: 'Standard Push-up',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'arms' as any, 'core' as any],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [5, 6, 7, 8, 11, 12, 13, 14, 15, 16],
        formThresholds: { minAngle: 70, maxAngle: 90 },
        description: 'A fundamental upper body exercise targeting chest, shoulders, and triceps.',
        instructions: [
            'Start in a high plank position with hands slightly wider than shoulders',
            'Keep your body in a straight line from head to heels',
            'Lower your body until chest nearly touches floor',
            'Push back up to starting position'
        ],
        tips: [
            'Keep neck neutral',
            'Engage glutes',
            'Breathe out on the push'
        ],
        commonMistakes: ['Sagging hips', 'Flaring elbows too wide', 'Not going deep enough'],
        caloriesPerRep: 0.5,
        progressionPath: ['bw-pushup-wide', 'bw-pushup-diamond'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/pushups-thumb.jpg',
        demonstrationVideo: 'https://videos.fizi.ai/exercises/pushups.mp4',
        stages: [
            { name: 'down', angleRanges: [{ joint: 'left_elbow', min: 60, max: 90, optimal: 75 }, { joint: 'right_elbow', min: 60, max: 90, optimal: 75 }] },
            { name: 'up', angleRanges: [{ joint: 'left_elbow', min: 160, max: 180, optimal: 170 }, { joint: 'right_elbow', min: 160, max: 180, optimal: 170 }] }
        ],
        formChecks: [
            {
                name: 'body_alignment',
                description: 'Keep body straight from shoulders to ankles',
                severity: 'error',
                checkFunction: (pose: any) => true,
                feedback: { visual: 'Keep your body straight', audio: 'Straighten your back and core' }
            }
        ]
    },
    {
        id: 'squats',
        name: 'squat',
        displayName: 'Bodyweight Squat',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 15,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        formThresholds: { minAngle: 80, maxAngle: 100 },
        description: 'Fundamental lower body movement building leg and glute strength.',
        instructions: [
            'Stand with feet shoulder-width apart',
            'Lower by bending knees and hips',
            'Keep chest up and back straight',
            'Go down until thighs parallel to ground',
            'Push through heels to retornar'
        ],
        commonMistakes: ['Knees caving inward', 'Heels lifting', 'Leaning far forward'],
        tips: ['Keep weight on heels', 'Push knees out', 'Look straight ahead'],
        caloriesPerRep: 0.4,
        thumbnailUrl: 'https://images.fizi.ai/exercises/squats-thumb.jpg',
        stages: [
            { name: 'down', angleRanges: [{ joint: 'left_knee', min: 60, max: 90, optimal: 80 }, { joint: 'right_knee', min: 60, max: 90, optimal: 80 }] },
            { name: 'up', angleRanges: [{ joint: 'left_knee', min: 160, max: 180, optimal: 170 }, { joint: 'right_knee', min: 160, max: 180, optimal: 170 }] }
        ],
        formChecks: []
    },
    {
        id: 'plank',
        name: 'plank',
        displayName: 'Forearm Plank',
        category: 'strength',
        muscleGroups: ['core'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        optionalEquipment: ['yoga_mat'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 30,
        baseSets: 3,
        repIncrement: 10,
        setIncrement: 1,
        keypoints: [5, 6, 11, 12, 15, 16],
        formThresholds: {},
        description: 'Core stability exercise',
        instructions: [
            'Rest on forearms and toes',
            'Keep body in straight line from head to heels',
            'Engage core and glutes',
            'Hold position without sagging'
        ],
        commonMistakes: ['Hips sagging', 'Hips too high', 'Not engaging core'],
        tips: ['Squeeze glutes', 'Keep neck neutral', 'Breathe steadily'],
        caloriesPerRep: 0.1,
        thumbnailUrl: 'https://images.fizi.ai/exercises/plank-thumb.jpg',
        stages: [{ name: 'hold', angleRanges: [{ joint: 'left_shoulder', min: 80, max: 100, optimal: 90 }], duration: 30 }],
        formChecks: []
    },
    {
        id: 'lunges',
        name: 'lunge',
        displayName: 'Forward Lunge',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'bodyweight',
        requiredEquipment: [],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
        formThresholds: { targetAngle: 90 },
        description: 'Unilateral leg strength builder',
        instructions: [
            'Step forward with one leg',
            'Lower hips until both knees at 90 degrees',
            'Front knee should be over ankle',
            'Push back to starting position'
        ],
        commonMistakes: ['Front knee past toes', 'Leaning forward', 'Not deep enough'],
        tips: ['Keep torso upright', 'Step far enough forward', 'Control the descent'],
        caloriesPerRep: 0.5,
        thumbnailUrl: 'https://images.fizi.ai/exercises/lunges-thumb.jpg',
        stages: [
            { name: 'down', angleRanges: [{ joint: 'left_knee', min: 80, max: 100, optimal: 90 }, { joint: 'right_knee', min: 80, max: 100, optimal: 90 }] },
            { name: 'up', angleRanges: [{ joint: 'left_knee', min: 160, max: 180, optimal: 170 }, { joint: 'right_knee', min: 160, max: 180, optimal: 170 }] }
        ],
        formChecks: []
    }
];

// =================================================================
// DUMBBELL EXERCISES
// =================================================================

export const DUMBBELL_EXERCISES: Exercise[] = [
    {
        id: 'bicep-curls',
        name: 'bicep_curl',
        displayName: 'Dumbbell Bicep Curl',
        category: 'strength',
        muscleGroups: ['arms'],
        equipmentRequired: 'home',
        requiredEquipment: ['dumbbells'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [13, 14, 15, 16],
        formThresholds: { targetAngle: 45 },
        description: 'Isolated bicep builder',
        instructions: [
            'Stand with dumbbells at sides',
            'Keep elbows stationary at sides',
            'Curl weights up to shoulders',
            'Squeeze at top, lower with control'
        ],
        commonMistakes: ['Swinging weights', 'Moving elbows', 'Using momentum'],
        tips: ['Keep elbows pinned', 'Focus on squeeze', 'Control eccentric'],
        caloriesPerRep: 0.4,
        thumbnailUrl: 'https://images.fizi.ai/exercises/bicep-curls-thumb.jpg',
        stages: [
            { name: 'up', angleRanges: [{ joint: 'left_elbow', min: 30, max: 50, optimal: 40 }, { joint: 'right_elbow', min: 30, max: 50, optimal: 40 }] },
            { name: 'down', angleRanges: [{ joint: 'left_elbow', min: 160, max: 180, optimal: 170 }, { joint: 'right_elbow', min: 160, max: 180, optimal: 170 }] }
        ],
        formChecks: []
    },
    {
        id: 'db_shoulder_press',
        name: 'shoulder_press',
        displayName: 'Dumbbell Shoulder Press',
        category: 'strength',
        muscleGroups: ['shoulders', 'arms'],
        equipmentRequired: 'home',
        requiredEquipment: ['dumbbells'],
        optionalEquipment: ['bench'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 15, 16],
        formThresholds: {},
        description: 'Overhead pressing for shoulders',
        instructions: [
            'Start with dumbbells at shoulder height',
            'Press weights overhead until arms extended',
            'Lower with control back to shoulders'
        ],
        commonMistakes: ['Arching back', 'Not full extension', 'Using legs'],
        tips: ['Keep core tight', 'Press slightly back', 'Full lockout'],
        caloriesPerRep: 0.6,
        thumbnailUrl: 'https://images.fizi.ai/exercises/db-press-thumb.jpg',
        stages: [{ name: 'press', angleRanges: [{ joint: 'left_shoulder', min: 160, max: 180, optimal: 170 }] }],
        formChecks: []
    }
];

// =================================================================
// RESISTANCE BAND EXERCISES
// =================================================================

export const RESISTANCE_BAND_EXERCISES: Exercise[] = [
    {
        id: 'rb_row',
        name: 'row',
        displayName: 'Resistance Band Row',
        category: 'strength',
        muscleGroups: ['back'],
        equipmentRequired: 'home',
        requiredEquipment: ['resistance_bands'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 15,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14],
        description: 'Back thickness with constant tension',
        instructions: [
            'Anchor band at chest height',
            'Pull handles to sides of torso',
            'Squeeze shoulder blades together',
            'Control return maintaining tension'
        ],
        tips: ['Think elbows back', 'Pause at contraction', 'Keep chest up'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/rb-row-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'rb_chest_press',
        name: 'chest_press',
        displayName: 'Resistance Band Chest Press',
        category: 'strength',
        muscleGroups: ['chest', 'arms'],
        equipmentRequired: 'home',
        requiredEquipment: ['resistance_bands'],
        unlockLevel: 2,
        difficulty: 'beginner',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14],
        description: 'Chest pressing with bands',
        instructions: [
            'Anchor band behind back',
            'Press handles forward',
            'Fully extend arms',
            'Control return'
        ],
        tips: ['Keep tension throughout', 'Squeeze chest', 'Control eccentric'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/rb-press-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// PULL-UP BAR EXERCISES
// =================================================================

export const PULLUP_BAR_EXERCISES: Exercise[] = [
    {
        id: 'pb_pullup_standard',
        name: 'pullup',
        displayName: 'Standard Pull-up',
        category: 'strength',
        muscleGroups: ['back', 'arms'],
        equipmentRequired: 'home',
        requiredEquipment: ['pull_up_bar'],
        unlockLevel: 4,
        difficulty: 'intermediate',
        baseReps: 6,
        baseSets: 3,
        repIncrement: 1,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14],
        description: 'Classic back builder',
        instructions: [
            'Hang from bar, hands shoulder-width',
            'Pull up until chin over bar',
            'Lower with control to full hang'
        ],
        tips: ['Dead hang at bottom', 'Lead with chest', 'Squeeze lats'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/pullups-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// KETTLEBELL EXERCISES
// =================================================================

export const KETTLEBELL_EXERCISES: Exercise[] = [
    {
        id: 'kb_swing',
        name: 'swing',
        displayName: 'Kettlebell Swing',
        category: 'strength',
        muscleGroups: ['legs', 'back', 'core'],
        equipmentRequired: 'home',
        requiredEquipment: ['kettlebells'],
        unlockLevel: 2,
        difficulty: 'intermediate',
        baseReps: 15,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [23, 24, 11, 12],
        description: 'Explosive hip hinge movement',
        instructions: [
            'Hinge at hips with kettlebell',
            'Explosive hip drive swings bell up',
            'Let momentum carry to chest height',
            'Control descent into next rep'
        ],
        tips: ['Hip snap is key', 'Arms are ropes', 'Plank at top'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/kb-swing-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'kb_snatch',
        name: 'snatch',
        displayName: 'Kettlebell Snatch',
        category: 'strength',
        muscleGroups: ['fullbody', 'shoulders'],
        equipmentRequired: 'home',
        requiredEquipment: ['kettlebells'],
        unlockLevel: 6,
        difficulty: 'advanced',
        baseReps: 8,
        baseSets: 3,
        repIncrement: 1,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 23, 24],
        description: 'Explosive overhead movement',
        instructions: [
            'Start like swing',
            'Explosive hip drive',
            'Pull bell overhead in one motion',
            'Punch through at top'
        ],
        tips: ['Hip power', 'Fast under bell', 'Soft catch overhead'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/kb-snatch-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// BARBELL EXERCISES
// =================================================================

export const BARBELL_EXERCISES: Exercise[] = [
    {
        id: 'bb_squat',
        name: 'squat',
        displayName: 'Barbell Back Squat',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'gym',
        requiredEquipment: ['barbell', 'squat_rack'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 8,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [23, 24, 25, 26, 11, 12],
        description: 'King of leg exercises',
        instructions: [
            'Bar on upper back/traps',
            'Unrack and step back',
            'Squat to parallel or below',
            'Drive through heels to stand'
        ],
        tips: ['Break at knees and hips together', 'Big breath and brace', 'Push knees out'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/bb-squat-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'bb_bench_press',
        name: 'bench_press',
        displayName: 'Barbell Bench Press',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'arms'],
        equipmentRequired: 'gym',
        requiredEquipment: ['barbell', 'bench'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 8,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14, 15, 16],
        description: 'Primary chest developer',
        instructions: [
            'Lie on bench, feet flat',
            'Grip slightly wider than shoulders',
            'Lower bar to mid-chest',
            'Press to lockout'
        ],
        tips: ['Leg drive', 'Touch and press', 'Control eccentric'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/bb-bench-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// CABLE MACHINE EXERCISES
// =================================================================

export const CABLE_EXERCISES: Exercise[] = [
    {
        id: 'cable_lat_pulldown',
        name: 'pulldown',
        displayName: 'Lat Pulldown',
        category: 'strength',
        muscleGroups: ['back', 'arms'],
        equipmentRequired: 'gym',
        requiredEquipment: ['cable_machine'],
        unlockLevel: 2,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [11, 12, 13, 14],
        description: 'Vertical pulling for lats',
        instructions: [
            'Wide grip on bar',
            'Pull down to upper chest',
            'Squeeze shoulder blades down',
            'Control return'
        ],
        tips: ['Lead with elbows', 'Chest up', 'Slow eccentric'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/cable-pulldown-thumb.jpg',
        stages: [],
        formChecks: []
    },
    {
        id: 'cable_tricep_pushdown',
        name: 'tricep_pushdown',
        displayName: 'Cable Tricep Pushdown',
        category: 'strength',
        muscleGroups: ['arms'],
        equipmentRequired: 'gym',
        requiredEquipment: ['cable_machine'],
        unlockLevel: 2,
        difficulty: 'beginner',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [13, 14, 15, 16],
        description: 'Tricep isolation',
        instructions: [
            'Stand facing cable machine',
            'Elbows pinned at sides',
            'Push bar down to full extension',
            'Control return'
        ],
        tips: ['Keep elbows stationary', 'Full extension', 'Squeeze triceps'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/cable-tricep-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// LEG PRESS MACHINE EXERCISES
// =================================================================

export const LEG_MACHINE_EXERCISES: Exercise[] = [
    {
        id: 'machine_leg_press',
        name: 'leg_press',
        displayName: 'Leg Press',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'gym',
        requiredEquipment: ['leg_press_machine'],
        unlockLevel: 2,
        difficulty: 'beginner',
        baseReps: 12,
        baseSets: 3,
        repIncrement: 3,
        setIncrement: 1,
        keypoints: [23, 24, 25, 26],
        description: 'Quad-focused leg builder',
        instructions: [
            'Place feet shoulder-width on platform',
            'Lower weight with control',
            'Stop before lower back lifts',
            'Press through full foot'
        ],
        tips: ['Keep lower back down', 'Full range', 'Control the weight'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/leg-press-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// SMITH MACHINE EXERCISES
// =================================================================

export const SMITH_MACHINE_EXERCISES: Exercise[] = [
    {
        id: 'smith_squat',
        name: 'squat',
        displayName: 'Smith Machine Squat',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'gym',
        requiredEquipment: ['smith_machine'],
        unlockLevel: 1,
        difficulty: 'beginner',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [23, 24, 25, 26],
        description: 'Guided squat movement',
        instructions: [
            'Bar on upper back',
            'Feet slightly forward',
            'Squat down guided by rails',
            'Drive up to start'
        ],
        tips: ['Feet forward for balance', 'Use safety catches', 'Control movement'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/smith-squat-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// =================================================================
// BENCH EXERCISES
// =================================================================

export const BENCH_EXERCISES: Exercise[] = [
    {
        id: 'bench_bulgarian_split_squat',
        name: 'split_squat',
        displayName: 'Bulgarian Split Squat',
        category: 'strength',
        muscleGroups: ['legs'],
        equipmentRequired: 'home',
        requiredEquipment: ['bench'],
        optionalEquipment: ['dumbbells'],
        unlockLevel: 4,
        difficulty: 'intermediate',
        baseReps: 10,
        baseSets: 3,
        repIncrement: 2,
        setIncrement: 1,
        keypoints: [23, 24, 25, 26],
        description: 'Single-leg strength builder',
        instructions: [
            'Place rear foot on bench',
            'Lower into split squat',
            'Front knee tracks over toes',
            'Drive through front heel'
        ],
        tips: ['Long stance', 'Torso upright', 'Control descent'],
        thumbnailUrl: 'https://images.fizi.ai/exercises/bulgarian-split-thumb.jpg',
        stages: [],
        formChecks: []
    }
];

// Combine all for main exports
export const exercises: Exercise[] = [
    ...BODYWEIGHT_EXERCISES,
    ...DUMBBELL_EXERCISES,
    ...RESISTANCE_BAND_EXERCISES,
    ...PULLUP_BAR_EXERCISES,
    ...KETTLEBELL_EXERCISES,
    ...BARBELL_EXERCISES,
    ...CABLE_EXERCISES,
    ...LEG_MACHINE_EXERCISES,
    ...SMITH_MACHINE_EXERCISES,
    ...BENCH_EXERCISES
];

export function getExerciseById(id: string): Exercise | undefined {
    return exercises.find(ex => ex.id === id);
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
    return exercises.filter(ex => (ex.muscleGroups as string[]).includes(muscleGroup));
}

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
    return exercises.filter(ex => ex.category === category);
}

export default exercises;
