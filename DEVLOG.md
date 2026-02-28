- sanlyn-data: transform script done, 75 orders / 9 customers
- portal_orders.json generated (PETSOME 27, PETSOME EU 19, ENRICH 17...)
- Next: CustomerLogistics.jsx fetch portal_orders.json from GitHub
- Portal now reads portal_orders.json from GitHub raw URL
- 75 orders / 9 customers live

- - L4 driver-submit n8n workflow: Webhook Ã¢ÂÂ Build Payload Ã¢ÂÂ Update JDY Driver Info Ã¢ÂÂ Respond to Webhook
  - - driver-submit POST /driver-submit, body: { entry_id, driver_name, driver_phone, plate_no }
    - - JDY customs entry update: _widget_1766737976886 (driver_name), _widget_1766737976887 (driver_phone), _widget_1766737976888 (plate_no)
      - - app_id: 689cb08a93c073210bfc772b, entry_id: 69a08efb981bbbf58c024599 (customs table)
        - - Published 2026-02-28



## 2026-02-28 — n8n GitHub Sync fix + Data Compression

### Completed
- Fixed `写入GitHub` code node (old token expired, syntax errors, read-only property bug)
- Rewrote as self-contained node: fetches JDY API + writes GitHub directly, no upstream dependency
- Data compression achieved:
  - orders.json: 1,224 KB → 33.5 KB (97% reduction), 75 orders, 16 Portal fields only
  - customs.json: 237 KB → 1.28 KB (99.5% reduction), 11 records
  - shipping.json: 143 KB → 68 KB (52% reduction), 16 records
- Execution time: 25.193s, all 3 tables synced successfully
- Hourly auto-sync now working (每小时定时 trigger)

### Tech notes
- Code node: 90 lines, transformOrders / transformCustoms / transformShipping
- Fix method: clipboard paste to avoid typing errors in CodeMirror
- GitHub raw sync URL: https://raw.githubusercontent.com/DamonMusLim/sanlyn-data/main/data/orders.json

## 2026-02-28 — L7 Multi-tenant Auth System Live (Portal)

### Completed (parallel track)
- Multi-tenant login system live (tenantId-based auth)
- First-login force password change modal: petsome / admin tested OK
- App.jsx two syntax errors fixed, Vercel build restored
- ai.sanlynos.com accessible

### Next up
- [ ] L2: App.jsx filter orders by tenantId from JDY real data (use compressed orders.json)
- [ ] n8n: /update-credentials endpoint to persist new password after first-login change
