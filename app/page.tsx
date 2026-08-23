import Header from '@/components/chrome/Header';
import Footer from '@/components/chrome/Footer';
import Assembly from '@/components/scenes/Assembly';
import Ledger from '@/components/scenes/Ledger';
import CapabilityStack from '@/components/scenes/CapabilityStack';
import Configurator from '@/components/scenes/Configurator';
import Land from '@/components/scenes/Land';
import ParksHorizontal from '@/components/scenes/ParksHorizontal';
import SpecOrbit from '@/components/scenes/SpecOrbit';
import Interior from '@/components/scenes/Interior';
import Leadership from '@/components/scenes/Leadership';
import { Sectors, Process, Questions, Close } from '@/components/scenes/Sections';

/**
 * The running order.
 *
 * Three scenes are scroll-scrubbed film — the assembly, the orbit and the
 * interior. They are the spine, and they are spaced so no two land back to
 * back: a visitor who has just driven one camera for five viewports needs
 * something to read before they drive another.
 *
 * Everything between them is either a looping ambient scene or flat type on the
 * dark ground, and the value steps between void, carbon and slate are what give
 * the page rhythm now that every section shares one register.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main className="relative">
        {/* Act I — the object */}
        <Assembly />
        <Ledger />

        {/* Act II — what we sell */}
        <CapabilityStack />
        <Configurator />

        {/* Act III — the land */}
        <Land />
        <ParksHorizontal />

        {/* Act IV — the build */}
        <SpecOrbit />
        <Interior />

        {/* Act V — the firm */}
        <Sectors />
        <Process />
        <Leadership />
        <Questions />
        <Close />
      </main>
      <Footer />
    </>
  );
}
