/**
 * The chrome every page shares, in each language: navigation, the language
 * control, the consent banner, the release calls to action, and the status
 * pages.
 *
 * Only the current language is ever rendered, so this file holds no fallback
 * copy. A key missing from a locale is a type error, not a silent English
 * string on a Spanish page.
 */
import type { Locale } from "./locale.ts";

type Heading = { text: string; emphasis: string };

export type StatusCopy = {
  eyebrow: string;
  heading: Heading;
  body: string;
  reference: string;
  retry: string;
  home: string;
};

export type UiCopy = {
  header: {
    menu: string;
    /** Accessible names for the logo link, on the homepage and elsewhere. */
    topAria: string;
    homeAria: string;
    /** Aligned with the section anchors in `header.tsx`, in page order. */
    sections: string[];
    /** The link into the documentation. */
    docs: string;
  };
  languageSwitch: {
    /** The link names the language it leads to, in the language it leaves. */
    label: string;
    ariaLabel: string;
  };
  docs: {
    /** The docs navigation title and its link back to the homepage. */
    title: string;
    home: string;
  };
  footer: {
    docs: string;
    blog: string;
    releases: string;
    issues: string;
    license: string;
    credit: string;
  };
  release: {
    downloadMac: (version: string) => string;
    downloadMacLatest: string;
    downloadLinux: (version: string, architecture: string) => string;
    downloadLinuxLatest: (architecture: string) => string;
  };
  consent: {
    ariaLabel: string;
    text: string;
    allow: string;
    deny: string;
  };
  media: {
    playFilm: string;
    pauseFilm: string;
    videoZoomAria: string;
    imageZoomAria: string;
  };
  shortcut: {
    current: (platform: string) => string;
    note: (platform: string) => string;
    unknownLabel: string;
    unknownTitle: string;
  };
  status: {
    notFound: StatusCopy & {
      /** The 404 page's own `<title>`. */
      title: string;
      docs: string;
      releases: string;
    };
    error: StatusCopy;
    globalError: StatusCopy;
  };
};

const EN: UiCopy = {
  header: {
    menu: "Menu",
    topAria: "Mash, back to top",
    homeAria: "Mash, home",
    sections: [
      "Orchestration",
      "Setup",
      "Workspaces",
      "Code",
      "Review",
      "Keyboard",
      "Install",
    ],
    docs: "Docs",
  },
  languageSwitch: {
    label: "Español",
    ariaLabel: "View this site in Spanish",
  },
  docs: {
    title: "Mash docs",
    home: "Home",
  },
  footer: {
    docs: "Docs",
    blog: "Blog",
    releases: "Releases",
    issues: "Issues",
    license: "License",
    credit: "Mash · a complete agentic workspace for macOS and Linux",
  },
  release: {
    downloadMac: (version) => `Download Mash ${version} for macOS`,
    downloadMacLatest: "Download Mash for macOS",
    downloadLinux: (version, architecture) =>
      `Download ${version} · ${architecture}`,
    downloadLinuxLatest: (architecture) => `Download · ${architecture}`,
  },
  consent: {
    ariaLabel: "Analytics cookies",
    text: "Mash uses analytics cookies to see which pages and docs actually help. No accounts, no ads, nothing sold.",
    allow: "Allow analytics",
    deny: "No thanks",
  },
  media: {
    playFilm: "Play film",
    pauseFilm: "Pause film",
    videoZoomAria: "Enlarged video; click or press Escape to close",
    imageZoomAria: "Enlarged screenshot; click or press Escape to close",
  },
  shortcut: {
    current: (platform) => `Shortcuts below are the ${platform} keys.`,
    note: (platform) =>
      `Mash ships a ${platform} keymap too, and the in-app keybinding sheet always shows the keys for the machine you are on.`,
    unknownLabel: "in-app sheet",
    unknownTitle: "See the in-app keybinding sheet (Ctrl ⇧ I)",
  },
  status: {
    notFound: {
      title: "Page not found | Mash",
      eyebrow: "404",
      heading: { text: "This page is not here ", emphasis: "anymore." },
      body: "The link may be out of date. The documentation and the releases page are where most things live.",
      reference: "Reference: ",
      retry: "Try again",
      home: "Back to the homepage",
      docs: "Read the docs",
      releases: "Releases",
    },
    error: {
      eyebrow: "Something broke",
      heading: { text: "This page did not ", emphasis: "load." },
      body: "The error was reported. Trying again often works; if it keeps failing, open an issue and include the reference below.",
      reference: "Reference: ",
      retry: "Try again",
      home: "Back to the homepage",
    },
    globalError: {
      eyebrow: "Something broke",
      heading: { text: "Mash could not ", emphasis: "render." },
      body: "The error was reported. Reloading usually recovers; the docs and the releases page are unaffected.",
      reference: "Reference: ",
      retry: "Try again",
      home: "Back to the homepage",
    },
  },
};

