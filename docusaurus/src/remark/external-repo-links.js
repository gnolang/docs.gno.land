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
 * @param {{docsDir: string, repoURL: string, repoRef: string}} options docsDir
 * matches the `path` of the docs preset, and repoURL and repoRef name the
 * repository and branch the docs were downloaded from.
 */
export default function externalRepoLinks({ docsDir, repoURL, repoRef } = {}) {
  if (!docsDir || !repoURL || !repoRef) {
    throw new Error("external-repo-links: docsDir, repoURL and repoRef are all required");
  }

  const docsRoot = path.resolve(docsDir);

  return (tree, file) => {
    if (!file.path) return;

    const fileDir = path.dirname(path.resolve(file.path));

    visit(tree, ["link", "definition"], (node) => {
      const repoPath = externalRepoPath(node.url, fileDir, docsRoot, repoRef);
      if (!repoPath) return;

      node.url = `${repoURL}/${repoPath}`;
    });
  };
}

/**
 * Returns the `<kind>/<ref>/<path>` a link leaving the docs folder addresses in
 * the monorepo, or null for one the site can resolve on its own.
 */
function externalRepoPath(url, fileDir, docsDir, repoRef) {
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

  // A path carrying an extension is a file. GitHub serves both under /tree/,
  // but /blob/ is the URL a reader recognises.
  const kind = path.extname(repoPath) ? "blob" : "tree";

  return `${kind}/${repoRef}/${repoPath}${suffix}`;
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
