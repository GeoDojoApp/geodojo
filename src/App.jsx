import { COUNTRIES } from "./data";
import { TRIVIA } from "./trivia";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";

const FL = i => `https://flagcdn.com/w320/${i}.png`;
const FS = i => `https://flagcdn.com/w80/${i}.png`;
const vib = p => { try { navigator?.vibrate?.(p); } catch {} };
const hOk = () => vib(50);
const hNo = () => vib([30, 50, 30]);

// Shuffle array (Fisher-Yates)
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = ~~(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ── BELTS ──
const BELTS = [
  { name:"White Belt",fr:"Ceinture Blanche",ar:"الحزام الأبيض",es:"Cinturón Blanco",min:0,color:"#94A3B8",dark:"#64748B" },
  { name:"Yellow Belt",fr:"Ceinture Jaune",ar:"الحزام الأصفر",es:"Cinturón Amarillo",min:20,color:"#EAB308",dark:"#CA8A04" },
  { name:"Orange Belt",fr:"Ceinture Orange",ar:"الحزام البرتقالي",es:"Cinturón Orange",min:40,color:"#F97316",dark:"#EA580C" },
  { name:"Green Belt",fr:"Ceinture Verte",ar:"الحزام الأخضر",es:"Cinturón Verde",min:60,color:"#10B981",dark:"#059669" },
  { name:"Blue Belt",fr:"Ceinture Bleue",ar:"الحزام الأزرق",es:"Cinturón Azul",min:90,color:"#3B82F6",dark:"#2563EB" },
  { name:"Purple Belt",fr:"Ceinture Violette",ar:"الحزام البنفسجي",es:"Cinturón Violeta",min:120,color:"#8B5CF6",dark:"#7C3AED" },
  { name:"Brown Belt",fr:"Ceinture Marron",ar:"الحزام البني",es:"Cinturón Marron",min:150,color:"#92400E",dark:"#78350F" },
  { name:"Black Belt",fr:"Ceinture Noire",ar:"الحزام الأسود",es:"Cinturón Negro",min:180,color:"#1E293B",dark:"#0F172A" },
];
const gB = m => { let b = BELTS[0]; for (const x of BELTS) if (m >= x.min) b = x; return b; };
const nxB = m => { for (const x of BELTS) if (m < x.min) return x; return null; };
const bN = (b, l) => l === "fr" ? b.fr : l === "ar" ? b.ar : l === "es" ? b.es : b.name;

// ── VIBRANT OCEAN BREEZE ──
const $ = {
  bg: "#FFFFFF", card: "#FFFFFF", bdr: "#E2E8F0", faint: "#F1F5F9",
  ink: "#0F172A", sub: "#334155", mu: "#94A3B8",
  pri: "#0D9488", priD: "#0F766E", priL: "#CCFBF1", priBg: "#F0FDFA",
  sec: "#E11D48", secD: "#BE123C", secL: "#FFE4E6",
  blu: "#2563EB", bluD: "#1D4ED8", bluL: "#DBEAFE",
  gld: "#D97706", gldD: "#B45309", gldL: "#FEF3C7",
  red: "#DC2626", redD: "#B91C1C", redL: "#FEE2E2",
  ok: "#059669", okD: "#047857", okL: "#D1FAE5",
  pur: "#7C3AED", purD: "#6D28D9",
  sh: c => `0 4px 0 0 ${c}`, r: 14,
};
const CC = { All: $.pri, Africa: "#D97706", Europe: "#2563EB", Asia: "#DC2626", "North America": "#059669", "South America": "#7C3AED", Oceania: "#DB2777" };

const D = COUNTRIES;
const fuseList = D.map(c => ({ iso: c.i, en: c.n.en, fr: c.n.fr, ar: c.n.ar, es: c.n.es }));
const fuse = new Fuse(fuseList, { keys: ["en", "fr", "ar", "es"], threshold: 0.35, includeScore: true });

// ── TRANSLATIONS ──
const OT = {
  en: { splash: "How well do you know the world?", start: "Let's find out", wh: "What should we call you?", ph: "Your name", why: "Your sensei will address you properly", stay: "Stay connected", ePh: "your@email.com", eWhy: "Get notified about new features", skip: "Skip", cont: "Continue", enter: "Enter the Dojo", hi: "Welcome back" },
  fr: { splash: "Que savez-vous du monde ?", start: "Découvrons-le", wh: "Comment vous appeler ?", ph: "Votre prénom", why: "Votre sensei s'adressera correctement", stay: "Restez connecté", ePh: "votre@email.com", eWhy: "Soyez notifié", skip: "Passer", cont: "Continuer", enter: "Entrer au Dojo", hi: "Bon retour" },
  ar: { splash: "كم تعرف عن العالم؟", start: "لنكتشف", wh: "ماذا نناديك؟", ph: "اسمك", why: "سيناديك المعلم بالطريقة الصحيحة", stay: "ابقَ على تواصل", ePh: "بريدك@الإلكتروني", eWhy: "ستصلك إشعارات", skip: "تخطي", cont: "متابعة", enter: "ادخل الدوجو", hi: "أهلاً بعودتك" },
  es: { splash: "¿Cuánto sabes del mundo?", start: "Descubrámoslo", wh: "¿Cómo te llamamos?", ph: "Tu nombre", why: "Tu sensei se dirigirá correctamente", stay: "Mantente conectado", ePh: "tu@email.com", eWhy: "Recibe novedades", skip: "Saltar", cont: "Continuar", enter: "Entrar al Dojo", hi: "Bienvenido de vuelta" },
};
const LANGS = [{ c: "en", n: "English", s: "I speak English" }, { c: "fr", n: "Français", s: "Je parle français" }, { c: "es", n: "Español", s: "Hablo español" }, { c: "ar", n: "العربية", s: "أتحدث العربية" }];
const T = {
  en: { brand: "GeoDojo", tag: "How well do you know the world?", today: "Today", best: "Best", mastered: "Mastered", train: "Training Grounds", tSub: "Study flags, capitals & meanings", fQ: "Flag Training", fS: "Identify the flag", cQ: "Capital Training", cS: "Match capitals to countries", conf: "Advanced Kata", confS: "Similar flags challenge", triv: "World Trivia", trivS: "Geography & culture", prog: "Your Discipline", back: "Back", exit: "Exit", prev: "Previous", next: "Next", nxtQ: "Next Question", ok: "Correct!", fire: "On fire!", un: "Masterful!", nope: "Not quite", ans: "The answer:", lrn: "Study this", wh: "Which country is this?", isCap: "is the capital of...", jour: "Your Path", strt: "Begin training.", co: "Country", ca: "Capital", cn: "Region", mn: "Meaning", cfsd: "Often confused with", dy: "Insight", ty: "Type the country name", ph: "Begin typing...", toNext: "to next belt", smart: "No-Look Drill", share: "Share Results", timeUp: "Time!", pts: "points", earned: "You earned", only: "Only", toBelt: "to", sess: "Session Complete", again: "Train Again", home: "Home", selectRegion: "Select Region", privacy: "Privacy", terms: "Terms", about: "About" },
  fr: { brand: "GeoDojo", tag: "Que savez-vous du monde ?", today: "Aujourd'hui", best: "Record", mastered: "Maîtrisés", train: "Terrain d'entraînement", tSub: "Drapeaux, capitales et significations", fQ: "Drapeaux", fS: "Identifiez", cQ: "Capitales", cS: "Capitales et pays", conf: "Kata Avancé", confS: "Drapeaux similaires", triv: "Trivia Monde", trivS: "Culture et géographie", prog: "Votre Discipline", back: "Retour", exit: "Quitter", prev: "Précédent", next: "Suivant", nxtQ: "Question suivante", ok: "Correct !", fire: "En feu !", un: "Magistral !", nope: "Pas tout à fait", ans: "La réponse :", lrn: "Étudier", wh: "Quel pays ?", isCap: "est la capitale de...", jour: "Votre Chemin", strt: "Commencez.", co: "Pays", ca: "Capitale", cn: "Région", mn: "Signification", cfsd: "Souvent confondu", dy: "Savoir", ty: "Tapez le nom", ph: "Commencez...", toNext: "prochaine ceinture", smart: "Sans regard", share: "Partager", timeUp: "Temps !", pts: "points", earned: "Gagné", only: "Plus que", toBelt: "vers", sess: "Session terminée", again: "Rejouer", home: "Accueil", selectRegion: "Choisir région", privacy: "Confidentialité", terms: "Conditions", about: "À propos" },
  ar: { brand: "جيو دوجو", tag: "كم تعرف عن العالم؟", today: "اليوم", best: "أفضل", mastered: "متقنة", train: "أرض التدريب", tSub: "أعلام وعواصم ومعانٍ", fQ: "تدريب الأعلام", fS: "حدد العلم", cQ: "تدريب العواصم", cS: "طابق العواصم", conf: "كاتا متقدم", confS: "أعلام متشابهة", triv: "تحدي المعرفة", trivS: "ثقافة وجغرافيا", prog: "انضباطك", back: "رجوع", exit: "خروج", prev: "السابق", next: "التالي", nxtQ: "السؤال التالي", ok: "!صحيح", fire: "!ممتاز", un: "!بارع", nope: "ليس تماماً", ans: "الإجابة:", lrn: "ادرس", wh: "أي بلد؟", isCap: "عاصمة...", jour: "مسارك", strt: "ابدأ.", co: "البلد", ca: "العاصمة", cn: "المنطقة", mn: "المعنى", cfsd: "يُخلط مع", dy: "بصيرة", ty: "اكتب اسم البلد", ph: "ابدأ...", toNext: "للحزام التالي", smart: "بدون نظر", share: "شارك", timeUp: "!الوقت", pts: "نقاط", earned: "حصلت على", only: "فقط", toBelt: "إلى", sess: "انتهت الجلسة", again: "أعد التدريب", home: "الرئيسية", selectRegion: "اختر المنطقة", privacy: "الخصوصية", terms: "الشروط", about: "حول" },
  es: { brand: "GeoDojo", tag: "¿Cuánto sabes del mundo?", today: "Hoy", best: "Récord", mastered: "Dominados", train: "Campo de entrenamiento", tSub: "Banderas, capitales y significados", fQ: "Banderas", fS: "Identifica", cQ: "Capitales", cS: "Capitales y países", conf: "Kata Avanzado", confS: "Banderas similares", triv: "Trivia Mundial", trivS: "Cultura y geografía", prog: "Tu Disciplina", back: "Atrás", exit: "Salir", prev: "Anterior", next: "Siguiente", nxtQ: "Siguiente", ok: "¡Correcto!", fire: "¡En racha!", un: "¡Magistral!", nope: "No exactamente", ans: "Respuesta:", lrn: "Estudiar", wh: "¿Qué país?", isCap: "es capital de...", jour: "Tu Camino", strt: "Empieza.", co: "País", ca: "Capital", cn: "Región", mn: "Significado", cfsd: "Fácil confundir", dy: "Dato", ty: "Escribe el nombre", ph: "Empieza...", toNext: "siguiente cinturón", smart: "Sin mirar", share: "Compartir", timeUp: "¡Tiempo!", pts: "puntos", earned: "Ganaste", only: "Solo", toBelt: "para", sess: "Sesión completa", again: "Entrenar", home: "Inicio", selectRegion: "Elegir región", privacy: "Privacidad", terms: "Términos", about: "Acerca de" },
};
const CM = { en: { All: "All Regions", Africa: "Africa", Europe: "Europe", Asia: "Asia", "North America": "Americas", "South America": "S. America", Oceania: "Oceania" }, fr: { All: "Toutes", Africa: "Afrique", Europe: "Europe", Asia: "Asie", "North America": "Amériques", "South America": "Am. Sud", Oceania: "Océanie" }, ar: { All: "الكل", Africa: "أفريقيا", Europe: "أوروبا", Asia: "آسيا", "North America": "الأمريكيتين", "South America": "أمريكا الجنوبية", Oceania: "أوقيانوسيا" }, es: { All: "Todas", Africa: "África", Europe: "Europa", Asia: "Asia", "North America": "Américas", "South America": "Am. Sur", Oceania: "Oceanía" } };
const CONTS = ["All", "Africa", "Europe", "Asia", "North America", "South America", "Oceania"];
const SR = [3, 8, 20, 50];

// ── GD LOGO SVG ──
const Logo = ({ size = 36 }) => (
  <img src="/icon-192.png" alt="GeoDojo" style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, objectFit: "contain" }} />
);

