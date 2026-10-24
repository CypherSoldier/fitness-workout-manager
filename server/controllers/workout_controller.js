const Form = require("../models/form_model");
const Workout = require("../models/workout_model");

const workoutInstructions = (strict = false) =>
  `You are a careful strength and conditioning coach. Build a practical plan only from the user's allowedExercises list. Each list item has a recordId and canonical name. Return only those exact recordIds and never invent, rename, or substitute an exercise. Use the person's goals, current routine, schedule, duration, and recorded exercise data to select and arrange movements. Return a single JSON object with title, goal, workout_frequency, whyTitle (a concise benefit-led heading), whyThisPlan (2-4 specific sentences that directly connect the selected structure, frequency, exercise choices, sets/reps, and recovery to the user's stated goal and experience; for a lean bulk, explain how progressive strength-focused volume and recovery support muscle gain), and exercises. Each exercise must include recordId, day (one exact weekday from weekdays), focus (short label), sets (number), reps (string), restTime (seconds number), kgs (number), and time (string). Select exactly workout_frequency distinct weekdays from the supplied weekdays, spaced sensibly for recovery, and distribute exercises across them. Choose a sensible split for the available movements and goal. Do not put every exercise on the same day. If there are too few distinct movements, repeat them thoughtfully across the training days rather than inventing movements. Use conservative loads when records do not establish a safe working weight. ${strict ? "Return only valid JSON, with no markdown or explanatory text." : ""}`;

const parseWorkout = (content, context) => {
  const parsed = JSON.parse(
    content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, ""),
  );
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.exercises) ||
    !parsed.exercises.length ||
    !parsed.title ||
    !parsed.goal ||
    !Number.isFinite(Number(parsed.workout_frequency))
  )
    throw new Error("Invalid workout shape");
  const availableById = new Map(context.documents.map((doc) => [doc._id, doc]));
  const allowedDays = new Set(context.weekdays);
  parsed.exercises = parsed.exercises.map((exercise) => {
    const source = availableById.get(String(exercise.recordId || ""));
    if (!source || !Number.isFinite(Number(exercise.sets)) || !allowedDays.has(exercise.day)) {
      throw new Error(
        "Workout must use an owned exercise record and an allowed training day",
      );
    }
    return {
      name: String(source.name || source.exercise).trim(),
      sets: Number(exercise.sets),
      reps: String(exercise.reps || ""),
      restTime: Number(exercise.restTime) || 0,
      kgs: Number(exercise.kgs) || 0,
      time: String(exercise.time || ""),
      day: String(exercise.day || "Monday"),
      focus: String(exercise.focus || "TRAINING"),
      sourceId: source._id,
    };
  });
  if (!String(parsed.whyThisPlan || "").trim() || !String(parsed.whyTitle || "").trim())
    throw new Error("Workout rationale is required");
  if (new Set(parsed.exercises.map((item) => item.day)).size !== Math.min(context.workout_frequency, parsed.exercises.length))
    throw new Error("Workout exercises must be distributed across the selected training days");
  parsed.whyThisPlan = String(parsed.whyThisPlan).trim();
  parsed.whyTitle = String(parsed.whyTitle).trim();
  return parsed;
};

const callGemini = async (prompt, strict = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Workout generation is not configured");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${workoutInstructions(strict)}\n\nUSER CONTEXT AND STORED RECORDS:\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });
  if (!response.ok)
    throw new Error(`Gemini request failed (${response.status})`);
  const payload = await response.json();
  const output = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  if (!output) throw new Error("Gemini returned no workout content");
  return output;
};

const updateGeneratedWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user_id: req.user.id,
      source: "ai-generated",
    });
    if (!workout)
      return res.status(404).json({ message: "Generated workout not found." });
    const { title, goal, exercises, whyThisPlan } = req.body;
    if (
      !title ||
      !goal ||
      !Array.isArray(exercises) ||
      exercises.some(
        (item) => !item.name || !Number.isFinite(Number(item.sets)),
      )
    ) {
      return res.status(400).json({
        message:
          "Add a title, goal, and a name and set count for each exercise.",
      });
    }
    const ownedRecords = await Form.find({ user_id: String(req.user.id) });
    const allowedNames = new Set(ownedRecords.map((doc) => String(doc.name || doc.exercise || "").trim().toLowerCase()).filter(Boolean));
    if (exercises.some((item) => !allowedNames.has(String(item.name || "").trim().toLowerCase())))
      return res.status(400).json({ message: "Choose exercises from your saved exercise records." });
    workout.title = title;
    workout.goal = goal;
    workout.exercises = exercises.map((item) => ({
      name: String(item.name),
      sets: Number(item.sets),
      reps: String(item.reps || ""),
      restTime: Number(item.restTime) || 0,
      kgs: Number(item.kgs) || 0,
      time: String(item.time || ""),
      day: String(item.day || "Monday"),
      focus: String(item.focus || "TRAINING"),
    }));
    workout.whyThisPlan = String(whyThisPlan || "");
    workout.whyTitle = String(req.body.whyTitle || "Designed around your goals");
    await workout.save();
    res.json({ ...workout.toObject(), availableExercises: ownedRecords.map((doc) => ({ _id: String(doc._id), name: String(doc.name || doc.exercise || "").trim() })).filter((item) => item.name) });
  } catch (error) {
    res.status(500).json({ message: "Unable to save workout changes." });
  }
};

const generateWorkout = async (req, res) => {
  const {
    height,
    weight,
    goals,
    current_workout = "",
    workout_frequency,
    durationMinutes,
  } = req.body;
  const frequency = Number(workout_frequency);
  if (
    !height ||
    !weight ||
    !goals ||
    !Number.isInteger(frequency) ||
    frequency < 1 ||
    frequency > 7
  ) {
    return res.status(400).json({
      message:
        "Enter your height, weight, goal, and a training frequency from 1 to 7 days.",
    });
  }
  try {
    const docs = await Form.find({
      user_id: String(req.user.id),
      source: { $ne: "ai-generated" },
    });
    if (!docs.length)
      return res.status(404).json({
        message: "No stored workout records were found for your account.",
      });
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const uniqueDocuments = [...new Map(docs.map((doc) => {
      const name = String(doc.name || doc.exercise || "").trim();
      return [name.toLowerCase(), { _id: String(doc._id), name, sets: doc.sets, reps: doc.reps, kgs: doc.kgs }];
    }).filter(([, doc]) => doc.name)).values()];
    const context = {
      height: String(height),
      weight: String(weight),
      goals: String(goals),
      current_workout: String(current_workout),
      durationMinutes: Number(durationMinutes) || undefined,
      workout_frequency: frequency,
      weekdays,
      documents: uniqueDocuments,
    };
    if (!uniqueDocuments.length)
      return res.status(404).json({ message: "No saved exercises with a name were found for your account." });
    const prompt = JSON.stringify({ ...context, allowedExercises: context.documents.map(({ _id, ...item }) => ({ recordId: _id, ...item })) });
    let rawOutput = await callGemini(prompt);
    let workout;
    try {
      workout = parseWorkout(rawOutput, context);
    } catch (parseError) {
      rawOutput = await callGemini(prompt, true);
      try {
        workout = parseWorkout(rawOutput, context);
      } catch (error) {
        console.error("Invalid Gemini workout output:", rawOutput);
        return res.status(502).json({
          message: "The workout could not be generated. Please try again.",
        });
      }
    }
    const sourceDocumentIds = context.documents
      .filter((document) => workout.exercises.some((exercise) => exercise.sourceId === document._id))
      .map((document) => document._id);
    const created = await Workout.create({
      ...workout,
      height: context.height,
      weight: context.weight,
      current_workout: context.current_workout,
      workout_frequency: frequency,
      durationMinutes: context.durationMinutes,
      user_id: req.user.id,
      source: "ai-generated",
      sourceDocumentIds,
    });
    return res.status(201).json({ ...created.toObject(), availableExercises: context.documents.map(({ _id, name }) => ({ _id, name })) });
  } catch (error) {
    console.error("Workout generation failed:", error.message);
    return res.status(502).json({
      message:
        "The workout service is temporarily unavailable. Please try again.",
    });
  }
};

module.exports = {
  generateWorkout,
  updateGeneratedWorkout,
  parseWorkout,
  callGemini,
};
