import { useEffect, useState } from 'react';
import { formatPostDate } from '../../components/blog/BlogSection';
import { RelatedServices } from '../../components/services/RelatedServices';
import { getPostCategories, getPosts, plainText, postCardImage, postPrimaryCategory } from '../../lib/api';
import { sitePath } from '../../lib/site';

export function BlogPostSidebar({ post }) {
  const [state, setState] = useState({ loading: true, posts: [], categories: [], postsError: false, categoriesError: false });

  useEffect(() => {
    let active = true;
    setState({ loading: true, posts: [], categories: [], postsError: false, categoriesError: false });
    Promise.allSettled([getPosts(3, post.id), getPostCategories()]).then(([recent, categories]) => {
      if (!active) return;
      setState({
        loading: false,
        posts: recent.status === 'fulfilled' ? recent.value || [] : [],
        categories: categories.status === 'fulfilled' ? categories.value : [],
        postsError: recent.status === 'rejected',
        categoriesError: categories.status === 'rejected',
      });
    });
    return () => { active = false; };
  }, [post.id]);

  return <aside className="dipe-post-sidebar" aria-label="Recursos del blog">
    <div className="dipe-post-sidebar__resources">
      <form className="dipe-post-sidebar__search" role="search" action={sitePath('/')} method="get" onSubmit={(event) => {
        if (!new FormData(event.currentTarget).get('s')?.trim()) event.preventDefault();
      }}>
        <label className="visually-hidden" htmlFor={`post-search-${post.id}`}>Buscar en el blog</label>
        <input id={`post-search-${post.id}`} name="s" type="search" placeholder="Buscar…" required />
        <input type="hidden" name="post_type" value="post" />
        <button type="submit" aria-label="Buscar en el blog">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
      <section aria-labelledby={`recent-posts-${post.id}`}>
        <h2 id={`recent-posts-${post.id}`}>Últimas noticias</h2>
        {state.loading && <p className="visually-hidden" role="status">Cargando recursos del blog…</p>}
        {state.postsError && <p role="status">No se han podido cargar las últimas noticias.</p>}
        {!state.loading && !state.postsError && state.posts.length === 0 && <p>No hay otras noticias publicadas.</p>}
        <ul className="dipe-post-sidebar__recent">{state.posts.map((item) => {
          const image = postCardImage(item);
          const category = postPrimaryCategory(item);
          const title = plainText(item.title?.rendered);
          return <li key={item.id}>
            <a className="dipe-post-sidebar__thumbnail" href={sitePath(item.link)} aria-label={`Leer ${title}`}>
              {image && <img src={image.url} alt={image.alt} loading="lazy" decoding="async" />}
            </a>
            <div>
              {category && <a className="dipe-post-sidebar__category" href={sitePath(category.link)}>{plainText(category.name)}</a>}
              <time dateTime={item.date}>{formatPostDate(item.date)}</time>
              <h3><a href={sitePath(item.link)}>{title}</a></h3>
            </div>
          </li>;
        })}</ul>
      </section>
      <section aria-labelledby={`post-categories-${post.id}`}>
        <h2 id={`post-categories-${post.id}`}>Categorías</h2>
        {state.categoriesError && <p role="status">No se han podido cargar las categorías.</p>}
        <ul className="dipe-post-sidebar__categories">{state.categories.map((category) => <li key={category.id}>
          <a href={sitePath(category.link)}>{plainText(category.name)}</a>
        </li>)}</ul>
      </section>
    </div>
    <RelatedServices services={post.dipe_related_services} />
  </aside>;
}