export default function App() {
  const [ob, sOb] = useState(-1); // -1=splash, 0=lang, 1=name, 2=email, 3=done
  const [lang, sl] = useState(null);
  const [uN, sUN] = useState("");
  const [ni, sNI] = useState("");
  const [ei, sEI] = useState("");
  const [menu, setMenu] = useState(false);
  const [scr, sS] = useState("home");
  const [ct, sC] = useState("All");
  const [md, sM] = useState(null);
  const [q, sQ] = useState(null);
  const [op, sO] = useState([]);
  const [se, sSe] = useState(null);
  const [ok_, sOk] = useState(null);
  const [sc, sSc] = useState(0);
  const [to, sTo] = useState(0);
  const [sk, sSk] = useState(0);
  const [bk, sBk] = useState(0);
  const [inf, sIn] = useState(false);
  const [li, sLi] = useState(0);
  const [ms, sMs] = useState({});
  const [dy, sDy] = useState(0);
  const [fc, sFc] = useState(0);
  const [iT, sIT] = useState(false);
  const [tv, sTV] = useState("");
  const [ts, sTS] = useState(false);
  const [rn, sRn] = useState(0);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [pts, setPts] = useState(0);
  const aS = useRef(Date.now());
  const timerRef = useRef(null);
  const t = lang ? T[lang] : T.en;
  const ot = lang ? OT[lang] : OT.en;
  const rtl = lang === "ar";

  // localStorage
  useEffect(() => { try { const s = localStorage.getItem("geodojo-v4"); if (s) { const d = JSON.parse(s); if (d.ms) sMs(d.ms); if (d.bk) sBk(d.bk); if (d.dy) sDy(d.dy); if (d.lang) { sl(d.lang); sOb(3); } if (d.uN) sUN(d.uN); } } catch {} }, []);
  useEffect(() => { if (lang) localStorage.setItem("geodojo-v4", JSON.stringify({ ms, bk, lang, uN, dy })); }, [ms, bk, lang, uN, dy]);

  // Timer
  useEffect(() => {
    if (timerActive && timer > 0) timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    if (timerActive && timer <= 0 && !se) {
      if (q) { sOk(false); sSe({ i: "_" }); rec(false); hNo(); sTo(p => p + 1); sDy(p => p + 1); setSessionResults(r => [...r, false]); sSk(0); sFc(0); setTimeout(() => { gen(md, pl); setTimer(10); }, 1500); }
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, timerActive]);

  const pl = useMemo(() => ct === "All" ? D : D.filter(c => c.z === ct), [ct]);
  const gm = i => { const m = ms[i]; return !m || !m.s ? 0 : Math.round((m.c / m.s) * 100); };
  const mc = useMemo(() => D.filter(c => gm(c.i) >= 80).length, [ms]);
  const belt = gB(mc);
  const nextBelt = nxB(mc);
  const N = c => c.n[lang || "en"] || c.n.en;
  const Ca = c => c.c[lang || "en"] || c.c.en;
  const Mg = c => c.m[lang || "en"] || c.m.en;
  const Ff = c => c.f[lang || "en"] || c.f.en;
  const cl = k => (CM[lang || "en"] || CM.en)[k] || k;

  // ── QUIZ GEN (fully randomized) ──
  const gen = useCallback((m, p) => {
    if (m === "trivia") {
      const tq = TRIVIA[~~(Math.random() * TRIVIA.length)];
      // Shuffle trivia options while tracking correct answer
      const indices = [0, 1, 2, 3];
      const shuffled = shuffle(indices);
      const newOpts = shuffled.map(i => (tq.o[lang || "en"] || tq.o.en)[i]);
      const newAns = shuffled.indexOf(tq.a);
      sQ({ trivia: true, q: tq.q[lang || "en"] || tq.q.en, opts: newOpts, ans: newAns });
      sO([]); sSe(null); sOk(null); sIn(false); sTV(""); sTS(false); aS.current = Date.now(); return;
    }
    if (p.length < 4) return;
    const r = rn + 1; sRn(r);
    // Pick from SRS due items, weak items, or random
    const du = p.filter(c => { const m = ms[c.i]; return m && m.nd && m.nd <= r; });
    const wk = p.filter(c => { const m = ms[c.i]; return m && m.w > 0 && m.w >= m.c; });
    let tg = du.length > 0 ? du[~~(Math.random() * du.length)] : wk.length > 0 && Math.random() < .4 ? wk[~~(Math.random() * wk.length)] : p[~~(Math.random() * p.length)];
    const cf = tg.x.map(i => D.find(c => c.i === i)).filter(Boolean);
    const others = shuffle(p.filter(c => c.i !== tg.i && !tg.x.includes(c.i)));
    // Build 4 options: target + confusers + randoms, then SHUFFLE
    const options = shuffle([tg, ...cf, ...others].slice(0, 4));
    sQ(tg); sO(options);
    sSe(null); sOk(null); sIn(false); sTV(""); sTS(false); aS.current = Date.now();
  }, [ms, rn, lang]);

  const rec = ok => { if (!q || q.trivia) return; sMs(p => { const e = p[q.i] || { c: 0, w: 0, s: 0, nd: 0, iv: 0 }; if (ok) return { ...p, [q.i]: { ...e, c: e.c + 1, s: e.s + 1, nd: 0, iv: 0 } }; const x = Math.min(e.iv || 0, SR.length - 1); return { ...p, [q.i]: { ...e, w: e.w + 1, s: e.s + 1, nd: rn + SR[x], iv: (e.iv || 0) + 1 } }; }); };
  const calcPts = (correct, elapsed) => { if (!correct) return 0; return 100 + Math.max(0, Math.round((10 - elapsed / 1000) * 10)) + Math.min(sk, 5) * 20; };

  const chkT = () => {
    if (ts) return; sTS(true); setTimerActive(false); const v = tv.trim();
    if (!v) { sOk(false); sSe({ i: "_" }); rec(false); hNo(); sTo(p => p + 1); sDy(p => p + 1); setSessionResults(r => [...r, false]); sSk(0); sFc(0); return; }
    const results = fuse.search(v);
    const matched = results.length > 0 && results[0].item.iso === q.i && results[0].score < 0.4;
    const exact = [q.n.en, q.n.fr, q.n.ar, q.n.es].some(n => n && n.toLowerCase() === v.toLowerCase());
    const correct = matched || exact; const el = Date.now() - aS.current; const p = calcPts(correct, el);
    sOk(correct); sSe({ i: correct ? q.i : "_" }); rec(correct); sTo(x => x + 1); sDy(x => x + 1); setSessionResults(r => [...r, correct]); setPts(x => x + p);
    if (correct) { hOk(); sSc(x => x + 1); sSk(x => { const n = x + 1; if (n > bk) sBk(n); return n; }); sFc(x => x + 1); }
    else { hNo(); sSk(0); sFc(0); }
  };

  const answer = (o, idx) => {
    if (se) return; setTimerActive(false); const el = Date.now() - aS.current;
    if (q.trivia) {
      const correct = idx === q.ans; const p = calcPts(correct, el);
      sOk(correct); sSe({ i: correct ? "ok" : "_" }); sTo(x => x + 1); sDy(x => x + 1); setSessionResults(r => [...r, correct]); setPts(x => x + p);
      if (correct) { hOk(); sSc(x => x + 1); sSk(x => { const n = x + 1; if (n > bk) sBk(n); return n; }); } else { hNo(); sSk(0); }
      return;
    }
    sSe(o); const correct = o.i === q.i; const p = calcPts(correct, el);
    sOk(correct); rec(correct); sTo(x => x + 1); sDy(x => x + 1); setSessionResults(r => [...r, correct]); setPts(x => x + p);
    if (correct) { hOk(); sSc(x => x + 1); sSk(x => { const n = x + 1; if (n > bk) sBk(n); return n; }); if (el < 2000) sFc(x => x + 1); else sFc(0); }
    else { hNo(); sSk(0); sFc(0); }
  };

  useEffect(() => { if (fc >= 3 && !iT) sIT(true); }, [fc]);
  const nxt = () => { gen(md, pl); setTimer(10); setTimerActive(true); };
  const start = m => { sM(m); sSc(0); sTo(0); sSk(0); sFc(0); sIT(false); sRn(0); setPts(0); setTimer(10); setTimerActive(true); setSessionResults([]); gen(m, pl); sS("quiz"); };
  const endSession = () => { setTimerActive(false); sS("end"); };

  const shareResults = () => {
    const emojis = sessionResults.map(r => r ? "🟩" : "🟥").join("");
    const rows = []; for (let i = 0; i < emojis.length; i += 5) rows.push(emojis.slice(i, i + 5));
    const text = `🥋 GeoDojo ${bN(belt, lang)}\n${rows.join("\n")}\n${sc}/${to} • ${pts} ${t.pts}\ngeoddojo.app`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(() => alert("Copied!")).catch(() => {});
  };

  const B = ({ children, onClick, disabled, full, outline, c: co = $.pri, d = $.priD, style: s = {} }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: "13px 18px", borderRadius: $.r, width: full ? "100%" : "auto", fontSize: 15, fontWeight: 800, textAlign: "center", background: outline ? "transparent" : co, color: outline ? $.sub : "#FFF", border: outline ? `2.5px solid ${$.bdr}` : "none", boxShadow: outline ? "none" : $.sh(d), opacity: disabled ? .4 : 1, transition: "all .15s", ...s }}>{children}</button>
  );

  // ═══ ONBOARDING ═══
  if (ob < 3) return (
    <div style={{ minHeight: "100vh", background: $.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: "0 28px", direction: ob <= 0 ? "ltr" : rtl ? "rtl" : "ltr" }}>
        {/* SPLASH */}
        {ob === -1 && (<div className="fadeUp" style={{ textAlign: "center" }}>
          <Logo size={80} />
          <div style={{ marginTop: 20 }} />
          <h1 style={{ fontSize: 32, fontWeight: 900, color: $.ink, marginBottom: 8 }}>GeoDojo</h1>
          <p style={{ fontSize: 16, color: $.sub, fontWeight: 700, marginBottom: 36, lineHeight: 1.5 }}>How well do you know the world?</p>
          <B full onClick={() => sOb(0)} style={{ fontSize: 17, padding: "16px 20px" }}>Get Started</B>
        </div>)}
        {/* LANGUAGE */}
        {ob === 0 && (<div className="fadeUp" style={{ textAlign: "center" }}>
          <Logo size={52} />
          <div style={{ marginTop: 14 }} />
          <h2 style={{ fontSize: 22, fontWeight: 900, color: $.ink, marginBottom: 24 }}>Choose your language</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{LANGS.map(l => (<button key={l.c} onClick={() => { sl(l.c); sOb(1); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r, width: "100%", boxShadow: $.sh($.faint) }}><div style={{ textAlign: "left" }}><div style={{ fontSize: 17, fontWeight: 800, color: $.ink }}>{l.n}</div><div style={{ fontSize: 11, color: $.mu, fontWeight: 600 }}>{l.s}</div></div><div style={{ width: 28, height: 28, borderRadius: 8, background: $.priL, display: "flex", alignItems: "center", justifyContent: "center", color: $.pri, fontSize: 14, fontWeight: 900 }}>→</div></button>))}</div>
        </div>)}
        {/* NAME */}
        {ob === 1 && (<div className="fadeUp" style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: $.priL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><span style={{ fontSize: 22, color: $.pri, fontWeight: 800 }}>?</span></div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: $.ink, marginBottom: 4 }}>{ot.wh}</h2>
          <p style={{ fontSize: 12, color: $.mu, fontWeight: 600, marginBottom: 22 }}>{ot.why}</p>
          <input value={ni} onChange={e => sNI(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ni.trim()) { sUN(ni.trim()); sOb(2); } }} placeholder={ot.ph} autoFocus style={{ width: "100%", padding: "14px 18px", borderRadius: $.r, border: `2.5px solid ${ni ? $.pri : $.bdr}`, background: $.card, fontSize: 16, fontWeight: 700, color: $.ink, outline: "none", textAlign: rtl ? "right" : "center" }} />
          <div style={{ marginTop: 12 }}><B full onClick={() => { sUN(ni.trim()); sOb(2); }} disabled={!ni.trim()}>{ot.cont}</B></div>
          <button onClick={() => { sUN(""); sOb(2); }} style={{ marginTop: 8, color: $.mu, fontSize: 12, fontWeight: 600, padding: 6 }}>{ot.skip}</button>
        </div>)}
        {/* EMAIL */}
        {ob === 2 && (<div className="fadeUp" style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: $.bluL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><span style={{ fontSize: 20, color: $.blu, fontWeight: 800 }}>@</span></div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: $.ink, marginBottom: 4 }}>{ot.stay}</h2>
          <p style={{ fontSize: 12, color: $.mu, fontWeight: 600, marginBottom: 22 }}>{ot.eWhy}</p>
          <input value={ei} onChange={e => sEI(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ei.includes("@")) sOb(3); }} placeholder={ot.ePh} type="email" autoFocus style={{ width: "100%", padding: "14px 18px", borderRadius: $.r, border: `2.5px solid ${ei.includes("@") ? $.blu : $.bdr}`, background: $.card, fontSize: 16, fontWeight: 700, color: $.ink, outline: "none", textAlign: rtl ? "right" : "center" }} />
          <div style={{ marginTop: 12 }}><B full onClick={() => sOb(3)} disabled={!ei.includes("@")} c={$.blu} d={$.bluD}>{ot.enter}</B></div>
          <button onClick={() => sOb(3)} style={{ marginTop: 8, color: $.mu, fontSize: 12, fontWeight: 600, padding: 6 }}>{ot.skip}</button>
        </div>)}
        {ob >= 0 && <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>{[0, 1, 2].map(i => (<div key={i} style={{ width: i === ob ? 22 : 8, height: 8, borderRadius: 4, background: i === ob ? $.pri : $.faint, transition: "all .3s" }} />))}</div>}
      </div>
    </div>
  );

  const greeting = uN ? `${ot.hi}, ${uN}` : t.brand;

  // ═══ MAIN APP ═══
  return (
    <div style={{ minHeight: "100vh", background: $.bg, color: $.ink, direction: rtl ? "rtl" : "ltr" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* ── TOP BAR: Logo + Menu ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={() => sS("home")}>
            <Logo size={32} />
            <span style={{ fontSize: 16, fontWeight: 900, color: $.ink }}>GeoDojo</span>
          </div>
          <button onClick={() => setMenu(!menu)} style={{ width: 36, height: 36, borderRadius: 10, background: $.faint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ width: 16, height: 2, background: $.sub, borderRadius: 1 }} />
            <div style={{ width: 16, height: 2, background: $.sub, borderRadius: 1 }} />
            <div style={{ width: 16, height: 2, background: $.sub, borderRadius: 1 }} />
          </button>
        </div>
        {/* Menu dropdown */}
        {menu && (<div className="fadeUp" style={{ position: "relative", zIndex: 10, background: $.card, border: `2px solid ${$.bdr}`, borderRadius: $.r, padding: "8px 0", marginBottom: 8, boxShadow: "0 8px 24px rgba(0,0,0,.1)" }}>
          {[[t.prog, () => { sS("stats"); setMenu(false); }], [t.privacy, () => { window.open("/privacy.html", "_blank"); setMenu(false); }], [t.terms, () => { window.open("/terms.html", "_blank"); setMenu(false); }]].map(([label, fn], i) => (
            <button key={i} onClick={fn} style={{ width: "100%", padding: "10px 16px", textAlign: rtl ? "right" : "left", fontSize: 14, fontWeight: 700, color: $.sub }}>{label}</button>
          ))}
          {uN && <div style={{ padding: "8px 16px", fontSize: 12, color: $.mu, borderTop: `1px solid ${$.faint}` }}>{uN} • {lang?.toUpperCase()}</div>}
        </div>)}

        {/* ═══ HOME ═══ */}
        {scr === "home" && (<div className="fadeUp" style={{ paddingTop: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}><h1 style={{ fontSize: 24, fontWeight: 900, color: $.ink, marginBottom: 2 }}>{greeting}</h1><p style={{ fontSize: 13, color: $.pri, fontWeight: 700 }}>{lang === "fr" ? "Partons explorer !" : lang === "ar" ? "لنبدأ الاستكشاف!" : lang === "es" ? "¡Vamos a explorar!" : "Let's start exploring!"}</p></div>
          {/* Belt */}
          <div style={{ padding: "14px 16px", background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r + 2, marginBottom: 10, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: $.sh($.faint) }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${belt.color}, ${nextBelt ? nextBelt.color : belt.color})` }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", background: `${belt.color}20`, borderRadius: 14, marginBottom: 6 }}><div style={{ width: 12, height: 12, borderRadius: 6, background: belt.color }} /><span style={{ fontSize: 13, fontWeight: 800, color: belt.dark || belt.color }}>{bN(belt, lang)}</span></div>
            <div style={{ fontSize: 34, fontWeight: 900, color: $.ink }}>{mc}<span style={{ fontSize: 14, fontWeight: 600, color: $.mu }}>/{D.length}</span></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: $.mu, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.mastered}</div>
            {nextBelt && (<div style={{ marginTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontSize: 10, color: $.mu, fontWeight: 700 }}>{mc}/{nextBelt.min}</span><span style={{ fontSize: 10, color: nextBelt.color, fontWeight: 700 }}>{bN(nextBelt, lang)}</span></div><div style={{ width: "100%", height: 10, background: $.faint, borderRadius: 5, overflow: "hidden" }}><div style={{ width: `${Math.min((mc / nextBelt.min) * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg,${belt.color},${nextBelt.color})`, borderRadius: 5, transition: "width .5s" }} /></div><div style={{ fontSize: 10, color: $.sub, fontWeight: 600, marginTop: 3 }}>{nextBelt.min - mc} {t.toNext}</div></div>)}
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>{[[t.today, dy, $.pri], [t.best, bk, $.gld]].map(([l, v, c], i) => (<div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 0", background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r, boxShadow: $.sh($.faint) }}><div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: $.mu, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div></div>))}</div>
          {/* ── CONTINENT CHIPS (clean, no shapes) ── */}
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: $.mu, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{t.selectRegion}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {CONTS.map(k => { const co = CC[k]; return (
                <button key={k} onClick={() => sC(k)} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, background: ct === k ? co : $.card, color: ct === k ? "#FFF" : $.sub, border: `2.5px solid ${ct === k ? co : $.bdr}`, boxShadow: ct === k ? $.sh(co + "70") : "none", transition: "all .15s" }}>{cl(k)}</button>
              ); })}
            </div>
          </div>
          {/* Training modes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {[[t.train, t.tSub, $.pri, $.priD, () => { sLi(0); sS("learn"); }],
              [t.fQ, t.fS, $.sec, $.secD, () => start("flags")],
              [t.cQ, t.cS, $.blu, $.bluD, () => start("capitals")],
              [t.conf, t.confS, $.pur, $.purD, () => start("confusers")],
              [t.triv, t.trivS, $.gld, $.gldD, () => start("trivia")],
            ].map(([ti, su, c, cd, fn], i) => (
              <button key={i} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", textAlign: "left", background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r, boxShadow: $.sh($.faint) }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: $.sh(cd) }}><div style={{ width: 14, height: 14, borderRadius: 7, background: "rgba(255,255,255,.35)" }} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 800, color: $.ink }}>{ti}</div><div style={{ fontSize: 11, color: $.sub, fontWeight: 600 }}>{su}</div></div>
              </button>))}
          </div>
        </div>)}

        {/* ═══ LEARN ═══ */}
        {scr === "learn" && (() => { const c = pl[li]; if (!c) return null; const cf = c.x.map(i => D.find(x => x.i === i)).filter(Boolean); return (
          <div className="fadeUp" style={{ paddingTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><button onClick={() => sS("home")} style={{ color: $.pri, fontSize: 13, fontWeight: 800 }}>{rtl ? `${t.back} ←` : `← ${t.back}`}</button><span style={{ fontSize: 11, color: $.mu, fontWeight: 700 }}>{li + 1}/{pl.length}</span></div>
            <div style={{ width: "100%", height: 8, background: $.bdr, borderRadius: 4, marginBottom: 12, overflow: "hidden" }}><div style={{ width: `${((li + 1) / pl.length) * 100}%`, height: "100%", background: $.pri, borderRadius: 4, transition: "width .3s" }} /></div>
            <div key={li} className="fadeUp" style={{ background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r + 2, padding: "16px", marginBottom: 10, boxShadow: $.sh($.faint) }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><img src={FL(c.i)} alt={N(c)} width={220} height={148} style={{ borderRadius: 10, border: `2.5px solid ${$.bdr}`, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /></div>
              {[[t.co, N(c), $.ink, 900], [t.ca, Ca(c), $.pri, 700], [t.cn, cl(c.z), $.sub, 600]].map(([l, v, co, fw], j) => (<div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: j < 2 ? `1.5px solid ${$.faint}` : "none" }}><span style={{ fontSize: 10, fontWeight: 700, color: $.mu, letterSpacing: 1, textTransform: "uppercase" }}>{l}</span><span style={{ fontSize: j === 0 ? 17 : 14, fontWeight: fw, color: co }}>{v}</span></div>))}
              <div style={{ marginTop: 10 }}><div style={{ fontSize: 10, color: $.mu, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t.mn}</div><div style={{ fontSize: 13, color: $.sub, lineHeight: 1.6 }}>{Mg(c)}</div></div>
              <div style={{ marginTop: 10, padding: "10px 12px", background: $.priL, borderRadius: 10, borderLeft: `4px solid ${$.pri}` }}><div style={{ fontSize: 9, fontWeight: 800, color: $.priD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{t.dy}</div><div style={{ fontSize: 12, color: $.ink, lineHeight: 1.6, fontWeight: 600 }}>{Ff(c)}</div></div>
              {cf.length > 0 && (<div style={{ marginTop: 8, padding: "10px 12px", background: $.redL, borderRadius: 10, borderLeft: `4px solid ${$.red}` }}><div style={{ fontSize: 9, fontWeight: 800, color: $.redD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{t.cfsd}</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{cf.map(f => (<div key={f.i} style={{ display: "flex", alignItems: "center", gap: 4 }}><img src={FS(f.i)} alt="" width={26} height={18} style={{ borderRadius: 3, border: `1.5px solid ${$.bdr}` }} /><span style={{ fontSize: 11, color: $.ink, fontWeight: 700 }}>{N(f)}</span></div>))}</div></div>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}><B outline full onClick={() => sLi(Math.max(0, li - 1))} disabled={li === 0}>{rtl ? `→ ${t.prev}` : `← ${t.prev}`}</B><B full onClick={() => sLi(Math.min(pl.length - 1, li + 1))} disabled={li === pl.length - 1}>{rtl ? `← ${t.next}` : `${t.next} →`}</B></div>
          </div>); })()}

        {/* ═══ QUIZ ═══ */}
        {scr === "quiz" && q && (<div style={{ paddingTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <button onClick={() => endSession()} style={{ color: $.mu, fontSize: 13, fontWeight: 700 }}>{rtl ? `${t.exit} ←` : `← ${t.exit}`}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {iT && <span style={{ fontSize: 9, fontWeight: 800, color: "#FFF", background: $.sec, padding: "3px 8px", borderRadius: 6 }}>{t.smart}</span>}
              {sk >= 3 && <span style={{ fontSize: 13, fontWeight: 900, color: $.gld }}>{sk}x</span>}
              <span style={{ fontSize: 20, fontWeight: 900, color: $.pri }}>{pts}</span>
              <span style={{ fontSize: 11, color: $.mu, fontWeight: 700 }}>{t.pts}</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 14, background: $.bdr, borderRadius: 7, marginBottom: 3, overflow: "hidden" }}>
            <div style={{ width: `${(timer / 10) * 100}%`, height: "100%", background: timer > 5 ? $.pri : timer > 2 ? $.gld : $.red, borderRadius: 7, transition: "width 1s linear, background .3s" }} />
          </div>
          <div style={{ textAlign: "center", fontSize: 22, fontWeight: 900, color: timer > 5 ? $.pri : timer > 2 ? $.gld : $.red, marginBottom: 10 }}>{timer}s</div>

          <div key={(q.trivia ? q.q : q.i) + to} className="fadeUp">
            {q.trivia ? (<div style={{ background: $.gldL, border: `2.5px solid ${$.gld}`, borderRadius: $.r, padding: "12px 14px", marginBottom: 10, textAlign: "center" }}><div style={{ fontSize: 9, fontWeight: 800, color: $.gldD, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>{t.triv}</div><div style={{ fontSize: 16, fontWeight: 800, color: $.ink, lineHeight: 1.4 }}>{q.q}</div></div>
            ) : md === "capitals" ? (<div style={{ textAlign: "center", marginBottom: 10 }}><div style={{ fontSize: 26, fontWeight: 900, color: $.ink }}>{Ca(q)}</div><div style={{ fontSize: 12, color: $.sub, marginTop: 2, fontWeight: 600 }}>{t.isCap}</div></div>
            ) : (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10 }}><img src={FL(q.i)} alt="" width={240} height={160} style={{ borderRadius: 12, border: `2.5px solid ${$.bdr}`, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /><div style={{ fontSize: 13, color: $.sub, marginTop: 6, fontWeight: 600 }}>{iT && !q.trivia ? t.ty : t.wh}</div></div>)}

            {iT && !se && !q.trivia ? (<div style={{ marginBottom: 10 }}><input value={tv} onChange={e => sTV(e.target.value)} onKeyDown={e => { if (e.key === "Enter") chkT(); }} placeholder={t.ph} autoFocus style={{ width: "100%", padding: "13px 16px", borderRadius: $.r, border: `2.5px solid ${$.sec}`, background: $.card, fontSize: 16, fontWeight: 700, color: $.ink, outline: "none", textAlign: rtl ? "right" : "left" }} /><div style={{ marginTop: 8 }}><B full onClick={chkT} c={$.sec} d={$.secD}>GO</B></div></div>
            ) : (<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {(q.trivia ? q.opts.map((o, i) => ({ label: o, idx: i })) : op.map((o, i) => ({ label: N(o), obj: o, idx: i }))).map(({ label, obj, idx }) => {
                const dn = se !== null;
                let isCorrect, wasClicked, bg = $.card, bd = $.bdr, cl_ = $.ink, a = "", sh = $.sh($.faint);
                if (q.trivia) { isCorrect = idx === q.ans; wasClicked = dn && se.i === "_" && idx !== q.ans; }
                else { isCorrect = obj?.i === q?.i; wasClicked = se?.i === obj?.i && !isCorrect; }
                if (dn) {
                  if (isCorrect) { bg = $.okL; bd = $.ok; cl_ = $.okD; sh = $.sh($.okD + "40"); a = "pulse .5s ease"; }
                  else if (wasClicked) { bg = $.redL; bd = $.red; cl_ = $.redD; sh = $.sh($.redD + "40"); a = "shake .4s ease"; }
                  else { cl_ = $.mu; sh = "none"; }
                }
                return (<button key={idx} onClick={() => q.trivia ? answer(null, idx) : answer(obj)} disabled={dn} style={{ width: "100%", padding: "12px 14px", textAlign: rtl ? "right" : "left", display: "flex", alignItems: "center", gap: 10, background: bg, border: `2.5px solid ${bd}`, borderRadius: $.r, color: cl_, fontSize: 15, fontWeight: 700, animation: a, boxShadow: sh, transition: "all .15s" }}><span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dn && isCorrect ? $.ok : dn && wasClicked ? $.red : $.faint, fontSize: 11, fontWeight: 800, color: dn && (isCorrect || wasClicked) ? "#FFF" : $.mu }}>{dn && isCorrect ? "✓" : dn && wasClicked ? "✗" : ["A", "B", "C", "D"][idx]}</span>{label}</button>);
              })}
            </div>)}

            {se && (<div className="fadeUp">
              <div style={{ padding: "12px 16px", background: ok_ ? $.okL : $.redL, borderRadius: $.r, marginBottom: 8, borderLeft: `5px solid ${ok_ ? $.ok : $.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: ok_ ? $.okD : $.redD }}>{ok_ ? (sk >= 5 ? t.un : sk >= 3 ? t.fire : t.ok) : t.nope}</div>
                  {ok_ && <div style={{ fontSize: 14, fontWeight: 800, color: $.okD }}>+{calcPts(true, Date.now() - aS.current)}</div>}
                </div>
                {!ok_ && !q.trivia && <div style={{ fontSize: 13, color: $.redD, fontWeight: 600, marginTop: 2 }}>{t.ans} {N(q)}</div>}
                {!ok_ && q.trivia && <div style={{ fontSize: 13, color: $.redD, fontWeight: 600, marginTop: 2 }}>{t.ans} {q.opts[q.ans]}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}><B outline full onClick={endSession}>{t.exit}</B><B full onClick={nxt}>{t.nxtQ}</B></div>
            </div>)}
          </div>
        </div>)}

        {/* ═══ END SESSION ═══ */}
        {scr === "end" && (<div className="fadeUp" style={{ paddingTop: 16, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: $.mu, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{t.sess}</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: $.pri }}>{pts}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: $.sub, marginBottom: 14 }}>{t.pts}</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginBottom: 14, padding: "0 16px" }}>{sessionResults.map((r, i) => (<div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: r ? $.ok : $.red, fontSize: 11, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{r ? "✓" : "✗"}</div>))}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: $.sub, marginBottom: 16 }}>{sc}/{to} correct</div>
          {nextBelt && (<div style={{ background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r, padding: "14px 16px", marginBottom: 14, boxShadow: $.sh($.faint), textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 14, height: 14, borderRadius: 7, background: belt.color }} /><span style={{ fontSize: 13, fontWeight: 800, color: $.ink }}>{bN(belt, lang)}</span></div><span style={{ fontSize: 11, fontWeight: 700, color: nextBelt.color }}>{bN(nextBelt, lang)}</span></div>
            <div style={{ width: "100%", height: 12, background: $.faint, borderRadius: 6, overflow: "hidden" }}><div style={{ width: `${Math.min((mc / nextBelt.min) * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg,${belt.color},${nextBelt.color})`, borderRadius: 6, transition: "width .5s" }} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: $.sub, marginTop: 4 }}>{t.only} {nextBelt.min - mc} {t.toBelt} {bN(nextBelt, lang)}</div>
          </div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <B full onClick={shareResults} c={$.ok} d={$.okD}>{t.share}</B>
            <B full onClick={() => { start(md || "flags"); sS("quiz"); }}>{t.again}</B>
            <B full outline onClick={() => sS("home")}>{t.home}</B>
          </div>
        </div>)}

        {/* ═══ STATS ═══ */}
        {scr === "stats" && (<div className="fadeUp" style={{ paddingTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><button onClick={() => sS("home")} style={{ color: $.pri, fontSize: 13, fontWeight: 800 }}>← {t.back}</button></div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: $.ink, marginBottom: 8 }}>{uN ? `${uN}'s ${t.jour}` : t.jour}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: $.card, border: `2.5px solid ${$.bdr}`, borderRadius: $.r, marginBottom: 14, boxShadow: $.sh($.faint) }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: belt.color, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 13, fontWeight: 900, color: "#FFF" }}>{mc}</span></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 800, color: $.ink }}>{bN(belt, lang)}</div><div style={{ fontSize: 11, color: $.sub, fontWeight: 600 }}>{mc} {t.mastered.toLowerCase()}</div></div>
          </div>
          <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>{BELTS.map((b, i) => (<div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: mc >= b.min ? b.color : $.faint, transition: "background .3s" }} />))}</div>
          {CONTS.filter(z => z !== "All").map(z => { const cc = D.filter(c => c.z === z); const m = cc.filter(c => gm(c.i) >= 80).length; const p = cc.length ? Math.round((m / cc.length) * 100) : 0; const co = CC[z]; return (<div key={z} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontSize: 12, color: $.ink, fontWeight: 700 }}>{cl(z)}</span><span style={{ fontSize: 10, color: $.mu, fontWeight: 700 }}>{m}/{cc.length}</span></div><div style={{ width: "100%", height: 8, background: $.faint, borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", background: co, borderRadius: 4, transition: "width .5s" }} /></div></div>); })}
          {D.filter(c => ms[c.i]?.s > 0).length === 0 && <div style={{ textAlign: "center", padding: 16, color: $.mu, fontSize: 13, fontWeight: 600 }}>{t.strt}</div>}
        </div>)}
      </div>
    </div>
  );
}