const ES: UiCopy = {
  header: {
    menu: "Menú",
    topAria: "Mash, volver arriba",
    homeAria: "Mash, inicio",
    sections: [
      "Orquestación",
      "Preparación",
      "Espacios de trabajo",
      "Código",
      "Revisión",
      "Teclado",
      "Instalación",
    ],
    docs: "Documentación",
  },
  languageSwitch: {
    label: "English",
    ariaLabel: "Ver este sitio en inglés",
  },
  docs: {
    title: "Documentación de Mash",
    home: "Inicio",
  },
  footer: {
    docs: "Docs",
    blog: "Blog",
    releases: "Versiones",
    issues: "Incidencias",
    license: "Licencia",
    credit:
      "Mash · un espacio de trabajo completo con agentes para macOS y Linux",
  },
  release: {
    downloadMac: (version) => `Descargar Mash ${version} para macOS`,
    downloadMacLatest: "Descargar Mash para macOS",
    downloadLinux: (version, architecture) =>
      `Descargar ${version} · ${architecture}`,
    downloadLinuxLatest: (architecture) => `Descargar · ${architecture}`,
  },
  consent: {
    ariaLabel: "Cookies de analítica",
    text: "Mash usa cookies de analítica para saber qué páginas y documentos son de verdad útiles. Sin cuentas, sin anuncios y sin vender nada.",
    allow: "Permitir analítica",
    deny: "No, gracias",
  },
  media: {
    playFilm: "Reproducir el vídeo",
    pauseFilm: "Pausar el vídeo",
    videoZoomAria: "Vídeo ampliado; haz clic o pulsa Escape para cerrarlo",
    imageZoomAria: "Captura ampliada; haz clic o pulsa Escape para cerrarla",
  },
  shortcut: {
    current: (platform) => `Los atajos de abajo son los de ${platform}.`,
    note: (platform) =>
      `Mash también incluye un mapa de teclas para ${platform}, y la hoja de atajos de la aplicación siempre muestra las teclas del equipo en el que estás.`,
    unknownLabel: "hoja de la app",
    unknownTitle: "Ver la hoja de atajos de la aplicación (Ctrl ⇧ I)",
  },
  status: {
    notFound: {
      title: "Página no encontrada | Mash",
      eyebrow: "404",
      heading: { text: "Esta página ya no está ", emphasis: "aquí." },
      body: "Puede que el enlace esté desactualizado. La documentación y la página de versiones son donde está casi todo.",
      reference: "Referencia: ",
      retry: "Reintentar",
      home: "Volver a la página de inicio",
      docs: "Leer la documentación",
      releases: "Versiones",
    },
    error: {
      eyebrow: "Algo se rompió",
      heading: { text: "Esta página no ", emphasis: "cargó." },
      body: "El error se ha registrado. Reintentar suele funcionar; si sigue fallando, abre una incidencia e incluye la referencia de abajo.",
      reference: "Referencia: ",
      retry: "Reintentar",
      home: "Volver a la página de inicio",
    },
    globalError: {
      eyebrow: "Algo se rompió",
      heading: { text: "Mash no pudo ", emphasis: "renderizarse." },
      body: "El error se ha registrado. Recargar suele recuperarlo; la documentación y la página de versiones no se ven afectadas.",
      reference: "Referencia: ",
      retry: "Reintentar",
      home: "Volver a la página de inicio",
    },
  },
};

export const UI: Record<Locale, UiCopy> = { en: EN, es: ES };
