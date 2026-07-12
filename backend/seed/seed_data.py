"""Line-by-line port of frontend/src/data/*.js — keep IDs, values and
relationships identical so a demo walkthrough looks the same on the real
backend as it did on the mock frontend.
"""

DEMO_PASSWORD = "Demo@123"

USERS = [
    dict(
        id="USR-001", name="Aditya Rao", email="admin@transitops.in", role="admin", status="active",
        phone="+91 98200 11122", region="Ahmedabad", avatar_color="bg-violet-600",
    ),
    dict(
        id="USR-002", name="Karan Mehta", email="fleetmanager@transitops.in", role="fleet_manager", status="active",
        phone="+91 98250 22233", region="Ahmedabad", avatar_color="bg-blue-600",
    ),
    dict(
        id="USR-003", name="Ravi Kanojia", email="dispatcher@transitops.in", role="dispatcher", status="active",
        phone="+91 98790 33344", region="Surat", avatar_color="bg-teal-600",
    ),
    dict(
        id="USR-004", name="Neha Joshi", email="safetyofficer@transitops.in", role="safety_officer", status="active",
        phone="+91 98980 44455", region="Vadodara", avatar_color="bg-amber-600",
    ),
    dict(
        id="USR-005", name="Priya Nair", email="financialanalyst@transitops.in", role="financial_analyst",
        status="active", phone="+91 90330 55566", region="Mumbai", avatar_color="bg-emerald-600",
    ),
    dict(
        id="USR-006", name="Suresh Iyer", email="suresh.iyer@transitops.in", role="fleet_manager", status="active",
        phone="+91 98230 66677", region="Rajkot", avatar_color="bg-blue-500",
    ),
    dict(
        id="USR-007", name="Kavita Deshmukh", email="kavita.deshmukh@transitops.in", role="dispatcher",
        status="inactive", phone="+91 90210 77788", region="Pune", avatar_color="bg-teal-500",
    ),
    dict(
        id="USR-008", name="Rohit Malhotra", email="rohit.malhotra@transitops.in", role="safety_officer",
        status="locked", phone="+91 99870 88899", region="Delhi NCR", avatar_color="bg-amber-500",
    ),
]

VEHICLES = [
    dict(id="VEH-001", registration="GJ01AB4521", model="Tata Ace Gold VAN-05", type="Van", capacity_kg=750,
         odometer_km=74320, region="Ahmedabad", acquisition_cost=620000, status="available", utilisation=81,
         operational_cost_monthly=18400, roi=14.2, purchased_on="2023-02-10"),
    dict(id="VEH-002", registration="GJ01AB9987", model="Ashok Leyland Dost TRUCK-11", type="Truck",
         capacity_kg=5000, odometer_km=182430, region="Ahmedabad", acquisition_cost=2450000, status="on_trip",
         utilisation=88, operational_cost_monthly=64200, roi=11.6, purchased_on="2022-06-18"),
    dict(id="VEH-003", registration="GJ01AB1123", model="Mahindra Bolero Pickup MINI-03", type="Mini Truck",
         capacity_kg=1000, odometer_km=65980, region="Surat", acquisition_cost=410000, status="in_shop",
         utilisation=62, operational_cost_monthly=15100, roi=9.8, purchased_on="2023-09-05"),
    dict(id="VEH-004", registration="GJ01AB0087", model="Tata 407 VAN-09", type="Van", capacity_kg=850,
         odometer_km=241900, region="Vadodara", acquisition_cost=590000, status="retired", utilisation=0,
         operational_cost_monthly=0, roi=2.1, purchased_on="2019-03-22"),
    dict(id="VEH-005", registration="GJ05CD3345", model="Eicher Pro 2049 TRUCK-04", type="Truck", capacity_kg=4500,
         odometer_km=98220, region="Surat", acquisition_cost=2180000, status="available", utilisation=76,
         operational_cost_monthly=51800, roi=13.4, purchased_on="2023-01-14"),
    dict(id="VEH-006", registration="GJ06EF7712", model="Force Traveller MINI-08", type="Mini Truck",
         capacity_kg=1200, odometer_km=54200, region="Vadodara", acquisition_cost=480000, status="on_trip",
         utilisation=79, operational_cost_monthly=16800, roi=12.0, purchased_on="2023-11-30"),
    dict(id="VEH-007", registration="MH12GH5541", model="Tata Intra V50 VAN-12", type="Van", capacity_kg=950,
         odometer_km=32110, region="Mumbai", acquisition_cost=710000, status="available", utilisation=68,
         operational_cost_monthly=19200, roi=10.9, purchased_on="2024-02-02"),
    dict(id="VEH-008", registration="MH14JK9982", model="BharatBenz 1617 TRUCK-19", type="Truck", capacity_kg=5500,
         odometer_km=143850, region="Pune", acquisition_cost=2890000, status="in_shop", utilisation=71,
         operational_cost_monthly=68900, roi=8.7, purchased_on="2022-08-09"),
    dict(id="VEH-009", registration="GJ01AB6634", model="Mahindra Supro CONT-02", type="Container",
         capacity_kg=3200, odometer_km=112400, region="Ahmedabad", acquisition_cost=1650000, status="available",
         utilisation=84, operational_cost_monthly=38200, roi=15.8, purchased_on="2022-12-01"),
    dict(id="VEH-010", registration="DL08LM2210", model="Tata Yodha PICKUP-06", type="Pickup", capacity_kg=1500,
         odometer_km=41200, region="Delhi NCR", acquisition_cost=890000, status="on_trip", utilisation=73,
         operational_cost_monthly=21400, roi=11.2, purchased_on="2023-07-19"),
    dict(id="VEH-011", registration="KA05NP4467", model="Ashok Leyland Partner MINI-14", type="Mini Truck",
         capacity_kg=1100, odometer_km=28900, region="Bengaluru", acquisition_cost=460000, status="available",
         utilisation=58, operational_cost_monthly=14200, roi=7.4, purchased_on="2024-04-27"),
    dict(id="VEH-012", registration="GJ01AB8891", model="Tata Ultra 1918 TRUCK-22", type="Truck", capacity_kg=6000,
         odometer_km=205600, region="Rajkot", acquisition_cost=3120000, status="retired", utilisation=0,
         operational_cost_monthly=0, roi=3.6, purchased_on="2018-10-11"),
]

