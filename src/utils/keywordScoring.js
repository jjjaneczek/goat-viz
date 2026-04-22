import { tagWeights } from "../data/attributeMap";

const CATS = ["dominance", "longevity", "accolades", "eraDifficulty"];

function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

/**
 * Convert a category breakdown (0..1 per category) into a score (0..1)
 * for a user keyword (e.g. "Consistency") using `tagWeights`.
 */
export function keywordScoreFromBreakdown(breakdown, tag) {
	const w = tagWeights?.[tag] || {};
	const denom = Object.values(w).reduce((a, b) => a + Math.abs(b), 0);
	if (!denom) return 0;
	let sum = 0;
	for (const cat of CATS) {
		const weight = w[cat] || 0;
		const val = breakdown?.[cat] || 0;
		sum += weight * val;
	}
	return clamp01(sum / denom);
}

export function keywordVectorFromBreakdown(breakdown, tags) {
	const out = {};
	(tags || []).forEach((t) => {
		out[t] = keywordScoreFromBreakdown(breakdown, t);
	});
	return out;
}

