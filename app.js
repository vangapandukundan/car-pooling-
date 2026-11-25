// CarPool India — Live Route, AC Meter, AI Optimizer & Fair Split

const AC_MODES = {
  off: { label: 'AC: OFF', multiplier: 0.0, gauge: '8%', color: '#94a3b8' },
  eco: { label: 'AC: ECO (+12%)', multiplier: 0.12, gauge: '52%', color: '#34d399' },
  max: { label: 'AC: MAX (+25%)', multiplier: 0.25, gauge: '100%', color: '#fbbf24' },
};

const state = {
  points: [], // { id, name, lat, lng }
  riders: [], // { id, name, startIdx, endIdx }
  acMode: 'eco',
  selectedCarId: 'swift-2024',
  fuelCity: 'hyderabad',
  fuelType: 'Petrol',
  mileage: 24.8,
  fuelPrice: 116.15,
  baseRate: 4.68,
  tollCost: 0,
  driverSplits: true,
  poolMode: 'segment', // 'segment' | 'detour' | 'equal'
  idleMins: 15,
  restMins: 0,
  acDuringRest: false,
  insertMiddleMode: false,
  mapsConnected: false,
  gmapsLegs: null,
  gpsWatchId: null,
  driverPos: null,
};

// DOM Elements
const startPointInput = document.getElementById('start-point-input');
const startResultsEl = document.getElementById('start-results');
const pointNameInput = document.getElementById('point-name-input');
const searchResultsEl = document.getElementById('search-results');
const destPointInput = document.getElementById('dest-point-input');
const destResultsEl = document.getElementById('dest-results');
const btnToggleMap = document.getElementById('btn-toggle-map');
const mapCollapseEl = document.getElementById('map-collapse');
const btnUseGpsStart = document.getElementById('btn-use-gps-start');
const btnReset = document.getElementById('btn-reset');
const stopListEl = document.getElementById('stop-list');
const stopCountEl = document.getElementById('stop-count');

const acGaugeFill = document.getElementById('ac-gauge-fill');
const acStatusPill = document.getElementById('ac-status-pill');
const acButtons = document.querySelectorAll('.ac-btn');
const carSearchInput = document.getElementById('car-search');
const vehicleTypeSelect = document.getElementById('vehicle-type');
const fuelCitySelect = document.getElementById('fuel-city');
const fuelTypeInput = document.getElementById('fuel-type');
const mileageLabel = document.getElementById('mileage-label');
const fuelPriceLabel = document.getElementById('fuel-price-label');
const mileageInput = document.getElementById('vehicle-mileage');
const fuelPriceInput = document.getElementById('fuel-price');
const baseRateInput = document.getElementById('base-rate');
const tollCostInput = document.getElementById('toll-cost');
const driverSplitsCheck = document.getElementById('driver-splits');
const poolModeSelect = document.getElementById('pool-mode');
const idleMinsInput = document.getElementById('idle-mins');
const restMinsInput = document.getElementById('rest-mins');
const acDuringRestCheck = document.getElementById('ac-during-rest');
const trafficChips = document.querySelectorAll('.chip-btn');
const btnGps = document.getElementById('btn-gps');
const btnAiOptimize = document.getElementById('btn-ai-optimize');
const gpsStatusEl = document.getElementById('gps-status');

const riderNameInput = document.getElementById('rider-name');
const riderStartSelect = document.getElementById('rider-start');
const riderEndSelect = document.getElementById('rider-end');
const btnAddRider = document.getElementById('btn-add-rider');
const riderListEl = document.getElementById('rider-list');
const riderCountEl = document.getElementById('rider-count');

const statDistance = document.getElementById('stat-distance');
const statBaseCost = document.getElementById('stat-base-cost');
const statAcCost = document.getElementById('stat-ac-cost');
const statTollCost = document.getElementById('stat-toll-cost');
const statTotalCost = document.getElementById('stat-total-cost');
const personBreakdownEl = document.getElementById('person-breakdown');
const segmentBreakdownEl = document.getElementById('segment-breakdown');

