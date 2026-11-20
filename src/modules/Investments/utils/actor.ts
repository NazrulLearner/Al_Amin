// Who performed an action (stored on history/audit rows).
export interface Actor {
  uid: string;
  name: string;
  role?: string;
}

// `user` / `userData` come from useAuth(). Shapes are read defensively.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toActor(user: any, userData: any): Actor {
  return {
    uid: user?.uid ?? '',
    name: userData?.fullName ?? user?.displayName ?? user?.email ?? 'Unknown',
    role: userData?.role ?? undefined,
  };
}
