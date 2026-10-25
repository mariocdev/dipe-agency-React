import { siteConfig, sitePath } from '../site';

export const commerceConfig = siteConfig.commerce || {};
export const shopUrl = commerceConfig.shopUrl || sitePath('tienda/');
