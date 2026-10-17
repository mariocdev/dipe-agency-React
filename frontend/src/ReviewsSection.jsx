import { useEffect, useRef, useState } from 'react';
import starIcon from './assets/icons/star-solid.svg';
import userIcon from './assets/icons/user-solid.svg';
import './ReviewsSection.css';

const googleListingUrl = 'https://www.google.com/search?sca_esv=eba2d1872b0abb42&sxsrf=APpeQnt3Y63wy4u-oVBfFPQqNlwYn5g4EA:1792258108036&q=DIPE+Desarrollo+Web+Salamanca&si=APenkKnzv9m99ToiohAuzpadUwbOz34nZJ3j2Ukmo5XOUYWAppOXMYerDfb11eCi1h0P1HG2lcxM_fF8RQut2YLZPvIZtfNotAw6PxrBGMH1DqxE7-oc5UA%3D&uds=AJ5uw19tc558UO76uNE3i9QYuudM-qh4saGTOlJy-RCH_q0ilYgaq9tVB_UrcskXs5oF__ytjJkfcVHgsBsyA8j_8lRQut2YLZPvIZtfNotAw6PxrBGMH1DqxE7-oc5UA%3D&sa=X&ved=2ahUKEwjaz__eycGXAxWGnCsGHWVbEIcQ3PALegQIOBAF&biw=1875&bih=925&dpr=1';

const reviews = [
  {
    id: 'santiago-valle',
    sourceReviewId: 'santiago-valle',
    author: 'Santiago Valle',
    rating: 5,
    text: 'Hemos trabajado en diferentes proyectos con ellos y no podemos estar más contentos. Son un equipazo: súper profesionales, cercanos, resolutivos… Enhorabuena a Ana y a todo su equipo. 100% recomendables',
    sourceUrl: googleListingUrl,
    isRepeat: false,
  },
  {
    id: 'juan-cristobal-petacas',
    sourceReviewId: 'juan-cristobal-petacas',
    author: 'Juan Cristobal Petacas',
    rating: 5,
    text: 'Una de las mejores agencias de diseño web y marketing de Salamanca, por no decir la mejor. Trato estupendo, equipo de trabajo muy profesional y buenos resultados garantizados. 100% recomendable.',
    sourceUrl: googleListingUrl,
    isRepeat: false,
  },
  {
    id: 'santiago-valle-repeat',
    sourceReviewId: 'santiago-valle',
    author: 'Santiago Valle',
    rating: 5,
    text: 'Hemos trabajado en diferentes proyectos con ellos y no podemos estar más contentos. Son un equipazo: súper profesionales, cercanos, resolutivos… Enhorabuena a Ana y a todo su equipo. 100% recomendables',
    sourceUrl: googleListingUrl,
    isRepeat: true,
  },
  {
    id: 'juan-cristobal-petacas-repeat',
    sourceReviewId: 'juan-cristobal-petacas',
    author: 'Juan Cristobal Petacas',
    rating: 5,
    text: 'Una de las mejores agencias de diseño web y marketing de Salamanca, por no decir la mejor. Trato estupendo, equipo de trabajo muy profesional y buenos resultados garantizados. 100% recomendable.',
    sourceUrl: googleListingUrl,
    isRepeat: true,
  },
].filter((review) => review.rating >= 4 && review.text.trim().length > 0);

function Stars({ rating }) {
  return <span className="dipe-reviews__stars" aria-label={`${rating} de 5 estrellas`}>
    {Array.from({ length: rating }, (_, index) => <img src={starIcon} alt="" aria-hidden="true" key={index} />)}
  </span>;
}

export function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef(null);
  const activeReview = reviews[activeIndex];

  const selectReview = (index) => {
    setActiveIndex(index);
    setDragOffset(0);
  };

  const showPreviousReview = () => selectReview((activeIndex - 1 + reviews.length) % reviews.length);
  const showNextReview = () => selectReview((activeIndex + 1) % reviews.length);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || reviews.length < 2) return undefined;

    const interval = window.setInterval(showNextReview, 6000);
    return () => window.clearInterval(interval);
  }, [activeIndex, isPaused, prefersReducedMotion]);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragStartRef.current = event.clientX;
    setIsDragging(true);
    setIsPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragStartRef.current === null) return;
    setDragOffset(event.clientX - dragStartRef.current);
  };

  const handlePointerEnd = (event) => {
    if (dragStartRef.current === null) return;
    const distance = event.clientX - dragStartRef.current;
    dragStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);

    if (distance <= -50) showNextReview();
    else if (distance >= 50) showPreviousReview();
    setIsPaused(false);
  };

  if (!activeReview) return null;

  return <section className="dipe-reviews" aria-labelledby="reviews-title">
    <div className="dipe-reviews__inner">
      <div className="dipe-reviews__summary">
        <header className="dipe-reviews__heading">
          <h2 id="reviews-title">Opiniones reales</h2>
          <p>Dipe desarrollo web</p>
          <address>Jesús Arambarri, 33, 37003 Salamanca</address>
        </header>

        <div className="dipe-reviews__rating" aria-label="Valoración estática facilitada por el usuario: 5,0 de 5, basada en 8 reseñas">
          <div><strong>5,0</strong><Stars rating={5} /><span>8 reseñas</span></div>
          <a href={googleListingUrl} target="_blank" rel="noreferrer">Reseñas en Google <span className="visually-hidden">(dato no sincronizado)</span></a>
        </div>
      </div>

      <div
        className="dipe-reviews__carousel"
        aria-roledescription="carrusel"
        aria-label="Opiniones de clientes"
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="dipe-reviews__viewport"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        >
          <div className={`dipe-reviews__track${isDragging ? ' is-dragging' : ''}`} style={{ transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))` }}>
            {reviews.map((review, index) => <article
              aria-hidden={index !== activeIndex}
              aria-label={`Reseña ${index + 1} de ${reviews.length}`}
              aria-roledescription="diapositiva"
              className="dipe-reviews__card"
              key={review.id}
              role="group"
            >
              <header className="dipe-reviews__card-header">
                <span className="dipe-reviews__avatar" aria-hidden="true"><img src={userIcon} alt="" /></span>
                <div>
                  <cite>{review.author}</cite>
                  <Stars rating={review.rating} />
                </div>
              </header>
              <blockquote>{review.text}</blockquote>
              {review.isRepeat && <p className="dipe-reviews__repeat-note">Reseña repetida para esta demostración</p>}
            </article>)}
          </div>
        </div>

        <div className="dipe-reviews__indicators" aria-label="Seleccionar reseña">
          {reviews.map((review, index) => <button
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={`Mostrar reseña ${index + 1} de ${reviews.length}${review.isRepeat ? ', repetida para esta demostración' : ''}`}
            className={index === activeIndex ? 'is-active' : ''}
            key={review.id}
            onClick={() => selectReview(index)}
            type="button"
          />)}
        </div>
      </div>
    </div>
  </section>;
}
