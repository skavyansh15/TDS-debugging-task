import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export default function GaslightForm({ onCaptured }) {
  const [draft, setDraft] = useState({ name: '', email: '' });
  const [flaw, setFlaw] = useState(null);
  const [busted, setBusted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!draft.name.trim()) {
      setFlaw({ field: 'name', msg: 'A name would help.', nonce: Math.random() });
      return;
    }
    if (!looksLikeEmail(draft.email)) {
      setFlaw({ field: 'email', msg: 'That email is not fooling anyone.', nonce: Math.random() });
      return;
    }

    setFlaw(null);
    setBusted(true);
    if (onCaptured) onCaptured(draft);
  };

  const editField = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
    setFlaw((prev) => (prev?.field === field ? null : prev));
  };

  const runItBack = () => {
    setBusted(false);
    setDraft({ name: '', email: '' });
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
                Filed under <span className="font-medium text-[#2B2B2B]">{draft.email}</span> successfully.
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
                Two fields, one button. Ready when you are.
              </p>

              <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
                <Field
                  id="gf-name"
                  label="Full name"
                  placeholder="Ada Lovelace"
                  value={draft.name}
                  onChange={editField('name')}
                  flaw={flaw?.field === 'name' ? flaw : null}
                />
                <Field
                  id="gf-email"
                  label="Work email"
                  type="email"
                  placeholder="ada@enginehouse.io"
                  value={draft.email}
                  onChange={editField('email')}
                  flaw={flaw?.field === 'email' ? flaw : null}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FFC107] px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-[#1F1F1F] shadow-[0_10px_26px_-8px_rgba(255,193,7,0.95)] outline-none hover:opacity-90 transition-opacity"
                >
                  Submit application
                </button>
              </form>
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
