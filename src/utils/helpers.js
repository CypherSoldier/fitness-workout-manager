// Get week key from date
/*
const getWeekKey = (dateString) => {
    const date = new Date(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};
*/

// build unique_logs
const buildUniqueLogs = (data) => {
  const unique = {};
  data.forEach((entry) => {
    if (
      !unique[entry.name] ||
      unique[entry.name].last_updated < entry.last_updated
    ) {
      unique[entry.name] = entry;
    }
  });

  return Object.values(unique);
};

const computeMuscleStats = (data) => {
  data.unique_logs = buildUniqueLogs(data.logs);
  data.count = data.unique_logs.length;
  data.totalVolume = data.unique_logs.reduce(
    (sum, entry) => sum + entry.kgs * entry.sets * entry.reps,
    0,
  );
  data.volumeTrend.labels = data.unique_logs.map((entry) => entry.name);
  data.volumeTrend.data = data.unique_logs.map(
    (entry) => entry.kgs * entry.sets * entry.reps,
  );
  data.sets = data.unique_logs.reduce((sum, entry) => sum + entry.sets, 0);
}; // can be written as ->
/*
const calculateMetrics = (uniqueLogs) => {
  return uniqueLogs.reduce((acc, log) => {
    const volume = log.kgs * log.sets * log.reps;

    acc.totalVolume += volume;
    acc.sets += log.sets;
    acc.labels.push(log.exercise);
    acc.data.push(volume);

    return acc;
  }, {
    totalVolume: 0,
    sets: 0,
    labels: [],
    data: []
  });
};
*/

// Maps exercises to muscle groups
const buildMuscleMap = (data, map) => {
  data.forEach((entry) => {
    const group =
      entry.exercise.charAt(0).toUpperCase() + entry.exercise.slice(1); // "C" + "hest"
    if (!map[entry.name]) {
      map[entry.name] = group;
    }
  });
};

const groupByMuscle = (data, map) => {
  data.forEach((entry) => {
    const group =
      entry.exercise.charAt(0).toUpperCase() + entry.exercise.slice(1);
    if (map[group]) {
      map[group].logs.push(entry);
    }
  });
};

const buildAllSummary = (data) => ({
  grandTotal: Object.values(data).reduce(
    (sum, entry) => sum + entry.totalVolume,
    0,
  ),
  totalExercises: Object.values(data).reduce(
    (sum, entry) => sum + entry.count,
    0,
  ),
  muscleGroupVolumes: {
    muscle_groups: Object.keys(data),
    volume: Object.values(data).map((entry) => entry.totalVolume),
    sets: Object.values(data).map((entry) => entry.sets),
  },
});

export {
  buildUniqueLogs,
  computeMuscleStats,
  buildMuscleMap,
  groupByMuscle,
  buildAllSummary,
};
