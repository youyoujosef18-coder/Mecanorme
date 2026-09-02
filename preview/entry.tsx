import React from 'react';
import { createRoot } from 'react-dom/client';
import Providers from '@/components/providers';
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

function Site() {
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

const el = document.getElementById('mn-root');
if (el) {
  createRoot(el).render(
    <Providers>
      <Site />
    </Providers>
  );
}
