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
        {/* Ligne du haut — sous la caméra */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "calc(14px + env(safe-area-inset-top))", paddingLeft: 20, paddingRight: 20, paddingBottom: 4 }}>
          <div style={{ fontSize: 11, color: "rgba(250,245,237,0.80)", fontStyle: "italic", fontFamily: "'Lato', sans-serif" }}>
            Maison des cousins
          </div>
          <div style={{ fontSize: 9, color: "rgba(250,245,237,0.55)", textAlign: "right", lineHeight: 1.4, fontFamily: "'Lato', sans-serif" }}>
            v 1.0 · Développé par Stef
          </div>
        </div>
        {/* Ligne du bas — titre + avatar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20, paddingBottom: 14 }}>
          <div style={{ width: 36 }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#FAF5ED", letterSpacing: "0.02em", textAlign: "center" }}>
            Pontenx
          </h1>
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
