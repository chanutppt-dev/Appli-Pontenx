import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [mode, setMode] = useState("login"); // login | reset

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>🏡</span>
        </div>
        <h1 style={styles.title}>Pontenx</h1>
        <p style={styles.subtitle}>Maison des cousins</p>
      </div>

      <div style={styles.card}>
        {mode === "login" ? (
          <>
            <h2 style={styles.formTitle}>Connexion</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleLogin}>
              <div style={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom@famille.fr"
                  required
                  autoComplete="email"
                />
              </div>
              <div style={styles.field}>
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{marginTop: 8}}>
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
            <button
              style={styles.forgotBtn}
              onClick={() => { setMode("reset"); setError(""); }}
            >
              Mot de passe oublié ?
            </button>
          </>
        ) : (
          <>
            <h2 style={styles.formTitle}>Réinitialiser</h2>
            {resetSent ? (
              <div style={styles.success}>
                Un email a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.
              </div>
            ) : (
              <>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleReset}>
                  <div style={styles.field}>
                    <label>Votre email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="prenom@famille.fr"
                      required
                    />
                  </div>
                  <button className="btn-primary" type="submit" disabled={loading} style={{marginTop: 8}}>
                    {loading ? "Envoi…" : "Envoyer le lien"}
                  </button>
                </form>
              </>
            )}
            <button style={styles.forgotBtn} onClick={() => { setMode("login"); setError(""); setResetSent(false); }}>
              ← Retour à la connexion
            </button>
          </>
        )}
      </div>

      <p style={styles.footer}>Accès réservé aux membres de la famille</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    background: "linear-gradient(160deg, #5C3317 0%, #7B4F2E 45%, #A0693A 100%)",
  },
  top: { textAlign: "center", marginBottom: 28 },
  logoWrap: {
    width: 72, height: 72,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px",
    fontSize: 36,
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.25)",
  },
  logoIcon: { fontSize: 36 },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 36,
    fontWeight: 600,
    color: "#FAF5ED",
    letterSpacing: "0.04em",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(250,245,237,0.75)",
    fontStyle: "italic",
    marginTop: 4,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "white",
    borderRadius: 18,
    padding: "24px 22px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 600,
    color: "#5C3317",
    marginBottom: 18,
  },
  field: { marginBottom: 12 },
  error: {
    background: "#FEE2E2",
    color: "#B91C1C",
    fontSize: 12,
    padding: "8px 12px",
    borderRadius: 8,
    marginBottom: 12,
  },
  success: {
    background: "#DCFCE7",
    color: "#166534",
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
    lineHeight: 1.5,
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#A0693A",
    fontSize: 12,
    cursor: "pointer",
    marginTop: 12,
    padding: 0,
    display: "block",
    textAlign: "center",
    width: "100%",
  },
  footer: {
    color: "rgba(250,245,237,0.5)",
    fontSize: 11,
    marginTop: 20,
    textAlign: "center",
  },
};
