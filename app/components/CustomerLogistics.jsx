// ═══════════════════════════════════════════════════════════════
// CustomerLogistics.jsx — Freight Hub (v12 Full Display)
// Hub → Port Selector → Orders → Services+Vessel (always visible)
// ═══════════════════════════════════════════════════════════════
import { useState, useRef, useMemo } from "react";
const inputSty = { width:"100%", padding:"9px 12px", borderRadius:"8px", border:"1.5px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"#e2e8f0", fontSize:"13px", boxSizing:"border-box", outline:"none" };
const Modal = ({ children, onClose }) => <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)" }} onClick={onClose}><div style={{ width:"100%",maxWidth:480,background:"#0f172a",borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",maxHeight:"85vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>{children}</div></div>;

// ─── Brand Palette ───────────────────────────────────────────
const B = {
  bg: "#0b1120",
  ocean: "#1e3a8a", oceanLight: "#2563eb",
  success: "#10b981", amber: "#f59e0b", red: "#ef4444", cyan: "#06b6d4",
  indigo: "#6366f1",
  slate50: "#f8fafc", slate300: "#cbd5e1", slate400: "#94a3b8",
  slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
};

// ─── Port / Route Config ─────────────────────────────────────
const PORTS_POL = ["Qingdao","Shanghai","Ningbo","Tianjin","Guangzhou","Shenzhen","Xiamen"];
const PORTS_POD = ["Port Klang","Pasir Gudang","Singapore","Jakarta","Bangkok","Ho Chi Minh","Manila","Jeddah","Laem Chabang"];
const CONTAINER_TYPES = [{id:"20GP",label:"20GP"},{id:"40HQ",label:"40HQ"},{id:"40RF",label:"40RF ❄️"}];

// ─── Service Options ─────────────────────────────────────────
const SERVICE_OPTIONS = [
  { id: "booking",    label: "Booking",             price: 0,   icon: "📋", fixed: true },
  { id: "trucking",   label: "Inland Trucking",     price: 350, icon: "🚛", fixed: true },
  { id: "customs",    label: "Customs Brokerage",   price: 80,  icon: "📝", fixed: true },
  { id: "portdoc",    label: "Port Charges & Docs", price: 120, icon: "🏗️", fixed: true },
  { id: "insurance",  label: "Cargo Insurance",     price: 0,   icon: "🛡️", fixed: false },
  { id: "fumigation", label: "Fumigation",          price: 95,  icon: "🧪", fixed: true },
];

// ─── Document Types ──────────────────────────────────────────
const DOC_TYPES = [
  { key: "bl",  label: "B/L",  name: "Bill of Lading" },
  { key: "pl",  label: "PL",   name: "Packing List" },
  { key: "inv", label: "INV",  name: "Commercial Invoice" },
  { key: "co",  label: "CO",   name: "Certificate of Origin" },
  { key: "vc",  label: "VC",   name: "Vet Certificate" },
  { key: "fe",  label: "FE",   name: "Fumigation Certificate" },
];

// ─── Mock: Vessel Schedules ──────────────────────────────────
const MOCK_SCHEDULES = [
  { id: "SCH-001", line: "COSCO", vessel: "COSCO STAR V.2603E", voyageNo: "2603E",
    pol: "Qingdao", pod: "Port Klang", etd: "2026-03-08", eta: "2026-03-22",
    transit: 14, space: "available", gp20: 980, hq40: 1650,
    trucking: 350, customs: 80, portCharge: 180,
    trend: "up", rateValidUntil: "2026-03-05" },
  { id: "SCH-002", line: "MSC", vessel: "MSC VENUS V.FA610R", voyageNo: "FA610R",
    pol: "Qingdao", pod: "Port Klang", etd: "2026-03-12", eta: "2026-03-28",
    transit: 16, space: "limited", gp20: 920, hq40: 1580,
    trucking: 350, customs: 80, portCharge: 180,
    trend: "down", rateValidUntil: "2026-03-07" },
  { id: "SCH-003", line: "ONE", vessel: "ONE TRIBUTE V.012S", voyageNo: "012S",
    pol: "Qingdao", pod: "Port Klang", etd: "2026-03-15", eta: "2026-03-30",
    transit: 15, space: "available", gp20: 1020, hq40: 1720,
    trucking: 350, customs: 80, portCharge: 180,
    trend: "stable", rateValidUntil: "2026-03-10" },
  { id: "SCH-004", line: "EVERGREEN", vessel: "EVER GIFTED V.0315", voyageNo: "0315",
    pol: "Qingdao", pod: "Pasir Gudang", etd: "2026-03-10", eta: "2026-03-26",
    transit: 16, space: "available", gp20: 950, hq40: 1620,
    trucking: 380, customs: 80, portCharge: 200,
    trend: "up", rateValidUntil: "2026-03-06" },
];

// ─── Mock: In-Transit Shipments ──────────────────────────────
const MOCK_SHIPMENTS = [
  { id: "FS20260210028", vessel: "COSCO STAR V.2602E",
    blNo: "COSU6781234", route: "Qingdao → Port Klang",
    pol: "Qingdao", pod: "Port Klang",
    product: "Premium Dog Food 15kg · 480 CTN",
    status: "in_transit", etd: "2026-02-15", eta: "2026-03-01",
    progress: 4, steps: 5, currentStep: "Customs Clearance (Destination)",
    docs: { bl: true, pl: true, inv: true, co: true, vc: false, fe: true } },
  { id: "FS20260110015", vessel: "MSC VENUS V.FA609R",
    blNo: "MEDU87654321", route: "Ningbo → Jakarta",
    pol: "Ningbo", pod: "Jakarta",
    product: "Cat Treats Variety Pack · 200 CTN",
    status: "clearance", etd: "2026-01-28", eta: "2026-02-18",
    progress: 3, steps: 5, currentStep: "Customs Clearance (Origin)",
    docs: { bl: true, pl: true, inv: true, co: true, vc: false, fe: false } },
  { id: "FS20260210025", vessel: "MSC VENUS V.FA609R",
    blNo: "MEDU11223344", route: "Qingdao → Pasir Gudang",
    pol: "Qingdao", pod: "Pasir Gudang",
    product: "Pet Supplements 500g · 60 CTN",
    status: "delivered", etd: "2026-01-20", eta: "2026-02-05",
    progress: 5, steps: 5, currentStep: "Delivered",
    docs: { bl: true, pl: true, inv: true, co: true, vc: true, fe: true } },
];

// ─── Mock: Orders for Ocean Booking ──────────────────────────
const MOCK_ORDERS = [
  { id: "FS20260310001", product: "Premium Dog Food 15kg", qty: "480 CTN",
    cbm: "32.5", weight: "7,680 kg", pol: "Qingdao", pod: "Port Klang", status: "Ready to Ship", incoterm: "FOB" },
  { id: "FS20260310002", product: "Cat Treats Variety Pack", qty: "200 CTN",
    cbm: "8.2", weight: "1,600 kg", pol: "Qingdao", pod: "Pasir Gudang", status: "Ready to Ship", incoterm: "FOB" },
  { id: "FS20260310003", product: "Pet Supplements 500g", qty: "60 CTN",
    cbm: "4.8", weight: "720 kg", pol: "Shanghai", pod: "Port Klang", status: "Production", incoterm: "CIF" },
  { id: "FS20260310004", product: "Dog Treats Chicken 100g", qty: "300 CTN",
    cbm: "9.6", weight: "1,950 kg", pol: "Qingdao", pod: "Port Klang", status: "Ready to Ship", incoterm: "FOB" },
];

// ─── Mock: Consignees ────────────────────────────────────────
const MOCK_CONSIGNEES = [
  { id: "CON-001", name: "PetMart SDN BHD", address: "Lot 12, Jalan Pelabuhan, Port Klang", country: "Malaysia" },
  { id: "CON-002", name: "AnimalCare Indonesia", address: "Jl. Raya Cakung No.88, Jakarta", country: "Indonesia" },
];

// ─── Mock: Product Master ────────────────────────────────────
const PRODUCT_MASTER = [
  { sku: "DF-15KG-PREM", name: "Premium Dog Food 15kg", cbmPerCtn: 0.068, weightPerCtn: 16.0, unitPrice: 42 },
  { sku: "CT-VAR-200G", name: "Cat Treats Variety 200g", cbmPerCtn: 0.041, weightPerCtn: 8.0, unitPrice: 18 },
  { sku: "PS-SUP-500G", name: "Pet Supplements 500g", cbmPerCtn: 0.080, weightPerCtn: 12.0, unitPrice: 35 },
  { sku: "DT-CHK-100G", name: "Dog Treats Chicken 100g", cbmPerCtn: 0.032, weightPerCtn: 6.5, unitPrice: 12 },
  { sku: "CF-SAL-3KG",  name: "Cat Food Salmon 3kg", cbmPerCtn: 0.055, weightPerCtn: 13.0, unitPrice: 28 },
];

