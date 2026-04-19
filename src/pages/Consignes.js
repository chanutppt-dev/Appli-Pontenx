import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ICONS = ["🔑","🌡️","🏊","♻️","🌐","🍳","🔧","🌿","🚗","💡","🎵","📦"];

export default function Consignes() {
  const { isAdmin } = useAuth();
  const [consignes, setConsignes] = useState([]);
  const [open, setOpen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ icon: "🔑", title: "", subtitle: "", body: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "consignes"), orderBy("order"));
    return onSnapshot(q, snap => {
      setConsignes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await updateDoc(doc(db, "consignes", editing), { ...form, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "consignes"), { ...form, order: consignes.length, createdAt: serverTimestamp() });
    }
    setForm({ icon: "🔑", title: "", subtitle: "", body: "" });
    setShowForm(false);
    setEditing(null);
    setSaving(false);
  }

  function startEdit(c) {
    setEditing(c.id);
    setForm({ icon: c.icon, title: c.title, subtitle: c.subtitle, body: c.body });
    setShowForm(true);
    setOpen(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette fiche ?")) return;
    await deleteDoc(doc(db, "consignes", id));
  }

  return (
    <div className="fade-in">
      <p style={s.meta}>Fiches mises à jour par les administrateurs</p>

      {consignes.map(c => (
        <div key={c.id} style={s.card} onClick={() => setOpen(open === c.id ? null : c.id)}>
          <div style={s.header}>
            <span style={s.icon}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={s.title}>{c.title}</div>
              {c.subtitle && <div style={s.sub}>{c.subtitle}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isAdmin && (
                <button style={s.editBtn} onClick={e => { e.stopPropagation(); startEdit(c); }}>✏️</button>
              )}
              <span style={{ ...s.chevron, transform: open === c.id ? "rotate(90deg)" : "none" }}>›</span>
            </div>
          </div>
          {open === c.id && (
            <div style={s.body}>
              {c.body}
              {isAdmin && (
                <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); handleDelete(c.id); }}>
                  Supprimer cette fiche
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {isAdmin && (
        <>
          <button className="btn-ghost" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ icon: "🔑", title: "", subtitle: "", body: "" }); }} style={{ marginTop: 4 }}>
            {showForm && !editing ? "Annuler" : "+ Ajouter une fiche"}
          </button>

          {showForm && (
            <div className="card fade-in" style={{ marginTop: 10 }}>
              <h3 style={s.formTitle}>{editing ? "Modifier la fiche" : "Nouvelle fiche"}</h3>
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 10 }}>
                  <label>Icône</label>
                  <div style={s.iconGrid}>
                    {ICONS.map(ic => (
                      <div key={ic} style={{ ...s.iconOpt, ...(form.icon === ic ? s.iconSel : {}) }}
                        onClick={() => setForm(f => ({ ...f, icon: ic }))}>{ic}</div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Titre</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex : Accès & Alarme" />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Sous-titre</label>
                  <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex : Codes, clés, procédures" />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Contenu</label>
                  <textarea rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required placeholder="Instructions détaillées…" style={{ resize: "vertical" }} />
                </div>
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Enregistrement…" : "Sauvegarder"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  meta: { fontSize: 11, color: "#9A7A62", marginBottom: 12 },
  card: { background: "white", borderRadius: 12, border: "1px solid rgba(123,79,46,0.15)", padding: "12px 14px", marginBottom: 8, cursor: "pointer", boxShadow: "0 1px 6px rgba(92,51,23,0.07)" },
  header: { display: "flex", alignItems: "center", gap: 10 },
  icon: { fontSize: 22, flexShrink: 0 },
  title: { fontSize: 13, fontWeight: 700, color: "#2C1A0E" },
  sub: { fontSize: 10, color: "#9A7A62", marginTop: 1 },
  chevron: { color: "#9A7A62", fontSize: 16, transition: "transform 0.2s", lineHeight: 1 },
  body: { marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(123,79,46,0.1)", fontSize: 13, color: "#6B4C35", lineHeight: 1.7 },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px" },
  deleteBtn: { display: "block", marginTop: 12, background: "none", border: "none", color: "#C0392B", fontSize: 11, cursor: "pointer", padding: 0, textDecoration: "underline" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#5C3317", marginBottom: 14 },
  iconGrid: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginTop: 6 },
  iconOpt: { fontSize: 22, textAlign: "center", padding: "6px", borderRadius: 8, cursor: "pointer", border: "1px solid transparent" },
  iconSel: { background: "#F2E8D5", border: "1px solid #7B4F2E" },
};
