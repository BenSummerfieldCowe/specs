
'use strict';

var path = require('path');

var fs = require('q-io/fs');

var getProjectGit = require('../repository-types/git').getProject;
var getProjectDataGit = require('../repository-types/git').getProjectData;

var getResultsJenkins = require('../ci-types/jenkins').getResults;

var appConfig = require('../../configuration/app-config').get();
var projectConfig = require('../../configuration/project-config');

// Currently hard coded to get file contents from a Git repo.
var getFileContentGit = require('../repository-types/git').getFileContent;
var getFileContent = getFileContentGit;

module.exports = {
  get: get,
  delete: deleteProject,
  getData: getData,
  getNames: getNames,
  getResults: getResults,
  getFileContent: getFileContent
};

/**
 * Get a project from some source and return the associated data.
 *
 * @return a promise for the project data.
 */
function get(projectData) {
  return getProjectGit(projectData)
    .then(sanitiseFileList)
    .then(addProjectConfig);
}

function deleteProject(projectName) {
  // i can call hash here, would be repeating code currently unless i move the hash method out
  //TODO this needs to be moved out from here
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
  var projectPath = path.join(appConfig.projectsPath, hashCode(projectName).toString());
  return fs.removeTree(projectPath);
}


/**
 * Assume a project already exists and return the associated data.
 *
 * @return a promise for the project data.
 */
function getData(projectData, targetBranchName) {
  return getProjectDataGit(projectData, targetBranchName)
    .then(sanitiseFileList)
    .then(addProjectConfig);
}


/**
 * Modify a projects file list to only include desired files.
 *
 * @return a promise for the project data.
 */
function sanitiseFileList(projectData) {
  if(!projectData.files) return projectData;

  projectData.files = projectData.files.filter(appConfig.isFileOfInterest.bind(appConfig));
  return projectData;
}

/**
 * Decorate the project data with optional project config from file.
 *
 * @return a promise for the project data.
 */
function addProjectConfig(projectData) {

  function fulfilled(configString) {
    projectData.config = projectConfig.parseConfig(configString);
    return projectData;
  }

  /* eslint-disable no-unused-vars, no-console */
  function finalReject(error) {
    console.log('No specs.json or .specs.json file found.');
    projectData.config = false;
    return projectData;
  }

  return getFileContent(projectData, projectConfig.getConfigFilePath())
    .then(fulfilled, function(error) {

      // Try again with file name prefixed with a '.'.
      return getFileContent(projectData, '.' + projectConfig.getConfigFilePath())
        .then(fulfilled, finalReject);
    });
  /* eslint-enable no-unused-vars, no-console */
}



/**
 * Get a list of known project names.
 *
 * @return a promise for an array of project names.
 */
function getNames() {
  return fs.list(appConfig.projectsPath)
    .then(function(paths) {
      return paths.map(function(path) {
        return fs.read(appConfig.projectsPath+'/'+path+'/config')
          .then(function (content){
            //TODO This is tied to git at least some what, check what other things do when reading file, if they do
            var url = /url = (.+)\n/.exec(content)[1];
            url = url.replace(/https:\/\//,'').replace(/\.git$/i, '');
              var displayName = /^.+\/([^\/]+)\/([^\/]+)/.exec(url);
            url = url.replace(/\//g,'.');
            displayName = displayName[1]+'/'+displayName[2];
            var names = {
              displayName: displayName,
              url: url
            };
            return names;
          });

        //get urls or something similar from file here instead
        // return fs.base(path);
      });
    }).then(function( respo) {
      return Promise.all(respo)
        .then(function (resp) {
          return resp;
        });
    })

    .catch(function(error) {
      // If there are no sets of project data on file return an empty list.
      // Else, rethrow because an error wasn't expected.
      //TODO different kind of error can occur if file doesn't have what we want so add it here
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return [];
    });
}

function sortNames(names) {
  return Promise.all(names)
    .then(function (resp) {
      console.log('blah');
      console.log(resp);
      return (resp);
    });
}

function getResults(projectData,type) {
  if(type === 'jenkins') {
    appConfig.jobNames =[];
    return getResultsJenkins(projectData);
  } else {
    appConfig.jobNames =[];
  }
}