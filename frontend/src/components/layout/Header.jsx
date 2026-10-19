import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { siteConfig, sitePath } from '../../lib/site';
import './Header.css';

// Adapta los enlaces del menú de WordPress y los padres sin destino.
function MenuLink({ item, hasChildren, onToggle }) {
  const href = sitePath(item.url);
  const target = item.target === '_blank' ? '_blank' : undefined;

  return <a
    className={`dipe-header__link ${(item.classes || []).join(' ')}`.trim()}
    href={href}
    target={target}
    rel={target ? 'noopener noreferrer' : undefined}
    onClick={(event) => {
      if (hasChildren && href === '#') {
        event.preventDefault();
        onToggle?.();
      }
    }}
  >
    {item.title}
  </a>;
}

function MenuToggleIcon({ close = false }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
    <path d={close ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} />
  </svg>;
}

// Controla la apertura del submenú por ratón, botón y foco.
function PrimaryItem({ item, openItem, setOpenItem, idPrefix = 'dipe-submenu' }) {
  const hasChildren = item.children?.length > 0;
  const isOpen = openItem === item.id;
  const submenuId = `${idPrefix}-${item.id}`;

  return <li
    className={`dipe-header__primary-item ${(item.classes || []).includes('menu-cta') ? 'dipe-header__primary-item--cta' : ''} ${hasChildren ? 'has-children' : ''} ${isOpen ? 'is-open' : ''}`}
    onPointerEnter={(event) => {
      if (hasChildren && event.pointerType === 'mouse' && window.matchMedia('(width > 1024px)').matches) {
        setOpenItem(item.id);
      }
    }}
    onPointerLeave={(event) => {
      if (!hasChildren || event.pointerType !== 'mouse' || !window.matchMedia('(width > 1024px)').matches) return;
      // El panel pertenece al mismo ítem: pasar del padre a sus hijos no lo cierra.
      // Conserva también el submenú mientras contiene el foco del teclado.
      if (event.currentTarget.contains(document.activeElement)) return;
      setOpenItem((current) => current === item.id ? null : current);
    }}
  >
    <div className="dipe-header__item-row">
      <MenuLink item={item} hasChildren={hasChildren} onToggle={() => setOpenItem(isOpen ? null : item.id)} />
      {hasChildren && <button
        className="dipe-header__submenu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        aria-label={`${isOpen ? 'Cerrar' : 'Abrir'} submenú de ${item.title}`}
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

// Gestiona la navegación de escritorio y el menú móvil con su foco y animación.
export function Header() {
  const headerRef = useRef(null);
  const headerContentRef = useRef(null);
  const menuToggleRef = useRef(null);
  const menuDialogRef = useRef(null);
  const dialogAnimationRef = useRef(null);
  const headerAnimationRef = useRef(null);
  const dialogClosingRef = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactMenu, setCompactMenu] = useState(() => typeof window !== 'undefined' && window.matchMedia('(width < 440px)').matches);
  const [openItem, setOpenItem] = useState(null);
  const utility = siteConfig.navigation?.utility || [];
  const primary = siteConfig.navigation?.primary || [];
  const primaryCtas = primary.filter((item) => (item.classes || []).includes('menu-cta'));
  const primaryLinks = primary.filter((item) => !(item.classes || []).includes('menu-cta'));
  const logo = siteConfig.logo || {};
  const closeMenu = useCallback((afterClose) => {
    if (dialogClosingRef.current) return;
    const finish = () => {
      setMobileOpen(false);
      setOpenItem(null);
      afterClose?.();
    };
    const dialog = menuDialogRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!dialog?.open || !compactMenu || reduceMotion || !dialog.animate) {
      finish();
      return;
    }

    dialogClosingRef.current = true;
    dialog.setAttribute('data-closing', '');
    const header = headerRef.current;
    const headerContent = headerContentRef.current;
    headerAnimationRef.current?.cancel();
    if (headerContent?.animate) {
      header?.setAttribute('data-menu-closing', '');
      const headerAnimation = headerContent.animate([
        { transform: 'translateY(-100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      headerAnimationRef.current = headerAnimation;
      headerAnimation.onfinish = () => {
        if (headerAnimationRef.current === headerAnimation) {
          headerAnimationRef.current = null;
          header?.removeAttribute('data-menu-closing');
        }
      };
    }
    const currentTransform = window.getComputedStyle(dialog).transform;
    dialogAnimationRef.current?.cancel();
    const animation = dialog.animate([
      { transform: currentTransform },
      { transform: 'translateX(100%)' },
    ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    dialogAnimationRef.current = animation;
    animation.onfinish = () => {
      if (dialogAnimationRef.current === animation) finish();
    };
  }, [compactMenu]);

  const closeAfterNavigation = (event) => {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href') !== '#') {
      const sameWindow = !link.target || link.target === '_self';
      const unmodifiedClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      const webLink = link.protocol === 'http:' || link.protocol === 'https:';
      if (menuDialogRef.current?.open && !dialogClosingRef.current && sameWindow && unmodifiedClick && webLink && !link.hasAttribute('download') && !event.defaultPrevented) {
        event.preventDefault();
        const destination = link.href;
        closeMenu(() => window.location.assign(destination));
      } else {
        closeMenu();
      }
    }
  };

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const root = document.documentElement;
    const updateAnchorOffset = () => {
      const top = Math.max(0, parseFloat(window.getComputedStyle(header).top) || 0);
      const offset = Math.ceil(header.getBoundingClientRect().height + top);
      root.style.setProperty('--dipe-anchor-header-offset', `${offset}px`);
    };

    updateAnchorOffset();
    const observer = 'ResizeObserver' in window ? new ResizeObserver(updateAnchorOffset) : null;
    observer?.observe(header);
    window.addEventListener('resize', updateAnchorOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateAnchorOffset);
      root.style.removeProperty('--dipe-anchor-header-offset');
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (menuDialogRef.current?.open) {
        closeMenu();
        return;
      }
      if (!mobileOpen && openItem !== null) {
        headerRef.current?.querySelector('.dipe-header__submenu-toggle[aria-expanded="true"]')?.focus();
      }
      setMobileOpen(false);
      setOpenItem(null);
      if (mobileOpen && !menuDialogRef.current?.open) menuToggleRef.current?.focus();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen, openItem, closeMenu]);

  useEffect(() => {
    if (!mobileOpen && openItem === null) return undefined;
    const closeOutside = (event) => {
      // El popup compacto mantiene su propio foco y cierre modal nativos.
      if (menuDialogRef.current?.open || headerRef.current?.contains(event.target)) return;
      setMobileOpen(false);
      setOpenItem(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [mobileOpen, openItem]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const compactMedia = window.matchMedia('(width < 440px)');
    const resetMenu = () => {
      setMobileOpen(false);
      setOpenItem(null);
    };
    const updateCompactMenu = () => {
      setCompactMenu(compactMedia.matches);
      resetMenu();
    };
    media.addEventListener('change', resetMenu);
    compactMedia.addEventListener('change', updateCompactMenu);
    return () => {
      media.removeEventListener('change', resetMenu);
      compactMedia.removeEventListener('change', updateCompactMenu);
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = menuDialogRef.current;
    if (!dialog || !compactMenu || !mobileOpen) return undefined;

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    // El body no debe convertirse en contenedor de scroll: desplaza el sticky.
    root.style.overflow = 'hidden';
    dialog.showModal();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && dialog.animate) {
      const animation = dialog.animate([
        { transform: 'translateX(100%)' },
        { transform: 'translateX(0)' },
      ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      dialogAnimationRef.current = animation;
      animation.onfinish = () => {
        if (dialogAnimationRef.current === animation) dialogAnimationRef.current = null;
      };
    }

    return () => {
      dialogAnimationRef.current?.cancel();
      dialogAnimationRef.current = null;
      headerAnimationRef.current?.cancel();
      headerAnimationRef.current = null;
      headerRef.current?.removeAttribute('data-menu-closing');
      dialogClosingRef.current = false;
      dialog.removeAttribute('data-closing');
      if (dialog.open) dialog.close();
      root.style.overflow = previousRootOverflow;
    };
  }, [compactMenu, mobileOpen]);

  return <>
    <div className="dipe-header__utility-bar">
      <nav className="dipe-header__inner" aria-label="Navegación superior">
        <ul className="dipe-header__utility-list">
          {utility.map((item) => <li key={item.id}><MenuLink item={item} /></li>)}
        </ul>
      </nav>
    </div>
    <header className="dipe-header" ref={headerRef}>
      <div className="dipe-header__main-bar">
        <div className="dipe-header__inner dipe-header__main-inner" ref={headerContentRef}>
          <a className="dipe-header__brand" href={sitePath('/')} aria-label="Ir al inicio">
            {logo.url ? <img src={logo.url} alt={logo.alt || 'Dipe Agency'} /> : <span>{logo.alt || 'Dipe Agency'}</span>}
          </a>
          <div className="dipe-header__mobile-actions">
            {primaryCtas.length > 0 && <div className="dipe-header__mobile-cta" onClick={closeAfterNavigation}>
              {primaryCtas.map((item) => <MenuLink item={item} key={item.id} />)}
            </div>}
            <button
              className="dipe-header__menu-toggle"
              type="button"
              ref={menuToggleRef}
              aria-expanded={mobileOpen}
              aria-controls={compactMenu ? 'dipe-mobile-menu-dialog' : 'dipe-primary-navigation'}
              aria-haspopup={compactMenu ? 'dialog' : undefined}
              onClick={() => {
                setMobileOpen(!mobileOpen);
                setOpenItem(null);
              }}
            >
              <span className="visually-hidden">{mobileOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}</span>
              <MenuToggleIcon close={mobileOpen} />
            </button>
          </div>
          <nav className={`dipe-header__primary-nav ${mobileOpen ? 'is-open' : ''}`} id="dipe-primary-navigation" aria-label="Navegación principal" onClick={closeAfterNavigation}>
            <ul className="dipe-header__primary-list">
              {primary.map((item) => <PrimaryItem item={item} key={item.id} openItem={openItem} setOpenItem={setOpenItem} />)}
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <dialog
      className="dipe-header__menu-dialog"
      id="dipe-mobile-menu-dialog"
      aria-labelledby="dipe-mobile-menu-title"
      ref={menuDialogRef}
      onCancel={(event) => {
        event.preventDefault();
        closeMenu();
      }}
      onClose={() => {
        setMobileOpen(false);
        setOpenItem(null);
      }}
    >
      <div className="dipe-header__dialog-inner">
        <h2 className="visually-hidden" id="dipe-mobile-menu-title">Menú de navegación</h2>
        <button
          className="dipe-header__menu-toggle dipe-header__dialog-close"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => closeMenu()}
        ><MenuToggleIcon close /></button>
        <a className="dipe-header__brand dipe-header__dialog-brand" href={sitePath('/')} aria-label="Ir al inicio" onClick={closeAfterNavigation}>
          {logo.url ? <img src={logo.url} alt={logo.alt || 'Dipe Agency'} /> : <span>{logo.alt || 'Dipe Agency'}</span>}
        </a>
        <nav aria-label="Navegación del sitio" onClick={closeAfterNavigation}>
          <ul className="dipe-header__primary-list">
            {utility.map((item) => <PrimaryItem item={item} key={`utility-${item.id}`} openItem={openItem} setOpenItem={setOpenItem} idPrefix="dipe-dialog-utility-submenu" />)}
            {primaryLinks.map((item) => <PrimaryItem item={item} key={`primary-${item.id}`} openItem={openItem} setOpenItem={setOpenItem} idPrefix="dipe-dialog-submenu" />)}
          </ul>
        </nav>
        {primaryCtas.length > 0 && <div className="dipe-header__dialog-cta" onClick={closeAfterNavigation}>
          {primaryCtas.map((item) => <MenuLink item={item} key={item.id} />)}
        </div>}
      </div>
    </dialog>
  </>;
}
