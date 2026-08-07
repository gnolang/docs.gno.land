import path from "node:path";
import { visit } from "unist-util-visit";

// One URL-carrying attribute of a raw HTML tag, `href="../x"` or `src='../x'`.
// The captures are the attribute name, the opening quote, and the URL up to the
// same quote closing it.
const HTML_URL = /\b(href|src)=("|')(.*?)\2/g;

/**
 * Rewrites every relative link that resolves outside the docs folder into an
 * absolute GitHub URL, leaving the markdown sources relative.
 *
 * The docs folder is the only part of the monorepo this site holds, so a link
 * climbing out of it has no page to point at and Docusaurus emits it verbatim:
 * `../../examples/gno.land/p/nt/avl/v0` ships as
 * `/examples/gno.land/p/nt/avl/v0` and returns 404. The built page points at
 * the monorepo instead, while the markdown keeps the relative link that
 * resolves in a checkout.
 *
 * An image goes to `rawURL`, everything else to `repoURL`, because a blob URL
 * answers with HTML and renders as a broken image.
 *
 * Register under `beforeDefaultRemarkPlugins`. Docusaurus resolves markdown
 * links and reads images off disk ahead of `remarkPlugins`, so a plugin
 * registered there runs too late to do either job.
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

    // A definition serves whichever reference names it, and only the reference
    // says whether the target is read as a page or as an image.
    const imageIdentifiers = new Set();
    visit(tree, "imageReference", (node) => imageIdentifiers.add(node.identifier));

    const urlFor = (url, isImage) => {
      if (!url) return null;

      // The path the link addresses, then the ?query#fragment that rides on the
      // URL built from it.
      const [, target, suffix] = url.match(/^([^?#]*)(.*)$/);

      // Only a path relative to the file holding it can leave the docs folder.
      if (!target || /^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(target)) return null;

      const [up, ...rest] = path.relative(docsRoot, path.resolve(fileDir, target)).split(path.sep);

      // In the monorepo the docs folder sits at the repository root, so a link
      // climbing one level above it is addressed from that root. One climbing
      // two levels leaves the repository and has no URL to build.
      if (up !== ".." || !rest.length || rest[0] === "..") return null;

      const repoPath = rest.join("/");
      if (isImage) return `${rawURL}/${repoRef}/${repoPath}${suffix}`;

      // A path carrying an extension is a file. GitHub serves both under
      // /tree/, but /blob/ is the URL a reader recognises.
      const kind = path.extname(repoPath) ? "blob" : "tree";

      return `${repoURL}/${kind}/${repoRef}/${repoPath}${suffix}`;
    };

    visit(tree, ["link", "image", "definition", "html"], (node) => {
      // Raw HTML reaches the page as written, so the attributes are rewritten
      // in the string itself.
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
