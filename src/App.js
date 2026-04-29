import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Calendrier from "./pages/Calendrier";
import Consignes from "./pages/Consignes";
import Activites from "./pages/Activites";
import Messagerie from "./pages/Messagerie";
import Famille from "./pages/Famille";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "./firebase";
import "./index.css";

const TABS = [
  { id: "calendrier", label: "Calendrier", icon: "📅" },
  { id: "consignes",  label: "Consignes",  icon: "📋" },
  { id: "activites",  label: "Activités",  icon: "🏃" },
  { id: "messages",   label: "Messages",   icon: "💬" },
  { id: "famille",    label: "Famille",    icon: "👨‍👩‍👧" },
];

function AppShell() {
  const { currentUser, userProfile } = useAuth();
  const [tab, setTab] = useState("calendrier");
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const saved = localStorage.getItem("pontenx_last_seen");
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) return;
      const last = snap.docs[0].data();
      if (!last.createdAt) return;
      const lastMsgDate = last.createdAt.toDate ? last.createdAt.toDate() : new Date();
      const seen = saved ? new Date(saved) : null;
      setUnread(!seen || lastMsgDate > seen);
    });
    return unsub;
  }, [currentUser]);

  function handleTabChange(id) {
    setTab(id);
    if (id === "messages") {
      const now = new Date().toISOString();
      localStorage.setItem("pontenx_last_seen", now);
      setUnread(false);
    }
  }

  function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  if (!currentUser) return <Login />;

  const pages = {
    calendrier: <Calendrier />,
    consignes:  <Consignes />,
    activites:  <Activites />,
    messages:   <Messagerie />,
    famille:    <Famille />,
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header" style={{ flexDirection: "column", alignItems: "stretch", padding: "0" }}>
        {/* Ligne 1 — Pontenx au centre, v1.0 à droite */}
        <div style={{ display: "flex", alignItems: "center", paddingTop: "calc(14px + env(safe-area-inset-top))", paddingLeft: 20, paddingRight: 20, paddingBottom: 2 }}>
          <div style={{ width: 80 }} />
          <h1 style={{ flex: 1, fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#FAF5ED", letterSpacing: "0.02em", textAlign: "center" }}>
            Pontenx
          </h1>
          <div style={{ width: 80, fontSize: 9, color: "rgba(250,245,237,0.55)", textAlign: "right", lineHeight: 1.4, fontFamily: "'Lato', sans-serif" }}>
            v 1.0<br/>par Stef
          </div>
        </div>
        {/* Ligne 2 — Maison des cousins au centre, avatar à droite */}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 20, paddingRight: 20, paddingBottom: 14 }}>
          <div style={{ width: 36 }} />
          <p style={{ flex: 1, fontSize: 13, color: "rgba(250,245,237,0.80)", fontStyle: "italic", fontFamily: "'Lato', sans-serif", textAlign: "center" }}>
            Maison des cousins
          </p>
          <div className="header-avatar" onClick={() => handleTabChange("famille")}>
            {getInitials(userProfile?.displayName || currentUser.email || "")}
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="page-content">
        {pages[tab]}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? "active" : ""}`}
            onClick={() => handleTabChange(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
            {t.id === "messages" && unread && <span className="nav-badge" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
