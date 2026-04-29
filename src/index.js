@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Lato:wght@300;400;700&display=swap');

:root {
  --brown-dark:   #5C3317;
  --brown-mid:    #7B4F2E;
  --brown-light:  #A0693A;
  --brown-pale:   #C4A06A;
  --cream-dark:   #E8D5B7;
  --cream-mid:    #F2E8D5;
  --cream-light:  #FAF5ED;
  --green-soft:   #6B8C5A;
  --red-alert:    #C0392B;
  --text-dark:    #2C1A0E;
  --text-mid:     #6B4C35;
  --text-light:   #9A7A62;
  --border:       rgba(123,79,46,0.15);
  --shadow:       0 2px 12px rgba(92,51,23,0.10);
  --radius:       14px;
  --radius-sm:    8px;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

html, body, #root {
  height: 100%;
  background: var(--cream-light);
  font-family: 'Lato', sans-serif;
  color: var(--text-dark);
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--cream-dark); border-radius: 4px; }

/* App shell */
.app-shell {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--cream-light);
  position: relative;
}

/* Header */
.app-header {
  background: var(--brown-mid);
  padding-top: calc(20px + env(safe-area-inset-top));
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(92,51,23,0.20);
}
.app-header-title h1 {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 600;
  color: var(--cream-light);
  letter-spacing: 0.02em;
}
.app-header-title p {
  font-size: 13px;
  color: var(--cream-dark);
  font-style: italic;
  margin-top: 3px;
}
.header-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--brown-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  color: var(--cream-light);
  cursor: pointer;
  border: 1.5px solid rgba(255,255,255,0.25);
}

/* Bottom nav */
.bottom-nav {
  position: fixed;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 100%; max-width: 430px;
  background: white;
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 12px rgba(92,51,23,0.08);
}
.nav-item {
  flex: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 4px 6px;
  cursor: pointer;
  border: none; background: transparent;
  position: relative;
  transition: color 0.2s;
  font-size: 9px;
  color: var(--text-light);
  gap: 3px;
}
.nav-item.active { color: var(--brown-mid); }
.nav-item .nav-icon { font-size: 20px; line-height: 1; }
.nav-item .nav-label { font-size: 9px; font-family: 'Lato', sans-serif; }
.nav-badge {
  position: absolute; top: 5px; right: calc(50% - 14px);
  width: 8px; height: 8px;
  background: var(--red-alert);
  border-radius: 50%;
  border: 1.5px solid white;
}

/* Page content */
.page-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
  overflow-y: auto;
}

/* Cards */
.card {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 14px 16px;
  margin-bottom: 10px;
}
.card-sm {
  background: var(--cream-mid);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 8px;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--brown-mid);
  color: var(--cream-light);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover { background: var(--brown-dark); }
.btn-primary:active { transform: scale(0.98); }

.btn-ghost {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--brown-mid);
  cursor: pointer;
  font-family: 'Lato', sans-serif;
  transition: background 0.15s;
}
.btn-ghost:hover { background: var(--cream-mid); }

/* Section title */
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-light);
  margin-bottom: 10px;
}

/* Badges */
.badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 9px;
  border-radius: 20px;
  font-weight: 700;
}
.badge-brown { background: var(--cream-mid); color: var(--brown-mid); }
.badge-green { background: #E8F4E4; color: #3D7A2E; }
.badge-admin { background: var(--cream-dark); color: var(--brown-dark); }

/* Avatar */
.avatar {
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  color: var(--cream-light);
  flex-shrink: 0;
}

/* Room tag */
.room-tag {
  font-size: 10px;
  padding: 2px 9px;
  border-radius: 20px;
  background: var(--cream-mid);
  color: var(--brown-mid);
  border: 1px solid var(--cream-dark);
}

/* Input */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--cream-dark);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: 'Lato', sans-serif;
  background: white;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus, select:focus {
  border-color: var(--brown-light);
}
label {
  font-size: 11px;
  color: var(--text-light);
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 10px 0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeIn 0.25s ease; }

/* PWA safe area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .page-content { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
}

/* Collapsible sections */
.hidden { display: none; }
