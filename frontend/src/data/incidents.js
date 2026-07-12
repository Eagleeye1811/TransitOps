export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

export const INCIDENT_SEVERITY_LABELS = {
  [INCIDENT_SEVERITY.LOW]: 'Low',
  [INCIDENT_SEVERITY.MEDIUM]: 'Medium',
  [INCIDENT_SEVERITY.HIGH]: 'High',
}

export const SAFETY_INCIDENTS = [
  {
    id: 'INC-001',
    driverId: 'DRV-002',
    vehicleId: 'VEH-002',
    type: 'Harsh braking pattern',
    severity: INCIDENT_SEVERITY.HIGH,
    date: '2026-07-01',
    description: 'Repeated harsh braking flagged by telematics over 3 trips.',
    status: 'under_review',
  },
  {
    id: 'INC-002',
    driverId: 'DRV-008',
    vehicleId: 'VEH-010',
    type: 'Speeding violation',
    severity: INCIDENT_SEVERITY.HIGH,
    date: '2026-06-29',
    description: 'Recorded at 92 km/h in a 60 km/h zone near Gurugram.',
    status: 'action_taken',
  },
  {
    id: 'INC-003',
    driverId: 'DRV-006',
    vehicleId: 'VEH-006',
    type: 'Late trip start',
    severity: INCIDENT_SEVERITY.LOW,
    date: '2026-07-08',
    description: 'Trip TRIP-009 started 40 minutes behind schedule.',
    status: 'closed',
  },
  {
    id: 'INC-004',
    driverId: 'DRV-004',
    vehicleId: 'VEH-005',
    type: 'Missed inspection checklist',
    severity: INCIDENT_SEVERITY.MEDIUM,
    date: '2026-06-22',
    description: 'Pre-trip inspection checklist not submitted before departure.',
    status: 'closed',
  },
  {
    id: 'INC-005',
    driverId: 'DRV-002',
    vehicleId: 'VEH-002',
    type: 'Licence category mismatch',
    severity: INCIDENT_SEVERITY.MEDIUM,
    date: '2026-06-10',
    description: 'Assigned to HMV trip while licence renewal was pending.',
    status: 'under_review',
  },
]

export const SAFETY_VIOLATIONS = [
  {
    id: 'VIO-001',
    driverId: 'DRV-002',
    description: 'Two high-severity incidents within 30 days.',
    raisedOn: '2026-07-01',
    status: 'open',
  },
  {
    id: 'VIO-002',
    driverId: 'DRV-008',
    description: 'Speeding violation exceeding policy threshold.',
    raisedOn: '2026-06-29',
    status: 'open',
  },
  {
    id: 'VIO-003',
    driverId: 'DRV-006',
    description: 'Minor scheduling non-compliance, resolved with counselling.',
    raisedOn: '2026-07-08',
    status: 'resolved',
  },
]
