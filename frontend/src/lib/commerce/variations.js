import { plainText } from '../api';

export function attributeKey(attribute) { return attribute.taxonomy || attribute.name; }

// Las variaciones identifican los atributos con su etiqueta y sus valores con slug.
export function selectedVariation(product, selection) {
  const attributes = (product.attributes || []).filter((attribute) => attribute.has_variations);
  if (!attributes.length || attributes.some((attribute) => !selection[attributeKey(attribute)])) return null;
  return (product.variations || []).find((variation) => attributes.every((attribute) => {
    const value = variation.attributes.find((item) => plainText(item.name).toLowerCase() === plainText(attribute.name).toLowerCase());
    return value && (value.value === null || value.value === '' || value.value === selection[attributeKey(attribute)]);
  })) || null;
}
