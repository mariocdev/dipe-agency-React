import { useEffect, useState } from 'react';
import { getPostNavigation, plainText } from '../../lib/api';
import { sitePath } from '../../lib/site';
import { blogMedia } from './blogMedia';

export function BlogPostFooter({ post }) {
  const [navigation, setNavigation] = useState(null);
  const [copyState, setCopyState] = useState('');
  const url = encodeURIComponent(post.link);
  const postTitle = plainText(post.title?.rendered);
  const title = encodeURIComponent(postTitle);
  const icons = blogMedia.shareIcons;

  useEffect(() => {
    let active = true;
    setNavigation(null);
    getPostNavigation(post.id).then(
      (result) => { if (active) setNavigation(result); },
      () => { /* La entrada sigue disponible si falla la navegación secundaria. */ },
    );
    return () => { active = false; };
  }, [post.id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(post.link);
      setCopyState('Enlace copiado.');
    } catch {
      setCopyState('No se ha podido copiar el enlace. Puedes copiar la dirección del navegador.');
    }
  }

  async function shareFromDevice() {
    if (typeof navigator.share !== 'function') {
      await copyLink();
      return;
    }
    setCopyState('');
    try {
      await navigator.share({ title: postTitle, url: post.link });
    } catch (error) {
      if (error.name !== 'AbortError') await copyLink();
    }
  }

  return <footer className="dipe-post__footer">
    <div className="dipe-post__share">
      <strong>Compartir:</strong>
      <a className="dipe-post__share-icon" href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook" title="Compartir en Facebook">
        <span className="dipe-post__share-glyph" style={{ '--dipe-share-icon': `url("${icons.facebook}")` }} aria-hidden="true" />
      </a>
      <a className="dipe-post__share-icon" href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn" title="Compartir en LinkedIn">
        <span className="dipe-post__share-glyph" style={{ '--dipe-share-icon': `url("${icons.linkedin}")` }} aria-hidden="true" />
      </a>
      <button className="dipe-post__share-icon" type="button" onClick={shareFromDevice} aria-label="Compartir con el dispositivo: Instagram si está disponible" title="Compartir con el dispositivo: Instagram si está disponible">
        <span className="dipe-post__share-glyph" style={{ '--dipe-share-icon': `url("${icons.instagram}")` }} aria-hidden="true" />
      </button>
      <a className="dipe-post__share-icon" href={`https://wa.me/?text=${title}%20${url}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en WhatsApp" title="Compartir en WhatsApp">
        <span className="dipe-post__share-glyph" style={{ '--dipe-share-icon': `url("${icons.whatsapp}")` }} aria-hidden="true" />
      </a>
      <button className="dipe-post__share-icon" type="button" onClick={copyLink} aria-label="Copiar enlace" title="Copiar enlace">
        <span className="dipe-post__share-glyph" style={{ '--dipe-share-icon': `url("${icons.copy}")` }} aria-hidden="true" />
      </button>
      <span role="status">{copyState}</span>
    </div>
    {(navigation?.previous || navigation?.next) && <nav className="dipe-post__navigation" aria-label="Navegación entre entradas">
      {navigation.previous && <a href={sitePath(navigation.previous.url)}>
        <strong>Anterior</strong><span>{plainText(navigation.previous.title)}</span>
      </a>}
      {navigation.next && <a className="dipe-post__next" href={sitePath(navigation.next.url)}>
        <strong>Siguiente</strong><span>{plainText(navigation.next.title)}</span>
      </a>}
    </nav>}
  </footer>;
}
