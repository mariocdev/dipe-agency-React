import { useEffect, useId, useState } from 'react';
import { plainText } from '../../lib/api';
import { shopUrl, shopFilterUrl, formatShopMoney, commerceConfig } from '../../lib/commerce';
import { ShopIcon } from './ShopShared';

const colorValues = { naranja: '#ff8600', negro: '#262626', blanco: '#fff', natural: '#d9c9ad' };

function FilterGroup({ label, expanded, onToggle, panelId, children }) {
  return <details className="dipe-shop-sidebar__section" open={expanded}>
    <summary aria-controls={panelId} aria-expanded={expanded} onClick={(event) => { event.preventDefault(); onToggle(); }}><span className="dipe-shop-sidebar__section-title">{label}</span><span className="dipe-shop-sidebar__indicator" aria-hidden="true">{expanded ? '−' : '+'}</span></summary>
    <div className="dipe-shop-sidebar__group-content" id={panelId}>{children}</div>
  </details>;
}

export function ShopArchiveFilters({ filters, metadata, context, onChange, onReset }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [defaultExpanded, setDefaultExpanded] = useState(false);
  const [groups, setGroups] = useState({ categories: true });
  const [price, setPrice] = useState({ min: filters.min, max: filters.max });
  useEffect(() => setPrice({ min: filters.min, max: filters.max }), [filters.min, filters.max]);
  const range = metadata.priceRange;
  const precision = Number(range?.currency_minor_unit ?? commerceConfig.priceDecimals ?? 2);
  const factor = 10 ** precision;
  const toMinor = (value) => Math.round(Number(value) * factor);
  const available = range?.min_price != null && range?.max_price != null
    && Number.isFinite(Number(range.min_price)) && Number.isFinite(Number(range.max_price));
  const selectedBounds = [filters.min, filters.max].filter((value) => value !== '').map(toMinor);
  const minimum = available ? Math.min(Number(range.min_price), ...selectedBounds) : 0;
  const maximum = available ? Math.max(Number(range.max_price), ...selectedBounds) : 0;
  const lower = Math.max(minimum, Math.min(maximum, price.min === '' ? minimum : toMinor(price.min)));
  const upper = Math.max(lower, Math.min(maximum, price.max === '' ? maximum : toMinor(price.max)));
  const asPrice = (value) => (value / factor).toFixed(precision);
  const percent = (value) => maximum > minimum ? (value - minimum) / (maximum - minimum) * 100 : 0;
  function applyPrice(event) {
    event.preventDefault();
    if (!available) return;
    onChange({
      min: lower <= Number(range.min_price) ? '' : asPrice(lower),
      max: upper >= Number(range.max_price) ? '' : asPrice(upper),
    });
  }
  function toggle(name, value) {
    onChange({ [name]: filters[name].includes(value) ? filters[name].filter((item) => item !== value) : [...filters[name], value] });
  }
  const expanded = (key) => groups[key] ?? defaultExpanded;
  const anyExpanded = ['categories', 'price', 'availability', ...metadata.attributes.map((attribute) => attribute.taxonomy)].some(expanded);
  const toggleGroup = (key) => setGroups((current) => ({ ...current, [key]: !(current[key] ?? defaultExpanded) }));
  function toggleAll() { setDefaultExpanded(!anyExpanded); setGroups({}); }
  function clear() { setPrice({ min: '', max: '' }); onReset(); }
  return <aside className={`dipe-shop-sidebar${open ? ' is-open' : ''}`} aria-label="Filtros de productos">
    <button className="dipe-shop-sidebar__toggle" type="button" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((value) => !value)}><ShopIcon name="filter" />Filtrar productos<span>{open ? '−' : '+'}</span></button>
    <div className="dipe-shop-sidebar__panel" id={`${id}-panel`}>
      <div className="dipe-shop-sidebar__heading"><button type="button" className="dipe-shop-sidebar__title" aria-expanded={anyExpanded} aria-controls={`${id}-groups`} onClick={toggleAll}><span>Encuentra el tuyo</span><span className="dipe-shop-sidebar__indicator" aria-hidden="true">{anyExpanded ? '−' : '+'}</span></button><button type="button" className="dipe-shop__text-button" onClick={clear}>Limpiar</button></div>
      <div id={`${id}-groups`}>
      <FilterGroup label="Categorías" expanded={expanded('categories')} onToggle={() => toggleGroup('categories')} panelId={`${id}-categories`}>
        <ul className="dipe-shop-sidebar__categories">
          <li><a href={shopUrl} aria-current={context.type === 'shop' ? 'page' : undefined}>Todos los productos<ShopIcon /></a></li>
          {metadata.categories.map((category) => <li key={category.id}><a href={shopFilterUrl({ ...filters, page: 1 }, category.permalink).href} aria-current={context.type === 'category' && context.id === category.id ? 'page' : undefined}><span>{plainText(category.name)}</span><span>{category.count}</span></a></li>)}
        </ul>
        {metadata.loading && <p className="dipe-shop__muted" role="status">Cargando categorías…</p>}
      </FilterGroup>
      <FilterGroup label="Precio" expanded={expanded('price')} onToggle={() => toggleGroup('price')} panelId={`${id}-price`}>
      <form className="dipe-shop-sidebar__price-form" onSubmit={applyPrice}>
        {available ? <fieldset><legend className="visually-hidden">Rango de precio</legend>
          <div className="dipe-shop-sidebar__price-values">
            <span>Desde <output htmlFor={id + '-min'}>{formatShopMoney(lower, range)}</output></span>
            <span>Hasta <output htmlFor={id + '-max'}>{formatShopMoney(upper, range)}</output></span>
          </div>
          <div className="dipe-shop-sidebar__range" style={{ '--range-start': percent(lower) + '%', '--range-end': percent(upper) + '%' }}>
            <div className="dipe-shop-sidebar__range-track" aria-hidden="true" />
            <input id={id + '-min'} className={lower === maximum ? 'is-front' : undefined} type="range" min={minimum} max={maximum} step="1" value={lower} disabled={minimum === maximum} aria-label="Precio mínimo" aria-valuemax={upper} aria-valuetext={formatShopMoney(lower, range)} onChange={(event) => setPrice((value) => ({ ...value, min: asPrice(Math.min(Number(event.target.value), upper)) }))} />
            <input id={id + '-max'} type="range" min={minimum} max={maximum} step="1" value={upper} disabled={minimum === maximum} aria-label="Precio máximo" aria-valuemin={lower} aria-valuetext={formatShopMoney(upper, range)} onChange={(event) => setPrice((value) => ({ ...value, max: asPrice(Math.max(Number(event.target.value), lower)) }))} />
          </div>
        </fieldset> : <p className="dipe-shop__muted" role="status">{metadata.loading ? 'Cargando rango de precios…' : 'El rango de precios no está disponible ahora.'}</p>}
        <button className="dipe-shop-button dipe-shop-button--outline" type="submit" disabled={!available || minimum === maximum}>Aplicar precio<ShopIcon /></button>
      </form>
      </FilterGroup>
      {metadata.attributes.map((attribute) => {
        const key = attribute.taxonomy === 'pa_color' ? 'colors' : 'sizes';
        return <FilterGroup key={attribute.id} label={plainText(attribute.name)} expanded={expanded(attribute.taxonomy)} onToggle={() => toggleGroup(attribute.taxonomy)} panelId={`${id}-${attribute.id}`}><fieldset className="dipe-shop-sidebar__choices"><legend className="visually-hidden">{plainText(attribute.name)}</legend>
          <div className={key === 'sizes' ? 'dipe-shop-sidebar__sizes' : 'dipe-shop-sidebar__checks'}>
            {attribute.terms.map((term) => <label key={term.id} className={key === 'sizes' ? 'dipe-shop-sidebar__size' : undefined}>
              <input type="checkbox" checked={filters[key].includes(term.slug)} onChange={() => toggle(key, term.slug)} />
              {key === 'colors' && colorValues[term.slug] && <span className="dipe-shop__swatch" style={{ '--swatch': colorValues[term.slug] }} aria-hidden="true" />}
              <span>{plainText(term.name)}</span>
            </label>)}
          </div>
        </fieldset></FilterGroup>;
      })}
      <FilterGroup label="Disponibilidad" expanded={expanded('availability')} onToggle={() => toggleGroup('availability')} panelId={`${id}-availability`}><fieldset className="dipe-shop-sidebar__choices"><legend className="visually-hidden">Disponibilidad</legend><label className="dipe-shop-sidebar__check"><input type="checkbox" checked={filters.stock} onChange={(event) => onChange({ stock: event.target.checked })} /><span>Solo productos disponibles</span></label></fieldset></FilterGroup>
      </div>
      {metadata.partial && <p className="dipe-shop__muted" role="status">Algunos filtros no están disponibles ahora. Puedes seguir explorando los productos.</p>}
    </div>
  </aside>;
}
