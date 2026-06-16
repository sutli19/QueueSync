import { useEffect, useState, useCallback } from "react";
import "../styles/Dashboard.css";

const API = "https://queuesync.onrender.com/api";
const authHead = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHead = () => ({ "Content-Type": "application/json", ...authHead() });

/* ── wait time calculator — exact copy from admin Dashboard ── */
function calcWaitTimes(waitingQueue) {
  const AVG = 10;
  const EXT = 5;
  if (!waitingQueue.length) return [];
  const now = Date.now();
  const first = waitingQueue[0];
  let remaining0 = AVG;
  if (first.consultStart) {
    const elapsed = (now - new Date(first.consultStart).getTime()) / 60000;
    if (elapsed < AVG) {
      remaining0 = Math.max(1, Math.round(AVG - elapsed));
    } else {
      const overElapsed = elapsed - AVG;
      remaining0 = Math.max(1, Math.round(EXT - (overElapsed % EXT)));
    }
  }
  const times = [remaining0];
  for (let i = 1; i < waitingQueue.length; i++) times.push(remaining0 + i * AVG);
  return times;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (
    <div className="live-clock">
      <span className="lc-time">
        {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}:{String(now.getSeconds()).padStart(2,"0")}
      </span>
      <span className="lc-date">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── FIX: Billing modal on Done (same as admin) ── */
function BillingDoneModal({ patient, onConfirm, onClose }) {
  const [bill, setBill] = useState({ visitCharge: "", injectionCharge: "", medicineCharge: "", notes: "" });
  const total = (Number(bill.visitCharge)||0) + (Number(bill.injectionCharge)||0) + (Number(bill.medicineCharge)||0) + (Number(bill.notes)||0);
  return (
    <Modal title={`✓ Done — ${patient.patientName}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>
        Enter billing details before marking done. You can skip and fill later from Patient Records.
      </p>
      <div className="form-grid">
        <div className="form-field"><label>Visit Charge (₹)</label><input type="number" value={bill.visitCharge} onChange={e=>setBill({...bill,visitCharge:e.target.value})} placeholder="e.g. 200" autoFocus/></div>
        <div className="form-field"><label>Injection Charge (₹)</label><input type="number" value={bill.injectionCharge} onChange={e=>setBill({...bill,injectionCharge:e.target.value})} placeholder="e.g. 50"/></div>
        <div className="form-field"><label>Medicine Charge (₹)</label><input type="number" value={bill.medicineCharge} onChange={e=>setBill({...bill,medicineCharge:e.target.value})} placeholder="e.g. 150"/></div>
        <div className="form-field"><label>Extra Charges (₹)</label><input type="number" value={bill.notes} onChange={e=>setBill({...bill,notes:e.target.value})} placeholder="e.g. 50"/></div>
      </div>
      {total > 0 && <div className="bill-total-row">💰 Total: <strong>₹{total}</strong></div>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={() => onConfirm(null)}>Skip — Mark Done</button>
        <button className="btn-primary" onClick={() => onConfirm(bill)} disabled={total === 0}>💾 Save Bill &amp; Done</button>
      </div>
    </Modal>
  );
}

/* ── FIX: Add Patient — mobile only digits, max 10 ── */
function AddPatientModal({ onClose, onAdded }) {
  const [form, setForm]   = useState({ patientName: "", mobile: "", gender: "Male", age: "" });
  const [errs, setErrs]   = useState({});
  const [loading, setLoading] = useState(false);
  const sf = (k, v) => { setForm(p => ({...p, [k]: v})); setErrs(p => ({...p, [k]: ""})); };
  const validate = () => {
    const e = {};
    if (!form.patientName.trim()) e.patientName = "Patient name is required";
    if (!form.mobile) e.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Must be exactly 10 digits";
    if (!form.age || Number(form.age) < 1) e.age = "Please enter a valid age";
    setErrs(e);
    return !Object.keys(e).length;
  };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/queue/add`, { method: "POST", headers: jsonHead(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      await onAdded();
      onClose();
    } catch { alert("Could not add patient. Check server."); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="🏥 Add Walk-In Patient" onClose={onClose}>
      <div className="form-grid">
        <div className="form-field full">
          <label>Patient Name *</label>
          <input value={form.patientName} onChange={e => sf("patientName", e.target.value)} placeholder="Full name" autoFocus />
          {errs.patientName && <span className="field-err">{errs.patientName}</span>}
        </div>
        <div className="form-field">
          <label>Mobile * (10 digits)</label>
          <input
            value={form.mobile}
            onChange={e => sf("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit number"
            inputMode="numeric"
            maxLength={10}
          />
          {errs.mobile && <span className="field-err">{errs.mobile}</span>}
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={form.gender} onChange={e => sf("gender", e.target.value)}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div className="form-field">
          <label>Age *</label>
          <input type="number" value={form.age} onChange={e => sf("age", e.target.value)} placeholder="Age" min={1} max={120} />
          {errs.age && <span className="field-err">{errs.age}</span>}
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? "Adding…" : "➕ Add to Queue"}</button>
      </div>
    </Modal>
  );
}

/* ── Live Queue section ── */
function RLiveQueue({ queue, onMarkDone, onCancelPatient, onAddPatient, clinicOpen, onToggleClinic, canChangeStatus }) {
  const waiting  = queue.filter(p => p.status === "waiting");
  const done     = queue.filter(p => p.status === "done");
  const AVG_TIME = 10;
  const waitTimes = calcWaitTimes(waiting);

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Live Queue</h2>
          <p className="section-sub">Real-time queue — click ✓ Done when patient leaves</p>
        </div>
        <div className="header-actions">
          <LiveClock />
          {canChangeStatus && (
            <div
              className={`stat-card clinic-toggle${!clinicOpen ? " closed" : ""}`}
              style={{ cursor: "pointer", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 8 }}
              onClick={onToggleClinic}
            >
              <span style={{ fontSize: 20 }}>{clinicOpen ? "🟢" : "🔴"}</span>
              <div>
                <p className="stat-label" style={{ fontSize: 10 }}>Clinic</p>
                <p className={`stat-num ${clinicOpen ? "open-text" : "closed-text"}`} style={{ fontSize: 13, fontWeight: 700 }}>{clinicOpen ? "Open" : "Closed"}</p>
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={onAddPatient}>➕ Add Patient</button>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-head">
          <h4>⏳ Waiting ({waiting.length})</h4>
          <span className="live-badge">● Live</span>
        </div>
        {waiting.length === 0
          ? <div className="empty-state">✨ Queue is clear!</div>
          : waiting.map((p, i) => (
            <div className="queue-row" key={p._id}>
              <div className="token-badge lg">T-{String(p.tokenNumber || i + 1).padStart(2, "0")}</div>
              <div className="patient-info">
                <strong>{p.patientName}</strong>
                <span>
                  {p.mobile || "—"} &nbsp;·&nbsp; {p.gender || "—"} &nbsp;·&nbsp; Age {p.age || "—"}
                  {p.source === "appointment" && <span className="appt-tag"> 📅 Appt</span>}
                </span>
              </div>
              <div className="queue-meta">
                {p.isReturning && <span className="returning-tag">↩ Return</span>}
                <span className="wait-chip">~{waitTimes[i] ?? AVG_TIME} min</span>
              </div>
              <button className="done-btn" onClick={() => onMarkDone(p._id)}>✓ Done</button>
              <button onClick={() => onCancelPatient(p._id)} style={{background:"rgba(220,38,38,.08)",border:"1.5px solid rgba(220,38,38,.25)",color:"#dc2626",padding:"8px 14px",borderRadius:50,fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>✕ No Show</button>
            </div>
          ))
        }
      </div>

      {done.length > 0 && (
        <div className="glass-card" style={{ marginTop: 14 }}>
          <div className="card-head"><h4>✅ Completed Today ({done.length})</h4></div>
          {done.map(p => (
            <div className="done-row" key={p._id}>
              <span className="done-check">✓</span>
              <span className="token-badge sm">T-{String(p.tokenNumber || "").padStart(2, "0")}</span>
              <span className="done-name">{p.patientName}</span>
              <span className="muted" style={{ fontSize: 11 }}>{p.gender} · Age {p.age}</span>
              {p.consultDuration > 0 && <span className="wait-chip">{p.consultDuration} min</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Appointments section — identical to admin ── */
function RAppointments({ onQueueRefresh }) {
  const [appts, setAppts]         = useState([]);
  const [filter, setFilter]       = useState("all");
  const [selDate, setSelDate]     = useState(new Date().toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: "", mobile: "", gender: "Male", age: "", date: new Date().toISOString().split("T")[0], time: "", reason: "" });
  const [errs, setErrs]           = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loadingBook, setLoadingBook] = useState(false);

  const sf = (k, v) => { setForm(p => ({...p, [k]: v})); setErrs(p => ({...p, [k]: ""})); };

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}/appointments/by-date?date=${selDate}`, { headers: authHead() });
      const data = await r.json();
      const now = new Date();
      const processed = (Array.isArray(data) ? data : []).map(a => {
        if (a.status === "scheduled" && a.time) {
          const [h, m] = a.time.split(":").map(Number);
          const scheduled = new Date();
          scheduled.setHours(h, m, 0, 0);
          if (now > scheduled) return { ...a, status: "delayed" };
        }
        return a;
      });
      setAppts(processed);
    } catch { setAppts([]); }
  }, [selDate]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/appointments/status/${id}`, { method: "PATCH", headers: jsonHead(), body: JSON.stringify({ status }) });
    load(); onQueueRefresh?.();
  };

  /* FIX: use /appointments/arrived/:id to prevent duplicate QT tokens */
  const markArrived = async (a) => {
    const r = await fetch(`${API}/appointments/arrived/${a._id}`, { method: "PATCH", headers: authHead() });
    const data = await r.json();
    if (!r.ok) { alert(data.message); return; }
    await load(); onQueueRefresh?.();
  };

  const validateBook = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Patient name is required";
    if (!form.mobile) e.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Must be exactly 10 digits";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const book = async () => {
    if (!validateBook()) return;
    setLoadingBook(true); setServerErr("");
    try {
      const res = await fetch(`${API}/appointments/book`, { method: "POST", headers: jsonHead(), body: JSON.stringify(form) });
      const data = await res.json();
      if (data.alreadyBooked) { setServerErr(`⚠️ Slot already booked at ${form.time}`); setLoadingBook(false); return; }
      if (!res.ok) { setServerErr(data.message || "Failed"); setLoadingBook(false); return; }
      await load();
      setShowModal(false);
      setForm({ name: "", mobile: "", gender: "Male", age: "", date: new Date().toISOString().split("T")[0], time: "", reason: "" });
    } catch { setServerErr("Cannot reach server."); }
    setLoadingBook(false);
  };

  const SC = { scheduled: "#0f766e", arrived: "#3b82f6", completed: "#16a34a", cancelled: "#dc2626", delayed: "#f59e0b", no_show: "#6b7280" };
  const filtered = filter === "all" ? appts : appts.filter(a => a.status === filter);
  const C = { scheduled: 0, arrived: 0, completed: 0, cancelled: 0 };
  appts.forEach(a => { if (C[a.status] !== undefined) C[a.status]++; });

  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Appointments</h2><p className="section-sub">Book and manage patient appointments by date</p></div>
        <div className="header-actions">
          <input type="date" className="date-input" value={selDate} onChange={e => setSelDate(e.target.value)} />
          <button className="btn-primary" onClick={() => setShowModal(true)}>📅 Book Appointment</button>
        </div>
      </div>

      <div className="appt-stats">
        {[["Scheduled", C.scheduled, "#0f766e"], ["Arrived", C.arrived, "#3b82f6"], ["Completed", C.completed, "#16a34a"], ["Cancelled", C.cancelled, "#dc2626"]].map(([l, v, c]) => (
          <div className="glass-card appt-stat" key={l}><p className="stat-label">{l}</p><h3 style={{ color: c, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{v}</h3></div>
        ))}
      </div>

      <div className="filter-tabs">
        {["all", "scheduled", "arrived", "completed", "cancelled", "delayed", "no_show"].map(t => (
          <button key={t} className={`tab ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
            {t.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="glass-card">
        {filtered.length === 0
          ? <div className="empty-state">📅 No appointments for this date</div>
          : filtered.map((a, i) => {
            const isDelayed = a.status === "delayed";
            const arrivedTime = a.arrivedAt ? new Date(a.arrivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
            let delayMins = null;
            if (isDelayed && a.arrivedAt && a.time) {
              const [h, m] = a.time.split(":").map(Number);
              const scheduled = new Date(a.arrivedAt);
              scheduled.setHours(h, m, 0, 0);
              delayMins = Math.round((new Date(a.arrivedAt) - scheduled) / 60000);
            }
            return (
              <div className="appt-row" key={a._id || i}>
                <div className="appt-left">
                  <div className="token-badge">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <strong>{a.name || a.patientName}</strong>
                    <span className="muted"> · {a.mobile || "—"} · {a.gender || "—"}{a.reason ? ` · ${a.reason}` : ""}{a.doctor ? ` · Dr. ${a.doctor}` : ""}</span>
                  </div>
                </div>
                <div className="appt-right">
                  <span className="time-chip">⏰ {a.time}</span>
                  {isDelayed && delayMins !== null && (
                    <span style={{ background: "rgba(245,158,11,.15)", color: "#92400e", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
                      ⏳ {delayMins > 0 ? `${delayMins} min late` : "On time"}
                    </span>
                  )}
                  {isDelayed && arrivedTime && <span style={{ fontSize: 11, color: "var(--gray-500)" }}>Arrived {arrivedTime}</span>}
                  <span className="status-chip" style={{ background: SC[a.status] || "#0f766e" }}>{a.status}</span>
                  {a.status === "scheduled" && <>
                    <button className="arrived-btn" onClick={() => markArrived(a)}>👋 Arrived</button>
                    <button className="acr-btn acr-noshow" onClick={() => updateStatus(a._id, "no_show")}>🚫</button>
                    <button className="acr-btn acr-cancel" onClick={() => updateStatus(a._id, "cancelled")}>✕</button>
                  </>}
                  {a.status === "delayed" && <>
                    <button className="arrived-btn" onClick={() => markArrived(a)}>👋 Arrived</button>
                    <button className="acr-btn acr-cancel" onClick={() => updateStatus(a._id, "cancelled")}>✕</button>
                  </>}
                  {a.status === "arrived" && (
                    <button className="done-btn" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => updateStatus(a._id, "completed")}>✓ Done</button>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>

      {showModal && (
        <Modal title="📅 Book Appointment" onClose={() => { setShowModal(false); setErrs({}); setServerErr(""); }}>
          <div className="form-grid">
            <div className="form-field full">
              <label>Patient Name *</label>
              <input value={form.name} onChange={e => sf("name", e.target.value)} placeholder="Full name" autoFocus />
              {errs.name && <span className="field-err">{errs.name}</span>}
            </div>
            <div className="form-field">
              <label>Mobile * (10 digits)</label>
              <input
                value={form.mobile}
                onChange={e => sf("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                inputMode="numeric"
                maxLength={10}
              />
              {errs.mobile && <span className="field-err">{errs.mobile}</span>}
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select value={form.gender} onChange={e => sf("gender", e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => sf("age", e.target.value)} min={1} max={120} />
            </div>
            <div className="form-field">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={e => sf("date", e.target.value)} />
              {errs.date && <span className="field-err">{errs.date}</span>}
            </div>
            <div className="form-field">
              <label>Time *</label>
              <input type="time" value={form.time} onChange={e => sf("time", e.target.value)} />
              {errs.time && <span className="field-err">{errs.time}</span>}
            </div>
            <div className="form-field">
              <label>Reason</label>
              <input value={form.reason} onChange={e => sf("reason", e.target.value)} placeholder="e.g. Fever" />
            </div>
          </div>
          {serverErr && <div className="form-err">⚠️ {serverErr}</div>}
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => { setShowModal(false); setErrs({}); setServerErr(""); }}>Cancel</button>
            <button className="btn-primary" onClick={book} disabled={loadingBook}>{loadingBook ? "Booking…" : "✅ Confirm Booking"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Patient Records — restored Billing + Time columns, same as admin ── */
function RPatientRecords() {
  const [records, setRecords]   = useState([]);
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch]     = useState("");
  const [showBill, setShowBill] = useState(null);
  const [bill, setBill]         = useState({ visitCharge: "", injectionCharge: "", medicineCharge: "", notes: "" });
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${API}/queue/history?date=${date}`, { headers: authHead() }),
        fetch(`${API}/appointments/by-date?date=${date}`, { headers: authHead() }),
      ]);
      const qData = await qRes.json();
      const aData = await aRes.json();
      const qRecords = Array.isArray(qData) ? qData : [];
      const apptRecords = Array.isArray(aData)
        ? aData
            .filter(a => ["cancelled", "no_show"].includes(a.status))
            .filter(a => !qRecords.some(q => q.mobile === a.mobile && q.createdAt?.slice(0, 10) === date))
            .map(a => ({
              _id: a._id, patientName: a.name || a.patientName, mobile: a.mobile,
              gender: a.gender, age: a.age, status: a.status, tokenNumber: "—",
              createdAt: a.createdAt, source: "appointment", billing: null, consultDuration: 0,
            }))
        : [];
      setRecords([...qRecords, ...apptRecords]);
    } catch { setRecords([]); }
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r =>
    r.patientName?.toLowerCase().includes(search.toLowerCase()) || r.mobile?.includes(search)
  );

  const openBillModal = (r) => {
    setShowBill(r);
    setBill({ visitCharge: r.billing?.visitCharge ?? "", injectionCharge: r.billing?.injectionCharge ?? "", medicineCharge: r.billing?.medicineCharge ?? "", notes: r.billing?.notes ?? "" });
  };

  const saveBill = async () => {
    const payload = {
      visitCharge: Number(bill.visitCharge) || 0,
      injectionCharge: Number(bill.injectionCharge) || 0,
      medicineCharge: Number(bill.medicineCharge) || 0,
      notes: bill.notes || "",
    };
    const res = await fetch(`${API}/queue/billing/${showBill._id}`, {
      method: "PATCH", headers: jsonHead(), body: JSON.stringify(payload)
    }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      setRecords(prev => prev.map(r => r._id === showBill._id ? data.patient : r));
    }
    setShowBill(null);
    load();
  };

  const pendingBillingCount = filtered.filter(r => r.billing?.billingPending && !r.billing?.isPaid).length;

  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Patient Records</h2><p className="section-sub">Day-wise history, consultation times &amp; billing</p></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {pendingBillingCount > 0 && <div className="alert-warn" style={{ padding: "6px 14px", borderRadius: 50, fontSize: 13, marginBottom: 0 }}>⚠️ {pendingBillingCount} billing pending</div>}
        </div>
      </div>
      <div className="records-toolbar">
        <input className="search-input" placeholder="🔍 Search name or mobile…" value={search} onChange={e => setSearch(e.target.value)} />
        <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} />
        <span className="record-count">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="glass-card table-card">
        <table className="records-table">
          <thead>
            <tr><th>#</th><th>Token</th><th>Name</th><th>Gender</th><th>Age</th><th>Mobile</th><th>Status</th><th>Consult</th><th>Billing</th><th>Added</th></tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={10} className="empty-row">⏳ Loading…</td></tr>
              : filtered.length === 0
              ? <tr><td colSpan={10} className="empty-row">📋 No records for this date</td></tr>
              : filtered.map((r, i) => {
                const b = r.billing || {};
                const amt = Number(b.visitCharge || 0) + Number(b.injectionCharge || 0) + Number(b.medicineCharge || 0);
                const isPending = (b.billingPending === true && !b.isPaid) || (r.status === "done" && amt === 0 && !b.isPaid);
                return (
                  <tr key={r._id || i} className={isPending ? "billing-pending-row" : ""}>
                    <td className="muted">{i + 1}</td>
                    <td><span className="token-badge sm">T-{String(r.tokenNumber || i + 1).padStart(2, "0")}</span></td>
                    <td><strong>{r.patientName}</strong>{r.isReturning && <span className="returning-tag" style={{ marginLeft: 5 }}>↩</span>}</td>
                    <td>{r.gender || "—"}</td>
                    <td>{r.age || "—"}</td>
                    <td>{r.mobile || "—"}</td>
                    <td><span className={`status-chip ${r.status}`}>{r.status}</span></td>
                    <td className="muted">{r.consultDuration > 0 ? `${r.consultDuration} min` : "—"}</td>
                    <td>
                      {amt > 0
                        ? <><span className="bill-chip">₹{amt}</span><button className="bill-btn" style={{ marginLeft: 6 }} onClick={() => openBillModal(r)}>✏️</button></>
                        : isPending
                          ? <button className="bill-btn" style={{ borderColor: "var(--amber)", color: "#92400e" }} onClick={() => openBillModal(r)}>⚠️ Fill Bill</button>
                          : <button className="bill-btn" onClick={() => openBillModal(r)}>+ Bill</button>
                      }
                    </td>
                    <td className="muted">{r.createdAt ? new Date(r.createdAt).toLocaleTimeString() : "—"}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {showBill && (
        <Modal title={`💰 Billing — ${showBill.patientName}`} onClose={() => setShowBill(null)}>
          <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 12 }}>
            Token T-{String(showBill.tokenNumber || "").padStart(2, "0")} · {showBill.gender || ""} · Age {showBill.age || "—"} · {showBill.mobile || ""}
          </div>
          <div className="form-grid">
            <div className="form-field"><label>Visit Charge (₹)</label><input type="number" value={bill.visitCharge} onChange={e => setBill({...bill, visitCharge: e.target.value})} placeholder="200" autoFocus /></div>
            <div className="form-field"><label>Injection Charge (₹)</label><input type="number" value={bill.injectionCharge} onChange={e => setBill({...bill, injectionCharge: e.target.value})} placeholder="50" /></div>
            <div className="form-field"><label>Medicine Charge (₹)</label><input type="number" value={bill.medicineCharge} onChange={e => setBill({...bill, medicineCharge: e.target.value})} placeholder="150" /></div>
            <div className="form-field"><label>Extra Charges (₹)</label><input type="number" value={bill.notes} onChange={e => setBill({...bill, notes: e.target.value})} placeholder="e.g. 50" /></div>
          </div>
          <div className="bill-total-row">Total: <strong>₹{(Number(bill.visitCharge)||0) + (Number(bill.injectionCharge)||0) + (Number(bill.medicineCharge)||0) + (Number(bill.notes)||0)}</strong></div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowBill(null)}>Cancel</button>
            <button className="btn-primary" onClick={saveBill}>💾 Save Billing</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Standalone Book Appointment Form (used in modal from Dashboard) ── */
function RBookApptForm({ onClose, onBooked }) {
  const [form, setForm] = useState({ name: "", mobile: "", gender: "Male", age: "", date: new Date().toISOString().split("T")[0], time: "", reason: "" });
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);
  const sf = (k, v) => { setForm(p => ({...p, [k]: v})); setErrs(p => ({...p, [k]: ""})); };
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Patient name is required";
    if (!form.mobile) e.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = "Must be exactly 10 digits";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    setErrs(e); return !Object.keys(e).length;
  };
  const book = async () => {
    if (!validate()) return;
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/appointments/book`, { method: "POST", headers: jsonHead(), body: JSON.stringify(form) });
      const data = await res.json();
      if (data.alreadyBooked) { setServerErr(`⚠️ Slot already booked at ${form.time}`); setLoading(false); return; }
      if (!res.ok) { setServerErr(data.message || "Failed"); setLoading(false); return; }
      onBooked();
    } catch { setServerErr("Cannot reach server."); }
    setLoading(false);
  };
  return (
    <div className="form-grid">
      <div className="form-field full"><label>Patient Name *</label><input value={form.name} onChange={e => sf("name", e.target.value)} placeholder="Full name" autoFocus />{errs.name && <span className="field-err">{errs.name}</span>}</div>
      <div className="form-field"><label>Mobile * (10 digits)</label><input value={form.mobile} onChange={e => sf("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} placeholder="10-digit number" />{errs.mobile && <span className="field-err">{errs.mobile}</span>}</div>
      <div className="form-field"><label>Gender</label><select value={form.gender} onChange={e => sf("gender", e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
      <div className="form-field"><label>Age</label><input type="number" value={form.age} onChange={e => sf("age", e.target.value)} min={1} max={120} /></div>
      <div className="form-field"><label>Date *</label><input type="date" value={form.date} onChange={e => sf("date", e.target.value)} />{errs.date && <span className="field-err">{errs.date}</span>}</div>
      <div className="form-field"><label>Time *</label><input type="time" value={form.time} onChange={e => sf("time", e.target.value)} />{errs.time && <span className="field-err">{errs.time}</span>}</div>
      <div className="form-field full"><label>Reason</label><input value={form.reason} onChange={e => sf("reason", e.target.value)} placeholder="e.g. Fever" /></div>
      {serverErr && <div className="form-err full">⚠️ {serverErr}</div>}
      <div className="modal-actions" style={{ gridColumn: "1/-1" }}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={book} disabled={loading}>{loading ? "Booking…" : "✅ Confirm Booking"}</button>
      </div>
    </div>
  );
}

/* ── Dashboard overview — exact same as admin Overview ── */
function ROverview({ queue, stats, appointments, avgConsultTime, clinicOpen, onToggleClinic, canChangeStatus, onAddPatient, onBookAppt, setSection, onMarkDone, onCancelPatient, onApptStatusChange }) {
  const waiting   = queue.filter(p => p.status === "waiting");
  const completed = stats.find(s => s._id === "done")?.count || 0;
  const total     = queue.length;
  const waitTimes = calcWaitTimes(waiting);
  const maxWait   = waitTimes.length ? waitTimes[waitTimes.length - 1] : 0;
  const todayAppts = appointments.filter(a => a.status !== "cancelled").sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const pendingCount = appointments.filter(a => a.status === "scheduled").length;
  const SC = { scheduled: "#0f766e", arrived: "#3b82f6", completed: "#16a34a", cancelled: "#dc2626", delayed: "#f59e0b" };

  const markArrived = async (a) => {
    const res = await fetch(`${API}/appointments/arrived/${a._id}`, { method: "PATCH", headers: authHead() });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    onApptStatusChange();
  };
  const cancelAppt = async (id) => {
    await fetch(`${API}/appointments/status/${id}`, { method: "PATCH", headers: jsonHead(), body: JSON.stringify({ status: "cancelled" }) });
    onApptStatusChange();
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-sub">Here's what's happening at the clinic today</p>
        </div>
        <div className="header-actions">
          <LiveClock />
          <button className="btn-primary" onClick={onAddPatient}>➕ Add Walk-In</button>
          <button className="btn-outline" onClick={onBookAppt}>📅 Book Appointment</button>
        </div>
      </div>

      {avgConsultTime > 0 && (
        <div className={`alert-banner ${avgConsultTime > 14 ? "alert-warn" : "alert-ok"}`}>
          <strong>⏱ Avg consultation today: {avgConsultTime} min {avgConsultTime > 14 ? "— running longer ⚠️" : "— on track 👍"}</strong>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card teal"><span className="stat-icon">👥</span><div><p className="stat-label">In Queue</p><h3 className="stat-num">{waiting.length}</h3></div></div>
        <div className="stat-card amber"><span className="stat-icon">⏱</span><div><p className="stat-label">Max Wait</p><h3 className="stat-num">{maxWait}<span className="stat-unit"> min</span></h3></div></div>
        <div className="stat-card purple"><span className="stat-icon">📋</span><div><p className="stat-label">Today's Patients</p><h3 className="stat-num">{total}</h3></div></div>
        <div className="stat-card green"><span className="stat-icon">✅</span><div><p className="stat-label">Completed</p><h3 className="stat-num">{completed}</h3></div></div>
        {canChangeStatus && (
          <div className={`stat-card clinic-toggle${!clinicOpen ? " closed" : ""}`} onClick={onToggleClinic} style={{ cursor: "pointer" }}>
            <span className="stat-icon">{clinicOpen ? "🟢" : "🔴"}</span>
            <div><p className="stat-label">Clinic Status</p><h3 className={`stat-num ${clinicOpen ? "open-text" : "closed-text"}`} style={{ fontSize: 17 }}>{clinicOpen ? "Open" : "Closed"}</h3><p className="stat-toggle-hint">Click to toggle</p></div>
          </div>
        )}
      </div>

      <div className="overview-lower-2col">
        <div className="glass-card">
          <div className="card-head"><h4>🏥 Live Queue Preview</h4><button className="link-btn" onClick={() => setSection("queue")}>View All →</button></div>
          {waiting.length === 0
            ? <div className="empty-state">✨ No patients waiting right now</div>
            : waiting.slice(0, 8).map((p, i) => (
              <div className="mini-patient" key={p._id}>
                <div className="token-badge">T-{String(p.tokenNumber || i + 1).padStart(2, "00")}</div>
                <span className="patient-name">{p.patientName}</span>
                {p.isReturning && <span className="returning-tag">↩</span>}
                <span className="wait-chip">~{waitTimes[i] ?? avgConsultTime} min</span>
                <button className="mini-done-btn" onClick={() => onMarkDone(p._id)}>✓</button>
                <button onClick={() => onCancelPatient(p._id)} style={{ background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", color: "#dc2626", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
              </div>
            ))
          }
        </div>
        <div className="glass-card">
          <div className="card-head">
            <h4>📅 Today's Appointments{pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}</h4>
            <button className="link-btn" onClick={() => setSection("appointments")}>View All →</button>
          </div>
          {todayAppts.length === 0
            ? <div className="empty-state">📅 No appointments today</div>
            : todayAppts.slice(0, 8).map((a, i) => (
              <div className="appt-compact-row" key={a._id || i}>
                <div className="acr-left">
                  <span className="token-badge sm">{String(i + 1).padStart(2, "0")}</span>
                  <div><strong className="acr-name">{a.name || a.patientName}</strong><span className="acr-meta">⏰ {a.time}{a.gender ? ` · ${a.gender}` : ""}</span></div>
                </div>
                <div className="acr-right">
                  <span className="status-chip" style={{ background: SC[a.status] || "#0f766e", fontSize: 9.5, padding: "2px 7px" }}>{a.status}</span>
                  {a.status === "scheduled" && <button className="acr-btn acr-arrived" onClick={() => markArrived(a)}>👋</button>}
                  {(a.status === "scheduled" || a.status === "delayed") && <button className="acr-btn acr-cancel" onClick={() => cancelAppt(a._id)}>✕</button>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

function LockedSection({ name }) {
  return (
    <div className="section-content">
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h3 style={{ marginTop: 16, color: "var(--teal-900)" }}>Access Restricted</h3>
        <p style={{ color: "var(--gray-500)", marginTop: 8 }}>You don't have permission to view <strong>{name}</strong>.</p>
        <p style={{ color: "var(--gray-400)", fontSize: 13, marginTop: 4 }}>Contact your doctor to request access.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN — all fixes wired together
─────────────────────────────────────────────────────────────── */
export default function ReceptionistDashboard() {
  const [section, setSection]           = useState("overview");
  const [queue, setQueue]               = useState([]);
  const [stats, setStats]               = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [avgConsultTime, setAvgConsultTime] = useState(10);
  const [clinicOpen, setClinicOpen]     = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showBookAppt, setShowBookAppt] = useState(false);
  const [billingPatient, setBillingPatient] = useState(null);

  const [permissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("permissions") || "{}"); }
    catch { return {}; }
  });

  /* treat undefined permission as allowed (default-allow) */
  const can = (key) => permissions[key] !== false;

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API}/queue/today`, { headers: authHead() });
      const d   = await res.json();
      setQueue(Array.isArray(d) ? d : []);
    } catch { setQueue([]); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/queue/stats-today`, { headers: authHead() });
      const data = await r.json();
      setStats(data || []);
    } catch { setStats([]); }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/appointments/today`, { headers: authHead() });
      const d   = await res.json();
      setAppointments(Array.isArray(d) ? d : []);
    } catch { setAppointments([]); }
  }, []);

  const refreshAll = useCallback(() => { fetchQueue(); fetchStats(); fetchAppointments(); }, [fetchQueue, fetchStats, fetchAppointments]);

  /* Clinic status from server so both admin and receptionist see same state */
  const fetchClinicStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}/clinic/profile`, { headers: authHead() });
      const d = await r.json();
      if (d.isOpen !== undefined) setClinicOpen(d.isOpen);
    } catch {}
  }, []);

  /* Toggle saves to server — admin sees the change too */
  const toggleClinic = async () => {
    const newState = !clinicOpen;
    setClinicOpen(newState);
    try {
      await fetch(`${API}/clinic/info`, {
        method: "POST",
        headers: jsonHead(),
        body: JSON.stringify({ isOpen: newState }),
      });
    } catch {
      setClinicOpen(!newState);
      alert("Could not update clinic status. Check server.");
    }
  };

  /* Done → open BillingDoneModal (same as admin) */
  const markDone = (id) => {
    const patient = queue.find(p => p._id === id);
    if (patient) setBillingPatient(patient);
  };

  const cancelPatient = async (id) => {
    if (!window.confirm("Mark this patient as No Show?")) return;
    try {
      await fetch(`${API}/queue/cancel/${id}`, { method: "PATCH", headers: authHead() });
      await refreshAll();
    } catch { alert("Cannot reach server"); }
  };

  const confirmDone = async (bill) => {
    const id = billingPatient._id;
    setBillingPatient(null);
    try {
      const body = bill ? { ...bill } : { billingSkipped: true };
      const r = await fetch(`${API}/queue/done/${id}`, { method: "PATCH", headers: jsonHead(), body: JSON.stringify(body) });
      if (!r.ok) { const d = await r.json(); alert(d.message || "Error"); return; }
      const donePatient = queue.find(p => p._id === id);
      if (donePatient?.appointmentId) {
        await fetch(`${API}/appointments/status/${donePatient.appointmentId}`, {
          method: "PATCH", headers: jsonHead(), body: JSON.stringify({ status: "completed" })
        });
      }
      await refreshAll();
    } catch { alert("Cannot reach server"); }
  };

  useEffect(() => { refreshAll(); fetchClinicStatus(); }, [refreshAll, fetchClinicStatus]);
  useEffect(() => {
    const iv = setInterval(() => { refreshAll(); fetchClinicStatus(); }, 30000);
    return () => clearInterval(iv);
  }, [refreshAll, fetchClinicStatus]);

  const waitingCount = queue.filter(p => p.status === "waiting").length;
  const recepName = localStorage.getItem("name") || "Receptionist";

  const NAV = [
    { id: "overview",     label: "Dashboard",      icon: "📊", perm: "canViewDashboard" },
    { id: "queue",        label: "Live Queue",      icon: "🏥", perm: "canManageQueue" },
    { id: "appointments", label: "Appointments",    icon: "📅", perm: "canBookAppointment" },
    { id: "records",      label: "Patient Records", icon: "📋", perm: "canEditPatients" },
  ];

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-logo">
          <span className="db-logo-icon">⏱</span>
          <span>QueueSync</span>
        </div>
        <div className="db-badge-row">
          <span className="db-role-badge">Receptionist</span>
        </div>
        <nav className="db-nav">
          {NAV.map(item => {
            const allowed = can(item.perm);
            return (
              <button
                key={item.id}
                className={`db-nav-item ${section === item.id ? "active" : ""}`}
                onClick={() => setSection(item.id)}
                style={!allowed ? { opacity: 0.45 } : {}}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {!allowed && <span style={{ marginLeft: "auto", fontSize: 12 }}>🔒</span>}
                {item.id === "queue" && waitingCount > 0 && allowed && (
                  <span className="nav-badge">{waitingCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="db-sidebar-footer">
          <div className="db-user">
            <div className="db-avatar" style={{ background: "var(--teal-600)" }}>
              {recepName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="db-user-name">{recepName}</p>
              <p className="db-user-role">{clinicOpen ? "🟢 Clinic Open" : "🔴 Clinic Closed"}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="db-main">
        {section === "overview" && (
          can("canViewDashboard")
            ? <ROverview queue={queue} stats={stats} appointments={appointments} avgConsultTime={avgConsultTime} clinicOpen={clinicOpen} onToggleClinic={toggleClinic} canChangeStatus={can("canChangeStatus")} onAddPatient={() => setShowAddPatient(true)} onBookAppt={() => setShowBookAppt(true)} setSection={setSection} onMarkDone={markDone} onCancelPatient={cancelPatient} onApptStatusChange={refreshAll} />
            : <LockedSection name="Dashboard" />
        )}
        {section === "queue" && (
          can("canManageQueue")
            ? <RLiveQueue queue={queue} onMarkDone={markDone} onCancelPatient={cancelPatient} onAddPatient={() => setShowAddPatient(true)} clinicOpen={clinicOpen} onToggleClinic={toggleClinic} canChangeStatus={can("canChangeStatus")} />
            : <LockedSection name="Live Queue" />
        )}
        {section === "appointments" && (
          can("canBookAppointment")
            ? <RAppointments onQueueRefresh={refreshAll} />
            : <LockedSection name="Appointments" />
        )}
        {section === "records" && (
          can("canEditPatients")
            ? <RPatientRecords />
            : <LockedSection name="Patient Records" />
        )}
      </main>

      {showAddPatient && (
        <AddPatientModal onClose={() => setShowAddPatient(false)} onAdded={refreshAll} />
      )}
      {showBookAppt && (
        <Modal title="📅 Book Appointment" onClose={() => setShowBookAppt(false)}>
          <RBookApptForm onClose={() => setShowBookAppt(false)} onBooked={() => { setShowBookAppt(false); refreshAll(); }} />
        </Modal>
      )}
      {billingPatient && (
        <BillingDoneModal patient={billingPatient} onConfirm={confirmDone} onClose={() => setBillingPatient(null)} />
      )}
    </div>
  );
}