import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff,
  GraduationCap, ArrowRight, Zap
} from "lucide-react";
import PasswordToggle from "../components/PasswordToggle";
import { ROLE_LABELS } from "../data/permissions";

const demoUsers = [
  { correo: "carlos@admin.com",       rol: "SUPER_ADMIN"         },
  { correo: "maria@ie001.edu.co",     rol: "ADMIN_INSTITUCIONAL" },
  { correo: "pedro@ie001.edu.co",     rol: "COORDINADOR"         },
  { correo: "ana@ie001.edu.co",       rol: "SECRETARIA"          },
  { correo: "luis@ie001.edu.co",      rol: "DOCENTE"             },
  { correo: "jorge@ie001.edu.co",     rol: "DIRECTOR_GRUPO"      },
  { correo: "claudia@ie001.edu.co",   rol: "PSICOORIENTADOR"     },
  { correo: "juan@estudiante.edu.co", rol: "ESTUDIANTE"          },
  { correo: "roberto@padre.com",      rol: "PADRE"               },
];

const MOCK_CODE = "123456";

/* ─── Input reutilizable ──────────────────────────────── */
function Field({ label, hint, error, suffix, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      {(label || hint) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          {label && <label style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{label}</label>}
          {hint}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: suffix ? "12px 44px 12px 16px" : "12px 16px",
            borderRadius: 12, fontSize: 14, fontFamily: "inherit",
            outline: "none", transition: "all 180ms",
            background: focus ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${error ? "#f87171" : focus ? "rgba(139,92,246,0.70)" : "rgba(255,255,255,0.12)"}`,
            color: "#fff",
            boxShadow: focus ? "0 0 0 4px rgba(139,92,246,0.15)" : "none",
          }}
          placeholder={props.placeholder}
          onFocus={e => { setFocus(true); props.onFocus?.(e); }}
          onBlur={e => { setFocus(false); props.onBlur?.(e); }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

/* ─── Botón principal ─────────────────────────────────── */
function Btn({ loading, children, onClick, type = "submit" }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "13px 20px", borderRadius: 12,
        background: hov && !loading
          ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
          : "linear-gradient(135deg,#8b5cf6,#6366f1)",
        color: "#fff", fontSize: 15, fontWeight: 700,
        border: "none", cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: hov && !loading
          ? "0 10px 32px rgba(139,92,246,0.55), 0 0 0 1px rgba(139,92,246,0.30)"
          : "0 4px 20px rgba(139,92,246,0.35)",
        transform: hov && !loading ? "translateY(-1px)" : "none",
        transition: "all 200ms",
      }}>
      {loading
        ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Verificando...</>
        : children}
    </button>
  );
}

/* ─── Error ───────────────────────────────────────────── */
function ErrBox({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", fontSize: 13 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
      {msg}
    </div>
  );
}

/* ─── Recuperar contraseña ────────────────────────────── */
function ForgotPassword({ onBack }) {
  const { verificarCorreo, resetPassword } = useAuth();
  const [step, setStep]       = useState("email");
  const [correo, setCorreo]   = useState("");
  const [code, setCode]       = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const cur = { email: 0, code: 1, newpass: 2, done: 3 }[step] ?? 0;

  const onEmail = async (e) => {
    e.preventDefault(); setErr("");
    if (!verificarCorreo(correo)) { setErr("No encontramos ninguna cuenta con ese correo."); return; }
    setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); setStep("code");
  };
  const onCode = (e) => {
    e.preventDefault(); setErr("");
    if (code !== MOCK_CODE) { setErr("Código incorrecto."); return; }
    setStep("newpass");
  };
  const onNewPass = (e) => {
    e.preventDefault(); setErr("");
    if (newPass.length < 8) { setErr("Mínimo 8 caracteres."); return; }
    if (newPass !== confirm) { setErr("Las contraseñas no coinciden."); return; }
    resetPassword(correo, newPass); setStep("done");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {step !== "done" && (
        <button type="button" onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.50)", background: "none", border: "none", cursor: "pointer", padding: 0, width: "fit-content" }}>
          <ArrowLeft size={14} /> Volver
        </button>
      )}

      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
          {step === "done" ? "¡Contraseña actualizada!" : "Recuperar contraseña"}
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", margin: 0 }}>
          {step === "email"   ? "Ingresa tu correo para recibir un código de verificación."
          : step === "code"   ? `Código enviado a ${correo}`
          : step === "newpass"? "Elige una nueva contraseña segura para tu cuenta."
          : "Ya puedes iniciar sesión con tu nueva contraseña."}
        </p>
      </div>

      {step !== "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["Correo", "Código", "Contraseña"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
                  background: i < cur ? "rgba(74,222,128,0.15)" : i === cur ? "rgba(139,92,246,0.20)" : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${i < cur ? "#4ade80" : i === cur ? "#8b5cf6" : "rgba(255,255,255,0.12)"}`,
                  color: i < cur ? "#4ade80" : i === cur ? "#a78bfa" : "rgba(255,255,255,0.30)",
                }}>
                  {i < cur ? <CheckCircle2 size={13} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: i < cur ? "#4ade80" : i === cur ? "#a78bfa" : "rgba(255,255,255,0.30)" }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: i < cur ? "rgba(74,222,128,0.40)" : "rgba(255,255,255,0.08)", marginLeft: 4 }} />}
            </div>
          ))}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={onEmail} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Correo electrónico" type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@institución.edu.co" />
          {err && <ErrBox msg={err} />}
          <Btn loading={loading}>Enviar código de verificación</Btn>
          <p style={{ fontSize: 12, textAlign: "center", color: "rgba(255,255,255,0.30)" }}>Demo: el código siempre es <strong style={{ color: "rgba(255,255,255,0.55)" }}>123456</strong></p>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={onCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="text" required maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="• • • • • •"
            style={{ textAlign: "center", fontSize: 28, letterSpacing: "0.5em", fontWeight: 800, padding: "14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", fontFamily: "monospace", width: "100%", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 4px rgba(139,92,246,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          {err && <ErrBox msg={err} />}
          <Btn loading={false}>Verificar código</Btn>
        </form>
      )}

      {step === "newpass" && (
        <form onSubmit={onNewPass} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Nueva contraseña" type={showNew ? "text" : "password"} required value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mínimo 8 caracteres"
            suffix={<button type="button" onClick={() => setShowNew(!showNew)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex" }}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          <Field label="Confirmar contraseña" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña"
            error={confirm && confirm !== newPass ? "Las contraseñas no coinciden" : ""} />
          {err && <ErrBox msg={err} />}
          <Btn loading={false}>Guardar nueva contraseña</Btn>
        </form>
      )}

      {step === "done" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={30} color="#4ade80" />
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.60)", lineHeight: 1.7 }}>Contraseña actualizada correctamente.</p>
          <Btn type="button" onClick={onBack} loading={false}>Ir al inicio de sesión</Btn>
        </div>
      )}
    </div>
  );
}

