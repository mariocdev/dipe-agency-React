import { useEffect, useState } from 'react';
import { formatPostDate } from '../../components/blog/BlogSection';
import { EditorialContent } from '../../components/content/EditorialContent';
import { getPost, plainText, postBannerMedia, postPrimaryCategory } from '../../lib/api';
import { sitePath } from '../../lib/site';
import { BlogPostSidebar } from './BlogPostSidebar';
import { BlogPostFooter } from './BlogPostFooter';
import './BlogPages.css';

function BlogPostHero({ post }) {
  const title = plainText(post.title?.rendered);
  const subtitle = plainText(post.acf?.dipe_post_subtitle);
  const category = postPrimaryCategory(post);
  const author = post._embedded?.author?.[0]?.name;
  const media = postBannerMedia(post);
  const isVideo = media && (media.mimeType.startsWith('video/') || /\.(mp4|webm)(?:\?|$)/i.test(media.url));

  return <header className="dipe-post__hero">
    <div className="dipe-post__hero-inner dipe-post__container">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="dipe-post__subtitle">{subtitle}</p>}
        <dl className="dipe-post__metadata">
          <div><dt>Fecha</dt><dd><time dateTime={post.date}>{formatPostDate(post.date)}</time></dd></div>
          {category && <div><dt>Categoría</dt><dd><a href={sitePath(category.link)}>{plainText(category.name)}</a></dd></div>}
          {author && <div><dt>Autor</dt><dd>{plainText(author)}</dd></div>}
        </dl>
      </div>
      <div className="dipe-post__banner">
        {media && (isVideo
          ? <video src={media.url} controls playsInline preload="metadata" aria-label={`Vídeo de ${title}`} />
          : <img src={media.url} alt={media.alt} fetchPriority="high" />)}
      </div>
    </div>
  </header>;
}

export function BlogPost({ slug }) {
  const [state, setState] = useState({ loading: true, post: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, post: null, error: null });
    getPost(slug).then(
      (post) => { if (active) setState({ loading: false, post, error: null }); },
      (error) => { if (active) setState({ loading: false, post: null, error }); },
    );
    return () => { active = false; };
  }, [slug]);

  if (state.loading) return <section className="dipe-post__container dipe-post__status"><p role="status">Cargando entrada…</p></section>;
  if (state.error) return <section className="dipe-post__container dipe-post__status"><p role="alert">No se ha podido cargar la entrada.</p></section>;
  if (!state.post) return <section className="dipe-post__container dipe-post__status"><h1>Entrada no encontrada</h1></section>;

  return <article className="dipe-post">
    <BlogPostHero post={state.post} />
    <div className="dipe-post__container">
      <div className="dipe-post__body">
        <div className="dipe-post__main"><EditorialContent withIndex html={state.post.content?.rendered || ''} /></div>
        <BlogPostSidebar post={state.post} />
      </div>
      <BlogPostFooter post={state.post} />
    </div>
  </article>;
}
