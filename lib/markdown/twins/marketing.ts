import { getLatestAppRelease } from "@/lib/app-release";
import { FACTS } from "@/lib/i18n/facts";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { buildFaq } from "@/lib/structured-data";
import {
  getMarketingNarrative,
  latestLine,
  substituteMarketingPlaceholders,
} from "@/lib/markdown/marketing-copy";
import {
  CAPABILITIES,
  CAPTURES,
  DOWNLOAD_URL,
  FILM,
  LICENSE,
  ORCHESTRATION_FILM,
  RELEASES_URL,
  REPO_URL,
  SITE_URL,
} from "@/lib/site";

/**
 * The derived sections of the homepage twin, in one language.
 *
 * The facts come from the same arrays the page renders — `CAPABILITIES`,
 * `CAPTURES`, the films and the FAQ copy — so the Markdown cannot claim a
 * capability the page does not list, in either language.
 */
function derivedSections(
  locale: Locale,
  release: Awaited<ReturnType<typeof getLatestAppRelease>>
) {
  const platforms = FACTS[locale].platforms;
  const platformLines = [platforms.mac, platforms.linux].map(
    (platform) => `${platform.requirement}: ${platform.artifact}.`
  );

  if (locale === "en") {
    const availability = `## Capabilities

${CAPABILITIES.map((item) => `- ${item}`).join("\n")}

## Install and availability

- Platforms: macOS 14 or later on Apple silicon, and Ubuntu 24.04 with GNOME on
  Wayland or Xorg. No Intel Mac build, and no Windows build.
- Distribution: one signed and notarized DMG for macOS; a .deb for Linux on
  amd64 or arm64, installing to /opt/letsmash with build attestation.
- Keyboard: macOS uses Command chords, Linux uses Ctrl/Alt chords. The in-app
  keybinding sheet shows the keys for the machine you are on.
- Price: free, open source under ${LICENSE}. No Mash account, subscription, or
  in-app purchase; Pi needs a model provider you choose, and that provider bills
  your model usage.
- Current state: ${DOWNLOAD_URL ? `download at ${DOWNLOAD_URL}` : `${latestLine(release)} is published at ${RELEASES_URL} with release notes: a signed and notarized DMG for macOS on Apple silicon, and a .deb for Linux on amd64 and arm64. ${SITE_URL}/ offers the file for the visitor's platform. Every release publishes all platforms together.`}
- Source: ${REPO_URL}`;

    const captures = `## Captures

Each image below is a real state from the application.

${CAPTURES.map((c) => `- [${c.title}](${SITE_URL}${c.path}) — ${c.alt}`).join("\n")}
- [A tour of Mash](${SITE_URL}${FILM.path}) — the command palette,
  workspace picker, file finder, and review tab, recorded from the full Mash window (${FILM.duration.slice(2).toLowerCase()}).
- [${ORCHESTRATION_FILM.title}](${SITE_URL}${ORCHESTRATION_FILM.path}) — ${ORCHESTRATION_FILM.description} (${ORCHESTRATION_FILM.seconds}s).

## Questions

${buildFaq(release, locale)
  .map((item) => `### ${item.question}\n\n${item.answer}`)
  .join("\n\n")}`;

    return { availability, captures };
  }

  const availability = `## Capacidades

${FACTS[locale].capabilities.map((item) => `- ${item}`).join("\n")}

## Instalación y disponibilidad

- Plataformas: ${platformLines.join(" ")} No hay compilación para Mac con Intel ni para Windows.
- Distribución: ${platforms.mac.artifact} para macOS; ${platforms.linux.artifact} para Linux, que se instala en /opt/letsmash.
- Teclado: macOS usa combinaciones con Command y Linux con Ctrl/Alt. La hoja de teclas de la aplicación muestra las de tu equipo.
- Precio: gratuito y de código abierto bajo ${LICENSE}. Sin cuenta de Mash, suscripción ni compra dentro de la aplicación; Pi necesita un proveedor de modelos que tú eliges, y ese proveedor cobra tu uso de modelos.
- Estado actual: ${DOWNLOAD_URL ? `descarga en ${DOWNLOAD_URL}` : `${latestLine(release, locale)} se publica en ${RELEASES_URL} con notas de la versión: un DMG firmado y notarizado para macOS en Apple silicon, y un .deb para Linux en amd64 y arm64. ${SITE_URL}/es/ ofrece el archivo para tu plataforma. Cada versión publica todas las plataformas a la vez.`}
- Código fuente: ${REPO_URL}`;

  const captures = `## Capturas

Cada imagen es un estado real de la aplicación.

${CAPTURES.map((c) => `- [${c.title}](${SITE_URL}${c.path}) — ${c.alt}`).join("\n")}
- [${FACTS[locale].films.hero.name}](${SITE_URL}${FILM.path}) — ${FACTS[locale].films.hero.description} (${FILM.duration.slice(2).toLowerCase()}).
- [${FACTS[locale].films.orchestration.title}](${SITE_URL}${ORCHESTRATION_FILM.path}) — ${FACTS[locale].films.orchestration.description} (${ORCHESTRATION_FILM.seconds}s).

## Preguntas

${buildFaq(release, locale)
  .map((item) => `### ${item.question}\n\n${item.answer}`)
  .join("\n\n")}`;

  return { availability, captures };
}

/**
 * Markdown twin of the homepage, generated at build time from the same arrays
 * the page renders. Answer engines and assistants get the claims as text, and
 * the capability and FAQ lists cannot drift from the HTML.
 *
 * This is the only homepage Markdown renderer in each language: `/index.md`,
 * `/es/index.md` and the `.md` twin route all serve its output, so there is one
 * document per language to keep truthful.
 */
export async function marketingMarkdown(
  locale: Locale = DEFAULT_LOCALE
): Promise<string> {
  const release = await getLatestAppRelease();
  const { availability, captures } = derivedSections(locale, release);

  // The authored corpus carries placeholders for the derived sections, so the
  // prose stays editable without the layout living in two places.
  const narrative = substituteMarketingPlaceholders(
    getMarketingNarrative(locale),
    availability,
    captures
  );

  return `# Mash

${narrative}

---

${locale === "es" ? "Instantánea generada el" : "Snapshot generated at"}: ${new Date().toISOString()}
`;
}
