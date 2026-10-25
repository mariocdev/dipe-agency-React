import { EditorialContent } from '../../components/content/EditorialContent';
import { FitText } from '../../components/content/FitText';
import { legalMedia } from './legalMedia';
import { legalPages } from './legalContent';
import './LegalPage.css';

export function LegalPage({ slug }) {
  const page = legalPages[slug];
  return <div className="dipe-legal">
    <header className="dipe-legal__hero" style={legalMedia.heroImage ? { backgroundImage: `url("${legalMedia.heroImage}")` } : undefined}>
      <div className="dipe-legal__container">
        <FitText as="h1">{page.title}</FitText>
      </div>
    </header>
    <article className="dipe-legal__body dipe-legal__container" aria-label={page.title}>
      <EditorialContent html={page.html} className="dipe-legal__content" />
    </article>
  </div>;
}
