import { defineI18n } from "fumadocs-core/i18n";
import { i18nProvider, uiTranslations } from "fumadocs-ui/i18n";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locale";

/**
 * The docs collection's languages.
 *
 * English is the hidden default, so its URLs stay `/docs/...`; every other
 * language is prefixed and lives in its own route tree. `parser: "dot"` reads
 * `page.es.mdx` and `meta.es.json` beside their English originals, and
 * `fallbackLanguage: null` means a missing Spanish page is missing rather than
 * silently English.
 */
export const docsI18n = defineI18n({
  languages: [...LOCALES],
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  parser: "dot",
  fallbackLanguage: null,
});

/**
 * Fumadocs' own chrome — search, table of contents, pagination, page actions —
 * in each language the docs publish. Keys are Fumadocs' translation keys; a key
 * left out falls back to its English wording.
 */
const FUMADOCS_ES: Record<string, string> = {
  "Ask AI(AI chat button)": "Preguntar a la IA",
  "Back to Home(404 page)": "Volver al inicio",
  "Choose a language(language switcher)": "Elegir idioma",
  "Choose a language(language switcher)(aria-label)": "Elegir idioma",
  "Close Banner(banner)(aria-label)": "Cerrar el aviso",
  "Close Search(search dialog)(aria-label)": "Cerrar la búsqueda",
  "Close Sidebar(aria-label)": "Cerrar la barra lateral",
  "Close Sidebar(sidebar)(aria-label)": "Cerrar la barra lateral",
  "Close(image zoom)(aria-label)": "Cerrar",
  "Collapse Sidebar(sidebar)(aria-label)": "Contraer la barra lateral",
  "Copied Anchor Link(heading anchor)(aria-label)":
    "Enlace del apartado copiado",
  "Copied Link(accordion)(aria-label)": "Enlace copiado",
  "Copied Markdown(page actions)": "Markdown copiado",
  "Copied Text(code block)(aria-label)": "Texto copiado",
  "Copy Anchor Link(heading anchor)(aria-label)":
    "Copiar el enlace del apartado",
  "Copy Link(accordion)(aria-label)": "Copiar el enlace",
  "Copy Markdown(page actions)": "Copiar Markdown",
  "Copy Text(code block)(aria-label)": "Copiar el texto",
  "Dark(theme switcher)(aria-label)": "Oscuro",
  "Default(type table)": "Predeterminado",
  "Edit on GitHub(edit page)": "Editar en GitHub",
  "Hide Sidebar(sidebar)": "Ocultar la barra lateral",
  "Image Viewer(image zoom)(aria-label)": "Visor de imágenes",
  "Last updated on(page footer)": "Última actualización:",
  "Layout Tab(layout tab trigger)": "Pestaña de diseño",
  "Light(theme switcher)(aria-label)": "Claro",
  "Next Image(image zoom)(aria-label)": "Imagen siguiente",
  "Next Page(pagination)": "Página siguiente",
  "No Headings(table of contents)": "Sin apartados",
  "No results found(search dialog)": "No se encontraron resultados",
  "On this page(table of contents)": "En esta página",
  "Open Search(search trigger)(aria-label)": "Abrir la búsqueda",
  "Open Sidebar(sidebar)(aria-label)": "Abrir la barra lateral",
  "Open in ChatGPT(page actions)": "Abrir en ChatGPT",
  "Open in Claude(page actions)": "Abrir en Claude",
  "Open in Cursor(page actions)": "Abrir en Cursor",
  "Open in GitHub(page actions)": "Abrir en GitHub",
  "Open in Scira AI(page actions)": "Abrir en Scira AI",
  "Open(page actions)": "Abrir",
  "Page Not Found(404 page)": "Página no encontrada",
  "Parameters(type table)": "Parámetros",
  "Previous Image(image zoom)(aria-label)": "Imagen anterior",
  "Previous Page(pagination)": "Página anterior",
  "Prop(type table)": "Propiedad",
  "Read {url}, I want to ask questions about it.(page actions)":
    "Lee {url}, quiero hacer preguntas al respecto.",
  "Returns(type table)": "Devuelve",
  "Search failed(search dialog)": "La búsqueda falló",
  "Search failed, showing results for {query}(search dialog)":
    "La búsqueda falló; se muestran resultados para {query}",
  "Search(search dialog)": "Buscar",
  "Search(search trigger)": "Buscar",
  "Show Sidebar(sidebar)": "Mostrar la barra lateral",
  "System(theme switcher)(aria-label)": "Sistema",
  "Table of Contents(inline table of contents)": "Índice",
  "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
    "Puede que la página que buscas se haya eliminado, haya cambiado de nombre o no esté disponible temporalmente.",
  "Toggle Menu(mobile menu)(aria-label)": "Abrir o cerrar el menú",
  "Toggle Theme(theme switcher)(aria-label)": "Cambiar el tema",
  "Type(type table)": "Tipo",
  "View as Markdown(page actions)": "Ver como Markdown",
};

const translations = docsI18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: { displayName: "English" },
    es: { displayName: "Español", ...FUMADOCS_ES },
  });

/** The provider props that put Fumadocs' chrome in `locale`. */
export function docsI18nProvider(locale: Locale) {
  return i18nProvider(translations, locale);
}