function distanceKm(p1, p2) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function addStopPoint(name, lat, lng) {
  const pt = { id: Date.now() + Math.random(), name, lat, lng };
  if (state.insertMiddleMode && state.points.length >= 2) {
    state.points.splice(state.points.length - 1, 0, pt);
    state.insertMiddleMode = false;
    pointNameInput.placeholder = 'Search place in India (Start, Middle, Dest)...';
  } else {
    state.points.push(pt);
  }
  state.gmapsLegs = null;
  renderAll();
  updateRoute();
}

function populateCarDropdown(filterText = '') {
  const q = filterText.trim().toLowerCase();
  const filtered = INDIA_CARS.filter((c) => `${c.brand} ${c.model} ${c.fuel} ${c.year}`.toLowerCase().includes(q));

  vehicleTypeSelect.innerHTML = '';
  if (filtered.length === 0) {
    vehicleTypeSelect.add(new Option('No match (use Custom)', 'custom'));
  } else {
    filtered.forEach((car) => {
      const unit = car.fuel === 'CNG' ? 'km/kg' : car.fuel === 'EV' ? 'km/kWh' : 'km/L';
      vehicleTypeSelect.add(new Option(`${car.brand} ${car.model} — ${car.fuel} (${car.mileage} ${unit})`, car.id));
    });
    vehicleTypeSelect.add(new Option('Custom Vehicle', 'custom'));
  }
  if (filtered.some((c) => c.id === state.selectedCarId)) {
    vehicleTypeSelect.value = state.selectedCarId;
  }
}

function applyCarSelection(carId) {
  state.selectedCarId = carId;
  const car = INDIA_CARS.find((c) => c.id === carId);
  if (!car) return;

  state.fuelType = car.fuel;
  state.mileage = car.mileage;
  const cityRates = CITY_FUEL_PRICES[state.fuelCity] || DEFAULT_FUEL_PRICES;
  if (state.fuelCity !== 'custom') {
    state.fuelPrice = cityRates[car.fuel] ?? 116.15;
  }

  fuelTypeInput.value = car.fuel;
  mileageLabel.textContent =
    car.fuel === 'CNG' ? 'Mileage (km/kg)' : car.fuel === 'EV' ? 'Efficiency (km/kWh)' : 'Mileage (km/L)';
  fuelPriceLabel.textContent =
    car.fuel === 'CNG' ? 'Price (₹/kg)' : car.fuel === 'EV' ? 'Tariff (₹/kWh)' : 'Price (₹/L)';
  mileageInput.value = state.mileage;
  fuelPriceInput.value = state.fuelPrice;
  updateBaseRateFromVehicle();
}

function updateBaseRateFromVehicle() {
  const mileage = state.mileage > 0 ? state.mileage : 1;
  state.baseRate = state.fuelPrice / mileage;
  baseRateInput.value = state.baseRate.toFixed(2);
}

function renderStopsList() {
  stopListEl.innerHTML = '';
  stopCountEl.textContent = state.points.length;

  if (state.points.length === 0) {
    stopListEl.innerHTML = '<li class="empty-state">No stops yet. Tap GPS Start, search a place, or click the map.</li>';
    return;
  }

  state.points.forEach((pt, idx) => {
    const isStart = idx === 0;
    const isEnd = idx === state.points.length - 1 && state.points.length > 1;
    const tagClass = isStart ? 'tag-start' : isEnd ? 'tag-end' : 'tag-mid';
    const tagLabel = isStart ? 'START' : isEnd ? 'DEST' : `STOP ${idx}`;

    const li = document.createElement('li');
    li.className = 'stop-item';
    li.innerHTML = `
      <div><span class="stop-tag ${tagClass}">${tagLabel}</span>${pt.name}</div>
      <div class="stop-actions">
        <button class="icon-btn" data-act="up" ${idx === 0 ? 'disabled' : ''} title="Move up">↑</button>
        <button class="icon-btn" data-act="down" ${idx === state.points.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
        <button class="icon-btn danger" data-act="del" title="Remove stop">✕</button>
      </div>
    `;
    li.querySelector('[data-act="up"]').addEventListener('click', () => {
      if (idx === 0) return;
      [state.points[idx - 1], state.points[idx]] = [state.points[idx], state.points[idx - 1]];
      state.gmapsLegs = null;
      renderAll();
      updateRoute();
    });
    li.querySelector('[data-act="down"]').addEventListener('click', () => {
      if (idx >= state.points.length - 1) return;
      [state.points[idx], state.points[idx + 1]] = [state.points[idx + 1], state.points[idx]];
      state.gmapsLegs = null;
      renderAll();
      updateRoute();
    });
    li.querySelector('[data-act="del"]').addEventListener('click', () => {
      state.points.splice(idx, 1);
      state.riders = state.riders
        .filter((r) => r.startIdx < state.points.length && r.endIdx < state.points.length && r.endIdx > r.startIdx);
      state.gmapsLegs = null;
      renderAll();
      updateRoute();
    });
    stopListEl.appendChild(li);
  });
}

