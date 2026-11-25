// Minimalist AI Route Optimizer, Idle/Traffic Fuel Predictor & Detour Fair-Share

const IDLE_CONSUMPTION_PER_HR = {
  Petrol: { off: 0.5, eco: 0.9, max: 1.2 }, // L/hr
  Diesel: { off: 0.4, eco: 0.75, max: 1.0 }, // L/hr
  CNG: { off: 0.45, eco: 0.8, max: 1.05 }, // kg/hr
  EV: { off: 0.3, eco: 1.2, max: 2.2 }, // kWh/hr
};

function calcIdleFuelCost(idleMins, fuelType, acMode, fuelPrice) {
  if (!idleMins || idleMins <= 0) return 0;
  const rates = IDLE_CONSUMPTION_PER_HR[fuelType] || IDLE_CONSUMPTION_PER_HR.Petrol;
  const perHr = rates[acMode] ?? rates.eco;
  return (idleMins / 60) * perHr * fuelPrice;
}

// Reorders intermediate stops (keeps first = Start and last = Destination) to minimize total distance
function optimizeIntermediateStops(points, distFn) {
  if (points.length <= 3) return { points, savedKm: 0 };

  const start = points[0];
  const end = points[points.length - 1];
  const middle = points.slice(1, -1);

  const calcTotal = (arr) => {
    let sum = 0;
    for (let i = 0; i < arr.length - 1; i++) sum += distFn(arr[i], arr[i + 1]);
    return sum;
  };

  const originalDist = calcTotal(points);

  // Nearest-neighbor ordering from start
  const remaining = [...middle];
  const ordered = [start];
  let current = start;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestD = Infinity;
    remaining.forEach((p, idx) => {
      const d = distFn(current, p);
      if (d < bestD) {
        bestD = d;
        bestIdx = idx;
      }
    });
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current);
  }
  ordered.push(end);

  const newDist = calcTotal(ordered);
  return {
    points: newDist < originalDist ? ordered : points,
    savedKm: Math.max(0, originalDist - newDist),
  };
}

// Computes detour km added by each intermediate stop i (1..n-2): d(i-1,i) + d(i,i+1) - d(i-1,i+1)
function computeStopDetours(points, distFn) {
  const detours = new Array(points.length).fill(0);
  for (let i = 1; i < points.length - 1; i++) {
    const direct = distFn(points[i - 1], points[i + 1]);
    const via = distFn(points[i - 1], points[i]) + distFn(points[i], points[i + 1]);
    detours[i] = Math.max(0, via - direct);
  }
  return detours;
}
