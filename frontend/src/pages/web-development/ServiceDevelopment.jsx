import { FaqSection } from '../home/sections/FaqSection';
import { WorkProcessSection } from '../home/sections/WorkProcessSection';
import { ProjectsContact } from '../projects/ProjectsContact';
import { serviceDevelopmentContent } from './serviceDevelopmentContent';
import { serviceDevelopmentMedia } from './serviceDevelopmentMedia';
import { webDevelopmentMedia as sharedMedia } from './webDevelopmentMedia';
import {
  WebDevelopmentCapabilities,
  WebDevelopmentCases,
  WebDevelopmentHero,
  WebDevelopmentIncludes,
} from './WebDevelopmentSections';
import './WebDevelopment.css';

const processIcons = [sharedMedia.strategyIcon, sharedMedia.qaIcon, sharedMedia.designIcon, sharedMedia.analyticsIcon];

export function ServiceDevelopment({ serviceId }) {
  const content = serviceDevelopmentContent[serviceId];
  const media = serviceDevelopmentMedia[serviceId];
  const features = content.features.map((feature, index) => ({ ...feature, icon: media.featureIcons[index] }));
  const steps = content.steps.map((step, index) => ({ ...step, icon: processIcons[index] }));
  const faqs = content.faqs.map((faq, index) => ({
    ...faq,
    id: `${serviceId}-${index + 1}`,
    answerText: faq.answer,
  }));

  return <div className="dipe-web-development">
    <WebDevelopmentHero {...content.hero} videoSrc={media.heroVideo} />
    <WebDevelopmentIncludes
      intro={content.intro}
      title={content.includesTitle}
      features={features}
      backgroundSrc={media.includesBackground}
      gridLayout={content.gridLayout}
    />
    <WebDevelopmentCapabilities
      groups={content.capabilities}
      imageSrc={media.capabilitiesImage}
      imageLabel={content.hero.title.replace(/:$/, '')}
    />
    <WorkProcessSection
      title={content.processTitle}
      steps={steps}
      imageSrc={media.processImage}
      videoSrc={media.processVideo}
    />
    <WebDevelopmentCases items={content.cases} />
    <FaqSection items={faqs} title={content.faqTitle} />
    <ProjectsContact
      id="web-contacto"
      source="desarrollo-web"
      formType="contacto-servicios"
      intro={content.contactIntro}
    />
  </div>;
}
