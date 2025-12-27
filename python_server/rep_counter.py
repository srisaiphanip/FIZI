
from exercise_configs import EXERCISE_CONFIGS
import time

class RepCounter:
    def __init__(self):
        self.state = {
            'count': 0,
            'current_stage': None,
            'previous_stage': None,
            'last_transition_time': 0,
            'exercise_id': None
        }

    def reset(self, exercise_id):
        print(f"🔄 Resetting rep counter for: {exercise_id}")
        self.state = {
            'count': 0,
            'current_stage': None,
            'active_hit': False, 
            'good_frames': 0, # Frames with valid form since start of rep
            'total_frames': 0, # Total frames since start of rep
            'last_transition_time': 0,
            'exercise_id': exercise_id,
            'rejection_reason': None # Reason why the last rep attempt was rejected
        }

    def update(self, exercise_id, angles, form_is_valid=True):
        # Only reset if the exercise ID actually changed to a NEW valid exercise
        if exercise_id and self.state['exercise_id'] != exercise_id:
            self.reset(exercise_id)
            
        config = EXERCISE_CONFIGS.get(exercise_id)
        if not config or not angles:
            return self.state

        stages = config['stages']
        if len(stages) < 2: return self.state # Needs at least 2 stages to count

        rest_stage = stages[0]['name']
        active_stage = stages[1]['name']
        
        best_stage = None
        max_score = -1.0

        # === 1. Permissive Joint Scoring ===
        for stage in stages:
            mandatory_scores = []
            limb_scores = [] # For left/right pairs
            
            for joint, (min_angle, max_angle) in stage['ranges'].items():
                if joint in angles:
                    angle = angles[joint]
                    if min_angle <= angle <= max_angle:
                        score = 100
                    else:
                        center = (min_angle + max_angle) / 2
                        span = (max_angle - min_angle)
                        diff = abs(angle - center) - span/2
                        score = max(0, 100 - (diff * 2))
                    
                    if 'left' in joint or 'right' in joint:
                        limb_scores.append(score)
                    else:
                        mandatory_scores.append(score)
            
            m_avg = sum(mandatory_scores)/len(mandatory_scores) if mandatory_scores else 100
            l_max = max(limb_scores) if limb_scores else 100
            
            final_score = (m_avg + l_max) / 2
            if final_score > max_score and final_score > 20: 
                max_score = final_score
                best_stage = stage['name']

        # === 2. Robust State Machine ===
        current_time = time.time()
        debounce_time = 0.15 
        
        # Track frame quality throughout the entire rep cycle
        if self.state['active_hit']:
            self.state['total_frames'] += 1
            if form_is_valid:
                self.state['good_frames'] += 1

        self.state['rejection_reason'] = None # Clear on every frame unless just completed

        if best_stage and (current_time - self.state['last_transition_time'] >= debounce_time):
            # A. Record hitting the "Active" stage
            if best_stage == active_stage and not self.state['active_hit']:
                self.state['active_hit'] = True
                self.state['good_frames'] = 1 if form_is_valid else 0
                self.state['total_frames'] = 1
                self.state['last_transition_time'] = current_time
                print(f"🔥 ACTIVE HIT: {exercise_id} ({max_score:.1f}%)")
            
            # B. Record returning to "Rest" stage -> COMPLETE REP
            elif best_stage == rest_stage and self.state['active_hit']:
                # Quality Ratio check: Require > 80% good form frames for "PERFECT" count
                quality_ratio = self.state['good_frames'] / self.state['total_frames'] if self.state['total_frames'] > 0 else 0
                
                if quality_ratio >= 0.8:
                    self.state['count'] += 1
                    print(f"\n🌟 PERFECT REP #{self.state['count']}! | Quality Score: {quality_ratio:.1%}")
                else:
                    self.state['rejection_reason'] = f"Rep rejected ({quality_ratio:.0%}). Maintain form throughout the MOVE."
                    print(f"\n❌ REP REJECTED! | Quality: {quality_ratio:.1%} (Below 80% bar)")
                
                self.state['active_hit'] = False 
                self.state['good_frames'] = 0
                self.state['total_frames'] = 0
                self.state['last_transition_time'] = current_time
            
            self.state['current_stage'] = best_stage
            self.state['score'] = max_score

        return self.state

# Global singleton for simplicity in local dev
rep_counter = RepCounter()
