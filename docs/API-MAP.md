财务开票（收票）表→大类收票开票→选择订单→订单号→公司名称（英文）客户公司→公司名称（中文）客户公司→总金额（客户）→总金额（工厂）→出单公司→已开票金额→待开票金额→已收票金额→待收票金额→本次开票金额→本次收票金额→发票附件→图片→发票号→（小写）→发票原件→发票类型财务收款（付款）表→单选按钮组产品订单收付款海运收付款→订单类型→收款付款→选择订单→合同号→订单号→公司名称（英文）客户公司→公司名称（中文）客户公司→总金额（客户）→总金额（工厂）→出单公司→已收款金额→待收款金额→已付款金额→待付款金额→香港已收客户→香港已付给巴七→香港未付给巴七→本次收款金额→收款后剩余未收金额# Sanlyn OS — API Integration Map (2026-02-27)

## JDY API
- Key: mpQSRmks1s6ym2dui3BWPhiNcxtxsaoD
- App(进销存): 689cb08a93c073210bfc772b
- Entry(订单主表): 6419d478b9b91b00091e4d73

## 订单字段映射
- _widget_1679903024720 → 订单号 (FS20251225056)
- _widget_1764468507574 → 客户名 (PETSOME SDN BHD)
- _widget_1764591186973 → POL (Qingdao)
- _widget_1764471197748 → POD (Port Klang Westport)
- _widget_1766564550881 → 柜型 (40hq)
- _widget_1764467945301 → 总箱数 (1600)
- _widget_1770887264333 → CBM (7.1)
- _widget_1764467945302 → 总金额 (96000)
- _widget_1768382239273 → 状态 (未完成/已完成/已发货)
- _widget_1766653844751 → 品类 (豆腐猫砂)
- _widget_1764597313371 → 工厂
- _widget_1759392835684 → 品牌 ["NATURAL WORLD"]
- _widget_1765186212190 → 订单日期
- _widget_1766462809214 → 交货日期
- _widget_1768475646834 → Country
- _widget_1770371550210 → country(Other)
- _widget_1771947148663 → Port(Other)

## 产品子表 (_widget_1764396068557)
- _widget_1764396068574 → 产品英文名
- _widget_1764396068578 → 产品编码
- _widget_1764396068583 → 数量CTN
- _widget_1764396068580 → CBM
- _widget_1764396068581 → 重量kg
- _widget_1765186212200 → 单价
- _widget_1764467945303 → 小计
- _widget_1766564356924 → 单箱CBM
- _widget_1764571997306 → 供应商

## 财务字段
- _widget_1766476162844 → 已收金额
- _widget_1766476162846 → 未收金额
- _widget_1766476881438 → 已付工厂
- _widget_1766476881439 → 未付工厂

## 4portun API (船舶追踪)
- AppId: SHYBB, Secret: +I(yuq!AQOBrc9gB
- Auth: POST https://prod-api.4portun.com/openapi/auth/token
- Track: POST /openapi/gateway/api/v2/getOceanTracking
- Subscribe: POST /openapi/gateway/api/v2/subscribeOceanTracking
- Token有效期24h, 事件码: LOBD装船 DLPT离港 BDAR抵达 DSCH卸货

## 数据架构
JDY → n8n → sanlyn-data/data/orders.json → transform → portal_orders.json
Portal fetch GitHub raw URL → 渲染

## 客户数据 (75订单/9客户)
PETSOME:27, PETSOME EU:19, ENRICH:17, HARMONIOUS:6, Eversparkles:2, DIBAQ:1, Magros:1, JJ PET:1, FORTUNESANLYN:1
