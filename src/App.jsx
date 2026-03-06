import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ELDERS = [
  { id: 1, name: "James Whitfield", email: "james@church.org", password: "pass" },
  { id: 2, name: "Robert Harding", email: "robert@church.org", password: "pass" },
];

const HOUSEHOLDS = {
  1: [
    { id: 101, name: "Anderson Family", head: "Tom & Sarah Anderson", phone: "434-555-0192", email: "andersons@email.com", address: "412 Maple Dr, Lynchburg VA 24501" },
    { id: 102, name: "Chen Household", head: "David Chen", phone: "434-555-0347", email: "dchen@email.com", address: "88 Oak Lane, Lynchburg VA 24502" },
    { id: 103, name: "Rivera Family", head: "Miguel & Carmen Rivera", phone: "434-555-0581", email: "riveras@email.com", address: "203 Pine St, Lynchburg VA 24503" },
    { id: 104, name: "Thompson Family", head: "Greg & Lisa Thompson", phone: "434-555-0724", email: "thompsons@email.com", address: "17 Elm Ct, Lynchburg VA 24501" },
    { id: 105, name: "Patel Household", head: "Raj Patel", phone: "434-555-0836", email: "raj.patel@email.com", address: "556 Cedar Blvd, Lynchburg VA 24502" },
    { id: 106, name: "Williams Family", head: "Marcus & Tanya Williams", phone: "434-555-0912", email: "williams@email.com", address: "91 Birch Way, Lynchburg VA 24503" },
    { id: 107, name: "O'Brien Household", head: "Patrick O'Brien", phone: "434-555-0143", email: "pobrien@email.com", address: "334 Walnut Ave, Lynchburg VA 24501" },
  ],
  2: [
    { id: 201, name: "Foster Family", head: "Brian & Anne Foster", phone: "434-555-0267", email: "fosters@email.com", address: "78 Spruce Rd, Lynchburg VA 24502" },
    { id: 202, name: "Kim Household", head: "James & Yuna Kim", phone: "434-555-0399", email: "jkim@email.com", address: "445 Hickory Ln, Lynchburg VA 24503" },
  ],
};

const CONTACT_LOG_INIT = [
  { id: 1, elderId: 1, householdId: 101, date: "2025-11-14", type: "Call", notes: "Checked in after Tom's surgery. Doing well, appreciated the call.", notified: false },
  { id: 2, elderId: 1, householdId: 103, date: "2025-12-02", type: "Visit", notes: "Stopped by to drop off a meal. Great conversation.", notified: true },
  { id: 3, elderId: 1, householdId: 102, date: "2026-01-19", type: "Coffee", notes: "Met at Common Market. David shared some concerns about his job situation.", notified: true },
  { id: 4, elderId: 1, householdId: 105, date: "2026-02-08", type: "Text", notes: "Sent encouragement after hearing about family illness.", notified: false },
];

const STAFF_RECIPIENTS = [
  { id: "s1", name: "Pastor Mark Ellis", email: "mark@church.org" },
  { id: "s2", name: "Elder Coord. Dan Shaw", email: "dan@church.org" },
  { id: "s3", name: "Pastor of Care Beth Moore", email: "beth@church.org" },
];

