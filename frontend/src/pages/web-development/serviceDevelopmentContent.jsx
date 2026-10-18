// Contenido fijo de los tres PDF. Las respuestas adicionales de FAQ son borradores
// solicitados por el usuario: revisar su redacción en el servidor antes de darla por final.
// Los títulos de las listas de WordPress/PrestaShop incorporan el texto pegado;
// todos sus contenidos desplegados son también borradores autorizados.
export const serviceDevelopmentContent = {
  wordpress: {
    hero: {
      title: 'Desarrollo web con WordPress:',
      subtitle: 'rápido, editable y con Core Web Vitals en verde',
      auditLabel: 'Pide tu auditoría de WordPress',
    },
    intro: <>
      <p>Creamos sitios en <strong>WordPress</strong> que tu equipo puede editar sin miedo y que a Google le sientan de maravilla.</p>
      <div>
        <p>Diseño a medida, bloques reutilizables y rendimiento serio.</p>
        <p>Sí, <strong>Desarrollo web con WordPress</strong> para que posicionar y convertir no sea un drama.</p>
      </div>
    </>,
    includesTitle: <>Qué incluye nuestro<br />desarrollo en WordPress<br />(sin plantillitis)</>,
    gridLayout: true,
    features: [
      {
        title: 'Diseño a medida (no “tema que lleva de todo”)',
        description: <>UI con tu marca, <strong>design system</strong> y componentes reutilizables. Nada de “tres plugins para un botón”.</>,
      },
      {
        title: 'Bloques y patrones propios (Gutenberg)',
        description: <>Editas textos, imágenes y secciones completas <strong>sin romper el diseño</strong> (ni el rendimiento).</>,
      },
      {
        title: 'Rendimiento y SEO técnico',
        description: <>Imágenes responsivas, CSS crítico, caché/CDN y datos estructurados. <strong>LCP/CLS/INP</strong> mimados para que todo vuele.</>,
      },
      {
        title: 'Seguridad y estabilidad',
        description: <>Hardening, backups automáticos, staging para pruebas y actualizaciones controladas. Dormir bien está subestimado.</>,
      },
      {
        title: 'Analítica y medición',
        description: <><strong>GA4</strong> y eventos bien puestos para ver lo que importa: leads, formularios, clics en teléfono y ventas (si hay WooCommerce).</>,
      },
    ],
    capabilities: [
      {
        title: '¿Qué puede aportar WordPress a tu proyecto?',
        items: [
          { title: 'Autonomía', description: 'Los bloques y patrones propios permiten que tu equipo edite textos, imágenes y secciones completas manteniendo el diseño. El objetivo es que gestionar el contenido sea sencillo y seguro.' },
          { title: 'Flexibilidad', description: 'Adaptamos el diseño y los componentes a tu marca y a las necesidades del proyecto, tanto para una web corporativa como para contenidos o una tienda con WooCommerce.' },
          { title: 'Una buena base para crecer', description: 'Partimos de una base ligera, componentes reutilizables y una estructura cuidada. El rendimiento, el SEO técnico y la medición acompañan la evolución del sitio.' },
        ],
      },
      {
        title: 'WordPress adaptado a lo que necesitas',
        items: [
          { title: 'Web corporativa', description: 'Una web con tu identidad, servicios y contenidos organizados para presentar el negocio con claridad y facilitar el contacto. Los bloques reutilizables ayudan a mantener una imagen coherente.' },
          { title: 'Web con blog o periódico digital', description: 'Organizamos entradas, categorías y contenidos para facilitar la publicación y la lectura. Tu equipo dispone de una estructura editorial que puede gestionar desde WordPress.' },
          { title: 'WordPress con tienda online', description: 'Cuando el proyecto necesita vender, planteamos WooCommerce y las integraciones necesarias. El catálogo, la experiencia de compra y la medición se definen según la operativa del negocio.' },
        ],
      },
      {
        title: 'Mantenimiento y evolución',
        items: [
          { title: 'Plan proactivo', description: 'Hardening, copias de seguridad, pruebas en staging y actualizaciones controladas para cuidar la estabilidad y el rendimiento del sitio.' },
          { title: 'Roadmap por sprints', description: 'Priorizamos las mejoras del sitio en ciclos cortos, según los objetivos, los contenidos y los resultados que vayamos midiendo.' },
        ],
      },
    ],
    processTitle: 'Proceso de trabajo',
    steps: [
      { title: 'Descubrimiento & Blueprint', description: 'Objetivos, mapa de contenidos y KPIs. Quick wins a la vista.' },
      { title: 'QA', description: <>Tema base ligero, <strong>bloques/patrones a medida</strong>, checklist de rendimiento y pruebas funcionales.</> },
      { title: 'Diseño UX/UI y Desarrollo', description: 'Wireframes y prototipo navegable para validar pronto (sin sustos al final).' },
      { title: 'Lanzamiento & Formación', description: <>Go-live sin sobresaltos y <strong>training</strong> para que tu equipo edite como si nada.</> },
    ],
    cases: [
      {
        title: 'B2B industrial', work: <>Rediseño +<br />SEO técnico</>,
        results: [{ value: '+80%', label: 'Tráfico orgánico' }, { value: '+35%', label: 'leads en 6 meses.' }],
      },
      {
        title: 'Servicios profesionales', work: <>Arquitectura<br />+ contenidos</>,
        results: [{ value: '+28%', label: 'conversión en formularios' }],
      },
    ],
    faqTitle: <>FAQs de Desarrollo web con WordPress<br />(las preguntas que te ahorran emails)</>,
    faqs: [
      { question: '¿Usáis plantillas o hacéis todo a medida?', answer: 'Partimos de un tema base ligero y construimos bloques y patrones a medida para mantener rendimiento y flexibilidad.' },
      { question: '¿Puedo editar yo sin romper nada?', answer: 'Sí. Los bloques y patrones propios permiten editar textos, imágenes y secciones completas manteniendo el diseño y el rendimiento.' },
      { question: 'Mi WordPress va lento. ¿Lo arregláis?', answer: 'Revisamos imágenes, CSS, caché y Core Web Vitals para detectar los problemas de rendimiento y definir las mejoras necesarias.' },
      { question: '¿Migráis mi web actual sin perder SEO?', answer: 'Preparamos una auditoría, un plan de redirecciones y pruebas en staging, con monitorización tras el lanzamiento para cuidar el posicionamiento.' },
      { question: '¿WordPress es seguro?', answer: 'Trabajamos la seguridad con hardening, copias de seguridad automáticas, pruebas en staging y actualizaciones controladas.' },
      { question: '¿Multidioma mejor con subcarpetas o subdominios?', answer: 'La estructura se define durante la fase de arquitectura según los idiomas, mercados y necesidades de contenidos y SEO del proyecto.' },
      { question: '¿Y si ya tengo equipo interno?', answer: 'Podemos trabajar con vuestro equipo, compartiendo objetivos, tareas y KPIs, y preparar la formación para la edición del sitio.' },
    ],
    contactIntro: <p>Cuéntanos tu objetivo y te proponemos un plan de <strong>Desarrollo web con WordPress</strong> (sí, con “WordPress” bien escrito en el código): fases, tiempos y presupuesto claro.</p>,
  },
  prestashop: {
    hero: {
      title: 'Desarrollo web con PrestaShop:',
      subtitle: 'tiendas rápidas, UX que vende y cero dramas',
      auditLabel: 'Pide una auditoría de tu ecommerce',
    },
    intro: <>
      <p>Montamos tiendas <strong>PrestaShop</strong> que cargan rápido, convierten y se integran con tu negocio.</p>
      <div>
        <p>Diseño a medida, checkout sin fricciones y catálogo bien organizado.</p>
        <p>Sí, hacemos <strong>Desarrollo web con PrestaShop</strong> (y lo escribimos bien en el código).</p>
      </div>
    </>,
    includesTitle: <>Qué incluye nuestro<br />desarrollo en PrestaShop<br />(sin humo)</>,
    gridLayout: true,
    features: [
      {
        title: 'Diseño UX/UI que empuja a comprar',
        description: 'Jerarquía clara, fichas que cuentan (y venden), reseñas, cross/upselling y microcopys que quitan objeciones.',
      },
      {
        title: 'Catálogo serio y bien estructurado',
        description: <>Atributos, combinaciones, packs, reglas de precio y <strong>multitienda</strong> sin nudos.</>,
      },
      {
        title: 'Checkout sin fricciones',
        description: 'Menos pasos, autocompletado, métodos de pago clave y mensajes claros. Adiós carritos perdidos.',
      },
      {
        title: 'Rendimiento y SEO técnico',
        description: <>Imágenes optimizadas, CSS/JS críticos, caché, sitemap/robots limpios y <strong>Core Web Vitals</strong> para que todo vuele.</>,
      },
      {
        title: 'Seguridad y estabilidad',
        description: <>Hardening, backups automáticos, entorno de <strong>staging</strong> y actualizaciones controladas. Dormir bien &gt; apagar fuegos.</>,
      },
    ],
    capabilities: [
      {
        title: '¿Qué puede aportar PrestaShop a tu tienda?',
        items: [
          { title: 'Más control sobre tu catálogo', description: 'Organizamos atributos, combinaciones, packs y reglas de precio para que el catálogo responda a la realidad de tu negocio y resulte fácil de explorar.' },
          { title: 'Una experiencia preparada para vender', description: 'Trabajamos la jerarquía, las fichas de producto y el checkout para reducir fricciones. Métodos de pago adecuados, mensajes claros y una navegación cuidada acompañan la compra.' },
          { title: 'Una tienda preparada para crecer', description: 'Planteamos el rendimiento, las integraciones y la estructura del catálogo desde el inicio para acompañar nuevas necesidades de venta, gestión o expansión.' },
        ],
      },
      {
        title: 'PrestaShop adaptado a lo que necesitas',
        items: [
          { title: 'Ecommerce con catálogos amplios', description: 'Estructuramos productos, atributos y combinaciones con una navegación clara. El rendimiento y el SEO técnico ayudan a que un catálogo amplio siga siendo usable.' },
          { title: 'Ecommerce B2B', description: 'Planteamos tarifas por cliente, catálogos por permisos e integraciones con ERP o CRM según la operativa de venta y preparación de pedidos.' },
          { title: 'Multitienda e internacionalización', description: 'Organizamos la estructura multitienda y las necesidades de cada mercado, revisando catálogo, logística y métodos de pago durante el diagnóstico del proyecto.' },
        ],
      },
      {
        title: 'Mantenimiento y evolución',
        items: [
          { title: 'Plan proactivo', description: 'Copias de seguridad, entorno de staging y actualizaciones controladas para mantener la tienda estable y revisar su rendimiento.' },
          { title: 'Roadmap por sprints', description: 'Organizamos las mejoras de la tienda en ciclos cortos, priorizando la experiencia de compra, las integraciones y las necesidades del negocio.' },
        ],
      },
    ],
    processTitle: 'Proceso de trabajo',
    steps: [
      { title: 'Diagnóstico & Blueprint', description: 'Objetivos, KPIs, catálogo, logística y quick wins. No arrancamos “a ojo”.' },
      { title: 'QA', description: <>Módulos necesarios (los justos), rendimiento al milímetro y <strong>testing</strong> de compra end-to-end.</> },
      { title: 'Diseño UX/UI, prototipado y Desarrollo', description: 'Wireframes y diseño validado antes de tocar código. Menos sustos, más aciertos.' },
      { title: 'Lanzamiento & crecimiento', description: <>Plan de go-live, monitorización y <strong>CRO</strong> continuo con tests A/B.</> },
    ],
    cases: [
      {
        title: 'Retail multitienda', work: <>Rediseño +<br />checkout nuevo</>,
        results: [{ value: '+31%', label: 'Conversión' }, { value: '+22%', label: 'ticket medio' }],
      },
      {
        title: 'Distribución B2B', work: <>Integración ERP +<br />catálogos por permisos</>,
        results: [{ value: '-26%', label: 'tiempo de preparación de pedidos' }],
      },
    ],
    faqTitle: <>FAQs de Desarrollo web con PrestaShop<br />(las preguntas que te ahorran tickets)</>,
    faqs: [
      { question: '¿Podéis migrar mi ecommerce actual a PrestaShop sin perder SEO ni datos?', answer: 'Sí: inventario, clientes, pedidos e historial SEO con plan de redirecciones y pruebas en staging.' },
      { question: '¿PrestaShop o WooCommerce?', answer: 'La elección se estudia con el catálogo, las reglas de precio, la operativa y las integraciones del negocio. El diagnóstico inicial sirve para definir qué opción encaja mejor.' },
      { question: '¿Necesitaré muchos módulos?', answer: 'Seleccionamos los módulos necesarios para el alcance de la tienda, cuidando el rendimiento y la estabilidad. La idea es utilizar los justos.' },
      { question: '¿Con qué pasarelas y transportistas trabajáis?', answer: 'Los métodos de pago y la logística se definen según las necesidades de la tienda y las integraciones disponibles. Las conexiones concretas se revisan en el diagnóstico.' },
      { question: '¿En cuánto tiempo lanzo la tienda?', answer: 'Depende del catálogo, el diseño y las integraciones. Tras el diagnóstico y la definición del alcance, preparamos las fases y un calendario de lanzamiento.' },
      { question: '¿Podéis conectar PrestaShop con mi ERP/CRM?', answer: 'Sí. Las conexiones con ERP y CRM forman parte de las integraciones que estudiamos durante el diagnóstico para coordinar la tienda con la operativa del negocio.' },
      { question: '¿Gestionáis campañas de marketing?', answer: 'Sí. Podemos acompañar la tienda con SEO, SEM, redes e inbound y medir los resultados junto con las conversiones del ecommerce.' },
    ],
    contactIntro: <p>Cuéntanos tu objetivo y te preparamos un plan claro de <strong>Desarrollo web con PrestaShop</strong> (sí, también Desarrollo web con Prestashop para quien lo busque): fases, tiempos y presupuesto realista.</p>,
  },
  applications: {
    hero: {
      title: 'Desarrollo de Aplicaciones Web:',
      subtitle: 'cuando el SaaS no llega… llegamos nosotros',
      auditLabel: 'Pide una auditoría de tu aplicación web',
    },
    intro: <>
      <p>Construimos <strong>Aplicaciones Web</strong> a medida que eliminan exceles eternos y procesos manuales.</p>
      <div>
        <p><strong>Arquitectura API-first, Laravel + React</strong>, seguridad, rendimiento y métricas desde el día 1.</p>
        <p><strong>Desarrollo de Aplicaciones Web</strong> pensado para negocio, no para coleccionar features.</p>
      </div>
    </>,
    includesTitle: <>Qué resolvemos<br />(sin humo, con KPI)</>,
    gridLayout: false,
    features: [
      { title: 'Portales de cliente y partner', description: 'Pedidos, incidencias, documentación, estado de proyectos y facturas (las tuyas, no “de muestra”).' },
      { title: 'Workflows internos', description: 'Aprobaciones, control de tareas, inventarios ligeros, checklists y trazabilidad.' },
      { title: 'Configuradores y autoservicio', description: 'Productos complejos, reglas de negocio, presupuestos y firmas sin “pase por ventanilla”.' },
      { title: 'Dashboards y datos vivos', description: 'KPIs accionables para equipo directivo y operativo. Lo que no se mide, no mejora (ni convence).' },
    ],
    capabilities: [
      {
        title: 'Tecnología y arquitectura',
        items: [
          { title: 'Laravel en el backend', description: 'Utilizamos Laravel para organizar la lógica de negocio y los procesos que necesita la aplicación, con una arquitectura que facilite su mantenimiento y evolución.' },
          { title: 'React en el frontend', description: 'Construimos interfaces con React para que los usuarios puedan recorrer los flujos de trabajo de forma clara, con componentes coherentes y reutilizables.' },
          { title: 'API-first e integraciones', description: 'Diseñamos las conexiones entre la aplicación y los sistemas del negocio desde la arquitectura. Las APIs y los datos que se comparten se concretan durante el blueprint.' },
          { title: 'Rendimiento y seguridad', description: 'El rendimiento y la seguridad forman parte de la arquitectura, el desarrollo y el checklist de calidad, junto con las necesidades reales de uso de la aplicación.' },
        ],
      },
      {
        title: 'Integraciones típicas',
        items: [
          { title: 'ERP/CRM', description: 'Revisamos cómo conectar la aplicación con la gestión y la relación con clientes para reducir tareas manuales y coordinar los datos que necesita cada proceso.' },
          { title: 'Ecommerce y pagos', description: 'Planteamos conexiones con la tienda y los flujos de pago cuando forman parte del caso de uso, definiendo qué información debe circular entre los sistemas.' },
          { title: 'Logística y documentos', description: 'Integramos la información y la documentación que necesitan los procesos, como pedidos, incidencias, estados de proyectos o facturas.' },
          { title: 'Analítica y BI', description: 'Definimos KPIs y dashboards para que los equipos directivos y operativos puedan seguir los procesos con datos y valorar los resultados de la aplicación.' },
        ],
      },
      {
        title: 'Mantenimiento y evolución',
        items: [
          { title: 'Plan proactivo', description: 'Planificamos el mantenimiento y el soporte de la aplicación para cuidar su funcionamiento y revisar las necesidades que aparecen con el uso.' },
          { title: 'Roadmap vivo', description: 'Priorizamos nuevas funcionalidades y mejoras por sprints, con objetivos de negocio, métricas y revisión de los flujos de trabajo.' },
        ],
      },
    ],
    processTitle: <>Proceso de trabajo<br />(paso corto, vista larga)</>,
    steps: [
      { title: 'Descubrimiento & Blueprint', description: 'Workshops, mapa de procesos y definición de épicas y KPIs. Quick wins a la vista.' },
      { title: 'QA', description: 'Sprints cortos, CI/CD, cobertura de tests y demo quincenal. Nada sale sin checklist.' },
      { title: 'Prototipo navegable', description: 'Validamos flujos con un prototipo clickable. Menos sorpresas, más aciertos.' },
      { title: 'Go-live & adopción', description: 'Despliegue, formación por perfiles y soporte cercano. La app se usa desde el día 1.' },
    ],
    cases: [
      {
        title: 'Portal de cliente B2B', work: <>Pedidos + incidencias<br />+ documentación</>,
        results: [{ value: '-43%', label: 'tiempo operativo' }, { value: '+27%', label: 'satisfacción' }],
      },
      {
        title: 'Workflow interno de compras', work: <>Aprobaciones y<br />trazabilidad</>,
        results: [{ value: '-35%', label: 'cuellos de botella y cero “¿quién tenía esto?”.' }],
      },
    ],
    faqTitle: <>FAQs de Desarrollo de Aplicaciones Web<br />(las que te ahorran reuniones)</>,
    faqs: [
      { question: '¿En cuánto tiempo lanzo un MVP?', answer: 'Suele estar entre 6 y 10 semanas, según alcance e integraciones. MVP real, usable, sin promesas vaporosas.' },
      { question: '¿Es mejor app web o App?', answer: 'Depende de los usuarios y de los flujos que necesitéis resolver. En el descubrimiento revisamos los casos de uso para definir la solución adecuada antes de desarrollar.' },
      { question: '¿Se integra con mi ERP/CRM actual?', answer: 'La arquitectura API-first está orientada a integrar la aplicación con ERP, CRM y otros sistemas. Las conexiones concretas se revisan durante el blueprint.' },
      { question: '¿La seguridad cómo la tratáis?', answer: 'La seguridad forma parte de la arquitectura y se trabaja junto con el rendimiento, el checklist de calidad y el plan de mantenimiento.' },
      { question: '¿Quién mantiene y evoluciona la app?', answer: 'El proyecto puede continuar con un plan proactivo y un roadmap vivo, organizando las mejoras por sprints según las necesidades del negocio.' },
      { question: '¿Puedo ver métricas de uso y ROI?', answer: 'Definimos los KPIs durante el descubrimiento y planteamos analítica y dashboards para seguir el uso y los resultados de los procesos que resuelve la aplicación.' },
    ],
    contactIntro: <p>Cuéntanos qué proceso quieres mejorar y te proponemos un plan de <strong>Desarrollo de Aplicaciones Web</strong> con fases, tiempos y presupuesto claro.</p>,
  },
};
