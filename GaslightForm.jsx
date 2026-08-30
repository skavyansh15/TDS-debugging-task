import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';


const EDGE_PAD = 12;
const DECOY_SAMPLES = 14; 
const HINT_AFTER = 4;
const ARENA_H = 190;

const SPRING_OF_MISCHIEF = {
  type: 'spring',
  stiffness: 760,
  damping: 23,
  mass: 0.55,
};

const TAUNTS = ['Submit', 'Nope', 'Missed me', 'Too slow', 'Warmer…', 'lol', 'Submit*'];
const CONFETTI_TONES = ['#FFC107', '#FFD700', '#3A3A3A'];

const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const between = (lo, hi) => lo + Math.random() * (hi - lo);

export default function GaslightForm({ onCaptured }) {
  const [draft, setDraft] = useState({ name: '', email: '' });
  const [evasionCoords, setEvasionCoords] = useState({ x: 0, y: 0 });
  const [dodgeTally, setDodgeTally] = useState(0);
  const [flaw, setFlaw] = useState(null); 
  const [busted, setBusted] = useState(false);

  const arenaRef = useRef(null);
  const dodgerRef = useRef(null);

  
  const plotEscapeRoute = useCallback((pointerX, pointerY) => {
    const arena = arenaRef.current;
    const dodger = dodgerRef.current;
    if (!arena || !dodger) return { x: 0, y: 0 };

    const box = arena.getBoundingClientRect();
    
    const reachX = Math.max(0, box.width / 2 - dodger.offsetWidth / 2 - EDGE_PAD);
    const reachY = Math.max(0, box.height / 2 - dodger.offsetHeight / 2 - EDGE_PAD);
    const homeX = box.left + box.width / 2;
    const homeY = box.top + box.height / 2;

    let winner = { x: 0, y: 0 };
    let bestGap = -1;
    for (let i = 0; i < DECOY_SAMPLES; i += 1) {
      const spot = { x: between(-reachX, reachX), y: between(-reachY, reachY) };
      const gap = Math.hypot(homeX + spot.x - pointerX, homeY + spot.y - pointerY);
      if (gap > bestGap) {
        bestGap = gap;
        winner = spot;
      }
    }
    return winner;
  }, []);

  const scram = useCallback(
    (event) => {
      if (busted) return;
      const px = event?.clientX ?? window.innerWidth / 2;
      const py = event?.clientY ?? window.innerHeight / 2;
      setEvasionCoords(plotEscapeRoute(px, py));
      setDodgeTally((n) => n + 1);
    },
    [busted, plotEscapeRoute],
  );

  
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => {
      const dodger = dodgerRef.current;
      if (!dodger) return;
      const reachX = Math.max(0, arena.clientWidth / 2 - dodger.offsetWidth / 2 - EDGE_PAD);
      const reachY = Math.max(0, arena.clientHeight / 2 - dodger.offsetHeight / 2 - EDGE_PAD);
      setEvasionCoords((prev) => ({
        x: Math.min(reachX, Math.max(-reachX, prev.x)),
        y: Math.min(reachY, Math.max(-reachY, prev.y)),
      }));
    });
    observer.observe(arena);
    return () => observer.disconnect();
  }, []);

  const handleSneakySubmit = useCallback(() => {
    if (busted) return;

    if (!draft.name.trim()) {
      setFlaw({ field: 'name', msg: 'A name would help.', nonce: Math.random() });
      return;
    }
    if (!looksLikeEmail(draft.email)) {
      setFlaw({ field: 'email', msg: 'That email is not fooling anyone.', nonce: Math.random() });
      return;
    }

    console.log(
      '%c⌨️ The Enter key. Really? I wired up a whole physics engine and you brute-forced the form. Respect.',
      'color:#1F1F1F;background:#FFC107;padding:6px 12px;border-radius:6px;font-weight:600',
    );

    setFlaw(null);
    setBusted(true);
    onCaptured?.(draft);
  }, [busted, draft, onCaptured]);

  const onFieldKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleSneakySubmit();
  };

  const editField = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
    setFlaw((prev) => (prev?.field === field ? null : prev));
  };

  const runItBack = () => {
    setBusted(false);
    setDraft({ name: '', email: '' });
    setEvasionCoords({ x: 0, y: 0 });
    setDodgeTally(0);
    setFlaw(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-5 py-14 font-sans text-[#2B2B2B] antialiased">
      <div className="w-full max-w-[440px]">
        <AnimatePresence mode="wait" initial={false}>
          {busted ? (
            <motion.section
              key="victory"
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="relative overflow-visible rounded-3xl border border-[#F0F0F0] bg-[#FFFFFF] px-9 py-14 text-center shadow-[0_24px_70px_-32px_rgba(31,31,31,0.28)]"
            >
              <ConfettiBurst />
              <motion.div
                initial={{ rotate: -14, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14, delay: 0.06 }}
                className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#FFC107] text-2xl shadow-[0_12px_28px_-10px_rgba(255,193,7,0.9)]"
              >
                🏆
              </motion.div>
              <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">
                You outsmarted me.
              </h2>
              <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-[#7A7A7A]">
                Filed under <span className="font-medium text-[#2B2B2B]">{draft.email}</span> after{' '}
                {dodgeTally} failed {dodgeTally === 1 ? 'attempt' : 'attempts'}. The button is
                sulking.
              </p>
              <button
                type="button"
                onClick={runItBack}
                className="mt-8 rounded-xl border border-[#EDEDED] px-5 py-2.5 text-[14px] font-medium text-[#5A5A5A] transition-colors hover:border-[#FFD700] hover:text-[#2B2B2B]"
              >
                Run it back
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-[#F0F0F0] bg-[#FFFFFF] p-9 shadow-[0_24px_70px_-32px_rgba(31,31,31,0.28)]"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B7860B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107]" />
                Early access
              </span>

              <h1 className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.025em]">
                Join the waitlist
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#8A8A8A]">
                Two fields, one button. Should take about nine seconds.
              </p>

              <form
                className="mt-8 space-y-5"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSneakySubmit();
                }}
              >
                <Field
                  id="gf-name"
                  label="Full name"
                  placeholder="Ada Lovelace"
                  value={draft.name}
                  onChange={editField('name')}
                  onKeyDown={onFieldKeyDown}
                  flaw={flaw?.field === 'name' ? flaw : null}
                />
                <Field
                  id="gf-email"
                  label="Work email"
                  type="email"
                  placeholder="ada@enginehouse.io"
                  value={draft.email}
                  onChange={editField('email')}
                  onKeyDown={onFieldKeyDown}
                  flaw={flaw?.field === 'email' ? flaw : null}
                />

                <div
                  ref={arenaRef}
                  style={{ height: ARENA_H }}
                  className="relative mt-2 overflow-hidden rounded-2xl border border-dashed border-[#FFE9A8] bg-[#FFFDF5]"
                >
                  <span className="pointer-events-none absolute left-4 top-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#DCC682]">
                    Click zone
                  </span>

                  <motion.button
                    ref={dodgerRef}
                    type="button"
                    tabIndex={-1}
                    aria-label="Submit (good luck)"
                    onHoverStart={(e) => scram(e)}
                    onPointerDown={(e) => scram(e)}
                    onClick={(e) => scram(e)}
                    animate={evasionCoords}
                    transition={SPRING_OF_MISCHIEF}
                    transformTemplate={({ x = 0, y = 0 }) =>
                      `translate(-50%, -50%) translate(${x}, ${y})`
                    }
                    whileTap={{ scale: 0.94 }}
                    className="absolute left-1/2 top-1/2 select-none whitespace-nowrap rounded-xl bg-[#FFC107] px-7 py-3 text-[15px] font-semibold tracking-[-0.01em] text-[#1F1F1F] shadow-[0_10px_26px_-8px_rgba(255,193,7,0.95)] outline-none"
                  >
                    {TAUNTS[Math.min(dodgeTally, TAUNTS.length - 1)]}
                  </motion.button>

                  <AnimatePresence>
                    {dodgeTally >= HINT_AFTER && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="pointer-events-none absolute inset-x-0 bottom-3.5 text-center text-[12px] font-medium text-[#C8A94A]"
                      >
                        psst — the <kbd className="font-sans font-semibold">Enter</kbd> key still
                        works in the fields above
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              <p className="mt-6 text-center text-[12px] leading-relaxed text-[#B4B4B4]">
                By submitting you agree to be mildly inconvenienced.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ id, label, flaw, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-[#4A4A4A]">
        {label}
      </label>
      <motion.div
        key={flaw?.nonce ?? 'steady'}
        animate={flaw ? { x: [0, -7, 6, -4, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.42, ease: 'easeInOut' }}
      >
        <input
          id={id}
          autoComplete="off"
          aria-invalid={Boolean(flaw)}
          className={`w-full rounded-xl border bg-[#FFFFFF] px-4 py-3 text-[15px] text-[#2B2B2B] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#C4C4C4] ${
            flaw
              ? 'border-[#E8846A] shadow-[0_0_0_3px_rgba(232,132,106,0.14)]'
              : 'border-[#EAEAEA] focus:border-[#FFC107] focus:shadow-[0_0_0_3px_rgba(255,193,7,0.18)]'
          }`}
          {...rest}
        />
      </motion.div>
      <AnimatePresence>
        {flaw && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-[12px] font-medium text-[#D9704F]"
          >
            <span className="block pt-1.5">{flaw.msg}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfettiBurst() {
  
  const [flecks] = useState(() =>
    Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2 + between(-0.2, 0.2);
      const reach = between(95, 215);
      return {
        id: i,
        dx: Math.cos(angle) * reach,
        dy: Math.sin(angle) * reach - 45, 
        spin: between(-680, 680),
        delay: between(0, 0.09),
        tone: CONFETTI_TONES[i % CONFETTI_TONES.length],
        w: between(5, 9),
        h: between(9, 15),
      };
    }),
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {flecks.map((f) => (
        <motion.span
          key={f.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: f.dx,
            y: [0, f.dy, f.dy + 190],
            rotate: f.spin,
            opacity: [1, 1, 0],
            scale: [0.6, 1, 0.85],
          }}
          transition={{
            duration: 1.35,
            delay: f.delay,
            ease: 'easeOut',
            y: { times: [0, 0.34, 1], ease: ['easeOut', 'easeIn'] },
            opacity: { times: [0, 0.62, 1] },
            scale: { times: [0, 0.3, 1] },
          }}
          style={{
            width: f.w,
            height: f.h,
            background: f.tone,
            borderRadius: 2,
            position: 'absolute',
            left: '50%',
            top: '38%',
          }}
        />
      ))}
    </div>
  );
}
