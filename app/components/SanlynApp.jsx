'use client';
import { useState, useMemo } from 'react';
import { CustomerLogisticsTab } from "./CustomerLogistics";

// ═══════════════════════════════════════
// DATA & CONFIG
// ═══════════════════════════════════════

const USERS = {
  admin: { password: "sanlyn2026", role: "admin", name: "Sanlyn Admin", company: "FortuneSanlyn" },
  petsome: { password: "petsome123", role: "customer", name: "PETSOME", company: "PETSOME (EU) SDN BHD" },
  harmonious: { password: "harmonious123", role: "customer", name: "HARMONIOUS", company: "HARMONIOUS HARVEST SDN BHD" },
  factory: { password: "factory123", role: "factory", name: "漳州华安工厂", company: "华安" },
  driver: { password: "driver123", role: "trucker", name: "Driver", company: "拖车队" },
};

const DOC_TYPES = {
  bl: { label: "Bill of Lading", short: "B/L", icon: "📄", color: "#3b82f6", provider: "Carrier", providerIcon: "🚢" },
  certificate: { label: "Certificate", short: "Cert", icon: "📋", color: "#10b981", provider: "Factory", providerIcon: "🏭" },
  pi: { label: "Proforma Invoice", short: "PI", icon: "💰", color: "#8b5cf6", provider: "Sanlyn", providerIcon: "🏢" },
  packing_list: { label: "Packing List", short: "PKL", icon: "📦", color: "#f59e0b", provider: "Factory", providerIcon: "🏭" },
  payment: { label: "Payment Receipt", short: "TT", icon: "💳", color: "#ec4899", provider: "Customer", providerIcon: "🧑‍💼" },
};

const DOC_STATUS_MAP = {
  confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.08)", icon: "✅" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: "⏳" },
  revision: { label: "Revision", color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: "🔄" },
  not_uploaded: { label: "Not Uploaded", color: "#475569", bg: "rgba(71,85,105,0.08)", icon: "⬜" },
};

