import { useEffect, useState } from 'react';
import { FitText } from '../../components/content/FitText';
import { plainText } from '../../lib/api';
import { commerceConfig, shopUrl, formatShopMoney } from '../../lib/commerce';
import { homeMedia } from '../home/homeMedia';
import { sitePath } from '../../lib/site';
import { WishlistProvider, WishlistButton } from './Wishlist';
import './Shop.css';

export { useShopCart } from '../../components/commerce/CartProvider';

export function ShopIcon({ name = 'arrow', ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    filter: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}

export function ShopLayout({ children }) {
  return <div className="dipe-shop"><WishlistProvider>{children}</WishlistProvider></div>;
}

export function ShopHero({ title = 'La tienda de Dipe', description = 'Objetos para acompañar tus ideas. Descubre la colección y encuentra tu próximo favorito.', compact = false, heading = true }) {
  return <header className={`dipe-shop__hero${compact ? ' dipe-shop__hero--compact' : ''}`} style={{ backgroundImage: `url("${homeMedia('Banner-agencia.png')}")` }}>
    <div className="dipe-shop__container">
      <p className="dipe-shop__eyebrow">Diseño que te acompaña</p>
      <FitText as={heading ? 'h1' : 'p'} className="dipe-shop__hero-title">{title}</FitText>
      {description && <p className="dipe-shop__hero-description">{description}</p>}
    </div>
  </header>;
}

export function ShopBreadcrumbs({ items = [] }) {
  return <nav className="dipe-shop__breadcrumbs" aria-label="Ruta de navegación"><ol>
    <li><a href={sitePath('/')}>Inicio</a></li>
    <li>{items.length ? <a href={shopUrl}>Tienda</a> : <span aria-current="page">Tienda</span>}</li>
    {items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}
  </ol></nav>;
}

export function ShopPrice({ product, className = '' }) {
  const prices = product?.prices;
  if (!prices || prices.price === '' || prices.price == null) return null;
  const range = prices.price_range;
  const hasRange = range && range.min_amount !== range.max_amount;
  return <span className={`dipe-shop-price ${className}`.trim()}>
    {!hasRange && product.on_sale && Number(prices.regular_price) > Number(prices.price) && <del><span className="visually-hidden">Precio anterior: </span>{formatShopMoney(prices.regular_price, prices)}</del>}
    <span><span className="visually-hidden">{hasRange ? 'Entre ' : 'Precio: '}</span>{hasRange ? `${formatShopMoney(range.min_amount, prices)} – ${formatShopMoney(range.max_amount, prices)}` : formatShopMoney(prices.price, prices)}</span>
  </span>;
}

export function ShopProductImage({ image, name, eager = false, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image?.src]);
  const src = failed ? commerceConfig.placeholder : image?.src || commerceConfig.placeholder;
  if (!src) return <span className="dipe-shop__no-image"><ShopIcon name="bag" /><span>Imagen no disponible</span></span>;
  return <img src={src} srcSet={!failed ? image?.srcset || undefined : undefined} sizes="(max-width: 680px) 90vw, (max-width: 1100px) 42vw, 28vw" alt={image?.alt || plainText(name)} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} {...props} />;
}

export function ShopProductCard({ product }) {
  const name = plainText(product.name);
  return <article className="dipe-shop-card">
    <div className="dipe-shop-card__media">
    <a className="dipe-shop-card__image" href={product.permalink} aria-label={`Ver ${name}`}>
      <ShopProductImage image={product.images?.[0]} name={name} />
      {!product.is_in_stock ? <span className="dipe-shop__badge dipe-shop__badge--muted">Agotado</span> : product.on_sale && <span className="dipe-shop__badge">Oferta</span>}
    </a>
    <WishlistButton product={product} />
    </div>
    <div className="dipe-shop-card__content">
      {product.categories?.[0] && <a className="dipe-shop-card__category" href={product.categories[0].link}>{plainText(product.categories[0].name)}</a>}
      <h3 className="dipe-shop-card__title"><a href={product.permalink}>{name}</a></h3>
      <ShopPrice product={product} />
      {product.type === 'variable' && <p className="dipe-shop-card__options">Disponible en varias opciones</p>}
      <a className="dipe-shop-card__link" href={product.permalink}>{product.type === 'variable' ? 'Elegir opciones' : 'Ver producto'}<ShopIcon /></a>
    </div>
  </article>;
}

export function ShopMessage({ title, children, retry }) {
  return <div className="dipe-shop__message" role={retry ? 'alert' : 'status'}><ShopIcon name="bag" /><p className="dipe-shop__message-title">{title}</p>{children}{retry && <button className="dipe-shop-button dipe-shop-button--outline" onClick={retry} type="button">Volver a intentarlo</button>}</div>;
}
