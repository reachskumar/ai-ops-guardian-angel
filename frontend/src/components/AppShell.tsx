import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Sidebar } from './Sidebar';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        <div className="relative">
          <Navigation />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                title="Toggle theme"
                className="hidden"
                aria-label="Toggle theme"
              />
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex">
          <aside className="hidden lg:block"><Sidebar /></aside>
          <main className="flex-1 p-6">{children}</main>
        </div>
        <CommandPalette open={open} onOpenChange={setOpen} />
      </TooltipProvider>
    </div>
  );
};

export default AppShell;


