/* src/modules/public/pages/Home.tsx */
import { lazy } from 'react';
import PublicLayout from '../components/layout/PublicLayout';

const HeroSection       = lazy(() => import('../components/home/HeroSection'));
const AboutPreview      = lazy(() => import('../components/home/AboutPreview'));
const ActivitiesPreview = lazy(() => import('../components/home/ActivitiesPreview'));
const ContactCTA        = lazy(() => import('../components/home/ContactCTA'));

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <AboutPreview />
      <ActivitiesPreview />
      <ContactCTA />
    </PublicLayout>
  );
}