// ─── Mock: History Bookings ──────────────────────────────────
const MOCK_HISTORY = [
  { id: "BK-2026-009", date: "2026-02-10", pol: "Qingdao", pod: "Port Klang",
    container: "1x40HQ", products: 3, vessel: "COSCO STAR", status: "Completed" },
  { id: "BK-2026-005", date: "2026-01-18", pol: "Qingdao", pod: "Pasir Gudang",
    container: "1x20GP", products: 2, vessel: "MSC VENUS", status: "Completed" },
];

// ─── Utility ─────────────────────────────────────────────────
const fmt = (n) => typeof n === "number" ? (n >= 1000 ? n.toLocaleString("en-US") : n.toString()) : n;
const chargeableWeight = (l, w, h, kg) => Math.max((l * w * h) / 6000, kg);

// ─── Shared Styles ───────────────────────────────────────────
const cardBase = {
  background: "rgba(15,23,42,0.65)", borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.06)",
};
const labelSm = {
  fontSize: "9px", color: B.slate600, fontWeight: "700",
  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px",
};
const mono = { fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace" };

// ─── Insurance Calc: 万5 = 0.05% ────────────────────────────
const calcInsurance = (amount) => {
  const val = parseFloat(amount);
  if (!val || val <= 0) return 0;
  return Math.round(val * 0.0005 * 100) / 100;
};

// ─── Incoterm Price Visibility ───────────────────────────────
// FOB: customer arranges freight via us but doesn't see freight pricing
// CIF/EXW/other: full pricing visible
// Insurance: ALWAYS visible regardless of incoterm
const shouldHideFreightPrice = (incoterm) => {
  if (!incoterm) return true; // default to hidden (most customers are FOB)
  return incoterm.toUpperCase() === "FOB";
};


// ═══════════════════════════════════════════════════════════════
//  COMPONENT: Schedule Rate Card
// ═══════════════════════════════════════════════════════════════
const ScheduleCard = ({ s, onBook, isFactory, hidePrice }) => {
  const [expanded, setExpanded] = useState(false);
  const spaceColor = s.space === "limited" ? B.amber : B.success;
  const showPrice = !isFactory && !hidePrice;
  const trendIcon = s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→";
  const trendColor = s.trend === "up" ? B.red : s.trend === "down" ? B.success : B.slate600;
  const trendLabel = s.trend === "up" ? "Rising" : s.trend === "down" ? "Dropping" : "Stable";

  return (
    <div style={{ ...cardBase, marginBottom: "8px", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "800", color: B.slate50 }}>{s.line}</div>
            <div style={{ fontSize: "10px", color: B.slate500, ...mono, marginTop: "1px" }}>{s.vessel}</div>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Trend badge */}
            <span style={{
              fontSize: "9px", fontWeight: "700", color: trendColor, padding: "2px 6px",
              borderRadius: "6px", background: `${trendColor}12`, display: "flex", alignItems: "center", gap: "2px",
            }}>{trendIcon} {trendLabel}</span>
            <span style={{
              fontSize: "9px", fontWeight: "700", color: spaceColor, padding: "2px 8px",
              borderRadius: "6px", background: `${spaceColor}12`,
            }}>{s.space === "limited" ? "Limited" : "Space OK"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "10px", color: B.slate500, marginBottom: "8px" }}>
          <span>ETD {s.etd}</span><span>ETA {s.eta}</span>
          <span>{s.transit}d {s.transit <= 14 ? "Direct" : "Transit"}</span>
        </div>
        {showPrice && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "4px", alignItems: "center" }}>
            <span style={{ fontSize: "11px" }}>
              <span style={{ color: B.slate600, fontSize: "9px" }}>20GP </span>
              <span style={{ color: B.success, fontWeight: "800", ...mono }}>${s.gp20}</span>
            </span>
            <span style={{ fontSize: "11px" }}>
              <span style={{ color: B.slate600, fontSize: "9px" }}>40HQ </span>
              <span style={{ color: B.success, fontWeight: "800", ...mono }}>${s.hq40}</span>
            </span>
            <span style={{ fontSize: "10px", color: B.slate600, marginLeft: "auto" }}>
              All-in ~${s.gp20 + s.trucking + s.customs + s.portCharge}
            </span>
          </div>
        )}
        {/* Rate validity */}
        {s.rateValidUntil && (
          <div style={{ fontSize: "9px", color: B.slate600, marginTop: "4px" }}>
            Rate valid until <span style={{ color: trendColor, fontWeight: "700", ...mono }}>{s.rateValidUntil}</span>
            {s.trend === "up" && <span style={{ color: B.red, marginLeft: "6px" }}>· Book early to lock rate</span>}
          </div>
        )}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setExpanded(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: "10px", color: expanded ? B.oceanLight : B.slate600 }}>
          {expanded ? "Hide detail" : "Fee breakdown"}
        </button>
        <button onClick={() => onBook(s)} style={{
          padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
          background: B.ocean, color: "white", fontSize: "10px", fontWeight: "800",
        }}>Book Now</button>
      </div>
      {expanded && (
        <div style={{ padding: "8px 14px 12px", borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.2)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", color: B.slate500 }}>Trucking <strong style={{ color: B.slate400 }}>${s.trucking}</strong></span>
          <span style={{ fontSize: "10px", color: B.slate500 }}>Customs <strong style={{ color: B.slate400 }}>${s.customs}</strong></span>
          <span style={{ fontSize: "10px", color: B.slate500 }}>Port <strong style={{ color: B.slate400 }}>${s.portCharge}</strong></span>
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
//  COMPONENT: Order Document Card (simplified — BL focused)
// ═══════════════════════════════════════════════════════════════
const OrderDocCard = ({ s, isFactory }) => {
  const [open, setOpen] = useState(false);
  const statusColors = { in_transit: B.oceanLight, clearance: B.amber, delivered: B.success };
  const statusLabels = { in_transit: "In Transit", clearance: "Clearance", delivered: "Delivered" };
  const barColor = statusColors[s.status] || B.slate600;
  const readyDocs = DOC_TYPES.filter(d => s.docs?.[d.key]);
  const routeDisplay = isFactory ? `${s.route.split("→")[0].trim()} → Overseas Hub` : s.route;

  return (
    <div style={{ ...cardBase, overflow: "hidden", marginBottom: "8px", borderLeft: `3px solid ${barColor}` }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding: "12px 14px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: B.slate50, ...mono }}>{s.blNo || s.id}</span>
              <span style={{ fontSize: "9px", fontWeight: "700", color: barColor, padding: "1px 6px",
                borderRadius: "4px", background: `${barColor}15` }}>{statusLabels[s.status]}</span>
            </div>
            <div style={{ fontSize: "10px", color: B.slate500, marginBottom: "2px" }}>{s.product || routeDisplay}</div>
            <div style={{ fontSize: "10px", color: B.slate600 }}>{routeDisplay} · ETA {s.eta}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
            <div style={{ fontSize: "10px", color: B.slate600 }}>{readyDocs.length}/{DOC_TYPES.length} docs</div>
            <div style={{ fontSize: "10px", color: B.slate700, marginTop: "2px" }}>{open ? "▲" : "▼"}</div>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
            {DOC_TYPES.map(doc => {
              const ready = !!s.docs?.[doc.key];
              return (
                <button key={doc.key} disabled={!ready}
                  style={{
                    fontSize: "10px", fontWeight: "700", padding: "5px 10px", borderRadius: "6px",
                    cursor: ready ? "pointer" : "default", border: "none",
                    color: ready ? B.success : B.slate700,
                    background: ready ? `${B.success}12` : "rgba(255,255,255,0.03)",
                  }}>
                  {ready ? "⬇️" : "⏳"} {doc.label}
                </button>
              );
            })}
          </div>
          {readyDocs.length > 0 && (
            <button style={{
              width: "100%", padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: `${B.success}12`, color: B.success, fontSize: "11px", fontWeight: "700",
            }}>Download All ({readyDocs.length} files)</button>
          )}
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
//  COMPONENT: Self-Booking Panel (自主托运)
// ═══════════════════════════════════════════════════════════════
const SelfBookingPanel = ({ user, consignees, onAddConsignee, onClose }) => {
  const [tab, setTab] = useState("info");
  const [step, setStep] = useState("form");
  const [selectedConsignee, setSelectedConsignee] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [pol, setPol] = useState("Qingdao");
  const [pod, setPod] = useState("Port Klang");
  const [cargoDesc, setCargoDesc] = useState("");
  const [containerType, setContainerType] = useState("40HQ");
  const [selectedSkus, setSelectedSkus] = useState([]);
  const [plFile, setPlFile] = useState(null);
  const plRef = useRef(null);

  const toggleSku = (sku) => setSelectedSkus(prev =>
    prev.find(s => s.sku === sku) ? prev.filter(s => s.sku !== sku) : [...prev, { sku, qty: 0 }]);
  const updateQty = (sku, qty) => setSelectedSkus(prev => prev.map(s => s.sku === sku ? { ...s, qty: Number(qty) } : s));
  const totalCBM = selectedSkus.reduce((sum, s) => {
    const p = PRODUCT_MASTER.find(pm => pm.sku === s.sku);
    return sum + (p ? p.cbmPerCtn * s.qty : 0);
  }, 0);

  const consigneeObj = consignees.find(c => c.id === selectedConsignee);
  const TABS = [
    { id: "info", label: "📋 Info" },
    { id: "products", label: "📦 Products" },
    { id: "history", label: "🔁 History" },
  ];

  if (step === "success") return (
    <div style={{ ...cardBase, padding: "24px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50, marginBottom: "6px" }}>Draft Created</div>
      <div style={{ fontSize: "12px", color: B.slate500, marginBottom: "20px" }}>Your self-booking draft has been submitted.</div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button onClick={() => { setStep("form"); onClose?.(); }}
          style={{ padding: "10px 24px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: B.ocean, color: "white", fontSize: "12px", fontWeight: "700" }}>Done</button>
      </div>
    </div>
  );

  if (step === "preview") return (
    <div style={{ ...cardBase, padding: "16px" }}>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50, marginBottom: "12px" }}>Draft Preview</div>
      <div style={{ ...cardBase, padding: "14px", marginBottom: "12px" }}>
        {[
          { l: "Consignee", v: consigneeObj?.name || "—" },
          { l: "Contact", v: contactName },
          { l: "Route", v: `${pol} → ${pod}` },
          { l: "Container", v: containerType },
          { l: "Products", v: `${selectedSkus.length} SKU(s)` },
          { l: "CBM", v: `${totalCBM.toFixed(3)} m³` },
        ].map(r => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0",
            fontSize: "11px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ color: B.slate500 }}>{r.l}</span>
            <span style={{ color: B.slate50, fontWeight: "600" }}>{r.v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setStep("form")} style={{ flex: 1, padding: "10px", borderRadius: "10px",
          border: `1px solid ${B.slate700}`, background: "transparent", color: B.slate400, fontSize: "11px", cursor: "pointer" }}>← Edit</button>
        <button onClick={() => setStep("success")} style={{ flex: 2, padding: "10px", borderRadius: "10px",
          border: "none", cursor: "pointer", background: B.ocean, color: "white", fontSize: "12px", fontWeight: "800" }}>Confirm</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...cardBase, padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: B.slate50 }}>Self Booking</div>
          <div style={{ fontSize: "10px", color: B.slate500 }}>Self-arrange B/L · Manual entry</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
          color: B.slate600, fontSize: "18px", padding: "4px" }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "14px", marginTop: "10px",
        background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "7px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "10px", fontWeight: tab === t.id ? "800" : "400",
            background: tab === t.id ? "rgba(30,58,138,0.30)" : "transparent",
            color: tab === t.id ? B.oceanLight : B.slate600,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div>
          {/* Consignee Selector */}
          <div style={{ marginBottom: "10px" }}>
            <div style={labelSm}>Consignee *</div>
            {!showNewForm ? (
              <div style={{ display: "flex", gap: "6px" }}>
                <select value={selectedConsignee} onChange={e => setSelectedConsignee(e.target.value)}
                  style={{ ...inputSty, fontSize: "12px", flex: 1 }}>
                  <option value="">— Select Consignee —</option>
                  {consignees.map(c => <option key={c.id} value={c.id}>{c.name} ({c.country})</option>)}
                </select>
                <button onClick={() => setShowNewForm(true)} style={{
                  padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: `${B.ocean}20`, color: B.oceanLight, fontSize: "10px", fontWeight: "700",
                  whiteSpace: "nowrap" }}>+ New</button>
              </div>
            ) : (
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company name" style={{ ...inputSty, fontSize: "11px" }} />
                  <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Country" style={{ ...inputSty, fontSize: "11px" }} />
                </div>
                <input value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Full address" style={{ ...inputSty, fontSize: "11px", marginBottom: "6px" }} />
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => setShowNewForm(false)} style={{ flex: 1, padding: "6px", borderRadius: "6px",
                    border: `1px solid ${B.slate700}`, background: "transparent", color: B.slate500, fontSize: "10px", cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => {
                    if (newName) {
                      const newCon = { id: `CON-NEW-${Date.now()}`, name: newName, address: newAddr, country: newCountry };
                      onAddConsignee(newCon);
                      setSelectedConsignee(newCon.id);
                      setShowNewForm(false);
                      setNewName(""); setNewAddr(""); setNewCountry("");
                    }
                  }} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", cursor: "pointer",
                    background: B.ocean, color: "white", fontSize: "10px", fontWeight: "700" }}>Save</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={labelSm}>Contact</div>
            <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Name" style={{ ...inputSty, fontSize: "12px" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "6px", alignItems: "end", marginBottom: "10px" }}>
            <div><div style={labelSm}>POL</div>
              <select value={pol} onChange={e => setPol(e.target.value)} style={{ ...inputSty, fontSize: "12px" }}>
                {PORTS_POL.map(p => <option key={p}>{p}</option>)}</select></div>
            <div style={{ fontSize: "14px", color: B.slate700, paddingBottom: "10px" }}>→</div>
            <div><div style={labelSm}>POD</div>
              <select value={pod} onChange={e => setPod(e.target.value)} style={{ ...inputSty, fontSize: "12px" }}>
                {PORTS_POD.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <div><div style={labelSm}>Container</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["20GP","40HQ"].map(t => (
                  <button key={t} onClick={() => setContainerType(t)} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: containerType === t ? "rgba(30,58,138,0.25)" : "rgba(255,255,255,0.03)",
                    color: containerType === t ? B.oceanLight : B.slate600, fontSize: "12px",
                    fontWeight: containerType === t ? "700" : "400",
                  }}>{t}</button>
                ))}</div></div>
            <div><div style={labelSm}>Cargo</div>
              <input value={cargoDesc} onChange={e => setCargoDesc(e.target.value)} placeholder="PET FOOD" style={{ ...inputSty, fontSize: "12px" }} /></div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={labelSm}>Packing List (optional)</div>
            {plFile ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", borderRadius: "8px", background: `${B.success}08`, border: `1px solid ${B.success}20` }}>
                <span style={{ fontSize: "11px", color: B.success }}>{plFile.name}</span>
                <button onClick={() => setPlFile(null)} style={{ background: "none", border: "none", color: B.red, cursor: "pointer", fontSize: "10px" }}>✕</button>
              </div>
            ) : (
              <div onClick={() => plRef.current?.click()} style={{ padding: "16px", borderRadius: "10px", textAlign: "center",
                cursor: "pointer", border: "2px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: "10px", color: B.slate600 }}>Tap to upload</div>
              </div>
            )}
            <input ref={plRef} type="file" accept=".pdf,.xlsx,.csv" style={{ display: "none" }}
              onChange={e => { if (e.target.files?.[0]) setPlFile(e.target.files[0]); }} />
          </div>

          {selectedSkus.length > 0 && (
            <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px",
              background: `${B.ocean}15`, border: `1px solid ${B.ocean}30` }}>
              <div style={{ fontSize: "10px", color: B.oceanLight, fontWeight: "700" }}>
                {selectedSkus.length} product(s) · {totalCBM.toFixed(2)} CBM</div>
            </div>
          )}

          <button onClick={() => { if (selectedConsignee) setStep("preview"); }} disabled={!selectedConsignee}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none",
              cursor: selectedConsignee ? "pointer" : "not-allowed",
              background: selectedConsignee ? B.ocean : B.slate800, color: selectedConsignee ? "white" : B.slate600,
              fontSize: "12px", fontWeight: "800", opacity: selectedConsignee ? 1 : 0.5 }}>Generate Draft →</button>
        </div>
      )}

      {tab === "products" && (
        <div>
          <div style={{ fontSize: "11px", color: B.slate500, marginBottom: "10px" }}>Select SKUs and quantities.</div>
          {PRODUCT_MASTER.map(p => {
            const sel = selectedSkus.find(s => s.sku === p.sku);
            return (
              <div key={p.sku} style={{
                padding: "10px 12px", marginBottom: "6px", borderRadius: "10px",
                background: sel ? `${B.ocean}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${sel ? `${B.ocean}35` : "rgba(255,255,255,0.06)"}`,
              }}>
                <div onClick={() => toggleSku(p.sku)} style={{ cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: sel ? B.slate50 : B.slate400 }}>{p.name}</div>
                    <div style={{ fontSize: "9px", color: B.slate600, ...mono, marginTop: "2px" }}>{p.sku} · ${p.unitPrice}/ctn</div>
                  </div>
                  <div style={{ width: "20px", height: "20px", borderRadius: "5px",
                    background: sel ? B.oceanLight : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${sel ? B.oceanLight : "rgba(255,255,255,0.15)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "900", color: "white" }}>{sel ? "✓" : ""}</div>
                </div>
                {sel && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px",
                    paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "9px", color: B.slate600 }}>QTY</span>
                    <input type="number" value={sel.qty || ""} onClick={e => e.stopPropagation()}
                      onChange={e => updateQty(p.sku, e.target.value)}
                      style={{ ...inputSty, width: "70px", fontSize: "12px", textAlign: "center", ...mono, padding: "6px" }}
                      placeholder="0" />
                    <span style={{ fontSize: "9px", color: B.slate600 }}>CTN</span>
                    {sel.qty > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: "10px", color: B.oceanLight, ...mono }}>
                        {(p.cbmPerCtn * sel.qty).toFixed(2)} CBM</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div>
          <div style={{ fontSize: "11px", color: B.slate500, marginBottom: "10px" }}>Past bookings & drafts.</div>
          {MOCK_HISTORY.map(h => (
            <div key={h.id} style={{ ...cardBase, padding: "10px 14px", marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: B.slate50, ...mono }}>{h.id}</span>
                <span style={{ fontSize: "10px", color: B.success }}>{h.status}</span>
              </div>
              <div style={{ fontSize: "10px", color: B.slate500 }}>{h.pol} → {h.pod} · {h.container} · {h.vessel}</div>
              <div style={{ fontSize: "9px", color: B.slate600, marginTop: "2px" }}>{h.date}</div>
              <button style={{ marginTop: "6px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer",
                background: `${B.ocean}12`, border: `1px solid ${B.ocean}30`,
                color: B.oceanLight, fontSize: "10px", fontWeight: "700" }}>Import</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
//  COMPONENT: Booking Confirmation Modal
// ═══════════════════════════════════════════════════════════════
const BookingModal = ({ schedule, orders, services, insuranceAmt, onClose, isFactory, hidePrice }) => {
  const [boxType, setBoxType] = useState("40HQ");
  const [noRollover, setNoRollover] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmNR, setConfirmNR] = useState(false);
  if (!schedule) return null;

  const showPrice = !isFactory && !hidePrice;
  const basePrice = boxType === "20GP" ? schedule.gp20 : schedule.hq40;
  const insuranceFee = services.insurance ? calcInsurance(insuranceAmt) : 0;
  const svcFee = SERVICE_OPTIONS.filter(s => services[s.id] && s.price > 0).reduce((a, s) => a + s.price, 0) + insuranceFee;
  const surcharge = noRollover ? (boxType === "20GP" ? 50 : 100) : 0;
  const total = basePrice + svcFee + surcharge;

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50, marginBottom: "6px" }}>Booking Submitted</div>
      {noRollover && (
        <div style={{ display: "inline-flex", fontSize: "11px", color: B.amber, fontWeight: "700",
          background: `${B.amber}10`, border: `1px solid ${B.amber}25`, borderRadius: "8px",
          padding: "5px 12px", marginBottom: "8px" }}>No-Rollover +${surcharge}</div>
      )}
      <div style={{ fontSize: "12px", color: B.slate500, marginBottom: "8px" }}>{schedule.line} · {schedule.vessel}</div>
      <div style={{ fontSize: "10px", color: B.slate600, marginBottom: "20px" }}>
        {orders.length} order(s) selected</div>
      <button onClick={onClose} style={{ padding: "10px 28px", borderRadius: "10px", border: "none",
        cursor: "pointer", background: B.ocean, color: "white", fontSize: "12px", fontWeight: "700" }}>Close</button>
    </div>
  );

  if (confirmNR) return (
    <div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.amber, marginBottom: "8px" }}>Confirm No-Rollover?</div>
      <div style={{ ...cardBase, padding: "10px 14px", marginBottom: "14px", background: `${B.amber}08`, border: `1px solid ${B.amber}20` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
          <span style={{ color: B.slate500 }}>Subtotal</span><span style={{ color: B.slate400 }}>${fmt(basePrice + svcFee)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
          <span style={{ color: B.slate500 }}>No-Rollover</span><span style={{ color: B.amber }}>+${surcharge}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800",
          paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: B.slate50 }}>Total</span><span style={{ color: B.amber }}>${fmt(total)}</span></div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setConfirmNR(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px",
          border: `1px solid ${B.slate700}`, background: "transparent", color: B.slate400, fontSize: "11px", cursor: "pointer" }}>Back</button>
        <button onClick={() => { setSubmitted(true); setConfirmNR(false); }} style={{ flex: 2, padding: "10px",
          borderRadius: "10px", border: "none", cursor: "pointer", background: B.amber, color: "#0b1120",
          fontSize: "12px", fontWeight: "800" }}>Confirm</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50, marginBottom: "2px" }}>Book This Vessel</div>
      <div style={{ fontSize: "11px", color: B.slate500, marginBottom: "14px" }}>{schedule.line} · {schedule.vessel}</div>

      {/* Selected Orders Summary */}
      <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px",
        background: `${B.ocean}10`, border: `1px solid ${B.ocean}25` }}>
        <div style={{ fontSize: "10px", color: B.slate500, marginBottom: "4px" }}>Selected Orders</div>
        {orders.map(o => (
          <div key={o.id} style={{ fontSize: "11px", color: B.slate50, ...mono, marginBottom: "2px" }}>
            {o.id} <span style={{ color: B.slate600 }}>· {o.product}</span></div>
        ))}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={labelSm}>Container</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["20GP","40HQ"].map(t => (
            <button key={t} onClick={() => setBoxType(t)} style={{
              flex: 1, padding: "9px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: boxType === t ? "rgba(30,58,138,0.25)" : "rgba(255,255,255,0.03)",
              color: boxType === t ? B.oceanLight : B.slate600, fontSize: "12px",
              fontWeight: boxType === t ? "700" : "400",
            }}>{t} {showPrice && <span style={{ fontSize: "10px", color: boxType === t ? B.success : B.slate700,
              marginLeft: "4px", ...mono }}>${t === "20GP" ? schedule.gp20 : schedule.hq40}</span>}</button>
          ))}
        </div>
      </div>

      <div style={{ ...cardBase, padding: "12px 14px", marginBottom: "12px" }}>
        <div style={labelSm}>Selected Services</div>
        {SERVICE_OPTIONS.filter(s => services[s.id]).map(svc => {
          const isInsurance = svc.id === "insurance";
          const displayPrice = isInsurance ? insuranceFee : svc.price;
          const showThisPrice = isInsurance ? true : showPrice; // insurance always shows
          return (
            <div key={svc.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <span style={{ color: B.slate500 }}>{svc.icon} {svc.label}
                {isInsurance && <span style={{ fontSize: "8px", color: B.red, fontWeight: "700", marginLeft: "4px" }}>Recommended</span>}
              </span>
              {showThisPrice && (
                <span style={{ color: displayPrice > 0 ? B.slate400 : B.success, fontWeight: "600", ...mono }}>
                  {displayPrice > 0 ? `$${fmt(displayPrice)}` : "Incl."}</span>
              )}
            </div>
          );
        })}
        {showPrice && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px",
            borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "11px", color: B.slate500 }}>Subtotal</span>
            <span style={{ fontSize: "15px", fontWeight: "900", color: B.amber, ...mono }}>${fmt(basePrice + svcFee)}</span>
          </div>
        )}
      </div>

      <div onClick={() => setNoRollover(v => !v)} style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: "12px",
        background: noRollover ? `${B.amber}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${noRollover ? `${B.amber}35` : "rgba(255,255,255,0.06)"}`,
      }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
          background: noRollover ? B.amber : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${noRollover ? B.amber : "rgba(255,255,255,0.15)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: "900", color: "#0b1120" }}>{noRollover ? "✓" : ""}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: noRollover ? B.amber : B.slate400 }}>No-Rollover Guarantee</div>
          <div style={{ fontSize: "10px", color: B.slate600 }}>Priority space + compensation</div>
        </div>
        {showPrice && <span style={{ fontSize: "11px", fontWeight: "800", color: noRollover ? B.amber : B.slate600, ...mono }}>
          +${boxType === "20GP" ? 50 : 100}</span>}
      </div>

      {showPrice && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: "6px", marginBottom: "14px" }}>
          <span style={{ fontSize: "11px", color: B.slate500 }}>Total</span>
          <span style={{ fontSize: "18px", fontWeight: "900", color: B.amber, ...mono }}>${fmt(total)}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "10px",
          border: `1px solid ${B.slate700}`, background: "transparent", color: B.slate400,
          fontSize: "11px", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { if (noRollover) setConfirmNR(true); else setSubmitted(true); }}
          style={{ flex: 2, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: noRollover ? B.amber : B.indigo, color: noRollover ? "#0b1120" : "white",
            fontSize: "12px", fontWeight: "800" }}>
          {noRollover ? "Book with Guarantee" : "Confirm Booking"}</button>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
