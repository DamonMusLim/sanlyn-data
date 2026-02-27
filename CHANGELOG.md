# CHANGELOG — Sanlyn OS

---

## v13 — L2: Real JDY Data Integration
**Date:** 2026-02-28

### What Changed
- `CustomerLogistics.jsx` upgraded from mock data to live GitHub-cached JDY orders
- Orders now filtered by `user.company` (case-insensitive match)

### Fixes
- Empty `pol` orders grouped as "Port TBD" — blocked from booking
- `PORTS_POD` expanded: added Dammam, Tripoli, Kota Kinabalu
- Added Xiamen → Port Klang schedules (COSCO / OOCL / MSC) + Qingdao → Dammam
- `formatOrderProduct()` — brand + category display instead of raw Chinese text
- `parseCbm()` — safe parse for string-format CBM field from JDY

### New
- Live data status indicator in header (green/amber/red dot + order count)
- Error banner when GitHub fetch fails
- Expanded order detail: containerType, SKU count, factory, delivery date

---

## v12 — L1: UI Complete
**Date:** 2026-02-27

### What Changed
- Full CustomerLogistics UI built: Hub → Port Selector → Orders → Services → Vessel
- Self Booking panel
- Air & DDP quote flow
- Inquiry & Order Tracking view
- Incoterm-based price visibility (FOB hides freight price)
- Insurance calculator (0.05% declared value)
- No-Rollover Guarantee toggle
- Mock data: 4 schedules, 3 shipments, 5 SKUs
