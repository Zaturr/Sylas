import { useState, type ReactNode } from 'react';
import { NodeNetworkBackground } from './NodeNetworkBackground';
import { Sidebar } from './sidebar';
import type { AppPage } from '../navigation';
import '../pages/dashboard.css';

type AppShellProps = {
  activeItem: AppPage | 'settings';
  onNavigate: (page: AppPage) => void;
  pageClassName?: string;
  mainClassName?: string;
  children: ReactNode;
};

export function AppShell({
  activeItem,
  onNavigate,
  pageClassName: pageClassNameProp,
  mainClassName,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const closeSidebar = () => setSidebarOpen(false);

  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarExpanded((prev) => !prev);
      return;
    }
    setSidebarOpen((prev) => !prev);
  };

  const pageClassName = [
    'dashboard-page',
    sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed',
    pageClassNameProp,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={pageClassName}>
      <NodeNetworkBackground />
      <Sidebar
        isOpen={sidebarOpen}
        isExpanded={sidebarExpanded}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        activeItem={activeItem}
        onNavigate={onNavigate}
      />

      <div className="dashboard-layout">
        <main className={['dashboard-main', mainClassName].filter(Boolean).join(' ')}>
          <header className="top-nav">
            <div className="top-nav-left">
              <button
                type="button"
                className="icon-btn menu-toggle"
                aria-label={sidebarExpanded ? 'Replegar menú' : 'Desplegar menú'}
                onClick={toggleSidebar}
              >
                ☰
              </button>
              <h1 className="main-title">BDSA Alias Front</h1>
            </div>

            
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
