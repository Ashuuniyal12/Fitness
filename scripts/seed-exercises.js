/**
 * Seed Script: Populate Exercise Library
 * ─────────────────────────────────────────────────────────────────────────────
 * Downloads ~800 exercises from free-exercise-db (public domain) and maps them
 * to Maximus's 19-category taxonomy, then adds ~90 hand-curated exercises for
 * Yoga, Zumba, Pilates, HIIT, Stretching, and Rehabilitation.
 *
 * Run:
 *   DATABASE_URL="..." DIRECT_URL="..." node scripts/seed-exercises.js
 *   (or copy .env values into a .env file and run with dotenv-cli)
 *
 * Safe to re-run — uses upsert on (name, muscleGroup).
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });

const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// ─── TAXONOMY ────────────────────────────────────────────────────────────────
// Our 19 categories and their valid subcategories
const TAXONOMY = {
  'Chest':               ['Upper Chest', 'Middle Chest', 'Lower Chest'],
  'Back':                ['Upper Back', 'Middle Back', 'Lower Back', 'Lats', 'Traps'],
  'Shoulders':           ['Front Delts', 'Side Delts', 'Rear Delts'],
  'Biceps':              ['Long Head', 'Short Head', 'Brachialis'],
  'Triceps':             ['Long Head', 'Lateral Head', 'Medial Head'],
  'Legs':                ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors'],
  'Core':                ['Upper Abs', 'Lower Abs', 'Obliques', 'Transverse Abdominis'],
  'Forearms':            ['Wrist Flexors', 'Wrist Extensors', 'Grip'],
  'Neck':                ['Front Neck', 'Rear Neck'],
  'Full Body':           ['Push', 'Pull', 'Legs', 'Compound', 'Functional'],
  'Cardio':              ['Running', 'Walking', 'Cycling', 'Rowing', 'Elliptical', 'Stair Climber', 'Jump Rope', 'HIIT'],
  'Functional Training': ['Balance', 'Agility', 'Coordination', 'Mobility', 'Stability'],
  'Yoga':                ['Beginner', 'Intermediate', 'Advanced', 'Power Yoga', 'Hatha Yoga', 'Vinyasa Yoga', 'Ashtanga Yoga', 'Yin Yoga', 'Meditation', 'Pranayama'],
  'Zumba':               ['Beginner', 'Intermediate', 'Advanced', 'Aqua Zumba', 'Strong Nation'],
  'CrossFit':            ['Strength', 'MetCon', 'Gymnastics', 'Olympic Lifting', 'Endurance'],
  'HIIT':                ['Beginner', 'Intermediate', 'Advanced', 'Tabata', 'EMOM', 'AMRAP'],
  'Pilates':             ['Mat Pilates', 'Reformer Pilates', 'Core Pilates'],
  'Stretching':          ['Dynamic Stretching', 'Static Stretching', 'Mobility', 'Recovery'],
  'Rehabilitation':      ['Knee Rehab', 'Shoulder Rehab', 'Back Rehab', 'Posture Correction', 'Injury Recovery'],
};

// ─── LEVEL MAP ───────────────────────────────────────────────────────────────
const LEVEL_MAP = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };

// ─── FREE-EXERCISE-DB → OUR CATEGORY MAPPER ──────────────────────────────────
function mapExercise(ex) {
  const name   = ex.name.toLowerCase();
  const prims  = (ex.primaryMuscles  || []).map(m => m.toLowerCase());
  const secs   = (ex.secondaryMuscles|| []).map(m => m.toLowerCase());
  const cat    = (ex.category || '').toLowerCase();

  // ── CHEST ──────────────────────────────────────────────────────────────────
  if (prims.includes('chest')) {
    let sub = 'Middle Chest';
    if (/incline|upper/.test(name))  sub = 'Upper Chest';
    else if (/decline|lower/.test(name)) sub = 'Lower Chest';
    return { category: 'Chest', subcategory: sub };
  }

  // ── BACK ───────────────────────────────────────────────────────────────────
  if (prims.includes('lats'))        return { category: 'Back', subcategory: 'Lats' };
  if (prims.includes('upper back'))  return { category: 'Back', subcategory: 'Upper Back' };
  if (prims.includes('middle back')) return { category: 'Back', subcategory: 'Middle Back' };
  if (prims.includes('lower back'))  return { category: 'Back', subcategory: 'Lower Back' };
  if (prims.includes('traps'))       return { category: 'Back', subcategory: 'Traps' };
  // secondary back catches
  if (!prims.length && (secs.includes('lats') || secs.includes('middle back')))
    return { category: 'Back', subcategory: 'Middle Back' };

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  if (prims.includes('shoulders')) {
    let sub = 'Front Delts';
    if (/lateral|side|uation/.test(name))           sub = 'Side Delts';
    else if (/rear|posterior|reverse|bent.?over/.test(name)) sub = 'Rear Delts';
    return { category: 'Shoulders', subcategory: sub };
  }

  // ── BICEPS ─────────────────────────────────────────────────────────────────
  if (prims.includes('biceps')) {
    let sub = 'Long Head';
    if (/hammer|brachialis/.test(name)) sub = 'Brachialis';
    else if (/concentrate|inner|short/.test(name)) sub = 'Short Head';
    return { category: 'Biceps', subcategory: sub };
  }

  // ── TRICEPS ────────────────────────────────────────────────────────────────
  if (prims.includes('triceps')) {
    let sub = 'Long Head';
    if (/kickback|lateral/.test(name)) sub = 'Lateral Head';
    else if (/reverse|medial/.test(name)) sub = 'Medial Head';
    return { category: 'Triceps', subcategory: sub };
  }

  // ── LEGS ───────────────────────────────────────────────────────────────────
  if (prims.includes('quadriceps'))  return { category: 'Legs', subcategory: 'Quadriceps' };
  if (prims.includes('hamstrings'))  return { category: 'Legs', subcategory: 'Hamstrings' };
  if (prims.includes('glutes'))      return { category: 'Legs', subcategory: 'Glutes' };
  if (prims.includes('calves'))      return { category: 'Legs', subcategory: 'Calves' };
  if (prims.includes('hip flexors')) return { category: 'Legs', subcategory: 'Hip Flexors' };
  if (prims.includes('abductors'))   return { category: 'Legs', subcategory: 'Glutes' };
  if (prims.includes('adductors'))   return { category: 'Legs', subcategory: 'Quadriceps' };

  // ── CORE ───────────────────────────────────────────────────────────────────
  if (prims.includes('abdominals') || prims.includes('core')) {
    let sub = 'Upper Abs';
    if (/lower|leg raise|hanging|reverse/.test(name))   sub = 'Lower Abs';
    else if (/oblique|twist|side|rotation|russian/.test(name)) sub = 'Obliques';
    else if (/plank|hollow|brace|vacuum/.test(name))    sub = 'Transverse Abdominis';
    return { category: 'Core', subcategory: sub };
  }

  // ── FOREARMS ───────────────────────────────────────────────────────────────
  if (prims.includes('forearms')) {
    let sub = 'Grip';
    if (/curl|flexor/.test(name))      sub = 'Wrist Flexors';
    else if (/extension|extensor/.test(name)) sub = 'Wrist Extensors';
    return { category: 'Forearms', subcategory: sub };
  }

  // ── NECK ───────────────────────────────────────────────────────────────────
  if (prims.includes('neck')) {
    return { category: 'Neck', subcategory: /front|flexion/.test(name) ? 'Front Neck' : 'Rear Neck' };
  }

  // ── CATEGORY-BASED FALLBACKS ───────────────────────────────────────────────
  if (cat === 'cardio') {
    let sub = 'HIIT';
    if (/run|sprint|jog/.test(name))          sub = 'Running';
    else if (/walk/.test(name))               sub = 'Walking';
    else if (/bike|cycl|spin/.test(name))     sub = 'Cycling';
    else if (/row/.test(name))                sub = 'Rowing';
    else if (/elliptic/.test(name))           sub = 'Elliptical';
    else if (/stair|step/.test(name))         sub = 'Stair Climber';
    else if (/jump rope|skipping/.test(name)) sub = 'Jump Rope';
    return { category: 'Cardio', subcategory: sub };
  }

  if (cat === 'stretching') {
    const sub = /dynamic|active|leg swing|arm circle/.test(name)
      ? 'Dynamic Stretching' : 'Static Stretching';
    return { category: 'Stretching', subcategory: sub };
  }

  if (cat === 'crossfit') {
    let sub = 'MetCon';
    if (/squat|deadlift|press|snatch|clean/.test(name)) sub = 'Olympic Lifting';
    else if (/pull.?up|muscle.?up|handstand|ring/.test(name)) sub = 'Gymnastics';
    else if (/run|row|bike/.test(name)) sub = 'Endurance';
    return { category: 'CrossFit', subcategory: sub };
  }

  if (cat === 'olympic_weightlifting') {
    return { category: 'Full Body', subcategory: 'Compound' };
  }

  if (cat === 'plyometrics') {
    return { category: 'Full Body', subcategory: 'Functional' };
  }

  if (cat === 'strongman' || cat === 'powerlifting') {
    return { category: 'Full Body', subcategory: 'Compound' };
  }

  if (cat === 'strength') {
    // multi-muscle strength → Full Body
    if (prims.length === 0 || (prims.includes('glutes') && secs.includes('quadriceps')))
      return { category: 'Full Body', subcategory: 'Compound' };
  }

  // could not map
  return null;
}

// ─── HTTP FETCH ──────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchJson(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

// ─── MANUAL EXERCISES (Yoga, Zumba, HIIT, Pilates, Stretching, Rehab) ────────
// Images use Wikimedia Commons or ExerciseDB-friendly URLs
const MANUAL_EXERCISES = [
  // ── YOGA ───────────────────────────────────────────────────────────────────
  { name: 'Mountain Pose (Tadasana)',          category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Full Body', instructions: 'Stand tall with feet together. Press all four corners of both feet into the floor. Lengthen tailbone down, lift chest up. Arms at sides, palms forward. Breathe deeply for 5–10 breaths.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Tadasana_Yoga-Asana_Nina-Mel.jpg/220px-Tadasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Child\'s Pose (Balasana)',           category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Back, Hips', instructions: 'Kneel on the mat, sit back on your heels, then fold forward extending arms ahead. Rest forehead on mat. Hold for 30 seconds to 3 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Balasana_yoga.jpg/220px-Balasana_yoga.jpg' },
  { name: 'Downward Facing Dog (Adho Mukha)',   category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Shoulders, Hamstrings, Calves', instructions: 'Start on hands and knees. Lift hips up and back forming an inverted V. Keep arms straight, press heels toward floor. Hold 1–3 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Adho_mukha_svanasana_-_down_dog_yoga.jpg/220px-Adho_mukha_svanasana_-_down_dog_yoga.jpg' },
  { name: 'Warrior I (Virabhadrasana I)',       category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Quads, Hip Flexors, Shoulders', instructions: 'Step one foot forward into a lunge. Back foot at 45°. Raise arms overhead, square hips forward. Hold 5 breaths each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Virabhadrasana_I.jpg/220px-Virabhadrasana_I.jpg' },
  { name: 'Warrior II (Virabhadrasana II)',     category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Quads, Glutes, Shoulders', instructions: 'Wide stance, front knee bent over ankle, back leg straight. Arms extended parallel to floor, gaze over front fingertips. Hold 5–10 breaths.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Virabhadrasana_II.jpg/220px-Virabhadrasana_II.jpg' },
  { name: 'Tree Pose (Vrikshasana)',            category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Intermediate', muscles: 'Core, Ankles, Hip Flexors', instructions: 'Stand on one leg, place other foot on inner thigh or calf. Bring hands to prayer or raise overhead. Hold 30 seconds each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Vriksasana_Yoga-Asana_Nina-Mel.jpg/220px-Vriksasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Triangle Pose (Trikonasana)',        category: 'Yoga', subcategory: 'Beginner',     difficulty: 'Beginner',     muscles: 'Hamstrings, Obliques, IT Band', instructions: 'Wide stance, extend arms. Reach front hand down to shin/floor, back arm up. Gaze at upper hand. 5 breaths each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Utthita-Trikonasana.jpg/220px-Utthita-Trikonasana.jpg' },
  { name: 'Seated Forward Bend (Paschimottanasana)', category: 'Yoga', subcategory: 'Hatha Yoga', difficulty: 'Beginner', muscles: 'Hamstrings, Lower Back', instructions: 'Sit with legs extended. Inhale and lengthen spine, exhale and fold forward over legs. Hold for 1–3 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Paschimottanasana.jpg/220px-Paschimottanasana.jpg' },
  { name: 'Cobra Pose (Bhujangasana)',          category: 'Yoga', subcategory: 'Hatha Yoga',   difficulty: 'Beginner',     muscles: 'Spine, Chest, Shoulders', instructions: 'Lie prone, hands under shoulders. Press through palms to lift chest. Keep elbows slightly bent, shoulders away from ears. Hold 15–30 seconds.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bhujangasana_Yoga-Asana_Nina-Mel.jpg/220px-Bhujangasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Bridge Pose (Setu Bandhasana)',      category: 'Yoga', subcategory: 'Hatha Yoga',   difficulty: 'Beginner',     muscles: 'Glutes, Hamstrings, Core', instructions: 'Lie on back with knees bent. Press feet into floor and lift hips. Clasp hands under back. Hold 30 seconds to 1 minute.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Setu_Bandhasana_Yoga-Asana_Nina-Mel.jpg/220px-Setu_Bandhasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Pigeon Pose (Kapotasana)',           category: 'Yoga', subcategory: 'Intermediate', difficulty: 'Intermediate', muscles: 'Hip Flexors, Glutes, Piriformis', instructions: 'From downward dog bring one knee forward behind wrist, shin diagonal. Slide back leg straight. Fold forward over front shin. Hold 2–5 minutes per side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Eka_Pada_Rajakapotasana_Yoga-Asana_Nina-Mel.jpg/220px-Eka_Pada_Rajakapotasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Half Spinal Twist (Ardha Matsyendrasana)', category: 'Yoga', subcategory: 'Intermediate', difficulty: 'Intermediate', muscles: 'Spine, Obliques, Hips', instructions: 'Sit with one leg extended, other foot planted outside knee. Twist torso toward bent knee, wrap arm. Hold 5–10 breaths each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ardha_Matsyendrasana.jpg/220px-Ardha_Matsyendrasana.jpg' },
  { name: 'Crow Pose (Bakasana)',              category: 'Yoga', subcategory: 'Advanced',      difficulty: 'Advanced',     muscles: 'Core, Triceps, Wrists', instructions: 'Squat and place hands on floor. Bend elbows and lean forward resting shins on triceps. Shift weight forward and lift both feet off ground. Hold 5–30 seconds.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Yoga_Crow_Pose.jpg/220px-Yoga_Crow_Pose.jpg' },
  { name: 'Headstand (Sirsasana)',             category: 'Yoga', subcategory: 'Advanced',      difficulty: 'Expert',       muscles: 'Core, Shoulders, Neck', instructions: 'Interlock fingers, place forearms on mat forming a triangle base. Place crown of head on mat. Walk feet close, then lift into a vertical position. Hold 30 seconds to 3 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sirsasana.jpg/220px-Sirsasana.jpg' },
  { name: 'Shoulder Stand (Sarvangasana)',     category: 'Yoga', subcategory: 'Intermediate',  difficulty: 'Intermediate', muscles: 'Core, Neck, Shoulders', instructions: 'Lie on back. Bring legs overhead, support lower back with hands, extend legs toward ceiling. Keep weight on shoulders, not neck.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sarvangasana.jpg/220px-Sarvangasana.jpg' },
  { name: 'Sun Salutation (Surya Namaskar)',   category: 'Yoga', subcategory: 'Vinyasa Yoga',  difficulty: 'Beginner',     muscles: 'Full Body', instructions: 'A flowing sequence of 12 poses performed in a rhythmic flow. Mountain Pose → Upward Salute → Forward Fold → Low Lunge → Plank → Chaturanga → Upward Dog → Downward Dog → repeat.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Surya_Namaskar.jpg/400px-Surya_Namaskar.jpg' },
  { name: 'Cat-Cow Stretch (Marjaryasana)',    category: 'Yoga', subcategory: 'Hatha Yoga',    difficulty: 'Beginner',     muscles: 'Spine, Core', instructions: 'On all fours, alternate between arching spine up (Cat) and sinking belly down, lifting tailbone (Cow). Move with breath for 1–2 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Cat_cow_stretch.jpg/220px-Cat_cow_stretch.jpg' },
  { name: 'Boat Pose (Navasana)',              category: 'Yoga', subcategory: 'Power Yoga',    difficulty: 'Intermediate', muscles: 'Core, Hip Flexors', instructions: 'Sit with knees bent. Lean back slightly, lift feet until shins are parallel to floor. Extend arms forward. For full pose straighten legs. Hold 30 seconds to 1 minute.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Paripurna_Navasana_Yoga-Asana_Nina-Mel.jpg/220px-Paripurna_Navasana_Yoga-Asana_Nina-Mel.jpg' },
  { name: 'Corpse Pose (Savasana)',            category: 'Yoga', subcategory: 'Meditation',    difficulty: 'Beginner',     muscles: 'Full Body (relaxation)', instructions: 'Lie flat on back, arms at sides, palms up. Close eyes and consciously relax every part of the body. Stay for 5–15 minutes. Focus on breath.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Savasana.jpg/220px-Savasana.jpg' },
  { name: 'Alternate Nostril Breathing (Nadi Shodhana)', category: 'Yoga', subcategory: 'Pranayama', difficulty: 'Beginner', muscles: 'Respiratory System', instructions: 'Sit comfortably. Close right nostril with thumb, inhale through left. Close left nostril with ring finger, exhale through right. Inhale right, close, exhale left. Repeat 5–10 cycles.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nadi_Shodhana.jpg/220px-Nadi_Shodhana.jpg' },

  // ── HIIT ───────────────────────────────────────────────────────────────────
  { name: 'Burpee', category: 'HIIT', subcategory: 'Beginner', difficulty: 'Intermediate', muscles: 'Full Body', instructions: 'Stand, squat down, place hands on floor, jump feet back to plank, do a push-up, jump feet to hands, then jump up with arms overhead. Repeat without rest.', mediaUrl: `${IMG}/Burpee/0.jpg` },
  { name: 'Jumping Jacks', category: 'HIIT', subcategory: 'Beginner', difficulty: 'Beginner', muscles: 'Full Body, Cardio', instructions: 'Start standing. Jump and spread feet wide while raising arms overhead. Jump again and return to start. Perform continuously for the set duration.', mediaUrl: `${IMG}/Jumping_Jacks/0.jpg` },
  { name: 'Mountain Climber', category: 'HIIT', subcategory: 'Intermediate', difficulty: 'Intermediate', muscles: 'Core, Shoulders, Hip Flexors', instructions: 'Start in plank position. Drive one knee toward chest, then switch rapidly in a running motion. Keep hips level and core tight throughout.', mediaUrl: `${IMG}/Mountain_Climber/0.jpg` },
  { name: 'High Knees', category: 'HIIT', subcategory: 'Beginner', difficulty: 'Beginner', muscles: 'Hip Flexors, Core, Cardio', instructions: 'Stand with feet hip-width apart. Run in place driving knees to hip height alternately as fast as possible. Pump arms to maintain rhythm.', mediaUrl: `${IMG}/High_Knees/0.jpg` },
  { name: 'Box Jump', category: 'HIIT', subcategory: 'Advanced', difficulty: 'Advanced', muscles: 'Quadriceps, Glutes, Calves', instructions: 'Stand in front of a sturdy box. Bend knees, swing arms back, then explosively jump onto box landing softly with knees bent. Step back down and repeat.', mediaUrl: `${IMG}/Box_Jump/0.jpg` },
  { name: 'Jump Squat', category: 'HIIT', subcategory: 'Intermediate', difficulty: 'Intermediate', muscles: 'Quadriceps, Glutes, Calves', instructions: 'Stand with feet shoulder-width. Lower into a squat then explode upward into a jump. Land softly on balls of feet and immediately lower into next squat.', mediaUrl: `${IMG}/Jump_Squat/0.jpg` },
  { name: 'Tabata Push-Up', category: 'HIIT', subcategory: 'Tabata', difficulty: 'Intermediate', muscles: 'Chest, Shoulders, Triceps', instructions: 'Perform push-ups for 20 seconds at maximum effort, rest 10 seconds. Repeat 8 rounds (4 minutes total). Maintain proper plank form throughout.', mediaUrl: `${IMG}/Push-Up/0.jpg` },
  { name: 'Tabata Squat', category: 'HIIT', subcategory: 'Tabata', difficulty: 'Beginner', muscles: 'Quadriceps, Glutes, Hamstrings', instructions: 'Perform bodyweight squats for 20 seconds at maximum effort, rest 10 seconds. Repeat 8 rounds. Keep chest up, knees tracking over toes.', mediaUrl: `${IMG}/Bodyweight_Squat/0.jpg` },
  { name: 'EMOM Deadlift', category: 'HIIT', subcategory: 'EMOM', difficulty: 'Intermediate', muscles: 'Hamstrings, Glutes, Lower Back', instructions: 'Every Minute On the Minute: perform 5 deadlifts at 60–70% 1RM. Rest the remainder of the minute. Continue for 10–20 minutes.', mediaUrl: `${IMG}/Barbell_Deadlift/0.jpg` },
  { name: 'AMRAP Circuit (5 Exercises)', category: 'HIIT', subcategory: 'AMRAP', difficulty: 'Advanced', muscles: 'Full Body', instructions: 'As Many Reps As Possible in 20 minutes: 5 Pull-ups, 10 Push-ups, 15 Squats. Cycle through rounds with minimal rest. Track total rounds.', mediaUrl: `${IMG}/Pull-Up/0.jpg` },

  // ── PILATES ────────────────────────────────────────────────────────────────
  { name: 'The Hundred', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Core, Hip Flexors', instructions: 'Lie on back. Lift head and shoulders off mat, bring legs to tabletop or 45°. Pump arms up and down in small pulses — 5 counts inhale, 5 counts exhale. 10 full breaths = 100 pumps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Pilates_hundred.jpg/220px-Pilates_hundred.jpg' },
  { name: 'Roll Up', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Core, Spine', instructions: 'Lie flat, arms overhead. Inhale, lift arms. Exhale and curl up vertebra by vertebra, reaching toward toes. Inhale at top, exhale and roll back down. 6–8 reps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pilates_roll_up.jpg/220px-Pilates_roll_up.jpg' },
  { name: 'Single Leg Circles', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Core, Hip Flexors, Glutes', instructions: 'Lie on back, one leg extended to ceiling. Draw 5 circles clockwise, 5 counter-clockwise with the leg while keeping pelvis stable. Switch legs.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Pilates_single_leg_circles.jpg/220px-Pilates_single_leg_circles.jpg' },
  { name: 'Rolling Like a Ball', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Spine, Core', instructions: 'Sit with knees drawn to chest, balancing on tailbone. Scoop abs, roll back to shoulder blades, roll up to balance. 6–10 reps. Do not roll onto neck.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Pilates_rolling_like_a_ball.jpg/220px-Pilates_rolling_like_a_ball.jpg' },
  { name: 'Single Leg Stretch', category: 'Pilates', subcategory: 'Core Pilates', difficulty: 'Beginner', muscles: 'Core, Hip Flexors', instructions: 'Lie on back, lift head and shoulders. Draw one knee to chest, extend other leg. Switch legs in a scissor motion, holding shin with both hands. 10 reps each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pilates_single_leg_stretch.jpg/220px-Pilates_single_leg_stretch.jpg' },
  { name: 'Double Leg Stretch', category: 'Pilates', subcategory: 'Core Pilates', difficulty: 'Intermediate', muscles: 'Core, Hip Flexors', instructions: 'Lie on back, knees to chest, head lifted. Inhale and extend arms overhead, legs forward at 45°. Exhale and circle arms to hug knees back. 10 reps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Pilates_double_leg_stretch.jpg/220px-Pilates_double_leg_stretch.jpg' },
  { name: 'Spine Stretch Forward', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Spine, Hamstrings', instructions: 'Sit tall with legs extended hip-width. Reach arms forward, scoop abs and curve spine forward as if going over a barrel. Return to tall sitting. 6–10 reps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pilates_spine_stretch.jpg/220px-Pilates_spine_stretch.jpg' },
  { name: 'Swan / Swimming', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Intermediate', muscles: 'Spine, Glutes, Hamstrings', instructions: 'Lie prone, hands under shoulders. Press up into a small back extension. For swimming: lift alternate arm and leg in flutter-kick motion for 20–30 seconds.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pilates_swan_prep.jpg/220px-Pilates_swan_prep.jpg' },
  { name: 'Side Kick Series', category: 'Pilates', subcategory: 'Mat Pilates', difficulty: 'Beginner', muscles: 'Glutes, Hip Abductors, Core', instructions: 'Lie on side in a straight line. Lift top leg to hip height. Swing forward with a pulse then swing back. 10 reps each direction. Keep core stable throughout.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Pilates_side_kick.jpg/220px-Pilates_side_kick.jpg' },
  { name: 'Teaser', category: 'Pilates', subcategory: 'Core Pilates', difficulty: 'Advanced', muscles: 'Core, Hip Flexors, Spine', instructions: 'Lie on back, legs extended at 45°. Lift arms, peel up to a V-sit balance balancing on tailbone with legs and arms parallel. Lower with control. 3–6 reps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Pilates_teaser.jpg/220px-Pilates_teaser.jpg' },
  { name: 'Reformer Leg Press', category: 'Pilates', subcategory: 'Reformer Pilates', difficulty: 'Intermediate', muscles: 'Quadriceps, Glutes, Hamstrings', instructions: 'Lie on reformer carriage, feet on footbar. Press carriage out by extending legs fully, then return with control. Vary foot positions — parallel, V, heels. 10–15 reps each.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Pilates_reformer.jpg/220px-Pilates_reformer.jpg' },

  // ── ZUMBA ──────────────────────────────────────────────────────────────────
  { name: 'Merengue March', category: 'Zumba', subcategory: 'Beginner', difficulty: 'Beginner', muscles: 'Full Body, Cardio', instructions: 'Step side to side to merengue rhythm with hip movement. Add arm swings matching the beat. Keep knees soft. Great warm-up exercise. 3–5 minutes.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Salsa Basic Step', category: 'Zumba', subcategory: 'Beginner', difficulty: 'Beginner', muscles: 'Legs, Core, Cardio', instructions: 'Step forward left, bring right together, step back right, bring left together — to a 1-2-3-tap rhythm. Add hip sways and arm movements. Repeat 4–8 counts then change direction.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Cumbia Step', category: 'Zumba', subcategory: 'Beginner', difficulty: 'Beginner', muscles: 'Hips, Legs, Cardio', instructions: 'Step to the side with a shuffle step, three-beat rhythm. Right-right-left, left-left-right. Exaggerate hip movement with each step. Arms can be out or in follow-along position.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Reggaeton Bounce', category: 'Zumba', subcategory: 'Intermediate', difficulty: 'Intermediate', muscles: 'Glutes, Legs, Core', instructions: 'Wide stance, knees slightly bent. Bounce hips side to side in a dembow rhythm (1-and-2). Add arm movements and body rolls. Intensify with lower squats.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Cha-Cha Step', category: 'Zumba', subcategory: 'Intermediate', difficulty: 'Beginner', muscles: 'Hips, Legs, Cardio', instructions: 'Forward-back rock step (1-2), then side-side-side cha-cha-cha (3-and-4). Swing hips with each weight shift. Can be turned or combined with other steps.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Samba Step', category: 'Zumba', subcategory: 'Advanced', difficulty: 'Intermediate', muscles: 'Hips, Legs, Core', instructions: 'Bounce knees in a rapid three-count rhythm (1-and-2) stepping side to side. Lower body is quick bouncing while upper body stays relaxed and moves naturally with samba hip action.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },
  { name: 'Strong Nation HIIT Combo', category: 'Zumba', subcategory: 'Strong Nation', difficulty: 'Advanced', muscles: 'Full Body', instructions: 'Music-synchronized HIIT: squat pulses on the beat, jump squats on the drop, push-up holds on rest. Movements are timed precisely to music cues. 3-minute round.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Zumba_class.jpg/220px-Zumba_class.jpg' },

  // ── STRETCHING ─────────────────────────────────────────────────────────────
  { name: 'Standing Quad Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Quadriceps', instructions: 'Stand on one leg, pull other foot toward glutes. Keep knees together, stand tall. Hold 30 seconds per side. Use wall for balance if needed.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Standing_quad_stretch.jpg/220px-Standing_quad_stretch.jpg' },
  { name: 'Standing Hamstring Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Hamstrings', instructions: 'Stand and place one foot on slightly elevated surface. Keep leg straight, hinge forward at hip until you feel stretch. Hold 30 seconds each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hamstring_stretch.jpg/220px-Hamstring_stretch.jpg' },
  { name: 'Hip Flexor Lunge Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Hip Flexors, Quads', instructions: 'Kneel on one knee in a deep lunge. Drive hips forward until you feel a stretch in the front of the back hip. Raise same-side arm for deeper stretch. 30 sec each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hip_flexor_stretch.jpg/220px-Hip_flexor_stretch.jpg' },
  { name: 'Chest Opener Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Chest, Shoulders, Biceps', instructions: 'Clasp hands behind back. Straighten arms, squeeze shoulder blades together and lift hands slightly. Open chest. Hold 30 seconds.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chest_stretch.jpg/220px-Chest_stretch.jpg' },
  { name: 'Cross-Body Shoulder Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Shoulders, Rear Delts', instructions: 'Bring one arm across chest at shoulder height. Use other hand to press arm closer to chest. Hold 30 seconds per side. Keep shoulder down.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Shoulder_stretch.jpg/220px-Shoulder_stretch.jpg' },
  { name: 'Seated Butterfly Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'Groin, Hip Adductors', instructions: 'Sit with soles of feet together, knees out. Hold feet, gently press knees toward floor with elbows. Hold 30–60 seconds.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Butterfly_stretch.jpg/220px-Butterfly_stretch.jpg' },
  { name: 'Lying IT Band Stretch', category: 'Stretching', subcategory: 'Static Stretching', difficulty: 'Beginner', muscles: 'IT Band, Glutes, Hips', instructions: 'Lie on back, cross one leg over the other and pull toward floor with opposite hand. Keep both shoulders flat. Hold 30 sec per side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/IT_band_stretch.jpg/220px-IT_band_stretch.jpg' },
  { name: 'Arm Circle Warm-Up', category: 'Stretching', subcategory: 'Dynamic Stretching', difficulty: 'Beginner', muscles: 'Shoulders, Upper Back', instructions: 'Stand with feet hip-width. Extend arms to sides. Make progressively larger circles forward 10 times, then backward 10 times. Can be done with slight forward lean.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Arm_circles.jpg/220px-Arm_circles.jpg' },
  { name: 'Leg Swing (Front to Back)', category: 'Stretching', subcategory: 'Dynamic Stretching', difficulty: 'Beginner', muscles: 'Hip Flexors, Hamstrings', instructions: 'Hold a wall for support, swing one leg forward and back in a controlled pendulum motion. Increase amplitude over 10–20 swings. Switch legs.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Leg_swing_stretch.jpg/220px-Leg_swing_stretch.jpg' },
  { name: 'Walking Lunge with Rotation', category: 'Stretching', subcategory: 'Dynamic Stretching', difficulty: 'Intermediate', muscles: 'Hip Flexors, Quads, Thoracic Spine', instructions: 'Take a lunge step forward, rotate torso toward front knee, reach up with the opposite arm. Return and lunge the other side. 10 reps each.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Walking_lunge.jpg/220px-Walking_lunge.jpg' },
  { name: 'Foam Roller Thoracic Extension', category: 'Stretching', subcategory: 'Mobility', difficulty: 'Beginner', muscles: 'Thoracic Spine, Chest', instructions: 'Sit in front of a foam roller placed horizontally. Lean back over it, supporting head with hands. Gently extend spine over roller. Move it up/down the thoracic area.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Foam_roller_thoracic.jpg/220px-Foam_roller_thoracic.jpg' },
  { name: 'Foam Roller IT Band', category: 'Stretching', subcategory: 'Recovery', difficulty: 'Beginner', muscles: 'IT Band, Lateral Quad', instructions: 'Lie on side with foam roller under outer thigh. Support yourself with arm and top foot. Slowly roll from hip to just above knee. Pause on tender spots. 60 sec per side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/IT_band_foam_rolling.jpg/220px-IT_band_foam_rolling.jpg' },
  { name: '90/90 Hip Stretch', category: 'Stretching', subcategory: 'Mobility', difficulty: 'Intermediate', muscles: 'Hip Rotators, Glutes, Hip Flexors', instructions: 'Sit with both legs at 90° angles (front shin perpendicular, back shin along side). Keep torso upright. Lean over front shin for external rotation stretch. 2 min per side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/90_90_stretch.jpg/220px-90_90_stretch.jpg' },

  // ── REHABILITATION ─────────────────────────────────────────────────────────
  { name: 'Clamshell', category: 'Rehabilitation', subcategory: 'Knee Rehab', difficulty: 'Beginner', muscles: 'Glutes, Hip Abductors', instructions: 'Lie on side with hips and knees stacked at 45°. Keep feet together and rotate top knee upward like a clamshell opening. Do not let pelvis rock. 15–20 reps each side.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Clamshell_exercise.jpg/220px-Clamshell_exercise.jpg' },
  { name: 'Terminal Knee Extension (TKE)', category: 'Rehabilitation', subcategory: 'Knee Rehab', difficulty: 'Beginner', muscles: 'Quadriceps (VMO)', instructions: 'Attach band to a post behind you. Loop band behind knee. Step forward with slight tension. Bend and straighten knee from 30° to full extension. 15–20 reps. Great for patellar tracking.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/TKE_exercise.jpg/220px-TKE_exercise.jpg' },
  { name: 'Straight Leg Raise', category: 'Rehabilitation', subcategory: 'Knee Rehab', difficulty: 'Beginner', muscles: 'Quadriceps, Hip Flexors', instructions: 'Lie on back, one knee bent, one straight. Tighten quad of straight leg, raise it to the height of bent knee. Slowly lower. 3 × 15 reps. Fundamental post-surgery exercise.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Straight_leg_raise.jpg/220px-Straight_leg_raise.jpg' },
  { name: 'Wall Slide (Knee)', category: 'Rehabilitation', subcategory: 'Knee Rehab', difficulty: 'Beginner', muscles: 'Quadriceps, Glutes', instructions: 'Stand with back against wall, feet 12 inches out. Slide down to 45–60° knee bend, hold 5 seconds, slide back up. 3 × 10 reps. Increases quad strength without overloading knee.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Wall_slide_exercise.jpg/220px-Wall_slide_exercise.jpg' },
  { name: 'Pendulum Exercise', category: 'Rehabilitation', subcategory: 'Shoulder Rehab', difficulty: 'Beginner', muscles: 'Shoulder (passive motion)', instructions: 'Lean forward with healthy arm on table. Let affected arm hang. Swing arm gently in small circles, front-to-back, and side-to-side. 10–20 reps per direction. Improves glenohumeral mobility.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Pendulum_shoulder_exercise.jpg/220px-Pendulum_shoulder_exercise.jpg' },
  { name: 'External Rotation with Band', category: 'Rehabilitation', subcategory: 'Shoulder Rehab', difficulty: 'Beginner', muscles: 'Rotator Cuff (Infraspinatus, Teres Minor)', instructions: 'Elbow at 90°, upper arm against side, hold resistance band. Rotate forearm outward away from body. Slowly return. 3 × 15 reps. Essential for rotator cuff rehab.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Shoulder_external_rotation.jpg/220px-Shoulder_external_rotation.jpg' },
  { name: 'Scapular Retraction', category: 'Rehabilitation', subcategory: 'Shoulder Rehab', difficulty: 'Beginner', muscles: 'Rhomboids, Middle Trapezius', instructions: 'Sit or stand. Squeeze shoulder blades together as if trying to hold a pencil between them. Hold 5 seconds, release. 3 × 15 reps. Improves scapular stability and posture.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Scapular_retraction.jpg/220px-Scapular_retraction.jpg' },
  { name: 'Cat-Camel Stretch (Back Rehab)', category: 'Rehabilitation', subcategory: 'Back Rehab', difficulty: 'Beginner', muscles: 'Spine, Erector Spinae, Core', instructions: 'On all fours, alternate between arching back up (cat) and sinking it down (camel). Move slowly through each direction 10 times. Classic spine mobilization for back pain.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Cat_camel.jpg/220px-Cat_camel.jpg' },
  { name: 'Bird Dog', category: 'Rehabilitation', subcategory: 'Back Rehab', difficulty: 'Beginner', muscles: 'Core, Glutes, Lower Back', instructions: 'On all fours, extend opposite arm and leg simultaneously. Hold 5–10 seconds, return with control. 10 reps each side. Essential for lumbar stability and deep core activation.', mediaUrl: `${IMG}/Bird_Dog/0.jpg` },
  { name: 'McGill Curl-Up', category: 'Rehabilitation', subcategory: 'Back Rehab', difficulty: 'Beginner', muscles: 'Core, Rectus Abdominis', instructions: 'Lie on back, one knee bent, one straight. Hands under lumbar curve. Brace core and lift only head and shoulders 1–2 inches. Hold 10 sec. 10 reps. Spine-safe core exercise.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/McGill_curlup.jpg/220px-McGill_curlup.jpg' },
  { name: 'Dead Bug', category: 'Rehabilitation', subcategory: 'Back Rehab', difficulty: 'Beginner', muscles: 'Core, Transverse Abdominis', instructions: 'Lie on back, arms up, knees at 90°. Slowly lower opposite arm and leg toward floor while maintaining lower back contact with floor. Return and switch. 10 reps each side.', mediaUrl: `${IMG}/Dead_Bug/0.jpg` },
  { name: 'Chin Tuck', category: 'Rehabilitation', subcategory: 'Posture Correction', difficulty: 'Beginner', muscles: 'Neck, Deep Cervical Flexors', instructions: 'Sit or stand with head level. Gently draw chin straight back (not down) creating a "double chin." Hold 5 sec. 10–15 reps. Counteracts forward head posture from screen use.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Chin_tuck_exercise.jpg/220px-Chin_tuck_exercise.jpg' },
  { name: 'Thoracic Extension over Chair', category: 'Rehabilitation', subcategory: 'Posture Correction', difficulty: 'Beginner', muscles: 'Thoracic Spine, Chest', instructions: 'Sit in chair, hands behind head. Gently extend thoracic spine over chair back. Hold 5–10 seconds. Repeat at several thoracic levels. 5–10 reps. Corrects kyphosis.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Thoracic_extension.jpg/220px-Thoracic_extension.jpg' },
  { name: 'RICE Protocol Exercise (Ankle)', category: 'Rehabilitation', subcategory: 'Injury Recovery', difficulty: 'Beginner', muscles: 'Ankle, Peroneals', instructions: 'After acute phase: sit, trace the alphabet with foot to restore range of motion. Progress to single-leg balance on a folded towel for 30 seconds. 3 sets.', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Ankle_rehab.jpg/220px-Ankle_rehab.jpg' },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🏋️  Maximus Exercise Seed Script');
  console.log('══════════════════════════════════════════════');

  // 1. Download from free-exercise-db
  console.log('\n📥 Downloading free-exercise-db exercises…');
  let remoteExercises = [];
  try {
    remoteExercises = await fetchJson(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
    );
    console.log(`   ✅ Downloaded ${remoteExercises.length} exercises`);
  } catch (err) {
    console.warn(`   ⚠️  Could not download remote exercises: ${err.message}`);
    console.warn('   Continuing with manual exercises only…');
  }

  // 2. Map remote exercises to our taxonomy
  const mapped = [];
  let skipped = 0;
  for (const ex of remoteExercises) {
    const result = mapExercise(ex);
    if (!result) { skipped++; continue; }

    const level  = LEVEL_MAP[ex.level] || 'Intermediate';
    const instrs = Array.isArray(ex.instructions) ? ex.instructions.join(' ') : (ex.instructions || '');
    const imgUrl = ex.images && ex.images[0]
      ? `${IMG}/${ex.images[0]}`
      : null;

    mapped.push({
      name:         ex.name,
      muscleGroup:  `${result.category}|${result.subcategory}`,
      difficulty:   level,
      instructions: instrs || null,
      mediaUrl:     imgUrl,
    });
  }
  console.log(`   📊 Mapped: ${mapped.length}, Skipped (no category): ${skipped}`);

  // 3. Build manual exercises
  const manuals = MANUAL_EXERCISES.map(ex => ({
    name:         ex.name,
    muscleGroup:  `${ex.category}|${ex.subcategory}`,
    difficulty:   ex.difficulty,
    instructions: ex.instructions || null,
    mediaUrl:     ex.mediaUrl || null,
  }));
  console.log(`   ✏️  Manual exercises: ${manuals.length}`);

  // 4. Combine (manual overrides remote if same name)
  const remoteByName  = new Map(mapped.map(e => [e.name.toLowerCase(), e]));
  const manualsByName = new Map(manuals.map(e => [e.name.toLowerCase(), e]));
  const combined      = [...manualsByName.values(), ...mapped.filter(e => !manualsByName.has(e.name.toLowerCase()))];

  console.log(`\n🌱 Seeding ${combined.length} exercises into database…`);

  // 5. Insert in batches using createMany + skipDuplicates
  //    Works at DB level — does not need the Prisma client to be regenerated.
  let inserted = 0;
  const BATCH  = 20;

  for (let i = 0; i < combined.length; i += BATCH) {
    const batch = combined.slice(i, i + BATCH);
    try {
      const result = await prisma.exercise.createMany({
        data:           batch,
        skipDuplicates: true,
      });
      inserted += result.count;
    } catch (err) {
      // If createMany itself fails (e.g. schema constraint issue), fall back per-row
      for (const ex of batch) {
        try {
          await prisma.exercise.create({ data: ex });
          inserted++;
        } catch (_) {}
      }
    }
    const progress = Math.min(i + BATCH, combined.length);
    process.stdout.write(`\r   Progress: ${progress}/${combined.length}`);
  }

  console.log(`\n\n✅ Done! Seeded ${inserted} new exercises (duplicates skipped).`);

  // 6. Print summary by category
  console.log('\n📊 Breakdown by category:');
  const counts = {};
  for (const ex of combined) {
    const [cat] = ex.muscleGroup.split('|');
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`   ${cat.padEnd(22)} ${count}`);
  }
}

// ─── ADD UNIQUE CONSTRAINT ────────────────────────────────────────────────────
// NOTE: If this fails with "Unknown argument `name_muscleGroup`", you need to
// add @@unique([name, muscleGroup]) to the Exercise model in schema.prisma and
// run `npx prisma migrate dev --name add_exercise_unique`. See below:
//
//  model Exercise {
//    ...
//    @@unique([name, muscleGroup])
//  }
//
// Or use the fallback mode (uncomment below and comment out the upsert block):
// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch(async e => {
    console.error('\n❌ Error:', e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
