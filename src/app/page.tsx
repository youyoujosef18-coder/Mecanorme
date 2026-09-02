import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import Ticker from '@/components/sections/Ticker';
import Intro from '@/components/sections/Intro';
import StoryBlueprint from '@/components/sections/StoryBlueprint';
import ServiceExplorer from '@/components/sections/ServiceExplorer';
import Process from '@/components/sections/Process';
import Projects from '@/components/sections/Projects';
import Why from '@/components/sections/Why';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="contenu">
        <Hero />
        <Ticker />
        <Intro />
        <ServiceExplorer />
        <StoryBlueprint />
        <Process />
        <Projects />
        <Why />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