const CONTACT_TYPES = ["Text", "Call", "Visit", "Lunch", "Coffee"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return 999;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function lastContactDate(householdId, logs) {
  const entries = logs.filter(l => l.householdId === householdId).sort((a, b) => new Date(b.date) - new Date(a.date));
  return entries.length ? entries[0].date : null;
}

function statusColor(days) {
  if (days < 60) return { dot: "#4ade80", label: "Recent", bg: "rgba(74,222,128,0.12)" };
  if (days < 120) return { dot: "#facc15", label: "Due Soon", bg: "rgba(250,204,21,0.12)" };
  return { dot: "#f87171", label: "Overdue", bg: "rgba(248,113,113,0.12)" };
}

function formatDate(d) {
  if (!d) return "Never contacted";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#f7f3ee",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#2c2416",
  },
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(160deg, #3b2f1e 0%, #5c4530 50%, #7a5c3a 100%)",
    padding: "24px",
  },
  loginCard: {
    background: "#faf7f2",
    borderRadius: "20px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
    textAlign: "center",
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #5c4530, #8a6840)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: 28,
  },
  loginTitle: {
    fontSize: 34,
    fontWeight: "400",
    letterSpacing: "-0.5px",
    color: "#2c2416",
    marginBottom: 4,
  },
  loginSub: {
    fontSize: 14,
    color: "#8a7560",
    marginBottom: 36,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "10px",
    border: "1.5px solid #d9cfc4",
    background: "#fff",
    fontSize: 15,
    color: "#2c2416",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 14,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #5c4530, #8a6840)",
    color: "#faf7f2",
    border: "none",
    fontSize: 16,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    letterSpacing: "0.03em",
    marginTop: 4,
  },
  loginErr: {
    color: "#c0392b",
    fontSize: 13,
    marginBottom: 12,
  },
  header: {
    background: "linear-gradient(135deg, #3b2f1e 0%, #5c4530 100%)",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  headerTitle: {
    color: "#f0e8dc",
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    color: "#b8a090",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: 1,
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#d4c4b0",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  main: { padding: "20px 16px", maxWidth: 480, margin: "0 auto" },
  sectionHead: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#8a7560",
    marginBottom: 12,
    marginTop: 24,
  },
  householdCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    border: "1.5px solid #ede7df",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
    marginRight: 12,
  },
  hName: { fontSize: 16, fontWeight: "600", color: "#2c2416", marginBottom: 2 },
  hSub: { fontSize: 12, color: "#8a7560" },
  statusPill: {
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "3px 8px",
    borderRadius: 20,
    fontWeight: "600",
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#5c4530",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "8px 0",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  detailCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1.5px solid #ede7df",
    marginBottom: 16,
  },
  detailName: { fontSize: 22, fontWeight: "600", color: "#2c2416", marginBottom: 4 },
  detailHead: { fontSize: 14, color: "#8a7560", marginBottom: 20 },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #f0ebe4",
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#f7f3ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  contactLabel: { fontSize: 12, color: "#8a7560", marginBottom: 1 },
  contactVal: { fontSize: 14, color: "#2c2416", fontWeight: "500" },
  logBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #5c4530, #8a6840)",
    color: "#faf7f2",
    border: "none",
    fontSize: 16,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    letterSpacing: "0.02em",
    marginBottom: 20,
  },
  historyEntry: {
    background: "#faf7f2",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 8,
    border: "1px solid #ede7df",
  },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  historyType: {
    background: "#5c4530",
    color: "#faf7f2",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    letterSpacing: "0.05em",
  },
  historyDate: { fontSize: 12, color: "#8a7560" },
  historyNotes: { fontSize: 13, color: "#4a3828", lineHeight: 1.5 },
  formCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1.5px solid #ede7df",
  },
  formTitle: { fontSize: 20, color: "#2c2416", marginBottom: 20, fontWeight: "600" },
  label: { fontSize: 12, color: "#8a7560", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block" },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid #d9cfc4",
    background: "#fff",
    fontSize: 15,
    color: "#2c2416",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 18,
    fontFamily: "inherit",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a7560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 36,
  },
  typePills: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  typePill: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "1.5px solid #d9cfc4",
    background: "#fff",
    fontSize: 14,
    color: "#5c4530",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  typePillActive: {
    background: "#5c4530",
    borderColor: "#5c4530",
    color: "#faf7f2",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid #d9cfc4",
    background: "#fff",
    fontSize: 14,
    color: "#2c2416",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: 90,
    marginBottom: 18,
    lineHeight: 1.6,
  },
  notifyBox: {
    background: "#faf7f2",
    borderRadius: 10,
    padding: "14px",
    border: "1.5px solid #ede7df",
    marginBottom: 20,
  },
  notifyToggleRow: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  notifyLabel: { fontSize: 14, color: "#2c2416", fontWeight: "500" },
  checkboxPills: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  checkRow: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  checkLabel: { fontSize: 13, color: "#4a3828" },
  submitBtn: {
    width: "100%",
    padding: "15px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #5c4530, #8a6840)",
    color: "#faf7f2",
    border: "none",
    fontSize: 16,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  cancelBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: 12,
    background: "none",
    color: "#8a7560",
    border: "1.5px solid #d9cfc4",
    fontSize: 15,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 10,
  },
  successBanner: {
    background: "#d1fae5",
    border: "1.5px solid #6ee7b7",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 16,
    fontSize: 14,
    color: "#065f46",
    textAlign: "center",
  },
  summaryCard: {
    background: "linear-gradient(135deg, #5c4530, #7a5c3a)",
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 20,
    color: "#f0e8dc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statNum: { fontSize: 28, fontWeight: "600", color: "#f0e8dc" },
  statLabel: { fontSize: 11, color: "#b8a090", letterSpacing: "0.08em", textTransform: "uppercase" },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function handleLogin() {
    const elder = ELDERS.find(e => e.email === email && e.password === password);
    if (elder) { onLogin(elder); }
    else { setErr("Invalid email or password. Try james@church.org / pass"); }
  }

  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={S.logoMark}>🌿</div>
        <div style={S.loginTitle}>Pasture</div>
        <div style={S.loginSub}>Elder Shepherding</div>
        {err && <div style={S.loginErr}>{err}</div>}
        <input
          style={S.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <input
          style={S.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <button style={S.loginBtn} onClick={handleLogin}>Sign In</button>
      </div>
    </div>
  );
}

function Header({ elder, onLogout }) {
  return (
    <div style={S.header}>
      <div>
        <div style={S.headerTitle}>Pasture</div>
        <div style={S.headerSub}>{elder.name}</div>
      </div>
      <button style={S.logoutBtn} onClick={onLogout}>Sign Out</button>
    </div>
  );
}

function Dashboard({ elder, households, logs, onSelectHousehold, onLogContact }) {
  const total = households.length;
  const recentCount = households.filter(h => daysSince(lastContactDate(h.id, logs)) < 60).length;
  const overdueCount = households.filter(h => daysSince(lastContactDate(h.id, logs)) >= 120).length;

  return (
    <div style={S.main}>
      <div style={S.summaryCard}>
        <div>
          <div style={S.statNum}>{total}</div>
          <div style={S.statLabel}>Households</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...S.statNum, color: "#4ade80" }}>{recentCount}</div>
          <div style={S.statLabel}>Recent</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...S.statNum, color: overdueCount > 0 ? "#f87171" : "#4ade80" }}>{overdueCount}</div>
          <div style={S.statLabel}>Overdue</div>
        </div>
      </div>

      <button style={S.logBtn} onClick={onLogContact}>+ Log a Contact</button>

      <div style={S.sectionHead}>Your Households</div>
      {households.map(h => {
        const last = lastContactDate(h.id, logs);
        const days = daysSince(last);
        const status = statusColor(days);
        return (
          <div
            key={h.id}
            style={{ ...S.householdCard }}
            onClick={() => onSelectHousehold(h)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ ...S.dot, background: status.dot }} />
              <div>
                <div style={S.hName}>{h.name}</div>
                <div style={S.hSub}>{last ? `Last contact ${formatDate(last)}` : "Never contacted"}</div>
              </div>
            </div>
            <div style={{ ...S.statusPill, background: status.bg, color: status.dot }}>{status.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function HouseholdDetail({ household, logs, onBack, onLogContact }) {
  const householdLogs = logs.filter(l => l.householdId === household.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={S.main}>
      <button style={S.backBtn} onClick={onBack}>← Back to Dashboard</button>

      <div style={S.detailCard}>
        <div style={S.detailName}>{household.name}</div>
        <div style={S.detailHead}>{household.head}</div>
        <div style={S.contactRow}>
          <div style={S.contactIcon}>📞</div>
          <div>
            <div style={S.contactLabel}>Phone</div>
            <a href={`tel:${household.phone}`} style={{ ...S.contactVal, color: "#5c4530", textDecoration: "none" }}>{household.phone}</a>
          </div>
        </div>
        <div style={S.contactRow}>
          <div style={S.contactIcon}>✉️</div>
          <div>
            <div style={S.contactLabel}>Email</div>
            <a href={`mailto:${household.email}`} style={{ ...S.contactVal, color: "#5c4530", textDecoration: "none" }}>{household.email}</a>
          </div>
        </div>
        <div style={{ ...S.contactRow, borderBottom: "none" }}>
          <div style={S.contactIcon}>📍</div>
          <div>
            <div style={S.contactLabel}>Address</div>
            <div style={S.contactVal}>{household.address}</div>
          </div>
        </div>
      </div>

      <button style={S.logBtn} onClick={() => onLogContact(household)}>+ Log Contact with {household.name.split(" ")[0]}</button>

      <div style={S.sectionHead}>Contact History ({householdLogs.length})</div>
      {householdLogs.length === 0 && (
        <div style={{ textAlign: "center", color: "#8a7560", fontSize: 14, padding: "20px 0" }}>No contacts logged yet.</div>
      )}
      {householdLogs.map(entry => (
        <div key={entry.id} style={S.historyEntry}>
          <div style={S.historyTop}>
            <span style={S.historyType}>{entry.type}</span>
            <span style={S.historyDate}>{formatDate(entry.date)}</span>
          </div>
          {entry.notes && <div style={S.historyNotes}>{entry.notes}</div>}
          {entry.notified && <div style={{ fontSize: 11, color: "#8a7560", marginTop: 4 }}>📤 Staff notified</div>}
        </div>
      ))}
    </div>
  );
}

function LogContactForm({ households, preselectedHousehold, elderId, onSave, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [householdId, setHouseholdId] = useState(preselectedHousehold ? preselectedHousehold.id : "");
  const [date, setDate] = useState(today);
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [err, setErr] = useState("");

  function toggleRecipient(id) {
    setSelectedRecipients(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  }

  function handleSubmit() {
    if (!householdId) { setErr("Please select a household."); return; }
    if (!type) { setErr("Please select a contact type."); return; }
    setErr("");
    const newEntry = {
      id: Date.now(),
      elderId,
      householdId: parseInt(householdId),
      date,
      type,
      notes,
      notified: notifyEnabled && selectedRecipients.length > 0,
      recipients: selectedRecipients,
    };
    onSave(newEntry);
  }

  return (
    <div style={S.main}>
      <button style={S.backBtn} onClick={onCancel}>← Cancel</button>
      <div style={S.formCard}>
        <div style={S.formTitle}>Log a Contact</div>

        {err && <div style={{ ...S.loginErr, marginBottom: 14 }}>{err}</div>}

        <label style={S.label}>Household</label>
        <select style={S.select} value={householdId} onChange={e => setHouseholdId(e.target.value)}>
          <option value="">Select a household…</option>
          {households.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <label style={S.label}>Date</label>
        <input
          style={{ ...S.input, marginBottom: 18 }}
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <label style={S.label}>Type of Contact</label>
        <div style={S.typePills}>
          {CONTACT_TYPES.map(t => (
            <button
              key={t}
              style={{ ...S.typePill, ...(type === t ? S.typePillActive : {}) }}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <label style={S.label}>Notes (optional)</label>
        <textarea
          style={S.textarea}
          placeholder="Any prayer requests, needs, or things to follow up on…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div style={S.notifyBox}>
          <div style={S.notifyToggleRow} onClick={() => setNotifyEnabled(p => !p)}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, border: "1.5px solid #d9cfc4",
              background: notifyEnabled ? "#5c4530" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, flexShrink: 0, transition: "all 0.15s"
            }}>
              {notifyEnabled && "✓"}
            </div>
            <div style={S.notifyLabel}>Notify staff about this contact</div>
          </div>
          {notifyEnabled && (
            <div style={S.checkboxPills}>
              <div style={{ fontSize: 12, color: "#8a7560", marginBottom: 4 }}>Select recipients:</div>
              {STAFF_RECIPIENTS.map(r => (
                <div key={r.id} style={S.checkRow} onClick={() => toggleRecipient(r.id)}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, border: "1.5px solid #d9cfc4",
                    background: selectedRecipients.includes(r.id) ? "#5c4530" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, flexShrink: 0,
                  }}>
                    {selectedRecipients.includes(r.id) && "✓"}
                  </div>
                  <div style={S.checkLabel}>{r.name} <span style={{ color: "#8a7560" }}>({r.email})</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button style={S.submitBtn} onClick={handleSubmit}>Save Contact Log</button>
        <button style={S.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [elder, setElder] = useState(null);
  const [view, setView] = useState("dashboard");
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [preselectedHousehold, setPreselectedHousehold] = useState(null);
  const [logs, setLogs] = useState(CONTACT_LOG_INIT);
  const [showSuccess, setShowSuccess] = useState(false);

  const households = elder ? (HOUSEHOLDS[elder.id] || []) : [];

  function handleLogin(e) { setElder(e); setView("dashboard"); }
  function handleLogout() { setElder(null); setView("dashboard"); }

  function openLogForm(household = null) {
    setPreselectedHousehold(household);
    setView("logForm");
  }

  function handleSaveLog(entry) {
    setLogs(prev => [...prev, entry]);
    setView("dashboard");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  if (!elder) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={S.app}>
      <Header elder={elder} onLogout={handleLogout} />
      {showSuccess && (
        <div style={{ maxWidth: 480, margin: "12px auto 0", padding: "0 16px" }}>
          <div style={S.successBanner}>✓ Contact logged successfully!</div>
        </div>
      )}
      {view === "dashboard" && (
        <Dashboard
          elder={elder}
          households={households}
          logs={logs}
          onSelectHousehold={h => { setSelectedHousehold(h); setView("household"); }}
          onLogContact={() => openLogForm(null)}
        />
      )}
      {view === "household" && selectedHousehold && (
        <HouseholdDetail
          household={selectedHousehold}
          logs={logs}
          onBack={() => setView("dashboard")}
          onLogContact={h => openLogForm(h)}
        />
      )}
      {view === "logForm" && (
        <LogContactForm
          households={households}
          preselectedHousehold={preselectedHousehold}
          elderId={elder.id}
          onSave={handleSaveLog}
          onCancel={() => setView(selectedHousehold ? "household" : "dashboard")}
        />
      )}
    </div>
  );
}