const STATUS_MAP = {
  production: { label: "Production", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  shipping: { label: "Shipping", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  delivered: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const ACTION_LABELS = {
  confirm_delivery: { label: "Confirm Delivery Date", icon: "📅", color: "#f59e0b" },
  confirm_bl: { label: "Confirm B/L", icon: "📄", color: "#3b82f6" },
  upload_payment: { label: "Upload Payment", icon: "💳", color: "#8b5cf6" },
};

const TASK_STATUS = {
  pending: { label: "To Do", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  in_progress: { label: "Doing", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  done: { label: "Done", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

const MOCK_TASKS = [
  { id: 1, type: "sample", title: "Ship DUCK flavor samples", customer: "PETSOME", priority: "high", dueDate: "2026-02-15", status: "pending", icon: "📦", color: "#ef4444", detail: "3 boxes SNIFFLY GF DOG CAN DUCK to KL" },
  { id: 2, type: "followup", title: "Follow up HARMONIOUS payment", customer: "HARMONIOUS", priority: "high", dueDate: "2026-02-14", status: "pending", icon: "💰", color: "#f59e0b", detail: "Invoice sent 7 days ago" },
  { id: 3, type: "sample", title: "Send cat treat samples", customer: "PETSOME", priority: "medium", dueDate: "2026-02-20", status: "pending", icon: "📦", color: "#3b82f6", detail: "New cat treat line - 5 flavors" },
  { id: 4, type: "product", title: "Update SALMON label design", customer: "Internal", priority: "medium", dueDate: "2026-02-18", status: "in_progress", icon: "🏷️", color: "#8b5cf6", detail: "MAQIS new labeling requirements" },
  { id: 5, type: "followup", title: "Confirm vessel booking MSC", customer: "MSC", priority: "low", dueDate: "2026-02-16", status: "done", icon: "🚢", color: "#10b981", detail: "2x40HQ confirmed" },
];

const PRODUCT_NEWS = [
  { id: 1, type: "new", title: "🆕 SNIFFLY Freeze-Dried Toppers", subtitle: "Coming March 2026", desc: "4 flavors: Chicken, Beef, Salmon, Duck.", image: "🧊", color: "#06b6d4" },
  { id: 2, type: "update", title: "🔄 DUCK Can New Formula", subtitle: "Improved recipe", desc: "Higher protein (12%→15%), new packaging.", image: "🦆", color: "#f59e0b" },
  { id: 3, type: "promo", title: "🎉 CNY Promotion", subtitle: "Order before Feb 28", desc: "Buy 20 pallets get 1 free.", image: "🧧", color: "#ef4444" },
];

const MOCK_ORDERS = [
  {
    id: "FS20260210028", customer: "PETSOME (EU) SDN BHD", brand: "SNIFFLY",
    portFrom: "Qingdao", portTo: "Port Klang Westport", orderDate: "2026-01-15",
    tradeTerms: "FOB", currency: "CNY", containerType: "40HQ", containerQty: 2,
    totalQty: 2736, totalAmount: 213888, status: "shipping", statusStep: 4,
    pendingActions: ["confirm_bl"],
    shipping: { carrier: "MSC", vessel: "MSC POSITANO", voyage: "AE7-2026W08", etd: "2026-02-20", eta: "2026-03-06", blNo: "MEDUSH4250987" },
    containers: [
      { no: "MSNU6517449", type: "40HQ", sealNo: "FJ26803573", photos: 9 },
      { no: "TEMU8832156", type: "40HQ", sealNo: "FJ26803601", photos: 9 },
    ],
    products: [
      { name: "SNIFFLY GF DOG CAN SALMON", qty: 600, amount: 43200, cbm: 9.6, container: 1 },
      { name: "SNIFFLY GF DOG CAN TURKEY", qty: 240, amount: 17280, cbm: 3.84, container: 1 },
      { name: "SNIFFLY GF DOG CAN LAMB", qty: 600, amount: 43200, cbm: 9.6, container: 1 },
      { name: "SNIFFLY GF DOG CAN DUCK", qty: 240, amount: 17280, cbm: 3.84, container: 1 },
      { name: "SNIFFLY DOG TRAY CODFISH", qty: 176, amount: 15488, cbm: 2.112, container: 2 },
      { name: "SNIFFLY DOG TRAY TURKEY", qty: 176, amount: 15488, cbm: 2.112, container: 2 },
    ],
    documents: [
      { type: "bl", status: "pending", version: 2, filename: "BL_MEDUSH4250987_v2.pdf", fileSize: "1.2MB", uploadedAt: "2026-02-11", uploadedBy: "MSC Agent", note: "Verify consignee & HS code",
        history: [{ version: 1, date: "2026-02-09", action: "Uploaded" },{ version: 1, date: "2026-02-10", action: "Revision: Wrong port" },{ version: 2, date: "2026-02-11", action: "Revised uploaded" }] },
      { type: "certificate", status: "pending", version: 1, filename: "order54_56_58_证书.pdf", fileSize: "1.8MB", uploadedAt: "2026-02-12", uploadedBy: "漳州华安工厂",
        history: [{ version: 1, date: "2026-02-12", action: "Uploaded by factory" }] },
      { type: "pi", status: "confirmed", version: 1, filename: "PI_FS028.pdf", fileSize: "0.4MB", uploadedAt: "2026-02-06", uploadedBy: "Sanlyn", confirmedAt: "2026-02-07",
        history: [{ version: 1, date: "2026-02-06", action: "Generated" },{ version: 1, date: "2026-02-07", action: "Confirmed ✅" }] },
      { type: "packing_list", status: "not_uploaded", version: 0, note: "Waiting factory", history: [] },
      { type: "payment", status: "not_uploaded", version: 0, history: [] },
    ],
    timeline: [
      { step: "Order Placed", date: "2026-01-15", done: true },{ step: "Delivery Confirmed", date: "2026-01-20", done: true },
      { step: "Shipping Booked", date: "2026-02-05", done: true },{ step: "Container Loaded", date: "2026-02-11", done: true },
      { step: "B/L Confirmation", date: null, done: false, action: "confirm_bl", urgent: true },
      { step: "Customs Cleared", date: null, done: false },{ step: "Departed", date: null, done: false },
      { step: "Payment", date: null, done: false },{ step: "Arrived", date: null, done: false },{ step: "Completed", date: null, done: false },
    ],
  },
  {
    id: "FS20260210027", customer: "PETSOME (EU) SDN BHD", brand: "PROPAW",
    portFrom: "Qingdao", portTo: "Port Klang Westport", orderDate: "2026-01-10",
    tradeTerms: "FOB", currency: "CNY", containerType: "20GP", containerQty: 1,
    totalQty: 1444, totalAmount: 22959, status: "delivered", statusStep: 10,
    pendingActions: [],
    shipping: { carrier: "COSCO", vessel: "COSCO PRIDE", voyage: "FE3-2026W06", etd: "2026-02-03", eta: "2026-02-15" },
    containers: [{ no: "TRLU4456789", type: "20GP", sealNo: "CN12345678", photos: 9 }],
    products: [{ name: "PROPAW CAT LITTER LEMON", qty: 1444, amount: 22959, cbm: 3.17, container: 1 }],
    documents: [
      { type: "bl", status: "confirmed", version: 1, filename: "BL_COSCO.pdf", fileSize: "1.1MB", confirmedAt: "2026-02-03", history: [] },
      { type: "certificate", status: "confirmed", version: 1, filename: "Cert_027.pdf", fileSize: "0.9MB", confirmedAt: "2026-01-29", history: [] },
      { type: "pi", status: "confirmed", version: 1, filename: "PI_027.pdf", fileSize: "0.3MB", confirmedAt: "2026-01-13", history: [] },
      { type: "packing_list", status: "confirmed", version: 1, filename: "PKL_027.pdf", fileSize: "0.5MB", confirmedAt: "2026-02-02", history: [] },
      { type: "payment", status: "confirmed", version: 1, filename: "TT_027.pdf", fileSize: "0.8MB", confirmedAt: "2026-02-08",
        ocrData: { ref: "FT26020812345", amount: "CNY 22,959.00", bank: "Public Bank" }, history: [] },
    ],
    timeline: [{ step: "Completed", date: "2026-02-17", done: true }],
  },
  {
    id: "FS20260210030", customer: "PETSOME (EU) SDN BHD", brand: "SNIFFLY",
    portFrom: "Xiamen", portTo: "Port Klang Westport", orderDate: "2026-02-08",
    tradeTerms: "FOB", currency: "CNY", containerType: "40HQ", containerQty: 1,
    totalQty: 800, totalAmount: 58400, status: "production", statusStep: 2,
    pendingActions: ["confirm_delivery"],
    shipping: null, containers: [],
    products: [
      { name: "SNIFFLY GF DOG CAN SALMON", qty: 400, amount: 28800, cbm: 6.4 },
      { name: "SNIFFLY DOG TRAY CODFISH", qty: 400, amount: 29600, cbm: 4.8 },
    ],
    documents: [
      { type: "bl", status: "not_uploaded", version: 0, history: [] },
      { type: "certificate", status: "not_uploaded", version: 0, history: [] },
      { type: "pi", status: "pending", version: 1, filename: "PI_030.pdf", fileSize: "0.4MB", uploadedAt: "2026-02-09", uploadedBy: "Sanlyn",
        history: [{ version: 1, date: "2026-02-09", action: "Generated" }] },
      { type: "packing_list", status: "not_uploaded", version: 0, history: [] },
      { type: "payment", status: "not_uploaded", version: 0, history: [] },
    ],
    timeline: [{ step: "Order Placed", date: "2026-02-08", done: true },{ step: "Delivery", date: null, done: false, action: "confirm_delivery", urgent: true }],
  },
];

// ═══════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════

const Badge = ({ status }) => { const s = STATUS_MAP[status] || { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" }; return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,color:s.color,background:s.bg,border:`1px solid ${s.color}22` }}><span style={{ width:5,height:5,borderRadius:"50%",background:s.color }}/>{s.label}</span>; };
const Card = ({ title, children, accent, onClick }) => <div onClick={onClick} style={{ background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"14px 16px",border:`1px solid ${accent?accent+"20":"rgba(255,255,255,0.05)"}`,borderLeft:accent?`3px solid ${accent}40`:undefined,cursor:onClick?"pointer":"default" }}>{title&&<div style={{ color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:0.8,marginBottom:12 }}>{title}</div>}{children}</div>;
const MiniInfo = ({ label, value, highlight }) => <div><div style={{ color:"#475569",fontSize:9,fontWeight:600 }}>{label}</div><div style={{ color:highlight?"#60a5fa":"#cbd5e1",fontSize:12,fontWeight:600,marginTop:1 }}>{value}</div></div>;
const Modal = ({ children, onClose }) => <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,padding:16 }}><div onClick={e=>e.stopPropagation()} style={{ background:"#1e293b",borderRadius:18,padding:22,width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,0.08)",animation:"slideUp 0.3s ease-out",maxHeight:"80vh",overflowY:"auto" }}>{children}</div></div>;
const NotifBadge = ({ count, color="#ef4444", style:s={} }) => count>0?<span style={{ minWidth:16,height:16,borderRadius:8,background:color,color:"#fff",fontSize:8,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px",...s }}>{count}</span>:null;

// ═══════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      const user = USERS[username.toLowerCase()];
      if (user && user.password === password) onLogin({ ...user, username: username.toLowerCase() });
      else setError("Invalid username or password");
      setLoading(false);
    }, 600);
  };

  const quickLogin = (u) => {
    const user = USERS[u];
    setUsername(u); setPassword(user.password);
    setTimeout(() => onLogin({ ...user, username: u }), 300);
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ textAlign:"center",marginBottom:32,animation:"fadeIn 0.5s ease-out" }}>
        <div style={{ width:64,height:64,borderRadius:16,margin:"0 auto 16px",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",boxShadow:"0 8px 32px rgba(29,78,216,0.3)" }}>S</div>
        <div style={{ color:"#f1f5f9",fontSize:26,fontWeight:900,letterSpacing:1 }}>Sanlyn<span style={{ color:"#3b82f6" }}> OS</span></div>
        <div style={{ color:"#475569",fontSize:11,marginTop:4,letterSpacing:2,fontWeight:500 }}>SMART LOGISTICS PLATFORM</div>
      </div>
      <div style={{ width:"100%",maxWidth:380,background:"rgba(255,255,255,0.02)",borderRadius:20,padding:"28px 24px",border:"1px solid rgba(255,255,255,0.06)",animation:"fadeIn 0.5s ease-out 0.1s both" }}>
        <div style={{ color:"#e2e8f0",fontSize:16,fontWeight:700,marginBottom:20 }}>Sign In</div>
        <div style={{ marginBottom:14 }}>
          <label style={{ color:"#64748b",fontSize:10,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:5 }}>USERNAME</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. admin, petsome" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontSize:14,boxSizing:"border-box" }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ color:"#64748b",fontSize:10,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:5 }}>PASSWORD</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontSize:14,boxSizing:"border-box" }} />
        </div>
        {error&&<div style={{ color:"#fca5a5",fontSize:12,marginBottom:12,padding:"8px 12px",background:"rgba(239,68,68,0.08)",borderRadius:8 }}>❌ {error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width:"100%",padding:"13px",borderRadius:10,border:"none",background:loading?"#1e3a5f":"linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(29,78,216,0.3)" }}>
          {loading?"⏳ Signing in...":"Sign In →"}
        </button>
        <div style={{ marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ color:"#475569",fontSize:10,fontWeight:600,letterSpacing:0.5,marginBottom:10 }}>QUICK LOGIN (DEMO)</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {[{k:"admin",l:"🔑 Admin",c:"#3b82f6"},{k:"petsome",l:"🏢 PETSOME",c:"#10b981"},{k:"harmonious",l:"🏢 HARMONIOUS",c:"#06b6d4"},{k:"factory",l:"🏭 Factory",c:"#f59e0b"},{k:"driver",l:"🚛 Driver",c:"#8b5cf6"}].map(u=>
              <button key={u.k} onClick={()=>quickLogin(u.k)} style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${u.c}30`,background:`${u.c}10`,color:u.c,fontSize:10,fontWeight:700,cursor:"pointer" }}>{u.l}</button>
            )}
          </div>
        </div>
      </div>
      <div style={{ color:"#334155",fontSize:10,marginTop:20 }}>© 2026 FortuneSanlyn · Sanlyn OS v1.0</div>
    </div>
  );
}

// ═══════════════════════════════════════
// DOCUMENTS TAB
// ═══════════════════════════════════════

function DocumentsTab({ order }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showRevModal, setShowRevModal] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [revText, setRevText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [docs, setDocs] = useState(order.documents||[]);
  const conf = docs.filter(d=>d.status==="confirmed").length;
  const pend = docs.filter(d=>d.status==="pending").length;
  const total = docs.length;

  const confirm = (t)=>{ setDocs(p=>p.map(d=>d.type===t?{...d,status:"confirmed",confirmedAt:"Just now"}:d)); setSelectedDoc(null); };
  const revise = (t)=>{ if(!revText.trim())return; setDocs(p=>p.map(d=>d.type===t?{...d,status:"revision",history:[...(d.history||[]),{version:d.version,date:"Today",action:`Revision: ${revText}`}]}:d)); setRevText(""); setShowRevModal(null); };
  const doOCR = ()=>{ setOcrLoading(true); setTimeout(()=>{ setOcrResult({ ref:"FT"+Math.floor(Math.random()*9e7+1e7), amount:`CNY ${order.totalAmount?.toLocaleString()}.00`, bank:"Public Bank", matched:true, matchedOrder:order.id }); setOcrLoading(false); },2500); };
  const confirmPay = ()=>{ setDocs(p=>p.map(d=>d.type==="payment"?{...d,status:"confirmed",version:1,filename:`TT_${order.id}.pdf`,fileSize:"0.6MB",confirmedAt:"Just now",ocrData:ocrResult}:d)); setShowUpload(false); setOcrResult(null); };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      <div style={{ display:"flex",gap:8,padding:"12px 14px",borderRadius:10,background:conf===total?"rgba(16,185,129,0.06)":"rgba(245,158,11,0.06)",border:`1px solid ${conf===total?"#10b98120":"#f59e0b20"}` }}>
        <div style={{ flex:1 }}><div style={{ color:"#e2e8f0",fontSize:13,fontWeight:700 }}>{conf===total?"🎉 All Confirmed":`📑 ${conf}/${total} Confirmed`}</div><div style={{ color:"#64748b",fontSize:10,marginTop:2 }}>{pend>0?`${pend} pending review`:conf===total?"All documents ready":""}</div></div>
        <div style={{ position:"relative",width:40,height:40 }}><svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/><circle cx="20" cy="20" r="16" fill="none" stroke={conf===total?"#10b981":"#f59e0b"} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(conf/total)*100.5} 100.5`} transform="rotate(-90 20 20)"/></svg><div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#e2e8f0",fontSize:10,fontWeight:800 }}>{conf}/{total}</div></div>
      </div>
      {docs.map((doc,i)=>{
        const dt=DOC_TYPES[doc.type],ds=DOC_STATUS_MAP[doc.status],open=selectedDoc===doc.type;
        return(
          <div key={doc.type} style={{ borderRadius:12,overflow:"hidden",border:`1px solid ${doc.status==="pending"?dt.color+"30":"rgba(255,255,255,0.05)"}`,background:doc.status==="pending"?`${dt.color}04`:"rgba(255,255,255,0.02)",animation:`fadeIn 0.2s ease-out ${i*0.05}s both` }}>
            <div onClick={()=>setSelectedDoc(open?null:doc.type)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer" }}>
              <div style={{ width:38,height:38,borderRadius:10,background:`${dt.color}10`,border:`1px solid ${dt.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{dt.icon}</div>
              <div style={{ flex:1 }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ color:"#e2e8f0",fontSize:13,fontWeight:700 }}>{dt.label}</span>{doc.version>0&&<span style={{ color:"#475569",fontSize:9 }}>v{doc.version}</span>}</div><div style={{ color:"#64748b",fontSize:10,marginTop:1 }}>{doc.status==="not_uploaded"?`Waiting · ${dt.provider}`:doc.status==="confirmed"?`Confirmed ${doc.confirmedAt||""}`:`${dt.provider} · ${doc.uploadedAt||""}`}</div></div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}><span style={{ padding:"3px 8px",borderRadius:5,fontSize:9,fontWeight:700,color:ds.color,background:ds.bg }}>{ds.icon} {ds.label}</span><span style={{ color:"#475569",fontSize:12,transform:open?"rotate(180deg)":"",transition:"transform 0.2s" }}>▾</span></div>
            </div>
            {open&&<div style={{ padding:"0 16px 16px",borderTop:"1px solid rgba(255,255,255,0.04)",animation:"fadeIn 0.2s" }}>
              {doc.filename&&<div style={{ display:"flex",alignItems:"center",gap:10,padding:12,background:"rgba(0,0,0,0.15)",borderRadius:8,marginTop:12 }}><div style={{ width:36,height:42,borderRadius:4,background:`linear-gradient(135deg,${dt.color}30,${dt.color}10)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:dt.color }}>PDF</div><div style={{ flex:1 }}><div style={{ color:"#e2e8f0",fontSize:11,fontWeight:600,wordBreak:"break-all" }}>{doc.filename}</div><div style={{ color:"#64748b",fontSize:9,marginTop:2 }}>{doc.fileSize}{doc.uploadedBy&&` · ${doc.uploadedBy}`}</div></div><button style={{ padding:"6px 12px",borderRadius:6,border:`1px solid ${dt.color}30`,background:`${dt.color}08`,color:dt.color,fontSize:10,fontWeight:700,cursor:"pointer" }}>View</button></div>}
              {doc.note&&<div style={{ padding:"8px 12px",background:"rgba(245,158,11,0.05)",borderRadius:6,marginTop:8,borderLeft:"3px solid rgba(245,158,11,0.3)" }}><div style={{ color:"#fbbf24",fontSize:9,fontWeight:700,marginBottom:2 }}>NOTE</div><div style={{ color:"#94a3b8",fontSize:11 }}>{doc.note}</div></div>}
              {doc.ocrData&&<div style={{ padding:"10px 12px",background:"rgba(16,185,129,0.05)",borderRadius:8,marginTop:8,border:"1px solid rgba(16,185,129,0.1)" }}><div style={{ color:"#10b981",fontSize:9,fontWeight:700,marginBottom:8 }}>🤖 AUTO-EXTRACTED</div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}><div><div style={{ color:"#475569",fontSize:8 }}>Ref</div><div style={{ color:"#e2e8f0",fontSize:11,fontFamily:"monospace" }}>{doc.ocrData.ref}</div></div><div><div style={{ color:"#475569",fontSize:8 }}>Amount</div><div style={{ color:"#10b981",fontSize:11,fontWeight:700 }}>{doc.ocrData.amount}</div></div></div></div>}
              {(doc.history||[]).length>0&&<button onClick={()=>setShowHistory(doc.type)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:6,border:"1px solid rgba(255,255,255,0.04)",color:"#64748b",fontSize:10,fontWeight:600,cursor:"pointer",marginTop:8,width:"100%" }}>🕐 History · {doc.history.length}</button>}
              {doc.status==="pending"&&<div style={{ display:"flex",gap:8,marginTop:12 }}><button onClick={()=>setShowRevModal(doc.type)} style={{ flex:1,padding:10,borderRadius:8,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.05)",color:"#fca5a5",fontSize:12,fontWeight:600,cursor:"pointer" }}>✏️ Change</button><button onClick={()=>confirm(doc.type)} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:`linear-gradient(135deg,${dt.color}cc,${dt.color})`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>✅ Confirm</button></div>}
              {doc.status==="revision"&&<div style={{ padding:"10px 12px",background:"rgba(239,68,68,0.05)",borderRadius:8,marginTop:12 }}><div style={{ color:"#fca5a5",fontSize:11,fontWeight:600 }}>🔄 Waiting {dt.provider} revision</div></div>}
              {doc.status==="not_uploaded"&&doc.type==="payment"&&<button onClick={()=>{setShowUpload(true);setOcrResult(null)}} style={{ width:"100%",padding:12,borderRadius:8,border:`2px dashed ${dt.color}30`,background:`${dt.color}04`,color:dt.color,fontSize:12,fontWeight:700,cursor:"pointer",marginTop:12 }}>📤 Upload TT Receipt</button>}
              {doc.status==="not_uploaded"&&doc.type!=="payment"&&<div style={{ padding:14,borderRadius:8,border:"2px dashed rgba(255,255,255,0.06)",textAlign:"center",marginTop:12 }}><div style={{ color:"#475569",fontSize:20,marginBottom:4 }}>{dt.providerIcon}</div><div style={{ color:"#64748b",fontSize:11 }}>Waiting for {dt.provider}</div></div>}
              {doc.status==="confirmed"&&<div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(16,185,129,0.05)",borderRadius:6,marginTop:12 }}><span style={{ color:"#10b981",fontSize:14 }}>✅</span><div style={{ color:"#10b981",fontSize:11,fontWeight:600 }}>Confirmed {doc.confirmedAt||""}</div></div>}
            </div>}
          </div>
        );
      })}
      {showRevModal&&<Modal onClose={()=>{setShowRevModal(null);setRevText("")}}><div style={{ fontSize:18,marginBottom:4 }}>✏️</div><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700,marginBottom:14 }}>Request Change</div><textarea value={revText} onChange={e=>setRevText(e.target.value)} placeholder="What needs correcting?" rows={3} style={{ width:"100%",padding:12,borderRadius:8,border:"1.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontSize:13,resize:"vertical",boxSizing:"border-box" }}/><div style={{ display:"flex",gap:8,marginTop:14 }}><button onClick={()=>{setShowRevModal(null);setRevText("")}} style={{ flex:1,padding:11,borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button><button onClick={()=>revise(showRevModal)} style={{ flex:2,padding:11,borderRadius:8,border:"none",background:revText.trim()?"linear-gradient(135deg,#dc2626,#ef4444)":"#1e293b",color:"#fff",fontSize:13,fontWeight:700,cursor:revText.trim()?"pointer":"not-allowed",opacity:revText.trim()?1:0.4 }}>Send</button></div></Modal>}
      {showUpload&&<Modal onClose={()=>{setShowUpload(false);setOcrResult(null);setOcrLoading(false)}}><div style={{ fontSize:18,marginBottom:4 }}>💳</div><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700,marginBottom:14 }}>Upload TT Receipt</div>{!ocrLoading&&!ocrResult&&<div onClick={doOCR} style={{ border:"2px dashed rgba(236,72,153,0.2)",borderRadius:12,padding:"28px 14px",textAlign:"center",cursor:"pointer",background:"rgba(236,72,153,0.03)" }}><div style={{ fontSize:32,marginBottom:8 }}>📎</div><div style={{ color:"#e2e8f0",fontSize:13,fontWeight:600 }}>Tap to upload</div></div>}{ocrLoading&&<div style={{ textAlign:"center",padding:"24px 0" }}><div style={{ fontSize:36,animation:"pulse 1.5s infinite" }}>🤖</div><div style={{ color:"#f1f5f9",fontSize:14,fontWeight:700,marginTop:12 }}>AI Processing...</div><div style={{ margin:"14px auto 0",width:"60%",height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden" }}><div style={{ height:"100%",background:"linear-gradient(90deg,#ec4899,#8b5cf6)",borderRadius:2,animation:"loading 2s ease-in-out" }}/></div></div>}{ocrResult&&<><div style={{ padding:14,background:"rgba(16,185,129,0.06)",borderRadius:10,border:"1px solid rgba(16,185,129,0.15)" }}><div style={{ color:"#10b981",fontSize:12,fontWeight:700,marginBottom:10 }}>🤖 Extracted</div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}><div><div style={{ color:"#475569",fontSize:9 }}>Ref</div><div style={{ color:"#e2e8f0",fontSize:12,fontFamily:"monospace",marginTop:2 }}>{ocrResult.ref}</div></div><div><div style={{ color:"#475569",fontSize:9 }}>Amount</div><div style={{ color:"#10b981",fontSize:12,fontWeight:700,marginTop:2 }}>{ocrResult.amount}</div></div></div>{ocrResult.matched&&<div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:"rgba(16,185,129,0.1)",borderRadius:6,marginTop:10 }}><span>✅</span><span style={{ color:"#10b981",fontSize:11,fontWeight:600 }}>Matched {ocrResult.matchedOrder}</span></div>}</div><div style={{ display:"flex",gap:8,marginTop:14 }}><button onClick={()=>{setShowUpload(false);setOcrResult(null)}} style={{ flex:1,padding:11,borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button><button onClick={confirmPay} style={{ flex:2,padding:11,borderRadius:8,border:"none",background:"linear-gradient(135deg,#10b981,#34d399)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>✅ Submit</button></div></>}</Modal>}
      {showHistory&&(()=>{const doc=docs.find(d=>d.type===showHistory),dt=DOC_TYPES[showHistory];return<Modal onClose={()=>setShowHistory(null)}><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700,marginBottom:14 }}>🕐 {dt.label} History</div><div style={{ position:"relative",paddingLeft:20 }}><div style={{ position:"absolute",left:5,top:4,bottom:4,width:2,background:"rgba(255,255,255,0.05)" }}/>{(doc.history||[]).map((h,i)=><div key={i} style={{ position:"relative",marginBottom:14 }}><div style={{ position:"absolute",left:-20,top:2,width:12,height:12,borderRadius:"50%",background:h.action.includes("✅")?"#10b981":h.action.includes("Revision")?"#ef4444":"#1d4ed8",border:"2px solid #1e293b",zIndex:1 }}/><div style={{ color:"#e2e8f0",fontSize:11,fontWeight:600 }}>{h.action}</div><div style={{ color:"#475569",fontSize:9,marginTop:2 }}>v{h.version} · {h.date}</div></div>)}</div><button onClick={()=>setShowHistory(null)} style={{ width:"100%",padding:10,borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#94a3b8",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:6 }}>Close</button></Modal>})()}
    </div>
  );
}

// ═══════════════════════════════════════
// TASK BOARD
// ═══════════════════════════════════════

function TaskBoard({ onBack }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title:"", detail:"", priority:"medium", type:"followup" });
  const filtered = filter==="all"?tasks:tasks.filter(t=>t.status===filter);
  const cnt = { all:tasks.length, pending:tasks.filter(t=>t.status==="pending").length, in_progress:tasks.filter(t=>t.status==="in_progress").length, done:tasks.filter(t=>t.status==="done").length };
  const toggle = (id)=>setTasks(p=>p.map(t=>t.id!==id?t:{...t,status:t.status==="pending"?"in_progress":t.status==="in_progress"?"done":"pending"}));
  const add = ()=>{ if(!newTask.title.trim())return; setTasks(p=>[...p,{...newTask,id:Date.now(),status:"pending",customer:"Custom",icon:"📌",color:newTask.priority==="high"?"#ef4444":"#3b82f6"}]); setNewTask({title:"",detail:"",priority:"medium",type:"followup"}); setShowAdd(false); };

  return(
    <div style={{ animation:"fadeIn 0.3s" }}>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#60a5fa",fontSize:12,fontWeight:600,cursor:"pointer",padding:"0 0 10px" }}>← Back</button>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div><div style={{ color:"#f1f5f9",fontSize:18,fontWeight:800 }}>📌 Tasks</div><div style={{ color:"#64748b",fontSize:11,marginTop:2 }}>{cnt.pending+cnt.in_progress} open</div></div>
        <button onClick={()=>setShowAdd(true)} style={{ padding:"8px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer" }}>+ Add</button>
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:12 }}>{[{k:"all",l:`All (${cnt.all})`},{k:"pending",l:`To Do (${cnt.pending})`},{k:"in_progress",l:`Doing (${cnt.in_progress})`},{k:"done",l:`Done (${cnt.done})`}].map(f=><button key={f.k} onClick={()=>setFilter(f.k)} style={{ padding:"6px 12px",borderRadius:6,border:"none",background:filter===f.k?"rgba(59,130,246,0.15)":"rgba(255,255,255,0.03)",color:filter===f.k?"#60a5fa":"#64748b",fontSize:10,fontWeight:600,cursor:"pointer" }}>{f.l}</button>)}</div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>{filtered.map((t,i)=><div key={t.id} style={{ display:"flex",gap:12,padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${t.status==="done"?"rgba(255,255,255,0.03)":t.color+"20"}`,borderLeft:`3px solid ${t.status==="done"?"#10b98140":t.color+"60"}`,opacity:t.status==="done"?0.6:1,animation:`fadeIn 0.2s ease-out ${i*0.04}s both` }}>
        <div onClick={()=>toggle(t.id)} style={{ width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,border:t.status==="done"?"2px solid #10b981":`2px solid ${t.color}40`,background:t.status==="done"?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>{t.status==="done"&&<span style={{ color:"#fff",fontSize:10 }}>✓</span>}{t.status==="in_progress"&&<span style={{ width:8,height:8,borderRadius:2,background:t.color }}/>}</div>
        <div style={{ flex:1 }}><div style={{ color:t.status==="done"?"#64748b":"#e2e8f0",fontSize:12,fontWeight:600,textDecoration:t.status==="done"?"line-through":"none" }}>{t.icon} {t.title}</div><div style={{ display:"flex",gap:8,marginTop:4 }}><span style={{ color:"#475569",fontSize:9 }}>{t.customer}</span><span style={{ color:t.priority==="high"?"#fca5a5":"#64748b",fontSize:9 }}>{t.priority==="high"?"🔴":"🟡"} {t.dueDate?.slice(5)}</span></div></div>
        <span style={{ padding:"3px 6px",borderRadius:4,fontSize:8,fontWeight:700,alignSelf:"flex-start",color:TASK_STATUS[t.status].color,background:TASK_STATUS[t.status].bg }}>{TASK_STATUS[t.status].label}</span>
      </div>)}</div>
      {showAdd&&<Modal onClose={()=>setShowAdd(false)}><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700,marginBottom:14 }}>📌 New Task</div><input value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="Task title..." style={{ width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontSize:13,marginBottom:10,boxSizing:"border-box" }}/><textarea value={newTask.detail} onChange={e=>setNewTask(p=>({...p,detail:e.target.value}))} placeholder="Details..." rows={2} style={{ width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#e2e8f0",fontSize:12,resize:"none",marginBottom:10,boxSizing:"border-box" }}/><div style={{ display:"flex",gap:8,marginTop:4 }}><button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:11,borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button><button onClick={add} style={{ flex:2,padding:11,borderRadius:8,border:"none",background:newTask.title.trim()?"linear-gradient(135deg,#1d4ed8,#3b82f6)":"#1e293b",color:"#fff",fontSize:13,fontWeight:700,cursor:newTask.title.trim()?"pointer":"not-allowed",opacity:newTask.title.trim()?1:0.4 }}>Add</button></div></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════
// NEWS PAGE
// ═══════════════════════════════════════

function NewsPage({ onBack }) {
  const [sel, setSel] = useState(null);
  return(
    <div style={{ animation:"fadeIn 0.3s" }}>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#60a5fa",fontSize:12,fontWeight:600,cursor:"pointer",padding:"0 0 10px" }}>← Back</button>
      <div style={{ color:"#f1f5f9",fontSize:18,fontWeight:800,marginBottom:14 }}>✨ What's New</div>
      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>{PRODUCT_NEWS.map((n,i)=><div key={n.id} onClick={()=>setSel(sel===n.id?null:n.id)} style={{ borderRadius:12,overflow:"hidden",background:`linear-gradient(135deg,${n.color}06,${n.color}02)`,border:`1px solid ${n.color}20`,cursor:"pointer",animation:`fadeIn 0.2s ease-out ${i*0.06}s both` }}>
        <div style={{ display:"flex",gap:12,padding:"14px 16px" }}><div style={{ width:48,height:48,borderRadius:12,background:`${n.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{n.image}</div><div style={{ flex:1 }}><span style={{ fontSize:8,fontWeight:700,color:n.color,padding:"2px 6px",borderRadius:3,background:`${n.color}15`,textTransform:"uppercase" }}>{n.type==="new"?"New":n.type==="update"?"Update":"Promo"}</span><div style={{ color:"#e2e8f0",fontSize:13,fontWeight:700,lineHeight:1.3,marginTop:4 }}>{n.title}</div><div style={{ color:"#64748b",fontSize:10,marginTop:2 }}>{n.subtitle}</div></div></div>
        {sel===n.id&&<div style={{ padding:"0 16px 14px",borderTop:"1px solid rgba(255,255,255,0.04)",animation:"fadeIn 0.2s" }}><div style={{ color:"#94a3b8",fontSize:12,lineHeight:1.5,padding:"12px 0" }}>{n.desc}</div><button style={{ width:"100%",padding:10,borderRadius:8,border:"none",background:`linear-gradient(135deg,${n.color}cc,${n.color})`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>{n.type==="promo"?"🛒 Order Now":"📋 Request Samples"}</button></div>}
      </div>)}</div>
    </div>
  );
}

// ═══════════════════════════════════════
// ORDER LIST & DETAIL
// ═══════════════════════════════════════

function OrderList({ onSelect, onTasks, onNews }) {
  const [filter, setFilter] = useState("all");
  const stats = useMemo(()=>({all:MOCK_ORDERS.length,production:MOCK_ORDERS.filter(o=>o.status==="production").length,shipping:MOCK_ORDERS.filter(o=>o.status==="shipping").length,delivered:MOCK_ORDERS.filter(o=>o.status==="delivered").length}),[]);
  const filtered = filter==="all"?MOCK_ORDERS:MOCK_ORDERS.filter(o=>o.status===filter);
  const totalPending = MOCK_ORDERS.reduce((s,o)=>s+(o.documents||[]).filter(d=>d.status==="pending").length+(o.pendingActions||[]).length,0);
  const pendingTasks = MOCK_TASKS.filter(t=>t.status!=="done").length;

  return(
    <div>
      {totalPending>0&&<div style={{ display:"flex",gap:8,marginBottom:12,padding:"10px 14px",background:"linear-gradient(135deg,rgba(239,68,68,0.08),rgba(245,158,11,0.06))",borderRadius:10,border:"1px solid rgba(239,68,68,0.12)",animation:"fadeIn 0.3s" }}><div style={{ position:"relative" }}><span style={{ fontSize:22 }}>🔔</span><NotifBadge count={totalPending} style={{ position:"absolute",top:-4,right:-6 }}/></div><div style={{ flex:1 }}><div style={{ color:"#fca5a5",fontSize:12,fontWeight:700 }}>{totalPending} items need attention</div><div style={{ color:"#64748b",fontSize:10,marginTop:1 }}>Documents & actions pending</div></div></div>}
      <div style={{ display:"flex",gap:6,marginBottom:12 }}>{[{i:"📋",v:stats.all,l:"Total",c:"#3b82f6",k:"all"},{i:"🏭",v:stats.production,l:"Production",c:"#f59e0b",k:"production"},{i:"🚢",v:stats.shipping,l:"Shipping",c:"#06b6d4",k:"shipping"},{i:"✅",v:stats.delivered,l:"Done",c:"#10b981",k:"delivered"}].map(s=><div key={s.k} onClick={()=>setFilter(s.k)} style={{ flex:1,padding:"14px 10px",borderRadius:12,cursor:"pointer",background:filter===s.k?`${s.c}12`:"rgba(255,255,255,0.02)",border:filter===s.k?`1.5px solid ${s.c}33`:"1.5px solid rgba(255,255,255,0.04)",textAlign:"center",minWidth:70 }}><div style={{ fontSize:16,marginBottom:2 }}>{s.i}</div><div style={{ color:s.c,fontSize:22,fontWeight:800,lineHeight:1 }}>{s.v}</div><div style={{ color:"#64748b",fontSize:8,fontWeight:600,marginTop:3 }}>{s.l}</div></div>)}</div>
      <div style={{ marginBottom:12 }}><div onClick={onTasks} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,cursor:"pointer" }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:0.8 }}>📌 TASKS</span><NotifBadge count={pendingTasks}/></div><span style={{ color:"#60a5fa",fontSize:10,fontWeight:600 }}>All →</span></div><div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4 }}>{MOCK_TASKS.filter(t=>t.status!=="done").slice(0,3).map((t,i)=><div key={t.id} style={{ minWidth:200,padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:`1px solid ${t.color}20`,borderLeft:`3px solid ${t.color}60`,flexShrink:0,animation:`fadeIn 0.2s ease-out ${i*0.05}s both` }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ fontSize:14 }}>{t.icon}</span><span style={{ fontSize:9,fontWeight:700,color:TASK_STATUS[t.status].color,padding:"2px 6px",borderRadius:4,background:TASK_STATUS[t.status].bg }}>{TASK_STATUS[t.status].label}</span></div><div style={{ color:"#e2e8f0",fontSize:11,fontWeight:600,lineHeight:1.3,marginBottom:4 }}>{t.title}</div><div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"#475569",fontSize:9 }}>{t.customer}</span><span style={{ color:t.priority==="high"?"#fca5a5":"#64748b",fontSize:9 }}>{t.priority==="high"?"🔴":"🟡"} {t.dueDate?.slice(5)}</span></div></div>)}</div></div>
      <div style={{ marginBottom:14 }}><div onClick={onNews} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,cursor:"pointer" }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:0.8 }}>✨ WHAT'S NEW</span><NotifBadge count={PRODUCT_NEWS.length} color="#8b5cf6"/></div><span style={{ color:"#60a5fa",fontSize:10,fontWeight:600 }}>All →</span></div><div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4 }}>{PRODUCT_NEWS.map((n,i)=><div key={n.id} style={{ minWidth:220,padding:14,borderRadius:12,background:`linear-gradient(135deg,${n.color}08,${n.color}04)`,border:`1px solid ${n.color}20`,flexShrink:0,animation:`fadeIn 0.2s ease-out ${i*0.06}s both` }}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}><div style={{ width:36,height:36,borderRadius:8,background:`${n.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{n.image}</div><span style={{ fontSize:8,fontWeight:700,color:n.color,padding:"2px 6px",borderRadius:3,background:`${n.color}15`,textTransform:"uppercase" }}>{n.type==="new"?"New":n.type==="update"?"Update":"Promo"}</span></div><div style={{ color:"#e2e8f0",fontSize:12,fontWeight:700,lineHeight:1.3 }}>{n.title}</div><div style={{ color:"#64748b",fontSize:10,marginTop:2 }}>{n.subtitle}</div></div>)}</div></div>
      <div style={{ color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:0.8,marginBottom:8 }}>📋 ORDERS</div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>{filtered.map((o,i)=>{const dc=(o.documents||[]).filter(d=>d.status==="confirmed").length,dt=(o.documents||[]).length,dp=(o.documents||[]).filter(d=>d.status==="pending").length,tn=dp+(o.pendingActions||[]).length;return<div key={o.id} onClick={()=>onSelect(o)} style={{ background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"14px 16px",border:tn>0?"1px solid rgba(239,68,68,0.12)":"1px solid rgba(255,255,255,0.05)",cursor:"pointer",position:"relative",animation:`fadeIn 0.2s ease-out ${i*0.05}s both` }}>{tn>0&&<div style={{ position:"absolute",top:-6,right:-4,minWidth:20,height:20,borderRadius:10,background:"#ef4444",color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px",boxShadow:"0 2px 8px rgba(239,68,68,0.4)",animation:"pulse 2s infinite" }}>{tn}</div>}<div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}><div><div style={{ color:"#f1f5f9",fontSize:15,fontWeight:800 }}>{o.id}</div><div style={{ color:"#64748b",fontSize:10,marginTop:2 }}>{o.brand} · {o.orderDate}</div></div><Badge status={o.status}/></div><div style={{ display:"flex",flexWrap:"wrap",gap:"4px 14px",marginBottom:8 }}><span style={{ color:"#94a3b8",fontSize:11 }}>📦 {o.totalQty.toLocaleString()}</span><span style={{ color:"#94a3b8",fontSize:11 }}>💰 ¥{o.totalAmount?.toLocaleString()}</span>{o.shipping&&<span style={{ color:"#94a3b8",fontSize:11 }}>🚢 ETA {o.shipping.eta}</span>}</div><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ flex:1,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden" }}><div style={{ height:"100%",borderRadius:2,width:`${(dc/dt)*100}%`,background:dc===dt?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#1d4ed8,#3b82f6)",transition:"width 0.6s" }}/></div><span style={{ color:"#475569",fontSize:9,fontWeight:600,whiteSpace:"nowrap" }}>📑 {dc}/{dt}{dp>0&&<span style={{ color:"#f59e0b" }}> · {dp} pending</span>}</span></div>{(o.pendingActions||[]).length>0&&<div style={{ display:"flex",gap:5,marginTop:8,flexWrap:"wrap" }}>{o.pendingActions.map(a=><span key={a} style={{ padding:"4px 10px",borderRadius:6,fontSize:9,fontWeight:700,color:ACTION_LABELS[a]?.color,background:`${ACTION_LABELS[a]?.color}12`,border:`1px solid ${ACTION_LABELS[a]?.color}20`,display:"flex",alignItems:"center",gap:4 }}>{ACTION_LABELS[a]?.icon} {ACTION_LABELS[a]?.label}<span style={{ width:5,height:5,borderRadius:"50%",background:ACTION_LABELS[a]?.color,animation:"pulse 1.5s infinite" }}/></span>)}</div>}</div>})}</div>
    </div>
  );
}

function OrderDetail({ order, onBack }) {
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const [done, setDone] = useState({});
  const tabs = [{k:"overview",l:"Overview"},{k:"documents",l:"Docs ✨"},{k:"products",l:"Products"},{k:"shipping",l:"Shipping"},{k:"timeline",l:"Timeline"}];
  const pd = (order.documents||[]).filter(d=>d.status==="pending").length;

  return(
    <div style={{ animation:"fadeIn 0.3s" }}>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#60a5fa",fontSize:12,fontWeight:600,cursor:"pointer",padding:"0 0 10px" }}>← Orders</button>
      <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:12,padding:16,border:"1px solid rgba(255,255,255,0.05)",marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}><div><div style={{ color:"#f1f5f9",fontSize:18,fontWeight:800 }}>{order.id}</div><div style={{ color:"#64748b",fontSize:11,marginTop:2 }}>{order.brand} · {order.tradeTerms} · {order.customer}</div></div><Badge status={order.status}/></div><div style={{ display:"flex",flexWrap:"wrap",gap:"6px 16px",marginTop:12 }}><MiniInfo label="Date" value={order.orderDate}/><MiniInfo label="Qty" value={order.totalQty.toLocaleString()}/><MiniInfo label="Amount" value={`¥${order.totalAmount?.toLocaleString()}`}/><MiniInfo label="Container" value={`${order.containerQty}x${order.containerType}`}/></div></div>
      {order.pendingActions?.filter(a=>!done[a]).length>0&&<div style={{ background:"rgba(239,68,68,0.05)",borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid rgba(239,68,68,0.08)" }}><div style={{ color:"#fca5a5",fontSize:11,fontWeight:700,marginBottom:8 }}>⚠️ ACTION REQUIRED</div>{order.pendingActions.filter(a=>!done[a]).map(a=><button key={a} onClick={()=>setModal(a)} style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 12px",borderRadius:10,border:`1px solid ${ACTION_LABELS[a]?.color}25`,background:`${ACTION_LABELS[a]?.color}06`,cursor:"pointer",marginBottom:6 }}><span style={{ color:"#e2e8f0",fontSize:13,fontWeight:600 }}>{ACTION_LABELS[a]?.icon} {ACTION_LABELS[a]?.label}</span><span style={{ color:ACTION_LABELS[a]?.color,fontSize:11,fontWeight:700 }}>Action →</span></button>)}</div>}
      <div style={{ display:"flex",gap:2,padding:3,background:"rgba(255,255,255,0.02)",borderRadius:10,marginBottom:10 }}>{tabs.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{ flex:1,padding:"8px 4px",borderRadius:8,border:"none",background:tab===t.k?"rgba(59,130,246,0.1)":"transparent",color:tab===t.k?"#60a5fa":"#64748b",fontSize:10,fontWeight:tab===t.k?700:500,cursor:"pointer",position:"relative",whiteSpace:"nowrap" }}>{t.l}{t.k==="documents"&&pd>0&&<span style={{ position:"absolute",top:2,right:2,width:14,height:14,borderRadius:"50%",background:"#ef4444",color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>{pd}</span>}</button>)}</div>
      <div style={{ animation:"fadeIn 0.2s" }}>
        {tab==="overview"&&<div style={{ display:"flex",flexDirection:"column",gap:10 }}>{pd>0&&<div onClick={()=>setTab("documents")} style={{ padding:"12px 14px",borderRadius:10,cursor:"pointer",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)" }}><div style={{ color:"#fbbf24",fontSize:12,fontWeight:700 }}>📑 {pd} Documents Need Review</div><div style={{ color:"#64748b",fontSize:10,marginTop:2 }}>Tap to review</div></div>}{order.containers?.length>0&&<Card title="CONTAINERS">{order.containers.map((c,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,marginBottom:6 }}><div><div style={{ color:"#e2e8f0",fontSize:12,fontWeight:700,fontFamily:"monospace" }}>{c.no}</div><div style={{ color:"#64748b",fontSize:10 }}>{c.type} · Seal: {c.sealNo}</div></div><div style={{ color:"#10b981",fontSize:10,fontWeight:600 }}>📷 {c.photos}/9 ✓</div></div>)}</Card>}{order.shipping&&<Card title="SHIPPING"><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}><MiniInfo label="Carrier" value={order.shipping.carrier}/><MiniInfo label="Vessel" value={order.shipping.vessel}/><MiniInfo label="ETD" value={order.shipping.etd} highlight/><MiniInfo label="ETA" value={order.shipping.eta} highlight/></div></Card>}<Card title="PAYMENT"><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><div><div style={{ color:"#475569",fontSize:10 }}>Total</div><div style={{ color:"#f1f5f9",fontSize:20,fontWeight:800 }}>¥{order.totalAmount?.toLocaleString()}</div></div><span style={{ padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:700,color:order.status==="delivered"?"#10b981":"#f59e0b",background:order.status==="delivered"?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)" }}>{order.status==="delivered"?"✓ Paid":"Pending"}</span></div></Card></div>}
        {tab==="documents"&&<DocumentsTab order={order}/>}
        {tab==="products"&&<Card title={`PRODUCTS · ${order.products.length}`}>{order.products.map((p,i)=><div key={i} style={{ padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,marginBottom:6 }}><div style={{ color:"#e2e8f0",fontSize:11,fontWeight:600,marginBottom:4 }}>{p.name}</div><div style={{ display:"flex",gap:12,flexWrap:"wrap" }}><span style={{ color:"#64748b",fontSize:10 }}>📦 {p.qty}</span><span style={{ color:"#64748b",fontSize:10 }}>💰 ¥{p.amount?.toLocaleString()}</span><span style={{ color:"#64748b",fontSize:10 }}>📐 {p.cbm} CBM</span></div></div>)}</Card>}
        {tab==="shipping"&&(order.shipping?<Card title="SHIPPING"><div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}><div><div style={{ color:"#475569",fontSize:9 }}>FROM</div><div style={{ color:"#f1f5f9",fontSize:15,fontWeight:800,marginTop:2 }}>{order.portFrom}</div><div style={{ color:"#60a5fa",fontSize:11,marginTop:2 }}>ETD: {order.shipping.etd}</div></div><div style={{ color:"#334155",fontSize:20,display:"flex",alignItems:"center" }}>→</div><div style={{ textAlign:"right" }}><div style={{ color:"#475569",fontSize:9 }}>TO</div><div style={{ color:"#f1f5f9",fontSize:15,fontWeight:800,marginTop:2 }}>{order.portTo?.split(" ")[0]}</div><div style={{ color:"#06b6d4",fontSize:11,marginTop:2 }}>ETA: {order.shipping.eta}</div></div></div><div style={{ height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden" }}><div style={{ height:"100%",width:"45%",background:"linear-gradient(90deg,#3b82f6,#06b6d4)",borderRadius:2 }}/></div></Card>:<div style={{ textAlign:"center",padding:"36px 16px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.05)" }}><div style={{ fontSize:36,marginBottom:10 }}>🚢</div><div style={{ color:"#94a3b8",fontSize:13 }}>Not yet arranged</div></div>)}
        {tab==="timeline"&&<Card title="TIMELINE"><div style={{ position:"relative",paddingLeft:24 }}><div style={{ position:"absolute",left:7,top:4,bottom:4,width:2,background:"rgba(255,255,255,0.05)" }}/>{order.timeline.map((t,i)=>{const d=t.done||done[t.action],nx=!d&&(i===0||order.timeline[i-1]?.done);return<div key={i} style={{ position:"relative",marginBottom:18 }}><div style={{ position:"absolute",left:-24,top:1,width:16,height:16,borderRadius:"50%",background:d?"#1d4ed8":"#0a0f1a",border:d?"2px solid #3b82f6":nx?"2px solid #f59e0b":"2px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1 }}>{d&&<span style={{ color:"#fff",fontSize:8 }}>✓</span>}{nx&&<span style={{ width:5,height:5,borderRadius:"50%",background:t.urgent?"#ef4444":"#f59e0b" }}/>}</div><div style={{ color:d?"#e2e8f0":nx?"#f1f5f9":"#475569",fontSize:12,fontWeight:d||nx?700:500 }}>{t.step}</div>{t.date&&<div style={{ color:"#475569",fontSize:9,marginTop:1 }}>{t.date}</div>}{nx&&t.action&&!done[t.action]&&<span style={{ display:"inline-block",padding:"3px 8px",borderRadius:4,marginTop:4,background:"rgba(239,68,68,0.08)",color:"#fca5a5",fontSize:9,fontWeight:700 }}>🔴 Action</span>}</div>})}</div></Card>}
      </div>
      {modal&&<Modal onClose={()=>setModal(null)}><div style={{ fontSize:18,marginBottom:4 }}>{ACTION_LABELS[modal]?.icon}</div><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700,marginBottom:4 }}>{ACTION_LABELS[modal]?.label}</div><div style={{ color:"#94a3b8",fontSize:12,marginBottom:18 }}>{modal==="confirm_bl"?"Review B/L and confirm.":"Factory delivery: Mar 15, 2026."}</div><div style={{ display:"flex",gap:8 }}><button onClick={()=>setModal(null)} style={{ flex:1,padding:12,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button><button onClick={()=>{setDone(p=>({...p,[modal]:true}));setModal(null)}} style={{ flex:2,padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Confirm</button></div></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════

function AdminDashboard({ user, onLogout }) {
  return(
    <div style={{ animation:"fadeIn 0.3s" }}>
      <div style={{ marginBottom:16 }}><div style={{ color:"#f1f5f9",fontSize:20,fontWeight:800 }}>Welcome, Admin 👋</div><div style={{ color:"#64748b",fontSize:12,marginTop:2 }}>Sanlyn OS Management Console</div></div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>{[{i:"📋",v:"270",l:"Orders",c:"#3b82f6"},{i:"🏭",v:"12",l:"Production",c:"#f59e0b"},{i:"🚢",v:"5",l:"Shipping",c:"#06b6d4"},{i:"⚠️",v:"3",l:"Actions",c:"#ef4444"}].map(s=><div key={s.l} style={{ padding:14,borderRadius:12,background:`${s.c}06`,border:`1px solid ${s.c}15`,textAlign:"center" }}><div style={{ fontSize:14,marginBottom:4 }}>{s.i}</div><div style={{ color:s.c,fontSize:22,fontWeight:800 }}>{s.v}</div><div style={{ color:"#64748b",fontSize:9,fontWeight:600,marginTop:2 }}>{s.l}</div></div>)}</div>
      <Card title="RECENT ACTIVITY">{[{t:"10m ago",x:"Driver uploaded 9 photos for MSNU6517449",i:"📷"},{t:"1h ago",x:"PETSOME confirmed B/L for FS20260210028",i:"📄"},{t:"3h ago",x:"Factory updated delivery: Mar 15",i:"🏭"},{t:"Yesterday",x:"Payment ¥22,959 from HARMONIOUS",i:"💰"}].map((a,i)=><div key={i} style={{ display:"flex",gap:10,padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.03)":"none" }}><span style={{ fontSize:16 }}>{a.i}</span><div style={{ flex:1 }}><div style={{ color:"#cbd5e1",fontSize:11,lineHeight:1.4 }}>{a.x}</div><div style={{ color:"#475569",fontSize:9,marginTop:2 }}>{a.t}</div></div></div>)}</Card>
      <button onClick={onLogout} style={{ width:"100%",marginTop:14,padding:12,borderRadius:10,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.05)",color:"#fca5a5",fontSize:13,fontWeight:600,cursor:"pointer" }}>Logout</button>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════

export default function SanlynApp() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("orders");
  const [selOrder, setSelOrder] = useState(null);

  if (!user) return <LoginPage onLogin={setUser}/>;

  const totalNotifs = MOCK_ORDERS.reduce((s,o)=>s+(o.documents||[]).filter(d=>d.status==="pending").length+(o.pendingActions||[]).length,0);
  const pendingTasks = MOCK_TASKS.filter(t=>t.status!=="done").length;

  // Admin view
  if (user.role === "admin") return (
    <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh" }}>
      <div style={{ background:"rgba(10,15,26,0.95)",backdropFilter:"blur(20px)",padding:"14px 20px",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff" }}>S</div><div><div style={{ color:"#f1f5f9",fontSize:13,fontWeight:800 }}>Sanlyn<span style={{ fontSize:8,color:"#3b82f6",background:"rgba(59,130,246,0.1)",padding:"1px 5px",borderRadius:3,marginLeft:4 }}>OS</span></div><div style={{ color:"#475569",fontSize:8,letterSpacing:1 }}>ADMIN</div></div></div>
      </div>
      <div style={{ padding:"14px 16px 30px" }}><AdminDashboard user={user} onLogout={()=>setUser(null)}/></div>
    </div>
  );

  // Factory / Driver coming soon
  if (user.role === "factory" || user.role === "trucker") return (
    <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ fontSize:48,marginBottom:12 }}>🚧</div>
      <div style={{ color:"#f1f5f9",fontSize:18,fontWeight:700 }}>Coming Soon</div>
      <div style={{ color:"#64748b",fontSize:12,marginTop:4 }}>{user.role==="factory"?"Factory Portal":"Driver Portal"} is under development</div>
      <button onClick={()=>setUser(null)} style={{ marginTop:20,padding:"10px 20px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#60a5fa",fontSize:12,fontWeight:600,cursor:"pointer" }}>← Back to Login</button>
    </div>
  );

  // Customer view
  return (
    <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh",position:"relative" }}>
      <div style={{ background:"rgba(10,15,26,0.95)",backdropFilter:"blur(20px)",padding:"14px 20px",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",position:"relative" }}>S{totalNotifs>0&&<span style={{ position:"absolute",top:-4,right:-4,minWidth:14,height:14,borderRadius:7,background:"#ef4444",color:"#fff",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px" }}>{totalNotifs}</span>}</div>
            <div><div style={{ color:"#f1f5f9",fontSize:13,fontWeight:800 }}>Sanlyn<span style={{ fontSize:8,color:"#3b82f6",background:"rgba(59,130,246,0.1)",padding:"1px 5px",borderRadius:3,marginLeft:4 }}>OS</span></div><div style={{ color:"#475569",fontSize:8,letterSpacing:1 }}>{user.company}</div></div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ position:"relative",cursor:"pointer" }} onClick={()=>{setPage("orders");setSelOrder(null)}}><span style={{ fontSize:18 }}>🔔</span>{totalNotifs>0&&<span style={{ position:"absolute",top:-4,right:-4,minWidth:14,height:14,borderRadius:7,background:"#ef4444",color:"#fff",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px" }}>{totalNotifs}</span>}</div>
            <div onClick={()=>setUser(null)} style={{ cursor:"pointer",fontSize:10,color:"#64748b",fontWeight:600 }}>Logout</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"14px 16px 90px" }}>
        {page==="orders"&&<OrderList onSelect={o=>{setSelOrder(o);setPage("detail")}} onTasks={()=>setPage("tasks")} onNews={()=>setPage("news")}/>}
        {page==="detail"&&selOrder&&<OrderDetail order={selOrder} onBack={()=>{setSelOrder(null);setPage("orders")}}/>}
        {page==="tasks"&&<TaskBoard onBack={()=>setPage("orders")}/>}
        {page==="news"&&<NewsPage onBack={()=>setPage("orders")}/>}
        {page==="logistics"&&<CustomerLogisticsTab user={user}/>}
        {page==="profile"&&<div style={{ textAlign:"center",padding:"40px 20px" }}><div style={{ fontSize:48,marginBottom:12 }}>👤</div><div style={{ color:"#f1f5f9",fontSize:16,fontWeight:700 }}>{user.company}</div><div style={{ color:"#64748b",fontSize:12,marginTop:4 }}>Customer · Malaysia</div><button onClick={()=>setUser(null)} style={{ marginTop:20,padding:"10px 20px",borderRadius:8,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.05)",color:"#fca5a5",fontSize:12,fontWeight:600,cursor:"pointer" }}>Logout</button></div>}
      </div>
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(10,15,26,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",padding:"6px 0 10px",zIndex:100 }}>
        {[{k:"orders",i:"📋",l:"Orders",b:totalNotifs},{k:"tasks",i:"📌",l:"Tasks",b:pendingTasks},{k:"logistics",i:"🚢",l:"Freight"},{k:"news",i:"✨",l:"News",b:PRODUCT_NEWS.length},{k:"profile",i:"👤",l:"Profile"}].map(n=><div key={n.k} onClick={()=>{setPage(n.k);setSelOrder(null)}} style={{ flex:1,textAlign:"center",cursor:"pointer",padding:"6px 0" }}><div style={{ fontSize:18,marginBottom:1,opacity:page===n.k||(n.k==="orders"&&page==="detail")?1:0.4,position:"relative",display:"inline-block" }}>{n.i}{n.b>0&&<span style={{ position:"absolute",top:-6,right:-10,minWidth:14,height:14,borderRadius:7,background:n.k==="news"?"#8b5cf6":"#ef4444",color:"#fff",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px" }}>{n.b}</span>}</div><div style={{ fontSize:9,fontWeight:600,color:page===n.k||(n.k==="orders"&&page==="detail")?"#60a5fa":"#475569" }}>{n.l}</div></div>)}
      </div>
    </div>
  );
}
