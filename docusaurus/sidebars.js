// @ts-check

const fs = require("fs")

/** @type {string} */
const file = fs.readFileSync("../docs/sidebar.json", "utf8")

const sidebars = JSON.parse(file)

module.exports = sidebars;