function renderPointSelects() {
  const prevStart = riderStartSelect.value;
  const prevEnd = riderEndSelect.value;
  riderStartSelect.innerHTML = '';
  riderEndSelect.innerHTML = '';

  state.points.forEach((pt, idx) => {
    riderStartSelect.add(new Option(`${idx + 1}. ${pt.name}`, idx));
    riderEndSelect.add(new Option(`${idx + 1}. ${pt.name}`, idx));
  });

  if (state.points.length >= 2) {
    riderStartSelect.value = prevStart && Number(prevStart) < state.points.length - 1 ? prevStart : '0';
    riderEndSelect.value =
      prevEnd && Number(prevEnd) > Number(riderStartSelect.value) ? prevEnd : String(state.points.length - 1);
  }
}

function renderRiders() {
  riderListEl.innerHTML = '';
  riderCountEl.textContent = state.riders.length + (state.driverSplits && state.points.length >= 2 ? 1 : 0);

  if (state.riders.length === 0) {
    riderListEl.innerHTML = '<li class="empty-state">Add passengers and their pickup → drop-off stops.</li>';
    return;
  }

  state.riders.forEach((r) => {
    const startName = state.points[r.startIdx]?.name || '?';
    const endName = state.points[r.endIdx]?.name || '?';
    const li = document.createElement('li');
    li.className = 'rider-item';
    li.innerHTML = `
      <div>
        <strong>${r.name}</strong>
        <div class="rider-meta">${startName} → ${endName}</div>
      </div>
      <button class="btn-remove" title="Remove">✕</button>
    `;
    li.querySelector('.btn-remove').addEventListener('click', () => {
      state.riders = state.riders.filter((x) => x.id !== r.id);
      renderAll();
    });
    riderListEl.appendChild(li);
  });
}

function renderAcMeter() {
  const cfg = AC_MODES[state.acMode];
  acGaugeFill.style.width = cfg.gauge;
  acStatusPill.textContent = cfg.label;
  acStatusPill.style.color = cfg.color;
  acButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.ac === state.acMode));
}

function createCollapsibleRow(titleHtml, amountText, formulaText) {
  const row = document.createElement('div');
  row.className = 'breakdown-row';
  row.innerHTML = `
    <div class="breakdown-main">
      <div>${titleHtml}</div>
      <div class="breakdown-right">
        <strong>${amountText}</strong>
        <button class="calc-toggle" title="Show/hide calculation formula">ƒx</button>
      </div>
    </div>
    <div class="calc-formula hidden">${formulaText}</div>
  `;
  const btn = row.querySelector('.calc-toggle');
  const formulaEl = row.querySelector('.calc-formula');
  btn.addEventListener('click', () => formulaEl.classList.toggle('hidden'));
  return row;
}

