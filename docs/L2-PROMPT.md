# L2 Implementation Prompt — JDY Real Data Integration
> Save this file. Paste to Claude in new session to continue L2.
> Last updated: 2026-02-27

## L2 Progress
1. ✅ JDY API tested (key: mpQSRmks1s6ym2dui3BWPhiNcxtxsaoD)
2. ✅ sanlyn-data/data/orders.json (raw JDY)
3. ✅ scripts/transform_orders.py (75 orders, 9 customers)
4. ✅ data/portal_orders.json on GitHub raw:
   https://raw.githubusercontent.com/DamonMusLim/sanlyn-data/main/data/portal_orders.json

## JDY API
- Base: https://api.jiandaoyun.com/api/v5/
- App ID (进销存): 689cb08a93c073210bfc772b
- Entry ID (订单主表): 6419d478b9b91b00091e4d73

## Key Field Mapping (widget → portal)
- _widget_1679903024720 → id (FS20251225056)
- _widget_1764468507574 → customer (PETSOME SDN BHD)
- _widget_1764591186973 → pol (Qingdao)
- _widget_1764471197748 → pod (Port Klang Westport → Port Klang)
- _widget_1766564550881 → containerType (40HQ)
- _widget_1764467945301 → totalCtns (1600)
- _widget_1770887264333 → cbm (7.1)
- _widget_1768382239273 → status (未完成→Production, 已完成→Ready to Ship)
- _widget_1766653844751 → category (豆腐猫砂)
- _widget_1764597313371 → factory
- _widget_1764396068557 → products sub-table

## Customers in data
- PETSOME SDN BHD: 27
- PETSOME (EU) SDN BHD: 19
- ENRICH CHAMPION SDN BHD: 17
- HARMONIOUS HAPPY VENTURES SDN BHD: 6
- Eversparkles Pte Ltd: 2
- DIBAQ (M) SDN BHD: 1
- Others: 3

## 4portun API (L3)
- AppId: SHYBB, Secret: +I(yuq!AQOBrc9gB
- Auth: POST https://prod-api.4portun.com/openapi/auth/token

## Architecture
sanlyn-data (GitHub) → raw URL → Portal fetches JSON → renders

## Next: Modify CustomerLogistics.jsx
1. useEffect fetch portal_orders.json from GitHub raw URL
2. Replace MOCK_ORDERS with fetched data
3. Filter by user.company (tenant)
4. Add loading + error state
5. Deploy + test

## Files
- Portal: Sanlyn-OS/app/components/src/screens/customer/CustomerLogistics.jsx
- Data: sanlyn-data/data/portal_orders.json
- Script: sanlyn-data/scripts/transform_orders.py
- Dev docs: ROADMAP.md, CHANGELOG.md, DEVLOG.md
