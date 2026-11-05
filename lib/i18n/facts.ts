/**
 * The product facts that metadata, structured data and the install cards
 * publish, in each language.
 *
 * English reuses the canonical constants in `lib/site.ts` rather than repeating
 * them: this file localizes wording, it does not decide what is true. A claim
 * added here has to be added to the English source first, and every locale has
 * to say the same thing.
 */
import { CAPABILITIES, ORCHESTRATION_FILM, PLATFORMS } from "../site.ts";
import type { Locale } from "./locale.ts";

export type PlatformCopy = { requirement: string; artifact: string };

export type FaqCopy = { question: string; answer: string };

export type FactsCopy = {
  /** Root layout title and description. */
  siteTitle: string;
  siteDescription: string;
  socialImageAlt: string;
  applicationSubCategory: string;
  /** `SoftwareApplication.featureList`, in the order the page lists them. */
  features: string[];
  /** The homepage's full capability list. */
  capabilities: string[];
  platforms: Record<"mac" | "linux", PlatformCopy>;
  films: {
    hero: { name: string; description: string };
    orchestration: { title: string; description: string };
  };
  faq: {
    downloadQuestion: string;
    /** Opens the download answer once the live release is known. */
    releaseLine: (version: string, publishedAt: string) => string;
    /** Opens it when the release lookup failed, claiming no version. */
    missing: string;
    /** Follows either opening sentence. */
    tail: string;
    items: FaqCopy[];
  };
};

/** BCP 47 tags for date formatting, which wants a region its language does not. */
const DATE_TAGS: Record<Locale, string> = { en: "en-US", es: "es-ES" };

/**
 * Release dates are shown as a date in the reader's language. UTC keeps the
 * string identical on every render of the same release.
 */
