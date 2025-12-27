
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
            if elbow_drift > 0.15:  # More than 15% screen width
                feedback.append("Keep your elbows fixed at your sides")
        
        # Check 2: Full range of motion
        left_elbow_angle = angles.get('left_elbow', 0)
        right_elbow_angle = angles.get('right_elbow', 0)
        
        if left_elbow_angle > 0 and left_elbow_angle < 160:
            if max(left_elbow_angle, right_elbow_angle) > 150:
                pass  # Good - arm is extended
            elif min(left_elbow_angle, right_elbow_angle) < 100:
                pass  # Good - arm is curled
            else:
                feedback.append("Use full range of motion")
    
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
            
            if hip_deviation > 0.1:  # 10% of screen height
                if hip.y > expected_hip_y:
                    feedback.append("Engage your core - hips are sagging")
                else:
                    feedback.append("Lower your hips - don't pike up")
        
        # Check 2: Elbow depth
        left_elbow_angle = angles.get('left_elbow', 180)
        if left_elbow_angle > 100:
            feedback.append("Go deeper - bend elbows to 90 degrees")
    
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
        left_elbow = angles.get('left_elbow', 0)
        if left_elbow > 0 and left_elbow < 160:
            if left_elbow < 100:
                feedback.append("Lower the weights more at the bottom")
    
    # === LUNGES ===
    elif exercise_id == 'lunges':
        left_knee = angles.get('left_knee', 180)
        if left_knee < 160 and left_knee > 110:
            feedback.append("Go lower - front thigh should be parallel")
    
    return feedback
