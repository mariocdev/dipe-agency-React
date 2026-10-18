import { useEffect, useState } from 'react';
import { getProject, plainText, projectBannerImage, projectGalleryMedia } from '../../lib/api';
import { ProjectGallery } from './ProjectGallery';
import './ProjectDetail.css';

function formatDevelopmentDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';

  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function publicUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function youtubeEmbedUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';

    if (host === 'youtu.be') videoId = url.pathname.slice(1).split('/')[0];
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = url.searchParams.get('v') || (url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : '');
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

function ProjectMetadata({ item }) {
  const date = formatDevelopmentDate(item.acf?.dipe_project_development_date);
  const services = item.projectCategoryHierarchy?.roots?.map((category) => category.name).join(' · ');
  const childCategories = item.projectCategoryHierarchy?.children || [];
  const liveUrl = publicUrl(item.acf?.dipe_project_live_url);

  return <div className="dipe-project-detail__summary">
    <dl className="dipe-project-detail__metadata">
      {date && <div>
        <dt>Fecha</dt>
        <dd>{date}</dd>
      </div>}
      {services && <div>
        <dt>Servicio</dt>
        <dd>{services}</dd>
      </div>}
    </dl>
    {(childCategories.length > 0 || liveUrl) && <div className="dipe-project-detail__links">
      {childCategories.length > 0 && <div>
        <p className="dipe-project-detail__links-title">{childCategories.length === 1 ? 'Categoría' : 'Categorías'}</p>
        <ul>
          {childCategories.map((category) => <li key={category.id}>{category.name}</li>)}
        </ul>
      </div>}
      {liveUrl && <a className="dipe-project-detail__live-link" href={liveUrl} target="_blank" rel="noreferrer">Página web {plainText(item.title?.rendered)}</a>}
    </div>}
  </div>;
}

function ProjectMainContent({ item, title }) {
  const videoUrl = youtubeEmbedUrl(item.acf?.dipe_project_youtube_url);

  return <section className="dipe-project-detail__body">
    <div className={`dipe-project-detail__body-section${videoUrl ? '' : ' dipe-project-detail__body-section--full-width'}`}>
      <div className="dipe-project-detail__content" dangerouslySetInnerHTML={{ __html: item.content?.rendered || '' }} />
      {videoUrl && <div className="dipe-project-detail__video">
        <iframe
          src={videoUrl}
          title={`Vídeo de ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>}
    </div>
  </section>;
}

export function ProjectDetail({ slug, onNotFound }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;
    getProject(slug).then((data) => {
      if (active) setState({ loading: false, data, error: null });
    }).catch((error) => {
      if (active) setState({ loading: false, data: null, error });
    });
    return () => { active = false; };
  }, [slug]);

  if (state.loading) return <section className="container py-5"><p className="text-secondary" role="status">Cargando proyecto…</p></section>;
  if (state.error) return <section className="container py-5"><p className="alert alert-danger" role="alert">No se ha podido cargar el contenido. {state.error.message}</p></section>;
  if (!state.data) return onNotFound();

  const item = state.data;
  const bannerImage = projectBannerImage(item);
  const title = plainText(item.title?.rendered);
  const style = bannerImage ? { backgroundImage: `url(${bannerImage.url})` } : undefined;
  const gallery = projectGalleryMedia(item);

  return <article>
    <header className="dipe-project-detail" style={style}>
      <div className="dipe-project-detail__inner">
        <h1>{title}</h1>
        <ProjectMetadata item={item} />
      </div>
    </header>
    <div className="dipe-project-detail__sections">
      <ProjectMainContent item={item} title={title} />
      <ProjectGallery media={gallery} />
    </div>
  </article>;
}
