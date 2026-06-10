import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const AGENCY = {
  name: "Maa Shaila Indane Gramin Vitrak",
  address: "Village Road, Rural District, UP - 203207",
  phone: "+91 98765 43210",
  gst: "09ABCDE1234F1Z5",
  logo: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ea580c'%3E%3Cpath d='M12 2c0 0-5.5 6-5.5 11.5A5.5 5.5 0 0 0 12 19a5.5 5.5 0 0 0 5.5-5.5C17.5 8 12 2 12 2zM12 16.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.8 2.5-4.5 2.5-4.5s2.5 2.7 2.5 4.5c0 1.38-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E"
};

const USERS_DATA = [
  { id: 1, username: "admin", password: "admin123", role: "admin", name: "Rajesh Kumar", email: "admin@gasagency.com" },
  { id: 2, username: "staff1", password: "staff123", role: "staff", name: "Suresh Yadav", email: "suresh@gasagency.com" }
];

const VANS_DATA = [
  { id: 1, name: "Van 1", number: "UP14-AB-1234", driver: "Ramesh Singh", contact: "9876543210", status: "active" },
  { id: 2, name: "Van 2", number: "UP14-CD-5678", driver: "Mohan Lal", contact: "9876543211", status: "active" },
  { id: 3, name: "Van 3", number: "UP14-EF-9012", driver: "Vijay Kumar", contact: "9876543212", status: "active" }
];

function genDays(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split("T")[0]);
  }
  return arr;
}

const dates = genDays(30);

function seedDeliveries() {
  const rows = [];
  let id = 1;
  dates.forEach(date => {
    VANS_DATA.forEach(van => {
      const dom = 40 + Math.floor(Math.random() * 30);
      const com = 10 + Math.floor(Math.random() * 15);
      const cpc = 25;
      const diesel = 300 + Math.floor(Math.random() * 200);
      const driver = 100 + Math.floor(Math.random() * 100);
      const maint = Math.random() > 0.8 ? 200 + Math.floor(Math.random() * 300) : 0;
      const other = Math.random() > 0.7 ? 50 + Math.floor(Math.random() * 100) : 0;
      const total = dom + com;
      const commission = total * cpc;
      const expenses = diesel + driver + maint + other;
      const profit = commission - expenses;
      rows.push({ id: id++, date, vanId: van.id, vanName: van.name, driver: van.driver, domestic: dom, commercial: com, total, commissionPerCylinder: cpc, diesel, driverExpense: driver, maintenance: maint, otherExpense: other, totalCommission: commission, totalExpenses: expenses, netProfit: profit, notes: "", addedBy: "admin", addedAt: new Date().toISOString() });
    });
  });
  return rows;
}

function seedOfficeSales() {
  const rows = [];
  let id = 1;
  dates.forEach(date => {
    const qty = 5 + Math.floor(Math.random() * 15);
    const cpc = 28;
    rows.push({ id: id++, date, cylinders: qty, commissionPerCylinder: cpc, totalCommission: qty * cpc, customer: "", paymentMode: "cash", remarks: "", addedBy: "admin", addedAt: new Date().toISOString() });
  });
  return rows;
}

function seedExpenses() {
  const cats = ["Salary", "Electricity", "Internet", "Vehicle Maintenance", "Office Rent", "Miscellaneous"];
  const rows = [];
  let id = 1;
  dates.forEach((date, i) => {
    if (i % 5 === 0) {
      cats.forEach(cat => {
        const amt = cat === "Salary" ? 5000 : cat === "Office Rent" ? 3000 : 200 + Math.floor(Math.random() * 800);
        rows.push({ id: id++, date, category: cat, amount: amt, description: `${cat} expense`, addedBy: "admin", addedAt: new Date().toISOString() });
      });
    }
  });
  return rows;
}

function seedStock() {
  const rows = [];
  let id = 1;
  let closing = 500;
  dates.forEach(date => {
    const received = Math.random() > 0.6 ? 100 + Math.floor(Math.random() * 200) : 0;
    const delivered = 150 + Math.floor(Math.random() * 100);
    const damaged = Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0;
    const returned = Math.floor(Math.random() * 10);
    const opening = closing;
    closing = opening + received - delivered - damaged + returned;
    if (closing < 0) closing = 50;
    rows.push({ id: id++, date, opening, received, delivered, damaged, returned, closing, addedBy: "admin", addedAt: new Date().toISOString() });
  });
  return rows;
}

const initDeliveries = seedDeliveries();
const initOfficeSales = seedOfficeSales();
const initExpenses = seedExpenses();
const initStock = seedStock();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const today = () => new Date().toISOString().split("T")[0];

// ─── Theme ────────────────────────────────────────────────────────────────────
const colors = {
  primary: "#1a4fa0",
  primaryLight: "#2563eb",
  accent: "#f97316",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
  info: "#0891b2",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  sidebar: "#0f1e3d",
  sidebarText: "#94a3b8",
  sidebarActive: "#1a4fa0",
};

const chartColors = ["#1a4fa0", "#f97316", "#16a34a", "#dc2626", "#0891b2", "#7c3aed"];

// ─── Shared Components ────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "1.25rem", ...style }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, icon, color = colors.primary, sub }) {
  return (
    <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: colors.textMuted }}>{sub}</div>}
    </div>
  );
}

