import path from "node:path";
import { visit } from "unist-util-visit";

// Splits a URL: `../x.md?plain=1#L3` -> `../x.md` + `?plain=1#L3`
const URL_PARTS = /^([^?#]*)(.*)$/;

// Matches a URL that is not relative: `https://x`, `mailto:x`, `/x`
const ABSOLUTE = /^([a-z][a-z0-9+.-]*:|\/)/i;

// Matches the href of an HTML tag: `href="../x"`, `href='../x'`
const HTML_HREF = /\bhref=("|')(.*?)\1/g;

/**
 * Rewrites a relative link that resolves outside the docs folder into a GitHub
 * URL on the monorepo, in `link`, `definition` and raw HTML nodes. A link
 * inside the docs folder, an absolute URL and a target above the repository
 * root are left as written.
 *
 * Register under `beforeDefaultRemarkPlugins`.
 *
 * @param {{docsDir: string, docsPath: string, repoURL: string,
 * repoRef: string}} settings all required. docsDir matches the `path` of the
 * docs preset, docsPath is where that folder sits in the repository, and the
 * rest name the repository and branch the docs were downloaded from.
 */
export default function externalRepoLinks({ docsDir, docsPath, repoURL, repoRef } = {}) {
  for (const [name, value] of Object.entries({ docsDir, docsPath, repoURL, repoRef })) {
    if (!value) throw new Error(`external-repo-links: ${name} is required`);
  }

  const docsRoot = path.resolve(docsDir);

  return (tree, file) => {
    if (!file.path) return;

    const fileDir = path.dirname(path.resolve(file.path));

    const urlFor = (url) => {
      if (!url) return null;

      const [, target, suffix] = url.match(URL_PARTS);
      if (!target || ABSOLUTE.test(target)) return null;

      // Target seen from the docs folder: `resources/a.md` + `../../misc/x` -> `../misc/x`
      const fromDocs = path.relative(docsRoot, path.resolve(fileDir, target)).split(path.sep).join("/");

      // No `../`: the target is inside the docs folder, the site resolves it
      if (!fromDocs.startsWith("../")) return null;

      // Same target from the repository root: `../misc/x` -> `misc/x`
      const repoPath = path.posix.join(docsPath, fromDocs);

      // Still `../`: above the repository root, nothing to point at
      if (repoPath.startsWith("../")) return null;

      // Extension means a file: `file` -> blob, `directory` -> tree
      const kind = path.extname(repoPath) ? "blob" : "tree";

      return `${repoURL}/${kind}/${repoRef}/${repoPath}${suffix}`;
    };

    visit(tree, ["link", "definition", "html"], (node) => {
      // Raw HTML keeps its markup as a string
      if (node.type === "html") {
        node.value = node.value.replace(HTML_HREF, (attribute, quote, url) => {
          const rewritten = urlFor(url);

          return rewritten ? `href=${quote}${rewritten}${quote}` : attribute;
        });

        return;
      }

      const rewritten = urlFor(node.url);
      if (rewritten) node.url = rewritten;
    });
  };
}
