import { homeMedia } from '../homeMedia';
import './LogoCarouselSection.css';

const logos = Array.from({ length: 6 }, (_, index) => ({
  id: `logo-${index + 1}`,
  src: homeMedia(`Logo-${index + 1}.png`),
}));

export function LogoCarouselSection() {
  const repeatedLogos = [...logos, ...logos];
  const style = {
    '--logo-scroll-duration': '24s',
  };

  return <section className="dipe-logo-carousel" aria-label="Logotipos de clientes">
    <div className="dipe-logo-carousel__inner">
      <div className="dipe-logo-carousel__viewport">
        <div className="dipe-logo-carousel__track" style={style}>
          {repeatedLogos.map((logo, index) => <div
            className="dipe-logo-carousel__logo"
            aria-hidden={index >= logos.length}
            key={`${index}-${logo.id}`}
          >
            <img src={logo.src} alt="" />
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