/* ─── LOGIN PRINCIPAL ─────────────────────────────────── */
export default function Login() {
  const [correo, setCorreo]         = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login, error, setError }  = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 420));
    if (login(correo, password)) navigate("/dashboard");
    setLoading(false);
  };

  const loginDemo = (c) => {
    setCorreo(c); setPassword("admin123"); setError(""); setShowForgot(false);
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif",
      position: "relative", overflow: "hidden",
      background: "linear-gradient(145deg,#0a0f2c 0%,#12105e 40%,#1a0a4a 70%,#0d1829 100%)",
    }}>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float1  { 0%,100%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-18px) translateX(8px)} 66%{transform:translateY(10px) translateX(-6px)} }
        @keyframes float2  { 0%,100%{transform:translateY(0) translateX(0)} 33%{transform:translateY(12px) translateX(-10px)} 66%{transform:translateY(-15px) translateX(5px)} }
        @keyframes float3  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes pulse   { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .orb1 { animation: float1 8s ease-in-out infinite; }
        .orb2 { animation: float2 11s ease-in-out infinite; }
        .orb3 { animation: float3 9s ease-in-out infinite; }
        .card-enter { animation: fadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>

      {/* ── Orbes flotantes ── */}
      <div className="orb1" style={{ position: "absolute", top: "8%",   left: "8%",   width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.25),transparent 70%)", pointerEvents: "none", filter: "blur(2px)" }} />
      <div className="orb2" style={{ position: "absolute", bottom: "5%", right: "6%",  width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.22),transparent 70%)",  pointerEvents: "none", filter: "blur(2px)" }} />
      <div className="orb3" style={{ position: "absolute", top: "45%",  right: "20%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)", pointerEvents: "none", filter: "blur(1px)" }} />

      {/* Malla de puntos */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "38px 38px", pointerEvents: "none" }} />

      {/* Líneas decorativas */}
      <div style={{ position: "absolute", top: "22%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "28%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.12),transparent)", pointerEvents: "none" }} />

      {/* Botón volver */}
      <button onClick={() => navigate("/")}
        style={{ position: "fixed", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 150ms", zIndex: 10 }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
        <ArrowLeft size={14} /> Inicio
      </button>

      {/* ── Tarjeta central ── */}
      <div className="card-enter" style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 460,
        margin: "24px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.06) inset",
        padding: "clamp(24px,5vw,48px) clamp(20px,5vw,44px)",
      }}>

        {/* Shimmer en la línea superior */}
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, borderRadius: "0 0 2px 2px", background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(99,102,241,0.8),transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />

        {showForgot ? (
          <ForgotPassword onBack={() => { setShowForgot(false); setError(""); }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Logo + marca */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
              <div style={{ position: "relative" }}>
                {/* Halo */}
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.30),transparent 70%)", animation: "pulse 2.5s ease-in-out infinite" }} />
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(139,92,246,0.50)", position: "relative" }}>
                  <GraduationCap size={28} color="#fff" />
                </div>
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>EduRural</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", margin: 0 }}>Sistema Académico · Achí, Bolívar</p>
              </div>
            </div>

            {/* Separador */}
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)" }} />

            {/* Encabezado del form */}
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                Bienvenido de nuevo
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field
                label="Correo electrónico"
                type="email" required value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="correo@institución.edu.co"
              />

              <Field
                label="Contraseña"
                hint={
                  <button type="button" onClick={() => { setShowForgot(true); setError(""); }}
                    style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                }
                type={showPass ? "text" : "password"} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                suffix={
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {error && <ErrBox msg={error} />}

              <div style={{ marginTop: 4 }}>
                <Btn loading={loading}>
                  Iniciar sesión <ArrowRight size={16} />
                </Btn>
              </div>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Zap size={11} color="#fbbf24" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.40)" }}>Acceso rápido demo</span>
              </div>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Demo pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center", margin: 0 }}>
                Contraseña: <strong style={{ color: "rgba(255,255,255,0.50)" }}>admin123</strong>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
                {demoUsers.map(u => <DemoPill key={u.correo} u={u} onClick={() => loginDemo(u.correo)} />)}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 28, marginBottom: 0 }}>
          EduRural © 2026 · Plataforma académica rural colombiana
        </p>
      </div>
    </div>
  );
}

function DemoPill({ u, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 99,
        background: hov ? "rgba(139,92,246,0.22)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${hov ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.10)"}`,
        color: hov ? "#c4b5fd" : "rgba(255,255,255,0.55)",
        cursor: "pointer", transition: "all 150ms",
      }}>
      {ROLE_LABELS[u.rol]}
    </button>
  );
}
