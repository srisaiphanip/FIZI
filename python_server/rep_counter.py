
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
            'previous_stage': None,
            'last_transition_time': 0,
            'exercise_id': exercise_id
        }

    def update(self, exercise_id, angles):
        # Initialize exercise_id if this is the first call
        if self.state['exercise_id'] is None:
            self.state['exercise_id'] = exercise_id
            print(f"🎬 Starting session with: {exercise_id}")
        
        # Log if exercise_id changes but DON'T auto-reset
        if self.state['exercise_id'] != exercise_id:
            print(f"⚠️  Exercise changed: {self.state['exercise_id']} → {exercise_id}")
            print(f"   Keeping count at: {self.state['count']} (continuous counting)")
            # Update to new exercise but keep count
            self.state['exercise_id'] = exercise_id
            # Reset stage info for the new exercise
            self.state['current_stage'] = None
            self.state['previous_stage'] = None
            
        config = EXERCISE_CONFIGS.get(exercise_id)
        if not config or not angles:
            return self.state

        stages = config['stages']
        best_stage = None
        max_score = -1.0

        # === STAGE DETECTION (Fuzzy Matching) ===
        for stage in stages:
            score = 0
            count = 0
            
            # Special logic for exercises that can be single-arm
            can_be_single_arm = exercise_id in ['bicep-curls', 'dumbbell-rows', 'lateral-raises', 'hammer-curls']
            
            for joint, (min_angle, max_angle) in stage['ranges'].items():
                if joint in angles:
                    angle = angles[joint]
                    center = (min_angle + max_angle) / 2
                    diff = abs(angle - center)
                    # Score based on proximity to center (100 is perfect)
                    joint_score = max(0, 100 - diff)
                    
                    if can_be_single_arm:
                        # For single arm, we take the BEST score of available joints
                        score = max(score, joint_score)
                    else:
                        score += joint_score
                    count += 1
            
            if count > 0:
                final_score = score if can_be_single_arm else (score / count)
                if final_score > max_score and final_score > 40:  # Threshold
                    max_score = final_score
                    best_stage = stage['name']

        # === REP COUNTING - SIMPLE CYCLE LOGIC ===
        current_time = time.time()
        debounce_time = 0.5  # Minimum time between stage transitions
        
        # Only process if we have a valid stage and enough time has passed
        if best_stage and (current_time - self.state['last_transition_time'] >= debounce_time):
            prev_stage = self.state['current_stage']
            
            # Stage changed - this is a transition
            if best_stage != prev_stage and prev_stage is not None:
                self.state['last_transition_time'] = current_time
                
                # SIMPLE RULE: For 2-stage exercises, count when returning to FIRST stage
                # E.g., bicep curls ['up', 'down']: up→down→UP ← count here
                # E.g., push-ups ['down', 'up']: down→up→DOWN ← count here
                if len(stages) >= 2:
                    first_stage = stages[0]['name']   # The "rest" position
                    second_stage = stages[1]['name']  # The "active" position
                    
                    # Count a rep when: we were at second stage AND now at first stage
                    # This means we completed: first → second → first (full cycle)
                    if prev_stage == second_stage and best_stage == first_stage:
                        self.state['count'] += 1
                        print(f"✅ REP #{self.state['count']}! {exercise_id}: {second_stage}→{first_stage}")
                        print(f"   Confidence: {max_score:.1f}/100")
                    else:
                        print(f"📊 Stage: {prev_stage}→{best_stage} (count: {self.state['count']})")
                
                # Update previous stage
                self.state['previous_stage'] = prev_stage
            
            # Update current stage
            self.state['current_stage'] = best_stage
        
        return self.state

# Global singleton for simplicity in local dev
rep_counter = RepCounter()
