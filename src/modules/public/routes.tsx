import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

export const publicRoutes: RouteObject[] = [
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
];

export default publicRoutes;