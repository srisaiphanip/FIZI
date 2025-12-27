
import numpy as np

def calculate_angle(a, b, c):
    """
    Calculate the angle at point b given points a, b, and c.
    Points are landmarks with .x and .y attributes.
    """
    a = np.array([a.x, a.y]) # First point
    b = np.array([b.x, b.y]) # Mid point (vertex)
    c = np.array([c.x, c.y]) # End point
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

def get_exercise_angles(landmarks, exercise_id, min_confidence=0.3):
    """
    Calculate and return only the relevant angles for a specific exercise.
    Uses lower confidence threshold for better mobile compatibility.
    """
    angles = {}
    
    if not landmarks:
        return angles

    # Helper function to safely calculate angles
    def safe_angle(p1_idx, p2_idx, p3_idx, angle_name):
        """Calculate angle with confidence check"""
        try:
            # Check confidence for all three points
            if (landmarks[p1_idx].visibility > min_confidence and
                landmarks[p2_idx].visibility > min_confidence and
                landmarks[p3_idx].visibility > min_confidence):
                angle = calculate_angle(landmarks[p1_idx], landmarks[p2_idx], landmarks[p3_idx])
                angles[angle_name] = round(angle, 1)
                return True
            return False
        except Exception as e:
            print(f"⚠️  Error calculating {angle_name}: {e}")
            return False

    # Track if we got any angles at all
    angles_calculated = 0

    # LEFT ARM (Shoulder, Elbow, Wrist)
    if safe_angle(11, 13, 15, 'left_elbow'):
        angles_calculated += 1
    if safe_angle(13, 11, 23, 'left_shoulder'):
        angles_calculated += 1

    # RIGHT ARM
    if safe_angle(12, 14, 16, 'right_elbow'):
        angles_calculated += 1
    if safe_angle(14, 12, 24, 'right_shoulder'):
        angles_calculated += 1

    # LEFT LEG (Hip, Knee, Ankle)
    if safe_angle(23, 25, 27, 'left_knee'):
        angles_calculated += 1
    if safe_angle(11, 23, 25, 'left_hip'):
        angles_calculated += 1

    # RIGHT LEG
    if safe_angle(24, 26, 28, 'right_knee'):
        angles_calculated += 1
    if safe_angle(12, 24, 26, 'right_hip'):
        angles_calculated += 1

    # FALLBACK: If no angles were calculated (too strict filtering), try without confidence check
    if angles_calculated == 0:
        print("⚠️  No angles with confidence check, calculating without filtering...")
        try:
            angles['left_elbow'] = round(calculate_angle(landmarks[11], landmarks[13], landmarks[15]), 1)
            angles['right_elbow'] = round(calculate_angle(landmarks[12], landmarks[14], landmarks[16]), 1)
            angles['left_knee'] = round(calculate_angle(landmarks[23], landmarks[25], landmarks[27]), 1)
            angles['right_knee'] = round(calculate_angle(landmarks[24], landmarks[26], landmarks[28]), 1)
            angles['left_shoulder'] = round(calculate_angle(landmarks[13], landmarks[11], landmarks[23]), 1)
            angles['right_shoulder'] = round(calculate_angle(landmarks[14], landmarks[12], landmarks[24]), 1)
            angles['left_hip'] = round(calculate_angle(landmarks[11], landmarks[23], landmarks[25]), 1)
            angles['right_hip'] = round(calculate_angle(landmarks[12], landmarks[24], landmarks[26]), 1)
        except Exception as e:
            print(f"❌ Fallback angle calculation failed: {e}")

    return angles
