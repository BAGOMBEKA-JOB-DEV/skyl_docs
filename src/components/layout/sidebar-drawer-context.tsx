'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface DrawerState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<DrawerState>({ open: false, setOpen: () => {} });

/**
 * Shares the mobile sidebar's open state between the header toggle and the
 * sidebar itself, which sit in different parts of the tree.
 */
export function SidebarDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating must close the drawer, or the reader lands on the new page with
  // the menu still covering it.
  useEffect(() => setOpen(false), [pathname]);

  // A drawer over the content must not leave the page scrollable behind it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebarDrawer() {
  return useContext(Ctx);
}
