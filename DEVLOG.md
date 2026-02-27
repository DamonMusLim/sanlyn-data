# DEVLOG — Sanlyn OS

---

## 2026-02-28 · L2 Complete

### Session Summary
Integrated real JDY order data into CustomerLogistics Freight Hub.

### Work Done
1. Fetched live data from `portal_orders.json` (75 orders, 9 customers)
2. Identified 5 data issues in real JDY export:
   - Empty `pol` field on some orders
   - Missing POD ports (Dammam, Tripoli, Kota Kinabalu)
   - No Xiamen vessel schedules (PETSOME orders all ship from Xiamen)
   - `product` field stored in Chinese — needed brand+category formatting
   - `cbm` stored as string — needed `parseFloat()` handling
3. Fixed all 5 issues in v13
4. Added live data status dot to header
5. Deployed to local Next.js — confirmed working with PETSOME login

### Status
- L1 ✅ UI Complete (v12)
- L2 ✅ Real Data (v13)
- L3 🔲 4portun vessel tracking (AppId: SHYBB — API tested)

### Next Session
- L3: Replace mock MOCK_SCHEDULES with live 4portun vessel data
- Query: `GET /schedules?pol=Qingdao&pod=Port+Klang&appId=SHYBB`
- Replace MOCK_SHIPMENTS with real in-transit tracking data

---

## 2026-02-27 · L1 Complete

### Session Summary
Built full CustomerLogistics UI from scratch (v12).

### Components Built
- `ScheduleCard` — vessel rate card with trend/space indicators
- `OrderDocCard` — shipment tracking + document download
- `SelfBookingPanel` — self-arrange B/L flow (3 tabs)
- `BookingModal` — booking confirmation with no-rollover option
- Hub view with port selector, order multi-select, services panel

### Key Decisions
- FOB orders hide freight pricing (incoterm-based visibility)
- Insurance always visible regardless of incoterm
- Orders grouped by POL, same-POL multi-select only
- All-in toggle vs individual service selection