function Badge({ children, color = colors.primary, bg }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: bg || `${color}18`, color }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style = {}, disabled }) {
  const base = { cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8, fontWeight: 600, border: "none", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6 };
  const variants = {
    primary: { background: colors.primary, color: "#fff", padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 13 : 14 },
    secondary: { background: colors.bg, color: colors.text, padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 13 : 14, border: `1px solid ${colors.border}` },
    danger: { background: colors.danger, color: "#fff", padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 13 : 14 },
    success: { background: colors.success, color: "#fff", padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 13 : 14 },
    ghost: { background: "transparent", color: colors.primary, padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 13 : 14 },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>;
}

function Input({ label, type = "text", value, onChange, placeholder, required, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted }}>{label}{required && <span style={{ color: colors.danger }}> *</span>}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.text, background: "#fff", outline: "none", ...style }} />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted }}>{label}{required && <span style={{ color: colors.danger }}> *</span>}</label>}
      <select value={value} onChange={onChange} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.text, background: "#fff", outline: "none" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose, width = 520 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: colors.card, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", padding: "1.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: colors.textMuted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Table({ columns, data, emptyMsg = "No data found" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            {columns.map((c, i) => (
              <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: colors.textMuted, whiteSpace: "nowrap", borderBottom: `1px solid ${colors.border}` }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem", color: colors.textMuted }}>{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${colors.border}`, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              {columns.map((c, j) => (
                <td key={j} style={{ padding: "9px 12px", color: colors.text, whiteSpace: "nowrap" }}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: 8 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colors.text }}>{title}</h2>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = USERS_DATA.find(u => u.username === username && u.password === password);
      if (user) onLogin(user);
      else setError("Invalid username or password");
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f1e3d 0%, #1a4fa0 50%, #0891b2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.2)", padding: "2.5rem 2rem", width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src={AGENCY.logo} alt="IndianOil Logo" style={{ height: 64, width: 64, marginBottom: 8, objectFit: "contain", background: "#fff", padding: "4px", borderRadius: "50%" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>INDANE LPG</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>Maa Shaila Indane<br />Gramin Vitrak</h1>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Management System — Staff Login</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", display: "block", marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ background: colors.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          Demo: admin / admin123 &nbsp;|&nbsp; staff1 / staff123
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ deliveries, officeSales, expenses, stock, vans }) {
  const td = today();
  const todayDel = deliveries.filter(d => d.date === td);
  const todaySales = officeSales.filter(d => d.date === td);
  const todayExp = expenses.filter(d => d.date === td);
  const todayStock = stock.find(s => s.date === td) || stock[stock.length - 1] || {};

  const todayDeliveryCount = todayDel.reduce((s, d) => s + d.total, 0);
  const todaySaleCount = todaySales.reduce((s, d) => s + d.cylinders, 0);
  const todayRevenue = todayDel.reduce((s, d) => s + d.totalCommission, 0) + todaySales.reduce((s, d) => s + d.totalCommission, 0);
  const todayCommission = todayDel.reduce((s, d) => s + d.totalCommission, 0) + todaySales.reduce((s, d) => s + d.totalCommission, 0);
  const todayExpTotal = todayDel.reduce((s, d) => s + d.totalExpenses, 0) + todayExp.reduce((s, d) => s + d.amount, 0);
  const todayProfit = todayRevenue - todayExpTotal;
  const currentStock = todayStock.closing || 0;

  // Monthly data
  const monthlyProfit = {};
  const last30 = dates.slice(-30);
  last30.forEach(date => {
    const dRev = deliveries.filter(d => d.date === date).reduce((s, d) => s + d.totalCommission, 0);
    const oRev = officeSales.filter(d => d.date === date).reduce((s, d) => s + d.totalCommission, 0);
    const dExp = deliveries.filter(d => d.date === date).reduce((s, d) => s + d.totalExpenses, 0);
    const oExp = expenses.filter(d => d.date === date).reduce((s, d) => s + d.amount, 0);
    monthlyProfit[date] = (dRev + oRev) - (dExp + oExp);
  });

  const chartData = last30.slice(-15).map(date => ({
    date: date.slice(5),
    profit: Math.round(monthlyProfit[date] || 0),
    revenue: Math.round(deliveries.filter(d => d.date === date).reduce((s, d) => s + d.totalCommission, 0)),
  }));

  const vanData = vans.filter(v => v.status === "active").map(van => {
    const vd = deliveries.filter(d => d.vanId === van.id);
    return { name: van.name, profit: Math.round(vd.reduce((s, d) => s + d.netProfit, 0)), deliveries: vd.reduce((s, d) => s + d.total, 0) };
  });

  const stockChart = stock.slice(-15).map(s => ({ date: s.date.slice(5), stock: s.closing }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Agency Header */}
      <div style={{ background: `linear-gradient(135deg, ${colors.sidebar} 0%, ${colors.primary} 100%)`, borderRadius: 16, padding: "1.5rem", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={AGENCY.logo} alt="IndianOil Logo" style={{ height: 56, width: 56, objectFit: "contain", background: "#fff", padding: "4px", borderRadius: "50%" }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase" }}>Indane LPG Distributor</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{AGENCY.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{AGENCY.address}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Today</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          {currentStock < 100 && <div style={{ background: "rgba(249,115,22,0.3)", border: "1px solid rgba(249,115,22,0.5)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#fed7aa", marginTop: 4 }}>⚠ Low Stock Alert: {currentStock} cylinders</div>}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard label="Today's Deliveries" value={fmtNum(todayDeliveryCount)} icon="🚚" color={colors.primary} sub="cylinders delivered" />
        <MetricCard label="Office Sales" value={fmtNum(todaySaleCount)} icon="🏪" color={colors.info} sub="cylinders sold" />
        <MetricCard label="Today's Revenue" value={fmt(todayRevenue)} icon="💰" color={colors.success} sub="total commission" />
        <MetricCard label="Today's Expenses" value={fmt(todayExpTotal)} icon="📋" color={colors.warning} sub="all expenses" />
        <MetricCard label="Today's Profit" value={fmt(todayProfit)} icon={todayProfit >= 0 ? "📈" : "📉"} color={todayProfit >= 0 ? colors.success : colors.danger} sub={todayProfit >= 0 ? "net profit" : "net loss"} />
        <MetricCard label="Current Stock" value={fmtNum(currentStock)} icon="🛢" color={currentStock < 100 ? colors.danger : colors.primary} sub={currentStock < 100 ? "⚠ LOW STOCK" : "cylinders available"} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: colors.text }}>15-Day Profit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Area type="monotone" dataKey="profit" stroke={colors.primary} fill="url(#profitGrad)" strokeWidth={2} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: colors.text }}>Van-wise Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vanData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                {vanData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Stock Chart + Monthly Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: colors.text }}>Stock Movement (15 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stockChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="stock" stroke={colors.accent} strokeWidth={2} name="Closing Stock" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: colors.text }}>Monthly Summary</h3>
          {(() => {
            const monthRev = deliveries.reduce((s, d) => s + d.totalCommission, 0) + officeSales.reduce((s, d) => s + d.totalCommission, 0);
            const monthExp = deliveries.reduce((s, d) => s + d.totalExpenses, 0) + expenses.reduce((s, d) => s + d.amount, 0);
            const monthProfit = monthRev - monthExp;
            const totalDel = deliveries.reduce((s, d) => s + d.total, 0);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Total Revenue", val: fmt(monthRev), color: colors.success },
                  { label: "Total Expenses", val: fmt(monthExp), color: colors.danger },
                  { label: "Net Profit/Loss", val: fmt(monthProfit), color: monthProfit >= 0 ? colors.success : colors.danger },
                  { label: "Total Cylinders Delivered", val: fmtNum(totalDel), color: colors.primary },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: colors.bg, borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: colors.textMuted }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card>
        <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: colors.text }}>Recent Deliveries</h3>
        <Table
          columns={[
            { header: "Date", key: "date" },
            { header: "Van", key: "vanName" },
            { header: "Driver", key: "driver" },
            { header: "Total", key: "total", render: r => fmtNum(r.total) },
            { header: "Commission", render: r => fmt(r.totalCommission) },
            { header: "Expenses", render: r => fmt(r.totalExpenses) },
            { header: "Profit", render: r => <span style={{ color: r.netProfit >= 0 ? colors.success : colors.danger, fontWeight: 600 }}>{fmt(r.netProfit)}</span> },
          ]}
          data={[...deliveries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)}
        />
      </Card>
    </div>
  );
}

