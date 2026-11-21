import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePage       = lazy(() => import('./pages/Home'));
const AboutUsPage    = lazy(() => import('./pages/AboutUs'));
const ActivitiesPage = lazy(() => import('./pages/Activities'));
const ContactPage    = lazy(() => import('./pages/Contact'));
const FAQPage        = lazy(() => import('./pages/FAQ'));
const PrivacyTermsPage = lazy(() => import('./pages/PrivacyTerms'));

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  { path: '/about', element: <AboutUsPage /> },
  { path: '/activities', element: <ActivitiesPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/faq', element: <FAQPage /> },
  { path: '/privacy-terms', element: <PrivacyTermsPage /> },
];

export default publicRoutes;
