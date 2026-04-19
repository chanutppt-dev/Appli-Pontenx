import React, { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameMonth, isWithinInterval, parseISO, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const ROOMS = [
  "Chambre Principale", "Chambre Rez-de-Chaussée", "Chambre Jaune",
  "Chambre Laura Ashley", "Chambre Grecque", "Chambre aux Baldaquins",
  "Chambre aux Lits Anciens", "Chambre Bleue", "Pavillon",
];

const COLORS = [
  "#7B4F2E","#A0693A","#C4874A","#6B8C5A","#8B6348",
  "#B08060","#5C3317","#9A7A62","#C4A06A",
];

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Calendrier() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [current, setCurrent] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ arrival: "", departure: "", rooms: [], comment: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Couleur par utilisateur
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    const q = query(collection(db, "reservations"), orderBy("arrival"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReservations(data);
      // Assign colors
      const map = {};
      let i = 0;
      data.forEach(r => {
        if (!map[r.userId]) { map[r.userId] = COLORS[i % COLORS.length]; i++; }
      });
      setColorMap(map);
    });
    return unsub;
  }, []);

  // Calendar grid
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = (getDay(monthStart) + 6) % 7; // Monday start

  function reservationsForDay(day) {
    return reservations.filter(r => {
      try {
        const a = parseISO(r.arrival);
        const d = parseISO(r.departure);
        return isWithinInterval(day, { start: a, end: d });
      } catch { return false; }
    });
  }

  function handleDayClick(day) {
    const dayRes = reservationsForDay(day);
    setSelectedDay({ day, reservations: dayRes });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.arrival || !form.departure) { setError("Veuillez renseigner les dates."); return; }
    if (form.departure <= form.arrival) { setError("La date de départ doit être après l'arrivée."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "reservations"), {
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.email,
        arrival: form.arrival,
        departure: form.departure,
        rooms: form.rooms,
        comment: form.comment,
        createdAt: serverTimestamp(),
      });
      setForm({ arrival: "", departure: "", rooms: [], comment: "" });
      setShowForm(false);
    } catch (err) {
      setError("Erreur lors de la sauvegarde. Réessayez.");
    }
    setSaving(false);
  }

  async function handleDelete(id, userId) {
    if (userId !== currentUser.uid && !isAdmin) return;
    if (!window.confirm("Supprimer cette réservation ?")) return;
    await deleteDoc(doc(db, "reservations", id));
  }

  function toggleRoom(room) {
    setForm(f => ({
      ...f,
      rooms: f.rooms.includes(room) ? f.rooms.filter(r => r !== room) : [...f.rooms, room],
    }));
  }

  const prevMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="fade-in">
      {/* Month nav */}
      <div style={s.monthNav}>
        <button style={s.navBtn} onClick={prevMonth}>‹</button>
        <span style={s.monthLabel}>
          {format(current, "MMMM yyyy", { locale: fr })}
        </span>
        <button style={s.navBtn} onClick={nextMonth}>›</button>
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: "12px 10px" }}>
        <div style={s.calGrid}>
          {["L","M","M","J","V","S","D"].map((d, i) => (
            <div key={i} style={s.calLabel}>{d}</div>
          ))}
          {Array(startOffset).fill(null).map((_, i) => <div key={"e"+i} />)}
          {days.map(day => {
            const dayRes = reservationsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                style={{
                  ...s.calDay,
                  ...(isToday ? s.today : {}),
                  ...(selectedDay && isSameDay(day, selectedDay.day) ? s.selected : {}),
                }}
                onClick={() => handleDayClick(day)}
              >
                <span>{format(day, "d")}</span>
                {dayRes.length > 0 && (
                  <div style={s.dots}>
                    {dayRes.slice(0, 3).map(r => (
                      <div key={r.id} style={{ ...s.dot, background: colorMap[r.userId] || "#A0693A" }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card fade-in" style={{ marginBottom: 10 }}>
          <div style={s.dayTitle}>
            {format(selectedDay.day, "EEEE d MMMM", { locale: fr })}
          </div>
          {selectedDay.reservations.length === 0 ? (
            <p style={s.empty}>Aucune réservation ce jour</p>
          ) : (
            selectedDay.reservations.map(r => (
              <div key={r.id} style={s.miniCard}>
                <div style={{ ...s.miniAv, background: colorMap[r.userId] || "#A0693A" }}>
                  {getInitials(r.userName)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.miniName}>{r.userName}</div>
                  <div style={s.miniDates}>{r.arrival} → {r.departure}</div>
                  {r.rooms?.length > 0 && (
                    <div style={s.tagRow}>
                      {r.rooms.map(rm => <span key={rm} className="room-tag">{rm}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All stays */}
      <div className="section-label">Tous les séjours</div>
      {reservations.length === 0 && (
        <p style={s.empty}>Aucune réservation pour le moment.</p>
      )}
      {reservations.map(r => (
        <div className="card" key={r.id} style={{ padding: "12px 14px" }}>
          <div style={s.stayHeader}>
            <div style={{ ...s.av, background: colorMap[r.userId] || "#A0693A" }}>
              {getInitials(r.userName)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.stayName}>{r.userName}</div>
              <div style={s.stayDates}>{r.arrival} → {r.departure}</div>
            </div>
            {(r.userId === currentUser.uid || isAdmin) && (
              <button style={s.deleteBtn} onClick={() => handleDelete(r.id, r.userId)}>✕</button>
            )}
          </div>
          {r.rooms?.length > 0 && (
            <div style={s.tagRow}>
              {r.rooms.map(rm => <span key={rm} className="room-tag">{rm}</span>)}
            </div>
          )}
          {r.comment && <div style={s.comment}>"{r.comment}"</div>}
        </div>
      ))}

      {/* Add reservation button */}
      <button className="btn-ghost" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
        {showForm ? "Annuler" : "+ Réserver mon séjour"}
      </button>

      {/* Reservation form */}
      {showForm && (
        <div className="card fade-in" style={{ marginTop: 10 }}>
          <h3 style={s.formTitle}>Nouvelle réservation</h3>
          {error && <div style={s.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={s.dateRow}>
              <div style={{ flex: 1 }}>
                <label>Arrivée</label>
                <input type="date" value={form.arrival} onChange={e => setForm(f => ({ ...f, arrival: e.target.value }))} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Départ</label>
                <input type="date" value={form.departure} onChange={e => setForm(f => ({ ...f, departure: e.target.value }))} required />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Chambres <span style={{ color: "#9A7A62", fontWeight: 400 }}>(optionnel)</span></label>
              <div style={s.roomsGrid}>
                {ROOMS.map(room => (
                  <div
                    key={room}
                    style={{ ...s.roomCheck, ...(form.rooms.includes(room) ? s.roomChecked : {}) }}
                    onClick={() => toggleRoom(room)}
                  >
                    {room}
                  </div>
                ))}
              </div>
              <p style={s.skipNote}>Vous pouvez réserver sans choisir de chambre</p>
            </div>
            <div style={{ marginTop: 10 }}>
              <label>Commentaire (optionnel)</label>
              <textarea
                rows={2}
                placeholder="Ex : nous serons 4, dont 2 enfants…"
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                style={{ resize: "none" }}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: 12 }}>
              {saving ? "Enregistrement…" : "Confirmer la réservation"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const s = {
  monthNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navBtn: { background: "white", border: "1px solid #E8D5B7", borderRadius: 8, padding: "4px 12px", fontSize: 16, color: "#7B4F2E", cursor: "pointer" },
  monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#5C3317", textTransform: "capitalize" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 },
  calLabel: { textAlign: "center", fontSize: 9, color: "#9A7A62", padding: "2px 0 6px", fontWeight: 700, letterSpacing: "0.05em" },
  calDay: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 1px 3px", borderRadius: 7, cursor: "pointer", fontSize: 11, color: "#2C1A0E", gap: 2, minHeight: 34, transition: "background 0.15s" },
  today: { fontWeight: 700, border: "1.5px solid #7B4F2E" },
  selected: { background: "#F2E8D5" },
  dots: { display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: "50%" },
  dayTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#5C3317", marginBottom: 10, textTransform: "capitalize" },
  empty: { fontSize: 12, color: "#9A7A62", textAlign: "center", padding: "8px 0" },
  miniCard: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  miniAv: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#FAF5ED", flexShrink: 0 },
  miniName: { fontSize: 12, fontWeight: 700, color: "#2C1A0E" },
  miniDates: { fontSize: 10, color: "#9A7A62" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 },
  stayHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  av: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FAF5ED", flexShrink: 0 },
  stayName: { fontSize: 13, fontWeight: 700, color: "#2C1A0E" },
  stayDates: { fontSize: 11, color: "#9A7A62" },
  comment: { fontSize: 11, color: "#9A7A62", fontStyle: "italic", marginTop: 6 },
  deleteBtn: { background: "none", border: "none", color: "#C0392B", fontSize: 14, cursor: "pointer", padding: "2px 6px" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#5C3317", marginBottom: 14 },
  errorBox: { background: "#FEE2E2", color: "#B91C1C", fontSize: 12, padding: "8px 12px", borderRadius: 8, marginBottom: 12 },
  dateRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  roomsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 },
  roomCheck: { padding: "7px 8px", border: "1px solid #E8D5B7", borderRadius: 8, cursor: "pointer", fontSize: 10, color: "#6B4C35", background: "white", textAlign: "center", transition: "all 0.15s", lineHeight: 1.3 },
  roomChecked: { background: "#F2E8D5", borderColor: "#7B4F2E", color: "#5C3317", fontWeight: 700 },
  skipNote: { fontSize: 10, color: "#9A7A62", textAlign: "center", marginTop: 6 },
};