function calculateAndRenderSummary() {
  const acMult = AC_MODES[state.acMode].multiplier;
  const activePoolParticipants = [...state.riders];
  if (state.driverSplits && state.points.length >= 2) {
    activePoolParticipants.unshift({ id: 'driver', name: 'Driver (You)', startIdx: 0, endIdx: state.points.length - 1 });
  }

  let totalDist = 0;
  const segments = [];

  for (let i = 0; i < state.points.length - 1; i++) {
    const p1 = state.points[i];
    const p2 = state.points[i + 1];
    const leg = state.gmapsLegs && state.gmapsLegs[i];
    const dist = leg ? leg.distanceKm : distanceKm(p1, p2);
    totalDist += dist;

    const activeRiders = activePoolParticipants.filter((r) => r.startIdx <= i && r.endIdx > i);
    const segBase = dist * state.baseRate;
    const segAc = segBase * acMult;
    const segTotal = segBase + segAc;

    segments.push({
      label: `${p1.name} → ${p2.name}`,
      dist,
      segTotal,
      activeRiders,
      trafficMins: leg ? leg.trafficMins : null,
    });
  }

  const baseCost = totalDist * state.baseRate;
  const acMoveCost = baseCost * acMult;
  const totalIdleMins = state.idleMins + (state.acDuringRest ? state.restMins : 0);
  const idleCost = calcIdleFuelCost(totalIdleMins, state.fuelType, state.acMode, state.fuelPrice);
  const acCost = acMoveCost + idleCost;
  const tollCost = state.tollCost || 0;
  const totalCost = baseCost + acCost + tollCost;

  statDistance.textContent = `${totalDist.toFixed(1)} km`;
  statBaseCost.textContent = `₹${baseCost.toFixed(2)}`;
  statAcCost.textContent = `₹${acCost.toFixed(2)}`;
  statTollCost.textContent = `₹${tollCost.toFixed(2)}`;
  statTotalCost.textContent = `₹${totalCost.toFixed(2)}`;

  // Per-person breakdown
  personBreakdownEl.innerHTML = '';
  if (activePoolParticipants.length === 0 || segments.length === 0) {
    personBreakdownEl.innerHTML = '<div class="empty-state">Add at least 2 stops and travelers to see shares.</div>';
  } else {
    const shares = new Map(activePoolParticipants.map((r) => [r.id, 0]));
    const riderSteps = new Map(activePoolParticipants.map((r) => [r.id, []]));
    const extraPerSeg = segments.length > 0 ? (idleCost + tollCost) / segments.length : 0;

    if (state.poolMode === 'equal') {
      const eq = totalCost / activePoolParticipants.length;
      activePoolParticipants.forEach((r) => {
        shares.set(r.id, eq);
        riderSteps.get(r.id).push(`₹${totalCost.toFixed(2)} ÷ ${activePoolParticipants.length} ppl`);
      });
    } else if (state.poolMode === 'detour') {
      const stopDetours = computeStopDetours(state.points, distanceKm);
      const detourCostPerStop = stopDetours.map((d) => d * state.baseRate * (1 + acMult));
      const totalDetourCost = detourCostPerStop.reduce((a, b) => a + b, 0);
      const coreFactor = Math.max(0, baseCost + acMoveCost - totalDetourCost) / Math.max(0.01, baseCost + acMoveCost);

      segments.forEach((seg, sIdx) => {
        if (seg.activeRiders.length > 0) {
          const segCost = seg.segTotal * coreFactor + extraPerSeg;
          const perRider = segCost / seg.activeRiders.length;
          seg.activeRiders.forEach((r) => {
            shares.set(r.id, shares.get(r.id) + perRider);
            riderSteps.get(r.id).push(`₹${segCost.toFixed(2)}÷${seg.activeRiders.length} (Leg ${sIdx + 1})`);
          });
        }
      });

      detourCostPerStop.forEach((dCost, stopIdx) => {
        if (dCost <= 0.01) return;
        const stopRiders = activePoolParticipants.filter((r) => r.startIdx === stopIdx || r.endIdx === stopIdx);
        if (stopRiders.length > 0) {
          const perD = dCost / stopRiders.length;
          stopRiders.forEach((r) => {
            shares.set(r.id, shares.get(r.id) + perD);
            riderSteps.get(r.id).push(`+₹${perD.toFixed(2)} detour`);
          });
        }
      });
    } else {
      segments.forEach((seg, sIdx) => {
        if (seg.activeRiders.length > 0) {
          const segCost = seg.segTotal + extraPerSeg;
          const perRider = segCost / seg.activeRiders.length;
          seg.activeRiders.forEach((r) => {
            shares.set(r.id, shares.get(r.id) + perRider);
            riderSteps.get(r.id).push(`₹${segCost.toFixed(2)}÷${seg.activeRiders.length} (Leg ${sIdx + 1})`);
          });
        }
      });
    }

    const chatLines = [];
    activePoolParticipants.forEach((r) => {
      const fromName = state.points[r.startIdx]?.name || 'Start';
      const toName = state.points[r.endIdx]?.name || 'Dest';
      const legNotes = [];
      let personKm = 0;

      segments.forEach((seg, sIdx) => {
        if (r.startIdx <= sIdx && r.endIdx > sIdx) {
          personKm += seg.dist;
          const others = seg.activeRiders.filter((x) => x.id !== r.id).map((x) => x.name);
          const sharedWith = others.length > 0 ? `shared with ${others.join(', ')}` : 'rode solo';
          const segCost = seg.segTotal + extraPerSeg;
          const myPart = segCost / seg.activeRiders.length;
          legNotes.push(`Leg ${sIdx + 1} (${seg.label}, ${seg.dist.toFixed(1)} km — ${sharedWith}: ₹${myPart.toFixed(2)})`);
        }
      });

      const shareAmt = shares.get(r.id).toFixed(2);
      const formula = riderSteps.get(r.id).join(' + ') || '₹0.00';
      const explanation =
        state.poolMode === 'equal'
          ? `Rode <strong>${fromName} → ${toName}</strong> (${personKm.toFixed(1)} km). Total trip ₹${totalCost.toFixed(2)} split equally among ${activePoolParticipants.length} people.`
          : `Rode <strong>${fromName} → ${toName}</strong> (${personKm.toFixed(1)} km). ${legNotes.join('; ')}.`;

      chatLines.push(`${r.name}: ₹${shareAmt} — ${fromName} to ${toName} (${personKm.toFixed(1)} km)`);

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = `
        <div class="chat-top">
          <span class="chat-sender">💬 ${r.name}</span>
          <div class="breakdown-right">
            <span class="chat-amount">₹${shareAmt}</span>
            <button class="calc-toggle" title="Show/hide formula">ƒx</button>
          </div>
        </div>
        <div class="chat-msg">${explanation}</div>
        <div class="calc-formula hidden">${formula}</div>
      `;
      const toggleBtn = bubble.querySelector('.calc-toggle');
      const formulaEl = bubble.querySelector('.calc-formula');
      toggleBtn.addEventListener('click', () => formulaEl.classList.toggle('hidden'));
      personBreakdownEl.appendChild(bubble);
    });

    const copyBtn = document.getElementById('btn-copy-chat');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const msg = `🚗 CarPool Bill (${totalDist.toFixed(1)} km • Total ₹${totalCost.toFixed(2)}):\n` + chatLines.join('\n');
        navigator.clipboard?.writeText(msg);
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy Bill'; }, 1500);
      };
    }
  }

  // Route Legs breakdown
  segmentBreakdownEl.innerHTML = '';
  if (segments.length === 0) {
    segmentBreakdownEl.innerHTML = '<div class="empty-state">Add at least 2 stops on the map.</div>';
  } else {
    const extraPerSeg = (idleCost + tollCost) / segments.length;
    segments.forEach((seg, sIdx) => {
      const segCost = seg.segTotal + extraPerSeg;
      const names = seg.activeRiders.map((r) => r.name).join(', ') || 'No riders';
      const perEa = seg.activeRiders.length > 0 ? (segCost / seg.activeRiders.length).toFixed(2) : '0.00';
      const title = `Leg ${sIdx + 1}: ${seg.label} <small class="rider-meta">(${seg.dist.toFixed(1)} km • ${seg.activeRiders.length} ppl)</small>`;
      const formula = `${seg.dist.toFixed(1)} km × ₹${state.baseRate.toFixed(2)} × ${(1 + acMult).toFixed(2)} AC + ₹${extraPerSeg.toFixed(2)} idle/toll = ₹${segCost.toFixed(2)} (÷${seg.activeRiders.length || 1} = ₹${perEa}/ea • ${names})`;
      segmentBreakdownEl.appendChild(createCollapsibleRow(title, `₹${segCost.toFixed(2)}`, formula));
    });
  }
}

