import './Footer.css';
import { ResponsiveTitle } from '../content/ResponsiveTitle';
import { useEqualizedBlockSize } from '../../hooks/useEqualizedBlockSize';
import { siteConfig, sitePath } from '../../lib/site';

const footerSections = [
  { key: 'web', title: <>Soluciones de desarrollo web a<br />medida</> },
  { key: 'digital', title: <>Transformación digital que<br />impulsa tu negocio</> },
  { key: 'marketing', title: <>Marketing online orientado a<br />resultados</> },
  { key: 'about', title: 'Sobre dipe' },
];

function FooterLink({ item, legal = false }) {
  const opensNewTab = legal || item.target === '_blank';

  return <a
    href={sitePath(item.url)}
    target={opensNewTab ? '_blank' : undefined}
    rel={opensNewTab ? 'nofollow noopener noreferrer' : undefined}
  >
    {item.title}
  </a>;
}

function FooterMenu({ section, items }) {
  return <section className="dipe-footer__menu-group" aria-labelledby={`dipe-footer-${section.key}`}>
    <p className="dipe-footer__menu-title" id={`dipe-footer-${section.key}`}><ResponsiveTitle>{section.title}</ResponsiveTitle></p>
    {items.length > 0 && <ul className="dipe-footer__menu-list">
      {items.map((item) => <li key={item.id}><FooterLink item={item} /></li>)}
    </ul>}
  </section>;
}

export function Footer() {
  const footerLogo = siteConfig.footerLogo || {};
  const navigation = siteConfig.navigation?.footer || {};
  const legalItems = navigation.legal || [];
  const currentYear = new Date().getFullYear();
  const menusRef = useEqualizedBlockSize('.dipe-footer__menu-title');

  return <footer className="dipe-footer">
    <div className="dipe-footer__inner">
      <div className="dipe-footer__contact-row">
        <a className="dipe-footer__brand" href={sitePath('/')} aria-label="Ir al inicio">
          {footerLogo.url ? <img src={footerLogo.url} alt={footerLogo.alt || 'Dipe Agency'} /> : <span>{footerLogo.alt || 'Dipe Agency'}</span>}
        </a>
        <a
          className="dipe-footer__contact-link"
          href="https://maps.app.goo.gl/JjwyyDkWYmNgW6F26/"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          Oficina Salamanca<br />
          Jesús Arambarri, 33 – 37003 Salamanca
        </a>
        <div className="dipe-footer__direct-contact">
          <a className="dipe-footer__contact-link dipe-footer__phone" href="tel:+34923623738">(+34) 923 623 738</a>
          <a className="dipe-footer__contact-link" href="mailto:info@dipe.es">info@dipe.es</a>
        </div>
      </div>

      <nav className="dipe-footer__menus" aria-label="Índice del sitio" ref={menusRef}>
        {footerSections.map((section) => <FooterMenu key={section.key} section={section} items={navigation[section.key] || []} />)}
      </nav>

      <div className="dipe-footer__bottom-row">
        <p className="dipe-footer__copyright">© {currentYear} Todos los derechos reservados.</p>
        {legalItems.length > 0 && <nav aria-label="Información legal">
          <ul className="dipe-footer__legal-list">
            {legalItems.map((item) => <li key={item.id}><FooterLink item={item} legal /></li>)}
          </ul>
        </nav>}
      </div>
    </div>
  </footer>;
}
