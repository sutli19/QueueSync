import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Config ─── */
const API = "http://localhost:5000/api";

/* ─── Inline CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:root {
  --teal-900:#0a3d38;--teal-800:#0d5c55;--teal-700:#0f766e;
  --teal-600:#0d9488;--teal-500:#14b8a6;--teal-400:#2dd4bf;--teal-300:#5eead4;
  --teal-100:#ccfbf1;--teal-50:#f0fdf9;
  --amber:#f59e0b;--green:#16a34a;--red:#dc2626;
  --bg:#e8f5f2;--card:#ffffff;--border:#c8e8e2;
  --text-main:#0d3d36;--text-sub:#3d7a72;--text-muted:#7aada6;
  --r:18px;--rs:10px;
  --font:'Sora',sans-serif;--mono:'DM Mono',monospace;
  --ease:cubic-bezier(.34,1.56,.64,1);
  --shadow:0 4px 20px rgba(13,148,136,.10);
  --shadow-lg:0 12px 40px rgba(13,148,136,.18);
}

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

.pq-root {
  min-height:100vh;
  background:var(--bg);
  font-family:var(--font);
  color:var(--text-main);
  overflow-x:hidden;
}

/* ─── NAV ─── */
.pq-nav {
  position:fixed; top:0; left:0; right:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 40px;
  background:rgba(255,255,255,.88);
  backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  box-shadow:0 2px 16px rgba(13,148,136,.07);
}
.pq-logo {
  display:flex; align-items:center; gap:10px;
  font-size:18px; font-weight:800; color:var(--teal-800); letter-spacing:-.4px;
  cursor:pointer; text-decoration:none;
}
.pq-logo-icon {
  width:34px; height:34px;
  background:linear-gradient(135deg,var(--teal-700),var(--teal-500));
  border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:16px;
}
.pq-nav-btn {
  background:linear-gradient(135deg,var(--teal-700),var(--teal-600));
  border:none;
  color:#fff; padding:9px 22px; border-radius:50px;
  font-family:var(--font); font-size:13px; font-weight:700;
  cursor:pointer; transition:all .2s;
  box-shadow:0 4px 14px rgba(13,148,136,.28);
}
.pq-nav-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,148,136,.38); }