function renderAll() {
  renderStopsList();
  renderPointSelects();
  renderRiders();
  renderAcMeter();
  calculateAndRenderSummary();
}

// Event Listeners
btnReset.addEventListener('click', () => {
  state.points = [];
  state.riders = [];
  state.gmapsLegs = null;
  startPointInput.value = '';
  pointNameInput.value = '';
  destPointInput.value = '';
  renderAll();
  updateRoute();
});

btnToggleMap.addEventListener('click', () => {
  const isHidden = mapCollapseEl.classList.toggle('hidden');
  btnToggleMap.textContent = isHidden ? '🗺️ Open Map' : '🗺️ Hide Map';
  if (!isHidden) {
    if (!lMap) initMap();
    else setTimeout(() => lMap.invalidateSize(), 100);
    updateRoute();
  }
});

btnUseGpsStart.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported.');
  gpsStatusEl.textContent = '📍 Getting live GPS location...';
  gpsStatusEl.classList.remove('hidden');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      state.driverPos = { lat: latitude, lng: longitude };
      const startPt = { id: Date.now(), name: 'Live GPS Start', lat: latitude, lng: longitude };
      if (state.points.length > 0) state.points[0] = startPt;
      else state.points.push(startPt);
      state.gmapsLegs = null;
      gpsStatusEl.textContent = `📍 Starting Point set (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      if (lMap) lMap.setView([latitude, longitude], 13);
      renderAll();
      updateRoute();
    },
    (err) => {
      gpsStatusEl.textContent = `⚠️ GPS error: ${err.message}`;
    },
    { enableHighAccuracy: true }
  );
});

acButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.acMode = btn.dataset.ac;
    renderAll();
  });
});

trafficChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    trafficChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    state.idleMins = parseInt(chip.dataset.mins, 10);
    idleMinsInput.value = state.idleMins;
    calculateAndRenderSummary();
  });
});

idleMinsInput.addEventListener('input', () => {
  trafficChips.forEach((c) => c.classList.remove('active'));
  const val = parseFloat(idleMinsInput.value);
  state.idleMins = Number.isFinite(val) && val >= 0 ? val : 0;
  calculateAndRenderSummary();
});

restMinsInput.addEventListener('input', () => {
  const val = parseFloat(restMinsInput.value);
  state.restMins = Number.isFinite(val) && val >= 0 ? val : 0;
  calculateAndRenderSummary();
});

acDuringRestCheck.addEventListener('change', () => {
  state.acDuringRest = acDuringRestCheck.checked;
  calculateAndRenderSummary();
});

carSearchInput.addEventListener('input', () => {
  populateCarDropdown(carSearchInput.value);
  const firstVal = vehicleTypeSelect.value;
  if (firstVal && firstVal !== 'custom') {
    applyCarSelection(firstVal);
    calculateAndRenderSummary();
  }
});

vehicleTypeSelect.addEventListener('change', () => {
  if (vehicleTypeSelect.value !== 'custom') applyCarSelection(vehicleTypeSelect.value);
  calculateAndRenderSummary();
});

fuelCitySelect.addEventListener('change', () => {
  state.fuelCity = fuelCitySelect.value;
  if (state.fuelCity !== 'custom') {
    state.fuelPrice = CITY_FUEL_PRICES[state.fuelCity][state.fuelType] ?? 116.15;
    fuelPriceInput.value = state.fuelPrice;
    updateBaseRateFromVehicle();
    calculateAndRenderSummary();
  }
});

mileageInput.addEventListener('input', () => {
  const val = parseFloat(mileageInput.value);
  state.mileage = Number.isFinite(val) && val > 0 ? val : 1;
  vehicleTypeSelect.value = 'custom';
  updateBaseRateFromVehicle();
  calculateAndRenderSummary();
});

fuelPriceInput.addEventListener('input', () => {
  const val = parseFloat(fuelPriceInput.value);
  state.fuelPrice = Number.isFinite(val) && val > 0 ? val : 0;
  fuelCitySelect.value = 'custom';
  updateBaseRateFromVehicle();
  calculateAndRenderSummary();
});

tollCostInput.addEventListener('input', () => {
  const val = parseFloat(tollCostInput.value);
  state.tollCost = Number.isFinite(val) && val >= 0 ? val : 0;
  calculateAndRenderSummary();
});

driverSplitsCheck.addEventListener('change', () => {
  state.driverSplits = driverSplitsCheck.checked;
  renderAll();
});

poolModeSelect.addEventListener('change', () => {
  state.poolMode = poolModeSelect.value;
  calculateAndRenderSummary();
});

btnAddRider.addEventListener('click', () => {
  if (state.points.length < 2) return alert('Add at least 2 stops (Start & Destination) first.');
  const name = riderNameInput.value.trim() || `Person ${state.riders.length + 1}`;
  const startIdx = parseInt(riderStartSelect.value, 10);
  const endIdx = parseInt(riderEndSelect.value, 10);
  if (endIdx <= startIdx) return alert('Drop-off stop must be after pickup stop.');
  state.riders.push({ id: Date.now() + Math.random(), name, startIdx, endIdx });
  riderNameInput.value = '';
  renderAll();
});

btnAiOptimize.addEventListener('click', () => {
  if (state.points.length <= 3) return alert('Add at least 4 stops (Start + 2 middle stops + Dest) to optimize.');
  const result = optimizeIntermediateStops(state.points, distanceKm);
  if (result.savedKm > 0.05) {
    state.points = result.points;
    state.gmapsLegs = null;
    renderAll();
    updateRoute();
    gpsStatusEl.textContent = `✨ AI reordered middle stops: saved ${result.savedKm.toFixed(1)} km`;
  } else {
    gpsStatusEl.textContent = '✨ AI checked: current route order is already optimal.';
  }
  gpsStatusEl.classList.remove('hidden');
});

// Live GPS Tracking
let driverMarker = null;
btnGps.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported.');
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
    btnGps.textContent = '📍 Live GPS';
    gpsStatusEl.classList.add('hidden');
    return;
  }

  btnGps.textContent = '⏹ Stop GPS';
  gpsStatusEl.textContent = '📍 Tracking live route...';
  gpsStatusEl.classList.remove('hidden');

  state.gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      state.driverPos = { lat: latitude, lng: longitude };

      if (state.points.length === 0) {
        state.points.push({ id: Date.now(), name: 'Live GPS Start', lat: latitude, lng: longitude });
        renderAll();
      } else if (state.points[0].name === 'Live GPS Start') {
        state.points[0].lat = latitude;
        state.points[0].lng = longitude;
        updateRoute();
      }

      let etaInfo = '';
      if (state.points.length >= 2) {
        const dest = state.points[state.points.length - 1];
        const remKm = distanceKm(state.driverPos, dest);
        etaInfo = ` • ${remKm.toFixed(1)} km to ${dest.name}`;
      }
      gpsStatusEl.textContent = `📍 Live: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}${etaInfo}`;

      if (lMap) {
        if (!driverMarker) {
          driverMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#34d399',
            color: '#0f172a',
            weight: 2,
            fillOpacity: 1,
          }).addTo(lMap);
        } else {
          driverMarker.setLatLng([latitude, longitude]);
        }
        lMap.panTo([latitude, longitude]);
      }
    },
    (err) => {
      gpsStatusEl.textContent = `⚠️ GPS error: ${err.message}`;
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
});

// Reusable Nominatim Place Search Dropdown (4-5 results as you type)
function attachPlaceSearch(inputEl, resultsEl, onSelect) {
  let timer = null;
  inputEl.addEventListener('input', () => {
    clearTimeout(timer);
    const q = inputEl.value.trim();
    if (q.length < 3) {
      resultsEl.classList.add('hidden');
      return;
    }
    timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=5&q=${encodeURIComponent(q)}`
        );
        const items = await res.json();
        resultsEl.innerHTML = '';
        if (!items || items.length === 0) {
          resultsEl.classList.add('hidden');
          return;
        }
        items.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item.display_name;
          li.addEventListener('click', () => {
            const shortName = item.display_name.split(',')[0];
            onSelect(shortName, parseFloat(item.lat), parseFloat(item.lon));
            resultsEl.classList.add('hidden');
          });
          resultsEl.appendChild(li);
        });
        resultsEl.classList.remove('hidden');
      } catch {
        resultsEl.classList.add('hidden');
      }
    }, 350);
  });
}

