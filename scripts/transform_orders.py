#!/usr/bin/env python3
import json, os
from datetime import datetime

INPUT  = os.path.join(os.path.dirname(__file__), "..", "data", "orders.json")
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "data", "portal_orders.json")

def map_status(s):
    if not s or s == "未完成": return "Production"
    if s == "已完成": return "Ready to Ship"
    if s == "已发货": return "Shipped"
    return s

def fmt_date(d):
    if not d: return ""
    try: return datetime.fromisoformat(d.replace("Z","+00:00")).strftime("%Y-%m-%d")
    except: return d

def clean_pod(pod):
    if not pod: return ""
    return pod.replace(" Westport","").replace(" Northport","")

def transform_order(o):
    products, total_cbm, total_weight, total_ctns = [], 0, 0, 0
    for p in (o.get("_widget_1764396068557") or []):
        cbm = float(p.get("_widget_1764396068580") or 0)
        weight = float(p.get("_widget_1764396068581") or 0)
        qty = int(p.get("_widget_1764396068583") or 0)
        total_cbm += cbm; total_weight += weight; total_ctns += qty
        products.append({"name":p.get("_widget_1764396068574",""),"sku":p.get("_widget_1764396068578",""),"spec":p.get("_widget_1764396068575",""),"qty":qty,"cbm":round(cbm,2),"weight":round(weight,2),"unitPrice":p.get("_widget_1765186212200"),"subtotal":p.get("_widget_1764467945303"),"supplier":p.get("_widget_1764571997306","")})
    order_cbm = o.get("_widget_1770887264333") or total_cbm or 0
    order_ctns = o.get("_widget_1764467945301") or total_ctns
    brands = o.get("_widget_1759392835684") or []
    category = o.get("_widget_1766653844751") or ""
    return {"id":o.get("_widget_1679903024720",""),"customerRef":o.get("_widget_1756914144559",""),"customer":o.get("_widget_1764468507574",""),"pol":o.get("_widget_1764591186973",""),"pod":clean_pod(o.get("_widget_1764471197748","")),"containerType":(o.get("_widget_1766564550881") or "").upper(),"totalCtns":order_ctns,"cbm":str(round(float(order_cbm),1)),"weight":f"{round(total_weight):,} kg" if total_weight else f"{order_ctns} CTN","totalAmount":o.get("_widget_1764467945302"),"orderDate":fmt_date(o.get("_widget_1765186212190")),"deliveryDate":fmt_date(o.get("_widget_1766462809214")),"status":map_status(o.get("_widget_1768382239273")),"category":category,"brand":brands[0] if brands else "","product":category or (brands[0] if brands else "Mixed"),"qty":f"{order_ctns} CTN","factory":o.get("_widget_1764597313371",""),"incoterm":"FOB","products":products,"jdyId":o.get("_id","")}

def main():
    with open(INPUT,"r") as f: raw=json.load(f)
    orders=[transform_order(o) for o in raw.get("data",[])]
    by_cust={}
    for o in orders:
        c=o["customer"]
        if c not in by_cust: by_cust[c]=[]
        by_cust[c].append(o)
    with open(OUTPUT,"w",encoding="utf-8") as f:
        json.dump({"generatedAt":datetime.utcnow().isoformat()+"Z","totalOrders":len(orders),"customers":list(by_cust.keys()),"orders":orders},f,ensure_ascii=False,indent=2)
    print(f"✅ {len(orders)} orders, {len(by_cust)} customers")
    for c,ol in by_cust.items(): print(f"   {c}: {len(ol)}")

if __name__=="__main__": main()
