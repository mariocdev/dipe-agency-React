// Entrada pública estable: cada responsabilidad vive en su módulo, con una sola sesión Store API.
export { commerceConfig, shopUrl } from './commerce/config';
export { shopQueryKeys, readShopFilters, shopFilterUrl, productQuery } from './commerce/filters';
export { storeRequest, shopFeatureRequest, getShopCart, changeShopCart } from './commerce/storeApi';
export { getShopFilters, getShopProduct } from './commerce/catalog';
export { formatShopMoney } from './commerce/format';
export { attributeKey, selectedVariation } from './commerce/variations';
