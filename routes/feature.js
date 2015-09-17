"use strict";
/* eslint new-cap: 0 */

var path = require('path');

var express = require('express');
var router = express.Router();

var markdown = require( "markdown" ).markdown;

var getFeatureFile = require("../lib/specifications/getFeatureFile");
var GherkinParser = require('../lib/parser/gherkin.js');

// Display an individual feature in a project.
// htpp://host/<project name>/<root/to/file>
router.get('/:projectName/*', function(req, res, next) {
  var projectName = req.params.projectName;
  var filePath = req.params[0];

  // Skip the rendering for query param ?plain=true ?plain=1 etc.
  var renderPlainFile = req.query.plain === 'true' || !!parseInt(req.query.plain);

  getFeatureFile(path.join(projectName, filePath))
    .then(function(fileContents) {
      var parser;
      var features;
      var isFeatureFile = /.*\.feature/.test(filePath);
      var isMarkdownFile = /.*\.md/.test(filePath);

      if (isFeatureFile && !renderPlainFile) {
        parser = new GherkinParser();
        features = parser
          .parse(fileContents)
          .getFeatures();
        res.render('feature', {features: features});
      } else if (isMarkdownFile && !renderPlainFile) {
        res.render('markdown-file', {markdownHtml: markdown.toHTML(fileContents)});
      } else {
        res.render('general-file', {contents: fileContents});
      }
    })
    .catch(function(err) {
      // Pass on to the error handling route.
      if (!err.status && err.code === 'ENOENT') {
        err.status = 404;
      }
      next(err);
    });
})

module.exports = router;