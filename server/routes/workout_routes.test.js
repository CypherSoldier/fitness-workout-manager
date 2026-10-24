const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

jest.mock("../models/form_model", () => ({ find: jest.fn() }));
jest.mock("../models/workout_model", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));
const Form = require("../models/form_model");
const Workout = require("../models/workout_model");
const app = require("../server");

describe("POST /api/workouts/generate", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const documentId = new mongoose.Types.ObjectId();
  let token;

  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = "test-secret";
    process.env.GEMINI_API_KEY = "test-key";
    token = jwt.sign(
      { user: { id: userId, email: "test@example.com" } },
      process.env.ACCESS_TOKEN_SECRET,
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    title: "Strength plan",
                    goal: "Build strength",
                    workout_frequency: 3,
                    whyTitle: "Build strength with focused practice",
                    whyThisPlan:
                      "One focused session uses your saved squat record. The planned sets and recovery support steady strength progress.",
                    exercises: [
                      {
                        recordId: documentId.toString(),
                        day: "Monday",
                        focus: "Strength",
                        sets: 3,
                        reps: "8",
                        restTime: 90,
                        kgs: 40,
                        time: "",
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
    });
    Form.find.mockResolvedValue([
      { _id: documentId, name: "Squat", user_id: userId },
    ]);
    Workout.create.mockImplementation(async (data) => {
      const workout = { _id: "generated-id", ...data };
      return { ...workout, toObject: () => workout };
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("lets Gemini choose from the caller’s records and stores a workout", async () => {
    const response = await request(app)
      .post("/api/workouts/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        height: "180 cm",
        weight: "80 kg",
        goals: "Build strength",
        current_workout: "Beginner",
        workout_frequency: 3,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Strength plan");
    expect(response.body.exercises[0]).toEqual(
      expect.objectContaining({
        name: "Squat",
        day: "Monday",
        focus: "Strength",
      }),
    );
    expect(response.body.whyTitle).toBe("Build strength with focused practice");
    expect(Form.find).toHaveBeenCalledWith({
      user_id: userId,
      source: { $ne: "ai-generated" },
    });
    expect(Workout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "ai-generated",
        sourceDocumentIds: [documentId.toString()],
        user_id: userId,
      }),
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain(
      "generativelanguage.googleapis.com",
    );
  });

  it("returns 404 when the authenticated user has no stored records", async () => {
    Form.find.mockResolvedValue([]);
    const response = await request(app)
      .post("/api/workouts/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        height: "180 cm",
        weight: "80 kg",
        goals: "Build strength",
        workout_frequency: 3,
      });

    expect(response.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(Workout.create).not.toHaveBeenCalled();
  });
});