// ─── Stock Management ─────────────────────────────────────────────────────────
function StockManagement({ stock, setStock, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ date: today(), opening: "", received: 0, delivered: 0, damaged: 0, returned: 0 });
  const [editId, setEditId] = useState(null);

  const closing = Number(form.opening) + Number(form.received) - Number(form.delivered) - Number(form.damaged) + Number(form.returned);

  const handleSave = () => {
    const entry = { ...form, opening: +form.opening, received: +form.received, delivered: +form.delivered, damaged: +form.damaged, returned: +form.returned, closing, addedBy: currentUser.name, addedAt: new Date().toISOString() };
    if (editId) {
      setStock(prev => prev.map(s => s.id === editId ? { ...entry, id: editId } : s));
      setEditId(null);
    } else {
      setStock(prev => [...prev, { ...entry, id: Date.now() }]);
    }
    setShowForm(false);
    setForm({ date: today(), opening: "", received: 0, delivered: 0, damaged: 0, returned: 0 });
  };

  const filtered = stock.filter(s => !filterDate || s.date === filterDate).sort((a, b) => b.date.localeCompare(a.date));
  const latest = stock[stock.length - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Stock Management"
        sub="Track daily LPG cylinder stock movements"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 }} />
            <Btn onClick={() => setShowForm(true)}>+ Add Stock Entry</Btn>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard label="Current Stock" value={fmtNum(latest?.closing || 0)} icon="🛢" color={latest?.closing < 100 ? colors.danger : colors.primary} sub={latest?.closing < 100 ? "⚠ LOW STOCK" : "cylinders"} />
        <MetricCard label="Today Received" value={fmtNum(stock.filter(s => s.date === today()).reduce((a, s) => a + s.received, 0))} icon="📦" color={colors.success} />
        <MetricCard label="Today Delivered" value={fmtNum(stock.filter(s => s.date === today()).reduce((a, s) => a + s.delivered, 0))} icon="🚚" color={colors.info} />
        <MetricCard label="Total Damaged" value={fmtNum(stock.reduce((a, s) => a + s.damaged, 0))} icon="⚠️" color={colors.warning} />
      </div>

      <Card>
        <Table
          columns={[
            { header: "Date", key: "date" },
            { header: "Opening", render: r => fmtNum(r.opening) },
            { header: "Received", render: r => <span style={{ color: colors.success, fontWeight: 600 }}>+{fmtNum(r.received)}</span> },
            { header: "Delivered", render: r => <span style={{ color: colors.primary, fontWeight: 600 }}>-{fmtNum(r.delivered)}</span> },
            { header: "Damaged", render: r => r.damaged > 0 ? <span style={{ color: colors.danger, fontWeight: 600 }}>-{fmtNum(r.damaged)}</span> : "0" },
            { header: "Returned", render: r => r.returned > 0 ? <span style={{ color: colors.success, fontWeight: 600 }}>+{fmtNum(r.returned)}</span> : "0" },
            { header: "Closing", render: r => <span style={{ fontWeight: 700, color: r.closing < 100 ? colors.danger : colors.primary }}>{fmtNum(r.closing)}</span> },
            { header: "Added By", key: "addedBy" },
            {
              header: "Action", render: r => (
                <Btn size="sm" variant="secondary" onClick={() => {
                  setForm({ date: r.date, opening: r.opening, received: r.received, delivered: r.delivered, damaged: r.damaged, returned: r.returned });
                  setEditId(r.id);
                  setShowForm(true);
                }}>Edit</Btn>
              )
            }
          ]}
          data={filtered}
        />
      </Card>

      {showForm && (
        <Modal title={editId ? "Edit Stock Entry" : "New Stock Entry"} onClose={() => { setShowForm(false); setEditId(null); setForm({ date: today(), opening: "", received: 0, delivered: 0, damaged: 0, returned: 0 }); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Input label="Opening Stock" type="number" value={form.opening} onChange={e => setForm(f => ({ ...f, opening: e.target.value }))} required />
            <Input label="New Stock Received" type="number" value={form.received} onChange={e => setForm(f => ({ ...f, received: e.target.value }))} />
            <Input label="Cylinders Delivered" type="number" value={form.delivered} onChange={e => setForm(f => ({ ...f, delivered: e.target.value }))} />
            <Input label="Damaged Cylinders" type="number" value={form.damaged} onChange={e => setForm(f => ({ ...f, damaged: e.target.value }))} />
            <Input label="Returned Cylinders" type="number" value={form.returned} onChange={e => setForm(f => ({ ...f, returned: e.target.value }))} />
          </div>
          <div style={{ background: colors.bg, borderRadius: 10, padding: "12px 16px", margin: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: colors.textMuted }}>Calculated Closing Stock:</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: closing < 0 ? colors.danger : colors.success }}>{fmtNum(closing)} cylinders</span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={!form.opening}>Save Entry</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Vehicle Management ───────────────────────────────────────────────────────
function VehicleManagement({ vans, setVans, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", number: "", driver: "", contact: "", status: "active" });

  const handleSave = () => {
    if (editId) {
      setVans(prev => prev.map(v => v.id === editId ? { ...form, id: editId } : v));
      setEditId(null);
    } else {
      setVans(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
    setForm({ name: "", number: "", driver: "", contact: "", status: "active" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Vehicle Management"
        sub="Manage delivery vans and drivers"
        action={<Btn onClick={() => setShowForm(true)}>+ Add Van</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {vans.map(van => (
          <Card key={van.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: van.status === "active" ? `${colors.primary}18` : `${colors.textMuted}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚚</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>{van.name}</div>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>{van.number}</div>
                </div>
              </div>
              <Badge color={van.status === "active" ? colors.success : colors.textMuted}>{van.status}</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: colors.textMuted }}>Driver</span>
                <span style={{ fontWeight: 500 }}>{van.driver}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: colors.textMuted }}>Contact</span>
                <span style={{ fontWeight: 500 }}>{van.contact}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" variant="secondary" style={{ flex: 1 }} onClick={() => {
                setForm({ name: van.name, number: van.number, driver: van.driver, contact: van.contact, status: van.status });
                setEditId(van.id);
                setShowForm(true);
              }}>Edit</Btn>
              <Btn size="sm" variant={van.status === "active" ? "danger" : "success"} style={{ flex: 1 }}
                onClick={() => setVans(prev => prev.map(v => v.id === van.id ? { ...v, status: v.status === "active" ? "inactive" : "active" } : v))}>
                {van.status === "active" ? "Disable" : "Enable"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <Modal title={editId ? "Edit Van" : "Add New Van"} onClose={() => { setShowForm(false); setEditId(null); setForm({ name: "", number: "", driver: "", contact: "", status: "active" }); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Van Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Van 1" required />
              <Input label="Vehicle Number" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="UP14-AB-1234" required />
              <Input label="Driver Name" value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} placeholder="Driver name" required />
              <Input label="Driver Contact" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="9876543210" />
            </div>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name || !form.number}>Save Van</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Daily Delivery ───────────────────────────────────────────────────────────
function DailyDelivery({ deliveries, setDeliveries, vans, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today());
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    date: today(), vanId: vans[0]?.id || "", domestic: 0, commercial: 0, commissionPerCylinder: 25,
    diesel: 0, driverExpense: 0, maintenance: 0, otherExpense: 0, notes: ""
  });

  const total = Number(form.domestic) + Number(form.commercial);
  const totalCommission = total * Number(form.commissionPerCylinder);
  const totalExpenses = Number(form.diesel) + Number(form.driverExpense) + Number(form.maintenance) + Number(form.otherExpense);
  const netProfit = totalCommission - totalExpenses;

  const handleSave = () => {
    const van = vans.find(v => v.id === Number(form.vanId)) || vans.find(v => String(v.id) === String(form.vanId));
    const entry = {
      ...form, vanId: Number(form.vanId), vanName: van?.name || "", driver: van?.driver || "",
      domestic: +form.domestic, commercial: +form.commercial, total,
      commissionPerCylinder: +form.commissionPerCylinder,
      diesel: +form.diesel, driverExpense: +form.driverExpense, maintenance: +form.maintenance, otherExpense: +form.otherExpense,
      totalCommission, totalExpenses, netProfit,
      addedBy: currentUser.name, addedAt: new Date().toISOString()
    };
    if (editId) {
      setDeliveries(prev => prev.map(d => d.id === editId ? { ...entry, id: editId } : d));
      setEditId(null);
    } else {
      setDeliveries(prev => [...prev, { ...entry, id: Date.now() }]);
    }
    setShowForm(false);
    setForm({ date: today(), vanId: vans[0]?.id || "", domestic: 0, commercial: 0, commissionPerCylinder: 25, diesel: 0, driverExpense: 0, maintenance: 0, otherExpense: 0, notes: "" });
  };

  const filtered = deliveries.filter(d => d.date === filterDate).sort((a, b) => a.vanName.localeCompare(b.vanName));
  const dayTotal = filtered.reduce((s, d) => ({ total: s.total + d.total, commission: s.commission + d.totalCommission, expenses: s.expenses + d.totalExpenses, profit: s.profit + d.netProfit }), { total: 0, commission: 0, expenses: 0, profit: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Daily Delivery Entry"
        sub="Record van deliveries, commissions and expenses"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 }} />
            <Btn onClick={() => setShowForm(true)}>+ Add Delivery</Btn>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard label="Cylinders Delivered" value={fmtNum(dayTotal.total)} icon="🛢" color={colors.primary} />
        <MetricCard label="Total Commission" value={fmt(dayTotal.commission)} icon="💰" color={colors.success} />
        <MetricCard label="Total Expenses" value={fmt(dayTotal.expenses)} icon="📋" color={colors.warning} />
        <MetricCard label="Net Profit" value={fmt(dayTotal.profit)} icon={dayTotal.profit >= 0 ? "📈" : "📉"} color={dayTotal.profit >= 0 ? colors.success : colors.danger} />
      </div>

      <Card>
        <Table
          columns={[
            { header: "Date", key: "date" },
            { header: "Van", key: "vanName" },
            { header: "Driver", key: "driver" },
            { header: "Dom.", render: r => fmtNum(r.domestic) },
            { header: "Com.", render: r => fmtNum(r.commercial) },
            { header: "Total", render: r => <b>{fmtNum(r.total)}</b> },
            { header: "₹/Cyl", render: r => fmt(r.commissionPerCylinder) },
            { header: "Commission", render: r => <span style={{ color: colors.success, fontWeight: 600 }}>{fmt(r.totalCommission)}</span> },
            { header: "Expenses", render: r => <span style={{ color: colors.warning }}>{fmt(r.totalExpenses)}</span> },
            { header: "Profit", render: r => <span style={{ color: r.netProfit >= 0 ? colors.success : colors.danger, fontWeight: 700 }}>{fmt(r.netProfit)}</span> },
            { header: "Notes", key: "notes" },
            {
              header: "Action", render: r => (
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn size="sm" variant="secondary" onClick={() => {
                    setForm({ date: r.date, vanId: r.vanId, domestic: r.domestic, commercial: r.commercial, commissionPerCylinder: r.commissionPerCylinder, diesel: r.diesel, driverExpense: r.driverExpense, maintenance: r.maintenance, otherExpense: r.otherExpense, notes: r.notes });
                    setEditId(r.id); setShowForm(true);
                  }}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => setDeliveries(prev => prev.filter(d => d.id !== r.id))}>Del</Btn>
                </div>
              )
            }
          ]}
          data={filtered}
          emptyMsg="No deliveries recorded for this date"
        />
      </Card>

      {showForm && (
        <Modal title={editId ? "Edit Delivery" : "New Delivery Entry"} onClose={() => { setShowForm(false); setEditId(null); }} width={600}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Select label="Van" value={form.vanId} onChange={e => setForm(f => ({ ...f, vanId: e.target.value }))} options={vans.filter(v => v.status === "active").map(v => ({ value: v.id, label: v.name }))} required />
            <Input label="Domestic Cylinders" type="number" value={form.domestic} onChange={e => setForm(f => ({ ...f, domestic: e.target.value }))} />
            <Input label="Commercial Cylinders" type="number" value={form.commercial} onChange={e => setForm(f => ({ ...f, commercial: e.target.value }))} />
            <Input label="Commission Per Cylinder (₹)" type="number" value={form.commissionPerCylinder} onChange={e => setForm(f => ({ ...f, commissionPerCylinder: e.target.value }))} />
          </div>
          <div style={{ margin: "14px 0", borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 10 }}>Expenses</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Diesel Expense (₹)" type="number" value={form.diesel} onChange={e => setForm(f => ({ ...f, diesel: e.target.value }))} />
              <Input label="Driver Expense (₹)" type="number" value={form.driverExpense} onChange={e => setForm(f => ({ ...f, driverExpense: e.target.value }))} />
              <Input label="Maintenance (₹)" type="number" value={form.maintenance} onChange={e => setForm(f => ({ ...f, maintenance: e.target.value }))} />
              <Input label="Other Expense (₹)" type="number" value={form.otherExpense} onChange={e => setForm(f => ({ ...f, otherExpense: e.target.value }))} />
            </div>
          </div>
          <div style={{ background: colors.bg, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
              {[
                { label: "Total Cylinders", val: fmtNum(total), color: colors.primary },
                { label: "Total Commission", val: fmt(totalCommission), color: colors.success },
                { label: "Total Expenses", val: fmt(totalExpenses), color: colors.warning },
                { label: "Net Profit", val: fmt(netProfit), color: netProfit >= 0 ? colors.success : colors.danger },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
          <Input label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
            <Btn variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Delivery</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Office Sales ─────────────────────────────────────────────────────────────
function OfficeSales({ officeSales, setOfficeSales, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today());
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ date: today(), cylinders: 0, commissionPerCylinder: 28, customer: "", paymentMode: "cash", remarks: "" });

  const totalCommission = Number(form.cylinders) * Number(form.commissionPerCylinder);

  const handleSave = () => {
    const entry = { ...form, cylinders: +form.cylinders, commissionPerCylinder: +form.commissionPerCylinder, totalCommission, addedBy: currentUser.name, addedAt: new Date().toISOString() };
    if (editId) {
      setOfficeSales(prev => prev.map(s => s.id === editId ? { ...entry, id: editId } : s));
      setEditId(null);
    } else {
      setOfficeSales(prev => [...prev, { ...entry, id: Date.now() }]);
    }
    setShowForm(false);
    setForm({ date: today(), cylinders: 0, commissionPerCylinder: 28, customer: "", paymentMode: "cash", remarks: "" });
  };

  const filtered = officeSales.filter(s => s.date === filterDate);
  const dayTotal = filtered.reduce((a, s) => ({ cylinders: a.cylinders + s.cylinders, commission: a.commission + s.totalCommission }), { cylinders: 0, commission: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Office Sales"
        sub="Track direct office cylinder sales"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 }} />
            <Btn onClick={() => setShowForm(true)}>+ Add Sale</Btn>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard label="Today's Cylinders" value={fmtNum(dayTotal.cylinders)} icon="🏪" color={colors.primary} />
        <MetricCard label="Today's Commission" value={fmt(dayTotal.commission)} icon="💰" color={colors.success} />
        <MetricCard label="Monthly Cylinders" value={fmtNum(officeSales.reduce((a, s) => a + s.cylinders, 0))} icon="📊" color={colors.info} />
        <MetricCard label="Monthly Commission" value={fmt(officeSales.reduce((a, s) => a + s.totalCommission, 0))} icon="📈" color={colors.success} />
      </div>

      <Card>
        <Table
          columns={[
            { header: "Date", key: "date" },
            { header: "Cylinders", render: r => fmtNum(r.cylinders) },
            { header: "₹/Cylinder", render: r => fmt(r.commissionPerCylinder) },
            { header: "Commission", render: r => <span style={{ color: colors.success, fontWeight: 600 }}>{fmt(r.totalCommission)}</span> },
            { header: "Customer", render: r => r.customer || <span style={{ color: colors.textMuted }}>—</span> },
            { header: "Payment", render: r => <Badge color={r.paymentMode === "cash" ? colors.success : colors.primary}>{r.paymentMode}</Badge> },
            { header: "Remarks", key: "remarks" },
            { header: "Added By", key: "addedBy" },
            {
              header: "Action", render: r => (
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn size="sm" variant="secondary" onClick={() => {
                    setForm({ date: r.date, cylinders: r.cylinders, commissionPerCylinder: r.commissionPerCylinder, customer: r.customer, paymentMode: r.paymentMode, remarks: r.remarks });
                    setEditId(r.id); setShowForm(true);
                  }}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => setOfficeSales(prev => prev.filter(s => s.id !== r.id))}>Del</Btn>
                </div>
              )
            }
          ]}
          data={filtered.sort((a, b) => b.date.localeCompare(a.date))}
          emptyMsg="No office sales for this date"
        />
      </Card>

      {showForm && (
        <Modal title={editId ? "Edit Sale" : "New Office Sale"} onClose={() => { setShowForm(false); setEditId(null); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <Input label="Cylinders Sold" type="number" value={form.cylinders} onChange={e => setForm(f => ({ ...f, cylinders: e.target.value }))} required />
            <Input label="Commission Per Cylinder (₹)" type="number" value={form.commissionPerCylinder} onChange={e => setForm(f => ({ ...f, commissionPerCylinder: e.target.value }))} />
            <Select label="Payment Mode" value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))} options={[{ value: "cash", label: "Cash" }, { value: "upi", label: "UPI" }, { value: "bank", label: "Bank Transfer" }, { value: "cheque", label: "Cheque" }]} />
            <Input label="Customer Name (Optional)" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="Customer name" />
            <Input label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional" />
          </div>
          <div style={{ background: colors.bg, borderRadius: 10, padding: "12px 16px", margin: "14px 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: colors.textMuted }}>Total Commission:</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: colors.success }}>{fmt(totalCommission)}</span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Sale</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Expense Management ───────────────────────────────────────────────────────
function ExpenseManagement({ expenses, setExpenses, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ date: today(), category: "Salary", amount: "", description: "" });

  const CATS = ["Salary", "Electricity", "Internet", "Vehicle Maintenance", "Office Rent", "Miscellaneous"];

  const handleSave = () => {
    const entry = { ...form, amount: +form.amount, addedBy: currentUser.name, addedAt: new Date().toISOString() };
    if (editId) {
      setExpenses(prev => prev.map(e => e.id === editId ? { ...entry, id: editId } : e));
      setEditId(null);
    } else {
      setExpenses(prev => [...prev, { ...entry, id: Date.now() }]);
    }
    setShowForm(false);
    setForm({ date: today(), category: "Salary", amount: "", description: "" });
  };

  const filtered = expenses
    .filter(e => (!filterDate || e.date === filterDate) && (filterCat === "all" || e.category === filterCat))
    .sort((a, b) => b.date.localeCompare(a.date));

  const catTotals = CATS.map(cat => ({ cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }));
  const pieData = catTotals.filter(c => c.total > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Expense Management"
        sub="Track all agency expenses by category"
        action={<Btn onClick={() => setShowForm(true)}>+ Add Expense</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "1.25rem" }}>
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Expenses by Category</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {catTotals.map(({ cat, total }) => (
              <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: colors.bg, borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: colors.textMuted }}>{cat}</span>
                <span style={{ fontWeight: 700, color: colors.danger }}>{fmt(total)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: 15, fontWeight: 700 }}>Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="total" nameKey="cat" cx="50%" cy="50%" outerRadius={70} label={({ cat, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 13 }}>
            <option value="all">All Categories</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(filterDate || filterCat !== "all") && <Btn size="sm" variant="secondary" onClick={() => { setFilterDate(""); setFilterCat("all"); }}>Clear</Btn>}
        </div>
        <Table
          columns={[
            { header: "Date", key: "date" },
            { header: "Category", render: r => <Badge color={chartColors[CATS.indexOf(r.category) % chartColors.length]}>{r.category}</Badge> },
            { header: "Amount", render: r => <span style={{ fontWeight: 700, color: colors.danger }}>{fmt(r.amount)}</span> },
            { header: "Description", key: "description" },
            { header: "Added By", key: "addedBy" },
            {
              header: "Action", render: r => (
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn size="sm" variant="secondary" onClick={() => {
                    setForm({ date: r.date, category: r.category, amount: r.amount, description: r.description });
                    setEditId(r.id); setShowForm(true);
                  }}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => setExpenses(prev => prev.filter(e => e.id !== r.id))}>Del</Btn>
                </div>
              )
            }
          ]}
          data={filtered}
        />
      </Card>

      {showForm && (
        <Modal title={editId ? "Edit Expense" : "Add Expense"} onClose={() => { setShowForm(false); setEditId(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={CATS.map(c => ({ value: c, label: c }))} required />
              <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Expense details" />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.amount}>Save Expense</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Profit & Loss ────────────────────────────────────────────────────────────
function ProfitLoss({ deliveries, officeSales, expenses, vans }) {
  const [period, setPeriod] = useState("monthly");
  const [customStart, setCustomStart] = useState(dates[0]);
  const [customEnd, setCustomEnd] = useState(today());

  const filterDates = useCallback((arr) => {
    const now = new Date();
    if (period === "daily") {
      const d = today();
      return arr.filter(x => x.date === d);
    }
    if (period === "weekly") {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      return arr.filter(x => x.date >= start.toISOString().split("T")[0]);
    }
    if (period === "monthly") {
      const start = new Date(now); start.setDate(now.getDate() - 30);
      return arr.filter(x => x.date >= start.toISOString().split("T")[0]);
    }
    if (period === "custom") return arr.filter(x => x.date >= customStart && x.date <= customEnd);
    return arr;
  }, [period, customStart, customEnd]);

  const fDel = filterDates(deliveries);
  const fSales = filterDates(officeSales);
  const fExp = filterDates(expenses);

  const vanProfit = vans.map(van => {
    const vd = fDel.filter(d => d.vanId === van.id);
    const commission = vd.reduce((s, d) => s + d.totalCommission, 0);
    const exp = vd.reduce((s, d) => s + d.totalExpenses, 0);
    const profit = commission - exp;
    const cyl = vd.reduce((s, d) => s + d.total, 0);
    return { ...van, commission, exp, profit, cyl };
  });

  const officeCommission = fSales.reduce((s, d) => s + d.totalCommission, 0);
  const officeExpenses = fExp.reduce((s, d) => s + d.amount, 0);
  const officeProfit = officeCommission - officeExpenses;

  const totalRevenue = vanProfit.reduce((s, v) => s + v.commission, 0) + officeCommission;
  const totalExpenses = vanProfit.reduce((s, v) => s + v.exp, 0) + officeExpenses;
  const totalProfit = totalRevenue - totalExpenses;

  const vanChartData = vanProfit.map(v => ({ name: v.name, commission: Math.round(v.commission), expenses: Math.round(v.exp), profit: Math.round(v.profit) }));

  const trendData = useMemo(() => {
    const last15 = dates.slice(-15);
    return last15.map(date => {
      const dComm = deliveries.filter(d => d.date === date).reduce((s, d) => s + d.totalCommission, 0);
      const dExp = deliveries.filter(d => d.date === date).reduce((s, d) => s + d.totalExpenses, 0);
      const oComm = officeSales.filter(d => d.date === date).reduce((s, d) => s + d.totalCommission, 0);
      const oExp = expenses.filter(d => d.date === date).reduce((s, d) => s + d.amount, 0);
      return { date: date.slice(5), revenue: Math.round(dComm + oComm), expenses: Math.round(dExp + oExp), profit: Math.round((dComm + oComm) - (dExp + oExp)) };
    });
  }, [deliveries, officeSales, expenses]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader
        title="Profit & Loss"
        sub="Comprehensive financial analysis"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {["daily", "weekly", "monthly", "custom"].map(p => (
              <Btn key={p} size="sm" variant={period === p ? "primary" : "secondary"} onClick={() => setPeriod(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</Btn>
            ))}
          </div>
        }
      />

      {period === "custom" && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Input label="From" type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
          <Input label="To" type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard label="Total Revenue" value={fmt(totalRevenue)} icon="💰" color={colors.success} />
        <MetricCard label="Total Expenses" value={fmt(totalExpenses)} icon="📋" color={colors.danger} />
        <MetricCard label="Net Profit/Loss" value={fmt(totalProfit)} icon={totalProfit >= 0 ? "📈" : "📉"} color={totalProfit >= 0 ? colors.success : colors.danger} />
        <MetricCard label="Van Commission" value={fmt(vanProfit.reduce((s, v) => s + v.commission, 0))} icon="🚚" color={colors.primary} />
        <MetricCard label="Office Commission" value={fmt(officeCommission)} icon="🏪" color={colors.info} />
        <MetricCard label="Office Expenses" value={fmt(officeExpenses)} icon="🏢" color={colors.warning} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Van-wise Profit Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vanChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="commission" fill={colors.success} name="Commission" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={colors.danger} name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill={colors.primary} name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Revenue vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={colors.success} strokeWidth={2} name="Revenue" dot={false} />
              <Line type="monotone" dataKey="expenses" stroke={colors.danger} strokeWidth={2} name="Expenses" dot={false} />
              <Line type="monotone" dataKey="profit" stroke={colors.primary} strokeWidth={2} name="Profit" dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Van-wise Summary Table</h3>
        <Table
          columns={[
            { header: "Van", key: "name" },
            { header: "Driver", key: "driver" },
            { header: "Cylinders", render: r => fmtNum(r.cyl) },
            { header: "Commission", render: r => <span style={{ color: colors.success, fontWeight: 600 }}>{fmt(r.commission)}</span> },
            { header: "Expenses", render: r => <span style={{ color: colors.danger }}>{fmt(r.exp)}</span> },
            { header: "Net Profit", render: r => <span style={{ fontWeight: 700, color: r.profit >= 0 ? colors.success : colors.danger }}>{fmt(r.profit)}</span> },
            { header: "Margin", render: r => r.commission > 0 ? <Badge color={r.profit / r.commission > 0.5 ? colors.success : colors.warning}>{Math.round((r.profit / r.commission) * 100)}%</Badge> : "—" },
          ]}
          data={vanProfit}
        />
        <div style={{ marginTop: 14, padding: "12px 16px", background: colors.bg, borderRadius: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontWeight: 600, color: colors.text }}>Office P&L</span>
          <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
            <span>Commission: <b style={{ color: colors.success }}>{fmt(officeCommission)}</b></span>
            <span>Expenses: <b style={{ color: colors.danger }}>{fmt(officeExpenses)}</b></span>
            <span>Profit: <b style={{ color: officeProfit >= 0 ? colors.success : colors.danger }}>{fmt(officeProfit)}</b></span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function Reports({ deliveries, officeSales, expenses, stock, vans }) {
  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(today());
  const [generated, setGenerated] = useState(false);

  const generateReport = () => setGenerated(true);

  const reportData = useMemo(() => {
    let del = deliveries, sales = officeSales, exp = expenses, st = stock;
    if (reportType === "daily") {
      del = deliveries.filter(d => d.date === reportDate);
      sales = officeSales.filter(d => d.date === reportDate);
      exp = expenses.filter(d => d.date === reportDate);
      st = stock.filter(d => d.date === reportDate);
    } else if (reportType === "weekly") {
      const start = new Date(reportDate); start.setDate(start.getDate() - 7);
      const sd = start.toISOString().split("T")[0];
      del = deliveries.filter(d => d.date >= sd && d.date <= reportDate);
      sales = officeSales.filter(d => d.date >= sd && d.date <= reportDate);
      exp = expenses.filter(d => d.date >= sd && d.date <= reportDate);
    } else if (reportType === "monthly") {
      const month = reportDate.slice(0, 7);
      del = deliveries.filter(d => d.date.startsWith(month));
      sales = officeSales.filter(d => d.date.startsWith(month));
      exp = expenses.filter(d => d.date.startsWith(month));
    }
    const totalRevenue = del.reduce((s, d) => s + d.totalCommission, 0) + sales.reduce((s, d) => s + d.totalCommission, 0);
    const totalExp = del.reduce((s, d) => s + d.totalExpenses, 0) + exp.reduce((s, d) => s + d.amount, 0);
    return { del, sales, exp, totalRevenue, totalExp, profit: totalRevenue - totalExp, cylinders: del.reduce((s, d) => s + d.total, 0) + sales.reduce((s, d) => s + d.cylinders, 0) };
  }, [reportType, reportDate, deliveries, officeSales, expenses, stock]);

  const handleExportCSV = () => {
    const rows = [["Date", "Van", "Driver", "Cylinders", "Commission", "Expenses", "Profit"]];
    reportData.del.forEach(d => rows.push([d.date, d.vanName, d.driver, d.total, d.totalCommission, d.totalExpenses, d.netProfit]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${reportDate}.csv`; a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader title="Reports" sub="Generate and export agency reports" />

      <Card>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Report Type" value={reportType} onChange={e => { setReportType(e.target.value); setGenerated(false); }} options={[
            { value: "daily", label: "Daily Report" },
            { value: "weekly", label: "Weekly Report" },
            { value: "monthly", label: "Monthly Report" },
          ]} />
          <Input label="Date" type={reportType === "monthly" ? "month" : "date"} value={reportType === "monthly" ? reportDate.slice(0, 7) : reportDate} onChange={e => { setReportDate(reportType === "monthly" ? e.target.value + "-01" : e.target.value); setGenerated(false); }} />
          <Btn onClick={generateReport}>Generate Report</Btn>
          {generated && <Btn variant="secondary" onClick={handleExportCSV}>⬇ Export CSV</Btn>}
        </div>
      </Card>

      {generated && (
        <>
          {/* Report Header */}
          <div style={{ background: `linear-gradient(135deg, ${colors.sidebar}, ${colors.primary})`, borderRadius: 14, padding: "1.5rem 2rem", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 36 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase" }}>LPG Distribution Report</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{AGENCY.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{AGENCY.address} | {AGENCY.phone} | GST: {AGENCY.gst}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{reportDate}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Generated: {new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <MetricCard label="Total Cylinders" value={fmtNum(reportData.cylinders)} icon="🛢" color={colors.primary} />
            <MetricCard label="Total Revenue" value={fmt(reportData.totalRevenue)} icon="💰" color={colors.success} />
            <MetricCard label="Total Expenses" value={fmt(reportData.totalExp)} icon="📋" color={colors.danger} />
            <MetricCard label="Net Profit" value={fmt(reportData.profit)} icon={reportData.profit >= 0 ? "📈" : "📉"} color={reportData.profit >= 0 ? colors.success : colors.danger} />
          </div>

          <Card>
            <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Delivery Summary</h3>
            <Table
              columns={[
                { header: "Date", key: "date" }, { header: "Van", key: "vanName" }, { header: "Driver", key: "driver" },
                { header: "Dom.", render: r => fmtNum(r.domestic) }, { header: "Com.", render: r => fmtNum(r.commercial) },
                { header: "Total", render: r => <b>{fmtNum(r.total)}</b> },
                { header: "Commission", render: r => fmt(r.totalCommission) }, { header: "Expenses", render: r => fmt(r.totalExpenses) },
                { header: "Profit", render: r => <span style={{ color: r.netProfit >= 0 ? colors.success : colors.danger, fontWeight: 600 }}>{fmt(r.netProfit)}</span> },
              ]}
              data={reportData.del}
              emptyMsg="No delivery data for this period"
            />
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Card>
              <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Office Sales</h3>
              <Table
                columns={[
                  { header: "Date", key: "date" }, { header: "Cylinders", render: r => fmtNum(r.cylinders) },
                  { header: "Commission", render: r => fmt(r.totalCommission) }, { header: "Payment", key: "paymentMode" },
                ]}
                data={reportData.sales}
                emptyMsg="No office sales"
              />
            </Card>
            <Card>
              <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700 }}>Expenses</h3>
              <Table
                columns={[
                  { header: "Date", key: "date" }, { header: "Category", key: "category" },
                  { header: "Amount", render: r => <span style={{ color: colors.danger, fontWeight: 600 }}>{fmt(r.amount)}</span> },
                ]}
                data={reportData.exp}
                emptyMsg="No expenses"
              />
            </Card>
          </div>

          <div style={{ textAlign: "center", padding: "12px", fontSize: 12, color: colors.textMuted, borderTop: `1px solid ${colors.border}` }}>
            {AGENCY.name} | {AGENCY.address} | {AGENCY.phone} | GST: {AGENCY.gst}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ currentUser, users, setUsers }) {
  const [agency, setAgency] = useState({ ...AGENCY });
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [newUser, setNewUser] = useState({ username: "", name: "", email: "", password: "", role: "staff" });
  const [userMsg, setUserMsg] = useState("");

  const handleSaveAgency = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleChangePassword = () => {
    const user = users.find(u => u.id === currentUser.id);
    if (user.password !== pwForm.current) { setPwMsg("Current password incorrect"); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg("Passwords don't match"); return; }
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password: pwForm.newPw } : u));
    setPwMsg("Password changed successfully!");
    setPwForm({ current: "", newPw: "", confirm: "" });
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) { setUserMsg("Username and password required"); return; }
    if (users.find(u => u.username === newUser.username)) { setUserMsg("Username already exists"); return; }
    setUsers(prev => [...prev, { ...newUser, id: Date.now() }]);
    setUserMsg("User added successfully!");
    setNewUser({ username: "", name: "", email: "", password: "", role: "staff" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <SectionHeader title="Settings" sub="Configure agency details and user management" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700 }}>Agency Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Agency Name" value={agency.name} onChange={e => setAgency(a => ({ ...a, name: e.target.value }))} />
            <Input label="Address" value={agency.address} onChange={e => setAgency(a => ({ ...a, address: e.target.value }))} />
            <Input label="Phone Number" value={agency.phone} onChange={e => setAgency(a => ({ ...a, phone: e.target.value }))} />
            <Input label="GST Number" value={agency.gst} onChange={e => setAgency(a => ({ ...a, gst: e.target.value }))} />
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, display: "block", marginBottom: 6 }}>Agency Logo (Emoji)</label>
              <input value={agency.logo} onChange={e => setAgency(a => ({ ...a, logo: e.target.value }))} placeholder="🔥" style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 24, width: 80 }} />
            </div>
            <Btn onClick={handleSaveAgency} variant={saved ? "success" : "primary"}>{saved ? "✓ Saved!" : "Save Agency Details"}</Btn>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700 }}>Change Password</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Current Password" type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
            <Input label="New Password" type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
            {pwMsg && <div style={{ padding: "8px 12px", borderRadius: 8, background: pwMsg.includes("success") ? `${colors.success}15` : `${colors.danger}15`, color: pwMsg.includes("success") ? colors.success : colors.danger, fontSize: 13 }}>{pwMsg}</div>}
            <Btn onClick={handleChangePassword}>Change Password</Btn>
          </div>
        </Card>
      </div>

      {currentUser.role === "admin" && (
        <Card>
          <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700 }}>User Management</h3>
          <Table
            columns={[
              { header: "Name", key: "name" },
              { header: "Username", key: "username" },
              { header: "Email", key: "email" },
              { header: "Role", render: r => <Badge color={r.role === "admin" ? colors.primary : colors.info}>{r.role}</Badge> },
              {
                header: "Action", render: r => r.id !== currentUser.id ? (
                  <Btn size="sm" variant="danger" onClick={() => setUsers(prev => prev.filter(u => u.id !== r.id))}>Remove</Btn>
                ) : <Badge color={colors.success}>Current</Badge>
              }
            ]}
            data={users}
          />
          <div style={{ marginTop: "1.25rem", borderTop: `1px solid ${colors.border}`, paddingTop: "1.25rem" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: colors.textMuted }}>Add New User</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Full Name" value={newUser.name} onChange={e => setNewUser(f => ({ ...f, name: e.target.value }))} placeholder="Staff name" />
              <Input label="Username" value={newUser.username} onChange={e => setNewUser(f => ({ ...f, username: e.target.value }))} placeholder="login username" />
              <Input label="Email" type="email" value={newUser.email} onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))} />
              <Select label="Role" value={newUser.role} onChange={e => setNewUser(f => ({ ...f, role: e.target.value }))} options={[{ value: "staff", label: "Staff" }, { value: "admin", label: "Admin" }]} />
            </div>
            {userMsg && <div style={{ margin: "10px 0", padding: "8px 12px", borderRadius: 8, background: userMsg.includes("success") ? `${colors.success}15` : `${colors.danger}15`, color: userMsg.includes("success") ? colors.success : colors.danger, fontSize: 13 }}>{userMsg}</div>}
            <Btn onClick={handleAddUser} style={{ marginTop: 12 }}>Add User</Btn>
          </div>
        </Card>
      )}

      <Card>
        <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700 }}>Commission Rate Settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Domestic Commission/Cyl (₹)", val: 25 },
            { label: "Commercial Commission/Cyl (₹)", val: 28 },
            { label: "Office Sale Commission/Cyl (₹)", val: 28 },
          ].map((item, i) => (
            <div key={i} style={{ background: colors.bg, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>{item.label}</div>
              <input type="number" defaultValue={item.val} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 16, fontWeight: 700, color: colors.primary, width: "100%", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700 }}>System Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
          {[
            { label: "Application", val: "Gas Agency Pro" },
            { label: "Version", val: "1.0.0" },
            { label: "Database", val: "MongoDB (Simulated)" },
            { label: "Built With", val: "React + TypeScript" },
            { label: "Future Ready", val: "WhatsApp, SMS, GPS, Mobile App" },
            { label: "Last Backup", val: new Date().toLocaleString("en-IN") },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: colors.bg, borderRadius: 8 }}>
              <span style={{ color: colors.textMuted }}>{item.label}</span>
              <span style={{ fontWeight: 500 }}>{item.val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", roles: ["admin", "staff"] },
  { id: "stock", label: "Stock", icon: "🛢", roles: ["admin", "staff"] },
  { id: "vehicles", label: "Vehicles", icon: "🚚", roles: ["admin"] },
  { id: "deliveries", label: "Deliveries", icon: "📦", roles: ["admin", "staff"] },
  { id: "office-sales", label: "Office Sales", icon: "🏪", roles: ["admin", "staff"] },
  { id: "expenses", label: "Expenses", icon: "💸", roles: ["admin", "staff"] },
  { id: "profit-loss", label: "Profit & Loss", icon: "📊", roles: ["admin"] },
  { id: "reports", label: "Reports", icon: "📋", roles: ["admin", "staff"] },
  { id: "settings", label: "Settings", icon: "⚙️", roles: ["admin", "staff"] },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [deliveries, setDeliveries] = useState(initDeliveries);
  const [officeSales, setOfficeSales] = useState(initOfficeSales);
  const [expenses, setExpenses] = useState(initExpenses);
  const [stock, setStock] = useState(initStock);
  const [vans, setVans] = useState(VANS_DATA);
  const [users, setUsers] = useState(USERS_DATA);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;

  const navItems = NAV_ITEMS.filter(n => n.roles.includes(currentUser.role));

  const renderContent = () => {
    const props = { deliveries, setDeliveries, officeSales, setOfficeSales, expenses, setExpenses, stock, setStock, vans, setVans, currentUser, users, setUsers };
    switch (activeNav) {
      case "dashboard": return <Dashboard {...props} />;
      case "stock": return <StockManagement {...props} />;
      case "vehicles": return <VehicleManagement {...props} />;
      case "deliveries": return <DailyDelivery {...props} />;
      case "office-sales": return <OfficeSales {...props} />;
      case "expenses": return <ExpenseManagement {...props} />;
      case "profit-loss": return <ProfitLoss {...props} />;
      case "reports": return <Reports {...props} />;
      case "settings": return <Settings {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 240 : 68, background: colors.sidebar, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "1.25rem 1.25rem 1rem" : "1.25rem 0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>🔥</div>
            {sidebarOpen && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>INDANE LPG</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap" }}>Maa Shaila</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Gramin Vitrak</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: sidebarOpen ? "9px 12px" : "9px 0", justifyContent: sidebarOpen ? "flex-start" : "center",
              borderRadius: 8, border: "none", background: activeNav === item.id ? colors.primaryLight : "transparent",
              color: activeNav === item.id ? "#fff" : colors.sidebarText, cursor: "pointer", fontSize: 14, fontWeight: activeNav === item.id ? 600 : 400, marginBottom: 2, transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: colors.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {currentUser.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{currentUser.role}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={() => setCurrentUser(null)} style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12 }}>
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{ background: "#fff", borderBottom: `1px solid ${colors.border}`, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: colors.textMuted, padding: 4 }}>☰</button>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{NAV_ITEMS.find(n => n.id === activeNav)?.label}</span>
              <span style={{ fontSize: 13, color: colors.textMuted, marginLeft: 8 }}>Gas Agency Pro</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>{new Date().toLocaleDateString("en-IN")}</span>
            <Badge color={currentUser.role === "admin" ? colors.primary : colors.info}>{currentUser.role}</Badge>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto", maxWidth: "100%" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
