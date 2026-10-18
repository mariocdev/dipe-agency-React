export function VideoHero({ videoSrc, title, children }) {
  return <section className="dipe-video-hero">
    <video className="dipe-video-hero__video" autoPlay loop muted playsInline preload="metadata" aria-hidden="true">
      <source src={videoSrc} type="video/mp4" />
    </video>
    <div className="dipe-video-hero__overlay" aria-hidden="true" />
    <div className="dipe-video-hero__inner">
      <div className="dipe-video-hero__content">
        <h1 className="dipe-video-hero__title">{title}</h1>
        <div className="dipe-video-hero__description">{children}</div>
      </div>
    </div>
  </section>;
}
