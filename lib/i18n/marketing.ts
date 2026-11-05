/**
 * The homepage's own copy, in each language.
 *
 * Structure — where a screenshot sits, which chord a row prints, which anchor
 * a section owns — stays in the components. This file holds only the words, so
 * a translation can never move a section, change a download target, or drop a
 * keyboard shortcut.
 */
import type { Locale } from "./locale.ts";

/** A heading with one emphasized phrase, rendered as `<h2>{text}<em>…</em>{after}</h2>`. */
export type Heading = { text: string; emphasis: string; after?: string };

export const CHAPTER_IDS = [
  "setup",
  "workspaces",
  "code",
  "review",
  "keyboard",
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export type ChapterCopy = {
  eyebrow: string;
  heading: Heading;
  body: string;
  /** Row labels, in the same order as the chords in `chapters.tsx`. */
  points: string[];
  /** The screenshot window's title bar. */
  title: string;
  alt: string;
};

export type MarketingCopy = {
  /** Opens every permalink's accessible name, before the section's name. */
  permalink: string;
  hero: {
    eyebrow: string;
    sloganLead: string;
    sloganTail: string;
    lede: string;
    note: string;
    filmAria: string;
    makerTitle: string;
    makerLead: string;
    makerTail: string;
    vulnerability: string;
    safeguards: string[];
  };
  /** The scrolling capability words under the hero. */
  ticker: string[];
  chapters: Record<ChapterId, ChapterCopy>;
  chaptersAria: string;
  workflow: {
    eyebrow: string;
    label: string;
    heading: Heading;
    body: string;
    steps: { label: string; alt: string }[];
  };
  spotlights: {
    aria: string;
    orchestration: {
      eyebrow: string;
      label: string;
      heading: Heading;
      body: string;
      videoAria: string;
      beats: string[];
    };
    voice: {
      eyebrow: string;
      label: string;
      heading: Heading;
      /** Sits around the inline `<kbd>⌃⌥Z</kbd>`. */
      bodyBefore: string;
      bodyAfter: string;
      steps: { label: string; alt: string }[];
    };
  };
  install: {
    eyebrow: string;
    label: string;
    heading: Heading;
    ready: (version: string) => string;
    fallback: string;
    cardTitle: (version: string, platform: string) => string;
    cardTitleFallback: (platform: string) => string;
    cardPermalink: (platform: string) => string;
    linuxNote: string;
    macNote: string;
    releaseNotes: string;
    fallbackNote: string;
    releasesPage: string;
    capabilitiesEyebrow: string;
    capabilitiesLabel: string;
    capabilitiesHeading: Heading;
    capabilitiesPermalink: string;
  };
  faq: { eyebrow: string; label: string; heading: Heading };
  closing: { kicker: string; tag: Heading; fine: string };
  tracks: { en: string; es: string };
};

const EN: MarketingCopy = {
  permalink: "Permalink to ",
  hero: {
    eyebrow: "Mash · macOS and Linux",
    sloganLead: "Let's mash",
    sloganTail: "together.",
    lede: "Mash arrives as one app with the stack already wired together: Herdr for workspaces and agents, Ghostty for the terminal, Starship for the prompt, Pi for the coding, and Fresh for the editing, with the Mash skills that teach your workflow. Everything runs from the keyboard, and the code stays visible and editable by hand.",
    note: "Apple silicon Mac · Ubuntu 24.04 · nothing to assemble",
    filmAria:
      "A short tour of Mash: the command palette, the workspace picker, the file finder, and the review tab",
    makerTitle: "Who's behind Mash",
    makerLead:
      "Built and maintained by Luis Alejandro, a software engineer since 2009, author of ",
    makerTail: " (294K+ downloads) and 60+ open source projects.",
    vulnerability: "Report a vulnerability",
    safeguards: [
      "Signed & notarized on macOS",
      "Build provenance on Linux",
      "SHA-256 checksums",
      "GPL-3.0 open source",
    ],
  },
  ticker: [
    "Workspaces",
    "Worktrees",
    "Agent per workspace",
    "Review tabs",
    "Command palette",
    "File finder",
    "Session search",
    "Session navigator",
    "Source control",
    "Annotations",
    "Pane splits",
    "Plugin manager",
    "Fork from message",
    "Editor and agent",
    "Diff review",
    "Markdown preview",
    "Keyboard-first",
  ],
  chapters: {
    setup: {
      eyebrow: "01 · Ready to work",
      heading: { text: "Nothing to ", emphasis: "assemble." },
      body: "Most agentic setups are a weekend of wiring: an agent, a workspace manager, a set of skills, a keybinding file. Mash ships them already fitted together and opens on a workspace you can type in.",
      points: [
        "shipped inside the app, with the Mash skills that teach the workflow",
        "sets your Git identity, GitHub sign-in, and the tooling you pick",
        "holds Mash's own state, and your existing configs stay as they are",
      ],
      title: "mash — workspace",
      alt: "A Mash workspace: the agent sessions panel on the left, the file explorer and editor in the middle, and the agent's session notes beside them",
    },
    workspaces: {
      eyebrow: "02 · Parallel work",
      heading: { text: "One task, one ", emphasis: "workspace." },
      body: "Each task gets its own workspace with its own tabs, terminals, and agent, so separate projects never pile into one window. Move between workspaces and agents from the keyboard while the rest keep running.",
      points: [
        "new workspace",
        "switch to workspace N",
        "previous and next agent",
        "session navigator",
      ],
      title: "mash — workspace picker",
      alt: "Mash's workspace picker listing four workspaces, each a separate project with its own path, tabs, and agents",
    },
    code: {
      eyebrow: "03 · Human control",
      heading: { text: "The code stays ", emphasis: "yours." },
      body: "The agent works in a pane beside the file, not behind a chat window. Open the buffer, make the change yourself, and the agent picks up from what is on disk.",
      points: [
        "dev tab with the editor and an agent",
        "file finder",
        "pick a link or an ID out of the agent's output",
        "source control",
      ],
      title: "mash — file finder",
      alt: "Mash's file finder open over the editor, listing the repository's files and previewing the selected one's source",
    },
    review: {
      eyebrow: "04 · Review",
      heading: { text: "Speed still ends in a ", emphasis: "human review." },
      body: "Agents propose and you decide what lands. Open a review tab for the branch, read the diff, and act on it hunk by hunk before anything is committed.",
      points: [
        "review tab, with the diff and an agent together",
        "annotate a capture for the review",
        "fork an agent from one of its messages",
      ],
      title: "mash — herdr-review",
      alt: "Mash's review tab: uncommitted changes, the working diff, local branches with their ahead counts, and recent commits",
    },
    keyboard: {
      eyebrow: "05 · Keyboard first",
      heading: { text: "Everything is ", emphasis: "a keystroke away." },
      body: "Workspaces, tabs, panes, agents, search, and review all have keys, and the command palette holds the rest. Learn a handful and the app shows you the others as you go. The mouse works too.",
      points: [
        "command palette",
        "search every session",
        "settings",
        "the keybinding sheet",
      ],
      title: "mash — command palette",
      alt: "Mash's command palette open over a workspace, each command shown with the key combination that runs it",
    },
  },
  chaptersAria: "How Mash works",
  workflow: {
    eyebrow: "06 · The whole loop",
    label: "The whole loop",
    heading: {
      text: "Intent in, ",
      emphasis: "reviewed result",
      after: " out.",
    },
    body: "One task, followed all the way through the app: an idea becomes a workspace, agents work beside the code, a human fixes something by hand, the diff is reviewed, and the change lands.",
    steps: [
      {
        label: "A workspace per task",
        alt: "Mash's workspace picker, one workspace per project",
      },
      {
        label: "Agents beside the code",
        alt: "A Mash workspace with the agent session list and the editor side by side",
      },
      {
        label: "Changes under review",
        alt: "Mash's review tab showing the working diff and branch status",
      },
      {
        label: "Commands at hand",
        alt: "Mash's command palette listing commands with their key combinations",
      },
    ],
  },
  spotlights: {
    aria: "New in Mash",
    orchestration: {
      eyebrow: "Agent orchestration",
      label: "agent orchestration",
      heading: {
        text: "Delegate in parallel. ",
        emphasis: "Stay the decision-maker.",
      },
      body: "A coordinator agent splits a goal into independent tasks, starts worker agents beside you, answers their questions, and gathers what they finished. You still inspect and review every change.",
      videoAria:
        "Mash orchestration: two agents edit separate files, one asks the coordinator a question, and both report results for review",
      beats: [
        "Split the work",
        "Answer worker questions",
        "Gather results, then review",
      ],
    },
    voice: {
      eyebrow: "Pi Voice dictation",
      label: "Pi Voice dictation",
      heading: {
        text: "Talk through the task. ",
        emphasis: "Edit before it is sent.",
      },
      bodyBefore:
        "Dictate to Pi when typing is slower than saying it. Speech becomes text in the message box, so you can read or edit the request before you send it. On macOS, ",
      bodyAfter: " starts and stops dictation.",
      steps: [
        {
          label: "Start dictation",
          alt: "Pi in Mash showing the voice recording meter with the controls to transcribe or discard",
        },
        {
          label: "Check the text",
          alt: "Pi in Mash showing a spoken request transcribed into the message box before it is sent",
        },
      ],
    },
  },
  install: {
    eyebrow: "Install",
    label: "Install",
    heading: { text: "One download. ", emphasis: "Nothing to assemble." },
    ready: (version) =>
      `Mash ${version} for macOS and Linux. Install it, and the first launch sets up Git, your agent, and the skills.`,
    fallback:
      "Download the latest build from the Mash releases page, with its release notes.",
    cardTitle: (version, platform) => `Mash ${version} for ${platform}`,
    cardTitleFallback: (platform) => `Mash for ${platform}`,
    cardPermalink: (platform) => `the ${platform} download`,
    linuxNote: ".deb packages · checksums and attestations in the ",
    macNote: "Apple silicon · DMG · checksums in the ",
    releaseNotes: "release notes",
    fallbackNote: "Builds and notes are on the ",
    releasesPage: "releases page",
    capabilitiesEyebrow: "Everything else",
    capabilitiesLabel: "the capability list",
    capabilitiesHeading: {
      text: "And the rest is ",
      emphasis: "already there.",
    },
    capabilitiesPermalink: "Permalink to the capability list",
  },
  faq: {
    eyebrow: "Questions",
    label: "Questions",
    heading: { text: "The short ", emphasis: "answers." },
  },
  closing: {
    kicker: "Your next task has somewhere to go.",
    tag: {
      text: "A complete agentic workspace, ",
      emphasis: "in one app.",
    },
    fine: "macOS on Apple silicon · Linux on amd64 and arm64",
  },
  tracks: { en: "English", es: "Español" },
};

const ES: MarketingCopy = {
  permalink: "Enlace permanente a ",
  hero: {
    eyebrow: "Mash · macOS y Linux",
    sloganLead: "Mezclemos",
    sloganTail: "y el resto.",
    lede: "Mash llega como una sola aplicación con todo el stack ya conectado: Herdr para espacios de trabajo y agentes, Ghostty para la terminal, Starship para el indicador, Pi para programar y Fresh para editar, junto con las skills de Mash que enseñan tu flujo de trabajo. Todo se maneja con el teclado, y el código sigue visible y editable a mano.",
    note: "Mac con Apple silicon · Ubuntu 24.04 · nada que montar",
    filmAria:
      "Un recorrido breve por Mash: la paleta de comandos, el selector de espacios de trabajo, el buscador de archivos y la pestaña de revisión",
    makerTitle: "Quién está detrás de Mash",
    makerLead:
      "Creado y mantenido por Luis Alejandro, ingeniero de software desde 2009, autor de ",
    makerTail:
      " (más de 294.000 descargas) y de más de 60 proyectos de código abierto.",
    vulnerability: "Informar de una vulnerabilidad",
    safeguards: [
      "Firmado y notarizado en macOS",
      "Procedencia de compilación en Linux",
      "Sumas de comprobación SHA-256",
      "Código abierto GPL-3.0",
    ],
  },
  ticker: [
    "Espacios de trabajo",
    "Worktrees",
    "Un agente por espacio",
    "Pestañas de revisión",
    "Paleta de comandos",
    "Buscador de archivos",
    "Búsqueda de sesiones",
    "Navegador de sesiones",
    "Control de versiones",
    "Anotaciones",
    "Paneles divididos",
    "Gestor de plugins",
    "Bifurcar desde un mensaje",
    "Editor y agente",
    "Revisión de diffs",
    "Vista previa de Markdown",
    "Pensado para el teclado",
  ],
  chapters: {
    setup: {
      eyebrow: "01 · Listo para trabajar",
      heading: { text: "Nada que ", emphasis: "montar." },
      body: "Casi todas las configuraciones con agentes son un fin de semana de cableado: un agente, un gestor de espacios de trabajo, un conjunto de skills, un archivo de atajos. Mash los trae ya encajados y abre en un espacio de trabajo donde puedes escribir.",
      points: [
        "incluidos en la aplicación, con las skills de Mash que enseñan el flujo de trabajo",
        "configura tu identidad de Git, tu sesión de GitHub y las herramientas que elijas",
        "guarda el estado propio de Mash, y tus configuraciones actuales quedan como están",
      ],
      title: "mash — espacio de trabajo",
      alt: "Un espacio de trabajo de Mash: el panel de sesiones de agentes a la izquierda, el explorador de archivos y el editor en el centro, y las notas de sesión del agente al lado",
    },
    workspaces: {
      eyebrow: "02 · Trabajo en paralelo",
      heading: { text: "Una tarea, un ", emphasis: "espacio de trabajo." },
      body: "Cada tarea tiene su propio espacio de trabajo, con sus pestañas, sus terminales y su agente, así que los proyectos distintos nunca se amontonan en una sola ventana. Cambia de espacio y de agente con el teclado mientras el resto sigue funcionando.",
      points: [
        "espacio de trabajo nuevo",
        "cambiar al espacio N",
        "agente anterior y siguiente",
        "navegador de sesiones",
      ],
      title: "mash — selector de espacios de trabajo",
      alt: "El selector de espacios de trabajo de Mash, con cuatro espacios, cada uno un proyecto distinto con su ruta, sus pestañas y sus agentes",
    },
    code: {
      eyebrow: "03 · Control humano",
      heading: { text: "El código sigue siendo ", emphasis: "tuyo." },
      body: "El agente trabaja en un panel junto al archivo, no detrás de una ventana de chat. Abre el búfer, haz el cambio tú mismo y el agente continúa desde lo que hay en el disco.",
      points: [
        "pestaña de desarrollo con el editor y un agente",
        "buscador de archivos",
        "elegir un enlace o un ID de la salida del agente",
        "control de versiones",
      ],
      title: "mash — buscador de archivos",
      alt: "El buscador de archivos de Mash abierto sobre el editor, con los archivos del repositorio y una vista previa del código del archivo elegido",
    },
    review: {
      eyebrow: "04 · Revisión",
      heading: {
        text: "La velocidad termina en una ",
        emphasis: "revisión humana.",
      },
      body: "Los agentes proponen y tú decides qué entra. Abre una pestaña de revisión para la rama, lee el diff y actúa bloque a bloque antes de que nada quede confirmado.",
      points: [
        "pestaña de revisión, con el diff y un agente juntos",
        "anotar una captura para la revisión",
        "bifurcar un agente desde uno de sus mensajes",
      ],
      title: "mash — herdr-review",
      alt: "La pestaña de revisión de Mash: cambios sin confirmar, el diff de trabajo, ramas locales con sus confirmaciones por delante y confirmaciones recientes",
    },
    keyboard: {
      eyebrow: "05 · Primero el teclado",
      heading: { text: "Todo está ", emphasis: "a una tecla." },
      body: "Los espacios de trabajo, las pestañas, los paneles, los agentes, la búsqueda y la revisión tienen teclas, y la paleta de comandos guarda el resto. Aprende unas pocas y la aplicación te enseña las demás sobre la marcha. El ratón también funciona.",
      points: [
        "paleta de comandos",
        "buscar en todas las sesiones",
        "ajustes",
        "la hoja de atajos",
      ],
      title: "mash — paleta de comandos",
      alt: "La paleta de comandos de Mash abierta sobre un espacio de trabajo, con cada comando y la combinación de teclas que lo ejecuta",
    },
  },
  chaptersAria: "Cómo funciona Mash",
  workflow: {
    eyebrow: "06 · El ciclo completo",
    label: "el ciclo completo",
    heading: {
      text: "Entra la intención, ",
      emphasis: "sale el resultado revisado",
      after: ".",
    },
    body: "Una tarea, seguida de principio a fin por la aplicación: una idea se convierte en un espacio de trabajo, los agentes trabajan junto al código, una persona arregla algo a mano, se revisa el diff y el cambio entra.",
    steps: [
      {
        label: "Un espacio de trabajo por tarea",
        alt: "El selector de espacios de trabajo de Mash, un espacio por proyecto",
      },
      {
        label: "Agentes junto al código",
        alt: "Un espacio de trabajo de Mash con la lista de sesiones de agentes y el editor uno al lado del otro",
      },
      {
        label: "Cambios en revisión",
        alt: "La pestaña de revisión de Mash con el diff de trabajo y el estado de la rama",
      },
      {
        label: "Comandos a mano",
        alt: "La paleta de comandos de Mash con los comandos y sus combinaciones de teclas",
      },
    ],
  },
  spotlights: {
    aria: "Novedades en Mash",
    orchestration: {
      eyebrow: "Orquestación de agentes",
      label: "la orquestación de agentes",
      heading: {
        text: "Delega en paralelo. ",
        emphasis: "Tú sigues decidiendo.",
      },
      body: "Un agente coordinador divide un objetivo en tareas independientes, arranca agentes trabajadores a tu lado, responde a sus preguntas y reúne lo que han terminado. Tú sigues inspeccionando y revisando cada cambio.",
      videoAria:
        "Orquestación en Mash: dos agentes editan archivos distintos, uno pregunta al coordinador y ambos entregan sus resultados para revisarlos",
      beats: [
        "Reparte el trabajo",
        "Responde a los agentes",
        "Reúne los resultados y revisa",
      ],
    },
    voice: {
      eyebrow: "Dictado con Pi Voice",
      label: "el dictado con Pi Voice",
      heading: {
        text: "Habla del problema. ",
        emphasis: "Edita antes de enviarlo.",
      },
      bodyBefore:
        "Díctale a Pi cuando escribir sea más lento que decirlo. El habla se convierte en texto dentro del cuadro de mensaje, así que puedes leer o editar la petición antes de enviarla. En macOS, ",
      bodyAfter: " inicia y detiene el dictado.",
      steps: [
        {
          label: "Empieza el dictado",
          alt: "Pi en Mash mostrando el medidor de grabación de voz con los controles para transcribir o descartar",
        },
        {
          label: "Revisa el texto",
          alt: "Pi en Mash mostrando una petición hablada transcrita en el cuadro de mensaje antes de enviarla",
        },
      ],
    },
  },
  install: {
    eyebrow: "Instalación",
    label: "la instalación",
    heading: { text: "Una descarga. ", emphasis: "Nada que montar." },
    ready: (version) =>
      `Mash ${version} para macOS y Linux. Instálalo y el primer arranque configura Git, tu agente y las skills.`,
    fallback:
      "Descarga la última compilación desde la página de versiones de Mash, con sus notas de versión.",
    cardTitle: (version, platform) => `Mash ${version} para ${platform}`,
    cardTitleFallback: (platform) => `Mash para ${platform}`,
    cardPermalink: (platform) => `la descarga de ${platform}`,
    linuxNote: "Paquetes .deb · sumas de comprobación y atestaciones en las ",
    macNote: "Apple silicon · DMG · sumas de comprobación en las ",
    releaseNotes: "notas de versión",
    fallbackNote: "Las compilaciones y las notas están en la ",
    releasesPage: "página de versiones",
    capabilitiesEyebrow: "Todo lo demás",
    capabilitiesLabel: "la lista de capacidades",
    capabilitiesHeading: {
      text: "Y el resto ya ",
      emphasis: "está ahí.",
    },
    capabilitiesPermalink: "Enlace permanente a la lista de capacidades",
  },
  faq: {
    eyebrow: "Preguntas",
    label: "las preguntas",
    heading: { text: "Las respuestas ", emphasis: "cortas." },
  },
  closing: {
    kicker: "Tu próxima tarea ya tiene dónde ir.",
    tag: {
      text: "Un espacio de trabajo completo con agentes, ",
      emphasis: "en una sola aplicación.",
    },
    fine: "macOS en Apple silicon · Linux en amd64 y arm64",
  },
  tracks: { en: "English", es: "Español" },
};

export const MARKETING: Record<Locale, MarketingCopy> = { en: EN, es: ES };
