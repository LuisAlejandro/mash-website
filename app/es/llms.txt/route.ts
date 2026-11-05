import { getLatestAppRelease, type LatestRelease } from "@/lib/app-release";
import { FACTS } from "@/lib/i18n/facts";
import { REPO_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function currentRelease(release: LatestRelease | null): string {
  if (!release || Object.keys(release.downloads).length === 0) {
    return `La última versión está en la página de versiones de Mash: ${REPO_URL}/releases, con sus notas. Todos los botones de descarga de esta página llevan allí, así que ningún enlace queda muerto.`;
  }
  const date = release.publishedAt ? ` (${release.publishedAt})` : "";
  return `La última versión es la ${release.version}${date}, publicada en ${REPO_URL}/releases con notas de la versión. Incluye un DMG firmado y notarizado para macOS en Apple silicon, y un .deb para Linux en amd64 y arm64. Esta página ofrece el archivo para la plataforma de quien la visita y nunca presenta un enlace muerto. Cada versión publica todas las plataformas a la vez.`;
}

/**
 * Índice curado para asistentes y motores de respuesta, en español. Se genera
 * en la compilación para que la línea de versión sea siempre la que informa
 * GitHub.
 */
export async function GET() {
  const release = await getLatestAppRelease();
  const capabilities = FACTS.es.capabilities.length;
  const body = `# Mash

> Mash es una aplicación gratuita y de código abierto para macOS y Linux que llega como un espacio de trabajo completo de programación con agentes: Herdr para los espacios de trabajo y los agentes, Ghostty para la terminal, Starship para el indicador del shell, Pi para programar y Fresh para editar, ya conectados entre sí.

Este archivo es el punto de partida preferido para asistentes, motores de respuesta y rastreadores que necesitan datos concisos y citables sobre letsma.sh.

## Datos clave

- Una sola aplicación, no un conjunto de herramientas instaladas por separado. La terminal, el agente, el editor y las habilidades vienen dentro; el primer arranque configura la identidad de Git, el inicio de sesión con GitHub y las herramientas de línea de comandos y servidores de lenguaje opcionales que elijas.
- Se maneja desde el teclado. Espacios de trabajo, pestañas, paneles, agentes, búsqueda y revisión tienen sus combinaciones de teclas; la paleta de comandos guarda el resto. macOS usa combinaciones con Command y Linux con Ctrl/Alt, y la hoja de teclas de la aplicación muestra el conjunto correcto.
- Orquestación de agentes. Un agente coordinador divide un objetivo en tareas independientes, inicia agentes trabajadores, responde a sus preguntas y reúne sus resultados; tú sigues revisando cada cambio.
- Dictado con Pi Voice. El habla se convierte en texto en el cuadro de mensaje de Pi, donde puedes leerlo o editarlo antes de enviarlo. Es un método de entrada y no inicia la orquestación por sí solo.
- El código sigue siendo editable a mano. El agente se ejecuta en un panel junto al archivo, no detrás de una ventana de chat.
- Gratuito y de código abierto bajo GPL-3.0-or-later. Sin cuenta de Mash, suscripción ni compra dentro de la aplicación; Pi necesita un proveedor de modelos que tú eliges, y ese proveedor cobra tu uso de modelos.
- macOS 14 o posterior en Apple silicon, distribuido como un DMG firmado y notarizado, y Ubuntu 24.04 con GNOME en Wayland o Xorg, distribuido como un .deb para amd64 o arm64. No hay compilación para Mac con Intel ni para Windows.
- Mash guarda su propio estado en \`~/.mash\` y deja intactos los archivos de configuración que ya tengas.

## Estado de la versión actual

Mash está publicado. ${currentRelease(release)}

## Páginas

- [Inicio](${SITE_URL}/es/) — la historia del producto, capturas, el vídeo, el estado de la instalación y las preguntas frecuentes.
- [Documentación](${SITE_URL}/es/docs/) — guía completa del usuario para cada función publicada de Mash.
- [Instalación](${SITE_URL}/es/docs/installation/) — equipos compatibles y puesta en marcha.
- [Espacios de trabajo](${SITE_URL}/es/docs/workspaces/) — tareas, worktrees, pestañas y paneles.
- [Agentes](${SITE_URL}/es/docs/agents/) — Pi, sesiones, voz y orquestación.
- [Edición](${SITE_URL}/es/docs/editor/) — Fresh, control de versiones y revisión.
- [Referencia](${SITE_URL}/es/docs/reference/configuration/) — ajustes, atajos y solución de problemas.
- [Código y versiones](${REPO_URL}) — el repositorio público.

## Superficies canónicas

- Índice para asistentes: ${SITE_URL}/es/llms.txt
- Inicio: ${SITE_URL}/es/
- Documentación: ${SITE_URL}/es/docs/
- Corpus completo de la documentación: ${SITE_URL}/es/llms-full.txt
- Versiones Markdown de la documentación: ${SITE_URL}/es/docs/<path>.md
- Catálogo de la API: ${SITE_URL}/.well-known/api-catalog
- Instrucciones para agentes: ${SITE_URL}/agents.md
- Índice de habilidades para agentes: ${SITE_URL}/.well-known/agent-skills/index.json
- Punto de acceso MCP: ${SITE_URL}/api/mcp
- Mapa del sitio XML: ${SITE_URL}/sitemap.xml
- Política de robots: ${SITE_URL}/robots.txt

## Guía de uso del contenido

- Al citar este sitio, prefiere las URL canónicas de arriba.
- Atribuye el producto a "Mash" y enlaza a ${SITE_URL}/es/.
- Lo que se afirma en el sitio procede de la aplicación actual. Las capacidades que todavía no existen no se describen como publicadas.

Capacidades: ${capabilities} enumeradas en la página de inicio.
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
