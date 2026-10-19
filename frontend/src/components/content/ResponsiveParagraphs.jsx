import { Children, Fragment, cloneElement, isValidElement } from 'react';
import { ResponsiveTitle as ResponsiveText } from './ResponsiveTitle';

// Reutiliza la medición por texto, conservando los bloques y el marcado inline.
function adaptParagraphs(children) {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.props.dangerouslySetInnerHTML) return child;
    if (child.type === 'p') {
      return cloneElement(child, undefined, <ResponsiveText>{child.props.children}</ResponsiveText>);
    }
    if (child.type === Fragment || (typeof child.type === 'string' && !['address', 'pre', 'code', 'script', 'style'].includes(child.type))) {
      return cloneElement(child, undefined, adaptParagraphs(child.props.children));
    }
    return child;
  });
}

export function ResponsiveParagraphs({ children }) {
  return adaptParagraphs(children);
}
