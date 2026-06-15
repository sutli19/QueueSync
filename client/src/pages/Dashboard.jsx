import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
:root {
  --teal-900:#0f4c47;--teal-800:#0f6b62;--teal-700:#0f766e;--teal-600:#0d9488;
  --teal-500:#14b8a6;--teal-400:#2dd4bf;--teal-100:#ccfbf1;--teal-50:#f0fdf4;
  --amber:#f59e0b;--green:#16a34a;--red:#dc2626;--blue:#3b82f6;
  --gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;
  --gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-900:#111827;
  --sidebar-w:258px;--radius:16px;--radius-sm:10px;
  --shadow:0 4px 24px rgba(15,118,110,.10);
  --font-main:'Outfit',sans-serif;--font-body:'DM Sans',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.db-root{display:flex;height:100vh;width:100vw;overflow:hidden;background:linear-gradient(135deg,#cce8e3 0%,#aad8d0 50%,#88c9be 100%);font-family:var(--font-main);}
.db-sidebar{width:var(--sidebar-w);min-width:var(--sidebar-w);height:100vh;background:linear-gradient(180deg,var(--teal-900) 0%,var(--teal-800) 60%,var(--teal-700) 100%);display:flex;flex-direction:column;overflow:hidden;position:relative;z-index:10;box-shadow:4px 0 32px rgba(0,0,0,.20);}
.db-sidebar::before{content:'';position:absolute;top:-80px;right:-80px;width:240px;height:240px;background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);pointer-events:none;}
.db-logo{display:flex;align-items:center;gap:10px;padding:26px 22px 18px;font-size:20px;font-weight:800;color:white;letter-spacing:-.3px;border-bottom:1px solid rgba(255,255,255,.09);}
.db-logo-icon{width:36px;height:36px;background:rgba(255,255,255,.18);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.db-badge-row{padding:10px 22px;}
.db-role-badge{background:rgba(255,255,255,.12);color:rgba(255,255,255,.8);font-size:10.5px;font-weight:600;letter-spacing:.9px;text-transform:uppercase;padding:4px 10px;border-radius:20px;}
.db-nav{flex:1;padding:6px 10px;display:flex;flex-direction:column;gap:1px;overflow-y:auto;}
.db-nav-item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:var(--radius-sm);border:none;background:transparent;color:rgba(255,255,255,.68);font-family:var(--font-main);font-size:13.5px;font-weight:500;cursor:pointer;transition:all .16s;text-align:left;width:100%;position:relative;}
.db-nav-item:hover{background:rgba(255,255,255,.10);color:white;}
.db-nav-item.active{background:rgba(255,255,255,.17);color:white;font-weight:700;}
.db-nav-item.active::before{content:'';position:absolute;left:0;top:22%;bottom:22%;width:3px;background:var(--teal-400);border-radius:2px;}
.nav-icon{font-size:15px;width:20px;text-align:center;}
.nav-badge{margin-left:auto;background:var(--amber);color:white;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:10px;}
.db-sidebar-footer{padding:14px 10px;border-top:1px solid rgba(255,255,255,.09);}
.db-user{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);background:rgba(255,255,255,.09);margin-bottom:8px;}
.db-avatar{width:36px;height:36px;background:var(--teal-600);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:white;flex-shrink:0;}
.db-user-name{font-size:13px;font-weight:600;color:white;}
.db-user-role{font-size:11px;color:rgba(255,255,255,.55);margin-top:1px;}
.logout-btn{width:100%;padding:9px;background:rgba(220,38,38,.14);border:1px solid rgba(220,38,38,.25);color:#fca5a5;border-radius:var(--radius-sm);font-family:var(--font-main);font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;}
.logout-btn:hover{background:rgba(220,38,38,.28);color:white;}
.db-main{flex:1;overflow-y:auto;}
.section-content{padding:30px 36px;min-height:100%;}
.section-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:16px;}
.section-title{font-size:25px;font-weight:800;color:var(--teal-900);letter-spacing:-.5px;}
.section-sub{font-size:14px;color:var(--gray-600);margin-top:4px;font-family:var(--font-body);}
.header-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
.live-clock{display:flex;flex-direction:column;align-items:flex-end;}
.lc-time{font-size:20px;font-weight:800;color:var(--teal-800);letter-spacing:-.5px;line-height:1;}
.lc-date{font-size:11px;color:var(--gray-500);margin-top:2px;}
.alert-banner{border-radius:var(--radius-sm);padding:13px 18px;margin-bottom:16px;font-size:14px;line-height:1.5;}
.alert-ok{background:rgba(22,163,74,.10);border:1px solid rgba(22,163,74,.22);color:#14532d;}
.alert-warn{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.30);color:#78350f;}
.btn-primary{background:linear-gradient(135deg,var(--teal-700),var(--teal-600));color:white;border:none;padding:10px 22px;border-radius:50px;font-family:var(--font-main);font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,118,110,.35);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.btn-outline{background:rgba(255,255,255,.72);border:1.5px solid var(--teal-600);color:var(--teal-700);padding:10px 22px;border-radius:50px;font-family:var(--font-main);font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
.btn-outline:hover{background:var(--teal-50);}
.btn-ghost{background:transparent;border:1.5px solid var(--gray-200);color:var(--gray-600);padding:10px 20px;border-radius:50px;font-family:var(--font-main);font-size:13.5px;cursor:pointer;transition:all .18s;}
.btn-ghost:hover{background:var(--gray-50);}
.btn-danger{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);color:var(--red);padding:10px 18px;border-radius:var(--radius-sm);font-family:var(--font-main);font-size:13.5px;font-weight:500;cursor:pointer;width:100%;transition:all .18s;}
.btn-danger:hover{background:rgba(220,38,38,.15);}
.link-btn{background:none;border:none;color:var(--teal-700);font-family:var(--font-main);font-size:13px;font-weight:600;cursor:pointer;}
.glass-card{background:rgba(255,255,255,.84);backdrop-filter:blur(16px);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.62);}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.card-head h4{font-size:14.5px;font-weight:700;color:var(--teal-900);}
.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;}
.stat-card{background:rgba(255,255,255,.88);border-radius:var(--radius);padding:18px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.7);transition:transform .2s;cursor:default;}
.stat-card:hover{transform:translateY(-2px);}
.stat-card.teal{border-top:3px solid var(--teal-600);}
.stat-card.amber{border-top:3px solid var(--amber);}
.stat-card.green{border-top:3px solid var(--green);}
.stat-card.blue{border-top:3px solid var(--blue);}
.stat-card.purple{border-top:3px solid #7c3aed;}
.stat-card.clinic-toggle{border-top:3px solid var(--green);cursor:pointer;}
.stat-card.clinic-toggle.closed{border-top-color:var(--red);}
.stat-icon{font-size:26px;flex-shrink:0;}
.stat-label{font-size:10.5px;color:var(--gray-600);font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.stat-num{font-size:28px;font-weight:800;color:var(--teal-900);line-height:1.1;}
.stat-unit{font-size:13px;font-weight:500;color:var(--gray-500);margin-left:2px;}
.stat-toggle-hint{font-size:9.5px;color:var(--gray-400);margin-top:2px;}
.open-text{color:#16a34a!important;}
.closed-text{color:var(--red)!important;}
.overview-lower-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;}
.donut-center{display:flex;justify-content:center;padding:8px 0;}
.donut-empty{color:var(--gray-400);font-size:13px;padding:20px;text-align:center;}
.legend{display:flex;gap:14px;font-size:12px;color:var(--gray-600);align-items:center;flex-wrap:wrap;justify-content:center;}
.leg-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;}
.teal-dot{background:var(--teal-700);}
.amber-dot{background:var(--amber);}
.token-badge{background:linear-gradient(135deg,var(--teal-700),var(--teal-600));color:white;font-size:11px;font-weight:700;padding:4px 9px;border-radius:8px;letter-spacing:.3px;white-space:nowrap;flex-shrink:0;}
.token-badge.lg{font-size:13px;padding:6px 12px;}
.token-badge.sm{font-size:10px;padding:3px 7px;}
.wait-chip{background:rgba(245,158,11,.12);color:#92400e;font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:20px;white-space:nowrap;}
.time-chip{background:var(--gray-100);color:var(--gray-600);font-size:11.5px;padding:4px 10px;border-radius:20px;font-weight:500;white-space:nowrap;}
.returning-tag{background:rgba(59,130,246,.12);color:#1e40af;font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:20px;white-space:nowrap;}
.appt-tag{background:rgba(15,118,110,.10);color:var(--teal-700);font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:20px;margin-left:4px;}
.pending-badge{background:var(--amber);color:white;font-size:10px;font-weight:800;padding:2px 6px;border-radius:10px;margin-left:6px;}
.status-chip{color:white;font-size:10.5px;font-weight:600;padding:4px 10px;border-radius:20px;text-transform:capitalize;white-space:nowrap;}
.status-chip.waiting,.status-chip.scheduled{background:var(--teal-600);}
.status-chip.done,.status-chip.completed{background:var(--green);}
.status-chip.cancelled{background:var(--red);}
.status-chip.delayed,.status-chip.pending{background:var(--amber);}
.status-chip.arrived{background:var(--blue);}
.status-chip.paid{background:var(--green);}
.status-chip.no_show{background:var(--gray-500);}
.bill-chip{background:rgba(22,163,74,.12);color:#166534;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;}
.bill-pending-chip{background:rgba(245,158,11,.15);color:#92400e;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px dashed var(--amber);}
.bill-btn{background:none;border:1.5px dashed var(--gray-300);color:var(--gray-500);font-size:11.5px;padding:3px 10px;border-radius:20px;cursor:pointer;transition:all .18s;font-family:var(--font-main);}
.bill-btn:hover{border-color:var(--teal-600);color:var(--teal-700);}
.arrived-btn{background:rgba(59,130,246,.12);border:1.5px solid rgba(59,130,246,.3);color:#1d4ed8;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;cursor:pointer;white-space:nowrap;font-family:var(--font-main);transition:all .18s;}
.arrived-btn:hover{background:rgba(59,130,246,.22);}
.revenue-badge{background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.25);color:#14532d;font-size:14px;padding:8px 18px;border-radius:50px;display:flex;align-items:center;gap:6px;}
.revenue-badge strong{font-weight:800;}
.mini-patient{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--gray-100);}
.mini-patient:last-child{border-bottom:none;}
.patient-name{flex:1;font-size:13.5px;font-weight:500;color:var(--gray-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.queue-layout{display:grid;grid-template-columns:2fr 1fr;gap:14px;}
.queue-side{display:flex;flex-direction:column;gap:14px;}
.live-badge{background:rgba(34,197,94,.13);color:#16a34a;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.55;}}
.queue-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--gray-100);}
.queue-row:last-child{border-bottom:none;}
.patient-info{flex:1;}
.patient-info strong{display:block;font-size:14.5px;color:var(--gray-900);}
.patient-info span{font-size:12px;color:var(--gray-400);margin-top:2px;display:block;}
.queue-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
.done-btn{background:linear-gradient(135deg,var(--teal-700),var(--teal-600));color:white;border:none;padding:8px 16px;border-radius:50px;font-family:var(--font-main);font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0;}
.done-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(15,118,110,.32);}
.done-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13.5px;}
.done-row:last-child{border-bottom:none;}
.done-check{color:var(--green);font-weight:700;}
.done-name{flex:1;color:var(--gray-700);}
.appt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
.appt-stat{padding:14px;text-align:center;}
.appt-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--gray-100);gap:10px;flex-wrap:wrap;}
.appt-row:last-child{border-bottom:none;}
.appt-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
.appt-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.filter-tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.tab{background:rgba(255,255,255,.65);border:1.5px solid var(--gray-200);color:var(--gray-600);padding:6px 15px;border-radius:50px;font-family:var(--font-main);font-size:12.5px;font-weight:500;cursor:pointer;transition:all .18s;}
.tab.active{background:var(--teal-700);border-color:var(--teal-700);color:white;}
.tab:hover:not(.active){border-color:var(--teal-600);color:var(--teal-700);}
.records-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
.search-input,.date-input{background:rgba(255,255,255,.88);border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);padding:9px 14px;font-family:var(--font-main);font-size:13.5px;color:var(--gray-900);outline:none;transition:border-color .18s;}
.search-input{flex:1;min-width:180px;}
.search-input:focus,.date-input:focus{border-color:var(--teal-600);box-shadow:0 0 0 3px rgba(13,148,136,.10);}
.record-count{font-size:13px;color:var(--gray-500);white-space:nowrap;}
.table-card{padding:0;overflow:hidden;}
.records-table{width:100%;border-collapse:collapse;}
.records-table th{background:var(--teal-50);padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--teal-800);text-transform:uppercase;letter-spacing:.5px;}
.records-table td{padding:12px 14px;font-size:13.5px;color:var(--gray-900);border-bottom:1px solid var(--gray-100);}
.records-table tr:last-child td{border-bottom:none;}
.records-table tr:hover td{background:#f0fdf9;}
.records-table tr.billing-pending-row td{background:rgba(245,158,11,.04);}
.empty-row{text-align:center;color:var(--gray-400);padding:40px!important;}
.bill-total-row{background:var(--teal-50);border-radius:var(--radius-sm);padding:12px 16px;margin-top:16px;font-size:16px;color:var(--teal-800);display:flex;align-items:center;gap:8px;}
.bill-total-row strong{font-size:20px;font-weight:800;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.46);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(5px);padding:20px;}
.modal-overlay.crop-portal{z-index:2000;}
.modal-box{background:white;border-radius:20px;padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.28);animation:modalIn .22s ease;}
.modal-box.wide{max-width:900px;}
@keyframes modalIn{from{opacity:0;transform:translateY(18px) scale(.97);}to{opacity:1;transform:none;}}
.modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.modal-header h3{font-size:17px;font-weight:700;color:var(--teal-900);}
.modal-close{background:var(--gray-100);border:none;width:30px;height:30px;border-radius:50%;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gray-600);}
.modal-close:hover{background:var(--gray-200);}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;}
.acr-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;overflow:hidden;}
.acr-right{display:flex;align-items:center;gap:5px;flex-shrink:0;}
.acr-name{font-size:13.5px;font-weight:600;color:var(--gray-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}
.acr-meta{font-size:11px;color:var(--gray-400);display:block;}
.acr-btn{background:transparent;border:1.5px solid var(--gray-200);border-radius:20px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-main);transition:all .18s;white-space:nowrap;color:var(--gray-600);}
.acr-btn:hover{border-color:var(--teal-600);color:var(--teal-700);}
.acr-arrived{background:rgba(59,130,246,.10);border-color:rgba(59,130,246,.3);color:#1d4ed8;}
.acr-arrived:hover{background:rgba(59,130,246,.20);}
.acr-delay{background:rgba(245,158,11,.10);border-color:rgba(245,158,11,.3);color:#92400e;}
.acr-delay:hover{background:rgba(245,158,11,.20);}
.acr-cancel{background:rgba(220,38,38,.08);border-color:rgba(220,38,38,.2);color:var(--red);}
.acr-cancel:hover{background:rgba(220,38,38,.18);}
.acr-noshow{background:rgba(107,114,128,.08);border-color:rgba(107,114,128,.2);color:var(--gray-600);}
.acr-noshow:hover{background:rgba(107,114,128,.18);}
.appt-compact-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--gray-100);gap:10px;}
.appt-compact-row:last-child{border-bottom:none;}
.empty-state{text-align:center;padding:40px 20px;color:var(--gray-400);font-size:14px;}
.muted{color:var(--gray-400);font-size:12.5px;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.form-field{display:flex;flex-direction:column;gap:6px;}
.form-field.full{grid-column:1 / -1;}
.form-field label{font-size:11px;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.4px;}
.form-field input,.form-field select,.form-field textarea{background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);padding:10px 14px;font-family:var(--font-main);font-size:13.5px;color:var(--gray-900);outline:none;transition:border-color .18s,box-shadow .18s;width:100%;}
.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--teal-600);box-shadow:0 0 0 3px rgba(15,118,110,.10);}
.form-field textarea{resize:vertical;}
.field-err{font-size:11.5px;color:var(--red);font-weight:600;}
.form-err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);color:#991b1b;padding:10px 14px;border-radius:var(--radius-sm);font-size:13px;margin-top:12px;}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.danger-zone{border:1px solid rgba(220,38,38,.2)!important;}
.permissions-grid{display:flex;flex-direction:column;gap:8px;}
.perm-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--gray-100);font-size:13.5px;font-weight:500;color:var(--gray-700);}
.perm-row:last-child{border-bottom:none;}
.toggle{width:42px;height:23px;background:var(--gray-200);border-radius:12px;cursor:pointer;position:relative;transition:background .22s;flex-shrink:0;}
.toggle.on{background:var(--teal-600);}
.toggle-thumb{width:17px;height:17px;background:white;border-radius:50%;position:absolute;top:3px;left:3px;transition:transform .22s;box-shadow:0 2px 6px rgba(0,0,0,.18);}
.toggle.on .toggle-thumb{transform:translateX(19px);}
.mini-done-btn{background:linear-gradient(135deg,var(--teal-700),var(--teal-600));color:white;border:none;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;flex-shrink:0;margin-left:auto;}
.mini-done-btn:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(15,118,110,.35);}
.cp-banner-wrap{position:relative;border-radius:var(--radius);overflow:hidden;height:200px;background:linear-gradient(135deg,var(--teal-800),var(--teal-600));margin-bottom:20px;cursor:pointer;}
.cp-banner-wrap img{width:100%;height:100%;object-fit:cover;}
.cp-banner-overlay{position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;}
.cp-banner-wrap:hover .cp-banner-overlay{opacity:1;}
.cp-banner-text{position:absolute;bottom:0;left:0;right:0;padding:20px 24px;background:linear-gradient(transparent,rgba(0,0,0,.65));}
.cp-banner-name{font-size:26px;font-weight:800;color:white;letter-spacing:-.5px;}
.cp-banner-loc{font-size:14px;color:rgba(255,255,255,.8);margin-top:4px;}
.clinic-info-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;}
.clinic-info-chip{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--gray-700);background:rgba(255,255,255,.8);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.6);}
.chips-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.chip{display:inline-flex;align-items:center;gap:5px;background:var(--teal-50);border:1.5px solid var(--teal-100);color:var(--teal-800);padding:5px 12px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .18s;}
.chip.active{background:var(--teal-700);color:white;border-color:var(--teal-700);}
.chip-remove{background:none;border:none;cursor:pointer;color:inherit;font-size:13px;padding:0;line-height:1;}
.doctor-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
.doctor-card{background:rgba(255,255,255,.9);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.7);position:relative;transition:transform .2s;}
.doctor-card:hover{transform:translateY(-2px);}
.doctor-card.inactive{opacity:.6;}
.doc-card-banner{height:80px;background:linear-gradient(135deg,var(--teal-800),var(--teal-600));position:relative;}
.doc-card-photo-wrap{position:absolute;bottom:-28px;left:20px;}
.doc-card-photo{width:60px;height:60px;border-radius:50%;border:3px solid white;object-fit:cover;background:var(--teal-100);display:flex;align-items:center;justify-content:center;font-size:22px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.15);}
.doc-card-photo img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.doc-card-status{position:absolute;top:10px;right:12px;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;}
.doc-card-status.available{background:rgba(22,163,74,.9);color:white;}
.doc-card-status.unavailable{background:rgba(220,38,38,.85);color:white;}
.doc-card-body{padding:36px 20px 16px;}
.doc-card-name{font-size:17px;font-weight:800;color:var(--teal-900);}
.doc-card-qual{font-size:12.5px;color:var(--gray-500);margin-top:2px;}
.doc-card-admin-badge{background:linear-gradient(135deg,var(--amber),#d97706);color:white;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:8px;vertical-align:middle;}
.doc-card-divider{height:1px;background:var(--gray-100);margin:12px 0;}
.doc-card-detail{display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-size:13px;color:var(--gray-700);}
.doc-card-detail-icon{font-size:13px;flex-shrink:0;width:18px;text-align:center;margin-top:1px;}
.doc-card-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;}
.doc-card-spec{background:var(--teal-50);border:1px solid var(--teal-100);color:var(--teal-700);padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;}
.doc-card-lang{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;}
.doc-card-queue-block{background:linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.6));border:1px solid var(--teal-100);border-radius:var(--radius-sm);padding:10px 14px;margin:10px 0;display:flex;gap:16px;align-items:center;flex-wrap:wrap;}
.doc-card-queue-stat{text-align:center;}
.doc-card-queue-num{font-size:20px;font-weight:800;color:var(--teal-800);line-height:1;}
.doc-card-queue-label{font-size:9.5px;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;margin-top:2px;}
.doc-card-vacation{background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.25);color:#92400e;font-size:12px;font-weight:500;padding:6px 12px;border-radius:var(--radius-sm);margin:8px 0;}
.doc-card-actions{display:flex;gap:8px;margin-top:14px;padding:0 20px 16px;flex-wrap:wrap;}
.doc-edit-modal-banner{height:130px;background:linear-gradient(135deg,var(--teal-800),var(--teal-600));border-radius:12px 12px 0 0;position:relative;overflow:hidden;margin:-28px -28px 0;display:flex;align-items:flex-end;padding:16px 24px;}
.doc-edit-modal-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.doc-edit-modal-banner-overlay{position:absolute;inset:0;background:linear-gradient(transparent,rgba(0,0,0,.55));}
.doc-edit-header-info{position:relative;z-index:1;display:flex;align-items:flex-end;gap:16px;width:100%;}
.doc-edit-photo-btn{width:74px;height:74px;border-radius:50%;border:3px solid white;background:var(--teal-100);display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;overflow:hidden;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,.25);position:relative;transition:all .2s;}
.doc-edit-photo-btn:hover .doc-edit-photo-overlay{opacity:1;}
.doc-edit-photo-btn img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.doc-edit-photo-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:18px;opacity:0;transition:opacity .2s;border-radius:50%;}
.doc-edit-name-block{flex:1;}
.doc-edit-name{font-size:20px;font-weight:800;color:white;line-height:1.2;}
.doc-edit-subname{font-size:13px;color:rgba(255,255,255,.75);margin-top:3px;}
.doc-edit-status-btn{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:2px solid white;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:var(--font-main);}
.doc-edit-status-btn.active{background:rgba(22,163,74,.85);color:white;}
.doc-edit-status-btn.inactive{background:rgba(220,38,38,.8);color:white;}
.doc-edit-tabs{display:flex;gap:2px;padding:16px 0 0;border-bottom:2px solid var(--gray-100);margin:20px 0 18px;}
.doc-edit-tab{background:none;border:none;padding:8px 18px;font-family:var(--font-main);font-size:13.5px;font-weight:600;color:var(--gray-500);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;}
.doc-edit-tab.active{color:var(--teal-700);border-bottom-color:var(--teal-600);}
.doc-edit-tab:hover:not(.active){color:var(--teal-800);}
.doc-edit-section-title{font-size:11px;font-weight:700;color:var(--teal-700);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
.doc-edit-section-title::after{content:'';flex:1;height:1px;background:var(--teal-100);}
.charges-table{width:100%;border-collapse:collapse;margin-top:8px;}
.charges-table th{font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;padding:6px 10px;text-align:left;background:var(--gray-50);border-radius:6px;}
.charges-table td{padding:6px 4px;vertical-align:middle;}
.charges-add-row{display:flex;gap:8px;align-items:center;margin-top:10px;}
.charges-name-input{flex:2;background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);padding:9px 12px;font-family:var(--font-main);font-size:13px;color:var(--gray-900);outline:none;transition:border-color .18s;}
.charges-name-input:focus{border-color:var(--teal-600);box-shadow:0 0 0 3px rgba(15,118,110,.10);}
.charges-amount-input{flex:1;background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);padding:9px 12px;font-family:var(--font-main);font-size:13px;color:var(--gray-900);outline:none;transition:border-color .18s;}
.charges-amount-input:focus{border-color:var(--teal-600);box-shadow:0 0 0 3px rgba(15,118,110,.10);}
.charge-row-input{background:transparent;border:1.5px solid var(--gray-200);border-radius:8px;padding:7px 10px;font-family:var(--font-main);font-size:13px;color:var(--gray-900);outline:none;width:100%;transition:border-color .18s;}
.charge-row-input:focus{border-color:var(--teal-600);}
.charge-del-btn{background:rgba(220,38,38,.08);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;color:var(--red);font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .18s;}
.charge-del-btn:hover{background:rgba(220,38,38,.18);}
.availability-toggle{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.8));border:1.5px solid var(--teal-100);border-radius:var(--radius-sm);margin-bottom:14px;}
.availability-label{font-size:14px;font-weight:600;color:var(--teal-900);}
.availability-sub{font-size:12px;color:var(--gray-500);margin-top:2px;}
.availability-status{font-size:13px;font-weight:700;padding:4px 14px;border-radius:20px;}
.availability-status.on{background:rgba(22,163,74,.12);color:#14532d;border:1px solid rgba(22,163,74,.3);}
.availability-status.off{background:rgba(220,38,38,.10);color:#dc2626;border:1px solid rgba(220,38,38,.25);}
.settings-tabs{display:flex;gap:4px;padding:4px;background:var(--gray-100);border-radius:14px;margin-bottom:28px;width:fit-content;}
.settings-tab{padding:9px 20px;border-radius:10px;border:none;background:transparent;font-family:var(--font-main);font-size:13px;font-weight:600;color:var(--gray-500);cursor:pointer;transition:all .18s;white-space:nowrap;}
.settings-tab.active{background:white;color:var(--teal-800);box-shadow:0 2px 8px rgba(0,0,0,.08);}
.settings-tab:hover:not(.active){color:var(--teal-700);}
.settings-section-card{background:white;border-radius:var(--radius);border:1px solid var(--gray-200);margin-bottom:16px;overflow:hidden;box-shadow:0 2px 12px rgba(15,118,110,.04);}
.settings-card-header{padding:20px 24px 16px;border-bottom:1px solid var(--gray-100);display:flex;align-items:center;gap:12px;}
.settings-card-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.settings-card-title{font-size:15px;font-weight:700;color:var(--teal-900);}
.settings-card-subtitle{font-size:12.5px;color:var(--gray-500);margin-top:2px;}
.settings-card-body{padding:20px 24px;}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--gray-50);gap:16px;}
.settings-row:last-child{border-bottom:none;padding-bottom:0;}
.settings-row-label{font-size:14px;font-weight:600;color:var(--gray-800);}
.settings-row-desc{font-size:12px;color:var(--gray-500);margin-top:3px;line-height:1.5;}
.settings-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.settings-info-badge{display:inline-flex;align-items:center;gap:6px;background:var(--teal-50);border:1px solid var(--teal-100);color:var(--teal-700);font-size:12.5px;font-weight:600;padding:6px 14px;border-radius:20px;margin-right:8px;margin-bottom:6px;}
.danger-card{background:white;border-radius:var(--radius);border:1.5px solid rgba(220,38,38,.18);margin-bottom:16px;overflow:hidden;}
.danger-card-header{padding:20px 24px 16px;border-bottom:1px solid rgba(220,38,38,.08);display:flex;align-items:center;gap:12px;}
.danger-action-row{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid var(--gray-50);gap:16px;flex-wrap:wrap;}
.danger-action-row:last-child{border-bottom:none;}
.danger-action-title{font-size:14px;font-weight:600;color:var(--gray-800);}
.danger-action-desc{font-size:12px;color:var(--gray-500);margin-top:3px;}
.btn-danger-sm{padding:8px 18px;background:rgba(220,38,38,.07);border:1.5px solid rgba(220,38,38,.22);color:var(--red);border-radius:var(--radius-sm);font-family:var(--font-main);font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;}
.btn-danger-sm:hover{background:rgba(220,38,38,.15);}
.theme-opt{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px;border-radius:var(--radius-sm);border:2px solid var(--gray-200);cursor:pointer;transition:all .2s;background:var(--gray-50);flex:1;min-width:90px;}
.theme-opt.sel{border-color:var(--teal-600);background:var(--teal-50);}
.theme-opt-preview{width:52px;height:34px;border-radius:7px;border:1px solid var(--gray-200);}
.theme-opt-label{font-size:12.5px;font-weight:600;color:var(--gray-700);}
.theme-opt.sel .theme-opt-label{color:var(--teal-700);}
.photo-section{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:22px;}
.photo-circle{width:96px;height:96px;background:var(--teal-100);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:38px;cursor:pointer;position:relative;overflow:hidden;border:3px solid var(--teal-400);transition:all .2s;}
.photo-circle:hover .photo-overlay{opacity:1;}
.photo-circle img{width:100%;height:100%;object-fit:cover;}
.photo-overlay{position:absolute;inset:0;background:rgba(15,118,110,.62);display:flex;align-items:center;justify-content:center;font-size:22px;opacity:0;transition:opacity .2s;}
.crop-wrap{position:relative;width:100%;height:300px;overflow:hidden;background:#000;border-radius:var(--radius-sm);cursor:grab;}
.crop-wrap:active{cursor:grabbing;}
.crop-img{position:absolute;transform-origin:0 0;}
.crop-circle-mask{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
.crop-circle{width:220px;height:220px;border-radius:50%;border:3px dashed rgba(255,255,255,.7);box-shadow:0 0 0 9999px rgba(0,0,0,.55);}
.crop-rect-mask{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
.crop-rect{width:90%;height:160px;border:3px dashed rgba(255,255,255,.7);box-shadow:0 0 0 9999px rgba(0,0,0,.55);border-radius:8px;}
.doctor-filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
.doctor-filter-label{font-size:12px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;}
.reviews-top{display:grid;grid-template-columns:190px 1fr;gap:14px;margin-bottom:18px;}
.avg-rating{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;}
.big-rating{font-size:50px;font-weight:800;color:var(--teal-800);line-height:1;}
.stars{font-size:20px;color:var(--amber);letter-spacing:2px;}
.rating-bar{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:12.5px;color:var(--gray-600);}
.rbar-track{flex:1;height:7px;background:var(--gray-100);border-radius:4px;overflow:hidden;}
.rbar-fill{height:100%;background:linear-gradient(90deg,var(--teal-600),var(--teal-400));border-radius:4px;}
.reviews-list{display:flex;flex-direction:column;gap:12px;}
.review-top{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.review-avatar{width:38px;height:38px;background:var(--teal-100);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--teal-800);font-size:15px;flex-shrink:0;}
.review-stars{margin-left:auto;font-size:15px;color:var(--amber);}
.review-text{font-size:13.5px;color:var(--gray-600);font-style:italic;line-height:1.6;}
.pw-strength-bar{display:flex;gap:4px;margin-top:6px;}
.pw-seg{height:4px;flex:1;border-radius:2px;background:var(--gray-200);transition:background .2s;}
.pw-seg.weak{background:var(--red);}
.pw-seg.fair{background:var(--amber);}
.pw-seg.strong{background:var(--green);}
.pw-checks-mini{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;}
.pw-check-mini{font-size:10.5px;color:var(--gray-400);}
.pw-check-mini.ok{color:var(--green);}
.team-member-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--gray-100);}
.team-member-row:last-child{border-bottom:none;}
.team-avatar{width:40px;height:40px;border-radius:50%;background:var(--teal-100);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--teal-700);font-size:16px;flex-shrink:0;}
.team-info{flex:1;}
.team-name{font-size:14px;font-weight:600;color:var(--gray-900);}
.team-sub{font-size:12px;color:var(--gray-400);}
.team-actions{display:flex;gap:8px;align-items:center;}
`;

const API        = "http://localhost:5000/api";
const getToken   = () => localStorage.getItem("token");
const authHead   = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonHead   = () => ({ "Content-Type": "application/json", ...authHead() });
const getRole    = () => localStorage.getItem("role") || "doctor";
const isAdmin    = () => getRole() === "doctor";
const isSubDoc   = () => getRole() === "sub_doctor";
const isRecep    = () => getRole() === "receptionist";
const isDoctor   = () => isAdmin() || isSubDoc();
const clinicType    = () => localStorage.getItem("clinicType") || "single";
const isPolyclinic  = () => clinicType() === "polyclinic";

// ── FIX: resolve the current user's doctor ID correctly for all roles ──
const getMyDoctorId = () => {
  if (isAdmin()) return localStorage.getItem("userId") || null;
  if (isSubDoc()) return localStorage.getItem("subDoctorId") || null;
  return null;
};

const PERM_LABELS = {
  canManageQueue:     "Manage Queue (Live Queue)",
  canBookAppointment: "Book Appointments",
  canEditPatients:    "Patient Records",
  canChangeStatus:    "Change Clinic Status",
  canViewReports:     "Analysis",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Good night";
}
function cleanName(raw) { return (raw || "").replace(/^dr\.?\s*/i, "").trim() || "Doctor"; }
function isStrongPassword(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}
function calcWaitTimes(waitingQueue, _tick) {
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

function useMinuteTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}

function PwStrengthMini({ password }) {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "A-Z", ok: /[A-Z]/.test(password) },
    { label: "a-z", ok: /[a-z]/.test(password) },
    { label: "0-9", ok: /[0-9]/.test(password) },
    { label: "!@#", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.ok).length;
  const level = passed <= 2 ? "weak" : passed <= 3 ? "fair" : "strong";
  return (
    <div>
      <div className="pw-strength-bar">
        {[1,2,3,4,5].map(i => <div key={i} className={`pw-seg ${i <= passed ? level : ""}`}/>)}
      </div>
      <div className="pw-checks-mini">
        {checks.map((c,i) => <span key={i} className={`pw-check-mini ${c.ok ? "ok" : ""}`}>{c.ok ? "✓" : "○"} {c.label}</span>)}
      </div>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (
    <div className="live-clock">
      <span className="lc-time">{String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}:{String(now.getSeconds()).padStart(2,"0")}</span>
      <span className="lc-date">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}</span>
    </div>
  );
}

function DonutChart({ waiting = 0, completed = 0 }) {
  const total = waiting + completed;
  if (!total) return <div className="donut-empty">No patients yet</div>;
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const cPct = (completed / total) * circ, wPct = (waiting / total) * circ;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2f4f1" strokeWidth="16"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0f766e" strokeWidth="16" strokeDasharray={`${cPct} ${circ}`} strokeDashoffset={circ*.25} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray={`${wPct} ${circ}`} strokeDashoffset={circ*.25-cPct} strokeLinecap="round"/>
      <text x={cx} y={cy-5} textAnchor="middle" fill="#0f766e" fontSize="20" fontWeight="800">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fill="#9ca3af" fontSize="10">Total</text>
    </svg>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box${wide ? " wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CropModal({ src, circular, onConfirm, onClose }) {
  const canvasRef = useRef();
  const [pos, setPos]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(null);
  const imgRef = useRef(new Image());
  useEffect(() => { imgRef.current.src = src; }, [src]);
  const onMouseDown = e => setDrag({ sx: e.clientX - pos.x, sy: e.clientY - pos.y });
  const onMouseMove = e => { if (!drag) return; setPos({ x: e.clientX - drag.sx, y: e.clientY - drag.sy }); };
  const onMouseUp   = () => setDrag(null);
  const confirm = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const size   = circular ? 220 : 640;
    const h      = circular ? 220 : 200;
    canvas.width = size; canvas.height = h;
    if (circular) { ctx.beginPath(); ctx.arc(110,110,110,0,Math.PI*2); ctx.clip(); }
    const wrapW=400,wrapH=300,centerX=wrapW/2,centerY=wrapH/2;
    const cropW=circular?220:400*0.9,cropH=circular?220:160;
    const srcX=(centerX-cropW/2-pos.x)/zoom,srcY=(centerY-cropH/2-pos.y)/zoom;
    const srcW=cropW/zoom,srcH=cropH/zoom;
    ctx.drawImage(imgRef.current,srcX,srcY,srcW,srcH,0,0,size,h);
    onConfirm(canvas.toDataURL("image/jpeg",0.92));
  };
  return (
    <Modal title="📷 Adjust Photo" onClose={onClose}>
      <canvas ref={canvasRef} style={{ display:"none" }}/>
      <div className="crop-wrap" style={{ width:"100%",height:300 }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <img src={src} alt="crop" className="crop-img"
          style={{ transform:`translate(${pos.x}px,${pos.y}px) scale(${zoom})`,userSelect:"none",pointerEvents:"none",maxWidth:"none" }}/>
        {circular
          ? <div className="crop-circle-mask"><div className="crop-circle"/></div>
          : <div className="crop-rect-mask"><div className="crop-rect"/></div>
        }
      </div>
      <div style={{ padding:"12px 0",display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:13,color:"var(--gray-500)" }}>🔍 Zoom</span>
        <input type="range" min="0.5" max="3" step="0.05" value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{ flex:1 }}/>
        <span style={{ fontSize:13,color:"var(--gray-600)",width:36 }}>{zoom.toFixed(1)}×</span>
      </div>
      <p style={{ fontSize:12,color:"var(--gray-400)",textAlign:"center",marginBottom:16 }}>Drag to reposition · Use slider to zoom</p>
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={confirm}>✅ Use This Photo</button>
      </div>
    </Modal>
  );
}

/* ─── Billing Done Modal ─── */
function BillingDoneModal({ patient, onConfirm, onClose }) {
  const [bill, setBill] = useState({ visitCharge:"", injectionCharge:"", medicineCharge:"", notes:"" });
  const total = (Number(bill.visitCharge)||0)+(Number(bill.injectionCharge)||0)+(Number(bill.medicineCharge)||0)+(Number(bill.notes)||0);
  return (
    <Modal title={`✓ Done — ${patient.patientName}`} onClose={onClose}>
      <p style={{ fontSize:13,color:"var(--gray-500)",marginBottom:16 }}>
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
        <button className="btn-ghost" onClick={()=>onConfirm(null)}>Skip — Mark Done</button>
        <button className="btn-primary" onClick={()=>onConfirm(bill)} disabled={total===0}>💾 Save Bill &amp; Done</button>
      </div>
    </Modal>
  );
}

/* ─── Add Patient Modal ─── */
function AddPatientModal({ onClose, onAdded, doctors }) {
  const [form,setForm] = useState({ patientName:"",mobile:"",gender:"Male",age:"",assignedDoctorId:"",assignedDoctorType:"admin" });
  const [errs,setErrs] = useState({});
  const [loading,setLoading] = useState(false);
  const [serverErr,setServerErr] = useState("");
  const sf = (k,v) => { setForm(p=>({...p,[k]:v})); setErrs(p=>({...p,[k]:""})); };
  const validate = () => {
    const e={};
    if (!form.patientName.trim()) e.patientName="Patient name is required";
    if (!form.mobile) e.mobile="Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile="Must be exactly 10 digits";
    if (!form.age||Number(form.age)<1) e.age="Please enter a valid age";
    if (isPolyclinic()&&isRecep()&&!form.assignedDoctorId) e.assignedDoctorId="Please assign a doctor";
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/queue/add`,{method:"POST",headers:jsonHead(),body:JSON.stringify(form)});
      const data = await res.json();
      if (!res.ok) { setServerErr(data.message||"Failed"); setLoading(false); return; }
      await onAdded(); onClose();
    } catch { setServerErr("Cannot reach server."); }
    setLoading(false);
  };
  return (
    <Modal title="🏥 Add Walk-In Patient" onClose={onClose}>
      <div className="form-grid">
        <div className="form-field full"><label>Patient Name *</label><input value={form.patientName} onChange={e=>sf("patientName",e.target.value.replace(/[^a-zA-Z\s]/g,""))} placeholder="Full name" autoFocus onKeyDown={e=>e.key==="Enter"&&submit()}/>{errs.patientName&&<span className="field-err">{errs.patientName}</span>}</div>
        <div className="form-field"><label>Mobile * (10 digits)</label><input value={form.mobile} onChange={e=>sf("mobile",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit" inputMode="numeric" maxLength={10}/>{errs.mobile&&<span className="field-err">{errs.mobile}</span>}</div>
        <div className="form-field"><label>Gender</label><select value={form.gender} onChange={e=>sf("gender",e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div className="form-field"><label>Age *</label><input type="number" value={form.age} onChange={e=>sf("age",e.target.value)} placeholder="Age" min={1} max={120}/>{errs.age&&<span className="field-err">{errs.age}</span>}</div>
        {isPolyclinic()&&doctors&&doctors.length>0&&(
          <div className="form-field full">
            <label>Assign Doctor {isRecep()?"*":""}</label>
            <select value={form.assignedDoctorId} onChange={e=>{
              const sel=doctors.find(d=>String(d._id)===e.target.value);
              sf("assignedDoctorId",e.target.value);
              sf("assignedDoctorType",sel?.type||"admin");
            }}>
              <option value="">— Select doctor —</option>
              {doctors.map(d=><option key={d._id} value={d._id}>{d.name}{d.isAdmin?" (Admin)":""}</option>)}
            </select>
            {errs.assignedDoctorId&&<span className="field-err">{errs.assignedDoctorId}</span>}
          </div>
        )}
      </div>
      {serverErr&&<div className="form-err">⚠️ {serverErr}</div>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Adding…":"➕ Add to Queue"}</button>
      </div>
    </Modal>
  );
}

/* ─── Book Appointment Modal ─── */
function BookApptModal({ onClose, onBooked, doctors }) {
  const today = new Date().toISOString().split("T")[0];
  const [form,setForm] = useState({ name:"",mobile:"",gender:"Male",age:"",date:today,time:"",doctor:"",reason:"" });
  const [errs,setErrs] = useState({});
  const [loading,setLoading] = useState(false);
  const [serverErr,setServerErr] = useState("");
  const sf = (k,v) => { setForm(p=>({...p,[k]:v})); setErrs(p=>({...p,[k]:""})); };
  const validate = () => {
    const e={};
    if (!form.name?.trim()) e.name="Patient name required";
    if (!form.mobile) e.mobile="Mobile required";
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile="10 digits";
    if (!form.date) e.date="Date required";
    if (!form.time) e.time="Time required";
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async () => {
    if (!validate()) return;
    setLoading(true); setServerErr("");
    try {
      const res = await fetch(`${API}/appointments/book`,{method:"POST",headers:jsonHead(),body:JSON.stringify(form)});
      const data = await res.json();
      if (!res.ok) { setServerErr(data.message||"Failed"); setLoading(false); return; }
      await onBooked(); onClose();
    } catch { setServerErr("Cannot reach server."); }
    setLoading(false);
  };
  return (
    <Modal title="📅 Book Appointment" onClose={onClose}>
      <div className="form-grid">
        <div className="form-field full"><label>Patient Name *</label><input value={form.name} onChange={e=>sf("name",e.target.value.replace(/[^a-zA-Z\s]/g,""))} autoFocus/>{errs.name&&<span className="field-err">{errs.name}</span>}</div>
        <div className="form-field"><label>Mobile *</label><input value={form.mobile} onChange={e=>sf("mobile",e.target.value.replace(/\D/g,"").slice(0,10))} inputMode="numeric" maxLength={10}/>{errs.mobile&&<span className="field-err">{errs.mobile}</span>}</div>
        <div className="form-field"><label>Gender</label><select value={form.gender} onChange={e=>sf("gender",e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div className="form-field"><label>Age</label><input type="number" value={form.age} onChange={e=>sf("age",e.target.value)}/></div>
        <div className="form-field"><label>Date *</label><input type="date" value={form.date} min={today} onChange={e=>sf("date",e.target.value)}/>{errs.date&&<span className="field-err">{errs.date}</span>}</div>
        <div className="form-field"><label>Time *</label><input type="time" value={form.time} onChange={e=>sf("time",e.target.value)}/>{errs.time&&<span className="field-err">{errs.time}</span>}</div>
        <div className="form-field">
          <label>Doctor</label>
          {isPolyclinic()&&doctors?.length>0
            ?<select value={form.doctor} onChange={e=>sf("doctor",e.target.value)}><option value="">— Select —</option>{doctors.map(d=><option key={d._id} value={d.name}>{d.name}</option>)}</select>
            :<input value={form.doctor} onChange={e=>sf("doctor",e.target.value)} placeholder="Doctor name"/>
          }
        </div>
        <div className="form-field"><label>Reason</label><input value={form.reason} onChange={e=>sf("reason",e.target.value)} placeholder="e.g. Fever"/></div>
      </div>
      {serverErr&&<div className="form-err">⚠️ {serverErr}</div>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Booking…":"✅ Confirm Booking"}</button>
      </div>
    </Modal>
  );
}

/* ─── Overview ─── */
function Overview({ queue,stats,appointments,avgConsultTime,clinicOpen,setClinicOpen,onAddPatient,onBookAppt,setSection,onApptStatusChange,onMarkDone,onCancelPatient,doctors }) {  const doctorName = cleanName(localStorage.getItem("doctorName"));
  const waiting    = queue.filter(p=>p.status==="waiting");
  const completed  = stats.find(s=>s._id==="done")?.count||0;
  const total      = queue.length;
  const tick       = useMinuteTick();
  const waitTimes  = calcWaitTimes(waiting, tick);
  const maxWait    = waitTimes.length?waitTimes[waitTimes.length-1]:0;
  const todayAppts = appointments.filter(a=>a.status!=="cancelled").sort((a,b)=>(a.time||"").localeCompare(b.time||""));
  const pendingCount = appointments.filter(a=>a.status==="scheduled").length;
  const SC = { scheduled:"#0f766e",arrived:"#3b82f6",completed:"#16a34a",cancelled:"#dc2626",delayed:"#f59e0b" };
  const markArrived = async (a) => {
    const res=await fetch(`${API}/appointments/arrived/${a._id}`,{method:"PATCH",headers:authHead()});
    const data=await res.json();
    if (!res.ok){alert(data.message);return;}
    onApptStatusChange();
  };
  const cancelAppt = async (id) => {
    await fetch(`${API}/appointments/status/${id}`,{method:"PATCH",headers:jsonHead(),body:JSON.stringify({status:"cancelled"})});
    onApptStatusChange();
  };
  return (
    <div className="section-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">{getGreeting()}, {isSubDoc()?"Dr. ":""}{isAdmin()?"Dr. ":""}{doctorName} 👋</h2>
          <p className="section-sub">Here's what's happening at your clinic today</p>
        </div>
        <div className="header-actions">
          <LiveClock/>
          <button className="btn-primary" onClick={onAddPatient}>➕ Add Walk-In</button>
          <button className="btn-outline" onClick={onBookAppt}>📅 Book Appointment</button>
        </div>
      </div>
      {avgConsultTime>0&&<div className={`alert-banner ${avgConsultTime>14?"alert-warn":"alert-ok"}`}><strong>⏱ Avg consultation today: {avgConsultTime} min {avgConsultTime>14?"— running longer ⚠️":"— on track 👍"}</strong></div>}
      <div className="stat-grid">
        <div className="stat-card teal"><span className="stat-icon">👥</span><div><p className="stat-label">In Queue</p><h3 className="stat-num">{waiting.length}</h3></div></div>
        <div className="stat-card amber"><span className="stat-icon">⏱</span><div><p className="stat-label">Max Wait</p><h3 className="stat-num">{maxWait}<span className="stat-unit"> min</span></h3></div></div>
        <div className="stat-card purple"><span className="stat-icon">📋</span><div><p className="stat-label">Today's Patients</p><h3 className="stat-num">{total}</h3></div></div>
        <div className="stat-card green"><span className="stat-icon">✅</span><div><p className="stat-label">Completed</p><h3 className="stat-num">{completed}</h3></div></div>
        {isAdmin()&&(
          <div className={`stat-card clinic-toggle${!clinicOpen?" closed":""}`} onClick={()=>setClinicOpen(o=>!o)}>
            <span className="stat-icon">{clinicOpen?"🟢":"🔴"}</span>
            <div><p className="stat-label">Clinic Status</p><h3 className={`stat-num ${clinicOpen?"open-text":"closed-text"}`} style={{fontSize:17}}>{clinicOpen?"Open":"Closed"}</h3><p className="stat-toggle-hint">Click to toggle</p></div>
          </div>
        )}
      </div>
      <div className="overview-lower-2col">
        <div className="glass-card">
          <div className="card-head"><h4>🏥 Live Queue Preview</h4><button className="link-btn" onClick={()=>setSection("queue")}>View All →</button></div>
          {waiting.length===0
            ?<div className="empty-state">✨ No patients waiting right now</div>
            :waiting.slice(0,8).map((p,i)=>(
              <div className="mini-patient" key={p._id}>
                <div className="token-badge">T-{String(p.tokenNumber||i+1).padStart(2,"0")}</div>
                <span className="patient-name">{p.patientName}</span>
                {p.isReturning&&<span className="returning-tag">↩</span>}
                <span className="wait-chip">~{waitTimes[i]??avgConsultTime} min</span>
<button className="mini-done-btn" onClick={()=>onMarkDone(p._id)}>✓</button>
<button onClick={()=>onCancelPatient(p._id)} style={{background:"rgba(220,38,38,.08)",border:"1px solid rgba(220,38,38,.2)",color:"#dc2626",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>              </div>
            ))
          }
        </div>
        <div className="glass-card">
          <div className="card-head">
            <h4>📅 Today's Appointments{pendingCount>0&&<span className="pending-badge">{pendingCount}</span>}</h4>
            <button className="link-btn" onClick={()=>setSection("appointments")}>View All →</button>
          </div>
          {todayAppts.length===0
            ?<div className="empty-state">📅 No appointments today</div>
            :todayAppts.slice(0,8).map((a,i)=>(
              <div className="appt-compact-row" key={a._id||i}>
                <div className="acr-left">
                  <span className="token-badge sm">{String(i+1).padStart(2,"0")}</span>
                  <div><strong className="acr-name">{a.name||a.patientName}</strong><span className="acr-meta">⏰ {a.time}{a.gender?` · ${a.gender}`:""}</span></div>
                </div>
                <div className="acr-right">
                  <span className="status-chip" style={{background:SC[a.status]||"#0f766e",fontSize:9.5,padding:"2px 7px"}}>{a.status}</span>
                  {a.status==="scheduled"&&<button className="acr-btn acr-arrived" onClick={()=>markArrived(a)}>👋</button>}
                  {(a.status==="scheduled"||a.status==="delayed")&&<button className="acr-btn acr-cancel" onClick={()=>cancelAppt(a._id)}>✕</button>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Live Queue ─── */
function LiveQueue({ queue,stats,onMarkDone,onCancelPatient,onAddPatient,avgConsultTime,doctors,doctorFilter,setDoctorFilter }) {  const tick      = useMinuteTick();
  const waiting   = queue.filter(p=>p.status==="waiting");
  const done      = queue.filter(p=>p.status==="done");
  const totalDone = stats.find(s=>s._id==="done")?.count||0;
  const waitTimes = calcWaitTimes(waiting, tick);
  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Live Queue</h2><p className="section-sub">Real-time queue — click ✓ Done when patient leaves</p></div>
        <div className="header-actions"><LiveClock/><button className="btn-primary" onClick={onAddPatient}>➕ Add Patient</button></div>
      </div>
      {isAdmin()&&isPolyclinic()&&doctors?.length>0&&(
        <div className="doctor-filter-bar">
          <span className="doctor-filter-label">Filter:</span>
          <button className={`tab${!doctorFilter?" active":""}`} onClick={()=>setDoctorFilter("")}>All Doctors</button>
          {doctors.map(d=>(
            <button key={d._id} className={`tab${doctorFilter===String(d._id)?" active":""}`} onClick={()=>setDoctorFilter(String(d._id))}>
              {d.name}{d.isAdmin?" (You)":""}
            </button>
          ))}
        </div>
      )}
      <div className="queue-layout">
        <div className="glass-card">
          <div className="card-head"><h4>⏳ Waiting ({waiting.length})</h4><span className="live-badge">● Live</span></div>
          {waiting.length===0
            ?<div className="empty-state">✨ Queue is clear!</div>
            :waiting.map((p,i)=>(
              <div className="queue-row" key={p._id}>
                <div className="token-badge lg">T-{String(p.tokenNumber||i+1).padStart(2,"0")}</div>
                <div className="patient-info">
                  <strong>{p.patientName}</strong>
                  <span>{p.mobile||"—"} · {p.gender||"—"} · Age {p.age||"—"}{p.source==="appointment"&&<span className="appt-tag"> 📅 Appt</span>}</span>
                </div>
                <div className="queue-meta">
                  {p.isReturning&&<span className="returning-tag">↩ Return</span>}
                  <span className="wait-chip">~{waitTimes[i]??avgConsultTime} min</span>
                </div>
<button className="done-btn" onClick={()=>onMarkDone(p._id)}>✓ Done</button>
<button onClick={()=>onCancelPatient(p._id)} style={{background:"rgba(220,38,38,.08)",border:"1.5px solid rgba(220,38,38,.25)",color:"#dc2626",padding:"8px 14px",borderRadius:50,fontFamily:"var(--font-main)",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>✕ No Show</button>              </div>
            ))
          }
        </div>
        <div className="queue-side">
          <div className="glass-card" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,textAlign:"center"}}>
            <h4 style={{fontSize:14.5,fontWeight:700,color:"var(--teal-900)"}}>📊 Today's Chart</h4>
            <div className="donut-center"><DonutChart waiting={waiting.length} completed={totalDone}/></div>
            <div className="legend"><span className="leg-dot teal-dot"/> Done ({totalDone}) <span className="leg-dot amber-dot"/> Waiting ({waiting.length})</div>
          </div>
          <div className="glass-card">
            <div className="card-head"><h4>✅ Completed ({done.length})</h4></div>
            {done.length===0
              ?<p className="muted" style={{padding:"8px 0"}}>None yet</p>
              :done.slice(0,8).map((p,i)=>(
                <div className="done-row" key={p._id||i}>
                  <span className="done-check">✓</span>
                  <span className="done-name">{p.patientName}</span>
                  {p.consultDuration>0&&<span className="muted" style={{marginLeft:"auto",fontSize:11}}>{p.consultDuration}m</span>}
                  {p.billing?.billingPending&&<span className="bill-pending-chip" style={{fontSize:10,padding:"2px 6px"}}>₹ Pending</span>}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Appointments ─── */
function Appointments({ onQueueRefresh, doctors }) {
  const [appts,setAppts]       = useState([]);
  const [filter,setFilter]     = useState("all");
  const [selDate,setSelDate]   = useState(new Date().toISOString().split("T")[0]);
  const [showModal,setShowModal] = useState(false);
  const load = useCallback(async()=>{
    try {
      const r=await fetch(`${API}/appointments/by-date?date=${selDate}`,{headers:authHead()});
      const data=await r.json();
      const now = new Date();
      const processed = (Array.isArray(data)?data:[]).map(a => {
        if (a.status==="scheduled" && a.time) {
          const [h,m] = a.time.split(":").map(Number);
          const scheduled = new Date();
          scheduled.setHours(h,m,0,0);
          if (now > scheduled) return {...a, status:"delayed"};
        }
        return a;
      });
      setAppts(processed);
    } catch { setAppts([]); }
},[selDate]);  useEffect(()=>{load();},[load]);
  const updateStatus = async(id,status)=>{
    await fetch(`${API}/appointments/status/${id}`,{method:"PATCH",headers:jsonHead(),body:JSON.stringify({status})});
    load(); onQueueRefresh?.();
  };
  const markArrived = async(a)=>{
    const r=await fetch(`${API}/appointments/arrived/${a._id}`,{method:"PATCH",headers:authHead()});
    const data=await r.json ();
    if (!r.ok){alert(data.message);return;}
    await load(); onQueueRefresh?.();
  };
  const SC       = {scheduled:"#0f766e",arrived:"#3b82f6",completed:"#16a34a",cancelled:"#dc2626",delayed:"#f59e0b",no_show:"#6b7280"};
  const filtered = filter==="all"?appts:appts.filter(a=>a.status===filter);
  const C        = {scheduled:0,arrived:0,completed:0,cancelled:0};
  appts.forEach(a=>{if(C[a.status]!==undefined)C[a.status]++;});
  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Appointments</h2><p className="section-sub">Book and manage patient appointments by date</p></div>
        <div className="header-actions">
          <input type="date" className="date-input" value={selDate} onChange={e=>setSelDate(e.target.value)}/>
          <button className="btn-primary" onClick={()=>setShowModal(true)}>📅 Book Appointment</button>
        </div>
      </div>
      <div className="appt-stats">
        {[["Scheduled",C.scheduled,"#0f766e"],["Arrived",C.arrived,"#3b82f6"],["Completed",C.completed,"#16a34a"],["Cancelled",C.cancelled,"#dc2626"]].map(([l,v,c])=>(
          <div className="glass-card appt-stat" key={l}><p className="stat-label">{l}</p><h3 style={{color:c,fontSize:28,fontWeight:800,marginTop:4}}>{v}</h3></div>
        ))}
      </div>
      <div className="filter-tabs">
        {["all","scheduled","arrived","completed","cancelled","delayed","no_show"].map(t=>(
          <button key={t} className={`tab ${filter===t?"active":""}`} onClick={()=>setFilter(t)}>{t.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</button>
        ))}
      </div>
      <div className="glass-card">
        {filtered.length===0
  ?<div className="empty-state">📅 No appointments for this date</div>
  :filtered.map((a,i)=>{
    const isDelayed = a.status==="delayed";
    const scheduledTime = a.time;
    const arrivedTime = a.arrivedAt ? new Date(a.arrivedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : null;
    let delayMins = null;
    if (isDelayed && a.arrivedAt && a.time) {
      const [h,m] = a.time.split(":").map(Number);
      const scheduled = new Date(a.arrivedAt);
      scheduled.setHours(h,m,0,0);
      delayMins = Math.round((new Date(a.arrivedAt)-scheduled)/60000);
    }
    return (
            <div className="appt-row" key={a._id||i}>
              <div className="appt-left"><div className="token-badge">{String(i+1).padStart(2,"0")}</div><div><strong>{a.name||a.patientName}</strong><span className="muted"> · {a.mobile||"—"} · {a.gender||"—"}{a.reason?` · ${a.reason}`:""}{a.doctor?` · Dr. ${a.doctor}`:""}</span></div></div>
              <div className="appt-right">
  <span className="time-chip">⏰ {a.time}</span>
  {isDelayed && delayMins !== null && (
    <span style={{background:"rgba(245,158,11,.15)",color:"#92400e",fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,whiteSpace:"nowrap"}}>
      ⏳ {delayMins > 0 ? `${delayMins} min late` : "On time"}
    </span>
  )}
  {isDelayed && arrivedTime && (
    <span style={{fontSize:11,color:"var(--gray-500)"}}>Arrived {arrivedTime}</span>
  )}
  <span className="status-chip" style={{background:SC[a.status]||"#0f766e"}}>{a.status}</span>
  {a.status==="scheduled"&&<>
    <button className="arrived-btn" onClick={()=>markArrived(a)}>👋 Arrived</button>
    <button className="acr-btn acr-noshow" onClick={()=>updateStatus(a._id,"no_show")}>🚫</button>
    <button className="acr-btn acr-cancel" onClick={()=>updateStatus(a._id,"cancelled")}>✕</button>
  </>}
  {a.status==="delayed"&&<>
    <button className="arrived-btn" onClick={()=>markArrived(a)}>👋 Arrived</button>
    <button className="acr-btn acr-cancel" onClick={()=>updateStatus(a._id,"cancelled")}>✕</button>
  </>}
  {a.status==="arrived"&&<button className="done-btn" style={{padding:"6px 14px",fontSize:12}} onClick={()=>updateStatus(a._id,"completed")}>✓ Done</button>}
</div>
            </div>
          );
  })
}
      </div>
      {showModal&&<BookApptModal onClose={()=>setShowModal(false)} onBooked={load} doctors={doctors}/>}
    </div>
  );
}

/* ─── Patient Records ─── */
function PatientRecords({ refreshTrigger }) {
  const [records,setRecords]   = useState([]);
  const [date,setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [search,setSearch]     = useState("");
  const [showBill,setShowBill] = useState(null);
  const [bill,setBill]         = useState({ visitCharge:"",injectionCharge:"",medicineCharge:"",notes:"" });
  const [loadingRecords,setLoadingRecords] = useState(false);
  const load = useCallback(async () => {
  setLoadingRecords(true);
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
          .filter(a => ["cancelled","no_show"].includes(a.status))
          .filter(a => !qRecords.some(q => q.mobile === a.mobile && q.createdAt?.slice(0,10) === date))
          .map(a => ({
            _id: a._id,
            patientName: a.name || a.patientName,
            mobile: a.mobile,
            gender: a.gender,
            age: a.age,
            status: a.status,
            tokenNumber: "—",
            createdAt: a.createdAt,
            source: "appointment",
            billing: null,
            consultDuration: 0,
          }))
      : [];
    setRecords([...qRecords, ...apptRecords]);
  } catch { setRecords([]); }
  setLoadingRecords(false);
}, [date]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (refreshTrigger === 0) return;
    setLoadingRecords(true);
    const today = new Date().toISOString().split("T")[0];
    fetch(`${API}/queue/history?date=${today}`, { headers: authHead() })
      .then(r => r.json())
      .then(data => { setRecords(Array.isArray(data) ? data : []); setDate(today); })
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }, [refreshTrigger]);
  const filtered = records.filter(r =>
    r.patientName?.toLowerCase().includes(search.toLowerCase()) || r.mobile?.includes(search)
  );
  const avgDur = (() => {
    const v = filtered.filter(r => r.consultDuration > 0);
    return v.length ? Math.round(v.reduce((a,r) => a + r.consultDuration, 0) / v.length) : null;
  })();
  const totalBilled = !isRecep()
    ? filtered.reduce((acc,r) => { if (!r.billing) return acc; return acc + Number(r.billing.visitCharge||0) + Number(r.billing.injectionCharge||0) + Number(r.billing.medicineCharge||0); }, 0)
    : 0;
  const pendingBillingCount = filtered.filter(r => r.billing?.billingPending && !r.billing?.isPaid).length;
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
    method:"PATCH", headers:jsonHead(), body:JSON.stringify(payload)
  }).catch(()=>null);
  if (res && res.ok) {
    const data = await res.json();
    setRecords(prev => prev.map(r => r._id === showBill._id ? data.patient : r));
  }
  setShowBill(null);
  load();
};
  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Patient Records</h2><p className="section-sub">Day-wise history, consultation times &amp; billing</p></div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          {pendingBillingCount>0&&<div className="alert-warn" style={{padding:"6px 14px",borderRadius:50,fontSize:13,marginBottom:0}}>⚠️ {pendingBillingCount} billing pending</div>}
          {!isRecep()&&totalBilled>0&&<div className="revenue-badge">💰 Revenue: <strong>₹{totalBilled}</strong></div>}
        </div>
      </div>
      {avgDur&&<div className={`alert-banner ${avgDur>14?"alert-warn":"alert-ok"}`}><strong>⏱ Avg consultation: {avgDur} min {avgDur>14?"— running long ⚠️":"— on track 👍"}</strong></div>}
      <div className="records-toolbar">
        <input className="search-input" placeholder="🔍 Search name or mobile…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <input type="date" className="date-input" value={date} onChange={e=>setDate(e.target.value)}/>
        <span className="record-count">{filtered.length} record{filtered.length!==1?"s":""}</span>
      </div>
      <div className="glass-card table-card">
        <table className="records-table">
          <thead><tr><th>#</th><th>Token</th><th>Name</th><th>Gender</th><th>Age</th><th>Mobile</th><th>Status</th><th>Consult</th><th>Billing</th><th>Added</th></tr></thead>
          <tbody>
            {loadingRecords
              ?<tr><td colSpan={10} className="empty-row">⏳ Loading…</td></tr>
              :filtered.length===0
              ?<tr><td colSpan={10} className="empty-row">📋 No records for this date</td></tr>
              :filtered.map((r,i)=>{
                const b = r.billing || {};
                const amt = Number(b.visitCharge||0)+Number(b.injectionCharge||0)+Number(b.medicineCharge||0);
                const isPending = (b.billingPending===true && !b.isPaid) || (r.status==="done" && amt===0 && !b.isPaid);
                return (
                  <tr key={r._id||i} className={isPending?"billing-pending-row":""}>
                    <td className="muted">{i+1}</td>
                    <td><span className="token-badge sm">T-{String(r.tokenNumber||i+1).padStart(2,"0")}</span></td>
                    <td><strong>{r.patientName}</strong>{r.isReturning&&<span className="returning-tag" style={{marginLeft:5}}>↩</span>}</td>
                    <td>{r.gender||"—"}</td><td>{r.age||"—"}</td><td>{r.mobile||"—"}</td>
                    <td><span className={`status-chip ${r.status}`}>{r.status}</span></td>
                    <td className="muted">{r.consultDuration>0?`${r.consultDuration} min`:"—"}</td>
                    <td>
                      {amt > 0
                        ? <><span className="bill-chip">₹{amt}</span><button className="bill-btn" style={{marginLeft:6}} onClick={()=>openBillModal(r)}>✏️</button></>
                        : isPending
                          ? <button className="bill-btn" style={{borderColor:"var(--amber)",color:"#92400e"}} onClick={()=>openBillModal(r)}>⚠️ Fill Bill</button>
                          : <button className="bill-btn" onClick={()=>openBillModal(r)}>+ Bill</button>
                      }
                    </td>
                    <td className="muted">{r.createdAt?new Date(r.createdAt).toLocaleTimeString():"—"}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
      {showBill&&(
        <Modal title={`💰 Billing — ${showBill.patientName}`} onClose={()=>setShowBill(null)}>
          <div style={{fontSize:13,color:"var(--gray-500)",marginBottom:12}}>Token T-{String(showBill.tokenNumber||"").padStart(2,"0")} · {showBill.gender||""} · Age {showBill.age||"—"} · {showBill.mobile||""}</div>
          <div className="form-grid">
            <div className="form-field"><label>Visit Charge (₹)</label><input type="number" value={bill.visitCharge} onChange={e=>setBill({...bill,visitCharge:e.target.value})} placeholder="200" autoFocus/></div>
            <div className="form-field"><label>Injection Charge (₹)</label><input type="number" value={bill.injectionCharge} onChange={e=>setBill({...bill,injectionCharge:e.target.value})} placeholder="50"/></div>
            <div className="form-field"><label>Medicine Charge (₹)</label><input type="number" value={bill.medicineCharge} onChange={e=>setBill({...bill,medicineCharge:e.target.value})} placeholder="150"/></div>
<div className="form-field"><label>Extra Charges (₹)</label><input type="number" value={bill.notes} onChange={e=>setBill({...bill,notes:e.target.value})} placeholder="e.g. 50"/></div>          </div>
<div className="bill-total-row">Total: <strong>₹{(Number(bill.visitCharge)||0)+(Number(bill.injectionCharge)||0)+(Number(bill.medicineCharge)||0)+(Number(bill.notes)||0)}</strong></div>          <div className="modal-actions">
            <button className="btn-ghost" onClick={()=>setShowBill(null)}>Cancel</button>
            <button className="btn-primary" onClick={saveBill}>💾 Save Billing</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Analysis ─── */
function Analysis() {
  const [period,setPeriod] = useState("monthly");
  const [month,setMonth]   = useState(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;});
  const [year,setYear]     = useState(()=>String(new Date().getFullYear()));
  const [day,setDay]       = useState(()=>new Date().toISOString().split("T")[0]);
  const [data,setData]     = useState([]);
  const [history,setHistory] = useState([]);
  const [loading,setLoading] = useState(false);
  const fetchRangeHistory = async(dates) => {
    const results=[];
    for (const d of dates) {
      try { const r=await fetch(`${API}/queue/history?date=${d}`,{headers:authHead()}); const rec=await r.json(); if (Array.isArray(rec)) results.push(...rec); } catch {}
    }
    return results;
  };
  useEffect(()=>{
    setLoading(true);
    const load=async()=>{
      let volumeData=[],historyRecords=[];
      if (period==="daily") {
        try { const r=await fetch(`${API}/queue/history?date=${day}`,{headers:authHead()}); const recs=await r.json(); historyRecords=Array.isArray(recs)?recs:[]; const seenCount=historyRecords.filter(r=>r.status!=="cancelled").length; volumeData=[{label:new Date(day).toLocaleDateString("en-IN",{day:"numeric",month:"short"}),date:day,count:seenCount}]; } catch {}
      } else if (period==="weekly") {
        try { const r=await fetch(`${API}/queue/weekly`,{headers:authHead()}); const d=await r.json(); volumeData=Array.isArray(d)?d:[]; historyRecords=await fetchRangeHistory(volumeData.map(v=>v.date)); } catch {}
      } else if (period==="monthly") {
        try { const r=await fetch(`${API}/queue/monthly?month=${month}`,{headers:authHead()}); const d=await r.json(); volumeData=Array.isArray(d)?d:[]; const [yr,mo]=month.split("-").map(Number); const dim=new Date(yr,mo,0).getDate(); historyRecords=await fetchRangeHistory(Array.from({length:dim},(_,i)=>`${month}-${String(i+1).padStart(2,"0")}`)); } catch {}
      } else if (period==="yearly") {
        try { const MNAMES=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const months=[]; for (let m=1;m<=12;m++) { const mStr=`${year}-${String(m).padStart(2,"0")}`; const r=await fetch(`${API}/queue/monthly?month=${mStr}`,{headers:authHead()}); const d=await r.json(); months.push({label:MNAMES[m-1],date:mStr+"-01",count:Array.isArray(d)?d.reduce((a,x)=>a+x.count,0):0}); } volumeData=months; const curM=`${year}-${String(new Date().getMonth()+1).padStart(2,"0")}`; const dim=new Date(parseInt(year),new Date().getMonth()+1,0).getDate(); historyRecords=await fetchRangeHistory(Array.from({length:dim},(_,i)=>`${curM}-${String(i+1).padStart(2,"0")}`)); } catch {}
      }
      setData(volumeData); setHistory(historyRecords); setLoading(false);
    };
    load();
  },[period,month,year,day]);
  const totalPatients=data.reduce((a,d)=>a+d.count,0);
  const activeData=data.filter(d=>d.count>0);
  const avgPerPeriod=activeData.length?Math.round(totalPatients/activeData.length):0;
  const busiest=data.reduce((a,d)=>d.count>(a.count||0)?d:a,{});
  const max=Math.max(...data.map(d=>d.count),1);
  const totalRevenue=history.reduce((acc,r)=>{if(!r.billing)return acc;return acc+Number(r.billing.visitCharge||0)+Number(r.billing.injectionCharge||0)+Number(r.billing.medicineCharge||0);},0);
  const consulted=history.filter(r=>r.consultDuration>0);
  const avgConsult=consulted.length?Math.round(consulted.reduce((a,r)=>a+r.consultDuration,0)/consulted.length):0;
  const returningCount=history.filter(r=>r.isReturning).length;
  const newCount=history.filter(r=>!r.isReturning&&r.status!=="cancelled").length;
  const males=history.filter(r=>r.gender==="Male").length;
  const females=history.filter(r=>r.gender==="Female").length;
  const others=history.filter(r=>r.gender==="Other").length;
  const gTotal=males+females+others||1;
  const half=Math.floor(data.length/2);
  const firstH=data.slice(0,half).reduce((a,d)=>a+d.count,0);
  const secondH=data.slice(half).reduce((a,d)=>a+d.count,0);
  const trending=secondH>firstH?"up":secondH<firstH?"down":"flat";
  const LineChart=({data})=>{
    if (!data.length||data.every(d=>d.count===0)) return <div className="empty-state">No data for this period</div>;
    const w=560,h=140,pad=30,maxV=Math.max(...data.map(d=>d.count),1);
    const pts=data.map((d,i)=>`${pad+(i/(data.length-1||1))*(w-pad*2)},${h-pad-((d.count/maxV)*(h-pad*2))}`);
    const areaPoints=`${pad},${h-pad} ${pts.join(" ")} ${w-pad},${h-pad}`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:140}}>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity="0.25"/><stop offset="100%" stopColor="#0f766e" stopOpacity="0"/></linearGradient></defs>
        <polygon points={areaPoints} fill="url(#lg)"/>
        <polyline points={pts.join(" ")} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((d,i)=>{const x=pad+(i/(data.length-1||1))*(w-pad*2),y=h-pad-((d.count/maxV)*(h-pad*2));return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#0f766e" strokeWidth="2"/>;})}
        {data.filter((_,i)=>data.length<=14||i%Math.ceil(data.length/10)===0).map((d,i)=>{const origIdx=data.indexOf(d),x=pad+(origIdx/(data.length-1||1))*(w-pad*2);return <text key={i} x={x} y={h-4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>;})}
      </svg>
    );
  };
  const PERIODS=[{id:"daily",label:"Daily"},{id:"weekly",label:"Weekly"},{id:"monthly",label:"Monthly"},{id:"yearly",label:"Yearly"}];
  return (
    <div className="section-content">
      <div className="section-header">
        <div><h2 className="section-title">Analysis</h2><p className="section-sub">Clinic performance — patients, revenue &amp; efficiency</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",background:"rgba(255,255,255,.7)",borderRadius:50,padding:3,gap:2,border:"1.5px solid var(--gray-200)"}}>
            {PERIODS.map(p=><button key={p.id} onClick={()=>setPeriod(p.id)} style={{padding:"6px 14px",borderRadius:50,border:"none",fontFamily:"var(--font-main)",fontSize:13,fontWeight:600,cursor:"pointer",background:period===p.id?"var(--teal-700)":"transparent",color:period===p.id?"white":"var(--gray-600)",transition:"all .18s"}}>{p.label}</button>)}
          </div>
          {period==="daily"&&<input type="date" className="date-input" value={day} onChange={e=>setDay(e.target.value)}/>}
          {period==="monthly"&&<input type="month" className="date-input" value={month} onChange={e=>setMonth(e.target.value)}/>}
          {period==="yearly"&&<select className="date-input" value={year} onChange={e=>setYear(e.target.value)}>{[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}</select>}
        </div>
      </div>
      {loading&&<div className="alert-banner alert-ok" style={{textAlign:"center"}}>⏳ Loading…</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>
        {[{icon:"👥",label:"Total Patients",value:totalPatients,color:"teal"},{icon:"💰",label:"Revenue",value:`₹${totalRevenue}`,color:"green"},{icon:"📊",label:"Avg / Period",value:avgPerPeriod,color:"blue"},{icon:"🏆",label:"Busiest",value:busiest.label||"—",color:"amber"},{icon:"⏱",label:"Avg Consult",value:avgConsult?`${avgConsult}m`:"—",color:"purple"},{icon:"🆕",label:"New Patients",value:newCount,color:"teal"}].map((k,i)=>(
          <div key={i} className={`stat-card ${k.color}`} style={{flexDirection:"column",alignItems:"flex-start",gap:6,padding:"14px 16px"}}>
            <span style={{fontSize:20}}>{k.icon}</span>
            <p className="stat-label">{k.label}</p>
            <h3 className="stat-num" style={{fontSize:20}}>{k.value}</h3>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <div className="glass-card">
          <div className="card-head"><h4>📈 Patient Volume <span style={{fontSize:11,color:"var(--gray-400)",fontWeight:400}}>{trending==="up"?"▲ Trending Up":trending==="down"?"▼ Trending Down":"→ Stable"}</span></h4><span style={{fontSize:12,color:"var(--gray-400)"}}>{totalPatients} total</span></div>
          <LineChart data={data}/>
        </div>
        <div className="glass-card" style={{display:"flex",flexDirection:"column",gap:10}}>
          <h4 style={{fontSize:14,fontWeight:700,color:"var(--teal-900)"}}>👥 Demographics</h4>
          {[["Male",males,"#0f766e"],["Female",females,"#f59e0b"],["Other",others,"#7c3aed"]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:c,flexShrink:0}}/><span style={{flex:1,color:"var(--gray-600)"}}>{l}</span><strong style={{color:"var(--teal-900)"}}>{v}</strong><span style={{color:"var(--gray-400)",fontSize:11}}>({Math.round((v/gTotal)*100)}%)</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--gray-100)",paddingTop:8,fontSize:12,color:"var(--gray-500)"}}>↩ {returningCount} returning</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="glass-card">
          <div className="card-head"><h4>📊 Distribution</h4><span style={{fontSize:12,color:"var(--gray-400)"}}>Peak: {busiest.label||"—"}</span></div>
          {!data.length||data.every(d=>d.count===0)?<div className="empty-state">No data</div>
            :<div style={{display:"flex",alignItems:"flex-end",gap:4,height:120,paddingTop:8}}>
              {data.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}} title={`${d.label}: ${d.count}`}>
                  {d.count>0&&<span style={{fontSize:9,fontWeight:700,color:"var(--teal-800)"}}>{d.count}</span>}
                  <div style={{width:"100%",minHeight:2,borderRadius:"4px 4px 0 0",background:d.count===max?"linear-gradient(180deg,#f59e0b,#d97706)":"linear-gradient(180deg,#14b8a6,var(--teal-700))",height:`${(d.count/max)*100}%`,transition:"height .4s"}}/>
                  {data.length<=14&&<span style={{fontSize:8.5,color:"var(--gray-400)",textAlign:"center",whiteSpace:"nowrap"}}>{d.label}</span>}
                </div>
              ))}
            </div>
          }
        </div>
        <div className="glass-card">
          <h4 style={{fontSize:14,fontWeight:700,color:"var(--teal-900)",marginBottom:14}}>💰 Revenue Breakdown</h4>
          {[["Visit Charges",history.reduce((a,r)=>a+Number(r.billing?.visitCharge||0),0),"#0f766e"],["Injection Charges",history.reduce((a,r)=>a+Number(r.billing?.injectionCharge||0),0),"#3b82f6"],["Medicine Charges",history.reduce((a,r)=>a+Number(r.billing?.medicineCharge||0),0),"#7c3aed"]].map(([l,v,c])=>{
            const pct=totalRevenue?Math.round((v/totalRevenue)*100):0;
            return (
              <div key={l} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:"var(--gray-600)"}}>{l}</span><strong style={{color:"var(--teal-900)"}}>₹{v} <span style={{fontWeight:400,color:"var(--gray-400)"}}>({pct}%)</span></strong></div>
                <div style={{height:7,background:"var(--gray-100)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:4,transition:"width .5s"}}/></div>
              </div>
            );
          })}
          <div style={{borderTop:"1px solid var(--gray-100)",marginTop:14,paddingTop:12,display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:"var(--teal-800)"}}><span>Total</span><span>₹{totalRevenue}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   PROFESSIONAL DOCTOR EDIT MODAL
══════════════════════════════════ */
function DoctorEditModal({ doctor, clinicBanner, queue, onClose, onSave }) {
  const p = doctor.profile || {};
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving]       = useState(false);
  const [cropSrc, setCropSrc]     = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePhotoClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current && fileInputRef.current.click();
  };

  const initCharges = () => {
    const existing = Array.isArray(p.charges) && p.charges.length > 0 ? p.charges : [];
    if (existing.length === 0) {
      const legacy = [];
      if (p.consultationCharges?.visit)     legacy.push({ name: "Visit Charge", amount: p.consultationCharges.visit });
      if (p.consultationCharges?.injection) legacy.push({ name: "Injection Charge", amount: p.consultationCharges.injection });
      if (p.consultationCharges?.medicine)  legacy.push({ name: "Medicine Charge", amount: p.consultationCharges.medicine });
      return legacy.length > 0 ? legacy : [{ name: "", amount: "" }];
    }
    return existing.map(c => ({ name: c.name, amount: c.amount }));
  };

  const [form, setForm] = useState({
    photo:           p.photo          || "",
    qualifications:  p.qualifications || "",
    specializations: p.specializations || [],
    languages:       p.languages       || [],
    experience:      p.experience      || "",
    contactNumber:   p.contactNumber   || "",
    isActive:        p.isActive !== false,
    availabilityNote: p.availabilityNote || "",
    vacationFrom:    p.vacationFrom ? p.vacationFrom.split("T")[0] : "",
    vacationTo:      p.vacationTo   ? p.vacationTo.split("T")[0]   : "",
    vacationNote:    p.vacationNote  || "",
    worksPlace:      p.worksElsewhere?.place    || "",
    worksSchedule:   p.worksElsewhere?.schedule || "",
    newSpec: "", newLang: "",
  });

  const [charges, setCharges] = useState(initCharges);
  const [newChargeName, setNewChargeName]     = useState("");
  const [newChargeAmount, setNewChargeAmount] = useState("");

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSpec = () => {
    const v = form.newSpec.trim();
    if (!v) return;
    setForm(f => ({ ...f, specializations: [...f.specializations.filter(x => x !== v), v], newSpec: "" }));
  };
  const removeSpec = v => setForm(f => ({ ...f, specializations: f.specializations.filter(x => x !== v) }));

  const addLang = () => {
    const v = form.newLang.trim();
    if (!v) return;
    setForm(f => ({ ...f, languages: [...f.languages.filter(x => x !== v), v], newLang: "" }));
  };
  const removeLang = v => setForm(f => ({ ...f, languages: f.languages.filter(x => x !== v) }));

  const addCharge = () => {
    if (!newChargeName.trim()) return;
    setCharges(c => [...c, { name: newChargeName.trim(), amount: newChargeAmount }]);
    setNewChargeName(""); setNewChargeAmount("");
  };
  const removeCharge = i => setCharges(c => c.filter((_,idx) => idx !== i));
  const updateCharge = (i, key, val) => setCharges(c => c.map((ch, idx) => idx === i ? { ...ch, [key]: val } : ch));

  const save = async () => {
    setSaving(true);
    const cleanCharges = charges.filter(c => c.name && String(c.name).trim());
    const payload = {
      doctorRef:    doctor._id,
      doctorType:   doctor.type || (doctor.isAdmin ? "admin" : "sub_doctor"),
      photo:        form.photo,
      qualifications:  form.qualifications,
      specializations: form.specializations,
      languages:       form.languages,
      experience:      Number(form.experience) || 0,
      charges:         cleanCharges,
      availabilityNote: form.availabilityNote,
      contactNumber:   form.contactNumber.replace(/\D/g,"").slice(0,10),
      isActive:        form.isActive,
      vacationFrom:    form.vacationFrom || null,
      vacationTo:      form.vacationTo   || null,
      vacationNote:    form.vacationNote,
      worksElsewhere:  { place: form.worksPlace, schedule: form.worksSchedule },
    };
    try {
      const r    = await fetch(`${API}/clinic/doctor-profile`, { method:"POST", headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (r.ok) { onSave(); onClose(); }
      else alert(data.message || "Failed to save");
    } catch { alert("Server error"); }
    setSaving(false);
  };

  const docQueue = queue ? queue.filter(p => p.status === "waiting" && (
    isPolyclinic() ? String(p.assignedDoctorId) === String(doctor._id) : true
  )) : [];

  const TABS = [
    { id:"info",     label:"👤 Profile" },
    { id:"charges",  label:"💰 Charges" },
    { id:"status",   label:"📋 Status & Info" },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{position:"fixed",top:-9999,left:-9999,width:1,height:1,opacity:0,pointerEvents:"none"}}
      />

      {cropSrc && createPortal(
        <div style={{position:"fixed",inset:0,zIndex:9999}}>
          <CropModal src={cropSrc} circular={true}
            onConfirm={img => { sf("photo", img); setCropSrc(null); }}
            onClose={() => setCropSrc(null)}
          />
        </div>,
        document.body
      )}

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box wide" onClick={e => e.stopPropagation()} style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"92vh"}}>

          <div className="doc-edit-modal-banner" style={{backgroundImage:clinicBanner?`url(${clinicBanner})`:"none"}}>
            {clinicBanner && <img src={clinicBanner} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>}
            <div className="doc-edit-modal-banner-overlay"/>
            <div className="doc-edit-header-info">
              <div className="doc-edit-photo-btn" onClick={handlePhotoClick}>
                {form.photo ? <img src={form.photo} alt=""/> : <span>👨‍⚕️</span>}
                <div className="doc-edit-photo-overlay">📷</div>
              </div>
              <div className="doc-edit-name-block">
                <div className="doc-edit-name">Dr. {doctor.name}{doctor.isAdmin && <span style={{fontSize:11,background:"rgba(245,158,11,.8)",color:"white",padding:"2px 8px",borderRadius:10,marginLeft:8,verticalAlign:"middle"}}>Admin</span>}</div>
                <div className="doc-edit-subname">{form.qualifications || "Edit profile below"}</div>
              </div>
              <button
                className={`doc-edit-status-btn ${form.isActive ? "active" : "inactive"}`}
                onClick={() => sf("isActive", !form.isActive)}
              >
                {form.isActive ? "🟢 Available" : "🔴 Unavailable"}
              </button>
              <button onClick={onClose} style={{background:"rgba(255,255,255,.2)",border:"none",width:32,height:32,borderRadius:"50%",color:"white",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
          </div>

          {docQueue.length > 0 && (
            <div style={{background:"linear-gradient(90deg,var(--teal-50),rgba(255,255,255,.8))",borderBottom:"1px solid var(--teal-100)",padding:"10px 28px",display:"flex",gap:24,alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--teal-700)",textTransform:"uppercase",letterSpacing:.4}}>Live Queue</span>
              <div style={{display:"flex",gap:20}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:"var(--teal-800)",lineHeight:1}}>{docQueue.length}</div><div style={{fontSize:10,color:"var(--gray-500)",textTransform:"uppercase",letterSpacing:.3}}>Waiting</div></div>
              </div>
              <span className="live-badge">● Live</span>
            </div>
          )}

          <div style={{padding:"0 28px",borderBottom:"2px solid var(--gray-100)"}}>
            <div className="doc-edit-tabs" style={{borderBottom:"none",margin:"0",paddingTop:4}}>
              {TABS.map(t => (
                <button key={t.id} className={`doc-edit-tab ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>

            {activeTab === "info" && (
              <div>
                <div className="doc-edit-section-title">Basic Information</div>
                <div className="form-grid" style={{marginBottom:20}}>
                  <div className="form-field">
                    <label>Qualifications</label>
                    <input value={form.qualifications} onChange={e=>sf("qualifications",e.target.value)} placeholder="MBBS, MD, DNB…"/>
                  </div>
                  <div className="form-field">
                    <label>Years of Experience</label>
                    <input type="number" value={form.experience} onChange={e=>sf("experience",e.target.value)} min={0} placeholder="e.g. 10"/>
                  </div>
                  <div className="form-field">
                    <label>Contact Number (10 digits)</label>
                    <input
                      value={form.contactNumber}
                      onChange={e => sf("contactNumber", e.target.value.replace(/\D/g,"").slice(0,10))}
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      maxLength={10}
                    />
                    {form.contactNumber && form.contactNumber.length > 0 && form.contactNumber.length < 10 && (
                      <span className="field-err">{10 - form.contactNumber.length} more digit{10-form.contactNumber.length!==1?"s":""} needed</span>
                    )}
                  </div>
                  <div className="form-field" style={{alignSelf:"end"}}>
                    <label>Experience preview</label>
                    <div style={{padding:"10px 14px",background:"var(--teal-50)",border:"1.5px solid var(--teal-100)",borderRadius:"var(--radius-sm)",fontSize:13,color:"var(--teal-800)",fontWeight:600}}>
                      {form.experience ? `🏅 ${form.experience} years of practice` : "Enter experience above"}
                    </div>
                  </div>
                </div>

                <div className="doc-edit-section-title">Specializations</div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <input
                    value={form.newSpec}
                    onChange={e=>sf("newSpec",e.target.value)}
                    placeholder="e.g. Cardiologist, Pediatrician…"
                    onKeyDown={e=>e.key==="Enter"&&addSpec()}
                    style={{flex:1,background:"var(--gray-50)",border:"1.5px solid var(--gray-200)",borderRadius:"var(--radius-sm)",padding:"9px 14px",fontFamily:"var(--font-main)",fontSize:13,outline:"none"}}
                  />
                  <button className="btn-outline" style={{padding:"8px 16px",borderRadius:"var(--radius-sm)"}} onClick={addSpec}>+ Add</button>
                </div>
                <div className="chips-grid" style={{marginBottom:20}}>
                  {form.specializations.map(s => (
                    <span key={s} className="chip active">{s}<button className="chip-remove" onClick={()=>removeSpec(s)}>×</button></span>
                  ))}
                  {form.specializations.length === 0 && <span style={{fontSize:12,color:"var(--gray-400)"}}>No specializations added yet</span>}
                </div>

                <div className="doc-edit-section-title">Languages Spoken</div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <input
                    value={form.newLang}
                    onChange={e=>sf("newLang",e.target.value)}
                    placeholder="e.g. Hindi, English, Gujarati…"
                    onKeyDown={e=>e.key==="Enter"&&addLang()}
                    style={{flex:1,background:"var(--gray-50)",border:"1.5px solid var(--gray-200)",borderRadius:"var(--radius-sm)",padding:"9px 14px",fontFamily:"var(--font-main)",fontSize:13,outline:"none"}}
                  />
                  <button className="btn-outline" style={{padding:"8px 16px",borderRadius:"var(--radius-sm)"}} onClick={addLang}>+ Add</button>
                </div>
                <div className="chips-grid">
                  {form.languages.map(l => (
                    <span key={l} style={{background:"rgba(59,130,246,.1)",border:"1.5px solid rgba(59,130,246,.25)",color:"#1d4ed8",padding:"5px 12px",borderRadius:20,fontSize:12.5,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>
                      {l}<button className="chip-remove" onClick={()=>removeLang(l)}>×</button>
                    </span>
                  ))}
                  {form.languages.length === 0 && <span style={{fontSize:12,color:"var(--gray-400)"}}>No languages added yet</span>}
                </div>

                <div className="doc-edit-section-title" style={{marginTop:20}}>Also Practices At</div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Hospital / Clinic Name</label>
                    <input value={form.worksPlace} onChange={e=>sf("worksPlace",e.target.value)} placeholder="e.g. City General Hospital"/>
                  </div>
                  <div className="form-field">
                    <label>Schedule There</label>
                    <input value={form.worksSchedule} onChange={e=>sf("worksSchedule",e.target.value)} placeholder="e.g. Mon & Wed, 6–8 PM"/>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "charges" && (
              <div>
                <div className="doc-edit-section-title">Consultation & Service Charges</div>
                <p style={{fontSize:13,color:"var(--gray-500)",marginBottom:16}}>Add any charge you want — visit fee, ECG, X-Ray, procedures, etc.</p>

                {charges.length > 0 && (
                  <table className="charges-table">
                    <thead>
                      <tr>
                        <th style={{width:"55%"}}>Service / Charge Name</th>
                        <th style={{width:"30%"}}>Amount (₹)</th>
                        <th style={{width:"15%"}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((c,i) => (
                        <tr key={i}>
                          <td><input className="charge-row-input" value={c.name} onChange={e=>updateCharge(i,"name",e.target.value)} placeholder="e.g. Visit Charge"/></td>
                          <td><input className="charge-row-input" type="number" value={c.amount} onChange={e=>updateCharge(i,"amount",e.target.value)} placeholder="0" min={0}/></td>
                          <td style={{textAlign:"center"}}><button className="charge-del-btn" onClick={()=>removeCharge(i)}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="charges-add-row" style={{marginTop:charges.length>0?12:0}}>
                  <input className="charges-name-input" value={newChargeName} onChange={e=>setNewChargeName(e.target.value)} placeholder="New charge name…" onKeyDown={e=>e.key==="Enter"&&addCharge()}/>
                  <input className="charges-amount-input" type="number" value={newChargeAmount} onChange={e=>setNewChargeAmount(e.target.value)} placeholder="₹ Amount" min={0} onKeyDown={e=>e.key==="Enter"&&addCharge()}/>
                  <button className="btn-primary" style={{padding:"9px 18px",borderRadius:"var(--radius-sm)",whiteSpace:"nowrap"}} onClick={addCharge}>+ Add</button>
                </div>

                {charges.filter(c=>c.name).length > 0 && (
                  <div style={{marginTop:20,background:"linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.8))",border:"1px solid var(--teal-100)",borderRadius:"var(--radius-sm)",padding:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--teal-700)",textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Patient View Preview</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                      {charges.filter(c=>c.name).map((c,i)=>(
                        <div key={i} style={{background:"white",border:"1px solid var(--teal-100)",borderRadius:10,padding:"10px 14px",boxShadow:"0 2px 8px rgba(15,118,110,.06)"}}>
                          <div style={{fontSize:12,color:"var(--gray-500)",marginBottom:3}}>{c.name}</div>
                          <div style={{fontSize:18,fontWeight:800,color:"var(--teal-800)"}}>₹{c.amount||0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "status" && (
              <div>
                <div className="doc-edit-section-title">Doctor Availability</div>
                <div className="availability-toggle">
                  <div>
                    <div className="availability-label">Doctor Status</div>
                    <div className="availability-sub">Patients see: {form.isActive ? '"Currently Available at this clinic"' : '"Not Currently Available"'}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span className={`availability-status ${form.isActive?"on":"off"}`}>{form.isActive ? "🟢 Active" : "🔴 Inactive"}</span>
                    <div className={`toggle ${form.isActive?"on":""}`} style={{width:52,height:28}} onClick={()=>sf("isActive",!form.isActive)}><div className="toggle-thumb"/></div>
                  </div>
                </div>

                <div className="doc-edit-section-title">Availability Notes</div>
                <p style={{fontSize:13,color:"var(--gray-500)",marginBottom:10}}>Free-form text visible to patients.</p>
                <textarea
                  value={form.availabilityNote}
                  onChange={e=>sf("availabilityNote",e.target.value)}
                  placeholder="e.g. Mon–Fri 10am to 2pm, Sat 9am–12pm, closed Sundays."
                  rows={4}
                  style={{width:"100%",background:"var(--gray-50)",border:"1.5px solid var(--gray-200)",borderRadius:"var(--radius-sm)",padding:"12px 14px",fontFamily:"var(--font-body)",fontSize:13.5,color:"var(--gray-900)",outline:"none",resize:"vertical",lineHeight:1.6,transition:"border-color .18s"}}
                  onFocus={e=>e.target.style.borderColor="var(--teal-600)"}
                  onBlur={e=>e.target.style.borderColor="var(--gray-200)"}
                />

                <div className="doc-edit-section-title" style={{marginTop:20}}>Vacation / Leave</div>
                <div className="form-grid" style={{marginBottom:14}}>
                  <div className="form-field"><label>Leave From</label><input type="date" value={form.vacationFrom} onChange={e=>sf("vacationFrom",e.target.value)}/></div>
                  <div className="form-field"><label>Leave Until</label><input type="date" value={form.vacationTo} onChange={e=>sf("vacationTo",e.target.value)}/></div>
                  <div className="form-field full"><label>Leave Note (shown to patients)</label><input value={form.vacationNote} onChange={e=>sf("vacationNote",e.target.value)} placeholder="e.g. On medical conference, back on 10th"/></div>
                </div>

                {form.vacationFrom && form.vacationTo && (
                  <div className="doc-card-vacation" style={{marginTop:0}}>
                    🏖️ Leave period: {form.vacationFrom} → {form.vacationTo}
                    {form.vacationNote && ` · "${form.vacationNote}"`}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{padding:"16px 28px",borderTop:"1px solid var(--gray-100)",display:"flex",justifyContent:"flex-end",gap:10,background:"white",flexShrink:0}}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "💾 Save Doctor Profile"}</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════
   PROFESSIONAL DOCTOR CARD
══════════════════════════════════ */
function ProfessionalDoctorCard({ doc, queue, onEdit, onToggle, canEdit, isAdminUser }) {
  const p = doc.profile || {};
  const isOnVacation = p.vacationFrom && p.vacationTo &&
    new Date() >= new Date(p.vacationFrom) && new Date() <= new Date(p.vacationTo);

  const docQueue = queue ? queue.filter(q =>
    q.status === "waiting" && (
      isPolyclinic()
        ? String(q.assignedDoctorId) === String(doc._id)
        : true
    )
  ) : [];

  const totalCharges = Array.isArray(p.charges) ? p.charges.filter(c => c.name) : [];
  const [showCharges, setShowCharges] = useState(false);

  const statusLabel  = isOnVacation ? "On Leave" : p.isActive !== false ? "Available" : "Unavailable";
  const statusClass  = isOnVacation ? "unavailable" : p.isActive !== false ? "available" : "unavailable";

  return (
    <div className={`doctor-card${!doc.isActive ? " inactive" : ""}`}>
      <div className="doc-card-banner">
        <div className="doc-card-photo-wrap">
          <div className="doc-card-photo">
            {p.photo ? <img src={p.photo} alt={doc.name}/> : <span>👨‍⚕️</span>}
          </div>
        </div>
        <div className={`doc-card-status ${statusClass}`}>{statusLabel}</div>
      </div>

      <div className="doc-card-body">
        <div className="doc-card-name">Dr. {doc.name}{doc.isAdmin && <span className="doc-card-admin-badge">Admin</span>}</div>
        {p.qualifications && <div className="doc-card-qual">{p.qualifications}</div>}
        {!p.qualifications && <div className="doc-card-qual" style={{color:"var(--gray-300)"}}>No qualifications set</div>}
        <div className="doc-card-divider"/>
        {(p.experience > 0 || p.contactNumber) && (
          <div style={{display:"flex",gap:16,marginBottom:8,flexWrap:"wrap"}}>
            {p.experience > 0 && <div className="doc-card-detail"><span className="doc-card-detail-icon">🏅</span><span>{p.experience} yrs exp</span></div>}
            {p.contactNumber && <div className="doc-card-detail"><span className="doc-card-detail-icon">📞</span><span>{p.contactNumber}</span></div>}
          </div>
        )}
        {p.specializations?.length > 0 && (
          <div className="doc-card-chips">{p.specializations.map(s => <span key={s} className="doc-card-spec">{s}</span>)}</div>
        )}
        {p.languages?.length > 0 && (
          <div className="doc-card-chips">{p.languages.map(l => <span key={l} className="doc-card-lang">🗣️ {l}</span>)}</div>
        )}
        <div className="doc-card-queue-block">
          <div className="doc-card-queue-stat">
            <div className="doc-card-queue-num">{docQueue.length}</div>
            <div className="doc-card-queue-label">Waiting</div>
          </div>
          <div style={{width:1,height:32,background:"var(--teal-100)"}}/>
          <div className="doc-card-queue-stat">
            <div className="doc-card-queue-num" style={{fontSize:14,color:"var(--gray-500)"}}>{p.availabilityNote ? "📋" : "—"}</div>
            <div className="doc-card-queue-label">{p.availabilityNote ? "Has schedule" : "No schedule"}</div>
          </div>
          {totalCharges.length > 0 && (
            <>
              <div style={{width:1,height:32,background:"var(--teal-100)"}}/>
              <div className="doc-card-queue-stat" style={{cursor:"pointer"}} onClick={() => setShowCharges(v=>!v)}>
                <div className="doc-card-queue-num" style={{fontSize:14,color:"var(--teal-600)"}}>₹</div>
                <div className="doc-card-queue-label" style={{color:"var(--teal-600)"}}>View Charges</div>
              </div>
            </>
          )}
        </div>
        {showCharges && totalCharges.length > 0 && (
          <div style={{background:"white",border:"1px solid var(--teal-100)",borderRadius:10,padding:"10px 14px",marginBottom:8,boxShadow:"0 4px 16px rgba(15,118,110,.10)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--teal-700)",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Service Charges</div>
            {totalCharges.map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<totalCharges.length-1?"1px solid var(--gray-100)":"none",fontSize:13}}>
                <span style={{color:"var(--gray-700)"}}>{c.name}</span>
                <span style={{fontWeight:700,color:"var(--teal-800)"}}>₹{c.amount}</span>
              </div>
            ))}
          </div>
        )}
        {isOnVacation && (
          <div className="doc-card-vacation">
            🏖️ On leave: {new Date(p.vacationFrom).toLocaleDateString()} – {new Date(p.vacationTo).toLocaleDateString()}
            {p.vacationNote && ` · "${p.vacationNote}"`}
          </div>
        )}
        {p.availabilityNote && !isOnVacation && (
          <div style={{fontSize:12,color:"var(--gray-600)",background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:8,padding:"8px 12px",marginTop:6,lineHeight:1.5}}>📋 {p.availabilityNote}</div>
        )}
        {p.worksElsewhere?.place && (
          <div className="doc-card-detail" style={{marginTop:6}}>
            <span className="doc-card-detail-icon">🏥</span>
            <span>Also at {p.worksElsewhere.place}{p.worksElsewhere.schedule ? ` · ${p.worksElsewhere.schedule}` : ""}</span>
          </div>
        )}
      </div>

      <div className="doc-card-actions">
        {canEdit && (
          <button className="btn-outline" style={{flex:1,justifyContent:"center",padding:"7px 12px",fontSize:13,borderRadius:"var(--radius-sm)"}} onClick={() => onEdit(doc)}>
            ✏️ Edit Profile
          </button>
        )}
        {isAdminUser && !doc.isAdmin && (
          <button className="btn-ghost" style={{padding:"7px 12px",fontSize:13,color:doc.isActive?"var(--red)":"var(--green)",borderColor:doc.isActive?"rgba(220,38,38,.3)":"rgba(22,163,74,.3)",borderRadius:"var(--radius-sm)"}} onClick={() => onToggle(doc._id)}>
            {doc.isActive ? "Deactivate" : "Activate"}
          </button>
        )}
        <button className="btn-ghost" style={{padding:"7px 12px",fontSize:13,borderRadius:"var(--radius-sm)"}}>⭐ Reviews</button>
      </div>
    </div>
  );
}

/* ─── Clinic Profile ─── */
function ClinicProfile({ defaultTab = "clinic", queue }) {
  const [tab,setTab]             = useState(defaultTab);
  const [clinicData,setClinicData] = useState(null);
  const [doctors,setDoctors]     = useState([]);
  const [receptionists,setReceptionists] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [saving,setSaving]       = useState(false);
  const [msg,setMsg]             = useState("");

  const [clinicForm,setClinicForm] = useState({
    clinicName:"",address:"",foundedYear:"",contactNumber:"",
    openTime:"09:00",closeTime:"18:00",isOpen:true,
    paymentMethods:[],facilities:[],bannerPhoto:"",
  });

  const [editingDoctor,setEditingDoctor] = useState(null);
  const bannerRef = useRef();
  const [bannerCropSrc,setBannerCropSrc] = useState(null);

  // ── FIX: use getMyDoctorId() instead of broken inline logic ──
  const myDoctorId  = getMyDoctorId();
  const canEditClinic = isAdmin();

  const [showCreateRecep,setShowCreateRecep] = useState(false);
  const [newRecep,setNewRecep]               = useState({name:"",username:"",password:"",confirmPassword:"",mobile:""});
  const [recepErrs,setRecepErrs]             = useState({});
  const [recepPerms,setRecepPerms]           = useState({canManageQueue:true,canBookAppointment:true,canEditPatients:true,canChangeStatus:false,canViewReports:false});

  const [showCreateDoc,setShowCreateDoc] = useState(false);
  const [newDoc,setNewDoc]               = useState({name:"",username:"",password:"",confirmPassword:"",mobile:""});
  const [docErrs,setDocErrs]             = useState({});
  const [createMsg,setCreateMsg]         = useState("");

  const PAYMENT_OPTIONS  = ["Cash","UPI","Card","Insurance"];
  const FACILITY_OPTIONS = ["Parking","Lab","Pharmacy","Wheelchair Access","X-Ray"];

  useEffect(()=>{setTab(defaultTab);},[defaultTab]);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const r = await fetch(`${API}/clinic/profile`,{headers:authHead()});
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      setClinicData(data.clinic||null);
      setDoctors(Array.isArray(data.doctors)?data.doctors:[]);
      const c = data.clinic||{};
      setClinicForm({
        clinicName:    c.clinicName    ||localStorage.getItem("clinicName")||"",
        address:       c.address       ||"",
        foundedYear:   c.foundedYear   ||"",
        contactNumber: c.contactNumber ||"",
        openTime:      c.openTime      ||"09:00",
        closeTime:     c.closeTime     ||"18:00",
        isOpen:        c.isOpen!==undefined?c.isOpen:true,
        paymentMethods:Array.isArray(c.paymentMethods)?c.paymentMethods:[],
        facilities:    Array.isArray(c.facilities)?c.facilities:[],
        bannerPhoto:   c.bannerPhoto   ||"",
      });
    } catch(err){ console.error("ClinicProfile load error:",err); }
    if (isAdmin()) {
      try {
        const r=await fetch(`${API}/auth/receptionists`,{headers:authHead()});
        const data=await r.json();
        setReceptionists(Array.isArray(data)?data:[]);
      } catch {}
    }
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);

  const saveClinicInfo = async()=>{
    if (!canEditClinic) return;
    setSaving(true); setMsg("");
    try {
      const r=await fetch(`${API}/clinic/info`,{method:"POST",headers:jsonHead(),body:JSON.stringify(clinicForm)});
      const data=await r.json();
      if (r.ok) { setMsg("✅ Clinic info saved!"); localStorage.setItem("clinicName",clinicForm.clinicName); load(); }
      else setMsg(`❌ ${data.message||"Failed to save"}`);
    } catch(err){ setMsg("❌ Cannot reach server."); }
    setSaving(false);
    setTimeout(()=>setMsg(""),4000);
  };

  const toggleChip = (key,val)=>{
    if (!canEditClinic) return;
    setClinicForm(f=>{
      const arr=f[key]||[];
      return {...f,[key]:arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]};
    });
  };

  const toggleRecep  = async(id)=>{await fetch(`${API}/auth/receptionist/${id}/toggle`,{method:"PATCH",headers:authHead()});load();};
  const deleteRecep = async(id)=>{
  if (!window.confirm("Permanently delete this receptionist? This cannot be undone.")) return;
const r = await fetch(`${API}/auth/receptionist/delete/${id}`,{method:"DELETE",headers:authHead()});  const data = await r.json();
  if (r.ok) load();
  else alert("❌ " + (data.message||"Failed to delete"));
};

const [editingRecep, setEditingRecep] = useState(null);
const [editRecepForm, setEditRecepForm] = useState({name:"",mobile:"",permissions:{}});

const PERM_LABELS_LIST = [
  {key:"canManageQueue",     label:"Manage Queue"},
  {key:"canBookAppointment", label:"Book Appointments"},
  {key:"canEditPatients",    label:"Patient Records"},
  {key:"canChangeStatus",    label:"Change Clinic Status"},
  {key:"canViewDashboard",   label:"Dashboard"},
];

const openEditRecep = (r) => {
  const perms = r.permissions || {};
  setEditRecepForm({
    name: r.name || "",
    mobile: r.mobile || "",
    permissions: {
      canManageQueue:     perms.canManageQueue     === true,
      canBookAppointment: perms.canBookAppointment === true,
      canEditPatients:    perms.canEditPatients    === true,
      canChangeStatus:    perms.canChangeStatus    === true,
      canViewDashboard:   perms.canViewDashboard   === true,
    },
  });
  setEditingRecep(r);
};

const saveEditRecep = async () => {
const r = await fetch(`${API}/auth/receptionist/edit/${editingRecep._id}`,{    method:"PATCH", headers:jsonHead(),
    body: JSON.stringify(editRecepForm)
  });
  const data = await r.json();
  if (r.ok) { setEditingRecep(null); load(); }
  else alert("❌ " + (data.message||"Failed to update"));
};
  const toggleSubDoc = async(id)=>{await fetch(`${API}/auth/subdoctor/${id}/toggle`,{method:"PATCH",headers:authHead()});load();};

  const validateRecep = ()=>{
    const e={};
    if (!newRecep.name.trim()) e.name="Name is required";
    if (!newRecep.username.trim()) e.username="User ID is required";
    else if (newRecep.username.includes("@")) e.username="User ID must not be an email address";
    else if (!/^[a-zA-Z0-9_]+$/.test(newRecep.username)) e.username="Only letters, numbers and underscore allowed";
    if (!newRecep.password) e.password="Password is required";
    else if (!isStrongPassword(newRecep.password)) e.password="Must be 8+ chars with uppercase, lowercase, number & special char";
    if (!newRecep.confirmPassword) e.confirmPassword="Please confirm password";
    else if (newRecep.password!==newRecep.confirmPassword) e.confirmPassword="Passwords do not match";
    if (newRecep.mobile&&!/^\d{10}$/.test(newRecep.mobile)) e.mobile="Must be exactly 10 digits";
    setRecepErrs(e);
    return !Object.keys(e).length;
  };

  const createReceptionist = async()=>{
    if (!validateRecep()) return;
    setCreateMsg("");
const [recepPerms,setRecepPerms] = useState({canManageQueue:true,canBookAppointment:true,canEditPatients:true,canChangeStatus:false,canViewDashboard:false});    if (r.ok){ setCreateMsg("✅ Receptionist created!"); setNewRecep({name:"",username:"",password:"",confirmPassword:"",mobile:""}); setRecepErrs({}); setShowCreateRecep(false); load(); }
    else setCreateMsg(`❌ ${data.message}`);
    setTimeout(()=>setCreateMsg(""),4000);
  };

  const validateDoc = ()=>{
    const e={};
    if (!newDoc.name.trim()) e.name="Name is required";
    if (!newDoc.username.trim()) e.username="Username is required";
    else if (newDoc.username.includes("@")) e.username="Must not be an email address";
    else if (!/^[a-zA-Z0-9_]+$/.test(newDoc.username)) e.username="Only letters, numbers and underscore allowed";
    if (!newDoc.password) e.password="Password is required";
    else if (!isStrongPassword(newDoc.password)) e.password="Must be 8+ chars with uppercase, lowercase, number & special char";
    if (!newDoc.confirmPassword) e.confirmPassword="Please confirm password";
    else if (newDoc.password!==newDoc.confirmPassword) e.confirmPassword="Passwords do not match";
    if (newDoc.mobile&&!/^\d{10}$/.test(newDoc.mobile)) e.mobile="Must be exactly 10 digits";
    setDocErrs(e);
    return !Object.keys(e).length;
  };

  const createSubDoctor = async()=>{
    if (!validateDoc()) return;
    setCreateMsg("");
    const r=await fetch(`${API}/auth/create-subdoctor`,{method:"POST",headers:jsonHead(),body:JSON.stringify({name:newDoc.name,username:newDoc.username,password:newDoc.password,mobile:newDoc.mobile})});
    const data=await r.json();
    if (r.ok){ setCreateMsg("✅ Doctor account created!"); setNewDoc({name:"",username:"",password:"",confirmPassword:"",mobile:""}); setDocErrs({}); setShowCreateDoc(false); load(); }
    else setCreateMsg(`❌ ${data.message}`);
    setTimeout(()=>setCreateMsg(""),4000);
  };

  if (loading) return (
    <div className="section-content">
      <div className="alert-banner alert-ok" style={{textAlign:"center"}}>⏳ Loading clinic profile…</div>
    </div>
  );

  return (
    <div className="section-content">
      <input ref={bannerRef} type="file" accept="image/*" style={{display:"none"}}
        onChange={e=>{const f=e.target.files[0];if(!f)return;setBannerCropSrc(URL.createObjectURL(f));e.target.value="";}}
      />

      {bannerCropSrc&&(
        <CropModal src={bannerCropSrc} circular={false}
          onConfirm={img=>{setClinicForm(f=>({...f,bannerPhoto:img}));setBannerCropSrc(null);}}
          onClose={()=>setBannerCropSrc(null)}
        />
      )}

      {editingDoctor && (
        <DoctorEditModal
          doctor={editingDoctor}
          clinicBanner={clinicForm.bannerPhoto}
          queue={queue}
          onClose={() => setEditingDoctor(null)}
          onSave={() => { setMsg("✅ Doctor profile saved!"); load(); setTimeout(()=>setMsg(""),3500); }}
        />
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">

            {tab==="clinic"?"🏥 Clinic Info":tab==="doctors"?"👨‍⚕️ Doctors":"🧑‍💼 Receptionist"}
          </h2>
          <p className="section-sub">
            {tab==="clinic"
              ? canEditClinic ? "Your clinic's public identity and details" : "Your clinic's information"
              : tab==="doctors" ? "View doctor profiles and availability"
              : "Manage receptionists and their permissions"}
          </p>
        </div>
        {msg&&<div style={{fontSize:13,fontWeight:600,color:msg.startsWith("✅")?"#16a34a":"#dc2626"}}>{msg}</div>}
      </div>

      {tab==="clinic"&&(
        <div>
          {/* banner — only clickable for admin */}
          <div
            className="cp-banner-wrap"
            onClick={canEditClinic ? ()=>bannerRef.current.click() : undefined}
            style={{cursor:canEditClinic?"pointer":"default"}}
          >
            {clinicForm.bannerPhoto
              ?<img src={clinicForm.bannerPhoto} alt="clinic banner"/>
              :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.5)",fontSize:48}}>🏥</div>
            }
            {canEditClinic&&<div className="cp-banner-overlay"><span style={{color:"white",fontSize:14,fontWeight:600}}>📷 Change Banner</span></div>}
            <div className="cp-banner-text">
              <div className="cp-banner-name">{clinicForm.clinicName||"Your Clinic Name"}</div>
              <div className="cp-banner-loc">{clinicForm.address||"Location"}</div>
            </div>
          </div>

          <div className="clinic-info-row" style={{marginBottom:20}}>
            {clinicForm.foundedYear&&<span className="clinic-info-chip">🏛️ Since {clinicForm.foundedYear}</span>}
            {clinicForm.contactNumber&&<span className="clinic-info-chip">📞 {clinicForm.contactNumber}</span>}
            {clinicForm.openTime&&<span className="clinic-info-chip">🕐 {clinicForm.openTime} – {clinicForm.closeTime}</span>}
            <span className="clinic-info-chip" style={{background:clinicForm.isOpen?"rgba(22,163,74,.15)":"rgba(220,38,38,.1)",color:clinicForm.isOpen?"#14532d":"#dc2626"}}>
              {clinicForm.isOpen?"🟢 Open":"🔴 Closed"}
            </span>
          </div>

          {/* ── Only admin can edit clinic info ── */}
          {canEditClinic&&(
            <div className="glass-card" style={{marginBottom:16}}>
              <div className="card-head">
                <h4>Edit Clinic Info</h4>
                <button className="btn-primary" onClick={saveClinicInfo} disabled={saving}>{saving?"Saving…":"💾 Save"}</button>
              </div>
              <div className="form-grid">
                <div className="form-field"><label>Clinic Name</label><input value={clinicForm.clinicName} onChange={e=>setClinicForm({...clinicForm,clinicName:e.target.value})}/></div>
                <div className="form-field">
                  <label>Contact Number (10 digits)</label>
                  <input value={clinicForm.contactNumber} onChange={e=>setClinicForm({...clinicForm,contactNumber:e.target.value.replace(/\D/g,"").slice(0,10)})} placeholder="10-digit number" inputMode="numeric" maxLength={10}/>
                </div>
                <div className="form-field full"><label>Address / Location</label><input value={clinicForm.address} onChange={e=>setClinicForm({...clinicForm,address:e.target.value})} placeholder="123, Main St, City"/></div>
                <div className="form-field"><label>Founded Year</label><input type="number" value={clinicForm.foundedYear} onChange={e=>setClinicForm({...clinicForm,foundedYear:e.target.value})} placeholder="e.g. 2005" min={1900} max={2030}/></div>
                <div className="form-field"><label>Opening Time</label><input type="time" value={clinicForm.openTime} onChange={e=>setClinicForm({...clinicForm,openTime:e.target.value})}/></div>
                <div className="form-field"><label>Closing Time</label><input type="time" value={clinicForm.closeTime} onChange={e=>setClinicForm({...clinicForm,closeTime:e.target.value})}/></div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderTop:"1px solid var(--gray-100)",marginTop:12}}>
                <div><p style={{fontSize:14,fontWeight:600,color:"var(--teal-900)"}}>Clinic Status</p><p className="muted">Toggle whether clinic is currently open</p></div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontWeight:700,color:clinicForm.isOpen?"#16a34a":"#dc2626"}}>{clinicForm.isOpen?"Open":"Closed"}</span>
                  <div className={`toggle ${clinicForm.isOpen?"on":""}`} style={{width:52,height:28}} onClick={()=>setClinicForm(f=>({...f,isOpen:!f.isOpen}))}><div className="toggle-thumb"/></div>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <p style={{fontSize:11,fontWeight:700,color:"var(--gray-500)",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Payment Methods</p>
                <div className="chips-grid">{PAYMENT_OPTIONS.map(p=><span key={p} className={`chip${clinicForm.paymentMethods.includes(p)?" active":""}`} onClick={()=>toggleChip("paymentMethods",p)}>{p}</span>)}</div>
              </div>
              <div style={{marginTop:14}}>
                <p style={{fontSize:11,fontWeight:700,color:"var(--gray-500)",textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Facilities Available</p>
                <div className="chips-grid">{FACILITY_OPTIONS.map(f=><span key={f} className={`chip${clinicForm.facilities.includes(f)?" active":""}`} onClick={()=>toggleChip("facilities",f)}>{f}</span>)}</div>
              </div>
            </div>
          )}

          {/* Read-only view for sub-doctor */}
          {!canEditClinic && (
            <div className="glass-card" style={{marginBottom:16}}>
              <div className="card-head"><h4>👁️ Clinic Information</h4><span className="muted">View-only</span></div>
              <div style={{background:"linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.8))",borderRadius:"var(--radius-sm)",padding:20,border:"1px solid var(--teal-100)"}}>
                <div style={{fontSize:22,fontWeight:800,color:"var(--teal-900)"}}>{clinicForm.clinicName||"Clinic Name"}</div>
                <div style={{fontSize:13,color:"var(--gray-500)",margin:"4px 0 12px"}}>📍 {clinicForm.address||"Address"}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {clinicForm.foundedYear&&<span className="chip">🏛️ Since {clinicForm.foundedYear}</span>}
                  {clinicForm.contactNumber&&<span className="chip">📞 {clinicForm.contactNumber}</span>}
                  <span className="chip" style={{background:clinicForm.isOpen?"rgba(22,163,74,.12)":"rgba(220,38,38,.1)",color:clinicForm.isOpen?"#14532d":"#dc2626",borderColor:clinicForm.isOpen?"rgba(22,163,74,.3)":"rgba(220,38,38,.2)"}}>{clinicForm.isOpen?"🟢 Open Now":"🔴 Closed"}</span>
                  <span className="chip">🕐 {clinicForm.openTime} – {clinicForm.closeTime}</span>
                </div>
                {clinicForm.paymentMethods.length>0&&<div style={{fontSize:12,color:"var(--gray-600)",marginBottom:6}}>💳 Accepts: {clinicForm.paymentMethods.join(", ")}</div>}
                {clinicForm.facilities.length>0&&<div style={{fontSize:12,color:"var(--gray-600)"}}>🏢 Facilities: {clinicForm.facilities.join(", ")}</div>}
              </div>
            </div>
          )}

          {/* Patient preview — only for admin */}
          {canEditClinic && (
            <div className="glass-card">
              <div className="card-head"><h4>👁️ Patient View Preview</h4><span className="muted">How patients see your clinic</span></div>
              <div style={{background:"linear-gradient(135deg,var(--teal-50),rgba(255,255,255,.8))",borderRadius:"var(--radius-sm)",padding:20,border:"1px solid var(--teal-100)"}}>
                <div style={{fontSize:22,fontWeight:800,color:"var(--teal-900)"}}>{clinicForm.clinicName||"Clinic Name"}</div>
                <div style={{fontSize:13,color:"var(--gray-500)",margin:"4px 0 12px"}}>📍 {clinicForm.address||"Address"}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {clinicForm.foundedYear&&<span className="chip">🏛️ Since {clinicForm.foundedYear}</span>}
                  {clinicForm.contactNumber&&<span className="chip">📞 {clinicForm.contactNumber}</span>}
                  <span className="chip" style={{background:clinicForm.isOpen?"rgba(22,163,74,.12)":"rgba(220,38,38,.1)",color:clinicForm.isOpen?"#14532d":"#dc2626",borderColor:clinicForm.isOpen?"rgba(22,163,74,.3)":"rgba(220,38,38,.2)"}}>{clinicForm.isOpen?"🟢 Open Now":"🔴 Closed"}</span>
                  <span className="chip">🕐 {clinicForm.openTime} – {clinicForm.closeTime}</span>
                </div>
                {clinicForm.paymentMethods.length>0&&<div style={{fontSize:12,color:"var(--gray-600)",marginBottom:6}}>💳 Accepts: {clinicForm.paymentMethods.join(", ")}</div>}
                {clinicForm.facilities.length>0&&<div style={{fontSize:12,color:"var(--gray-600)"}}>🏢 Facilities: {clinicForm.facilities.join(", ")}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="doctors"&&(
        <div>
          {/* Only admin can add doctors in polyclinic */}
          {isAdmin()&&isPolyclinic()&&(
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button className="btn-primary" onClick={()=>{setShowCreateDoc(true);setDocErrs({});setCreateMsg("");}}>➕ Add Doctor</button>
            </div>
          )}
          {showCreateDoc&&(
            <div className="glass-card" style={{marginBottom:16}}>
              <div className="card-head"><h4>➕ New Doctor Account</h4><button className="modal-close" onClick={()=>{setShowCreateDoc(false);setDocErrs({});}}>✕</button></div>
              <div className="form-grid">
                <div className="form-field"><label>Full Name *</label><input value={newDoc.name} onChange={e=>{setNewDoc({...newDoc,name:e.target.value});setDocErrs(p=>({...p,name:""}));}} placeholder="Dr. Name"/>{docErrs.name&&<span className="field-err">{docErrs.name}</span>}</div>
                <div className="form-field"><label>Username * (no @)</label><input value={newDoc.username} onChange={e=>{setNewDoc({...newDoc,username:e.target.value});setDocErrs(p=>({...p,username:""}));}} placeholder="e.g. dr_smith"/>{docErrs.username&&<span className="field-err">{docErrs.username}</span>}</div>
                <div className="form-field"><label>Password *</label><input type="password" value={newDoc.password} onChange={e=>{setNewDoc({...newDoc,password:e.target.value});setDocErrs(p=>({...p,password:""}));}} placeholder="Min 8 chars"/><PwStrengthMini password={newDoc.password}/>{docErrs.password&&<span className="field-err">{docErrs.password}</span>}</div>
                <div className="form-field"><label>Confirm Password *</label><input type="password" value={newDoc.confirmPassword} onChange={e=>{setNewDoc({...newDoc,confirmPassword:e.target.value});setDocErrs(p=>({...p,confirmPassword:""}));}} placeholder="Re-enter password"/>{newDoc.confirmPassword&&newDoc.password!==newDoc.confirmPassword&&<span className="field-err">Passwords do not match</span>}{docErrs.confirmPassword&&!newDoc.confirmPassword&&<span className="field-err">{docErrs.confirmPassword}</span>}</div>
                <div className="form-field"><label>Mobile (10 digits)</label><input value={newDoc.mobile} onChange={e=>{setNewDoc({...newDoc,mobile:e.target.value.replace(/\D/g,"").slice(0,10)});setDocErrs(p=>({...p,mobile:""}));}} placeholder="10-digit mobile" inputMode="numeric" maxLength={10}/>{docErrs.mobile&&<span className="field-err">{docErrs.mobile}</span>}</div>
              </div>
              {createMsg&&<div style={{fontSize:13,fontWeight:600,marginTop:10,color:createMsg.startsWith("✅")?"#16a34a":"#dc2626"}}>{createMsg}</div>}
              <div className="modal-actions">
                <button className="btn-ghost" onClick={()=>{setShowCreateDoc(false);setDocErrs({});}}>Cancel</button>
                <button className="btn-primary" onClick={createSubDoctor}>Create Doctor Account</button>
              </div>
            </div>
          )}
          {doctors.length===0
            ?<div className="glass-card"><div className="empty-state">No doctor profiles yet.</div></div>
            :<div className="doctor-cards-grid">
              {doctors.map(doc=>(
                <ProfessionalDoctorCard
                  key={doc._id}
                  doc={doc}
                  queue={queue}
                  // ── FIX: sub-doctor can only edit their own card ──
                  canEdit={isAdmin() || String(doc._id) === String(myDoctorId)}
                  isAdminUser={isAdmin()}
                  onEdit={setEditingDoctor}
                  onToggle={toggleSubDoc}
                />
              ))}
            </div>
          }
        </div>
      )}

      {/* ── Receptionist tab: admin only ── */}
      {tab==="team"&&isAdmin()&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:13,color:"var(--gray-500)"}}>Total members: <strong style={{color:"var(--teal-800)"}}>{receptionists.length}</strong></div>
            <button className="btn-primary" onClick={()=>{setShowCreateRecep(true);setRecepErrs({});setCreateMsg("");}}>➕ Add Receptionist</button>
          </div>
          {showCreateRecep&&(
            <div className="glass-card" style={{marginBottom:16}}>
              <div className="card-head"><h4>➕ New Receptionist Account</h4><button className="modal-close" onClick={()=>{setShowCreateRecep(false);setRecepErrs({});}}>✕</button></div>
              <div className="form-grid">
                <div className="form-field"><label>Full Name *</label><input value={newRecep.name} onChange={e=>{setNewRecep({...newRecep,name:e.target.value});setRecepErrs(p=>({...p,name:""}));}} placeholder="Name"/>{recepErrs.name&&<span className="field-err">{recepErrs.name}</span>}</div>
                <div className="form-field"><label>User ID * (no @)</label><input value={newRecep.username} onChange={e=>{setNewRecep({...newRecep,username:e.target.value});setRecepErrs(p=>({...p,username:""}));}} placeholder="e.g. recep_01" autoComplete="off"/>{recepErrs.username&&<span className="field-err">{recepErrs.username}</span>}</div>
                <div className="form-field"><label>Password *</label><input type="password" value={newRecep.password} onChange={e=>{setNewRecep({...newRecep,password:e.target.value});setRecepErrs(p=>({...p,password:""}));}} placeholder="Min 8 chars" autoComplete="new-password"/><PwStrengthMini password={newRecep.password}/>{recepErrs.password&&<span className="field-err">{recepErrs.password}</span>}</div>
                <div className="form-field"><label>Confirm Password *</label><input type="password" value={newRecep.confirmPassword} onChange={e=>{setNewRecep({...newRecep,confirmPassword:e.target.value});setRecepErrs(p=>({...p,confirmPassword:""}));}} placeholder="Re-enter password" autoComplete="new-password"/>{newRecep.confirmPassword&&newRecep.password!==newRecep.confirmPassword&&<span className="field-err">Passwords do not match</span>}{recepErrs.confirmPassword&&!newRecep.confirmPassword&&<span className="field-err">{recepErrs.confirmPassword}</span>}</div>
                <div className="form-field full"><label>Mobile (10 digits)</label><input value={newRecep.mobile} onChange={e=>{setNewRecep({...newRecep,mobile:e.target.value.replace(/\D/g,"").slice(0,10)});setRecepErrs(p=>({...p,mobile:""}));}} placeholder="10-digit mobile" inputMode="numeric" maxLength={10}/>{recepErrs.mobile&&<span className="field-err">{recepErrs.mobile}</span>}</div>
              </div>
              <h5 style={{margin:"16px 0 8px",fontSize:11,textTransform:"uppercase",letterSpacing:.5,color:"var(--teal-800)"}}>Permissions</h5>
              <div className="permissions-grid">
                {Object.entries(recepPerms).map(([k,v])=>(
                  <div className="perm-row" key={k}>
                    <span>{PERM_LABELS[k]||k}</span>
                    <div className={`toggle ${v?"on":""}`} onClick={()=>setRecepPerms(p=>({...p,[k]:!p[k]}))}><div className="toggle-thumb"/></div>
                  </div>
                ))}
              </div>
              {createMsg&&<div style={{fontSize:13,fontWeight:600,marginTop:10,color:createMsg.startsWith("✅")?"#16a34a":"#dc2626"}}>{createMsg}</div>}
              <div className="modal-actions">
                <button className="btn-ghost" onClick={()=>{setShowCreateRecep(false);setRecepErrs({});}}>Cancel</button>
                <button className="btn-primary" onClick={createReceptionist}>Create Receptionist</button>
              </div>
            </div>
          )}
          {createMsg&&!showCreateRecep&&<div style={{fontSize:13,fontWeight:600,marginBottom:10,color:createMsg.startsWith("✅")?"#16a34a":"#dc2626"}}>{createMsg}</div>}
          <div className="glass-card">
            <div className="card-head"><h4>Receptionists ({receptionists.length})</h4></div>
            {receptionists.length===0
              ?<div className="empty-state">No receptionists yet.</div>
              :receptionists.map(r=>(
                <div className="team-member-row" key={r._id}>
                  <div className="team-avatar">{r.name?.[0]||"R"}</div>
                  <div className="team-info"><div className="team-name">{r.name}</div><div className="team-sub">@{r.username}{r.mobile?` · ${r.mobile}`:""}</div></div>
                  <div className="team-actions">
  <span className={`status-chip ${r.isActive!==false?"done":"cancelled"}`} style={{fontSize:10}}>{r.isActive!==false?"Active":"Inactive"}</span>
  <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12}} onClick={()=>openEditRecep(r)}>✏️ Edit</button>
  <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12,color:r.isActive!==false?"var(--red)":"var(--green)"}} onClick={()=>toggleRecep(r._id)}>
    {r.isActive!==false?"Deactivate":"Activate"}
  </button>
  <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12,color:"var(--red)",borderColor:"rgba(220,38,38,.3)"}} onClick={()=>deleteRecep(r._id)}>🗑️ Delete</button>
</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
      {editingRecep && (
  <Modal title={`✏️ Edit — ${editingRecep.name}`} onClose={()=>setEditingRecep(null)}>
    <div className="form-grid">
      <div className="form-field"><label>Full Name</label>
        <input value={editRecepForm.name} onChange={e=>setEditRecepForm({...editRecepForm,name:e.target.value})} placeholder="Name"/>
      </div>
      <div className="form-field"><label>Mobile (10 digits)</label>
        <input value={editRecepForm.mobile} onChange={e=>setEditRecepForm({...editRecepForm,mobile:e.target.value.replace(/\D/g,"").slice(0,10)})} placeholder="10-digit mobile" inputMode="numeric" maxLength={10}/>
      </div>
    </div>
    <h5 style={{margin:"16px 0 8px",fontSize:11,textTransform:"uppercase",letterSpacing:.5,color:"var(--teal-800)"}}>Permissions</h5>
    <div className="permissions-grid">
      {PERM_LABELS_LIST.map(({key,label})=>(
        <div className="perm-row" key={key}>
          <span>{label}</span>
          <div className={`toggle ${editRecepForm.permissions[key]?"on":""}`}
            onClick={()=>setEditRecepForm(f=>({...f,permissions:{...f.permissions,[key]:!f.permissions[key]}}))}>
            <div className="toggle-thumb"/>
          </div>
        </div>
      ))}
    </div>
    <div className="modal-actions">
      <button className="btn-ghost" onClick={()=>setEditingRecep(null)}>Cancel</button>
      <button className="btn-primary" onClick={saveEditRecep}>💾 Save Changes</button>
    </div>
  </Modal>
)}
      {/* ── Guard: sub-doctor trying to access team tab ── */}
      {tab==="team"&&!isAdmin()&&(
        <div className="glass-card"><div className="empty-state">🔒 You don't have permission to manage receptionists.</div></div>
      )}
    </div>
  );
}

/* ─── Reviews ─── */
function Reviews() {
  const reviews=[
    {name:"Sneha Patel",rating:5,text:"Very professional. Short wait time!",date:"2025-02-15"},
    {name:"Rahul Mehta",rating:4,text:"Good experience. QueueSync is amazing.",date:"2025-02-14"},
    {name:"Priya Sharma",rating:5,text:"Excellent service, digital queue works perfectly.",date:"2025-02-13"},
  ];
  const avg=(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1);
  return (
    <div className="section-content">
      <div className="section-header"><div><h2 className="section-title">Reviews</h2><p className="section-sub">Patient feedback and ratings</p></div></div>
      <div className="reviews-top">
        <div className="glass-card avg-rating"><h2 className="big-rating">{avg}</h2><div className="stars">{"★".repeat(Math.round(avg))}{"☆".repeat(5-Math.round(avg))}</div><p className="muted">{reviews.length} reviews</p></div>
        <div className="glass-card">{[5,4,3,2,1].map(n=>{const c=reviews.filter(r=>r.rating===n).length;return(<div className="rating-bar" key={n}><span>{n}★</span><div className="rbar-track"><div className="rbar-fill" style={{width:`${(c/reviews.length)*100}%`}}/></div><span>{c}</span></div>);})}</div>
      </div>
      <div className="reviews-list">{reviews.map((r,i)=>(<div className="glass-card" key={i} style={{padding:20}}><div className="review-top"><div className="review-avatar">{r.name[0]}</div><div><strong>{r.name}</strong><p className="muted">{r.date}</p></div><div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div></div><p className="review-text">"{r.text}"</p></div>))}</div>
    </div>
  );
}

/* ─── Settings ─── */
function Settings({ clinicOpen, setClinicOpen, avgConsultTime, setAvgConsultTime }) {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved]         = useState(false);

  const role       = localStorage.getItem("role")     || "doctor";
  const doctorName = localStorage.getItem("doctorName") || localStorage.getItem("name") || "";
  const clinicName = localStorage.getItem("clinicName") || "";
  // ── FIX: use getMyDoctorId() ──
  const userId     = getMyDoctorId() || "";

  const [prefs, setPrefs] = useState({
    theme:        localStorage.getItem("theme")        || "light",
    language:     localStorage.getItem("language")     || "English",
    avgConsult:   avgConsultTime || 10,
    autoReset:    localStorage.getItem("autoReset")    !== "false",
    notifications:localStorage.getItem("notifications")!== "false",
    queueSound:   localStorage.getItem("queueSound")  === "true",
    compactView:  localStorage.getItem("compactView")  === "true",
  });

  const sp = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const savePrefs = () => {
    Object.entries(prefs).forEach(([k, v]) => localStorage.setItem(k, String(v)));
    setAvgConsultTime(Number(prefs.avgConsult) || 10);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { id: "general",    label: "⚙️  General"    },
    { id: "queue",      label: "🏥  Queue"       },
    { id: "account",    label: "👤  Account"     },
    ...(isAdmin() ? [{ id: "danger", label: "⚠️  Danger Zone" }] : []),
  ];

  const Toggle = ({ val, onChange }) => (
    <div className={`toggle ${val ? "on" : ""}`} onClick={() => onChange(!val)}>
      <div className="toggle-thumb" />
    </div>
  );

  const SCard = ({ icon, iconBg, title, subtitle, children }) => (
    <div className="settings-section-card">
      <div className="settings-card-header">
        <div className="settings-card-icon" style={{ background: iconBg || "var(--teal-50)" }}>{icon}</div>
        <div>
          <div className="settings-card-title">{title}</div>
          {subtitle && <div className="settings-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="settings-card-body">{children}</div>
    </div>
  );

  const SRow = ({ label, desc, children }) => (
    <div className="settings-row">
      <div style={{ flex: 1 }}>
        <div className="settings-row-label">{label}</div>
        {desc && <div className="settings-row-desc">{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  return (
    <div className="section-content" style={{ maxWidth: 860 }}>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Settings</h2>
          <p className="section-sub">Manage your preferences and clinic configuration</p>
        </div>
        {activeTab !== "danger" && (
          <button className="btn-primary" onClick={savePrefs}>
            {saved ? "✅ Saved!" : "💾 Save Changes"}
          </button>
        )}
      </div>

      <div className="settings-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`settings-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div>
          <SCard icon="🏥" iconBg="rgba(15,118,110,.1)" title="Clinic Operations"
            subtitle="Core settings that affect how your clinic runs">
            {/* Only admin can toggle clinic status */}
            {isAdmin() && (
              <SRow label="Clinic Status" desc="Toggle whether your clinic is currently open and accepting patients">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: clinicOpen ? "#16a34a" : "#dc2626", minWidth: 44 }}>
                    {clinicOpen ? "Open" : "Closed"}
                  </span>
                  <Toggle val={clinicOpen} onChange={setClinicOpen} />
                </div>
              </SRow>
            )}
            {isSubDoc() && (
              <div style={{fontSize:13,color:"var(--gray-500)",padding:"10px 0"}}>
                Clinic status: <strong style={{color:clinicOpen?"#16a34a":"#dc2626"}}>{clinicOpen?"🟢 Open":"🔴 Closed"}</strong> (managed by admin doctor)
              </div>
            )}
          </SCard>

          
        </div>
      )}

      {activeTab === "queue" && (
        <div>
         

          <SCard icon="📊" iconBg="rgba(245,158,11,.1)" title="Queue Stats at a Glance"
            subtitle="Current session information">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div className="settings-info-badge">⏱️ {prefs.avgConsult} min avg. consult</div>
              <div className="settings-info-badge">{clinicOpen ? "🟢 Clinic Open" : "🔴 Clinic Closed"}</div>
            </div>
          </SCard>
        </div>
      )}

      {activeTab === "account" && (
        <div>
          <SCard icon="👤" iconBg="rgba(15,118,110,.1)" title="Account Info"
            subtitle="Your login identity and access level">
            {[
              { label: "Name",       value: doctorName || "—" },
              { label: "Clinic",     value: clinicName || "—" },
              { label: "Role",       value: role === "doctor" ? "Admin Doctor" : role === "sub_doctor" ? "Associate Doctor" : "Receptionist" },
              { label: "Account ID", value: userId ? `#${String(userId).slice(-8).toUpperCase()}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="settings-row">
                <div className="settings-row-label" style={{ color: "var(--gray-500)", fontWeight: 500, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal-900)" }}>{value}</div>
              </div>
            ))}
          </SCard>

          <SCard icon="🔐" iconBg="rgba(59,130,246,.1)" title="Security"
            subtitle="Manage your access and authentication">
            <SRow label="Active Session" desc="You are currently logged in on this device">
              <span className="settings-info-badge" style={{ margin: 0 }}>🟢 Active</span>
            </SRow>
          </SCard>

          <SCard icon="📱" iconBg="rgba(245,158,11,.1)" title="App Info"
            subtitle="Version and system details">
            {[
              { label: "Application",   value: "QueueSync" },
              { label: "Version",       value: "v1.0.0" },
              { label: "Clinic Type",   value: isPolyclinic() ? "Polyclinic" : "Single Doctor Clinic" },
            ].map(({ label, value }) => (
              <div key={label} className="settings-row">
                <div className="settings-row-label" style={{ color: "var(--gray-500)", fontWeight: 500, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-700)" }}>{value}</div>
              </div>
            ))}
          </SCard>
        </div>
      )}

      {activeTab === "danger" && isAdmin() && (
        <div>
          <div style={{ background: "rgba(220,38,38,.04)", border: "1.5px solid rgba(220,38,38,.15)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Caution — Irreversible Actions</div>
              <div style={{ fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
                Actions in this section cannot be undone. Please read each description carefully before proceeding.
              </div>
            </div>
          </div>

          <div className="danger-card">
            <div className="danger-card-header">
              <span style={{ fontSize: 18 }}>🗑️</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#991b1b" }}>Queue Management</div>
                <div style={{ fontSize: 12.5, color: "var(--gray-500)", marginTop: 2 }}>Actions affecting today's live queue</div>
              </div>
            </div>
            <div className="danger-action-row">
              <div>
                <div className="danger-action-title">Reset Today's Queue</div>
                <div className="danger-action-desc">Clears all waiting patients from the current queue. This action cannot be undone.</div>
              </div>
              <button className="btn-danger-sm" onClick={async () => {
  if (!window.confirm("Reset today's queue? This cannot be undone.")) return;
  try {
    const r = await fetch(`${API}/queue/reset-today`, { method: "DELETE", headers: authHead() });
    const data = await r.json();
    if (r.ok) { alert("✅ Queue has been reset."); window.location.reload(); }
    else alert("❌ " + (data.message || "Failed to reset queue."));
  } catch { alert("❌ Cannot reach server."); }
}}>Reset Queue</button>
            </div>
          </div>

          <div className="danger-card">
            <div className="danger-card-header">
              <span style={{ fontSize: 18 }}>🔐</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#991b1b" }}>Session Management</div>
                <div style={{ fontSize: 12.5, color: "var(--gray-500)", marginTop: 2 }}>Control active login sessions</div>
              </div>
            </div>
            <div className="danger-action-row">
              <div>
                <div className="danger-action-title">Sign Out of All Devices</div>
                <div className="danger-action-desc">Terminates all active sessions including this one. You will need to log in again.</div>
              </div>
              <button className="btn-danger-sm" onClick={() => {
                if (window.confirm("Sign out of all devices?")) { localStorage.clear(); window.location.href = "/"; }
              }}>Sign Out All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   ROOT DASHBOARD
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  useEffect(()=>{
    if (!document.getElementById("qs-styles")) {
      const el=document.createElement("style");
      el.id="qs-styles"; el.textContent=CSS;
      document.head.appendChild(el);
    }
  },[]);

  const [section,          setSection]          = useState("overview");
  const [clinicProfileTab, setClinicProfileTab]  = useState("clinic");
  const [queue,            setQueue]             = useState([]);
  const [stats,            setStats]             = useState([]);
  const [appointments,     setAppointments]      = useState([]);
  const [clinicOpen,       setClinicOpen]        = useState(true);
  const [avgConsultTime,   setAvgConsultTime]    = useState(10);
  const [showAddPatient,   setShowAddPatient]    = useState(false);
  const [showBookAppt,     setShowBookAppt]      = useState(false);
  const [recordsKey,       setRecordsKey]        = useState(0);
  const [doctors,          setDoctors]           = useState([]);
  const [doctorFilter,     setDoctorFilter]      = useState(()=> isPolyclinic()&&isAdmin() ? (localStorage.getItem("userId")||"") : "");
  const [billingPatient,   setBillingPatient]    = useState(null);

  const playQueueSound = useCallback(() => {
    try {
      const saved = localStorage.getItem("queueSound");
      if (saved !== "true") return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  const fetchQueue = useCallback(async()=>{
    try {
      const qp=doctorFilter?`?doctorId=${doctorFilter}`:"";
      const r=await fetch(`${API}/queue/today${qp}`,{headers:authHead()});
      const data=await r.json();
      const q=Array.isArray(data)?data:[];
      setQueue(q);
      const done=q.filter(p=>p.status==="done"&&p.consultDuration>0);
      if (done.length) {
        setAvgConsultTime(Math.round(done.reduce((a,p)=>a+p.consultDuration,0)/done.length));
      } else {
        // No done patients yet — use the saved Settings preference
        const saved = Number(localStorage.getItem("avgConsult")) || 10;
        setAvgConsultTime(saved);
      }
    } catch { setQueue([]); }
  },[doctorFilter]);

  const fetchStats = useCallback(async()=>{
    try {
      const r=await fetch(`${API}/queue/stats-today`,{headers:authHead()});
      const data=await r.json();
      setStats(data||[]);
    } catch { setStats([]); }
  },[]);

  const fetchAppointments = useCallback(async()=>{
    try {
      const r=await fetch(`${API}/appointments/today`,{headers:authHead()});
      const data=await r.json();
      setAppointments(data||[]);
    } catch { setAppointments([]); }
  },[]);

  const refreshAll = useCallback(()=>{
    fetchQueue(); fetchStats(); fetchAppointments();
  },[fetchQueue,fetchStats,fetchAppointments]);
  const fetchDoctors = useCallback(async () => {
  try {
    const r = await fetch(`${API}/clinic/profile`, { headers: authHead() });
    const data = await r.json();
    setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
  } catch { setDoctors([]); }
}, []);

  useEffect(()=>{ refreshAll(); fetchDoctors(); },[]);
  useEffect(()=>{ const iv=setInterval(refreshAll,60000); return ()=>clearInterval(iv); },[refreshAll]);
  useEffect(()=>{ fetchQueue(); },[doctorFilter]);
const markDone = (id) => {
  const patient = queue.find(p => p._id === id);
  if (patient) setBillingPatient(patient);
};
const cancelPatient = async (id) => {
  if (!window.confirm("Mark this patient as No Show?")) return;
  try {
    await fetch(`${API}/queue/cancel/${id}`, { method:"PATCH", headers:authHead() });
    await fetchQueue(); await fetchStats();
    setTimeout(() => setRecordsKey(k => k + 1), 500);
  } catch { alert("Cannot reach server"); }
};
  const confirmDone = async (bill) => {
    const id = billingPatient._id;
    setBillingPatient(null);
    try {
      const body = bill ? { ...bill } : { billingSkipped: true };
const r = await fetch(`${API}/queue/done/${id}`, { method:"PATCH", headers:jsonHead(), body:JSON.stringify(body) });
if (!r.ok) { const d = await r.json(); alert(d.message||"Error"); return; }
// sync appointment status if this patient came from an appointment
const donePatient = queue.find(p => p._id === id);
if (donePatient?.appointmentId) {
  await fetch(`${API}/appointments/status/${donePatient.appointmentId}`, {
    method:"PATCH", headers:jsonHead(),
    body:JSON.stringify({status:"completed"})
  });
}
await fetchQueue(); await fetchStats();
setTimeout(() => setRecordsKey(k => k + 1), 800);
    } catch { alert("Cannot reach server"); }
  };

  const doctorName   = cleanName(localStorage.getItem("doctorName"));
  const waitingCount = queue.filter(p=>p.status==="waiting").length;
  const role         = getRole();
  const roleBadge    = role==="doctor"?"Admin Doctor":role==="sub_doctor"?"Doctor":"Receptionist";

  // ── FIX: NAV items scoped by role ──
  const NAV = [
    {id:"overview",    label:"Dashboard",      icon:"📊", tab:null},
    {id:"queue",       label:"Live Queue",      icon:"🏥", tab:null},
    {id:"appointments",label:"Appointments",   icon:"📅", tab:null},
    {id:"records",     label:"Patient Records", icon:"📋", tab:null},
    // Analysis: doctors only
    ...(isDoctor() ? [{id:"analysis",label:"Analysis",icon:"📈",tab:null}] : []),
    // Clinic Info: all roles can view
    {id:"clinic-info", label:"Clinic Info",     icon:"🏥", tab:"clinic"},
    // Doctors: all roles can view (sub-doc can edit own card)
    {id:"doctors",     label:"Doctors",         icon:"👨‍⚕️", tab:"doctors"},
    // Receptionist management: admin only
    ...(isAdmin() ? [{id:"team",label:"Receptionist",icon:"🧑‍💼",tab:"team"}] : []),
    // Reviews: all can view their own
    {id:"reviews",     label:"Reviews",         icon:"⭐", tab:null},
    {id:"settings",    label:"Settings",        icon:"⚙️", tab:null},
  ];

  const handleNavClick=(item)=>{ setSection(item.id); if (item.tab) setClinicProfileTab(item.tab); };
  const isClinicSection=["clinic-info","doctors","team"].includes(section);

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-logo"><span className="db-logo-icon">⏱</span><span>QueueSync</span></div>
        <div className="db-badge-row"><span className="db-role-badge">{roleBadge}</span></div>
        <nav className="db-nav">
          {NAV.map(item=>(
            <button key={item.id} className={`db-nav-item ${section===item.id?"active":""}`} onClick={()=>handleNavClick(item)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id==="queue"&&waitingCount>0&&<span className="nav-badge">{waitingCount}</span>}
            </button>
          ))}
        </nav>
        <div className="db-sidebar-footer">
          <div className="db-user">
            <div className="db-avatar">{doctorName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="db-user-name">{isDoctor()?"Dr. ":""}{doctorName}</p>
              <p className="db-user-role">{isAdmin()?(clinicOpen?"🟢 Clinic Open":"🔴 Clinic Closed"):roleBadge}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={()=>{localStorage.clear();window.location.href="/";}}>🚪 Logout</button>
        </div>
      </aside>

      <main className="db-main">
        {section==="overview"     &&<Overview queue={queue} stats={stats} appointments={appointments} avgConsultTime={avgConsultTime} clinicOpen={clinicOpen} setClinicOpen={setClinicOpen} onAddPatient={()=>setShowAddPatient(true)} onBookAppt={()=>setShowBookAppt(true)} setSection={setSection} onApptStatusChange={refreshAll} onMarkDone={markDone} onCancelPatient={cancelPatient} doctors={doctors}/>}
        {section==="queue"        &&<LiveQueue queue={queue} stats={stats}onMarkDone={markDone} onCancelPatient={cancelPatient} onAddPatient={()=>setShowAddPatient(true)} avgConsultTime={avgConsultTime} doctors={doctors} doctorFilter={doctorFilter} setDoctorFilter={setDoctorFilter}/>}
        {section==="appointments" &&<Appointments onQueueRefresh={refreshAll} doctors={doctors}/>}
        {section==="records"      &&<PatientRecords refreshTrigger={recordsKey}/>}
        {section==="analysis"     &&isDoctor()&&<Analysis/>}
        {isClinicSection          &&<ClinicProfile defaultTab={clinicProfileTab} queue={queue}/>}
        {section==="reviews"      &&<Reviews/>}
        {section==="settings"     &&<Settings clinicOpen={clinicOpen} setClinicOpen={setClinicOpen} avgConsultTime={avgConsultTime} setAvgConsultTime={setAvgConsultTime}/>}
      </main>

{showAddPatient&&<AddPatientModal onClose={()=>setShowAddPatient(false)} onAdded={async()=>{await fetchQueue();await fetchStats();playQueueSound();}} doctors={doctors}/>}      {showBookAppt  &&<BookApptModal  onClose={()=>setShowBookAppt(false)}   onBooked={async()=>{await fetchAppointments();}} doctors={doctors}/>}
      {billingPatient&&<BillingDoneModal patient={billingPatient} onConfirm={confirmDone} onClose={()=>setBillingPatient(null)}/>}
    </div>
  );
}