//  MAIN: CustomerLogisticsTab
// ═══════════════════════════════════════════════════════════════
export const CustomerLogisticsTab = ({ user, orders = [] }) => {
  const isFactory = user?.role === "factory";

  // ── View State ──
  const [activeView, setActiveView] = useState(null); // null=hub, "ddp", "inquiries"
  const [showSelfBooking, setShowSelfBooking] = useState(false);
  const [consignees, setConsignees] = useState(MOCK_CONSIGNEES);

  // ── Ocean: Multi-select orders ──
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [bookModal, setBookModal] = useState(null);
  const toggleOrderExpand = (id) => setExpandedOrders(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Hub: Port selector for browsing rates ──
  const [hubPol, setHubPol] = useState("Qingdao");
  const [hubPod, setHubPod] = useState("Port Klang");

  // ── Ocean: Services (all-in default ON including insurance) ──
  const [services, setServices] = useState({
    booking: true, trucking: true, customs: true,
    portdoc: true, insurance: true, fumigation: true,
  });
  const [insuranceAmt, setInsuranceAmt] = useState("");
  const toggleService = (id) => setServices(prev => ({ ...prev, [id]: !prev[id] }));

  // ── DDP state ──
  const [ddpL, setDdpL] = useState("");
  const [ddpW, setDdpW] = useState("");
  const [ddpH, setDdpH] = useState("");
  const [ddpKg, setDdpKg] = useState("");
  const [ddpOrigin, setDdpOrigin] = useState("");
  const [ddpDest, setDdpDest] = useState("");
  const [ddpProduct, setDdpProduct] = useState("");
  const [ddpPhotos, setDdpPhotos] = useState([]);
  const [ddpSubmitted, setDdpSubmitted] = useState(false);
  const ddpRef = useRef(null);

  // ── Inquiry state ──
  const [inqPol, setInqPol] = useState("");
  const [inqPod, setInqPod] = useState("");
  const [inqProduct, setInqProduct] = useState("");
  const [inqWeight, setInqWeight] = useState("");
  const [inqQty, setInqQty] = useState("");
  const [inqContainer, setInqContainer] = useState("40HQ");
  const [inqRemark, setInqRemark] = useState("");
  const [inqSubmitted, setInqSubmitted] = useState(false);

  // ── Order tracking state ──
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderDateSort, setOrderDateSort] = useState("desc");

  // ── Computed ──
  const orderList = orders.length > 0 ? orders : MOCK_ORDERS;

  // Incoterm-based price visibility: derived from selected orders
  // If any selected order is FOB (or no incoterm specified), hide freight prices
  // Insurance is always visible regardless
  const activeIncoterm = selectedOrders.length > 0
    ? (selectedOrders[0].incoterm || "FOB")
    : (user?.incoterm || "FOB");
  const hidePrice = shouldHideFreightPrice(activeIncoterm);

  const ddpCW = (ddpL && ddpW && ddpH && ddpKg) ? chargeableWeight(Number(ddpL), Number(ddpW), Number(ddpH), Number(ddpKg)) : 0;
  const ddpRate = 8.5;
  const ddpEstimate = ddpCW > 0 ? Math.round(ddpCW * ddpRate) : 0;
  const handleDdpPhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - ddpPhotos.length);
    setDdpPhotos(prev => [...prev, ...files]);
  };

  // Group orders by POL for display
  const ordersByPol = useMemo(() => {
    const groups = {};
    orderList.forEach(o => {
      if (!groups[o.pol]) groups[o.pol] = [];
      groups[o.pol].push(o);
    });
    return groups;
  }, [orderList]);

  // Determine the common route from selected orders
  const selectedPol = selectedOrders.length > 0 ? selectedOrders[0].pol : null;
  const selectedPod = selectedOrders.length > 0 ? selectedOrders[0].pod : null;
  // Use selected orders' route if available, otherwise hub port selector
  const activePol = selectedPol || hubPol;
  const activePod = selectedPod || hubPod;
  const filteredSchedules = MOCK_SCHEDULES.filter(s => s.pol === activePol && s.pod === activePod);

  // Order toggle (multi-select, enforce same POL)
  const toggleOrder = (order) => {
    setSelectedOrders(prev => {
      const exists = prev.find(o => o.id === order.id);
      if (exists) return prev.filter(o => o.id !== order.id);
      // If adding, check POL consistency
      if (prev.length > 0 && prev[0].pol !== order.pol) return prev;
      return [...prev, order];
    });
  };

  // Insurance fee for service display
  const insuranceFee = calcInsurance(insuranceAmt);

  // Filtered shipments for order tracking
  const filteredShipments = MOCK_SHIPMENTS
    .filter(s => {
      const matchSearch = !orderSearch ||
        s.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (s.blNo && s.blNo.toLowerCase().includes(orderSearch.toLowerCase()));
      const matchFilter = orderFilter === "all" || s.status === orderFilter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => orderDateSort === "desc"
      ? new Date(b.eta) - new Date(a.eta)
      : new Date(a.eta) - new Date(b.eta)
    );


  // ═══ BACK BAR (shared) ═══
  const BackBar = ({ title }) => (
    <div style={{ position: "sticky", top: 0, zIndex: 50,
      background: "rgba(11,17,32,0.95)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
      <button onClick={() => setActiveView(null)} style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
        color: B.slate400, fontSize: "11px", fontWeight: "700" }}>← Hub</button>
      <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50 }}>{title}</div>
    </div>
  );


  // ═══════════════════════════════════════════════════════════
  //  HUB VIEW (Ocean inline + quick links)
  // ═══════════════════════════════════════════════════════════
  if (!activeView) {
    return (
      <div style={{ minHeight: "100vh", background: B.bg, paddingBottom: selectedOrders.length > 0 ? "80px" : "0" }}>
        {/* ── Header ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 50,
          background: "rgba(11,17,32,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
          <div style={{ fontSize: "19px", fontWeight: "800", color: B.slate50, letterSpacing: "-0.02em" }}>Logistics Hub</div>
          <div style={{ fontSize: "11px", color: B.slate600, marginTop: "2px" }}>Ocean · Air & DDP · Inquiries & Orders</div>
        </div>

        <div style={{ padding: "16px" }}>
          {/* ── 3 Hub Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "18px" }}>
            {/* Card 1: Ocean Freight — entire card = Self Booking toggle */}
            <div onClick={() => {
                setShowSelfBooking(v => !v);
                if (!showSelfBooking) { setSelectedOrders([]); }
              }}
              style={{ borderRadius: "14px", overflow: "hidden", cursor: "pointer",
              background: showSelfBooking
                ? "linear-gradient(180deg, rgba(245,158,11,0.25) 0%, rgba(15,23,42,0.8) 100%)"
                : "linear-gradient(180deg, rgba(30,58,138,0.40) 0%, rgba(15,23,42,0.8) 100%)",
              border: showSelfBooking
                ? "1px solid rgba(245,158,11,0.4)"
                : "1px solid rgba(59,130,246,0.4)",
              display: "flex", flexDirection: "column",
              boxShadow: showSelfBooking ? "0 0 15px rgba(245,158,11,0.15)" : "0 0 15px rgba(59,130,246,0.15)" }}>
              <div style={{ flex: 1, padding: "16px 10px 10px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", marginBottom: "6px" }}>🚢</div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>Ocean</div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>Freight</div>
                <div style={{ fontSize: "8px", color: B.slate300, marginTop: "4px", opacity: 0.8 }}>
                  {showSelfBooking ? "Self-arrange B/L" : "Booking & All-in"}</div>
              </div>
              <div style={{ padding: "8px 6px", textAlign: "center",
                background: showSelfBooking ? "rgba(245,158,11,0.20)" : "rgba(59,130,246,0.20)",
                borderTop: showSelfBooking ? "1px solid rgba(245,158,11,0.30)" : "1px solid rgba(59,130,246,0.30)",
                color: showSelfBooking ? B.amber : "#60a5fa", fontSize: "10px", fontWeight: "800" }}>
                {showSelfBooking ? "← Back to Orders" : "Self Booking"}
              </div>
            </div>

            {/* Card 2: Air & DDP */}
            <div onClick={() => setActiveView("ddp")} style={{ borderRadius: "14px", padding: "14px 10px",
              textAlign: "center", cursor: "pointer",
              background: "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.7) 100%)",
              border: "1px solid rgba(16,185,129,0.25)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "26px", marginBottom: "6px" }}>✈️</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>Air &</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>DDP</div>
              <div style={{ fontSize: "8px", color: B.slate600, marginTop: "4px" }}>Door-to-Door</div>
            </div>

            {/* Card 3: Inquiry & Track */}
            <div onClick={() => setActiveView("inquiries")} style={{ borderRadius: "14px", padding: "14px 10px",
              textAlign: "center", cursor: "pointer",
              background: "linear-gradient(180deg, rgba(245,158,11,0.10) 0%, rgba(15,23,42,0.7) 100%)",
              border: "1px solid rgba(245,158,11,0.20)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "26px", marginBottom: "6px" }}>📊</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>Inquiry</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: B.slate50 }}>& Track</div>
              <div style={{ fontSize: "8px", color: B.slate600, marginTop: "4px" }}>Quote · Docs</div>
            </div>
          </div>

          {/* ═══ Self Booking Panel (toggles with order list) ═══ */}
          {showSelfBooking ? (
            <SelfBookingPanel
              user={user}
              consignees={consignees}
              onAddConsignee={(c) => setConsignees(prev => [...prev, c])}
              onClose={() => setShowSelfBooking(false)}
            />
          ) : (
            <>
              {/* ═══ Port Selector — browse rates for any route ═══ */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "6px", alignItems: "end", marginBottom: "14px" }}>
                <div>
                  <div style={labelSm}>Origin (POL)</div>
                  <select value={selectedPol || hubPol} onChange={e => { setHubPol(e.target.value); if (selectedOrders.length === 0) {} }}
                    style={{ ...inputSty, fontSize: "12px", padding: "8px" }}
                    disabled={selectedOrders.length > 0}>
                    {PORTS_POL.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ fontSize: "16px", color: B.slate700, paddingBottom: "10px" }}>→</div>
                <div>
                  <div style={labelSm}>Destination (POD)</div>
                  <select value={selectedPod || hubPod} onChange={e => setHubPod(e.target.value)}
                    style={{ ...inputSty, fontSize: "12px", padding: "8px" }}
                    disabled={selectedOrders.length > 0}>
                    {PORTS_POD.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {selectedOrders.length > 0 && (
                <div style={{ fontSize: "9px", color: B.slate600, marginTop: "-10px", marginBottom: "10px" }}>
                  Route locked to selected orders. Deselect to browse other ports.</div>
              )}

              {/* ═══ Ocean Orders — Compact single-line, grouped by POL ═══ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={labelSm}>
                  Select Orders
                  <span style={{ color: B.slate700, fontWeight: "400", textTransform: "none", marginLeft: "8px" }}>
                    (same POL)</span>
                </div>
                <button onClick={() => {
                  const readyOrders = orderList.filter(o => o.status === "Ready to Ship");
                  if (readyOrders.length === selectedOrders.length && readyOrders.every(o => selectedOrders.find(s => s.id === o.id))) {
                    setSelectedOrders([]);
                  } else {
                    const firstPol = readyOrders[0]?.pol;
                    setSelectedOrders(readyOrders.filter(o => o.pol === firstPol));
                  }
                }} style={{
                  padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer",
                  background: `${B.ocean}20`, color: B.oceanLight, fontSize: "9px", fontWeight: "700",
                }}>
                  {selectedOrders.length > 0 && orderList.filter(o => o.status === "Ready to Ship" && o.pol === selectedOrders[0]?.pol).length === selectedOrders.length
                    ? "Deselect All" : "Select All Ready"}
                </button>
              </div>

              {Object.entries(ordersByPol).map(([pol, polOrders]) => (
                <div key={pol} style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: B.oceanLight, marginBottom: "4px",
                    display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: B.oceanLight }} />
                    {pol}
                    <span style={{ color: B.slate600, fontWeight: "400" }}>({polOrders.length})</span>
                  </div>
                  {polOrders.map(o => {
                    const sel = selectedOrders.find(so => so.id === o.id);
                    const disabled = o.status === "Production";
                    const blockedByPol = selectedOrders.length > 0 && selectedOrders[0].pol !== o.pol;
                    const isDisabled = disabled || blockedByPol;
                    // Shorten ID: FS + last digits
                    const shortId = o.id.replace(/^FS\d{8}/, "FS-");

                    return (
                      <div key={o.id} style={{ marginBottom: "3px" }}>
                        <div onClick={() => { if (!isDisabled) toggleOrder(o); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 10px", borderRadius: "8px",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            opacity: isDisabled ? 0.35 : 1,
                            background: sel ? `${B.ocean}15` : "rgba(15,23,42,0.65)",
                            border: `1px solid ${sel ? B.oceanLight + "40" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                            background: sel ? B.oceanLight : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${sel ? B.oceanLight : "rgba(255,255,255,0.12)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "9px", fontWeight: "900", color: "white" }}>{sel ? "✓" : ""}</div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: sel ? B.slate50 : B.slate400, ...mono, flex: 1 }}>{shortId}</span>
                          <span style={{ fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px",
                            color: o.status === "Ready to Ship" ? B.success : B.amber,
                            background: o.status === "Ready to Ship" ? `${B.success}12` : `${B.amber}12` }}>{o.status}</span>
                          {o.incoterm && (
                            <span style={{ fontSize: "9px", fontWeight: "700", color: B.cyan, ...mono, minWidth: "24px", textAlign: "right" }}>{o.incoterm}</span>
                          )}
                          <span style={{ fontSize: "10px", color: B.slate700, cursor: "pointer" }}
                            onClick={(e) => { e.stopPropagation(); toggleOrderExpand(o.id); }}>
                            {expandedOrders.includes(o.id) ? "▲" : "▼"}
                          </span>
                        </div>
                        {expandedOrders.includes(o.id) && (
                          <div style={{ padding: "6px 10px 8px 34px", fontSize: "10px", color: B.slate500,
                            background: "rgba(0,0,0,0.15)", borderRadius: "0 0 8px 8px",
                            borderLeft: `1px solid ${sel ? B.oceanLight + "20" : "rgba(255,255,255,0.04)"}`,
                            borderRight: `1px solid ${sel ? B.oceanLight + "20" : "rgba(255,255,255,0.04)"}`,
                            borderBottom: `1px solid ${sel ? B.oceanLight + "20" : "rgba(255,255,255,0.04)"}`,
                            marginTop: "-1px" }}>
                            <div>{o.product} · {o.qty}</div>
                            <div style={{ color: B.slate600 }}>{o.pol} → {o.pod} · {o.cbm} CBM · {o.weight}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* ═══ Services — ALWAYS visible ═══ */}
              <div style={{ ...labelSm, marginBottom: "6px", marginTop: "12px" }}>Services</div>
              <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "10px",
                background: `${B.ocean}10`, border: `1px solid ${B.ocean}25`,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: B.oceanLight, fontWeight: "700" }}>{activePol} → {activePod}</span>
                <span style={{ fontSize: "10px", color: B.slate500 }}>{filteredSchedules.length} vessel(s)</span>
              </div>

              {/* 一键全包 */}
              <div style={{ marginBottom: "14px" }}>
                {(() => {
                  const allOn = SERVICE_OPTIONS.every(s => services[s.id]);
                  const toggleAll = () => {
                    const next = !allOn;
                    setServices(Object.fromEntries(SERVICE_OPTIONS.map(s => [s.id, next])));
                  };
                  const fixedTotal = SERVICE_OPTIONS.filter(s => s.fixed && s.price > 0).reduce((sum, s) => sum + s.price, 0);
                  const totalSvc = fixedTotal + 95 + insuranceFee;
                  return (
                    <>
                      <div onClick={toggleAll} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: "8px",
                        background: allOn ? "linear-gradient(135deg,rgba(99,102,241,0.20),rgba(79,110,247,0.12))" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${allOn ? B.indigo + "60" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: allOn ? `0 0 16px ${B.indigo}20` : "none", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                            background: allOn ? B.indigo : "rgba(255,255,255,0.05)",
                            border: `1.5px solid ${allOn ? B.indigo : "rgba(255,255,255,0.2)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: "900", color: "white" }}>{allOn ? "✓" : ""}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "800", color: allOn ? B.slate50 : B.slate500 }}>
                              All-in · Sanlyn Full Management</div>
                            <div style={{ fontSize: "10px", color: allOn ? B.slate400 : B.slate700, marginTop: "1px" }}>
                              Booking · Trucking · Customs · Port · Insurance · Fumigation</div>
                          </div>
                        </div>
                        {!isFactory && !hidePrice && (
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "12px", fontWeight: "900", color: allOn ? B.amber : B.slate600, ...mono }}>+${fmt(totalSvc)}</div>
                          </div>
                        )}
                      </div>
                      {!allOn && (
                        <>
                          <div style={{ fontSize: "10px", color: B.slate700, fontWeight: "700", marginBottom: "6px" }}>Or select individually</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                            {SERVICE_OPTIONS.map(svc => {
                              const isInsurance = svc.id === "insurance";
                              const displayPrice = isInsurance ? insuranceFee : svc.price;
                              const showThisPrice = isInsurance ? true : (!isFactory && !hidePrice);
                              return (
                                <div key={svc.id} onClick={() => toggleService(svc.id)} style={{
                                  display: "flex", alignItems: "center", gap: "8px",
                                  padding: "9px 12px", borderRadius: "9px", cursor: "pointer",
                                  background: services[svc.id] ? `${B.ocean}12` : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${services[svc.id] ? `${B.ocean}35` : "rgba(255,255,255,0.06)"}` }}>
                                  <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                                    background: services[svc.id] ? B.oceanLight : "rgba(255,255,255,0.04)",
                                    border: `1.5px solid ${services[svc.id] ? B.oceanLight : "rgba(255,255,255,0.15)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "10px", fontWeight: "900", color: "white" }}>{services[svc.id] ? "✓" : ""}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "11px", fontWeight: "600", color: services[svc.id] ? B.slate50 : B.slate600 }}>
                                      {svc.icon} {svc.label}
                                      {isInsurance && <span style={{ fontSize: "8px", color: B.red, fontWeight: "700",
                                        marginLeft: "4px", padding: "1px 4px", borderRadius: "3px",
                                        background: `${B.red}15` }}>Recommended</span>}
                                    </div>
                                    {isInsurance && services[svc.id] && (
                                      <div style={{ fontSize: "9px", color: B.slate500, marginTop: "1px" }}>
                                        Rate 0.05% · Covers water damage/loss/total loss</div>
                                    )}
                                    {showThisPrice && displayPrice > 0 && (
                                      <div style={{ fontSize: "9px", color: services[svc.id] ? B.amber : B.slate700, ...mono }}>${displayPrice}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* Insurance — ALWAYS visible */}
                      <div style={{ marginTop: "10px", padding: "12px", borderRadius: "10px",
                        background: services.insurance ? `${B.success}08` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${services.insurance ? `${B.success}25` : "rgba(255,255,255,0.08)"}` }}>
                        <div onClick={() => toggleService("insurance")}
                          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: services.insurance ? "8px" : "0" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                            background: services.insurance ? B.success : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${services.insurance ? B.success : "rgba(255,255,255,0.15)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", fontWeight: "900", color: "white" }}>{services.insurance ? "✓" : ""}</div>
                          <span style={{ fontSize: "12px" }}>🛡️</span>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: services.insurance ? B.slate50 : B.slate400 }}>
                            Cargo Insurance</span>
                          <span style={{ fontSize: "8px", color: B.red, fontWeight: "700",
                            padding: "2px 6px", borderRadius: "4px", background: `${B.red}15` }}>Recommended</span>
                        </div>
                        {!services.insurance && (
                          <div style={{ fontSize: "10px", color: B.slate600, marginLeft: "26px", marginTop: "4px" }}>
                            Rate 0.05% · Protect against water damage, loss & total loss</div>
                        )}
                        {services.insurance && (
                          <>
                            <div style={{ fontSize: "10px", color: B.slate500, marginBottom: "10px", lineHeight: 1.5 }}>
                              Rate 0.05% · Covers water damage, loss, and total loss risk.</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                              <div style={{ flex: 1 }}>
                                <div style={labelSm}>Declared Value (USD)</div>
                                <input type="number" value={insuranceAmt} onChange={e => setInsuranceAmt(e.target.value)}
                                  placeholder="e.g. 50000"
                                  style={{ ...inputSty, fontSize: "13px", ...mono, padding: "8px" }} />
                              </div>
                              <div style={{ textAlign: "right", minWidth: "100px" }}>
                                <div style={{ fontSize: "9px", color: B.slate600, marginBottom: "2px" }}>Est. Premium</div>
                                <div style={{ fontSize: "18px", fontWeight: "900", color: insuranceFee > 0 ? B.amber : B.slate700, ...mono }}>
                                  USD {insuranceFee > 0 ? fmt(insuranceFee) : "—"}</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* ═══ Vessel Selection — ALWAYS visible ═══ */}
              <div style={{ ...labelSm, marginBottom: "6px" }}>Select Vessel</div>
              {filteredSchedules.length === 0 ? (
                <div style={{ ...cardBase, textAlign: "center", padding: "20px" }}>
                  <div style={{ fontSize: "12px", color: B.slate500 }}>No schedules for {activePol} → {activePod}.</div>
                  <div style={{ fontSize: "10px", color: B.slate600, marginTop: "4px" }}>Try a different port above.</div>
                </div>
              ) : filteredSchedules.map(s => (
                <ScheduleCard key={s.id} s={s} onBook={setBookModal} isFactory={isFactory} hidePrice={hidePrice} />
              ))}
            </>
          )}
        </div>

        {/* ═══ Book Modal ═══ */}
        {bookModal && (
          <Modal onClose={() => setBookModal(null)}>
            <BookingModal schedule={bookModal} orders={selectedOrders} services={services}
              insuranceAmt={insuranceAmt} isFactory={isFactory} hidePrice={hidePrice} onClose={() => setBookModal(null)} />
          </Modal>
        )}
      </div>
    );
  }


  // ═══════════════════════════════════════════════════════════
  //  AIR & DDP VIEW
  // ═══════════════════════════════════════════════════════════
  if (activeView === "ddp") return (
    <div style={{ minHeight: "100vh", background: B.bg }}>
      <BackBar title="Air & Global DDP" />
      <div style={{ padding: "16px" }}>
        {ddpSubmitted ? (
          <div style={{ ...cardBase, textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✈️</div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: B.slate50, marginBottom: "6px" }}>Quote Submitted</div>
            <div style={{ fontSize: "12px", color: B.slate500, marginBottom: "20px" }}>
              DDP quote within <strong style={{ color: B.amber }}>2-4 hours</strong>.</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button onClick={() => setDdpSubmitted(false)} style={{ padding: "10px 20px", borderRadius: "10px",
                border: "none", cursor: "pointer", background: B.success, color: "white", fontSize: "12px", fontWeight: "700" }}>+ New</button>
              <button onClick={() => { setDdpSubmitted(false); setActiveView("inquiries"); }} style={{
                padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                background: "transparent", border: `1px solid ${B.ocean}40`,
                color: B.oceanLight, fontSize: "12px", fontWeight: "700" }}>View Orders</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "10px 14px", borderRadius: "10px", marginBottom: "14px",
              background: `${B.success}08`, border: `1px solid ${B.success}20` }}>
              <div style={{ fontSize: "11px", color: B.success, fontWeight: "700" }}>DDP = All-Inclusive Door-to-Door</div>
              <div style={{ fontSize: "10px", color: B.slate500, lineHeight: 1.5 }}>Freight, duty, clearance & delivery. No hidden fees.</div>
            </div>
            <div style={{ ...cardBase, padding: "14px", marginBottom: "12px" }}>
              <div style={labelSm}>Product Photos <span style={{ color: B.amber, fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>(max 5)</span></div>
              {ddpPhotos.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "8px 0" }}>
                  {ddpPhotos.map((file, i) => (
                    <div key={i} style={{ position: "relative", width: "64px", height: "64px",
                      borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <img src={URL.createObjectURL(file)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div onClick={() => setDdpPhotos(prev => prev.filter((_, j) => j !== i))} style={{
                        position: "absolute", top: "2px", right: "2px", width: "16px", height: "16px",
                        borderRadius: "50%", background: `${B.red}e0`, color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", fontWeight: "900", cursor: "pointer" }}>✕</div>
                    </div>
                  ))}
                </div>
              )}
              {ddpPhotos.length < 5 && (
                <div onClick={() => ddpRef.current?.click()} style={{ padding: "18px", borderRadius: "10px",
                  textAlign: "center", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)", marginTop: ddpPhotos.length > 0 ? "0" : "8px" }}>
                  <div style={{ fontSize: "10px", color: B.slate600 }}>Tap to upload · {ddpPhotos.length}/5</div>
                </div>
              )}
              <input ref={ddpRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleDdpPhotos} />
            </div>
            <div style={{ ...cardBase, padding: "14px", marginBottom: "12px" }}>
              <div style={labelSm}>Dimensions & Weight *</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px", marginTop: "6px" }}>
                {[{l:"L(cm)",v:ddpL,s:setDdpL},{l:"W(cm)",v:ddpW,s:setDdpW},{l:"H(cm)",v:ddpH,s:setDdpH},{l:"Wt(kg)",v:ddpKg,s:setDdpKg}].map(f => (
                  <div key={f.l}><div style={{ fontSize: "8px", color: B.slate600, marginBottom: "3px", textAlign: "center" }}>{f.l}</div>
                    <input type="number" value={f.v} onChange={e => f.s(e.target.value)} placeholder="0"
                      style={{ ...inputSty, fontSize: "13px", textAlign: "center", ...mono, padding: "8px 4px" }} /></div>
                ))}
              </div>
              {ddpCW > 0 && (
                <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px",
                  background: `${B.ocean}10`, border: `1px solid ${B.ocean}25`,
                  display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "10px", color: B.slate500 }}>Chargeable</span>
                  <span style={{ fontSize: "14px", fontWeight: "900", color: B.oceanLight, ...mono }}>{ddpCW.toFixed(1)} kg</span>
                </div>
              )}
            </div>
            <div style={{ ...cardBase, padding: "16px", marginBottom: "12px" }}>
              <div style={{ marginBottom: "16px" }}><div style={labelSm}>Product *</div>
                <input value={ddpProduct} onChange={e => setDdpProduct(e.target.value)} placeholder="Pet Treats" style={{ ...inputSty, fontSize: "12px" }} /></div>
              <div style={{ position: "relative", paddingLeft: "16px" }}>
                <div style={{ position: "absolute", left: "5px", top: "16px", bottom: "16px", width: "2px", background: B.slate700, borderRadius: "2px" }} />
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <div style={{ position: "absolute", left: "-14px", top: "10px", width: "6px", height: "6px",
                    borderRadius: "50%", background: B.slate400, border: `2px solid ${B.bg}` }} />
                  <div style={labelSm}>Pickup (Origin)</div>
                  <input value={ddpOrigin} onChange={e => setDdpOrigin(e.target.value)} placeholder="Factory address" style={{ ...inputSty, fontSize: "12px" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "-16px", top: "10px", width: "8px", height: "8px",
                    borderRadius: "50%", background: B.oceanLight, boxShadow: `0 0 8px ${B.oceanLight}` }} />
                  <div style={{ ...labelSm, color: B.oceanLight }}>Delivery *</div>
                  <input value={ddpDest} onChange={e => setDdpDest(e.target.value)} placeholder="Full delivery address"
                    style={{ ...inputSty, fontSize: "12px", borderColor: "rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.05)" }} />
                </div>
              </div>
            </div>
            {ddpEstimate > 0 && !isFactory && (
              <div style={{ padding: "14px", borderRadius: "12px", marginBottom: "12px",
                background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(30,58,138,0.10))",
                border: "1px solid rgba(16,185,129,0.25)" }}>
                <div style={{ fontSize: "9px", color: B.slate600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estimated DDP</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: B.success, ...mono }}>${fmt(ddpEstimate)}
                  <span style={{ fontSize: "11px", color: B.slate500, fontWeight: "500", marginLeft: "4px" }}>USD</span></div>
                <div style={{ fontSize: "9px", color: B.slate600 }}>@ ${ddpRate}/kg × {ddpCW.toFixed(1)} kg</div>
              </div>
            )}
            <button onClick={() => { if (ddpProduct && ddpDest && ddpKg) setDdpSubmitted(true); }}
              disabled={!ddpProduct || !ddpDest || !ddpKg}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                cursor: (!ddpProduct || !ddpDest || !ddpKg) ? "not-allowed" : "pointer",
                background: (!ddpProduct || !ddpDest || !ddpKg) ? B.slate800 : ddpEstimate > 0 ? B.success : B.ocean,
                color: (!ddpProduct || !ddpDest || !ddpKg) ? B.slate600 : "white",
                fontSize: "13px", fontWeight: "800", opacity: (!ddpProduct || !ddpDest || !ddpKg) ? 0.5 : 1 }}>
              {ddpEstimate > 0 ? `Book Now · $${fmt(ddpEstimate)}` : "Get DDP Quote"}</button>
          </>
        )}
      </div>
    </div>
  );


  // ═══════════════════════════════════════════════════════════
  //  INQUIRIES & ORDER TRACKING VIEW
  // ═══════════════════════════════════════════════════════════
  if (activeView === "inquiries") return (
    <div style={{ minHeight: "100vh", background: B.bg }}>
      <BackBar title="Inquiry & Track" />
      <div style={{ padding: "16px" }}>

        {/* ── Inquiry Form ── */}
        <div style={{ ...cardBase, padding: "16px", marginBottom: "16px", border: `1px solid ${B.amber}25` }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: B.amber, marginBottom: "12px" }}>Submit Inquiry</div>
          {inqSubmitted ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontSize: "13px", fontWeight: "800", color: B.slate50, marginBottom: "4px" }}>Submitted</div>
              <div style={{ fontSize: "11px", color: B.slate500, marginBottom: "12px" }}>We'll review and respond within 2-4 hours.</div>
              <button onClick={() => { setInqSubmitted(false); setInqProduct(""); setInqWeight(""); setInqQty(""); setInqRemark(""); }}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: B.ocean, color: "white", fontSize: "11px", fontWeight: "700" }}>+ New Inquiry</button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "6px", alignItems: "end", marginBottom: "10px" }}>
                <div><div style={labelSm}>POL</div>
                  <select value={inqPol} onChange={e => setInqPol(e.target.value)} style={{ ...inputSty, fontSize: "11px", padding: "8px" }}>
                    <option value="">Select</option>{PORTS_POL.map(p => <option key={p}>{p}</option>)}</select></div>
                <div style={{ fontSize: "14px", color: B.slate700, paddingBottom: "10px" }}>→</div>
                <div><div style={labelSm}>POD</div>
                  <select value={inqPod} onChange={e => setInqPod(e.target.value)} style={{ ...inputSty, fontSize: "11px", padding: "8px" }}>
                    <option value="">Select</option>{PORTS_POD.map(p => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: "10px" }}><div style={labelSm}>Product *</div>
                <input value={inqProduct} onChange={e => setInqProduct(e.target.value)} placeholder="Pet Food..." style={{ ...inputSty, fontSize: "12px" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                <div><div style={labelSm}>Weight (kg)</div>
                  <input type="number" value={inqWeight} onChange={e => setInqWeight(e.target.value)} placeholder="12000" style={{ ...inputSty, fontSize: "12px", ...mono }} /></div>
                <div><div style={labelSm}>Qty (CTN)</div>
                  <input type="number" value={inqQty} onChange={e => setInqQty(e.target.value)} placeholder="480" style={{ ...inputSty, fontSize: "12px", ...mono }} /></div>
              </div>
              <div style={{ marginBottom: "10px" }}><div style={labelSm}>Container</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {CONTAINER_TYPES.map(ct => (
                    <button key={ct.id} onClick={() => setInqContainer(ct.id)} style={{
                      flex: 1, padding: "8px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
                      background: inqContainer === ct.id ? "rgba(30,58,138,0.25)" : "rgba(255,255,255,0.03)",
                      color: inqContainer === ct.id ? B.oceanLight : B.slate600, fontSize: "11px",
                      fontWeight: inqContainer === ct.id ? "700" : "400" }}>{ct.label}</button>
                  ))}</div></div>
              <div style={{ marginBottom: "12px" }}><div style={labelSm}>Remark</div>
                <textarea value={inqRemark} onChange={e => setInqRemark(e.target.value)}
                  placeholder="Any special requirements..."
                  rows={2}
                  style={{ ...inputSty, fontSize: "11px", resize: "vertical", minHeight: "40px" }} /></div>
              <button onClick={() => { if (inqProduct) setInqSubmitted(true); }} disabled={!inqProduct}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none",
                  cursor: inqProduct ? "pointer" : "not-allowed",
                  background: inqProduct ? B.amber : B.slate800, color: inqProduct ? "#0b1120" : B.slate600,
                  fontSize: "12px", fontWeight: "700", opacity: inqProduct ? 1 : 0.5 }}>Submit Inquiry</button>
            </>
          )}
        </div>

        {/* ── Order Tracking ── */}
        <div style={{ ...labelSm, marginBottom: "8px" }}>Order Tracking & Documents</div>
        <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
          placeholder="Search B/L# or SO#" style={{ ...inputSty, fontSize: "12px", marginBottom: "8px", padding: "10px 12px" }} />

        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          <div style={{ flex: 1, display: "flex", gap: "4px",
            background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px" }}>
            {[{id:"all",l:"All"},{id:"in_transit",l:"Transit"},{id:"clearance",l:"Clearance"},{id:"delivered",l:"Delivered"}].map(f => (
              <button key={f.id} onClick={() => setOrderFilter(f.id)} style={{
                flex: 1, padding: "7px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "10px", fontWeight: orderFilter === f.id ? "800" : "400",
                background: orderFilter === f.id ? "rgba(30,58,138,0.25)" : "transparent",
                color: orderFilter === f.id ? B.oceanLight : B.slate600 }}>{f.l}</button>
            ))}
          </div>
          <button onClick={() => setOrderDateSort(v => v === "desc" ? "asc" : "desc")}
            style={{ padding: "6px 10px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.04)", color: B.slate500, fontSize: "10px" }}>
            {orderDateSort === "desc" ? "↓ Latest" : "↑ Oldest"}
          </button>
        </div>

        {filteredShipments.length === 0 ? (
          <div style={{ ...cardBase, textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px", opacity: 0.4 }}>📋</div>
            <div style={{ fontSize: "11px", color: B.slate600 }}>No orders found</div>
          </div>
        ) : filteredShipments.map(s => (
          <OrderDocCard key={s.id} s={s} isFactory={isFactory} />
        ))}
      </div>
    </div>
  );

  return null;
};
