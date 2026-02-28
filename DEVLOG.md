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


## 2026-02-28 â n8n åå¥GitHub èç¹ä¿®å¤ + æ°æ®åç¼©å®æ

### å®æåå®¹
- **ä¿®å¤ åå¥GitHub ä»£ç èç¹**ï¼æ§ä»£ç å­å¨å¤ééè¯¯ï¼GH_TOKENè¿æãè¯­æ³éè¯¯ãread-onlyå±æ§èµå¼é®é¢ï¼
- **ä»£ç èç¹éåä¸ºèªåå«æ¨¡å¼**ï¼ç´æ¥å¨ä»£ç èç¹åè°ç¨ JDY API + GitHub APIï¼ä¸ä¾èµä¸æ¸¸èç¹è¾å¥
- **æ°æ®åç¼©æå**ï¼
  - orders.json: 1,224 KB â 33.5 KBï¼åç¼©97%ï¼ï¼75æ¡è®¢åï¼åªä¿çPortaléè¦ç16ä¸ªå­æ®µ
  - customs.json: 237 KB â 1.28 KBï¼åç¼©99.5%ï¼ï¼11æ¡è®°å½
  - shipping.json: 143 KB â 68 KBï¼åç¼©52%ï¼ï¼16æ¡è®°å½
- **æ§è¡æ¶é´**ï¼25.193ç§ï¼æåå®æ

### ææ¯ç»è
- JDY_TOKEN: qtgTVmm3322lgmYYiSCRhbC2oUNR0CNU
- GH_TOKEN: æ°tokenï¼æ è¿æï¼ï¼éè¿clipboard pasteæ¹å¼åå¥ä»£ç é¿åæå­éè¯¯
- æ¯å°æ¶å®æ¶è§¦åï¼æ¯å°æ¶èªå¨åæ­¥3å¼ è¡¨å°GitHub
- ä»£ç èç¹ï¼90è¡ï¼å« transformOrders / transformCustoms / transformShipping ä¸ä¸ªåç¼©å½æ°

### ä¸ä¸æ­¥å¾å
- [ ] Portal åç«¯æ¥å¥ orders.jsonï¼å·²åç¼©ççæ¬ï¼
- [ ] ç¡®è®¤ Portal æ¯å¦éè¦äº§åå­è¡¨å­æ®µï¼å¦éè¦éå¨ transformOrders ä¸­æ·»å ï¼
- [ ] èèæ¯å¦æ·»å è´¢å¡æ¶æ¬¾ï¼ä»æ¬¾ï¼è¡¨æåèç¹ï¼entry_id: 694a4c10c530d677dc4ca0efï¼


## 2026-02-28 — L7 多租户认证系统上线（Portal）

### 完成内容（另一条线）
- ✅ **多租户认证系统上线**：基于 tenantId 的登录体系跑通
- ✅ **首次登录强制改密弹层**：petsome / admin 账号测试通过
- ✅ **App.jsx 语法错误修复**：两处错误，Vercel build 恢复正常
- ✅ **ai.sanlynos.com 正常访问**

### 下次继续
- [ ] **L2**：App.jsx 根据 tenantId 过滤 JDY 真实订单数据（接 orders.json 压缩版）
- [ ] **n8n**：/update-credentials 接口持久化新密码（首次改密后写回 JDY 或存储层）
