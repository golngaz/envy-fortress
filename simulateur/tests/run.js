#!/usr/bin/env node
/* =============================================================================
 *  Runner Node des tests unitaires (`npm test`).
 *  Affiche les échecs + le résumé, et sort en code ≠ 0 si un test échoue.
 * ===========================================================================*/
"use strict";

var harness = require("./harness.js");
var wheelTests = require("./wheel.test.js");

var summary = harness.runSuites(wheelTests.SUITES);

summary.failed.forEach(function (c) {
  console.log("✗ " + c.name +
    " — obtenu " + JSON.stringify(c.got) +
    ", attendu " + JSON.stringify(c.expected));
});
console.log(summary.text);

if (summary.failed.length) process.exit(1);