attachPlaceSearch(startPointInput, startResultsEl, (name, lat, lng) => {
  const pt = { id: Date.now(), name, lat, lng };
  if (state.points.length > 0) state.points[0] = pt;
  else state.points.push(pt);
  startPointInput.value = name;
  state.gmapsLegs = null;
  renderAll();
  updateRoute();
});

attachPlaceSearch(pointNameInput, searchResultsEl, (name, lat, lng) => {
  state.insertMiddleMode = state.points.length >= 2;
  addStopPoint(name, lat, lng);
  pointNameInput.value = '';
});

attachPlaceSearch(destPointInput, destResultsEl, (name, lat, lng) => {
  const pt = { id: Date.now(), name, lat, lng };
  if (state.points.length >= 2) state.points[state.points.length - 1] = pt;
  else state.points.push(pt);
  destPointInput.value = name;
  state.gmapsLegs = null;
  renderAll();
  updateRoute();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) {
    startResultsEl.classList.add('hidden');
    searchResultsEl.classList.add('hidden');
    destResultsEl.classList.add('hidden');
  }
});

// Free Leaflet + OpenStreetMap + OSRM Map
let lMap = null;
let routeLayer = null;
let markersLayer = null;

function renderMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();
  state.points.forEach((pt, idx) => {
    const isStart = idx === 0;
    const isEnd = idx === state.points.length - 1 && state.points.length > 1;
    const color = isStart ? '#34d399' : isEnd ? '#fbbf24' : '#38bdf8';
    L.circleMarker([pt.lat, pt.lng], {
      radius: 8,
      fillColor: color,
      color: '#0f172a',
      weight: 2,
      fillOpacity: 1,
    })
      .addTo(markersLayer)
      .bindPopup(`${idx + 1}. ${pt.name}`);
  });
}

