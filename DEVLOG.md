## 2026-03-14 — Session 31 · TT水单全链路打通

### Completed
- TTSlipModal.jsx 新增付款日期字段（type=date，默认今天，colorScheme dark）
- OSS 上传通（sanlyn-api.vercel.app/api/oss-upload）→ tt-slips/{companyCode}/{contract}_{ts}.{ext}
- n8n webhook 打通（path: tt-slip-upload，Webhook → 企业微信通知）
  - 企业微信通知：errcode:0 errmsg:ok
- JDY 收付款直写（前端 fetch 直调 JDY v5 API）
  - app_id: 689cb08a93c073210bfc772b / entry_id: 694a4c10c530d677dc4ca0ef
  - 字段：收款类型/合同号/公司名/金额/付款日期/收付款公司
  - 付款日期 widget: _widget_1773494537707（格式: YYYY-MM-DD 00:00:00）
  - n8n JDY写入节点因 Expression 渲染 bug 无法可靠使用，改为前端直调绕过
- CustomerFinance.jsx 上传成功后卡片状态更新（slipUrl state + 绿色提示 + 按钮切换）
- Build + Deploy: commit 2d907c8 → ai.sanlynos.com

### Tech notes
- n8n webhook path 须手动改为 tt-slip-upload 并重新 Publish，UUID path 不会生效
- sed 注入反引号会被 shell 解释导致 Vite 崩溃，用字符串拼接替代
- JDY list API 默认升序，今天写入的记录在最后，filter 需按 createTime 降序

### Session 32 Next
- L3A 地图：4portun 船舶位置接入（AppId: SHYBB）
  - 修复 sanlyn-api Vercel 代理支持 POST（vessel-track）
  - 用真实在海 BL 号测试 API
  - Leaflet 地图组件显示船位 + 航向
- 前置：Damon 提供真实在海 BL 号

---

## 2026-02-28 — n8n GitHub Sync fix + Data Compression

### Completed
- Fixed 写入GitHub code node (old token expired, syntax errors, read-only property bug)
- Rewrote as self-contained node: fetches JDY API + writes GitHub directly
- Data compression: orders.json 1,224KB→33.5KB (97%), customs.json 237KB→1.28KB, shipping.json 143KB→68KB
- Hourly auto-sync now working

## 2026-02-28 — L7 Multi-tenant Auth System Live

### Completed
- Multi-tenant login system live (tenantId-based auth)
- First-login force password change modal tested OK
- ai.sanlynos.com accessible
