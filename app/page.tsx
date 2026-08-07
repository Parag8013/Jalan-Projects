import Header from '@/components/chrome/Header';
import Footer from '@/components/chrome/Footer';
import Hero from '@/components/scenes/Hero';
import CapabilityStack from '@/components/scenes/CapabilityStack';
import Configurator from '@/components/scenes/Configurator';
import ParksHorizontal from '@/components/scenes/ParksHorizontal';
import FrameAssembly from '@/components/scenes/FrameAssembly';
import { ScaleBand, Handover, Sectors, Process, Questions, Close } from '@/components/scenes/Sections';

export default function Home() {
  return (
    <>
      <Header />
      <main id="top" className="relative">
        <Hero />
        <CapabilityStack />
        <Configurator />
        <ParksHorizontal />
        <div id="build">
          <FrameAssembly />
        </div>
        <ScaleBand />
        <Handover />
        <Sectors />
        <Process />
        <Questions />
        <Close />
      </main>
      <Footer />
    </>
  );
}
