/* ─── Reviews — paste this entire function to REPLACE the existing Reviews() function in Dashboard.jsx ─── */

function Reviews() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState(0); // 0 = all

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r    = await fetch(`${API}/reviews/mine`, { headers: authHead() });
      const json = await r.json();
      if (r.ok) setData(json);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="section-content">
        <div className="alert-banner alert-ok" style={{ textAlign: "center" }}>⏳ Loading reviews…</div>
      </div>
    );
  }

  const reviews   = data?.reviews  || [];
  const avg       = data?.avg       || null;
  const total     = data?.total     || 0;
  const breakdown = data?.breakdown || [1,2,3,4,5].map(n => ({ stars: n, count: 0 }));

  const displayed = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);

  const starStr = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Reviews</h2>
          <p className="section-sub">What patients say about your clinic</p>
        </div>
        <button className="btn-outline" onClick={load}>🔄 Refresh</button>
      </div>

      {total === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div style={{ fontSize: 44, marginBottom: 12 }}>⭐</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No reviews yet</div>
            <p style={{ color: "var(--gray-400)", fontSize: 13 }}>
              Reviews will appear here once patients rate your clinic from the public page.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="reviews-top" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, marginBottom: 18 }}>
            <div className="glass-card avg-rating" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center" }}>
              <h2 className="big-rating" style={{ fontSize: 52, fontWeight: 800, color: "var(--teal-800)", lineHeight: 1 }}>{avg}</h2>
              <div style={{ fontSize: 22, color: "var(--amber)", letterSpacing: 2 }}>{starStr(Math.round(Number(avg)))}</div>
              <p style={{ color: "var(--gray-400)", fontSize: 12 }}>{total} review{total !== 1 ? "s" : ""}</p>
            </div>

            <div className="glass-card">
              {[5, 4, 3, 2, 1].map(n => {
                const c = breakdown.find(b => b.stars === n)?.count || 0;
                return (
                  <div
                    key={n}
                    className="rating-bar"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 12.5, color: "var(--gray-600)", cursor: "pointer" }}
                    onClick={() => setFilter(filter === n ? 0 : n)}
                  >
                    <span style={{ minWidth: 24, fontWeight: filter === n ? 800 : 400, color: filter === n ? "var(--teal-700)" : "inherit" }}>{n}★</span>
                    <div style={{ flex: 1, height: 7, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${total ? (c / total) * 100 : 0}%`, background: filter === n ? "var(--teal-700)" : "linear-gradient(90deg,var(--teal-600),var(--teal-400))", borderRadius: 4, transition: "width .5s" }} />
                    </div>
                    <span style={{ minWidth: 24, textAlign: "right", fontWeight: 600 }}>{c}</span>
                  </div>
                );
              })}
              {filter !== 0 && (
                <button className="link-btn" style={{ marginTop: 8, fontSize: 12 }} onClick={() => setFilter(0)}>
                  ✕ Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Filter hint */}
          {filter !== 0 && (
            <div className="alert-banner alert-ok" style={{ marginBottom: 14, fontSize: 13 }}>
              Showing {displayed.length} review{displayed.length !== 1 ? "s" : ""} for {filter}★
            </div>
          )}

          {/* Reviews list */}
          <div className="reviews-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayed.length === 0 ? (
              <div className="glass-card"><div className="empty-state">No {filter}★ reviews yet.</div></div>
            ) : (
              displayed.map((r, i) => (
                <div className="glass-card" key={i} style={{ padding: 20 }}>
                  <div className="review-top" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div className="review-avatar" style={{ width: 38, height: 38, background: "var(--teal-100)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--teal-800)", fontSize: 15, flexShrink: 0 }}>
                      {(r.patientName || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: "var(--gray-900)" }}>{r.patientName || "Anonymous"}</strong>
                      {r.mobile && <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 1 }}>📞 {r.mobile}</p>}
                      <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 1 }}>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 18, color: "var(--amber)" }}>
                      {starStr(r.rating)}
                    </div>
                  </div>
                  {r.text && (
                    <p style={{ fontSize: 13.5, color: "var(--gray-600)", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{r.text}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}