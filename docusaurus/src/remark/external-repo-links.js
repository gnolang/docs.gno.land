import path from "node:path";
import { visit } from "unist-util-visit";

/**
 * Rewrites every relative link that resolves outside the docs folder into an
 * absolute GitHub URL, leaving the markdown sources relative.
 *
 * The docs folder is the only part of the monorepo this site holds, so a link
 * climbing out of it has no page to point at and Docusaurus emits it verbatim:
 * `../../examples/gno.land/p/nt/avl/v0` ships as
 * `/examples/gno.land/p/nt/avl/v0` and returns 404. The target is a real file
 * in the monorepo, so the built page points there instead, at
 * `https://github.com/gnolang/gno/tree/master/examples/gno.land/p/nt/avl/v0`,
 * while the markdown keeps the relative link that resolves in a checkout.
 *
 * An image needs the file itself rather than the page around it, so it goes to
 * raw.githubusercontent.com. A `/blob/` URL answers with HTML and renders as a
 * broken image.
 *
 * Register the plugin under `beforeDefaultRemarkPlugins`. Docusaurus resolves
 * markdown links and reads images from disk before anything in `remarkPlugins`,
 * so registered there it inherits a warning on every link it is about to fix
 * and never sees an image at all: the build fails first on `Image ... not
 * found`.
 *
 * @param {{docsDir: string, repoURL: string, repoRef: string}} options docsDir
 * matches the `path` of the docs preset, and repoURL and repoRef name the
 * repository and branch the docs were downloaded from.
 */
export default function externalRepoLinks({ docsDir, repoURL, repoRef } = {}) {
  if (!docsDir || !repoURL || !repoRef) {
    throw new Error("external-repo-links: docsDir, repoURL and repoRef are all required");
  }

  const docsRoot = path.resolve(docsDir);
  const rawURL = repoURL.replace("https://github.com/", "https://raw.githubusercontent.com/");

  return (tree, file) => {
    if (!file.path) return;

    const fileDir = path.dirname(path.resolve(file.path));

    // A definition serves whichever reference names it, and only the reference
    // says whether the target is read as a page or as an image.
    const imageIdentifiers = new Set();
    visit(tree, "imageReference", (node) => imageIdentifiers.add(node.identifier));

    const target = (url, isAsset) => {
      const repoPath = externalRepoPath(url, fileDir, docsRoot);
      if (!repoPath) return null;

      return isAsset
        ? `${rawURL}/${repoRef}/${repoPath}`
        : `${repoURL}/${kindOf(repoPath)}/${repoRef}/${repoPath}`;
    };

    visit(tree, ["link", "image", "definition", "html"], (node) => {
      // Raw HTML reaches the page as written, so the attributes are rewritten
      // in the string itself.
      if (node.type === "html") {
        node.value = node.value.replace(
          /\b(href|src)=("|')(.*?)\2/g,
          (attribute, name, quote, url) => {
            const rewritten = target(url, name === "src");

            return rewritten ? `${name}=${quote}${rewritten}${quote}` : attribute;
          },
        );

        return;
      }

      const isAsset = node.type === "image" || imageIdentifiers.has(node.identifier);
      const rewritten = target(node.url, isAsset);
      if (rewritten) node.url = rewritten;
    });
  };
}

/**
 * Returns the `<path>?<query>#<fragment>` a link leaving the docs folder
 * addresses in the monorepo, or null for one the site can resolve on its own.
 */
function externalRepoPath(url, fileDir, docsDir) {
  if (!url || !isRelative(url)) return null;

  const [target, suffix] = splitTarget(url);
  if (!target) return null;

  const segments = path.relative(docsDir, path.resolve(fileDir, target)).split(path.sep);

  // In the monorepo the docs folder sits at the repository root, so a link
  // climbing one level above it is addressed from that root. One climbing two
  // levels leaves the repository and has no URL to build.
  if (segments[0] !== ".." || segments[1] === "..") return null;

  const repoPath = segments.slice(1).join("/");
  if (!repoPath) return null;

  return `${repoPath}${suffix}`;
}

// A path carrying an extension is a file. GitHub serves both under /tree/, but
// /blob/ is the URL a reader recognises.
function kindOf(repoPath) {
  return path.extname(repoPath.replace(/[?#].*$/, "")) ? "blob" : "tree";
}

// A link is relative when it addresses a path from the file holding it: not a
// URL, not a protocol-relative or site-absolute path, not a bare fragment.
function isRelative(url) {
  return !/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url);
}

// Splits a link into the path it addresses and the ?query#fragment that rides
// on the URL built from it
function splitTarget(url) {
  const start = url.search(/[?#]/);

  return start === -1 ? [url, ""] : [url.slice(0, start), url.slice(start)];
}