DRIVERS = [
    dict(id="DRV-001", name="Alex Pinto", licence_number="DL-88213", licence_category="LMV",
         licence_expiry="2028-12-15", contact="+91 98765 xxxxx", region="Ahmedabad", safety_score=96,
         status="available", current_assignment=None, trips_completed=214, joined_on="2021-03-04"),
    dict(id="DRV-002", name="John Fernandes", licence_number="DL-44120", licence_category="HMV",
         licence_expiry="2025-03-30", contact="+91 98220 xxxxx", region="Ahmedabad", safety_score=81,
         status="suspended", current_assignment=None, trips_completed=176, joined_on="2020-11-19"),
    dict(id="DRV-003", name="Priya Chauhan", licence_number="DL-77031", licence_category="LMV",
         licence_expiry="2027-08-21", contact="+91 99110 xxxxx", region="Surat", safety_score=99,
         status="on_trip", current_assignment="TRIP-002", trips_completed=301, joined_on="2019-06-01"),
    dict(id="DRV-004", name="Suresh Patil", licence_number="DL-90045", licence_category="HMV",
         licence_expiry="2027-01-09", contact="+91 97440 xxxxx", region="Surat", safety_score=88,
         status="off_duty", current_assignment=None, trips_completed=142, joined_on="2022-01-27"),
    dict(id="DRV-005", name="Meera Krishnan", licence_number="DL-51298", licence_category="LMV",
         licence_expiry="2026-08-20", contact="+91 96330 xxxxx", region="Vadodara", safety_score=93,
         status="available", current_assignment=None, trips_completed=189, joined_on="2021-09-14"),
    dict(id="DRV-006", name="Rakesh Singh", licence_number="DL-33871", licence_category="HMV",
         licence_expiry="2025-08-05", contact="+91 90880 xxxxx", region="Mumbai", safety_score=74,
         status="on_trip", current_assignment="TRIP-009", trips_completed=98, joined_on="2023-02-11"),
    dict(id="DRV-007", name="Anjali Desai", licence_number="DL-60214", licence_category="LMV-TR",
         licence_expiry="2026-04-18", contact="+91 98760 xxxxx", region="Pune", safety_score=91,
         status="on_trip", current_assignment="TRIP-005", trips_completed=167, joined_on="2022-05-30"),
    dict(id="DRV-008", name="Manoj Yadav", licence_number="DL-27754", licence_category="HMV",
         licence_expiry="2025-07-02", contact="+91 99440 xxxxx", region="Delhi NCR", safety_score=68,
         status="suspended", current_assignment=None, trips_completed=121, joined_on="2020-08-22"),
    dict(id="DRV-009", name="Farida Shaikh", licence_number="DL-70933", licence_category="LMV",
         licence_expiry="2029-02-27", contact="+91 91120 xxxxx", region="Bengaluru", safety_score=97,
         status="available", current_assignment=None, trips_completed=58, joined_on="2024-03-19"),
    dict(id="DRV-010", name="Deepak Bhatt", licence_number="DL-15642", licence_category="HMV",
         licence_expiry="2025-09-30", contact="+91 93300 xxxxx", region="Rajkot", safety_score=85,
         status="off_duty", current_assignment=None, trips_completed=133, joined_on="2021-12-05"),
]

