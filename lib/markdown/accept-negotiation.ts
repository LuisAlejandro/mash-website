export function acceptPrefersMarkdown(accept: string | null): boolean {
  if (!accept?.trim()) return false;

  const ranges = accept.split(",").flatMap((entry, order) => {
    const [mediaType, ...parameters] = entry.split(";");
    const type = mediaType.trim().toLowerCase();
    const specificity =
      type === "*/*"
        ? 0
        : type === "text/*"
          ? 1
          : type.startsWith("text/")
            ? 2
            : -1;
    if (
      specificity < 0 ||
      (specificity === 2 && type !== "text/markdown" && type !== "text/html")
    ) {
      return [];
    }

    let quality = 1;
    let hasQuality = false;
    for (const parameter of parameters) {
      const [name, ...values] = parameter.split("=");
      if (name.trim().toLowerCase() !== "q") continue;
      if (hasQuality || values.length !== 1) return [];

      const value = values[0].trim();
      if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value)) return [];
      quality = Number(value);
      hasQuality = true;
    }

    return [{ type, quality, specificity, order }];
  });

  const bestMatch = (mediaType: string) =>
    ranges
      .filter(
        (range) =>
          range.type === mediaType ||
          range.type === "text/*" ||
          range.type === "*/*"
      )
      .sort(
        (left, right) =>
          right.specificity - left.specificity || left.order - right.order
      )[0];

  const markdown = bestMatch("text/markdown");
  if (!markdown || markdown.quality === 0) return false;

  const html = bestMatch("text/html");
  if (!html || html.quality === 0) return true;
  if (markdown.quality !== html.quality) {
    return markdown.quality > html.quality;
  }
  if (markdown.specificity !== html.specificity) {
    return markdown.specificity > html.specificity;
  }
  return markdown.order < html.order;
}
