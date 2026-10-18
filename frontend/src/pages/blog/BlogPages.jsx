import { useEffect, useState } from 'react';
import { BlogCard, formatPostDate } from '../../components/blog/BlogSection';
import { getCategory, getPost, getPostArchive, plainText, postCardImage, postPrimaryCategory } from '../../lib/api';
import { sitePath } from '../../lib/site';
import './BlogPages.css';

export function BlogArchive({ categorySlug = null }) {
  const [state, setState] = useState({ loading: true, category: null, posts: [], page: 1, totalPages: 1, error: null, notFound: false, loadingMore: false });

  useEffect(() => {
    let active = true;
    setState({ loading: true, category: null, posts: [], page: 1, totalPages: 1, error: null, notFound: false, loadingMore: false });

    async function load() {
      const category = categorySlug ? await getCategory(categorySlug) : null;
      if (categorySlug && !category) {
        if (active) setState((current) => ({ ...current, loading: false, notFound: true }));
        return;
      }
      const result = await getPostArchive({ categoryId: category?.id });
      if (active) setState({ loading: false, category, posts: result.posts, page: 1, totalPages: result.totalPages, error: null, notFound: false, loadingMore: false });
    }

    load().catch((error) => {
      if (active) setState((current) => ({ ...current, loading: false, error }));
    });
    return () => { active = false; };
  }, [categorySlug]);

  async function loadMore() {
    if (state.loadingMore || state.page >= state.totalPages) return;
    setState((current) => ({ ...current, loadingMore: true, error: null }));
    try {
      const nextPage = state.page + 1;
      const result = await getPostArchive({ page: nextPage, categoryId: state.category?.id });
      setState((current) => ({ ...current, posts: [...current.posts, ...result.posts], page: nextPage, totalPages: result.totalPages, loadingMore: false }));
    } catch (error) {
      setState((current) => ({ ...current, error, loadingMore: false }));
    }
  }

  const title = state.category ? `Categoría: ${state.category.name}` : 'Blog';
  return <section className="dipe-blog dipe-blog-page" aria-labelledby="blog-page-title">
    <div className="dipe-blog__inner">
      {categorySlug && <a className="dipe-blog-page__back" href={sitePath('/blog/')}>← Todas las entradas</a>}
      <h1 id="blog-page-title">{state.notFound ? 'Categoría no encontrada' : title}</h1>
      {state.loading && <p className="dipe-blog__message" role="status">Cargando entradas…</p>}
      {state.error && <p className="dipe-blog__message" role="alert">No se han podido cargar las entradas.</p>}
      {!state.loading && !state.error && !state.notFound && state.posts.length === 0 && <p className="dipe-blog__message">Todavía no hay entradas en esta sección.</p>}
      {state.posts.length > 0 && <div className="dipe-blog__grid">
        {state.posts.map((post) => <BlogCard key={post.id} post={post} headingLevel={2} />)}
      </div>}
      {state.page < state.totalPages && <button className="dipe-blog-page__more" type="button" onClick={loadMore} disabled={state.loadingMore}>
        {state.loadingMore ? 'Cargando…' : 'Cargar más entradas'}
      </button>}
    </div>
  </section>;
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

  if (state.loading) return <section className="dipe-post"><p role="status">Cargando entrada…</p></section>;
  if (state.error) return <section className="dipe-post"><p role="alert">No se ha podido cargar la entrada.</p></section>;
  if (!state.post) return <section className="dipe-post"><h1>Entrada no encontrada</h1></section>;

  const post = state.post;
  const category = postPrimaryCategory(post);
  const image = postCardImage(post);
  return <article className="dipe-post">
    <a className="dipe-post__back" href={sitePath('/blog/')}>← Volver al blog</a>
    <header className="dipe-post__header">
      {category && <a href={sitePath(category.link)}>{category.name}</a>}
      <h1>{plainText(post.title?.rendered)}</h1>
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
    </header>
    {image && <img className="dipe-post__image" src={image.url} alt={image.alt} />}
    <div className="dipe-post__content" dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }} />
  </article>;
}
