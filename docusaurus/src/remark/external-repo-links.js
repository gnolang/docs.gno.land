import path from "node:path";
import { visit } from "unist-util-visit";

// `href="..."` or `src='...'` in raw HTML: attribute name, quote, URL.
const HTML_URL = /\b(href|src)=("|')(.*?)\2/g;

/**
 * Rewrites a relative link that resolves outside the docs folder into an
 * absolute URL on the monorepo, in `link`, `image`, `definition` and raw HTML
 * nodes. An image goes to `rawURL`, anything else to `repoURL` under `blob` or
 * `tree`. A link inside the docs folder, an absolute URL and a target above the
 * repository root are left as written.
 *
 * Register under `beforeDefaultRemarkPlugins`.
 *
 * @param {{docsDir: string, repoURL: string, rawURL: string, repoRef: string}}
 * options docsDir matches the `path` of the docs preset, and the rest name the
 * repository and branch the docs were downloaded from.
 */
export default function externalRepoLinks({ docsDir, repoURL, rawURL, repoRef } = {}) {
  if (!docsDir || !repoURL || !rawURL || !repoRef) {
    throw new Error("external-repo-links: docsDir, repoURL, rawURL and repoRef are all required");
  }

  const docsRoot = path.resolve(docsDir);

  return (tree, file) => {
    if (!file.path) return;

    const fileDir = path.dirname(path.resolve(file.path));

    // Which definitions an image reads, since the definition itself cannot say.
    const imageIdentifiers = new Set();
    visit(tree, "imageReference", (node) => imageIdentifiers.add(node.identifier));

    const urlFor = (url, isImage) => {
      if (!url) return null;

      // The path, then the ?query#fragment carried onto the built URL.
      const [, target, suffix] = url.match(/^([^?#]*)(.*)$/);

      // Relative paths only.
      if (!target || /^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(target)) return null;

      const [up, ...rest] = path.relative(docsRoot, path.resolve(fileDir, target)).split(path.sep);

      // One level above the docs folder is the repository root, two is outside
      // the repository.
      if (up !== ".." || !rest.length || rest[0] === "..") return null;

      const repoPath = rest.join("/");
      if (isImage) return `${rawURL}/${repoRef}/${repoPath}${suffix}`;

      // A path carrying an extension is a file.
      const kind = path.extname(repoPath) ? "blob" : "tree";

      return `${repoURL}/${kind}/${repoRef}/${repoPath}${suffix}`;
    };

    visit(tree, ["link", "image", "definition", "html"], (node) => {
      // Raw HTML keeps its markup as a string.
      if (node.type === "html") {
        node.value = node.value.replace(HTML_URL, (attribute, name, quote, url) => {
          const rewritten = urlFor(url, name === "src");

          return rewritten ? `${name}=${quote}${rewritten}${quote}` : attribute;
        });

        return;
      }

      const rewritten = urlFor(node.url, node.type === "image" || imageIdentifiers.has(node.identifier));
      if (rewritten) node.url = rewritten;
    });
  };
}
