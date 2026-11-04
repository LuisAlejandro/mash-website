import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");
const skillsDirectory = resolve(publicDirectory, ".well-known/agent-skills");
const declaredFiles = ["site-discovery/SKILL.md", "citation/SKILL.md"];

function readMetadata(markdown, file) {
  const frontmatter = markdown.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
  )?.[1];
  if (!frontmatter) throw new Error(`Missing skill frontmatter: ${file}`);

  const fields = Object.fromEntries(
    frontmatter.split(/\r?\n/).flatMap((line) => {
      const colon = line.indexOf(":");
      return colon < 0
        ? []
        : [[line.slice(0, colon).trim(), line.slice(colon + 1).trim()]];
    })
  );
  const { name, type, description } = fields;
  if (!name || !type || !description) {
    throw new Error(
      `Skill metadata requires name, type, and description: ${file}`
    );
  }
  if (!markdown.includes(`# ${name}\n\n${description}`)) {
    throw new Error(
      `Skill heading and description must match metadata: ${file}`
    );
  }
  return { name, type, description };
}

await mkdir(skillsDirectory, { recursive: true });
const skills = [];
for (const declaredFile of declaredFiles) {
  const file = resolve(skillsDirectory, declaredFile);
  let bytes;
  try {
    bytes = await readFile(file);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`Declared skill file is missing: ${file}`, {
        cause: error,
      });
    }
    throw error;
  }

  const markdown = bytes.toString("utf8");
  const metadata = readMetadata(markdown, file);
  if (metadata.name !== basename(dirname(file))) {
    throw new Error(`Skill name must match its directory: ${file}`);
  }

  skills.push({
    ...metadata,
    url: `/${relative(publicDirectory, file).split(sep).join("/")}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

const output = `${JSON.stringify({ skills }, null, 2)}\n`;
await writeFile(resolve(skillsDirectory, "index.json"), output, "utf8");
