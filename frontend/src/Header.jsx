import { useEffect, useState } from 'react';
import { siteConfig, sitePath } from './site';

function MenuLink({ item, hasChildren }) {
  const href = sitePath(item.url);
  const target = item.target === '_blank' ? '_blank' : undefined;

  return <a
    className={`dipe-header__link ${(item.classes || []).join(' ')}`.trim()}
    href={href}
    target={target}
    rel={target ? 'noopener noreferrer' : undefined}
    onClick={(event) => {
      if (hasChildren && href === '#') event.preventDefault();
    }}
  >
    {item.title}
  </a>;
}

function PrimaryItem({ item, openItem, setOpenItem }) {
  const hasChildren = item.children?.length > 0;
  const isOpen = openItem === item.id;
  const submenuId = `dipe-submenu-${item.id}`;

  return <li className={`dipe-header__primary-item ${hasChildren ? 'has-children' : ''} ${isOpen ? 'is-open' : ''}`}>
    <div className="dipe-header__item-row">
      <MenuLink item={item} hasChildren={hasChildren} />
      {hasChildren && <button
        className="dipe-header__submenu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        aria-label={`Abrir submenú de ${item.title}`}
        onClick={() => setOpenItem(isOpen ? null : item.id)}
      >
        <span aria-hidden="true" />
      </button>}
    </div>
    {hasChildren && <ul className="dipe-header__submenu" id={submenuId}>
      {item.children.map((child) => <li key={child.id}>
        <MenuLink item={child} />
      </li>)}
    </ul>}
  </li>;
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const utility = siteConfig.navigation?.utility || [];
  const primary = siteConfig.navigation?.primary || [];
  const logo = siteConfig.logo || {};

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      setOpenItem(null);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return <header className="dipe-header">
    <div className="dipe-header__utility-bar">
      <nav className="dipe-header__inner" aria-label="Navegación superior">
        <ul className="dipe-header__utility-list">
          {utility.map((item) => <li key={item.id}><MenuLink item={item} /></li>)}
        </ul>
      </nav>
    </div>
    <div className="dipe-header__main-bar">
      <div className="dipe-header__inner dipe-header__main-inner">
        <a className="dipe-header__brand" href={sitePath('/')} aria-label="Ir al inicio">
          {logo.url ? <img src={logo.url} alt={logo.alt || 'Dipe Agency'} /> : <span>{logo.alt || 'Dipe Agency'}</span>}
        </a>
        <button
          className="dipe-header__menu-toggle"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="dipe-primary-navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="visually-hidden">Abrir menú principal</span>
          <span aria-hidden="true">☰</span>
        </button>
        <nav className={`dipe-header__primary-nav ${mobileOpen ? 'is-open' : ''}`} id="dipe-primary-navigation" aria-label="Navegación principal">
          <ul className="dipe-header__primary-list">
            {primary.map((item) => <PrimaryItem item={item} key={item.id} openItem={openItem} setOpenItem={setOpenItem} />)}
          </ul>
        </nav>
      </div>
    </div>
  </header>;
}
