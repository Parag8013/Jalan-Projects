import { COMPANY, LEADERSHIP, PARKS } from '@/content/site';

/**
 * Footer.
 *
 * The crest is set larger here than in the header, above the wordmark rather
 * than beside it. The header has to stay out of the way of the film; the footer
 * is the one place on the page where the mark can simply be the mark.
 *
 * `public/crest.png` is `public/logo-jalan.jpg` with its white field keyed out.
 * The JPEG itself cannot go on a dark ground, and a plain `-transparent white`
 * knockout punches holes through the lion's muzzle and leaves a grey halo of
 * JPEG ringing. It needs a soft matte off the darkest channel instead:
 *
 *   magick public/logo-jalan.jpg -colorspace sRGB -channel RGB -separate
 *     -evaluate-sequence min -negate -level 9%,40% +channel matte.png
 *
 * The 9% floor is what kills the halo — measure it before changing it, the
 * supplied JPEG carries up to 7.5% alpha of near-white in the background.
 *
 * That matte alone also keys out the lion's white muzzle and pale mane, and
 * on the dark ground the face then reads as a negative. So the matte only
 * applies outside the hexagon: the field inside it stays opaque white, and
 * the crest reads as a white badge with nothing showing past its outline.
 *
 * The hexagon's two top edges stop short of the arrow, which would let a
 * flood fill from outside leak into the badge. The mask closes that gap with
 * a line before filling (the line is never drawn on the crest itself):
 *
 *   magick public/logo-jalan.jpg -stroke "#b8962e" -strokewidth 3
 *     -draw "line 113,27 144,27" -fuzz 12% -fill magenta
 *     -draw "color 0,0 floodfill"
 *     -fill black -opaque magenta -fill white +opaque black
 *     -morphology Erode Disk:1.5 -blur 0x0.7 inside.png
 *   magick matte.png inside.png -compose Lighten -composite alpha.png
 *   magick public/logo-jalan.jpg alpha.png -alpha off -compose CopyOpacity
 *     -composite -trim +repage -strip public/crest.png
 *
 * The erode keeps the fill-edge fringe on the soft matte rather than opaque,
 * which would otherwise leave a pale rim outside the gold outline.
 */
export default function Footer() {
  return (
    <footer className="grain relative z-10 border-t border-edge bg-void px-[var(--spacing-gutter)] py-[clamp(56px,8vw,104px)]">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img
              src="/crest.png"
              alt=""
              width={185}
              height={241}
              className="mb-6 h-16 w-auto select-none"
              draggable={false}
            />
            <p className="display text-[length:var(--text-display-s)] text-white">
              Jalan <span className="accent-italic">Projects</span>
            </p>
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-mist">
              Industrial land and infrastructure across West Bengal. Sourcing, developed park
              plots, and facilities built to specification.
            </p>
            <span className="mt-8 block h-px w-16 bg-gold" />

            <p className="mt-7 text-[0.9375rem] text-white">{LEADERSHIP.ceo.name}</p>
            <p className="label mt-1 text-ash">{LEADERSHIP.ceo.role}</p>
          </div>

          <div>
            <p className="label text-gold">Parks</p>
            <ul className="mt-5 space-y-4">
              {PARKS.map((p) => (
                <li key={p.slug}>
                  <p className="text-[0.9375rem]">{p.name}</p>
                  <p className="label mt-1 text-ash">{p.place}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-gold">Enquiries</p>
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
                  className="text-[0.9375rem] text-mist transition-colors duration-200 hover:text-gold"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-[0.9375rem] text-mist transition-colors duration-200 hover:text-gold"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="label pt-2 text-ash">{COMPANY.base}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-edge pt-7">
          <p className="label text-ash">
            © {new Date().getFullYear()} {COMPANY.name}
          </p>
          <p className="label text-ash">Site imagery is indicative visualisation</p>
        </div>
      </div>
    </footer>
  );
}