/* ─── HERO SECTION ─── */
.pq-hero {
  min-height:100vh;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:100px 24px 60px;
  position:relative; overflow:hidden;
  background:linear-gradient(150deg,#d4f0e8 0%,#e8f8f2 35%,#c8ece4 70%,#b8e6dc 100%);
}
.pq-hero-bg { position:absolute; inset:0; pointer-events:none; }
.bg-orb { position:absolute; border-radius:50%; filter:blur(90px); }
.bg-orb-1 { width:520px; height:520px; top:-120px; left:-160px; background:#a7e8d8; opacity:.55; }
.bg-orb-2 { width:440px; height:440px; bottom:-100px; right:-120px; background:#80d8c4; opacity:.45; }
.bg-orb-3 { width:280px; height:280px; top:35%; left:50%; background:#b2f0e0; opacity:.35; }
.bg-grid {
  position:absolute; inset:0;
  background-image:linear-gradient(rgba(13,148,136,.06) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(13,148,136,.06) 1px,transparent 1px);
  background-size:60px 60px;
}

.pq-hero-inner {
  position:relative; z-index:1;
  display:flex; flex-direction:column; align-items:center;
  max-width:780px; width:100%;
}

.pq-pill {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(13,148,136,.12); border:1.5px solid rgba(13,148,136,.3);
  color:var(--teal-700); font-size:12.5px; font-weight:700; letter-spacing:.4px;
  padding:6px 18px; border-radius:50px; margin-bottom:28px;
  animation: fadeDown .6s var(--ease) both;
  box-shadow:0 2px 12px rgba(13,148,136,.12);
}
.pill-pulse {
  width:7px; height:7px; border-radius:50%;
  background:var(--teal-600);
  animation:pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
@keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:none} }
@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:none} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideIn  { from{opacity:0;transform:translateY(12px) scale(.98)} to{opacity:1;transform:none} }
@keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.pq-heading {
  font-size:clamp(36px,6vw,64px);
  font-weight:800; line-height:1.08; letter-spacing:-2px;
  text-align:center; color:var(--teal-900); margin-bottom:18px;
  animation: fadeUp .7s var(--ease) .1s both;
}
.pq-heading em {
  font-style:normal;
  background:linear-gradient(135deg,var(--teal-700),var(--teal-500));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
}

.pq-sub {
  font-size:17px; color:var(--text-sub); text-align:center; line-height:1.7;
  max-width:520px; margin-bottom:42px;
  animation: fadeUp .7s var(--ease) .2s both;
}

/* ─── SEARCH BOX ─── */
.pq-search-wrap {
  width:100%; position:relative;
  animation: fadeUp .7s var(--ease) .3s both;
}
.pq-search-box {
  width:100%;
  background:rgba(255,255,255,.85);
  border:1.5px solid var(--border);
  border-radius:var(--r);
  padding:0 20px;
  display:flex; align-items:center; gap:14px;
  transition:border-color .25s, box-shadow .25s;
  box-shadow:var(--shadow);
}
.pq-search-box.focused {
  border-color:var(--teal-500);
  box-shadow:0 0 0 4px rgba(13,148,136,.12), var(--shadow-lg);
  background:#fff;
}
.search-icon { font-size:18px; flex-shrink:0; color:var(--teal-500); }
.pq-input {
  flex:1; background:none; border:none; outline:none;
  font-family:var(--font); font-size:17px; color:var(--text-main);
  padding:20px 0;
}
.pq-input::placeholder { color:var(--text-muted); }
.pq-nearby-btn {
  display:flex; align-items:center; gap:7px;
  background:linear-gradient(135deg,var(--teal-700),var(--teal-600));
  border:none;
  color:#fff; font-family:var(--font); font-size:12.5px; font-weight:700;
  padding:10px 18px; border-radius:50px; cursor:pointer; transition:all .2s;
  white-space:nowrap; flex-shrink:0;
  box-shadow:0 4px 14px rgba(13,148,136,.3);
}
.pq-nearby-btn:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(13,148,136,.38); }
.pq-nearby-btn.loading { opacity:.7; cursor:wait; transform:none; }

/* ─── DROPDOWN ─── */
.pq-dropdown {
  position:absolute; top:calc(100% + 8px); left:0; right:0; z-index:50;
  background:#fff;
  border:1.5px solid var(--border);
  border-radius:var(--r); overflow:hidden;
  box-shadow:var(--shadow-lg);
  animation:slideIn .18s var(--ease) both;
  max-height:440px; overflow-y:auto;
}
.pq-dropdown::-webkit-scrollbar { width:4px; }
.pq-dropdown::-webkit-scrollbar-thumb { background:var(--teal-100); border-radius:2px; }
.pq-drop-section { padding:10px 16px 6px; font-size:10.5px; font-weight:700; color:var(--text-muted); letter-spacing:.8px; text-transform:uppercase; }
.pq-drop-item {
  display:flex; align-items:center; gap:14px;
  padding:13px 18px; cursor:pointer; transition:background .14s;
  border-top:1px solid #f0faf8;
}
.pq-drop-item:hover { background:var(--teal-50); }
.pq-drop-avatar {
  width:42px; height:42px; border-radius:12px; flex-shrink:0;
  background:var(--teal-100);
  display:flex; align-items:center; justify-content:center;
  font-size:18px; overflow:hidden;
}
.pq-drop-avatar img { width:100%; height:100%; object-fit:cover; }
.pq-drop-name { font-size:14.5px; font-weight:700; color:var(--text-main); }
.pq-drop-meta { font-size:12px; color:var(--text-muted); margin-top:2px; }
.pq-drop-status {
  margin-left:auto; flex-shrink:0;
  font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px;
}
.drop-open  { background:rgba(22,163,74,.12); color:#15803d; }
.drop-closed{ background:rgba(220,38,38,.10); color:#dc2626; }
.pq-drop-empty { padding:28px; text-align:center; color:var(--text-muted); font-size:14px; }

/* ─── TIPS ─── */
.pq-tips {
  display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:20px;
  animation: fadeIn .8s .5s both;
}
.pq-tip { display:flex; align-items:center; gap:6px; font-size:12.5px; color:var(--text-sub); }
.tip-badge {
  background:rgba(255,255,255,.8); border:1.5px solid var(--border);
  color:var(--teal-700); font-size:11.5px; padding:3px 10px; border-radius:6px;
  font-family:var(--mono); font-weight:600;
}

/* ─── STATS ROW ─── */
.pq-stats {
  display:flex; gap:28px; margin-top:52px; flex-wrap:wrap; justify-content:center;
  animation: fadeIn 1s .6s both;
}
.pq-stat { text-align:center; }
.pq-stat-num { font-size:28px; font-weight:800; color:var(--teal-700); line-height:1; font-variant-numeric:tabular-nums; }
.pq-stat-label { font-size:11.5px; color:var(--text-sub); margin-top:4px; letter-spacing:.3px; }
.pq-stat-div { width:1px; height:36px; background:var(--border); align-self:center; }

/* ─── RESULTS ─── */
.pq-results { min-height:100vh; padding:40px 24px 80px; max-width:1100px; margin:0 auto; }
.pq-results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
.pq-results-title { font-size:22px; font-weight:800; color:var(--text-main); }
.pq-results-count { font-size:14px; color:var(--text-muted); }
.pq-back-btn {
  display:flex; align-items:center; gap:8px;
  background:#fff; border:1.5px solid var(--border);
  color:var(--text-sub); font-family:var(--font); font-size:13px; font-weight:600;
  padding:9px 18px; border-radius:50px; cursor:pointer; transition:all .2s;
  box-shadow:var(--shadow);
}
.pq-back-btn:hover { background:var(--teal-50); color:var(--teal-700); border-color:var(--teal-400); }

/* ─── CLINIC CARDS ─── */
.clinic-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; }
.clinic-card {
  background:#fff; border:1.5px solid var(--border); border-radius:var(--r); overflow:hidden;
  transition:transform .22s var(--ease), box-shadow .22s, border-color .22s;
  animation:slideIn .3s var(--ease) both; cursor:pointer; box-shadow:var(--shadow);
}
.clinic-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--teal-400); }
.cc-banner { height:130px; position:relative; background:linear-gradient(135deg,var(--teal-700),var(--teal-500)); overflow:hidden; }
.cc-banner img { width:100%; height:100%; object-fit:cover; }
.cc-banner-overlay { position:absolute; inset:0; background:linear-gradient(transparent 40%,rgba(0,0,0,.2)); }
.cc-status { position:absolute; top:12px; right:12px; font-size:11px; font-weight:700; padding:4px 11px; border-radius:20px; }
.cc-status.open   { background:rgba(22,163,74,.9);  color:#fff; }
.cc-status.closed { background:rgba(220,38,38,.85); color:#fff; }
.cc-body { padding:20px; }
.cc-name { font-size:18px; font-weight:800; color:var(--text-main); margin-bottom:4px; line-height:1.2; }
.cc-address { font-size:13px; color:var(--text-muted); margin-bottom:14px; }
.cc-doctor-row { display:flex; align-items:center; gap:12px; background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--rs); padding:12px 14px; margin-bottom:14px; }
.cc-doc-photo { width:44px; height:44px; border-radius:50%; flex-shrink:0; background:var(--teal-100); display:flex; align-items:center; justify-content:center; font-size:20px; overflow:hidden; border:2px solid var(--teal-300); }
.cc-doc-photo img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.cc-doc-name { font-size:14px; font-weight:700; color:var(--text-main); }
.cc-doc-qual { font-size:11.5px; color:var(--text-muted); margin-top:2px; }
.cc-doc-avail { margin-left:auto; font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
.avail-yes { background:rgba(13,148,136,.12); color:var(--teal-700); }
.avail-no  { background:rgba(220,38,38,.10);  color:#dc2626; }
.cc-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
.cc-chip { display:inline-flex; align-items:center; gap:4px; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:20px; }
.cc-chip-teal  { background:var(--teal-50);  color:var(--teal-700);  border:1.5px solid var(--teal-100); }
.cc-chip-amber { background:rgba(245,158,11,.08); color:#b45309; border:1.5px solid rgba(245,158,11,.2); }
.cc-chip-blue  { background:rgba(99,102,241,.08); color:#4338ca; border:1.5px solid rgba(99,102,241,.18); }
.cc-chip-gray  { background:#f3f4f6; color:#6b7280; border:1.5px solid #e5e7eb; }
.cc-divider { height:1px; background:var(--border); margin:14px 0; }
.cc-footer { display:flex; align-items:center; justify-content:space-between; }
.cc-hours { font-size:12px; color:var(--text-muted); }
.cc-view-btn {
  display:flex; align-items:center; gap:6px;
  background:linear-gradient(135deg,var(--teal-700),var(--teal-600));
  color:#fff; border:none; padding:9px 18px; border-radius:50px;
  font-family:var(--font); font-size:13px; font-weight:700;
  cursor:pointer; transition:all .2s; box-shadow:0 4px 12px rgba(13,148,136,.25);
}
.cc-view-btn:hover { transform:scale(1.04); box-shadow:0 6px 20px rgba(13,148,136,.38); }

/* ─── LIVE QUEUE BANNER ─── */
.lq-banner { border-radius:var(--r); overflow:hidden; margin-bottom:20px; border:1.5px solid var(--teal-300); box-shadow:0 4px 20px rgba(13,148,136,.15); }
.lq-banner-header { background:linear-gradient(135deg,var(--teal-700),var(--teal-600)); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; }
.lq-banner-title { color:#fff; font-size:13px; font-weight:700; letter-spacing:.3px; display:flex; align-items:center; gap:8px; }
.lq-live-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; animation:pulse 1.5s infinite; box-shadow:0 0 6px rgba(74,222,128,.6); }
.lq-refresh-btn {
  background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3);
  color:#fff; font-family:var(--font); font-size:11px; font-weight:600;
  padding:5px 12px; border-radius:20px; cursor:pointer; transition:all .2s;
  display:flex; align-items:center; gap:5px;
}
.lq-refresh-btn:hover { background:rgba(255,255,255,.3); }
.lq-refresh-btn:disabled { opacity:.5; cursor:wait; }
.lq-refresh-icon.spinning { animation:spin .7s linear infinite; display:inline-block; }

/* 2-col grid now (removed With Doctor) */
.lq-stats-grid { background:#fff; display:grid; grid-template-columns:1fr 1fr; gap:0; }
.lq-stat-tile { padding:22px 16px; text-align:center; border-right:1px solid var(--border); }
.lq-stat-tile:last-child { border-right:none; }
.lq-stat-value { font-size:40px; font-weight:800; line-height:1; font-family:var(--mono); color:var(--teal-700); font-variant-numeric:tabular-nums; }
.lq-stat-value.urgent { color:#dc2626; }
.lq-stat-value.clear  { color:#16a34a; }
.lq-stat-label { font-size:10.5px; color:var(--text-muted); margin-top:6px; font-weight:600; letter-spacing:.4px; text-transform:uppercase; }
.lq-stat-sub { font-size:11px; color:var(--text-sub); margin-top:3px; }

.lq-loading { background:#fff; padding:28px; text-align:center; }
.lq-loading-spinner { width:28px; height:28px; border-radius:50%; border:3px solid var(--teal-100); border-top-color:var(--teal-600); animation:spin .7s linear infinite; margin:0 auto 10px; }
.lq-loading-text { font-size:13px; color:var(--text-muted); }
.lq-error { background:#fff; padding:20px; text-align:center; font-size:13px; color:#dc2626; }
.lq-clinic-closed { background:rgba(220,38,38,.05); padding:18px 20px; display:flex; align-items:center; gap:12px; font-size:13.5px; color:#b91c1c; font-weight:600; border-top:1px solid rgba(220,38,38,.1); }
.lq-wait-bar { background:#fff; border-top:1px solid var(--border); padding:12px 20px; display:flex; align-items:center; gap:10px; }
.lq-wait-track { flex:1; height:6px; background:var(--teal-50); border-radius:3px; overflow:hidden; }
.lq-wait-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--teal-500),var(--teal-400)); transition:width .6s ease; }
.lq-wait-label { font-size:11.5px; color:var(--text-sub); font-weight:600; white-space:nowrap; }

/* ─── LAST UPDATED LINE ─── */
.lq-updated { background:#fff; border-top:1px solid var(--border); padding:8px 20px; font-size:11px; color:var(--text-muted); text-align:right; }

/* ─── RATING MODAL ─── */
.rate-overlay {
  position:fixed; inset:0; z-index:300;
  background:rgba(13,60,56,.5); backdrop-filter:blur(10px);
  display:flex; align-items:center; justify-content:center; padding:24px;
  animation:fadeIn .2s both;
}
.rate-box {
  background:#fff; border-radius:24px; padding:32px; width:100%; max-width:440px;
  box-shadow:0 24px 60px rgba(13,148,136,.25);
  animation:slideIn .3s var(--ease) both;
}
.rate-box h3 { font-size:19px; font-weight:800; color:var(--teal-900); margin-bottom:6px; }
.rate-box p  { font-size:13.5px; color:var(--text-sub); margin-bottom:24px; }
.star-row { display:flex; gap:10px; justify-content:center; margin-bottom:20px; }
.star-btn { background:none; border:none; font-size:36px; cursor:pointer; transition:transform .15s var(--ease); line-height:1; }
.star-btn:hover { transform:scale(1.25); }
.rate-input {
  width:100%; background:var(--teal-50); border:1.5px solid var(--teal-100);
  border-radius:var(--rs); padding:11px 14px; font-family:var(--font); font-size:14px;
  color:var(--text-main); outline:none; margin-bottom:12px;
  transition:border-color .2s;
}
.rate-input:focus { border-color:var(--teal-500); }
.rate-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
.rate-cancel-btn {
  background:var(--teal-50); border:1.5px solid var(--border); color:var(--text-sub);
  padding:10px 22px; border-radius:50px; font-family:var(--font); font-size:13px; font-weight:600; cursor:pointer;
}
.rate-submit-btn {
  background:linear-gradient(135deg,var(--teal-700),var(--teal-600)); border:none; color:#fff;
  padding:10px 24px; border-radius:50px; font-family:var(--font); font-size:13px; font-weight:700;
  cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(13,148,136,.28);
}
.rate-submit-btn:disabled { opacity:.55; cursor:not-allowed; }
.rate-submit-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,148,136,.38); }
.rate-success { text-align:center; padding:12px 0; }
.rate-success-icon { font-size:52px; display:block; margin-bottom:12px; }
.rate-success h4 { font-size:18px; font-weight:800; color:var(--teal-800); margin-bottom:6px; }
.rate-success p  { font-size:13.5px; color:var(--text-sub); }

/* ─── REVIEWS SECTION ─── */
.reviews-section { margin-bottom:20px; }
.reviews-summary {
  background:linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.8));
  border:1.5px solid var(--teal-100); border-radius:var(--r); padding:18px 20px; margin-bottom:14px;
  display:flex; align-items:center; gap:20px; flex-wrap:wrap;
}
.reviews-avg-num { font-size:44px; font-weight:800; color:var(--teal-800); line-height:1; font-family:var(--mono); }
.reviews-stars { font-size:22px; color:var(--amber); letter-spacing:2px; }
.reviews-count { font-size:12px; color:var(--text-muted); margin-top:3px; }
.reviews-list-mini { display:flex; flex-direction:column; gap:10px; }
.review-item {
  background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--rs); padding:14px 16px;
}
.review-item-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.review-item-name { font-size:13.5px; font-weight:700; color:var(--text-main); }
.review-item-stars { font-size:14px; color:var(--amber); }
.review-item-text { font-size:13px; color:var(--text-sub); line-height:1.6; font-style:italic; }
.review-item-date { font-size:11px; color:var(--text-muted); margin-top:5px; }
.reviews-empty { font-size:13.5px; color:var(--text-muted); text-align:center; padding:20px 0; }

/* ─── RATE BUTTON (inside clinic detail) ─── */
.rate-clinic-btn {
  width:100%; margin-top:4px;
  display:flex; align-items:center; justify-content:center; gap:9px;
  background:linear-gradient(135deg,var(--amber),#d97706); border:none; color:#fff;
  padding:13px 24px; border-radius:50px;
  font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer;
  transition:all .2s; box-shadow:0 4px 14px rgba(245,158,11,.32);
}
.rate-clinic-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(245,158,11,.42); }

/* ─── CLINIC DETAIL MODAL ─── */
.cd-overlay {
  position:fixed; inset:0; z-index:200;
  background:rgba(13,60,56,.4); backdrop-filter:blur(8px);
  display:flex; align-items:flex-end; justify-content:center; padding:0;
  animation:fadeIn .2s both;
}
@media(min-width:640px) { .cd-overlay { align-items:center; padding:24px; } }
.cd-sheet {
  background:#fff; border:1.5px solid var(--border); border-radius:24px 24px 0 0;
  width:100%; max-width:680px; max-height:92vh; overflow-y:auto;
  animation:slideIn .3s var(--ease) both; box-shadow:0 -8px 40px rgba(13,148,136,.15);
}
@media(min-width:640px) { .cd-sheet { border-radius:24px; max-height:85vh; box-shadow:var(--shadow-lg); } }
.cd-sheet::-webkit-scrollbar { width:4px; }
.cd-sheet::-webkit-scrollbar-thumb { background:var(--teal-100); border-radius:2px; }
.cd-banner { height:180px; position:relative; background:linear-gradient(135deg,var(--teal-800),var(--teal-600)); border-radius:24px 24px 0 0; overflow:hidden; }
.cd-banner img { width:100%; height:100%; object-fit:cover; }
.cd-banner-grad { position:absolute; inset:0; background:linear-gradient(transparent 30%,rgba(0,0,0,.45)); }
.cd-close-btn { position:absolute; top:16px; right:16px; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.9); border:1.5px solid var(--border); color:var(--text-main); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.cd-close-btn:hover { background:#fff; }
.cd-banner-info { position:absolute; bottom:0; left:0; right:0; padding:18px 24px; }
.cd-clinic-name { font-size:24px; font-weight:800; color:#fff; letter-spacing:-.5px; }
.cd-clinic-loc  { font-size:13px; color:rgba(255,255,255,.8); margin-top:4px; }
.cd-body { padding:24px; }
.cd-section-title { font-size:10.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.9px; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
.cd-section-title::after { content:''; flex:1; height:1px; background:var(--border); }
.cd-doc-card { background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--r); padding:18px; margin-bottom:20px; display:flex; gap:16px; align-items:flex-start; }
.cd-doc-photo { width:64px; height:64px; border-radius:50%; flex-shrink:0; background:var(--teal-100); display:flex; align-items:center; justify-content:center; font-size:28px; overflow:hidden; border:2px solid var(--teal-300); }
.cd-doc-photo img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.cd-doc-main-name { font-size:18px; font-weight:800; color:var(--text-main); }
.cd-doc-qual  { font-size:13px; color:var(--text-muted); margin-top:3px; }
.cd-doc-exp   { font-size:12px; color:var(--teal-700); margin-top:4px; font-weight:600; }
.cd-doc-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
.cd-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
.cd-info-tile { background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--rs); padding:14px 16px; }
.cd-info-label { font-size:10.5px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
.cd-info-value { font-size:14px; font-weight:700; color:var(--text-main); }
.cd-chips-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
.cd-charges-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:10px; margin-bottom:20px; }
.cd-charge-tile { background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--rs); padding:12px 14px; }
.cd-charge-name   { font-size:11px; color:var(--text-muted); margin-bottom:4px; }
.cd-charge-amount { font-size:20px; font-weight:800; color:var(--teal-700); font-family:var(--mono); }
.cd-avail-note { background:var(--teal-50); border:1.5px solid var(--teal-100); border-radius:var(--rs); padding:14px 16px; margin-bottom:20px; font-size:13.5px; color:var(--text-sub); line-height:1.7; }
.cd-vacation { background:rgba(245,158,11,.08); border:1.5px solid rgba(245,158,11,.25); border-radius:var(--rs); padding:12px 16px; margin-bottom:20px; font-size:13px; color:#b45309; font-weight:600; }

/* ─── SKELETONS ─── */
.skeleton { background:linear-gradient(90deg,#d4ede8 0%,#e8f5f2 50%,#d4ede8 100%); background-size:200% 100%; border-radius:8px; animation:shimmer 1.4s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skeleton-card { background:#fff; border:1.5px solid var(--border); border-radius:var(--r); overflow:hidden; box-shadow:var(--shadow); }
.pq-empty { text-align:center; padding:60px 24px; color:var(--text-muted); font-size:15px; }
.pq-empty-icon { font-size:52px; margin-bottom:16px; }
.pq-empty-title { font-size:18px; font-weight:700; color:var(--text-sub); margin-bottom:8px; }

@media(max-width:600px) {
  .pq-nav { padding:14px 20px; }
  .pq-heading { letter-spacing:-1px; }
  .cd-info-grid { grid-template-columns:1fr; }
  .lq-stats-grid { grid-template-columns:1fr 1fr; }
}
`;

/* ─── Helpers ─── */

/* Same timing logic as admin Dashboard & Receptionist */
function calcEstimatedWait(waitingCount, avgConsultMins, firstConsultStart) {
  if (waitingCount === 0) return 0;
  const AVG = avgConsultMins || 10;
  const EXT = 5;
  let remaining0 = AVG;
  if (firstConsultStart) {
    const elapsed = (Date.now() - new Date(firstConsultStart).getTime()) / 60000;
    if (elapsed < AVG) {
      remaining0 = Math.max(1, Math.round(AVG - elapsed));
    } else {
      const overElapsed = elapsed - AVG;
      remaining0 = Math.max(1, Math.round(EXT - (overElapsed % EXT)));
    }
  }
  // Total wait for a new arrival = first patient finishes + remaining patients * AVG
  if (waitingCount === 1) return remaining0;
  return remaining0 + (waitingCount - 1) * AVG;
}

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

function StatusBadge({ isOpen }) {
  return <span className={`cc-status ${isOpen ? "open" : "closed"}`}>{isOpen ? "🟢 Open" : "🔴 Closed"}</span>;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ height: 130 }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 22, width: "60%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 18 }} />
        <div className="skeleton" style={{ height: 68, borderRadius: 10, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[80, 100, 70].map((w, i) => <div key={i} className="skeleton" style={{ height: 24, width: w, borderRadius: 20 }} />)}
        </div>
        <div className="skeleton" style={{ height: 1, marginBottom: 14 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton" style={{ height: 14, width: 90 }} />
          <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   LIVE QUEUE WIDGET
   — only Waiting + Est. Wait (With Doctor removed)
   — fixed refresh: clears old interval before setting new one
   — shows last-updated timestamp
══════════════════════════ */
function LiveQueueWidget({ clinicId, isOpen }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated,setLastUpdated]= useState(null);
  const [now,        setNow]        = useState(new Date());
  const intervalRef  = useRef(null);
  const tickRef      = useRef(null);

  const fetchQueue = useCallback(async (isManual = false) => {
    if (!clinicId) return;
    if (isManual) setRefreshing(true);
    try {
      const r = await fetch(`${API}/queue/public/${clinicId}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      setData(json);
      setError("");
      setLastUpdated(new Date());
    } catch (e) {
      setError("Could not load live queue data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicId]);

  /* FIX: clear old interval every time fetchQueue identity changes */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fetchQueue();
    intervalRef.current = setInterval(() => fetchQueue(), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQueue]);

  /* Live 1-second tick — mirrors admin/receptionist countdown */
  useEffect(() => {
    tickRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  // Compute live wait using same logic as admin dashboard (updates every second via `now`)
  const liveWaitMins = data
    ? calcEstimatedWait(data.waiting, data.avgConsultMins, data.firstConsultStart)
    : 0;
  const isClear  = data && data.waiting === 0;
  const isUrgent = data && data.waiting >= 10;
  const fillPct  = data ? Math.min(100, (data.waiting / 20) * 100) : 0;

  const formatTime = (d) => {
    if (!d) return "";
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="lq-banner">
      {/* Header */}
      <div className="lq-banner-header">
        <div className="lq-banner-title">
          <span className="lq-live-dot" />
          Live Queue Status
        </div>
        <button
          className="lq-refresh-btn"
          onClick={() => fetchQueue(true)}
          disabled={refreshing || loading}
        >
          <span className={`lq-refresh-icon ${refreshing ? "spinning" : ""}`}>↻</span>
          {refreshing ? "Updating…" : "Refresh"}
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="lq-loading">
          <div className="lq-loading-spinner" />
          <div className="lq-loading-text">Fetching live queue…</div>
        </div>
      ) : error ? (
        <div className="lq-error">⚠️ {error}</div>
      ) : (
        <>
          {/* 2-tile grid: Waiting | Est. Wait */}
          <div className="lq-stats-grid">
            {/* Waiting */}
            <div className="lq-stat-tile">
              <div className={`lq-stat-value ${isClear ? "clear" : isUrgent ? "urgent" : ""}`}>
                {data.waiting}
              </div>
              <div className="lq-stat-label">Waiting</div>
              <div className="lq-stat-sub">
                {isClear ? "🎉 No queue!" : isUrgent ? "Busy right now" : "patients ahead"}
              </div>
            </div>

            {/* Estimated Wait */}
            <div className="lq-stat-tile">
              <div
                className={`lq-stat-value ${liveWaitMins > 30 ? "urgent" : isClear ? "clear" : ""}`}
                style={{ fontSize: liveWaitMins >= 100 ? 28 : 40 }}
              >
                {isClear ? "0" : liveWaitMins}
              </div>
              <div className="lq-stat-label">Est. Wait (min)</div>
              <div className="lq-stat-sub">
                {isClear
                  ? "Walk right in!"
                  : `~${data.avgConsultMins} min/patient · live`
                }
              </div>
            </div>
          </div>

          {/* Closed notice */}
          {!isOpen && (
            <div className="lq-clinic-closed">
              🔴 Clinic is currently closed. Queue data shown is from the last session.
            </div>
          )}

          {/* Wait progress bar */}
          <div className="lq-wait-bar">
            <div className="lq-wait-track">
              <div
                className="lq-wait-fill"
                style={{
                  width: `${fillPct}%`,
                  background: isUrgent
                    ? "linear-gradient(90deg,#f87171,#dc2626)"
                    : isClear
                    ? "linear-gradient(90deg,#4ade80,#16a34a)"
                    : "linear-gradient(90deg,var(--teal-500),var(--teal-400))"
                }}
              />
            </div>
            <span className="lq-wait-label">
              {isClear
                ? "✅ No wait"
                : liveWaitMins <= 10
                ? "⚡ Short wait"
                : liveWaitMins <= 30
                ? "🕐 Moderate wait"
                : "⏳ Long wait"}
              {!isClear && ` · ~${liveWaitMins} min`}
            </span>
          </div>

          {/* Last updated timestamp */}
          {lastUpdated && (
            <div className="lq-updated">
              Last updated: {formatTime(lastUpdated)} · auto-refreshes every 60s
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════
   REVIEWS WIDGET
   Fetches /api/reviews/public/:clinicId
══════════════════════════ */
function ReviewsWidget({ clinicId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!clinicId) return;
    fetch(`${API}/reviews/public/${clinicId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [clinicId]);

  if (!data || data.total === 0) {
    return <div className="reviews-empty">No reviews yet — be the first to rate! ⭐</div>;
  }

  const starStr = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="reviews-section">
      <div className="reviews-summary">
        <div>
          <div className="reviews-avg-num">{data.avg}</div>
          <div className="reviews-stars">{starStr(Math.round(Number(data.avg)))}</div>
          <div className="reviews-count">{data.total} review{data.total !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="reviews-list-mini">
        {data.reviews.slice(0, 5).map((r, i) => (
          <div className="review-item" key={i}>
            <div className="review-item-header">
              <span className="review-item-name">{r.patientName || "Anonymous"}</span>
              <span className="review-item-stars">{starStr(r.rating)}</span>
            </div>
            {r.text && <div className="review-item-text">"{r.text}"</div>}
            <div className="review-item-date">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════
   RATE MODAL
══════════════════════════ */
function RateModal({ clinic, onClose }) {
  const clinicId = clinic.clinicId || clinic._id || clinic.doctorId;
  const [rating,      setRating]      = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [name,        setName]        = useState("");
  const [mobile,      setMobile]      = useState("");
  const [text,        setText]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState("");

  const submit = async () => {
    if (!rating) { setError("Please select a star rating ⭐"); return; }
    setSubmitting(true); setError("");
    try {
      const r = await fetch(`${API}/reviews/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, patientName: name.trim() || "Anonymous", rating, text: text.trim(), mobile: mobile.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.message || "Failed to submit"); setSubmitting(false); return; }
      setSubmitted(true);
    } catch { setError("Cannot reach server. Try again."); }
    setSubmitting(false);
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const display = hovered || rating;

  return (
    <div className="rate-overlay" onClick={onClose}>
      <div className="rate-box" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="rate-success">
            <span className="rate-success-icon">🎉</span>
            <h4>Thank you for your review!</h4>
            <p>Your feedback helps others find the right clinic.</p>
            <div className="rate-actions" style={{ justifyContent: "center", marginTop: 20 }}>
              <button className="rate-submit-btn" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <h3>Rate {clinic.clinicName || "this clinic"}</h3>
            <p>Your experience helps other patients make better decisions.</p>

            {/* Stars */}
            <div className="star-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className="star-btn"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  title={["", "Poor", "Fair", "Good", "Very Good", "Excellent"][n]}
                >
                  {n <= display ? "★" : "☆"}
                </button>
              ))}
            </div>
            {display > 0 && (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--teal-700)", fontWeight: 700, marginBottom: 16 }}>
                {["", "Poor 😞", "Fair 😐", "Good 🙂", "Very Good 😊", "Excellent 🤩"][display]}
              </div>
            )}

            <input className="rate-input" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
            <input className="rate-input" placeholder="Mobile number (optional)" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" />
            <textarea
              className="rate-input"
              placeholder="Share your experience… (optional)"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />

            {error && <div style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 600, marginBottom: 8 }}>⚠️ {error}</div>}

            <div className="rate-actions">
              <button className="rate-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="rate-submit-btn" onClick={submit} disabled={submitting || !rating}>
                {submitting ? "Submitting…" : "⭐ Submit Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Clinic Detail Sheet ─── */
function ClinicDetail({ clinic, onClose }) {
  const isOnVacation = clinic.doctor.vacationFrom && clinic.doctor.vacationTo &&
    new Date() >= new Date(clinic.doctor.vacationFrom) && new Date() <= new Date(clinic.doctor.vacationTo);

  const doctorCharges = (clinic.doctor.charges || []).filter(c => c.name);
  const clinicFees    = (clinic.feeStructure || []).filter(c => c.name);
  const charges       = clinicFees.length > 0 ? clinicFees : doctorCharges;
  const isOpen   = clinic.isOpen !== false;
  const clinicId = clinic.clinicId || clinic._id || clinic.doctorId || null;

  const [showRateModal, setShowRateModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <>
      <div className="cd-overlay" onClick={onClose}>
        <div className="cd-sheet" onClick={e => e.stopPropagation()}>
          {/* Banner */}
          <div className="cd-banner">
            {clinic.bannerPhoto && <img src={clinic.bannerPhoto} alt={clinic.clinicName} />}
            <div className="cd-banner-grad" />
            <button className="cd-close-btn" onClick={onClose}>✕</button>
            <div className="cd-banner-info">
              <div className="cd-clinic-name">{clinic.clinicName || "Clinic"}</div>
              {clinic.address && <div className="cd-clinic-loc">📍 {clinic.address}</div>}
            </div>
          </div>

          <div className="cd-body">
            {/* Status chips */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <span className={`cc-chip ${isOpen ? "cc-chip-teal" : "cc-chip-gray"}`}>{isOpen ? "🟢 Open Now" : "🔴 Closed"}</span>
              {clinic.openTime && <span className="cc-chip cc-chip-gray">🕐 {clinic.openTime} – {clinic.closeTime}</span>}
              {clinic.foundedYear && <span className="cc-chip cc-chip-amber">🏛️ Est. {clinic.foundedYear}</span>}
              {clinic.contactNumber && <span className="cc-chip cc-chip-blue">📞 {clinic.contactNumber}</span>}
            </div>

            {/* Live Queue */}
            {clinicId && (
              <>
                <div className="cd-section-title">Live Waiting Room</div>
                <LiveQueueWidget clinicId={clinicId} isOpen={isOpen} />
              </>
            )}

            {/* Doctor */}
            <div className="cd-section-title">Doctor</div>
            <div className="cd-doc-card">
              <div className="cd-doc-photo">
                {clinic.doctor.photo ? <img src={clinic.doctor.photo} alt={clinic.doctor.name} /> : "👨‍⚕️"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="cd-doc-main-name">Dr. {clinic.doctor.name || "—"}</div>
                {clinic.doctor.qualifications && <div className="cd-doc-qual">{clinic.doctor.qualifications}</div>}
                {clinic.doctor.experience > 0 && <div className="cd-doc-exp">🏅 {clinic.doctor.experience} years of experience</div>}
                {clinic.doctor.contactNumber && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>📞 {clinic.doctor.contactNumber}</div>}
                <div className="cd-doc-chips">
                  {(clinic.doctor.specializations || []).map(s => <span key={s} className="cc-chip cc-chip-teal" style={{ fontSize: 11 }}>{s}</span>)}
                  {(clinic.doctor.languages || []).map(l => <span key={l} className="cc-chip cc-chip-blue" style={{ fontSize: 11 }}>🗣️ {l}</span>)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <span className={`cc-chip ${clinic.doctor.isActive ? "cc-chip-teal" : "cc-chip-gray"}`} style={{ fontSize: 11 }}>
                    {clinic.doctor.isActive ? "✅ Currently Available" : "⛔ Not Available Now"}
                  </span>
                </div>
              </div>
            </div>

            {/* Vacation */}
            {isOnVacation && (
              <div className="cd-vacation">
                🏖️ On leave: {new Date(clinic.doctor.vacationFrom).toLocaleDateString()} – {new Date(clinic.doctor.vacationTo).toLocaleDateString()}
                {clinic.doctor.vacationNote && ` · "${clinic.doctor.vacationNote}"`}
              </div>
            )}

            {/* Availability note */}
            {clinic.doctor.availabilityNote && !isOnVacation && (
              <>
                <div className="cd-section-title">Schedule</div>
                <div className="cd-avail-note">📋 {clinic.doctor.availabilityNote}</div>
              </>
            )}

            {/* Charges */}
            {charges.length > 0 && (
              <>
                <div className="cd-section-title">Service Charges</div>
                <div className="cd-charges-grid">
                  {charges.map((c, i) => (
                    <div key={i} className="cd-charge-tile">
                      <div className="cd-charge-name">{c.name}</div>
                      <div className="cd-charge-amount">₹{c.amount}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Clinic Info */}
            <div className="cd-section-title">Clinic Info</div>
            <div className="cd-info-grid">
              <div className="cd-info-tile"><div className="cd-info-label">Status</div><div className="cd-info-value">{isOpen ? "Open" : "Closed"}</div></div>
              <div className="cd-info-tile"><div className="cd-info-label">Timings</div><div className="cd-info-value" style={{ fontSize: 13 }}>{clinic.openTime || "—"} – {clinic.closeTime || "—"}</div></div>
              {clinic.foundedYear && <div className="cd-info-tile"><div className="cd-info-label">Established</div><div className="cd-info-value">{clinic.foundedYear}</div></div>}
              {clinic.contactNumber && <div className="cd-info-tile"><div className="cd-info-label">Contact</div><div className="cd-info-value" style={{ fontSize: 13 }}>{clinic.contactNumber}</div></div>}
            </div>

            {/* Payment & Facilities */}
            {(clinic.paymentMethods?.length > 0 || clinic.facilities?.length > 0) && (
              <>
                <div className="cd-section-title">Services & Facilities</div>
                <div className="cd-chips-row">
                  {(clinic.paymentMethods || []).map(p => <span key={p} className="cc-chip cc-chip-teal">💳 {p}</span>)}
                  {(clinic.facilities || []).map(f => <span key={f} className="cc-chip cc-chip-amber">🏢 {f}</span>)}
                </div>
              </>
            )}

            {/* Also practices at */}
            {clinic.doctor.worksElsewhere?.place && (
              <>
                <div className="cd-section-title">Also Practices At</div>
                <div className="cd-avail-note">
                  🏥 {clinic.doctor.worksElsewhere.place}
                  {clinic.doctor.worksElsewhere.schedule && ` · ${clinic.doctor.worksElsewhere.schedule}`}
                </div>
              </>
            )}

            {/* ── REVIEWS SECTION ── */}
            {clinicId && (
              <>
                <div className="cd-section-title">Patient Reviews</div>
                <ReviewsWidget clinicId={clinicId} />
              </>
            )}

            {/* ── RATE THIS CLINIC BUTTON ── */}
            {clinicId && (
              <button className="rate-clinic-btn" onClick={() => setShowRateModal(true)}>
                ⭐ Rate This Clinic
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rate modal rendered outside cd-overlay so z-index stacks correctly */}
      {showRateModal && <RateModal clinic={clinic} onClose={() => setShowRateModal(false)} />}
    </>
  );
}

/* ─── Clinic Card ─── */
function ClinicCard({ clinic, style, onClick }) {
  const isOpen      = clinic.isOpen !== false;
  const clinicFees  = (clinic.feeStructure || []).filter(c => c.name);
  const charges     = clinicFees.length > 0 ? clinicFees : (clinic.doctor.charges || []).filter(c => c.name);
  return (
    <div className="clinic-card" style={style} onClick={onClick}>
      <div className="cc-banner">
        {clinic.bannerPhoto && <img src={clinic.bannerPhoto} alt={clinic.clinicName} />}
        <div className="cc-banner-overlay" />
        <StatusBadge isOpen={isOpen} />
      </div>
      <div className="cc-body">
        <div className="cc-name">{clinic.clinicName || "Unnamed Clinic"}</div>
        {clinic.address && <div className="cc-address">📍 {clinic.address}</div>}
        <div className="cc-doctor-row">
          <div className="cc-doc-photo">
            {clinic.doctor.photo ? <img src={clinic.doctor.photo} alt={clinic.doctor.name} /> : "👨‍⚕️"}
          </div>
          <div style={{ flex: 1 }}>
            <div className="cc-doc-name">Dr. {clinic.doctor.name || "—"}</div>
            <div className="cc-doc-qual">{clinic.doctor.qualifications || clinic.doctor.specializations?.[0] || "General Physician"}</div>
          </div>
          <span className={`cc-doc-avail ${clinic.doctor.isActive ? "avail-yes" : "avail-no"}`}>
            {clinic.doctor.isActive ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="cc-chips">
          {clinic.doctor.experience > 0 && <span className="cc-chip cc-chip-teal">🏅 {clinic.doctor.experience} yrs</span>}
          {(clinic.doctor.specializations || []).slice(0, 2).map(s => <span key={s} className="cc-chip cc-chip-amber">{s}</span>)}
          {charges.length > 0 && <span className="cc-chip cc-chip-blue">₹ {charges.length} charge{charges.length > 1 ? "s" : ""}</span>}
          {(clinic.paymentMethods || []).slice(0, 2).map(p => <span key={p} className="cc-chip cc-chip-gray">{p}</span>)}
        </div>
        <div className="cc-divider" />
        <div className="cc-footer">
          <div className="cc-hours">🕐 {clinic.openTime || "—"} – {clinic.closeTime || "—"}</div>
          <button className="cc-view-btn" onClick={e => { e.stopPropagation(); onClick(); }}>Check Queue →</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════
   MAIN PAGE
══════════════════════════ */
export default function PatientQueue() {
  const navigate = useNavigate();
  const [allClinics,    setAllClinics]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [query,         setQuery]         = useState("");
  const [focused,       setFocused]       = useState(false);
  const [results,       setResults]       = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 220);

  useEffect(() => {
    if (!document.getElementById("pq-css")) {
      const el = document.createElement("style");
      el.id = "pq-css"; el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/clinic/public/all`);
        if (!r.ok) throw new Error("Server error");
        const data = await r.json();
        setAllClinics(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filterClinics = useCallback((q, clinics) => {
    const t = q.trim().toLowerCase();
    if (!t) return clinics;
    return clinics.filter(c => {
      const name = (c.clinicName || "").toLowerCase();
      const addr = (c.address || "").toLowerCase();
      const doc  = (c.doctor?.name || "").toLowerCase();
      const spec = (c.doctor?.specializations || []).join(" ").toLowerCase();
      return name.includes(t) || addr.includes(t) || doc.includes(t) || spec.includes(t);
    });
  }, []);

  const suggestions  = debouncedQuery.length >= 1 ? filterClinics(debouncedQuery, allClinics).slice(0, 6) : [];
  const showDropdown = focused && debouncedQuery.length >= 1;

  const commitSearch = (q = query) => { setResults(filterClinics(q, allClinics)); setFocused(false); };

  const findNearby = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => { const open = allClinics.filter(c => c.isOpen !== false); setResults(open.length ? open : allClinics); setQuery("Nearby clinics"); setNearbyLoading(false); },
      () => { const open = allClinics.filter(c => c.isOpen !== false); setResults(open.length ? open : allClinics); setQuery("Open clinics"); setNearbyLoading(false); },
      { timeout: 5000 }
    );
  };

  return (
    <div className="pq-root">
      <nav className="pq-nav">
        <div className="pq-logo" onClick={() => navigate("/")}>
          <div className="pq-logo-icon">⏱</div>
          QueueSync
        </div>
        <button className="pq-nav-btn" onClick={() => navigate("/signup")}>Register Clinic →</button>
      </nav>

      {/* Results page */}
      {results !== null ? (
        <div style={{ paddingTop: 80 }}>
          <div className="pq-results">
            <div className="pq-results-header">
              <div>
                <div className="pq-results-title">{results.length === 0 ? "No results found" : `Clinics — "${query}"`}</div>
                <div className="pq-results-count">{results.length} clinic{results.length !== 1 ? "s" : ""} found</div>
              </div>
              <button className="pq-back-btn" onClick={() => { setResults(null); setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }}>← Back to Search</button>
            </div>

            <div className="pq-search-wrap" style={{ marginBottom: 28, animation: "none" }}>
              <div className={`pq-search-box ${focused ? "focused" : ""}`}>
                <span className="search-icon">🔍</span>
                <input ref={inputRef} className="pq-input" placeholder="Search clinics, doctors, specialties…" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 160)} onKeyDown={e => { if (e.key === "Enter") commitSearch(); }} style={{ fontSize: 15, padding: "14px 0" }} />
                <button className={`pq-nearby-btn ${nearbyLoading ? "loading" : ""}`} onClick={findNearby} disabled={nearbyLoading}>{nearbyLoading ? "⏳" : "📍"} Nearby</button>
              </div>
              {showDropdown && suggestions.length > 0 && (
                <div className="pq-dropdown">
                  {suggestions.map(c => (
                    <div key={c.clinicId} className="pq-drop-item" onMouseDown={() => { setSelected(c); commitSearch(c.clinicName); }}>
                      <div className="pq-drop-avatar">{c.doctor?.photo ? <img src={c.doctor.photo} alt="" /> : "🏥"}</div>
                      <div><div className="pq-drop-name">{c.clinicName}</div><div className="pq-drop-meta">Dr. {c.doctor?.name} · {c.address || "—"}</div></div>
                      <span className={`pq-drop-status ${c.isOpen !== false ? "drop-open" : "drop-closed"}`}>{c.isOpen !== false ? "Open" : "Closed"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="clinic-grid">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
            ) : results.length === 0 ? (
              <div className="pq-empty">
                <div className="pq-empty-icon">🔍</div>
                <div className="pq-empty-title">No clinics found for "{query}"</div>
                <p>Try searching by clinic name, doctor name, or specialty.</p>
              </div>
            ) : (
              <div className="clinic-grid">
                {results.map((c, i) => <ClinicCard key={c.clinicId} clinic={c} style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setSelected(c)} />)}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Hero */
        <section className="pq-hero">
          <div className="pq-hero-bg">
            <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /><div className="bg-grid" />
          </div>
          <div className="pq-hero-inner">
            <div className="pq-pill"><span className="pill-pulse" />No login required · Instant results</div>
            <h1 className="pq-heading">Find your clinic.<br />Check <em>live wait times</em>.</h1>
            <p className="pq-sub">Search any clinic or doctor in your area — see real-time queue status, doctor availability, and service charges instantly.</p>

            <div className="pq-search-wrap">
              <div className={`pq-search-box ${focused ? "focused" : ""}`}>
                <span className="search-icon">🔍</span>
                <input ref={inputRef} className="pq-input" placeholder="Search clinic name, doctor, specialty…" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 160)} onKeyDown={e => { if (e.key === "Enter" && query.trim()) commitSearch(); }} autoFocus />
                <button className={`pq-nearby-btn ${nearbyLoading ? "loading" : ""}`} onClick={findNearby} disabled={nearbyLoading}>{nearbyLoading ? "⏳ Locating…" : "📍 Nearby"}</button>
              </div>
              {showDropdown && (
                <div className="pq-dropdown">
                  {loading ? <div className="pq-drop-empty">⏳ Loading clinics…</div>
                  : suggestions.length === 0 ? <div className="pq-drop-empty">No results for "{debouncedQuery}"</div>
                  : (
                    <>
                      <div className="pq-drop-section">Suggested Clinics</div>
                      {suggestions.map(c => (
                        <div key={c.clinicId} className="pq-drop-item" onMouseDown={() => { setQuery(c.clinicName); commitSearch(c.clinicName); }}>
                          <div className="pq-drop-avatar">{c.doctor?.photo ? <img src={c.doctor.photo} alt="" /> : "🏥"}</div>
                          <div style={{ flex: 1 }}>
                            <div className="pq-drop-name">{c.clinicName}</div>
                            <div className="pq-drop-meta">Dr. {c.doctor?.name || "—"}{c.address ? ` · 📍 ${c.address}` : ""}{c.doctor?.specializations?.[0] ? ` · ${c.doctor.specializations[0]}` : ""}</div>
                          </div>
                          <span className={`pq-drop-status ${c.isOpen !== false ? "drop-open" : "drop-closed"}`}>{c.isOpen !== false ? "Open" : "Closed"}</span>
                        </div>
                      ))}
                      {allClinics.length > 6 && (
                        <div className="pq-drop-item" style={{ justifyContent: "center", color: "var(--teal-700)", fontSize: 13, fontWeight: 600 }} onMouseDown={() => commitSearch()}>
                          View all {filterClinics(debouncedQuery, allClinics).length} results →
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pq-tips">
              <span className="pq-tip">Try <span className="tip-badge">ASHA Clinic</span></span>
              <span className="pq-tip">or <span className="tip-badge">Dr. Swati Jaswal</span></span>
              <span className="pq-tip">or <span className="tip-badge">Cardiologist</span></span>
            </div>

            {!loading && allClinics.length > 0 && (
              <div className="pq-stats">
                <div className="pq-stat"><div className="pq-stat-num">{allClinics.length}</div><div className="pq-stat-label">Clinics Listed</div></div>
                <div className="pq-stat-div" />
                <div className="pq-stat"><div className="pq-stat-num">{allClinics.filter(c => c.isOpen !== false).length}</div><div className="pq-stat-label">Open Now</div></div>
                <div className="pq-stat-div" />
                <div className="pq-stat"><div className="pq-stat-num">0</div><div className="pq-stat-label">Login Required</div></div>
              </div>
            )}
          </div>
        </section>
      )}

      {selected && <ClinicDetail clinic={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}