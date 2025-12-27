
from exercise_configs import EXERCISE_CONFIGS

def validate_form(exercise_id, landmarks, angles):
    """
    Validate exercise form and return specific feedback messages.
    Returns a list of string feedback messages.
    """
    feedback = []
    
    if not landmarks or not angles:
        return feedback
    
    # === BICEP CURLS ===
    if exercise_id == 'bicep-curls':
        # Check 1: Elbow stability (elbows should stay at sides, not swing forward)
        left_elbow = landmarks[13]
        left_shoulder = landmarks[11]
        
        if left_elbow.visibility > 0.5 and left_shoulder.visibility > 0.5:
            # Elbow should be relatively aligned vertically with shoulder
            elbow_drift = abs(left_elbow.x - left_shoulder.x)
            if elbow_drift > 0.22:  
                feedback.append("Keep your elbows fixed at your sides")
    
    # === PUSH-UPS ===
    elif exercise_id == 'push-ups':
        # Check 1: Body alignment (shoulders-hips-ankles should be straight)
        if (landmarks[11].visibility > 0.6 and
            landmarks[23].visibility > 0.6 and
            landmarks[27].visibility > 0.6):
            
            shoulder = landmarks[11]
            hip = landmarks[23]
            ankle = landmarks[27]
            
            # hip should be between shoulder and ankle (not sagging or piking)
            expected_hip_y = (shoulder.y + ankle.y) / 2
            hip_deviation = abs(hip.y - expected_hip_y)
            
            if hip_deviation > 0.14:  
                if hip.y > expected_hip_y:
                    feedback.append("Engage your core - hips are sagging")
                else:
                    feedback.append("Lower your hips - don't pike up")
    
    # === SQUATS ===
    elif exercise_id == 'squats':
        # Check 1: Depth (knees should reach at least 90 degrees)
        left_knee_angle = angles.get('left_knee', 180)
        if left_knee_angle > 100 and left_knee_angle < 160:
            feedback.append("Go deeper - thighs should be parallel to ground")
        
        # Check 2: Knee alignment (knees shouldn't cave inward)
        if (landmarks[25].visibility > 0.6 and
            landmarks[26].visibility > 0.6):
            left_knee_x = landmarks[25].x
            right_knee_x = landmarks[26].x
            knee_width = abs(left_knee_x - right_knee_x)
            
            # Also check hips
            if landmarks[23].visibility > 0.6 and landmarks[24].visibility > 0.6:
                left_hip_x = landmarks[23].x
                right_hip_x = landmarks[24].x
                hip_width = abs(left_hip_x - right_hip_x)
                
                if knee_width < (hip_width * 0.7):  # Knees caving in
                    feedback.append("Push knees out - don't let them cave inward")
    
    # === PLANK ===
    elif exercise_id == 'plank':
        # Check: Hip alignment
        if (landmarks[11].visibility > 0.6 and
            landmarks[23].visibility > 0.6 and
            landmarks[27].visibility > 0.6):
            
            shoulder_y = landmarks[11].y
            hip_y = landmarks[23].y
            ankle_y = landmarks[27].y
            
            expected_hip_y = (shoulder_y + ankle_y) / 2
            deviation = abs(hip_y - expected_hip_y)
            
            if deviation > 0.08:
                if hip_y > expected_hip_y:
                    feedback.append("Lift your hips - engage your core")
                else:
                    feedback.append("Lower your hips slightly")
    
    # === SHOULDER PRESS ===
    elif exercise_id == 'shoulder-press':
        pass # Posture checks only - ROM handled by counter
    
    # === LUNGES ===
    elif exercise_id == 'lunges':
        # Check torso
        inclination = angles.get('torso_inclination', 0)
        if inclination > 35:
            feedback.append("Keep your chest up - don't lean forward")
        else:
            # If in 'down' phase but not deep enough
            # We can't easily know phase without state, but if both are straightish it's 'up'.
            pass

    # === JUMPING JACKS ===
    elif exercise_id == 'jumping-jacks':
        # Check arm symmetry
        left = angles.get('left_shoulder', 0)
        right = angles.get('right_shoulder', 0)
        if abs(left - right) > 40:
            feedback.append("Move arms symmetrically")
        
    # === DUMBBELL ROWS ===
    elif exercise_id == 'dumbbell-rows':
        # Check if bent over
        inclination = angles.get('torso_inclination', 0)
        if inclination < 35:
             feedback.append("Bend over more - keep your back flat")
             
    # === MOUNTAIN CLIMBERS ===
    elif exercise_id == 'mountain-climbers':
        inclination = angles.get('torso_inclination', 90)
        if inclination < 50:
            feedback.append("Lower your hips - maintain a plank position")

    # === BURPEES ===
    elif exercise_id == 'burpees':
        # Simple stability check during plank phase
        left_elbow = angles.get('left_elbow', 0)
        if left_elbow > 160: 
             inclination = angles.get('torso_inclination', 0)
             if inclination > 40 and inclination < 70:
                 feedback.append("Keep your core engaged during the plank")
    
    return feedback
