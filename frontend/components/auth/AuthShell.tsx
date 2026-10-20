import Logo from "@/components/ui/Logo";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      {/* Left: brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink p-12 text-ivory">
        {/* ledger-line motif */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 39px, currentColor 39px, currentColor 40px)",
          }}
        />
        <Logo variant="light" className="relative z-10" />

        <div className="relative z-10 max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-4">
            Ledger №001 — Inventory
          </p>
          <h2 className="font-display text-[34px] leading-[1.15] font-medium mb-4">
            Every product, priced and kept in order.
          </h2>
          <p className="text-[15px] text-ivory/60 leading-relaxed">
            MyStore keeps a clean record of what you sell — stock levels,
            pricing, and details, all in one tidy ledger.
          </p>
        </div>

        <p className="relative z-10 text-[13px] text-ivory/40 font-mono">
          © {new Date().getFullYear()} MyStore
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-2">
            {eyebrow}
          </p>
          <h1 className="font-display text-[30px] font-medium text-ink mb-1.5">
            {title}
          </h1>
          <p className="text-[14.5px] text-slate mb-8">{subtitle}</p>

          {children}

          {footer && <div className="mt-7 text-center text-[14px] text-slate">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
