import { homeMedia } from './homeMedia';
import './LogoCarouselSection.css';

const logosPerView = 6;
const logos = Array.from({ length: 6 }, (_, index) => ({
  id: `logo-${index + 1}`,
  src: homeMedia(`Logo-${index + 1}.png`),
}));

function groupLogos(items) {
  const groups = [];

  for (let start = 0; start < items.length; start += logosPerView) {
    const group = items.slice(start, start + logosPerView);
    while (group.length < logosPerView) group.push(items[(start + group.length) % items.length]);
    groups.push(group);
  }

  return groups;
}

export function LogoCarouselSection() {
  const logoGroups = groupLogos(logos);
  const repeatedLogoGroups = [...logoGroups, ...logoGroups];
  const style = {
    '--logo-group-count': logoGroups.length,
    '--logo-scroll-duration': `${logoGroups.length * 24}s`,
  };

  return <section className="dipe-logo-carousel" aria-label="Logotipos de clientes">
    <div className="dipe-logo-carousel__inner">
      <div className="dipe-logo-carousel__viewport">
        <div className="dipe-logo-carousel__track" style={style}>
          {repeatedLogoGroups.map((group, groupIndex) => <div className="dipe-logo-carousel__group" aria-hidden={groupIndex >= logoGroups.length} key={`${groupIndex}-${group[0].id}`}>
            {group.map((logo, logoIndex) => <div className="dipe-logo-carousel__logo" key={`${groupIndex}-${logo.id}-${logoIndex}`}>
              <img src={logo.src} alt="" />
            </div>)}
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
