import { useEffect, useState } from 'react';
import { getPosts, plainText, postCardImage, postPrimaryCategory } from './api';
import { sitePath } from './site';
import './BlogSection.css';

export function formatPostDate(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value).replaceAll(' de ', ' ');
}

export function BlogCard({ post, headingLevel = 3 }) {
  const category = postPrimaryCategory(post);
  const image = postCardImage(post);
  const title = plainText(post.title?.rendered);
  const postUrl = sitePath(post.link);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return <article className="dipe-blog__card">
    <div className="dipe-blog__meta">
      {category ? <a href={sitePath(category.link)}>{category.name}</a> : <span>Blog</span>}
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
    </div>
    <a className="dipe-blog__image-link" href={postUrl} aria-label={`Leer ${title}`}>
      {image && <img src={image.url} alt={image.alt} />}
    </a>
    <Heading><a href={postUrl}>{title}</a></Heading>
  </article>;
}

export function BlogSection() {
  const [state, setState] = useState({ loading: true, data: [], error: null });

  useEffect(() => {
    getPosts().then(
      (data) => setState({ loading: false, data: data || [], error: null }),
      (error) => setState({ loading: false, data: [], error }),
    );
  }, []);

  return <section className="dipe-blog" aria-labelledby="blog-title">
    <div className="dipe-blog__inner">
      <header className="dipe-blog__heading">
        <h2 id="blog-title">Recursos y Blog</h2>
        <p>Tendencias en <strong>desarrollo web, SEO técnico, UX y analítica</strong> para mejorar tu sitio.</p>
      </header>

      {state.loading && <p className="dipe-blog__message" role="status">Cargando recursos…</p>}
      {state.error && <p className="dipe-blog__message" role="alert">No se han podido cargar los recursos.</p>}
      {!state.loading && !state.error && state.data.length === 0 && <p className="dipe-blog__message">Próximamente compartiremos nuevos recursos.</p>}
      {state.data.length > 0 && <div className="dipe-blog__grid">
        {state.data.map((post) => <BlogCard key={post.id} post={post} />)}
      </div>}

      <a className="dipe-blog__all-link" href={sitePath('/blog/')}>Ir al Blog</a>
    </div>
  </section>;
}
