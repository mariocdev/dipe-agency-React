import { useEffect, useId, useState } from 'react';
import { commerceConfig, shopFeatureRequest } from '../../lib/commerce';

export function ProductQuestions({ productId, onCountChange }) {
  const id = useId();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, items: [], pages: 1, error: null });
  const [question, setQuestion] = useState('');
  const [submission, setSubmission] = useState({ pending: false, error: null, message: '' });
  const [privacy, setPrivacy] = useState(false);
  const [website, setWebsite] = useState('');
  const [securityRevision, setSecurityRevision] = useState(0);
  const [security, setSecurity] = useState({ loading: true, token: '', privacyUrl: '', guest: !commerceConfig.restNonce, moderated: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    setSecurity((current) => ({ ...current, loading: true, token: '', error: '' }));
    shopFeatureRequest(`products/${productId}/question-form`, { signal: controller.signal }).then(
      (result) => { if (!controller.signal.aborted) setSecurity({ loading: false, token: result.token, privacyUrl: result.privacy_url, guest: result.guest, moderated: result.moderated, error: '' }); },
      (error) => { if (!controller.signal.aborted) setSecurity((current) => ({ ...current, loading: false, error: error.message })); },
    );
    return () => controller.abort();
  }, [productId, securityRevision]);
  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));
    shopFeatureRequest(`products/${productId}/questions`, { params: { page: String(page) }, signal: controller.signal }).then(
      (result) => { if (!controller.signal.aborted) { setState({ loading: false, items: result.items, pages: result.pages, error: null }); onCountChange(result.total); } },
      (error) => { if (!controller.signal.aborted) setState((current) => ({ ...current, loading: false, error: error.message })); },
    );
    return () => controller.abort();
  }, [productId, page, revision, onCountChange]);

  async function submit(event) {
    event.preventDefault();
    if (submission.pending || !privacy || !security.token || security.loading) return;
    setSubmission({ pending: true, error: null, message: '' });
    try {
      const result = await shopFeatureRequest(`products/${productId}/questions`, { method: 'POST', body: { question: question.trim(), privacy, website, form_token: security.token } });
      setQuestion('');
      setPrivacy(false);
      setWebsite('');
      setSubmission({ pending: false, error: null, message: result.message });
      if (result.published) { setPage(1); setRevision((value) => value + 1); }
    } catch (error) { setSubmission({ pending: false, error: error.message, message: '' }); }
    finally { setSecurityRevision((value) => value + 1); }
  }

  return <div className="dipe-product-questions">
    {state.loading && <p role="status">Cargando preguntas…</p>}
    {state.error && <div className="dipe-shop__error" role="alert"><p>No se han podido cargar las preguntas.</p><button type="button" className="dipe-shop__text-button" onClick={() => setRevision((value) => value + 1)}>Volver a intentarlo</button></div>}
    {!state.loading && !state.error && !state.items.length && <p>Todavía no hay preguntas publicadas. ¿Qué te gustaría saber de este producto?</p>}
    {!state.error && state.items.map((item) => <article className="dipe-product-questions__item" key={item.id}><p className="dipe-product-questions__author">{item.author}<time dateTime={item.date}>{new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(item.date))}</time></p><p className="dipe-product-questions__text">{item.question}</p>{item.answer ? <div className="dipe-product-questions__answer"><strong>Respuesta de Dipe</strong><p>{item.answer}</p></div> : <p className="dipe-shop__muted">Pendiente de respuesta de la tienda.</p>}</article>)}
    {state.pages > 1 && <nav className="dipe-product-questions__pagination" aria-label="Páginas de preguntas"><button type="button" disabled={page <= 1 || state.loading} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>{page} / {state.pages}</span><button type="button" disabled={page >= state.pages || state.loading} onClick={() => setPage((value) => value + 1)}>Siguiente</button></nav>}
    <form className="dipe-product-questions__form" onSubmit={submit}>
      <p>{security.guest ? 'Puedes preguntar como invitado. Tu pregunta se mostrará como «Invitado» cuando la tienda la apruebe.' : security.moderated ? 'Tu pregunta se mostrará con tu nombre de perfil cuando la tienda la apruebe.' : 'Tu pregunta se publicará al enviarla y mostrará tu nombre de perfil, aunque aún no tenga respuesta.'}</p>
      <label htmlFor={`${id}-question`}>¿Qué te gustaría saber?</label><textarea id={`${id}-question`} required minLength={10} maxLength={2000} rows={4} value={question} disabled={submission.pending} onChange={(event) => setQuestion(event.target.value)} />
      {security.privacyUrl && <p className="dipe-shop-form-privacy"><label htmlFor={`${id}-privacy`}><input id={`${id}-privacy`} type="checkbox" required checked={privacy} disabled={submission.pending} onChange={(event) => setPrivacy(event.target.checked)} /><span>He leído y acepto la <a href={security.privacyUrl} target="_blank" rel="noopener noreferrer">política de privacidad</a>.</span></label></p>}
      <p className="dipe-shop-form-trap" aria-hidden="true"><label htmlFor={`${id}-website`}>Sitio web<input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label></p>
      {security.error && <div className="dipe-shop__error" role="alert"><p>{security.error}</p><button type="button" className="dipe-shop__text-button" onClick={() => setSecurityRevision((value) => value + 1)}>Actualizar formulario</button></div>}
      <button type="submit" className="dipe-shop-button" disabled={submission.pending || security.loading || !security.token || !privacy || question.trim().length < 10}>{submission.pending ? 'Enviando…' : security.loading ? 'Preparando formulario…' : 'Enviar pregunta'}</button>
      {submission.error && <p className="dipe-shop__error" role="alert">{submission.error}</p>}{submission.message && <p role="status">{submission.message}</p>}
    </form>
  </div>;
}
