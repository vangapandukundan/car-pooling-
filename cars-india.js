// Indian Car Database (2006 - 2026) with typical mileage & fuel type
// Mileage units: km/L for Petrol/Diesel, km/kg for CNG, km/kWh for EV (approx)
const INDIA_CARS = [
  // 2006 - 2012 Classics & Popular Hatchbacks/Sedans
  { id: 'alto-800-2006', brand: 'Maruti Suzuki', model: 'Alto 800 (2006–2012)', year: '2006–2012', fuel: 'Petrol', mileage: 19.7 },
  { id: 'wagonr-2006', brand: 'Maruti Suzuki', model: 'WagonR 1.1 (2006–2010)', year: '2006–2010', fuel: 'Petrol', mileage: 17.5 },
  { id: 'swift-2006', brand: 'Maruti Suzuki', model: 'Swift 1.3 (2006–2011)', year: '2006–2011', fuel: 'Petrol', mileage: 16.5 },
  { id: 'swift-dzire-2008', brand: 'Maruti Suzuki', model: 'Swift Dzire Diesel (2008–2012)', year: '2008–2012', fuel: 'Diesel', mileage: 21.0 },
  { id: 'santro-xing-2006', brand: 'Hyundai', model: 'Santro Xing (2006–2014)', year: '2006–2014', fuel: 'Petrol', mileage: 17.0 },
  { id: 'i10-2007', brand: 'Hyundai', model: 'i10 1.2 Kappa (2007–2013)', year: '2007–2013', fuel: 'Petrol', mileage: 18.0 },
  { id: 'i20-2009', brand: 'Hyundai', model: 'i20 1.4 CRDi (2009–2014)', year: '2009–2014', fuel: 'Diesel', mileage: 21.5 },
  { id: 'indica-v2-2006', brand: 'Tata', model: 'Indica V2 (2006–2013)', year: '2006–2013', fuel: 'Diesel', mileage: 20.0 },
  { id: 'indigo-cs-2008', brand: 'Tata', model: 'Indigo eCS (2008–2015)', year: '2008–2015', fuel: 'Diesel', mileage: 22.0 },
  { id: 'city-2008', brand: 'Honda', model: 'City i-VTEC (2008–2013)', year: '2008–2013', fuel: 'Petrol', mileage: 16.8 },
  { id: 'innova-2006', brand: 'Toyota', model: 'Innova 2.5D (2006–2015)', year: '2006–2015', fuel: 'Diesel', mileage: 12.8 },
  { id: 'scorpio-2007', brand: 'Mahindra', model: 'Scorpio mHawk (2007–2014)', year: '2007–2014', fuel: 'Diesel', mileage: 14.0 },
  { id: 'bolero-2006', brand: 'Mahindra', model: 'Bolero DI/m2DiCR (2006–2019)', year: '2006–2019', fuel: 'Diesel', mileage: 15.9 },
  { id: 'polo-2010', brand: 'Volkswagen', model: 'Polo 1.2 MPI (2010–2019)', year: '2010–2019', fuel: 'Petrol', mileage: 16.5 },

  // 2013 - 2019 Popular Models
  { id: 'alto-k10-2014', brand: 'Maruti Suzuki', model: 'Alto K10 (2014–2020)', year: '2014–2020', fuel: 'Petrol', mileage: 24.0 },
  { id: 'alto-800-cng-2015', brand: 'Maruti Suzuki', model: 'Alto 800 CNG (2013–2022)', year: '2013–2022', fuel: 'CNG', mileage: 31.5 },
  { id: 'baleno-2015', brand: 'Maruti Suzuki', model: 'Baleno 1.2 (2015–2021)', year: '2015–2021', fuel: 'Petrol', mileage: 21.4 },
  { id: 'brezza-2016', brand: 'Maruti Suzuki', model: 'Vitara Brezza DDiS (2016–2019)', year: '2016–2019', fuel: 'Diesel', mileage: 24.3 },
  { id: 'ertiga-2018', brand: 'Maruti Suzuki', model: 'Ertiga 1.5 Petrol (2018–2022)', year: '2018–2022', fuel: 'Petrol', mileage: 19.0 },
  { id: 'creta-2015', brand: 'Hyundai', model: 'Creta 1.6 CRDi (2015–2019)', year: '2015–2019', fuel: 'Diesel', mileage: 19.6 },
  { id: 'tiago-2016', brand: 'Tata', model: 'Tiago 1.2 Revotron (2016–2022)', year: '2016–2022', fuel: 'Petrol', mileage: 20.0 },
  { id: 'nexon-2017', brand: 'Tata', model: 'Nexon 1.5 Diesel (2017–2022)', year: '2017–2022', fuel: 'Diesel', mileage: 21.5 },
  { id: 'innova-crysta-2016', brand: 'Toyota', model: 'Innova Crysta 2.4D (2016–2023)', year: '2016–2023', fuel: 'Diesel', mileage: 13.6 },
  { id: 'kwid-2015', brand: 'Renault', model: 'Kwid 1.0 (2015–2023)', year: '2015–2023', fuel: 'Petrol', mileage: 22.0 },
  { id: 'seltos-2019', brand: 'Kia', model: 'Seltos 1.5 Petrol (2019–2023)', year: '2019–2023', fuel: 'Petrol', mileage: 16.8 },
  { id: 'hector-2019', brand: 'MG', model: 'Hector 1.5 Turbo (2019–2023)', year: '2019–2023', fuel: 'Petrol', mileage: 13.8 },

  // 2020 - 2026 Latest Cars (ICE, Hybrid, CNG & EVs)
  { id: 'swift-2024', brand: 'Maruti Suzuki', model: 'Swift Z-Series (2024–2026)', year: '2024–2026', fuel: 'Petrol', mileage: 24.8 },
  { id: 'dzire-2024', brand: 'Maruti Suzuki', model: 'Dzire 1.2L (2024–2026)', year: '2024–2026', fuel: 'Petrol', mileage: 24.7 },
  { id: 'dzire-cng-2025', brand: 'Maruti Suzuki', model: 'Dzire S-CNG (2024–2026)', year: '2024–2026', fuel: 'CNG', mileage: 33.7 },
  { id: 'wagonr-cng-2023', brand: 'Maruti Suzuki', model: 'WagonR S-CNG (2022–2026)', year: '2022–2026', fuel: 'CNG', mileage: 34.0 },
  { id: 'grand-vitara-hybrid-2023', brand: 'Maruti Suzuki', model: 'Grand Vitara Strong Hybrid (2022–2026)', year: '2022–2026', fuel: 'Petrol', mileage: 27.9 },
  { id: 'fronx-2023', brand: 'Maruti Suzuki', model: 'Fronx 1.2L (2023–2026)', year: '2023–2026', fuel: 'Petrol', mileage: 21.8 },
  { id: 'evitara-2025', brand: 'Maruti Suzuki', model: 'e Vitara EV (2025–2026)', year: '2025–2026', fuel: 'EV', mileage: 8.2 },
  { id: 'punch-2022', brand: 'Tata', model: 'Punch 1.2 Petrol (2021–2026)', year: '2021–2026', fuel: 'Petrol', mileage: 20.1 },
  { id: 'punch-ev-2024', brand: 'Tata', model: 'Punch.ev Long Range (2024–2026)', year: '2024–2026', fuel: 'EV', mileage: 8.5 },
  { id: 'nexon-ev-2024', brand: 'Tata', model: 'Nexon.ev 45 kWh (2024–2026)', year: '2024–2026', fuel: 'EV', mileage: 8.0 },
  { id: 'curvv-ev-2024', brand: 'Tata', model: 'Curvv.ev (2024–2026)', year: '2024–2026', fuel: 'EV', mileage: 7.8 },
  { id: 'harrier-2024', brand: 'Tata', model: 'Harrier 2.0 Kryotec (2023–2026)', year: '2023–2026', fuel: 'Diesel', mileage: 16.8 },
  { id: 'creta-2024', brand: 'Hyundai', model: 'Creta 1.5 Diesel (2024–2026)', year: '2024–2026', fuel: 'Diesel', mileage: 21.8 },
  { id: 'creta-ev-2025', brand: 'Hyundai', model: 'Creta Electric (2025–2026)', year: '2025–2026', fuel: 'EV', mileage: 8.1 },
  { id: 'exter-cng-2024', brand: 'Hyundai', model: 'Exter Hy-CNG Duo (2024–2026)', year: '2024–2026', fuel: 'CNG', mileage: 27.1 },
  { id: 'xuv700-2022', brand: 'Mahindra', model: 'XUV700 2.2 Diesel (2021–2026)', year: '2021–2026', fuel: 'Diesel', mileage: 16.5 },
  { id: 'xuv3xo-2024', brand: 'Mahindra', model: 'XUV 3XO 1.2 Turbo (2024–2026)', year: '2024–2026', fuel: 'Petrol', mileage: 18.9 },
  { id: 'be6-2025', brand: 'Mahindra', model: 'BE 6 Electric (2025–2026)', year: '2025–2026', fuel: 'EV', mileage: 7.6 },
  { id: 'thar-roxx-2024', brand: 'Mahindra', model: 'Thar Roxx 2.2D (2024–2026)', year: '2024–2026', fuel: 'Diesel', mileage: 15.2 },
  { id: 'sonet-2024', brand: 'Kia', model: 'Sonet 1.5 Diesel (2024–2026)', year: '2024–2026', fuel: 'Diesel', mileage: 22.3 },
  { id: 'syros-2025', brand: 'Kia', model: 'Syros 1.0 Turbo (2025–2026)', year: '2025–2026', fuel: 'Petrol', mileage: 18.2 },
  { id: 'hycross-2023', brand: 'Toyota', model: 'Innova Hycross Hybrid (2023–2026)', year: '2023–2026', fuel: 'Petrol', mileage: 23.2 },
  { id: 'city-ehev-2023', brand: 'Honda', model: 'City e:HEV Hybrid (2022–2026)', year: '2022–2026', fuel: 'Petrol', mileage: 27.1 },
  { id: 'elevate-2023', brand: 'Honda', model: 'Elevate 1.5 i-VTEC (2023–2026)', year: '2023–2026', fuel: 'Petrol', mileage: 16.9 },
  { id: 'kylaq-2025', brand: 'Skoda', model: 'Kylaq 1.0 TSI (2025–2026)', year: '2025–2026', fuel: 'Petrol', mileage: 19.0 },
  { id: 'virtus-2022', brand: 'Volkswagen', model: 'Virtus 1.0 TSI (2022–2026)', year: '2022–2026', fuel: 'Petrol', mileage: 19.4 },
  { id: 'windsor-ev-2024', brand: 'MG', model: 'Windsor EV (2024–2026)', year: '2024–2026', fuel: 'EV', mileage: 8.7 },
];

const CITY_FUEL_PRICES = {
  delhi: { label: 'New Delhi', Petrol: 102.12, Diesel: 95.20, CNG: 86.98, EV: 8.50 },
  mumbai: { label: 'Mumbai', Petrol: 111.21, Diesel: 97.83, CNG: 91.50, EV: 10.00 },
  bengaluru: { label: 'Bengaluru', Petrol: 110.44, Diesel: 99.56, CNG: 99.00, EV: 9.50 },
  hyderabad: { label: 'Hyderabad', Petrol: 116.15, Diesel: 104.23, CNG: 115.00, EV: 9.50 },
};

const DEFAULT_FUEL_PRICES = CITY_FUEL_PRICES.delhi;
