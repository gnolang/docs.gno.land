import path from "node:path";
import { visit } from "unist-util-visit";

// The docs folder is the only part of the monorepo this site holds:
// scripts/download-docs.sh keeps gno-master/docs and drops the rest. A link
// climbing out of it therefore has no page to point at, and Docusaurus emits it
// verbatim, so `../../examples/gno.land/p/nt/avl/v0` ships as
// `/examples/gno.land/p/nt/avl/v0` and returns 404. Those targets are real
// files in the monorepo, so the link becomes a URL to the monorepo instead.
const repoURL = "https://github.com/gnolang/gno";

// The branch download-docs.sh pulls the docs from
const repoRef = "master";

/**
 * Rewrites every relative link that resolves outside the docs folder into an
 * absolute GitHub URL, leaving the markdown sources relative.
 *
 * The source file keeps `[avl](../../examples/gno.land/p/nt/avl/v0)`, which
 * resolves in the monorepo and on GitHub. The built page carries
 * `https://github.com/gnolang/gno/tree/master/examples/gno.land/p/nt/avl/v0`.
 *
 * @param {{docsDir: string}} options docsDir is the folder Docusaurus reads the
 * docs from, matching the `path` of the docs preset.
 */
export default function externalRepoLinks({ docsDir } = {}) {
  if (!docsDir) {
    throw new Error("external-repo-links: docsDir is required, and must match the docs preset path");
  }

  const docsRoot = path.resolve(docsDir);

  return (tree, file) => {
    if (!file.path) return;

    const fileDir = path.dirname(path.resolve(file.path));

    visit(tree, ["link", "definition"], (node) => {
      const url = externalRepoURL(node.url, fileDir, docsRoot);
      if (url) node.url = url;
    });
  };
}

/**
 * Returns the GitHub URL for a link that leaves the docs folder, or null for
 * one the site can resolve on its own.
 */
function externalRepoURL(url, fileDir, docsDir) {
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

  return `${repoURL}/${kind}/${repoRef}/${repoPath}${suffix}`;
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
