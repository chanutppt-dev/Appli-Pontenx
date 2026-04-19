import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = ["#7B4F2E","#A0693A","#C4874A","#6B8C5A","#8B6348","#B08060","#5C3317","#9A7A62"];
function userColor(uid = "") {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Messagerie() {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef();
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"), limit(100));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return unsub;
  }, []);

  async function sendMessage(mediaUrl = null, mediaType = null) {
    const content = text.trim();
    if (!content && !mediaUrl) return;
    setSending(true);
    await addDoc(collection(db, "messages"), {
      userId: currentUser.uid,
      userName: userProfile?.displayName || currentUser.email,
      text: content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      createdAt: serverTimestamp(),
    });
    setText("");
    setSending(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const isVideo = file.type.startsWith("video/");
    const storageRef = ref(storage, `messages/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await sendMessage(url, isVideo ? "video" : "image");
    setUploading(false);
  }

  function formatTime(ts) {
    if (!ts) return "";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return format(date, "d MMM HH:mm", { locale: fr });
    } catch { return ""; }
  }

  // Group consecutive messages by same user
  function groupMessages(msgs) {
    const groups = [];
    msgs.forEach((m, i) => {
      const prev = msgs[i - 1];
      if (prev && prev.userId === m.userId) {
        groups[groups.length - 1].push(m);
      } else {
        groups.push([m]);
      }
    });
    return groups;
  }

  const grouped = groupMessages(messages);
  const isMe = (uid) => uid === currentUser.uid;

  return (
    <div style={s.container}>
      {/* Group info */}
      <div style={s.groupBar}>
        <div style={s.groupAv}>🏡</div>
        <div>
          <div style={s.groupName}>Maison des cousins</div>
          <div style={s.groupSub}>Fil familial · tous les membres</div>
        </div>
      </div>

      {/* Messages */}
      <div style={s.msgList}>
        {grouped.length === 0 && (
          <div style={s.empty}>Commencez la conversation ! 👋</div>
        )}
        {grouped.map((group, gi) => {
          const me = isMe(group[0].userId);
          return (
            <div key={gi} style={{ ...s.group, alignItems: me ? "flex-end" : "flex-start" }}>
              {!me && <div style={s.senderName}>{group[0].userName}</div>}
              {group.map((m, mi) => (
                <div key={m.id} style={{ display: "flex", gap: 6, alignItems: "flex-end", flexDirection: me ? "row-reverse" : "row" }}>
                  {mi === group.length - 1 && !me && (
                    <div style={{ ...s.av, background: userColor(m.userId) }}>
                      {getInitials(m.userName)}
                    </div>
                  )}
                  {mi === group.length - 1 && me && (
                    <div style={{ ...s.av, background: userColor(m.userId) }}>
                      {getInitials(m.userName)}
                    </div>
                  )}
                  {mi < group.length - 1 && <div style={{ width: 26 }} />}
                  <div>
                    {m.mediaUrl && (
                      <div style={{ marginBottom: m.text ? 4 : 0 }}>
                        {m.mediaType === "video" ? (
                          <video src={m.mediaUrl} controls style={s.mediaBubble} />
                        ) : (
                          <img src={m.mediaUrl} alt="" style={s.mediaBubble} />
                        )}
                      </div>
                    )}
                    {m.text && (
                      <div style={{ ...s.bubble, ...(me ? s.bubbleMe : s.bubbleThem) }}>
                        {m.text}
                      </div>
                    )}
                    {mi === group.length - 1 && (
                      <div style={{ ...s.time, textAlign: me ? "right" : "left" }}>
                        {formatTime(m.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={s.inputBar}>
        <button style={s.attachBtn} onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? "⏳" : "📎"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <input
          style={s.textInput}
          placeholder="Message à la famille…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          disabled={sending}
        />
        <button style={s.sendBtn} onClick={() => sendMessage()} disabled={sending || !text.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

const s = {
  container: { display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", marginBottom: 0 },
  groupBar: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid rgba(123,79,46,0.12)", marginBottom: 10, flexShrink: 0 },
  groupAv: { width: 40, height: 40, borderRadius: "50%", background: "#7B4F2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  groupName: { fontSize: 14, fontWeight: 700, color: "#2C1A0E" },
  groupSub: { fontSize: 10, color: "#9A7A62" },
  msgList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  empty: { fontSize: 13, color: "#9A7A62", textAlign: "center", marginTop: 40 },
  group: { display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 },
  senderName: { fontSize: 10, fontWeight: 700, color: "#6B4C35", marginLeft: 32, marginBottom: 2 },
  av: { width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#FAF5ED", flexShrink: 0 },
  bubble: { padding: "8px 12px", borderRadius: 16, fontSize: 13, lineHeight: 1.5, maxWidth: 240 },
  bubbleMe: { background: "#7B4F2E", color: "#FAF5ED", borderBottomRightRadius: 4 },
  bubbleThem: { background: "white", color: "#2C1A0E", border: "1px solid rgba(123,79,46,0.12)", borderBottomLeftRadius: 4 },
  mediaBubble: { maxWidth: 200, maxHeight: 200, borderRadius: 12, display: "block", objectFit: "cover" },
  time: { fontSize: 9, color: "#9A7A62", marginTop: 3, marginLeft: 4, marginRight: 4 },
  inputBar: { display: "flex", gap: 8, alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(123,79,46,0.12)", flexShrink: 0 },
  attachBtn: { width: 36, height: 36, borderRadius: "50%", background: "#F2E8D5", border: "none", cursor: "pointer", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  textInput: { flex: 1, padding: "9px 14px", borderRadius: 20, border: "1px solid rgba(123,79,46,0.2)", background: "#FAF5ED", fontSize: 13, fontFamily: "'Lato', sans-serif", outline: "none" },
  sendBtn: { width: 36, height: 36, borderRadius: "50%", background: "#7B4F2E", border: "none", color: "#FAF5ED", cursor: "pointer", fontSize: 14, flexShrink: 0 },
};
