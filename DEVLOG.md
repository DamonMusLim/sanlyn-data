## 2026-03-15 — Session 32: L3A 船舶追踪 + Overview 海运卡片

### Completed
- 修复全部 n8n workflow GitHub PAT（新 token，10个 workflow 全部更新）
- L3B 关闭（active=false）
- L3A 修复：Filter BLs 改用 blNo（箱号为空也能订阅）
- 3条提单订阅成功（OOLU CY00042 / KMTC CY00044 / MSC CY00045 177HJYJYQ14468V）
- VesselMap.jsx 组件（Leaflet，ETD→ETA 时间估算位置）
- CustomerLogistics Hub 接入地图
- CustomerOverview 海运卡片 ShipmentCard（BL/航线/进度条/Overdue红色）
- In Transit tab 显示海运卡片
- Active tab（7天内更新，updatedAt 降序，默认打开）
- .gitignore 修复 node_modules
- Vercel framework=null 修复（404 根因）

### Key bugs
- esbuild TDZ：render 回调禁止声明变量 → useMemo
- shipping_plans.json 是 plain array 不是 {data:[]}
- URL typo：ship_plans → shipping_plans
- Vercel domain binding 每次 redeploy 需手动绑

### Session 33 TODO
- L3B 改造：subscriptionId → 4portun 真实位置 → shipping_plans
- 海运卡片加 orderNos / SKU
- KMTC Delivered 状态
- BUG-006 Vercel 自动 build
