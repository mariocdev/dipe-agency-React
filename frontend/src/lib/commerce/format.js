import { siteConfig } from '../site';
import { plainText } from '../api';
import { commerceConfig } from './config';

export function formatShopMoney(value, prices = {}) {
  const precision = Number(prices.currency_minor_unit ?? commerceConfig.priceDecimals ?? 2);
  const amount = Number(value) / 10 ** precision;
  if (!Number.isFinite(amount)) return '';
  try {
    return new Intl.NumberFormat((siteConfig.language || 'es-ES').replace('_', '-'), { style: 'currency', currency: prices.currency_code || commerceConfig.currency || 'EUR', minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
  } catch {
    return `${amount.toFixed(precision)} ${plainText(prices.currency_symbol || prices.currency_code || '')}`;
  }
}
