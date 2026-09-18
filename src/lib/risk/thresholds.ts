/**
 * Named threshold/window constants for Phase 2's risk-scoring engine.
 * Each constant cites the CONTEXT.md decision ID it encodes.
 */

/** D-13: fever threshold — temp >= this is abnormal (inclusive). */
export const TEMP_FEVER_C = 38.0;

/**
 * D-13: hypothermia threshold — temp < this is abnormal (exclusive).
 * Together with TEMP_FEVER_C this forms D-13's asymmetric >=/< boundary:
 * exactly 35.5 is NOT abnormal, but exactly 38.0 IS abnormal.
 */
export const TEMP_HYPOTHERMIA_C = 35.5;

/**
 * Liebermeister's rule band (inclusive-normal) — a HR/temp delta ratio
 * inside [HR_TEMP_RATIO_MIN, HR_TEMP_RATIO_MAX] bpm/°C is considered a
 * normal fever response; outside it (either direction) is abnormal.
 */
export const HR_TEMP_RATIO_MIN = 6;
export const HR_TEMP_RATIO_MAX = 14;

/**
 * Below this delta-temp magnitude (°C), the HR/temp ratio is not
 * computable — avoids a near-zero-denominator blowup.
 */
export const MIN_DELTA_TEMP_C = 0.1;

/**
 * D-14: current activityScore at or below this fraction of the personal
 * baseline counts as declining. Expressed as a ratio (not an absolute
 * unit) since activityScore has no documented fixed range.
 */
export const ACTIVITY_DECLINE_RATIO = 0.7;

/** D-15: rolling trend window, applied uniformly across all 3 v1 features. */
export const TREND_WINDOW_MS = 12 * 60 * 60 * 1000;

/**
 * D-18: minimum history duration (from the window's earliest reading to
 * the target reading) before the personal baseline is considered
 * established.
 */
export const BASELINE_MIN_MS = 60 * 60 * 1000;
