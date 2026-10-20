const {
  submitExercise,
  retrieveExercise,
  updateExercise,
  deleteExercise,
} = require("./form_controller");
const Form = require("../models/form_model");

jest.mock("../models/form_model");

const user = { id: "account-123", display_name: "Caleb" };
const exercise = {
  name: "Bench Press",
  sets: 4,
  reps: 6,
  kgs: 50,
  exercise: "Chest",
  day: "Tuesday",
};
const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

afterEach(() => jest.clearAllMocks());

test("saves an exercise for the authenticated account", async () => {
  const saved = {
    _id: "exercise-1",
    ...exercise,
    user_id: user.id,
    user: user.display_name,
  };
  Form.create = jest.fn().mockResolvedValue(saved);
  const res = response();

  await submitExercise({ body: exercise, user }, res);

  expect(Form.create).toHaveBeenCalledWith(
    expect.objectContaining({ user_id: user.id, user: user.display_name }),
  );
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(saved);
});

test("retrieves only the authenticated account exercises", async () => {
  const docs = [{ _id: "exercise-1", ...exercise }];
  Form.find = jest.fn().mockResolvedValue(docs);
  const res = response();

  await retrieveExercise({ user }, res);

  expect(Form.find).toHaveBeenCalledWith({ user_id: user.id });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(docs);
});

test("updates only an exercise owned by the authenticated account", async () => {
  const updated = { _id: "exercise-1", ...exercise, sets: 5 };
  Form.findOneAndUpdate = jest.fn().mockResolvedValue(updated);
  const res = response();

  await updateExercise(
    { params: { id: "exercise-1" }, body: { sets: 5 }, user },
    res,
  );

  expect(Form.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: "exercise-1", user_id: user.id },
    { sets: 5 },
    { new: true, runValidators: true },
  );
  expect(res.json).toHaveBeenCalledWith(updated);
});

test("deletes only an exercise owned by the authenticated account", async () => {
  const deleted = { _id: "exercise-1", ...exercise };
  Form.findOneAndDelete = jest.fn().mockResolvedValue(deleted);
  const res = response();

  await deleteExercise({ params: { id: "exercise-1" }, user }, res);

  expect(Form.findOneAndDelete).toHaveBeenCalledWith({
    _id: "exercise-1",
    user_id: user.id,
  });
  expect(res.json).toHaveBeenCalledWith(deleted);
});