export function formatReleaseDate(publishedAt: string, locale: Locale): string {
  const date = new Date(`${publishedAt}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return publishedAt;

  return new Intl.DateTimeFormat(DATE_TAGS[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const EN: FactsCopy = {
  siteTitle: "Mash - A complete agentic workspace for macOS and Linux",
  siteDescription:
    "Mash is one app with Herdr, Ghostty, Starship, Pi, and Fresh already wired together: parallel agents, a review path you control, and code you can still read and edit by hand.",
  socialImageAlt: "Mash, a complete agentic workspace in one Mac app",
  applicationSubCategory: "Agentic coding environment",
  features: [
    "Agent orchestration: a coordinator delegates tasks to worker agents and gathers their results",
    "Pi Voice dictation into an editable message",
    "One workspace per task, each with its own agent",
    "Editor and coding agent in the same tab",
    "Review tabs with the diff beside the agent",
    "Command palette and fuzzy file finder",
    "Session search across agent conversations",
    "A complete toolchain installed on first launch",
    "Runs on macOS and Linux, with a keymap for each",
  ],
  capabilities: [...CAPABILITIES],
  platforms: {
    mac: {
      requirement: PLATFORMS.mac.requirement,
      artifact: PLATFORMS.mac.artifact,
    },
    linux: {
      requirement: PLATFORMS.linux.requirement,
      artifact: PLATFORMS.linux.artifact,
    },
  },
  films: {
    hero: {
      name: "A tour of Mash",
      description:
        "The Mash command palette, the workspace picker, the file finder, and the review tab, recorded from the app.",
    },
    orchestration: {
      title: ORCHESTRATION_FILM.title,
      description: ORCHESTRATION_FILM.description,
    },
  },
  faq: {
    downloadQuestion: "How do I download it?",
    releaseLine: (version, publishedAt) =>
      publishedAt
        ? `Mash ${version} was released on ${formatReleaseDate(publishedAt, "en")}.`
        : `Mash ${version} is the latest release.`,
    missing: "The latest release is on the Mash releases page.",
    tail: " Download the build for your platform from the Mash releases page on GitHub, or use the download button on this page, which offers the right file for the machine you are on. Every release publishes the macOS DMG and both Linux .deb architectures together.",
    items: [
      {
        question: "What is Mash?",
        answer:
          "Mash is a single application that bundles a complete agentic coding environment: Herdr for workspaces, tabs, and agents; Ghostty for the terminal; Starship for the shell prompt; Pi for the coding; Fresh for the editing; and the Mash skills that teach the workflow. It arrives already configured rather than asking you to assemble those tools yourself.",
      },
      {
        question: "Is Mash free?",
        answer:
          "Yes. Mash is free and open source under the GPL-3.0-or-later license, with no Mash account, subscription, or in-app purchase. Pi needs a model provider you choose (OpenAI, Anthropic, OpenRouter, or an OpenAI-compatible endpoint), and that provider bills your model usage. You download one file for your platform, install it, and the first launch sets up the rest.",
      },
      {
        question: "Which systems does Mash run on?",
        answer:
          "Mash runs on macOS 14 or later on Apple silicon, and on Ubuntu 24.04 with GNOME on Wayland or Xorg. macOS ships as one signed and notarized DMG; Linux ships as a .deb for amd64 or arm64, which installs to /opt/letsmash and keeps everything you configure in ~/.mash. There is no Intel Mac build, and no Windows build.",
      },
      {
        question: "Do I still have to install Pi, Herdr, or the skills myself?",
        answer:
          "No. The terminal, the agent, the editor, and the skills ship inside Mash. The first launch sets your Git identity, signs you in to GitHub if you want it, and adds the optional command-line tools and language servers you select. On Linux those go into ~/.mash without asking for a password; on macOS the optional extras are installed with Homebrew. Mash keeps its own state under ~/.mash and leaves your existing configuration files alone.",
      },
      {
        question: "Can I still edit the code by hand?",
        answer:
          "Yes, and Mash is built around that. The agent works in a pane beside the file rather than behind a chat window, so you can open the buffer, make the change yourself, and let the agent continue from what is on disk. Nothing lands without a review step you control.",
      },
    ],
  },
};

const ES: FactsCopy = {
  siteTitle:
    "Mash - Un espacio de trabajo completo con agentes para macOS y Linux",
  siteDescription:
    "Mash es una sola aplicación con Herdr, Ghostty, Starship, Pi y Fresh ya conectados entre sí: agentes en paralelo, un camino de revisión que tú controlas y código que todavía puedes leer y editar a mano.",
  socialImageAlt:
    "Mash, un espacio de trabajo completo con agentes en una sola aplicación",
  applicationSubCategory: "Entorno de programación con agentes",
  features: [
    "Orquestación de agentes: un coordinador delega tareas en agentes trabajadores y reúne sus resultados",
    "Dictado con Pi Voice en un mensaje editable",
    "Un espacio de trabajo por tarea, cada uno con su propio agente",
    "Editor y agente de código en la misma pestaña",
    "Pestañas de revisión con el diff junto al agente",
    "Paleta de comandos y buscador difuso de archivos",
    "Búsqueda de sesiones en todas las conversaciones de los agentes",
    "Una cadena de herramientas completa instalada en el primer arranque",
    "Funciona en macOS y Linux, con un mapa de teclas para cada uno",
  ],
  capabilities: [
    "Orquestación de agentes: un coordinador delega tareas en agentes trabajadores y reúne sus resultados",
    "Dictado con Pi Voice en un mensaje editable",
    "Espacios de trabajo y worktrees, uno por tarea",
    "Un agente de código en cada espacio de trabajo",
    "Editor y agente en la misma pestaña",
    "Pestañas de revisión, con el diff junto al agente",
    "Paleta de comandos y buscador difuso de archivos",
    "Búsqueda de sesiones en todas las conversaciones de los agentes",
    "Control de versiones, anotaciones y paneles divididos",
    "Gestor de plugins y sesiones separables",
    "macOS en Apple silicon y Linux en amd64 o arm64",
  ],
  platforms: {
    mac: {
      requirement: "Mac con Apple silicon, macOS 14 o posterior",
      artifact: "Un DMG, firmado y notarizado",
    },
    linux: {
      requirement: "Ubuntu 24.04 con GNOME, en Wayland o Xorg",
      artifact: "Un .deb para amd64 o arm64, con atestación de compilación",
    },
  },
  films: {
    hero: {
      name: "Un recorrido por Mash",
      description:
        "La paleta de comandos, el selector de espacios de trabajo, el buscador de archivos y la pestaña de revisión de Mash, grabados en la propia aplicación.",
    },
    orchestration: {
      title: "Orquestación de agentes en Mash",
      description:
        "Un agente coordinador reparte el trabajo entre dos agentes trabajadores, responde a la pregunta de uno de ellos y reúne ambos resultados para que una persona los revise.",
    },
  },
  faq: {
    downloadQuestion: "¿Cómo lo descargo?",
    releaseLine: (version, publishedAt) =>
      publishedAt
        ? `Mash ${version} se publicó el ${formatReleaseDate(publishedAt, "es")}.`
        : `Mash ${version} es la última versión.`,
    missing: "La última versión está en la página de versiones de Mash.",
    tail: " Descarga la compilación para tu plataforma desde la página de versiones de Mash en GitHub, o usa el botón de descarga de esta página, que ofrece el archivo adecuado para tu equipo. Cada versión publica el DMG de macOS y las dos arquitecturas .deb de Linux al mismo tiempo.",
    items: [
      {
        question: "¿Qué es Mash?",
        answer:
          "Mash es una única aplicación que reúne un entorno completo de programación con agentes: Herdr para espacios de trabajo, pestañas y agentes; Ghostty para la terminal; Starship para el indicador del shell; Pi para programar; Fresh para editar; y las skills de Mash que enseñan el flujo de trabajo. Llega ya configurado, sin pedirte que montes esas herramientas tú mismo.",
      },
      {
        question: "¿Mash es gratis?",
        answer:
          "Sí. Mash es gratis y de código abierto bajo la licencia GPL-3.0-or-later, sin cuenta de Mash, suscripción ni compras dentro de la aplicación. Pi necesita un proveedor de modelos que eliges tú (OpenAI, Anthropic, OpenRouter o un endpoint compatible con OpenAI), y ese proveedor factura tu uso de modelos. Descargas un archivo para tu plataforma, lo instalas y el primer arranque configura el resto.",
      },
      {
        question: "¿En qué sistemas funciona Mash?",
        answer:
          "Mash funciona en macOS 14 o posterior sobre Apple silicon, y en Ubuntu 24.04 con GNOME sobre Wayland o Xorg. macOS llega como un único DMG firmado y notarizado; Linux llega como un .deb para amd64 o arm64, que se instala en /opt/letsmash y guarda todo lo que configures en ~/.mash. No hay compilación para Intel Mac ni para Windows.",
      },
      {
        question: "¿Tengo que instalar Pi, Herdr o las skills por mi cuenta?",
        answer:
          "No. La terminal, el agente, el editor y las skills vienen dentro de Mash. El primer arranque configura tu identidad de Git, te conecta a GitHub si quieres y añade las herramientas de línea de comandos y los servidores de lenguaje opcionales que elijas. En Linux van a ~/.mash sin pedir contraseña; en macOS los extras opcionales se instalan con Homebrew. Mash guarda su propio estado en ~/.mash y no toca tus archivos de configuración actuales.",
      },
      {
        question: "¿Puedo seguir editando el código a mano?",
        answer:
          "Sí, y Mash está pensado para eso. El agente trabaja en un panel junto al archivo, no detrás de una ventana de chat, así que puedes abrir el búfer, hacer el cambio tú mismo y dejar que el agente continúe desde lo que hay en el disco. Nada entra sin una revisión que tú controlas.",
      },
    ],
  },
};

export const FACTS: Record<Locale, FactsCopy> = { en: EN, es: ES };
