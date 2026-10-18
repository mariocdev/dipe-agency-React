import { plainText, projectArchiveCardImage, projectPrimaryCategory } from '../../lib/api';
import { sitePath } from '../../lib/site';
import './ProjectCard.css';

export function ProjectCard({ item }) {
  const image = projectArchiveCardImage(item);
  const category = projectPrimaryCategory(item);

  return <article className="dipe-projects-archive__item">
    <a className="dipe-projects-archive__project-link" href={sitePath(item.link)}>
      {image && <img className="dipe-projects-archive__image" src={image.url} alt={image.alt} />}
    </a>
    <div className="dipe-projects-archive__card-content">
      {category && <a className="dipe-projects-archive__category" href={sitePath(category.link)}>{category.name}</a>}
      <h3><a href={sitePath(item.link)}>{plainText(item.title?.rendered)}</a></h3>
    </div>
  </article>;
}
