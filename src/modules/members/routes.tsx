// src/modules/members/routes.tsx
import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// Lazy load components for better performance
const MembersPage = lazy(() => import('./pages/MembersPage'))
const AddMember = lazy(() => import('./pages/AddMember'))
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'))
const MyProfile = lazy(() => import('./pages/my-profile'))

export const membersRoutes: RouteObject[] = [
  {
    path: 'members',
    children: [
      { index: true, element: <MembersPage /> },
      { path: 'add', element: <AddMember /> },
      { path: 'add-member', element: <AddMember /> }, // alias
      { path: 'profile/:memberId', element: <MemberProfilePage /> },
      { path: ':memberId', element: <MemberProfilePage /> },
    ],
  },
  {
    path: 'my-profile',
    element: <MyProfile />,
  },
]