async function updateRoute() {
  if (lMap) {
    renderMarkers();
    if (routeLayer) routeLayer.clearLayers();
  }

  if (state.points.length < 2) {
    calculateAndRenderSummary();
    return;
  }

  const coords = state.points.map((p) => `${p.lng},${p.lat}`).join(';');
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0];
      if (lMap && routeLayer) {
        const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const poly = L.polyline(latlngs, { color: '#38bdf8', weight: 5, opacity: 0.9 }).addTo(routeLayer);
        lMap.fitBounds(poly.getBounds(), { padding: [25, 25] });
      }

      state.gmapsLegs = route.legs.map((leg) => ({
        distanceKm: leg.distance / 1000,
        trafficMins: Math.max(1, Math.round(leg.duration / 60)),
      }));
    }
  } catch {
    state.gmapsLegs = null;
  }
  calculateAndRenderSummary();
}

function initMap() {
  if (typeof L === 'undefined') return;
  state.mapsConnected = true;
  lMap = L.map('gmap-container').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(lMap);

  routeLayer = L.layerGroup().addTo(lMap);
  markersLayer = L.layerGroup().addTo(lMap);

  lMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const label = state.points.length === 0 ? 'Start' : `Stop ${state.points.length + 1}`;
    addStopPoint(pointNameInput.value.trim() || label, lat, lng);
    pointNameInput.value = '';
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
      },
      () => {},
      { timeout: 4000 }
    );
  }
}

// Initialize cleanly without opening the map first
populateCarDropdown('');
applyCarSelection('swift-2024');
renderAll();
