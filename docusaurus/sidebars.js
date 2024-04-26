// @ts-check

const fs = require("fs")
const yaml = require("yaml")

const file = fs.readFileSync("../docs/sidebars.yml", "utf8")

const sidebars = yaml.parse(file)

module.exports = sidebars
