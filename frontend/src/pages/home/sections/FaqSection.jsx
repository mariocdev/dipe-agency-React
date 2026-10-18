import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import chevronIcon from '../../../assets/icons/chevron-down-solid-full.svg';
import { homeMedia } from '../homeMedia';
import './FaqSection.css';

const faqs = [
  {
    id: 'webs-rapidas-o-bonitas',
    question: '¿Hacéis webs rápidas o “bonitas”?',
    answerText: 'Ambas. Si carga lenta, no es bonita. Optimizamos LCP/CLS/INP para que Google y tus usuarios sonrían.',
    answer: <>Ambas. Si carga lenta, no es bonita. Optimizamos <strong>LCP/CLS/INP</strong> para que Google y tus usuarios sonrían.</>,
  },
  {
    id: 'plazos-desarrollo-web',
    question: '¿En cuánto tiempo tendré mi desarrollo web?',
    answerText: 'Depende del alcance. Corporativa: 6–10 semanas; ecommerce o a medida: 10–16 semanas. Preferimos prometer bien y cumplir mejor.',
    answer: <>Depende del alcance. Corporativa: <strong>6–10 semanas</strong>; ecommerce o a medida: <strong>10–16 semanas</strong>. Preferimos prometer bien y cumplir mejor.</>,
  },
  {
    id: 'migracion-seo',
    question: '¿Podéis migrar mi web sin perder SEO?',
    answerText: 'Sí: auditoría, plan de redirecciones, pruebas en staging y monitorización post-lanzamiento. El tráfico es sagrado.',
    answer: <>Sí: auditoría, <strong>plan de redirecciones</strong>, <strong>pruebas en staging</strong> y monitorización post-lanzamiento. El tráfico es sagrado.</>,
  },
  {
    id: 'equipo-interno',
    question: '¿Trabajáis con nuestro equipo interno?',
    answerText: 'Nos encanta. Compartimos repos, backlog y KPIs. Equipo extendido, sin dramas.',
    answer: <>Nos encanta. Compartimos repos, backlog y KPIs. Equipo extendido, sin dramas.</>,
  },
  {
    id: 'marketing',
    question: '¿Lleváis también el marketing?',
    answerText: 'Claro. SEO, SEM, redes e inbound. La web sin marketing es como un cohete sin combustible.',
    answer: <>Claro. <strong>SEO, SEM, redes e inbound.</strong> La web sin marketing es como un cohete sin combustible.</>,
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answerText }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answerText,
    },
  })),
};

export function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState(null);
  const answerRefs = useRef({});

  useLayoutEffect(() => {
    for (const faq of faqs) {
      const answer = answerRefs.current[faq.id];
      if (!answer) continue;
      answer.style.height = openFaqId === faq.id ? `${answer.firstElementChild.scrollHeight}px` : '0px';
    }
  }, [openFaqId]);

  useEffect(() => {
    if (!openFaqId) return undefined;
    const updateHeight = () => {
      const answer = answerRefs.current[openFaqId];
      if (answer) answer.style.height = `${answer.firstElementChild.scrollHeight}px`;
    };
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [openFaqId]);

  const toggleFaq = (faqId) => setOpenFaqId((currentFaqId) => currentFaqId === faqId ? null : faqId);

  const handleFaqKeyDown = (event, faqId) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleFaq(faqId);
  };

  return <section
    className="dipe-faqs"
    aria-labelledby="faqs-title"
    style={{ backgroundImage: `url("${homeMedia('BG-FAQS.png')}")` }}
  >
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <div className="dipe-faqs__inner">
      <h2 id="faqs-title">FAQs sobre nuestra Agencia de desarrollo web</h2>
      <div className="dipe-faqs__list">
        {faqs.map((faq) => <div
          aria-controls={`faq-answer-${faq.id}`}
          aria-expanded={openFaqId === faq.id}
          className={`dipe-faqs__item${openFaqId === faq.id ? ' is-open' : ''}`}
          key={faq.id}
          onClick={(event) => {
            event.preventDefault();
            toggleFaq(faq.id);
          }}
          onKeyDown={(event) => handleFaqKeyDown(event, faq.id)}
          role="button"
          tabIndex={0}
        >
          <div className="dipe-faqs__question">
            <h3>{faq.question}</h3>
            <img src={chevronIcon} alt="" aria-hidden="true" />
          </div>
          <div className="dipe-faqs__answer" id={`faq-answer-${faq.id}`} aria-hidden={openFaqId !== faq.id} role="region" ref={(node) => { answerRefs.current[faq.id] = node; }}>
            <div className="dipe-faqs__answer-inner">
              <p>{faq.answer}</p>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </section>;
}
