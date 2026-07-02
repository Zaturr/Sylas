import './sidebar.css';
import type { AppPage } from '../navigation';

type SidebarProps = {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggle: () => void;
  activeItem?: AppPage | 'settings';
  onNavigate?: (page: AppPage) => void;
};

const menuItems: Array<{ id: AppPage | 'settings'; label: string; icon: string }> = [
  { id: 'alias', label: 'Panel de Alias', icon: '' },
  { id: 'users', label: 'Usuarios', icon: '' },
  { id: 'simulation', label: 'Simulación', icon: '' },
  { id: 'settings', label: 'Configuración', icon: '' },
];

export function Sidebar({
  isOpen,
  isExpanded,
  onClose,
  onToggle,
  activeItem = 'alias',
  onNavigate,
}: SidebarProps) {
  const sidebarClassName = [
    'sidebar',
    isOpen ? 'sidebar--open' : '',
    isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed',
  ]
    .filter(Boolean)
    .join(' ');

  const handleNavigate = (itemId: AppPage | 'settings') => {
    if (itemId === 'settings' || !onNavigate) {
      return;
    }
    onNavigate(itemId);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClassName}>
        <div className="sidebar-header">
          <div className="sidebar-brand">BDCA Alias</div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeItem === item.id ? 'sidebar-link--active' : ''}`}
              title={item.label}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-toggle"
          aria-label={isExpanded ? 'Replegar menú' : 'Desplegar menú'}
          onClick={onToggle}
        >
          <span className="sidebar-toggle-icon">{isExpanded ? '◀' : '▶'}</span>
          <span className="sidebar-toggle-label">
            {isExpanded ? 'Replegar' : 'Desplegar'}
          </span>
        </button>
      </aside>
    </>
  );
}
