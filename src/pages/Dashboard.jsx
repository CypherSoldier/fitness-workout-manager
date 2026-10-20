import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, Dumbbell, Plus, Search, TrendingUp, X } from "lucide-react";
import AddExercise from "../components/ExerciseForm";
import WorkoutCard from "../components/ExerciseCard";
import Searchbar from "../components/Searchbar";
import { getApiAuthHeaders } from "../services/apiAuth";

const normalize = (value = "") => value.trim().toLowerCase();
const displayGroup = (value = "") =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [savedExercises, setSavedExercises] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [editingExercise, setEditingExercise] = useState(null);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_BASE}/exercises`,
          { headers: await getApiAuthHeaders() },
        );
        setSavedExercises(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("There was an error fetching exercises:", error);
      }
    };
    loadExercises();
  }, []);

  const muscleGroups = useMemo(
    () => [
      ...new Set(
        savedExercises
          .map((exercise) => displayGroup(exercise.exercise))
          .filter(Boolean),
      ),
    ],
    [savedExercises],
  );

  const filteredExercises = useMemo(
    () =>
      savedExercises.filter(
        (exercise) =>
          `${exercise.name || ""} ${exercise.exercise || ""}`
            .toLowerCase()
            .includes(normalize(query)) &&
          (!selectedDay || exercise.day === selectedDay) &&
          (!selectedMuscle ||
            normalize(exercise.exercise) === normalize(selectedMuscle)),
      ),
    [savedExercises, query, selectedDay, selectedMuscle],
  );

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const todayCount = savedExercises.filter(
    (exercise) => exercise.day === todayName,
  ).length;

  const totalVolume = savedExercises.reduce(
    (total, exercise) =>
      total +
      (Number(exercise.kgs) || 0) *
        (Number(exercise.sets) || 0) *
        (Number(exercise.reps) || 0),
    0,
  );

  const clearFilters = () => {
    setQuery("");
    setSelectedDay("");
    setSelectedMuscle("");
  };

  const handleAddExercise = (exercise) => {
    setSavedExercises((current) => [...current, exercise]);
    setShowForm(false);
  };

  const handleSaveExercise = async (exercise) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_BASE}/exercises/${editingExercise._id}`,
        exercise,
        { headers: await getApiAuthHeaders() },
      );
      setSavedExercises((current) =>
        current.map((item) => (item._id === data._id ? data : item)),
      );
      setEditingExercise(null);
      setShowForm(false);
    } catch (error) {
      console.error("There was an error updating the exercise:", error);
    }
  };

  const handleDeleteExercise = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/exercises/${id}`, {
        headers: await getApiAuthHeaders(),
      });
      setSavedExercises((current) =>
        current.filter((exercise) => exercise._id !== id),
      );
    } catch (error) {
      console.error("There was an error deleting the exercise:", error);
    }
  };

  const openAddForm = () => {
    setEditingExercise(null);
    setShowForm(true);
  };

  return (
    <>
      <section className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1420px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5db8ad]">
                <Dumbbell size={15} /> Your workout
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Training library
              </h1>
              <p className="mt-1 text-sm text-[#89949c]">
                Find the right movement for your next session.
              </p>
            </div>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#12a879] px-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#18bc89]"
              onClick={openAddForm}
            >
              <Plus size={18} /> Add exercise
            </button>
          </section>
          <section
            className="my-9 grid gap-3 md:grid-cols-3"
            aria-label="Workout summary"
          >
            <SummaryCard
              icon={<Dumbbell size={19} />}
              label="Exercises today"
              value={todayCount}
              note="Live from your log"
            />
            <SummaryCard
              icon={<TrendingUp size={19} />}
              iconClass="text-[#a98aff] bg-[#8a6cff1c]"
              label="Weekly volume"
              value={`${totalVolume.toLocaleString()} kg`}
              note="Calculated from saved entries"
            />
            <SummaryCard
              icon={<Activity size={19} />}
              iconClass="text-[#f0ac65] bg-[#ee9e4b1c]"
              label="Current streak"
              value="8 days"
              note="Placeholder until tracking is added"
            />
          </section>
          <section className="border-t border-[#353d42] pt-7">
            <div>
              <h2 className="text-xl font-bold">Exercise log</h2>
              <p className="mt-1 text-sm text-[#89949c]">
                {filteredExercises.length} of {savedExercises.length} exercises
                shown
              </p>
            </div>
            <Searchbar
              query={query}
              setQuery={setQuery}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedMuscle={selectedMuscle}
              setSelectedMuscle={setSelectedMuscle}
              muscleGroups={muscleGroups}
              onClear={clearFilters}
            />
            {filteredExercises.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <WorkoutCard
                    key={exercise._id || `${exercise.name}-${exercise.date}`}
                    exercise={exercise}
                    onDelete={() => handleDeleteExercise(exercise._id)}
                    onEdit={() => {
                      setEditingExercise(exercise);
                      setShowForm(true);
                    }}
                  />
                ))}
                <button
                  onClick={openAddForm}
                  className="grid min-h-[280px] place-content-center justify-items-center gap-2 rounded-[14px] border border-dashed border-[#3b474c] text-[#94a1a9] transition hover:border-[#3cae93] hover:bg-emerald-400/5"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-emerald-400/10 text-[#55d1b1]">
                    <Plus size={22} />
                  </span>
                  <strong className="mt-1 text-sm text-[#d6dfe2]">
                    Add exercise
                  </strong>
                  <small>Track another movement</small>
                </button>
              </div>
            ) : (
              <div className="mt-5 grid min-h-56 place-content-center justify-items-center gap-2 rounded-[14px] border border-dashed border-[#3b474c] text-center text-[#89949c]">
                <Search size={22} />
                <strong className="text-base text-[#e7eef0]">
                  No exercises found
                </strong>
                <span className="text-sm">
                  Try another name, muscle group, or day.
                </span>
                <button
                  className="mt-2 text-sm font-bold text-[#69cbbb] hover:text-white"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </div>
        <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#353d42] px-5 py-4 text-xs text-[#748089] sm:px-8 lg:px-12">
          <span className="font-bold text-[#aab4ba]">Fitness Workout</span>
          <span className="sm:ml-auto">© 2026 Fitness Workout</span>
          <a href="#privacy" className="hover:text-white">
            Privacy
          </a>
          <a href="#support" className="hover:text-white">
            Support
          </a>
        </footer>
      {showForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#536069] bg-[#252b2f] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5db8ad]">
                  {editingExercise ? "Update entry" : "New entry"}
                </p>
                <h2
                  id="exercise-form-title"
                  className="mt-1 text-2xl font-bold"
                >
                  {editingExercise ? "Edit exercise" : "Add an exercise"}
                </h2>
              </div>
              <button
                className="rounded-lg p-2 text-[#aeb8bf] hover:bg-white/10 hover:text-white"
                aria-label="Close dialog"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <AddExercise
              handleAddExercise={
                editingExercise ? handleSaveExercise : handleAddExercise
              }
              initialValues={editingExercise}
            />
          </div>
        </div>
      )}
      </section>
    </>
  );
}

// extract to a separate file
function SummaryCard({
  icon,
  iconClass = "text-[#4fdbc0] bg-[#12a8791a]",
  label,
  value,
  note,
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-[14px] border border-[#353d42] bg-[#22272b] p-4">
      <div
        className={`grid size-10 place-items-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
      <div>
        <span className="text-xs text-[#89949c]">{label}</span>
        <strong className="mt-1 block text-xl">{value}</strong>
      </div>
      <small className="ml-auto max-w-24 text-right text-[10px] text-[#6b8d88]">
        {note}
      </small>
    </div>
  );
}
export default Dashboard;
