/**
 * Compute a sport-specific GOAT score for one athlete.
 * weights: { dominance, longevity, accolades, eraDifficulty }
 * attributeMeta: [{ name, category, weight }]
 * athlete must have `normalized` object (run normalizeAthletes first).
 */
export function computeSportScore(athlete, attributeMeta, weights) {
  // Group attributes by category, weighted by their importance multiplier
  const categoryScores = { dominance: 0, longevity: 0, accolades: 0, eraDifficulty: 0 };
  const categoryCounts = { dominance: 0, longevity: 0, accolades: 0, eraDifficulty: 0 };

  attributeMeta.forEach(attr => {
    const val = athlete.normalized?.[attr.name] ?? 0;
    categoryScores[attr.category] += val * attr.weight;
    categoryCounts[attr.category] += attr.weight;
  });

  // Normalize each category score to 0–1
  const normalized = {};
  Object.keys(categoryScores).forEach(cat => {
    normalized[cat] = categoryCounts[cat] > 0
      ? categoryScores[cat] / categoryCounts[cat]
      : 0;
  });

  // Weighted sum using user weights
  const score =
    weights.dominance * normalized.dominance +
    weights.longevity * normalized.longevity +
    weights.accolades * normalized.accolades +
    weights.eraDifficulty * normalized.eraDifficulty;

  return {
    score: Math.round(score * 100) / 100,
    breakdown: normalized,
  };
}

/**
 * Compute scores for all athletes in a single sport.
 */
export function computeAllSportScores(athletesBySport, attributeMetaBySport, weights) {
  const result = {};
  Object.entries(athletesBySport).forEach(([sport, athletes]) => {
    result[sport] = {};
    const meta = attributeMetaBySport[sport];
    athletes.forEach(athlete => {
      result[sport][athlete.id] = computeSportScore(athlete, meta, weights);
    });
  });
  return result;
}

/**
 * Compute scores for all athletes in a single sport (flat list).
 */
export function computeSportScoreList(athletes, attributeMeta, weights) {
  const result = {};
  athletes.forEach(athlete => {
    result[athlete.id] = computeSportScore(athlete, attributeMeta, weights);
  });
  return result;
}

/**
 * Compute an overall GOAT score across sports using category breakdowns.
 * Takes { athleteId: { score, breakdown } } for each sport and merges them.
 */
export function computeOverallScores(allSportScores, weights) {
  // Merge sport scores: for each athlete, average category breakdowns across sports they appear in
  const byAthlete = {};

  Object.entries(allSportScores).forEach(([, sportScores]) => {
    Object.entries(sportScores).forEach(([athleteId, { breakdown }]) => {
      if (!byAthlete[athleteId]) {
        byAthlete[athleteId] = { dominance: [], longevity: [], accolades: [], eraDifficulty: [] };
      }
      Object.keys(breakdown).forEach(cat => {
        byAthlete[athleteId][cat].push(breakdown[cat]);
      });
    });
  });

  const result = {};
  Object.entries(byAthlete).forEach(([athleteId, catArrays]) => {
    const avg = {};
    Object.entries(catArrays).forEach(([cat, vals]) => {
      avg[cat] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    result[athleteId] = {
      score: Math.round((
        weights.dominance * avg.dominance +
        weights.longevity * avg.longevity +
        weights.accolades * avg.accolades +
        weights.eraDifficulty * avg.eraDifficulty
      ) * 100) / 100,
      breakdown: avg,
    };
  });

  return result;
}