TRIPS = [
    dict(id="TRIP-001", source="Gandhinagar Depot", destination="Ahmedabad Hub", vehicle_id=None, driver_id=None,
         cargo_weight_kg=620, planned_distance_km=38, region="Ahmedabad", scheduled_date="2026-07-14",
         scheduled_time="09:00:00", status="draft"),
    dict(id="TRIP-002", source="Surat Port", destination="Vadodara Warehouse", vehicle_id="VEH-002",
         driver_id="DRV-003", cargo_weight_kg=3800, planned_distance_km=152, region="Surat",
         scheduled_date="2026-07-12", scheduled_time="06:30:00", status="dispatched", eta_minutes=45),
    dict(id="TRIP-003", source="Ahmedabad Hub", destination="Rajkot Depot", vehicle_id="VEH-001",
         driver_id="DRV-001", cargo_weight_kg=640, planned_distance_km=216, region="Ahmedabad",
         scheduled_date="2026-07-08", scheduled_time="05:00:00", status="completed"),
    dict(id="TRIP-004", source="Vatva Industrial Area", destination="Sanand Warehouse", vehicle_id=None,
         driver_id=None, cargo_weight_kg=900, planned_distance_km=34, region="Ahmedabad",
         scheduled_date="2026-07-10", scheduled_time="11:00:00", status="cancelled",
         cancel_reason="Assigned vehicle went to shop before dispatch"),
    dict(id="TRIP-005", source="Pune Yard", destination="Mumbai Hub", vehicle_id="VEH-010", driver_id="DRV-007",
         cargo_weight_kg=720, planned_distance_km=148, region="Pune", scheduled_date="2026-07-12",
         scheduled_time="05:15:00", status="dispatched", eta_minutes=110),
    dict(id="TRIP-006", source="Mansa", destination="Kalol Depot", vehicle_id=None, driver_id=None,
         cargo_weight_kg=500, planned_distance_km=41, region="Ahmedabad", scheduled_date="2026-07-09",
         scheduled_time="07:00:00", status="cancelled", cancel_reason="Vehicle went to shop"),
    dict(id="TRIP-007", source="Delhi NCR Hub", destination="Gurugram Depot", vehicle_id="VEH-010",
         driver_id="DRV-010", cargo_weight_kg=1100, planned_distance_km=32, region="Delhi NCR",
         scheduled_date="2026-07-05", scheduled_time="08:00:00", status="completed"),
    dict(id="TRIP-008", source="Bengaluru Yard", destination="Electronic City Hub", vehicle_id=None,
         driver_id=None, cargo_weight_kg=400, planned_distance_km=22, region="Bengaluru",
         scheduled_date="2026-07-15", scheduled_time="10:00:00", status="draft"),
    dict(id="TRIP-009", source="Vadodara Depot", destination="Anand Warehouse", vehicle_id="VEH-006",
         driver_id="DRV-006", cargo_weight_kg=980, planned_distance_km=40, region="Vadodara",
         scheduled_date="2026-07-12", scheduled_time="07:50:00", status="dispatched", eta_minutes=30),
    dict(id="TRIP-010", source="Ahmedabad Hub", destination="Surat Port", vehicle_id="VEH-005",
         driver_id="DRV-004", cargo_weight_kg=4100, planned_distance_km=265, region="Ahmedabad",
         scheduled_date="2026-07-03", scheduled_time="04:00:00", status="completed"),
    dict(id="TRIP-011", source="Rajkot Depot", destination="Morbi Hub", vehicle_id=None, driver_id=None,
         cargo_weight_kg=550, planned_distance_km=65, region="Rajkot", scheduled_date="2026-07-16",
         scheduled_time="09:30:00", status="draft"),
    dict(id="TRIP-012", source="Mumbai Hub", destination="Pune Yard", vehicle_id="VEH-007", driver_id="DRV-005",
         cargo_weight_kg=610, planned_distance_km=150, region="Mumbai", scheduled_date="2026-06-29",
         scheduled_time="06:00:00", status="completed"),
]

