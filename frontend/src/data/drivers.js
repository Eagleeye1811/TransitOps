export const DRIVER_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  OFF_DUTY: 'off_duty',
  SUSPENDED: 'suspended',
}

export const DRIVER_STATUS_LABELS = {
  [DRIVER_STATUS.AVAILABLE]: 'Available',
  [DRIVER_STATUS.ON_TRIP]: 'On Trip',
  [DRIVER_STATUS.OFF_DUTY]: 'Off Duty',
  [DRIVER_STATUS.SUSPENDED]: 'Suspended',
}

export const LICENCE_CATEGORIES = ['LMV', 'HMV', 'LMV-TR']

export const DRIVERS = [
  {
    id: 'DRV-001',
    name: 'Alex Pinto',
    licenceNumber: 'DL-88213',
    licenceCategory: 'LMV',
    licenceExpiry: '2028-12-15',
    contact: '+91 98765 xxxxx',
    region: 'Ahmedabad',
    safetyScore: 96,
    status: DRIVER_STATUS.AVAILABLE,
    currentAssignment: null,
    tripsCompleted: 214,
    joinedOn: '2021-03-04',
  },
  {
    id: 'DRV-002',
    name: 'John Fernandes',
    licenceNumber: 'DL-44120',
    licenceCategory: 'HMV',
    licenceExpiry: '2025-03-30',
    contact: '+91 98220 xxxxx',
    region: 'Ahmedabad',
    safetyScore: 81,
    status: DRIVER_STATUS.SUSPENDED,
    currentAssignment: null,
    tripsCompleted: 176,
    joinedOn: '2020-11-19',
  },
  {
    id: 'DRV-003',
    name: 'Priya Chauhan',
    licenceNumber: 'DL-77031',
    licenceCategory: 'LMV',
    licenceExpiry: '2027-08-21',
    contact: '+91 99110 xxxxx',
    region: 'Surat',
    safetyScore: 99,
    status: DRIVER_STATUS.ON_TRIP,
    currentAssignment: 'TRIP-002',
    tripsCompleted: 301,
    joinedOn: '2019-06-01',
  },
  {
    id: 'DRV-004',
    name: 'Suresh Patil',
    licenceNumber: 'DL-90045',
    licenceCategory: 'HMV',
    licenceExpiry: '2027-01-09',
    contact: '+91 97440 xxxxx',
    region: 'Surat',
    safetyScore: 88,
    status: DRIVER_STATUS.OFF_DUTY,
    currentAssignment: null,
    tripsCompleted: 142,
    joinedOn: '2022-01-27',
  },
  {
    id: 'DRV-005',
    name: 'Meera Krishnan',
    licenceNumber: 'DL-51298',
    licenceCategory: 'LMV',
    licenceExpiry: '2026-08-20',
    contact: '+91 96330 xxxxx',
    region: 'Vadodara',
    safetyScore: 93,
    status: DRIVER_STATUS.AVAILABLE,
    currentAssignment: null,
    tripsCompleted: 189,
    joinedOn: '2021-09-14',
  },
  {
    id: 'DRV-006',
    name: 'Rakesh Singh',
    licenceNumber: 'DL-33871',
    licenceCategory: 'HMV',
    licenceExpiry: '2025-08-05',
    contact: '+91 90880 xxxxx',
    region: 'Mumbai',
    safetyScore: 74,
    status: DRIVER_STATUS.ON_TRIP,
    currentAssignment: 'TRIP-009',
    tripsCompleted: 98,
    joinedOn: '2023-02-11',
  },
  {
    id: 'DRV-007',
    name: 'Anjali Desai',
    licenceNumber: 'DL-60214',
    licenceCategory: 'LMV-TR',
    licenceExpiry: '2026-04-18',
    contact: '+91 98760 xxxxx',
    region: 'Pune',
    safetyScore: 91,
    status: DRIVER_STATUS.ON_TRIP,
    currentAssignment: 'TRIP-005',
    tripsCompleted: 167,
    joinedOn: '2022-05-30',
  },
  {
    id: 'DRV-008',
    name: 'Manoj Yadav',
    licenceNumber: 'DL-27754',
    licenceCategory: 'HMV',
    licenceExpiry: '2025-07-02',
    contact: '+91 99440 xxxxx',
    region: 'Delhi NCR',
    safetyScore: 68,
    status: DRIVER_STATUS.SUSPENDED,
    currentAssignment: null,
    tripsCompleted: 121,
    joinedOn: '2020-08-22',
  },
  {
    id: 'DRV-009',
    name: 'Farida Shaikh',
    licenceNumber: 'DL-70933',
    licenceCategory: 'LMV',
    licenceExpiry: '2029-02-27',
    contact: '+91 91120 xxxxx',
    region: 'Bengaluru',
    safetyScore: 97,
    status: DRIVER_STATUS.AVAILABLE,
    currentAssignment: null,
    tripsCompleted: 58,
    joinedOn: '2024-03-19',
  },
  {
    id: 'DRV-010',
    name: 'Deepak Bhatt',
    licenceNumber: 'DL-15642',
    licenceCategory: 'HMV',
    licenceExpiry: '2025-09-30',
    contact: '+91 93300 xxxxx',
    region: 'Rajkot',
    safetyScore: 85,
    status: DRIVER_STATUS.OFF_DUTY,
    currentAssignment: null,
    tripsCompleted: 133,
    joinedOn: '2021-12-05',
  },
]

export function getDriverById(id) {
  return DRIVERS.find((d) => d.id === id)
}

export function isLicenceExpiringSoon(expiryDate, withinDays = 60) {
  const expiry = new Date(expiryDate)
  const today = new Date('2026-07-12')
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= withinDays
}

export function isLicenceExpired(expiryDate) {
  return new Date(expiryDate) < new Date('2026-07-12')
}
