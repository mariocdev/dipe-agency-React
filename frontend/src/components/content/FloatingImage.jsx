import { useState } from 'react';

const referenceViewportWidth = 1920;

export function FloatingImage({ src }) {
  const [imageSize, setImageSize] = useState(null);
  const naturalWidth = imageSize?.src === src ? imageSize.width : 0;

  return <img
    src={src}
    alt=""
    style={naturalWidth ? {
      // 100 % del tamaño original en 1920 px; reducción continua por debajo.
      width: `min(${naturalWidth}px, ${(naturalWidth / referenceViewportWidth) * 100}vw)`,
    } : undefined}
    onLoad={(event) => setImageSize({ src, width: event.currentTarget.naturalWidth })}
  />;
}
