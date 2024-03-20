import React, { useEffect } from "react";
// import "./style.css";
import "meilisearch-docsearch/css";

export default function Component() {
  useEffect(() => {
    const lang = document.querySelector("html").lang || "en";

    const docsearch = require("meilisearch-docsearch").default;
    const destroy = docsearch({
      host: "http://localhost:7700",
      apiKey: "xxx",
      indexUid: "dev",
      container: "#docsearch",
      //   searchParams: {filter: [`lang = ${lang}`]},
    });

    return () => destroy();
  }, []);

  return <div id="docsearch" />;
}
