import { COMPANY, PARKS } from '@/content/site';

/**
 * Footer. The crest's white field cannot sit on the ink ground — knocking it
 * out punched holes through the lion's muzzle — so the mark here is
 * typographic. It reads as more considered than a logo in a box would.
 */
export default function Footer() {
  return (
    <footer className="relative z-10 bg-ink px-[var(--spacing-gutter)] py-[clamp(56px,8vw,104px)] text-paper">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="display text-[length:var(--text-display-s)]">
              Jalan <span className="accent-italic text-gold">Projects</span>
            </p>
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-white/65">
              Industrial land and infrastructure across West Bengal. Sourcing, developed park
              plots, and facilities built to specification.
            </p>
            <span className="mt-8 block h-px w-16 bg-gold" />
          </div>

          <div>
            <p className="label text-white/50">Parks</p>
            <ul className="mt-5 space-y-4">
              {PARKS.map((p) => (
                <li key={p.slug}>
                  <p className="text-[0.9375rem]">{p.name}</p>
                  <p className="label mt-1 text-white/50">{p.place}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-white/50">Enquiries</p>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
                  className="numeral text-[1.0625rem] text-gold transition-opacity duration-200 hover:opacity-75"
                >
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${COMPANY.whatsapp}`}
                  className="text-[0.9375rem] text-white/80 transition-colors duration-200 hover:text-gold"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-[0.9375rem] text-white/80 transition-colors duration-200 hover:text-gold"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="label pt-2 text-white/50">{COMPANY.base}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-7">
          <p className="label text-white/40">
            © {new Date().getFullYear()} {COMPANY.name}
          </p>
          <p className="label text-white/40">Site imagery is indicative visualisation</p>
        </div>
      </div>
    </footer>
  );
}
