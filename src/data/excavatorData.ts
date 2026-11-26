// Demo operational data for excavators. Shaped so an API slice can replace it later.

export interface ExcavatorProfile {
  assetId: string;
  make: string;
  model: string;
  serialNumber: string;
  plateOrFleetNo: string;
  yearOfManufacture: number;
  bucketCapacityM3: number;
  operatingWeightTons: number;
  hoursMeter: number;
  /** Service every N engine hours. */
  serviceIntervalHours: number;
  lastServiceHours: number;
  insuranceExpiry: string;
  dailyRate: number;
  operatorRate: number;
  mobilisationFee: number;
}

export interface ExcavatorBooking {
  id: string;
  assetId: string;
  client: string;
  site: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD inclusive
  withOperator: boolean;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  /** Customer name, for bookings made through the customer portal. */
  customer?: string;
}

export interface ExcavatorLog {
  id: string;
  assetId: string;
  date: string;
  operator: string;
  site: string;
  hoursWorked: number;
  fuelLitres: number;
  notes?: string;
}

export interface ExcavatorServiceRecord {
  id: string;
  assetId: string;
  date: string;
  atHours: number;
  description: string;
  cost: number;
}

export const EXCAVATOR_PROFILES: ExcavatorProfile[] = [
  {
    assetId: 'excavator_1',
    make: 'Caterpillar',
    model: '320 GC',
    serialNumber: 'CAT0320GCXXXX01',
    plateOrFleetNo: 'BH-EXC-01',
    yearOfManufacture: 2021,
    bucketCapacityM3: 1.2,
    operatingWeightTons: 22,
    hoursMeter: 3480,
    serviceIntervalHours: 250,
    lastServiceHours: 3300,
    insuranceExpiry: '2026-12-31',
    dailyRate: 35000,
    operatorRate: 35000,
    mobilisationFee: 45000,
  },
  {
    // Second machine: make, model, serial and meter readings to be confirmed by the owner.
    assetId: 'excavator_2',
    make: 'TBC',
    model: 'TBC',
    serialNumber: 'TBC',
    plateOrFleetNo: 'BH-EXC-02',
    yearOfManufacture: 0,
    bucketCapacityM3: 0,
    operatingWeightTons: 0,
    hoursMeter: 0,
    serviceIntervalHours: 250,
    lastServiceHours: 0,
    insuranceExpiry: '2026-12-31',
    dailyRate: 35000,
    operatorRate: 35000,
    mobilisationFee: 45000,
  },
];

export const EXCAVATOR_BOOKINGS: ExcavatorBooking[] = [
  { id: 'bk_1', assetId: 'excavator_1', client: 'Construction Co.', site: 'Lekki Phase 2', start: '2026-11-02', end: '2026-11-10', withOperator: true, status: 'completed' },
  { id: 'bk_2', assetId: 'excavator_1', client: 'Okafor Builders', site: 'Ikorodu Road', start: '2026-11-24', end: '2026-12-05', withOperator: true, status: 'active' },
];

export const EXCAVATOR_LOGS: ExcavatorLog[] = [
  { id: 'lg_1', assetId: 'excavator_1', date: '2026-11-24', operator: 'Musa Ibrahim', site: 'Ikorodu Road', hoursWorked: 8, fuelLitres: 140 },
  { id: 'lg_2', assetId: 'excavator_1', date: '2026-11-25', operator: 'Musa Ibrahim', site: 'Ikorodu Road', hoursWorked: 9, fuelLitres: 165 },
  { id: 'lg_3', assetId: 'excavator_1', date: '2026-11-26', operator: 'Musa Ibrahim', site: 'Ikorodu Road', hoursWorked: 6, fuelLitres: 100, notes: 'Rain delay' },
];

export const EXCAVATOR_SERVICES: ExcavatorServiceRecord[] = [
  { id: 'sv_1', assetId: 'excavator_1', date: '2026-08-14', atHours: 3300, description: 'Engine oil, filters, hydraulic check', cost: 185000 },
  { id: 'sv_2', assetId: 'excavator_1', date: '2026-04-02', atHours: 3050, description: 'Track tension, bucket teeth replacement', cost: 240000 },
];