MAINTENANCE_RECORDS = [
    dict(id="MNT-001", vehicle_id="VEH-001", service_type="Oil Change", description="Routine engine oil and filter replacement.", cost=2500, service_date="2026-07-05", expected_completion_date="2026-07-05", status="completed"),
    dict(id="MNT-002", vehicle_id="VEH-002", service_type="Engine Repair", description="Turbocharger inspection and repair after warning light.", cost=18000, service_date="2026-07-06", expected_completion_date="2026-07-10", status="completed"),
    dict(id="MNT-003", vehicle_id="VEH-003", service_type="Tyre Replacement", description="Replacing two front tyres, worn tread depth.", cost=6200, service_date="2026-07-11", expected_completion_date="2026-07-13", status="in_shop"),
    dict(id="MNT-004", vehicle_id="VEH-008", service_type="Brake Service", description="Brake pad replacement and disc resurfacing.", cost=9400, service_date="2026-07-09", expected_completion_date="2026-07-14", status="in_shop"),
    dict(id="MNT-005", vehicle_id="VEH-005", service_type="General Inspection", description="Quarterly fitness and safety inspection.", cost=1800, service_date="2026-07-18", expected_completion_date="2026-07-18", status="scheduled"),
    dict(id="MNT-006", vehicle_id="VEH-007", service_type="AC Service", description="Cabin AC gas top-up and filter cleaning.", cost=2200, service_date="2026-07-20", expected_completion_date="2026-07-20", status="scheduled"),
    dict(id="MNT-007", vehicle_id="VEH-009", service_type="Battery Replacement", description="Battery not holding charge, replaced with new unit.", cost=7600, service_date="2026-06-30", expected_completion_date="2026-06-30", status="completed"),
    dict(id="MNT-008", vehicle_id="VEH-011", service_type="Body Repair", description="Minor collision damage repair on rear panel.", cost=14500, service_date="2026-06-25", expected_completion_date="2026-07-02", status="cancelled"),
    dict(id="MNT-009", vehicle_id="VEH-006", service_type="Oil Change", description="Scheduled 10,000 km service interval.", cost=2400, service_date="2026-07-22", expected_completion_date="2026-07-22", status="scheduled"),
    dict(id="MNT-010", vehicle_id="VEH-010", service_type="Tyre Replacement", description="All four tyres replaced ahead of monsoon season.", cost=24800, service_date="2026-06-20", expected_completion_date="2026-06-21", status="completed"),
]

FUEL_LOGS = [
    dict(id="FUEL-001", vehicle_id="VEH-001", date="2026-07-05", quantity_litres=42, cost=3150, odometer_km=74100, station="HP Petrol Pump, SG Highway", receipt_ref="RCPT-88231"),
    dict(id="FUEL-002", vehicle_id="VEH-002", date="2026-07-06", quantity_litres=110, cost=8400, odometer_km=182100, station="IOCL Fuel Station, Vatva", receipt_ref="RCPT-88232"),
    dict(id="FUEL-003", vehicle_id="VEH-006", date="2026-07-06", quantity_litres=28, cost=2050, odometer_km=54050, station="BPCL, Sayajigunj", receipt_ref="RCPT-88233"),
    dict(id="FUEL-004", vehicle_id="VEH-005", date="2026-07-08", quantity_litres=96, cost=7320, odometer_km=97900, station="HP Petrol Pump, Surat Ring Road", receipt_ref="RCPT-88240"),
    dict(id="FUEL-005", vehicle_id="VEH-007", date="2026-07-09", quantity_litres=38, cost=2980, odometer_km=31900, station="Shell, Andheri East", receipt_ref="RCPT-88245"),
    dict(id="FUEL-006", vehicle_id="VEH-010", date="2026-07-10", quantity_litres=62, cost=4870, odometer_km=41050, station="IOCL, Gurugram Expressway", receipt_ref="RCPT-88250"),
    dict(id="FUEL-007", vehicle_id="VEH-009", date="2026-07-10", quantity_litres=74, cost=5760, odometer_km=112200, station="HP Petrol Pump, Naroda", receipt_ref="RCPT-88252"),
    dict(id="FUEL-008", vehicle_id="VEH-001", date="2026-06-28", quantity_litres=40, cost=3020, odometer_km=73600, station="HP Petrol Pump, SG Highway", receipt_ref="RCPT-88190"),
]

