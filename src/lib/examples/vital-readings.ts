/** Illustrative 1–3-minute readings; firmware cadence is not fixed in planning. */
export function sampleVitalReadings(hours = 4) {
  const end = new Date(2026, 7, 16, 14).getTime();
  const start = end - hours * 60 * 60 * 1000;
  const readings: { time: number; value: number }[] = [];
  for (let time = start, index = 0; time <= end; index++) {
    const value =
      98 +
      Math.sin(index * 1.7) * 0.8 +
      Math.sin(index * 0.31) * 0.6 +
      (index % 19 === 0 ? -1.4 : 0);
    readings.push({ time, value: Math.round(value * 100) / 100 });
    time += (1 + (index % 3)) * 60 * 1000;
  }
  return readings;
}
