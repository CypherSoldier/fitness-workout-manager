import { useState } from "react";
import { Upload, Dumbbell } from "lucide-react";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getApiAuthHeaders } from "../services/apiAuth";
//import { default_image } from './assets'

const defaultImageURL =
  "https://static.vecteezy.com/system/resources/previews/015/159/229/non_2x/steel-dumbbell-icon-simple-active-workout-vector.jpg";

function AddExercise({ handleAddExercise, initialValues }) {
  const [setsValue, setSetsValue] = useState(initialValues?.sets || 0);
  const [repsValue, setRepsValue] = useState(initialValues?.reps || 0);
  const [kgsValue, setKgsValue] = useState(initialValues?.kgs || 0);
  const [exerciseValue, setExerciseValue] = useState(
    initialValues?.exercise || "",
  );
  const [nameValue, setNameValue] = useState(initialValues?.name || "");
  const [imageFile, setImageFile] = useState(
    initialValues?.image || defaultImageURL,
  );
  const [user] = useAuthState(auth);
  const [dayValue, setDayValue] = useState(initialValues?.day || "");

  const handleDayChange = (event) => {
    setDayValue(event.target.value);
  };

  const handleInputChangeSets = (event) => {
    setSetsValue(event.target.value);
  };

  const handleInputChangeReps = (event) => {
    setRepsValue(event.target.value);
  };

  const handleInputChangeKgs = (event) => {
    setKgsValue(event.target.value);
  };

  const handleExerciseChange = (event) => {
    setExerciseValue(event.target.value);
  };

  const handleNameInput = (event) => {
    setNameValue(event.target.value);
  };

  function handleImageInput(event) {
    console.log(event.target.files);
    setImageFile(URL.createObjectURL(event.target.files[0]));
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const newExercise = {
      name: nameValue,
      sets: Number(setsValue),
      reps: Number(repsValue),
      kgs: Number(kgsValue),
      exercise: exerciseValue,
      image: imageFile,
      date: new Date().toLocaleDateString("en-CA"),
      user: user?.displayName,
      day: dayValue,
    };

    console.log(newExercise);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getApiAuthHeaders()),
        },
        body: JSON.stringify(newExercise),
      });

      const savedExercise = await response.json();
      if (!response.ok) {
        throw new Error(savedExercise.message || "Unable to save exercise");
      }

      handleAddExercise(savedExercise);

      // Clear form
      setNameValue("");
      setSetsValue(0);
      setRepsValue(0);
      setKgsValue(0);
      setExerciseValue("chest");
      setImageFile(defaultImageURL);
    } catch (error) {
      console.error("There was an error submitting the form!", error);
    }
  };

  return (
    <div className="mb-8">
      <div
        className="rounded-xl p-6 border shadow-lg"
        style={{ backgroundColor: "#282c30", borderColor: "#3a3f44" }}
      >
        <form className="space-y-5" onSubmit={handleFormSubmit}>
          {/* Exercise Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Exercise Name
            </label>
            <input
              type="text"
              placeholder="e.g., Bench Press"
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white placeholder-gray-500"
              style={{
                backgroundColor: "#1e2225",
                borderColor: "#3a3f44",
                "--tw-ring-color": "rgba(17,183,122,.5)",
              }}
              value={nameValue}
              onChange={handleNameInput}
            />
          </div>

          {/* Exercise Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Muscle Group
            </label>
            <select
              value={exerciseValue}
              onChange={handleExerciseChange}
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white cursor-pointer"
              style={{
                backgroundColor: "#1e2225",
                borderColor: "#3a3f44",
                "--tw-ring-color": "rgba(17,183,122,.5)",
              }}
            >
              <option value="">Select muscle group</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="triceps">Triceps</option>
              <option value="biceps">Biceps</option>
              <option value="shoulders">Shoulders</option>
              <option value="legs">Legs</option>
              <option value="abs">Abs</option>
              <option value="isolation">Isolation</option>
            </select>
          </div>

          {/* Day Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Day
            </label>
            <select
              value={dayValue}
              onChange={handleDayChange}
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white cursor-pointer"
              style={{
                backgroundColor: "#1e2225",
                borderColor: "#3a3f44",
                "--tw-ring-color": "rgba(17,183,122,.5)",
              }}
            >
              <option value="">Select workout day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          {/* Sets, Reps, Weight Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sets
              </label>
              <input
                type="number"
                min="0"
                placeholder="3"
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white placeholder-gray-500"
                style={{
                  backgroundColor: "#1e2225",
                  borderColor: "#3a3f44",
                  "--tw-ring-color": "rgba(17,183,122,.5)",
                }}
                value={setsValue}
                onChange={handleInputChangeSets}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reps
              </label>
              <input
                type="number"
                min="1"
                placeholder="10"
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white placeholder-gray-500"
                style={{
                  backgroundColor: "#1e2225",
                  borderColor: "#3a3f44",
                  "--tw-ring-color": "rgba(17,183,122,.5)",
                }}
                value={repsValue}
                onChange={handleInputChangeReps}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 text-white placeholder-gray-500"
                style={{
                  backgroundColor: "#1e2225",
                  borderColor: "#3a3f44",
                  "--tw-ring-color": "rgba(17,183,122,.5)",
                }}
                value={kgsValue}
                onChange={handleInputChangeKgs}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Exercise Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="img"
                accept="image/*"
                className="hidden"
                onChange={handleImageInput}
              />
              <label
                htmlFor="img"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer hover:border-opacity-80 text-gray-400"
                style={{
                  backgroundColor: "#1e2225",
                  borderColor: "#3a3f44",
                  borderStyle: "dashed",
                }}
              >
                <Upload size={20} />
                <span>Click to upload image</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 hover:opacity-90"
            style={{ backgroundColor: "rgba(17,183,122,.856)" }}
          >
            <Dumbbell size={20} />
            Save Workout
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExercise;