EXPENSES = [
    dict(id="EXP-001", vehicle_id="VEH-001", trip_id="TRIP-003", category="Toll", amount=120, date="2026-07-08", description="Ahmedabad-Rajkot expressway toll"),
    dict(id="EXP-002", vehicle_id="VEH-002", trip_id="TRIP-002", category="Toll", amount=340, date="2026-07-12", description="Surat-Vadodara toll plazas"),
    dict(id="EXP-003", vehicle_id="VEH-002", trip_id="TRIP-002", category="Parking", amount=150, date="2026-07-12", description="Overnight parking at Vadodara warehouse"),
    dict(id="EXP-004", vehicle_id="VEH-002", trip_id=None, category="Maintenance", amount=18000, date="2026-07-06", description="Linked to MNT-002 engine repair"),
    dict(id="EXP-005", vehicle_id="VEH-008", trip_id=None, category="Repair", amount=9400, date="2026-07-09", description="Brake pad and disc replacement"),
    dict(id="EXP-006", vehicle_id="VEH-003", trip_id=None, category="Tyre", amount=6200, date="2026-07-11", description="Front tyre replacement"),
    dict(id="EXP-007", vehicle_id="VEH-009", trip_id=None, category="Insurance", amount=32000, date="2026-06-15", description="Annual comprehensive insurance renewal"),
    dict(id="EXP-008", vehicle_id="VEH-005", trip_id=None, category="Permit", amount=4500, date="2026-06-20", description="Interstate national permit renewal"),
    dict(id="EXP-009", vehicle_id="VEH-010", trip_id="TRIP-007", category="Toll", amount=85, date="2026-07-05", description="Delhi-Gurugram toll"),
    dict(id="EXP-010", vehicle_id="VEH-007", trip_id="TRIP-012", category="Miscellaneous", amount=600, date="2026-06-29", description="Loading and unloading labour charges"),
]

SAFETY_INCIDENTS = [
    dict(id="INC-001", driver_id="DRV-002", vehicle_id="VEH-002", type="Harsh braking pattern", severity="high", date="2026-07-01", description="Repeated harsh braking flagged by telematics over 3 trips.", status="under_review"),
    dict(id="INC-002", driver_id="DRV-008", vehicle_id="VEH-010", type="Speeding violation", severity="high", date="2026-06-29", description="Recorded at 92 km/h in a 60 km/h zone near Gurugram.", status="action_taken"),
    dict(id="INC-003", driver_id="DRV-006", vehicle_id="VEH-006", type="Late trip start", severity="low", date="2026-07-08", description="Trip TRIP-009 started 40 minutes behind schedule.", status="closed"),
    dict(id="INC-004", driver_id="DRV-004", vehicle_id="VEH-005", type="Missed inspection checklist", severity="medium", date="2026-06-22", description="Pre-trip inspection checklist not submitted before departure.", status="closed"),
    dict(id="INC-005", driver_id="DRV-002", vehicle_id="VEH-002", type="Licence category mismatch", severity="medium", date="2026-06-10", description="Assigned to HMV trip while licence renewal was pending.", status="under_review"),
]

SAFETY_VIOLATIONS = [
    dict(id="VIO-001", driver_id="DRV-002", description="Two high-severity incidents within 30 days.", raised_on="2026-07-01", status="open"),
    dict(id="VIO-002", driver_id="DRV-008", description="Speeding violation exceeding policy threshold.", raised_on="2026-06-29", status="open"),
    dict(id="VIO-003", driver_id="DRV-006", description="Minor scheduling non-compliance, resolved with counselling.", raised_on="2026-07-08", status="resolved"),
]

NOTIFICATIONS = [
    dict(id="NTF-001", title="Licence expiring soon", message="John Fernandes' HMV licence expires on 30 Mar 2025.", type="warning", read=False),
    dict(id="NTF-002", title="Trip dispatched", message="TRIP-009 dispatched with VAN-08 / Rakesh Singh.", type="info", read=False),
    dict(id="NTF-003", title="Maintenance completed", message="TRUCK-11 engine repair marked completed.", type="success", read=True),
    dict(id="NTF-004", title="High severity incident", message="Speeding violation recorded for Manoj Yadav.", type="error", read=True),
    dict(id="NTF-005", title="Trip cancelled", message="TRIP-006 cancelled — assigned vehicle sent to shop.", type="error", read=True),
    dict(id="NTF-006", title="Monthly report ready", message="June operating expense report is ready to export.", type="info", read=True),
]
