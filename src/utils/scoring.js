import { METRICS } from '../data/attributeMap';

export function computeSportScore(athlete, weights) {
  const totalPoints = Object.values(weights).reduce((a, b) => a + b, 0);

  const breakdown = Object.fromEntries(
    METRICS.map(({ key }) => [key, athlete.normalized?.[key] ?? 0])
  );

  if (totalPoints === 0) return { score: 0, breakdown };

  let weightedSum = 0;
  METRICS.forEach(({ key }) => {
    const w = (weights[key] ?? 0) / totalPoints;
    weightedSum += (athlete.normalized?.[key] ?? 0) * w;
  });

  return {
    score: Math.round(weightedSum * 100) / 100,
    breakdown,
  };
}

export function computeAllSportScores(athletesBySport, weights) {
  const result = {};
  Object.entries(athletesBySport).forEach(([sport, athletes]) => {
    result[sport] = {};
    athletes.forEach(athlete => {
      result[sport][athlete.id] = computeSportScore(athlete, weights);
    });
  });
  return result;
}

export function computeSportScoreList(athletes, weights) {
  const result = {};
  athletes.forEach(athlete => {
    result[athlete.id] = computeSportScore(athlete, weights);
  });
  return result;
}

export function computeOverallScores(allSportScores) {
  const result = {};
  Object.values(allSportScores).forEach(sportScores => {
    Object.entries(sportScores).forEach(([athleteId, data]) => {
      result[athleteId] = data;
    });
  });
  return result;
}
