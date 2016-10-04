/**
 * Functionality related to deriving data from a Git repo URL.
 */
'use strict';

var path = require('path');

module.exports = {
  getNameAndPath: getNameAndPath
};

// Generate the repo name from the repo URL and therefore the local path
// to the repo.
function getNameAndPath (projectData) {
  var repoName;
  var localPath;
  function hashCode(str) {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
//TODO double check, but it seems that if change so that we get the repo url rather than the folder name, then every time
  //TODO we call this function, it will be the url, so we can hash it every time
  if (!projectData.localPathRoot) {
    throw new TypeError('Please provide projectData.localPathRoot before invoking getNameAndPath.');
  }

  // if (projectData.repoName) {
  //   repoName = projectData.repoName;
  // } else {

    // if (!projectData.repoUrl) {
    //   throw new TypeError('Please pass either projectData.repoUrl or projectData.repoName');
    // }
  //TODO make some check around repo name?

    // repoName = /\/([^\/]+?)(?:\.git)?\/?$/.exec(projectData.repoUrl);
    // repoName = (repoName && repoName.length ? repoName[1] : false);
    // if (!repoName) {
    //   throw new TypeError('Could not determine repository name.');
    // }
    // String.prototype.hashCode = function() {

    // repoName = "" + hashCode(projectData.repoUrl.replace(/https:\/\//,'').replace(/\//g,'.')).toString();
  repoName = "" + hashCode(projectData.repoName.replace(/https:\/\//,'').replace(/\//g,'.')).toString();
  // }

  // localPath = path.join(projectData.localPathRoot, "" +);
  localPath = path.join(projectData.localPathRoot, repoName);

  projectData.repoName = repoName;
  projectData.localPath = localPath;

  return projectData;
}
