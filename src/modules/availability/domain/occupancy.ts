/*
 * Occupancy — pure. A reservation occupies one space on [start, end). The capacity check needs the
 * PEAK number of reservations present at the same instant inside the requested window, not the
 * number of overlapping reservations (two stays that follow each other share one space).
 */

export interface Interval {
  start: number;
  end: number;
}

/** Maximum number of intervals simultaneously present inside [from, to). */
export function peakOccupancy(intervals: readonly Interval[], from: number, to: number): number {
  const events: [time: number, delta: 1 | -1][] = [];
  for (const i of intervals) {
    const s = Math.max(i.start, from);
    const e = Math.min(i.end, to);
    if (s < e) events.push([s, 1], [e, -1]);
  }
  // At the same instant, departures happen before arrivals (end is exclusive).
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let current = 0;
  let peak = 0;
  for (const [, delta] of events) {
    current += delta;
    peak = Math.max(peak, current);
  }
  return peak;
}

export function remainingCapacity(capacity: number, intervals: readonly Interval[], from: number, to: number): number {
  return Math.max(0, capacity - peakOccupancy(intervals, from, to));
}
