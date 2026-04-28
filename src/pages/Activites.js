import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";

const CATS = ["Tous","Balade","Sport","Marché","Nature","Culture"];
const CAT_ICONS = { Balade:"🚶", Sport:"🏃", Marché:"🛒", Nature:"🌿", Culture:"🏛️" };

const DEFAULT_ACTIVITES = [
  { icon:"🌲", title:"Circuit de la Forge", desc:"Sentier balisé bleu, le long du courant des Forges. Très ombragé, histoire des forges de Pontenx.", cat:"Balade" },
  { icon:"🛶", title:"Descente en canoë", desc:"Depuis le pont de Pountras jusqu'au lac d'Aureilhan à Mimizan. Été uniquement.", cat:"Sport" },
  { icon:"🚲", title:"Balade vélo", desc:"Piste cyclable vers le lac d'Aureilhan et Mimizan Plage. Tout niveau, idéal en famille.", cat:"Balade" },
  { icon:"🐝", title:"Les Ruchers du Born", desc:"Ferme apicole. Visite guidée, chasse au trésor, dégustation miels des Landes. Sur réservation.", cat:"Nature" },
  { icon:"🛵", title:"J'veux Du Solex", desc:"Balades en Vélo Solex dans la forêt de pins maritimes. Expérience unique, 35€/pers. Résa: 06 23 56 16 88", cat:"Sport" },
  { icon:"🏊", title:"Lac des Forges", desc:"340 ha classé. Baignade, pêche, pique-nique, activités nautiques.", cat:"Nature" },
  { icon:"🛒", title:"Marché de Pontenx", desc:"Tous les samedis matin. Produits locaux, artisanat landais.", cat:"Marché" },
  { icon:"🌊", title:"Mimizan Plage", desc:"10 km. Surf, baignade, promenade fleurie. Marché nocturne artisanal en été.", cat:"Balade" },
  { icon:"🏇", title:"Centre équestre", desc:"Cours tous niveaux, balades forêt et plage pour confirmés. Élevage, compétition.", cat:"Sport" },
];

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Activites() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [activites, setActivites] = useState([]);
  const [cat, setCat] = useState("Tous");
  const [expanded, setExpanded] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ icon:"🌲", title:"", desc:"", cat:"Balade", mediaUrl:"" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "activites"), orderBy("order"));
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) {
        // Seed default data on first load (admin only)
      }
      setActivites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  async function seedDefaults() {
    for (let i = 0; i < DEFAULT_ACTIVITES.length; i++) {
      await addDoc(collection(db, "activites"), { ...DEFAULT_ACTIVITES[i], order: i, comments: [], createdAt: serverTimestamp() });
    }
  }

  async function addComment(actId) {
    const text = commentText[actId]?.trim();
    if (!text) return;
    const comment = {
      userId: currentUser.uid,
      userName: userProfile?.displayName || currentUser.email,
      text,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, "activites", actId), { comments: arrayUnion(comment) });
    setCommentText(t => ({ ...t, [actId]: "" }));
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileRef2 = ref(storage, `activites/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef2, file);
    const url = await getDownloadURL(fileRef2);
    setForm(f => ({ ...f, mediaUrl: url }));
    setUploading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await addDoc(collection(db, "activites"), {
      ...form,
      order: activites.length,
      comments: [],
      createdAt: serverTimestamp(),
    });
    setForm({ icon:"🌲", title:"", desc:"", cat:"Balade", mediaUrl:"" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette activité ?")) return;
    await deleteDoc(doc(db, "activites", id));
  }

  const filtered = cat === "Tous" ? activites : activites.filter(a => a.cat === cat);

  return (
    <div className="fade-in">
      {/* Category tabs */}
      <div style={s.tabs}>
        {CATS.map(c => (
          <button key={c} style={{ ...s.tab, ...(cat === c ? s.tabActive : {}) }} onClick={() => setCat(c)}>
            {CAT_ICONS[c] && <span>{CAT_ICONS[c]} </span>}{c}
          </button>
        ))}
      </div>

      {/* Seed button for admin if empty */}
      {isAdmin && activites.length === 0 && (
        <button className="btn-ghost" onClick={seedDefaults} style={{ marginBottom: 10 }}>
          Charger les activités par défaut (Pontenx)
        </button>
      )}

      {filtered.length === 0 && (
        <p style={s.empty}>Aucune activité dans cette catégorie.</p>
      )}

      {filtered.map(a => (
        <div className="card" key={a.id} style={{ padding: "12px 14px" }}>
          <div style={s.actTop} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
            <div style={s.actImg}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={s.actTitle}>{a.title}</div>
              <div style={s.actDesc}>{a.desc}</div>
              <span className="badge badge-brown">{a.cat}</span>
            </div>
            {isAdmin && (
              <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); handleDelete(a.id); }}>✕</button>
            )}
          </div>

          {/* Media */}
          {a.mediaUrl && (
            <div style={{ marginTop: 10 }}>
              {a.mediaUrl.includes(".mp4") || a.mediaUrl.includes("video") ? (
                <video src={a.mediaUrl} controls style={s.media} />
              ) : (
                <img src={a.mediaUrl} alt={a.title} style={s.media} />
              )}
            </div>
          )}

          {/* Comments */}
          {expanded === a.id && (
            <div style={s.commentZone}>
              <hr className="divider" />
              {(a.comments || []).map((c, i) => (
                <div key={i} style={s.cmt}>
                  <div style={s.cmtAv}>{getInitials(c.userName)}</div>
                  <div style={s.cmtBody}>
                    <span style={s.cmtName}>{c.userName}</span>
                    <span style={s.cmtText}> — {c.text}</span>
                  </div>
                </div>
              ))}
              <div style={s.cmtInput}>
                <input
                  placeholder="Ajouter un commentaire…"
                  value={commentText[a.id] || ""}
                  onChange={e => setCommentText(t => ({ ...t, [a.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addComment(a.id)}
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button style={s.sendBtn} onClick={() => addComment(a.id)}>➤</button>
              </div>
            </div>
          )}

          {!expanded || expanded !== a.id ? (
            <button style={s.expandBtn} onClick={() => setExpanded(a.id)}>
              {(a.comments || []).length} commentaire{(a.comments || []).length !== 1 ? "s" : ""} · Répondre
            </button>
          ) : null}
        </div>
      ))}

      { (
        <>
          <button className="btn-ghost" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
            {showForm ? "Annuler" : "+ Ajouter une activité"}
          </button>
          {showForm && (
            <div className="card fade-in" style={{ marginTop: 10 }}>
              <h3 style={s.formTitle}>Nouvelle activité</h3>
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 10 }}>
                  <label>Icône (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ width: 60 }} maxLength={2} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Titre</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex : Randonnée en forêt" />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Description</label>
                  <textarea rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} required placeholder="Adresse, horaires, tarifs…" style={{ resize: "vertical" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Catégorie</label>
                  <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
                    {CATS.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Photo ou vidéo</label>
                  <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} ref={fileRef} style={{ fontSize: 12 }} />
                  {uploading && <p style={{ fontSize: 11, color: "#9A7A62", marginTop: 4 }}>Téléchargement…</p>}
                  {form.mediaUrl && <p style={{ fontSize: 11, color: "#6B8C5A", marginTop: 4 }}>✓ Média ajouté</p>}
                </div>
                <button className="btn-primary" type="submit" disabled={saving || uploading}>
                  {saving ? "Enregistrement…" : "Ajouter l'activité"}
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
  tabs: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 2 },
  tab: { padding: "5px 12px", borderRadius: 20, fontSize: 11, border: "1px solid rgba(123,79,46,0.2)", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", color: "#6B4C35", fontFamily: "'Lato', sans-serif" },
  tabActive: { background: "#7B4F2E", color: "#FAF5ED", borderColor: "#7B4F2E", fontWeight: 700 },
  empty: { fontSize: 12, color: "#9A7A62", textAlign: "center", padding: "20px 0" },
  actTop: { display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" },
  actImg: { width: 48, height: 48, borderRadius: 10, background: "#F2E8D5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  actTitle: { fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 },
  actDesc: { fontSize: 11, color: "#6B4C35", lineHeight: 1.5, marginBottom: 6 },
  deleteBtn: { background: "none", border: "none", color: "#C0392B", fontSize: 14, cursor: "pointer", padding: "2px 6px", flexShrink: 0 },
  media: { width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover" },
  commentZone: { marginTop: 8 },
  cmt: { display: "flex", gap: 7, marginBottom: 8, alignItems: "flex-start" },
  cmtAv: { width: 24, height: 24, borderRadius: "50%", background: "#A0693A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#FAF5ED", flexShrink: 0 },
  cmtBody: { fontSize: 11, lineHeight: 1.5 },
  cmtName: { fontWeight: 700, color: "#2C1A0E" },
  cmtText: { color: "#6B4C35" },
  cmtInput: { display: "flex", gap: 8, alignItems: "center", marginTop: 8 },
  sendBtn: { width: 32, height: 32, borderRadius: "50%", background: "#7B4F2E", border: "none", color: "#FAF5ED", cursor: "pointer", fontSize: 13, flexShrink: 0 },
  expandBtn: { background: "none", border: "none", color: "#9A7A62", fontSize: 11, cursor: "pointer", padding: "6px 0 0", display: "block" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#5C3317", marginBottom: 14 },
};
