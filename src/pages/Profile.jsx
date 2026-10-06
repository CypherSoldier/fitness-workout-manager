import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Save, TrendingUp, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PROFILE_DEFAULTS = {
  units: "Metric (kg/cm)",
  defaultSetsReps: "4 × 8",
  workoutDays: "4 days",
  primaryGoal: "Strength",
  experienceLevel: "Intermediate",
  trainingSince: "2024",
  priorityMuscleGroups: "Chest, back, shoulders",
  injuryHistory: "",
  equipmentAvailable: ["Barbell", "Dumbbells"],
};

const records = [
  { lift: "Bench Press", value: "52 kg", date: "Feb 1, 2026" },
  { lift: "Squat", value: "100 kg", date: "Jan 28, 2026" },
  { lift: "Deadlift", value: "120 kg", date: "Jan 25, 2026" },
];

const inputClass =
  "mt-2 w-full rounded-lg border border-[#3c474d] bg-[#1b2023] px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/15";
const labelClass = "block text-xs font-semibold text-[#b6c1c6]";

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profileKey = useMemo(() => {
    const identity = user?.uid || user?.id || user?.email || "guest";
    return `fitnessProfile:${identity}`;
  }, [user]);
  const [profile, setProfile] = useState(PROFILE_DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    try {
      const cachedProfile = localStorage.getItem(profileKey);
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile({
          ...PROFILE_DEFAULTS,
          ...parsedProfile,
          equipmentAvailable: Array.isArray(parsedProfile.equipmentAvailable)
            ? parsedProfile.equipmentAvailable
            : PROFILE_DEFAULTS.equipmentAvailable,
        });
        setSaveMessage("Profile loaded from this device.");
      }
    } catch (error) {
      console.error("Unable to load cached profile:", error);
      setSaveMessage("Your saved profile could not be loaded.");
    } finally {
      setIsLoaded(true);
    }
  }, [profileKey]);

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
  };

  const toggleEquipment = (item) => {
    const selected = profile.equipmentAvailable.includes(item);
    updateProfile(
      "equipmentAvailable",
      selected
        ? profile.equipmentAvailable.filter((equipment) => equipment !== item)
        : [...profile.equipmentAvailable, item],
    );
  };

  const saveProfile = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setSaveMessage("Profile saved on this device.");
    } catch (error) {
      console.error("Unable to save profile:", error);
      setSaveMessage("Unable to save your profile. Please try again.");
    }
  };

  const displayName =
    user?.displayName || user?.display_name || user?.name || "Fitness member";
  const email = user?.email || "Add an email address to your account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#171b1e] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-emerald-300">
              <UserRound size={15} /> ACCOUNT PROFILE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Your profile
            </h1>
            <p className="mt-2 text-sm text-[#9eabb1]">
              Keep your training preferences and personal details up to date.
            </p>
          </div>
          <button
            type="submit"
            form="profile-form"
            disabled={!isLoaded}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#102019] transition hover:bg-emerald-300 disabled:opacity-50"
          >
            <Save size={16} /> Save profile
          </button>
        </header>

        <form
          id="profile-form"
          onSubmit={saveProfile}
          className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]"
        >
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#343e43] bg-[#202629] p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-700 text-xl font-bold text-[#13211d]">
                  {initials || "FM"}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.14em] text-emerald-300">
                    FITNESS MEMBER
                  </p>
                  <h2 className="mt-1 truncate text-xl font-semibold">
                    {displayName}
                  </h2>
                  <p className="mt-1 truncate text-sm text-[#9eabb1]">
                    {email}
                  </p>
                </div>
              </div>

              <div className="mt-7 border-t border-[#343e43] pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.13em] text-emerald-300">
                      TRAINING PREFERENCES
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      How you like to train
                    </h3>
                  </div>
                  <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    {saveMessage.startsWith("Profile saved")
                      ? "Saved"
                      : "On this device"}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClass}>
                    Units
                    <select
                      value={profile.units}
                      onChange={(event) =>
                        updateProfile("units", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option>Metric (kg/cm)</option>
                      <option>Imperial (lb/ft)</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Default sets × reps
                    <select
                      value={profile.defaultSetsReps}
                      onChange={(event) =>
                        updateProfile("defaultSetsReps", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option>4 × 8</option>
                      <option>3 × 10</option>
                      <option>3 × 12</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Workouts per week
                    <select
                      value={profile.workoutDays}
                      onChange={(event) =>
                        updateProfile("workoutDays", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option>3 days</option>
                      <option>4 days</option>
                      <option>5 days</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#343e43] bg-[#202629] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.13em] text-emerald-300">
                    TRAINING PROFILE
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    Your goals and setup
                  </h3>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#153e35] text-emerald-300">
                  <TrendingUp size={17} />
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="sm:col-span-2">
                  <legend className={labelClass}>Primary goal</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Strength", "Hypertrophy", "Endurance"].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={profile.primaryGoal === goal}
                        onClick={() => updateProfile("primaryGoal", goal)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          profile.primaryGoal === goal
                            ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
                            : "border-[#3c474d] bg-[#1b2023] text-[#aab5ba] hover:border-[#65737a]"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className={labelClass}>
                  Experience level
                  <select
                    value={profile.experienceLevel}
                    onChange={(event) =>
                      updateProfile("experienceLevel", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Training since
                  <input
                    type="text"
                    value={profile.trainingSince}
                    onChange={(event) =>
                      updateProfile("trainingSince", event.target.value)
                    }
                    placeholder="e.g. 2024"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Priority muscle groups
                  <input
                    type="text"
                    value={profile.priorityMuscleGroups}
                    onChange={(event) =>
                      updateProfile("priorityMuscleGroups", event.target.value)
                    }
                    placeholder="Chest, back, shoulders"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Injury history
                  <input
                    type="text"
                    value={profile.injuryHistory}
                    onChange={(event) =>
                      updateProfile("injuryHistory", event.target.value)
                    }
                    placeholder="None reported"
                    className={inputClass}
                  />
                </label>

                <fieldset className="sm:col-span-2">
                  <legend className={labelClass}>Equipment available</legend>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                    {["Barbell", "Dumbbells", "Bench", "Cable machine"].map(
                      (item) => (
                        <label
                          key={item}
                          className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#c4cdd1]"
                        >
                          <input
                            type="checkbox"
                            checked={profile.equipmentAvailable.includes(item)}
                            onChange={() => toggleEquipment(item)}
                            className="h-4 w-4 rounded border-[#56636a] bg-[#1b2023] accent-emerald-400 focus:ring-emerald-400"
                          />
                          {item}
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
              </div>
            </section>
          </div>

          <section className="h-fit rounded-2xl border border-[#343e43] bg-[#202629] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-[0.13em] text-emerald-300">
                  PERSONAL RECORDS
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  Best logged lifts
                </h3>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#153e35] text-emerald-300">
                <Dumbbell size={17} />
              </span>
            </div>
            <p className="mt-2 text-xs text-[#8e9ba1]">
              Auto-calculated from your workout logs.
            </p>
            <div className="mt-5 divide-y divide-[#343e43]">
              {records.map((record) => (
                <div
                  key={record.lift}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{record.lift}</p>
                    <p className="mt-1 text-xs text-[#839097]">{record.date}</p>
                  </div>
                  <strong className="text-sm text-emerald-200">
                    {record.value}
                  </strong>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate("/CypherSoldier/Analytics")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#465158] px-3 py-2 text-xs font-semibold text-[#cbd4d8] transition hover:border-emerald-500 hover:text-emerald-200"
            >
              <TrendingUp size={15} /> View activity
            </button>
          </section>
        </form>

        {saveMessage && (
          <p role="status" className="mt-4 text-sm text-emerald-200">
            {saveMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default ProfilePage;
