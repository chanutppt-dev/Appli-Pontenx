import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = ["#7B4F2E","#A0693A","#C4874A","#6B8C5A","#8B6348","#B08060","#5C3317","#9A7A62","#C4A06A"];
function nameColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Famille() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", role: "member" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("displayName"));
    return onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 6) { setError("Mot de passe : minimum 6 caractères."); return; }
    setSaving(true);
    try {
      // Create auth user
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Save profile in Firestore
      await addDoc(collection(db, "users"), {
        uid: cred.user.uid,
        displayName: form.displayName,
        email: form.email,
        role: form.role,
        createdAt: serverTimestamp(),
      });
      setSuccess(`${form.displayName} a été ajouté(e) avec succès.`);
      setForm({ displayName: "", email: "", password: "", role: "member" });
      setShowInvite(false);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Erreur : " + err.message);
      }
    }
    setSaving(false);
  }

  async function toggleAdmin(member) {
    const newRole = member.role === "admin" ? "member" : "admin";
    await updateDoc(doc(db, "users", member.id), { role: newRole });
  }

  async function deleteMember(id) {
    if (!window.confirm("Supprimer ce membre ?")) return;
    await deleteDoc(doc(db, "users", id));
  }

  const admins = members.filter(m => m.role === "admin");
  const regulars = members.filter(m => m.role !== "admin");

  return (
    <div className="fade-in">
      {/* My profile card */}
      <div className="card" style={{ textAlign: "center", padding: "20px 16px", marginBottom: 14 }}>
        <div style={{ ...s.bigAv, background: nameColor(userProfile?.displayName || "") }}>
          {getInitials(userProfile?.displayName || currentUser?.email || "")}
        </div>
        <div style={s.myName}>{userProfile?.displayName || currentUser?.email}</div>
        <div style={s.myRole}>{userProfile?.role === "admin" ? "Administrateur" : "Membre"}</div>
        <button style={s.logoutBtn} onClick={logout}>Se déconnecter</button>
      </div>

      {success && <div style={s.success}>{success}</div>}

      {/* Admins */}
      {admins.length > 0 && (
        <>
          <div className="section-label">Administrateurs</div>
          {admins.map(m => <MemberRow key={m.id} m={m} currentUser={currentUser} isAdmin={isAdmin} onToggle={toggleAdmin} onDelete={deleteMember} />)}
        </>
      )}

      {/* Members */}
      <div className="section-label" style={{ marginTop: 10 }}>
        Membres ({members.length})
      </div>
      {regulars.map(m => <MemberRow key={m.id} m={m} currentUser={currentUser} isAdmin={isAdmin} onToggle={toggleAdmin} onDelete={deleteMember} />)}

      {members.length === 0 && (
        <p style={s.empty}>Aucun membre enregistré.</p>
      )}

      {/* Invite */}
      {isAdmin && (
        <>
          <button className="btn-ghost" onClick={() => { setShowInvite(!showInvite); setError(""); }} style={{ marginTop: 10 }}>
            {showInvite ? "Annuler" : "+ Ajouter un membre"}
          </button>

          {showInvite && (
            <div className="card fade-in" style={{ marginTop: 10 }}>
              <h3 style={s.formTitle}>Nouvel accès</h3>
              <p style={s.formNote}>Créez un compte pour un nouveau membre de la famille. Communiquez-lui l'email et le mot de passe choisis.</p>
              {error && <div style={s.error}>{error}</div>}
              <form onSubmit={handleInvite}>
                <div style={{ marginBottom: 10 }}>
                  <label>Nom complet</label>
                  <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required placeholder="Ex : Sophie Martin" />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="sophie@email.fr" />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label>Mot de passe (à communiquer)</label>
                  <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min. 6 caractères" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label>Rôle</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="member">Membre</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Création…" : "Créer le compte"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MemberRow({ m, currentUser, isAdmin, onToggle, onDelete }) {
  const colors = ["#7B4F2E","#A0693A","#C4874A","#6B8C5A","#8B6348","#B08060","#5C3317","#9A7A62","#C4A06A"];
  function nameColor(name = "") {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }
  return (
    <div style={s.memberRow}>
      <div style={{ ...s.av, background: nameColor(m.displayName || "") }}>
        {(m.displayName || m.email || "").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={s.mName}>{m.displayName || m.email}</div>
        <div style={s.mSub}>{m.email}</div>
      </div>
      {m.role === "admin" && <span className="badge badge-admin">Admin</span>}
      {isAdmin && m.uid !== currentUser.uid && (
        <div style={{ display: "flex", gap: 6 }}>
          <button style={s.iconBtn} onClick={() => onToggle(m)} title={m.role === "admin" ? "Retirer admin" : "Rendre admin"}>
            {m.role === "admin" ? "⬇️" : "⬆️"}
          </button>
          <button style={s.iconBtn} onClick={() => onDelete(m.id)} title="Supprimer">✕</button>
        </div>
      )}
    </div>
  );
}

const s = {
  bigAv: { width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#FAF5ED", margin: "0 auto 10px" },
  myName: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#2C1A0E" },
  myRole: { fontSize: 12, color: "#A0693A", marginTop: 3 },
  logoutBtn: { background: "none", border: "1px solid rgba(123,79,46,0.3)", borderRadius: 8, padding: "6px 16px", fontSize: 12, color: "#7B4F2E", cursor: "pointer", marginTop: 12, fontFamily: "'Lato', sans-serif" },
  success: { background: "#DCFCE7", color: "#166534", fontSize: 12, padding: "8px 12px", borderRadius: 8, marginBottom: 10 },
  empty: { fontSize: 12, color: "#9A7A62", textAlign: "center", padding: "16px 0" },
  memberRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(123,79,46,0.08)" },
  av: { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#FAF5ED", flexShrink: 0 },
  mName: { fontSize: 13, fontWeight: 700, color: "#2C1A0E" },
  mSub: { fontSize: 10, color: "#9A7A62" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#5C3317", marginBottom: 6 },
  formNote: { fontSize: 11, color: "#9A7A62", marginBottom: 14, lineHeight: 1.5 },
  error: { background: "#FEE2E2", color: "#B91C1C", fontSize: 12, padding: "8px 12px", borderRadius: 8, marginBottom: 12 },
};
