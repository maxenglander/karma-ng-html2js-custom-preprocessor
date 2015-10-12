var util = require('util');

var TEMPLATE = "angular.module('%s', []).run(['$templateCache', function($templateCache) {\n" +
                "  $templateCache.put('%s',\n    '%s');\n" +
                '}]);\n';

var SINGLE_MODULE_TPL = '(function(module) {\n' +
                        'try {\n' +
                        "  module = angular.module('%s');\n" +
                        '} catch (e) {\n' +
                        "  module = angular.module('%s', []);\n" +
                        '}\n' +
                        "module.run(['$templateCache', function($templateCache) {\n" +
                        "  $templateCache.put('%s',\n    '%s');\n" +
                        '}]);\n' +
                        '})();\n';

var escapeContent = function (content) {
  return content.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, "\\n' +\n    '");
};

var createHtml2JsPreprocessor = function (logger, basePath, config) {
  config = typeof config === 'object' ? config : {};

  var log = logger.create('preprocessor.html2js');
  var getModuleName = typeof config.moduleName === 'function' ? config.moduleName : function () {
    return config.moduleName;
  };
  var stripPrefix = new RegExp('^' + (config.stripPrefix || ''));
  var prependPrefix = config.prependPrefix || '';
  var stripSufix = new RegExp((config.stripSuffix || config.stripSufix || '') + '$');
  var cacheIdFromPath = config && config.cacheIdFromPath || function (filepath) {
    return prependPrefix + filepath.replace(stripPrefix, '').replace(stripSufix, '')
  };

  var applyCustomMaps = function(htmlPath) {
    if(config && config.maps) {
      for(var prop in config.maps) {
        if(config.maps.hasOwnProperty(prop)) {

          // Try regex match
          if(prop.indexOf('**') > -1) {
            var regexString = prop.replace('**', '(.*)');
            var regex = new RegExp(regexString, 'i');
            var matches = htmlPath.match(regex);

            if(matches && matches.length > 0) {
              // Skip first match
              var newFormattedPath = config.maps[prop];
              for (var i = 0; i < matches.length-1; i++) {
                newFormattedPath = newFormattedPath.replace('{' + i + '}', matches[i + 1]);
              }

              htmlPath = htmlPath.replace(matches[0], newFormattedPath);
            }
          } else if (htmlPath.indexOf(prop) === 0) {
            htmlPath = htmlPath.replace(prop, config.maps[prop]);
            break;
          }
        }
      }
    }

    return htmlPath;
  };

  var fileNameFormatter = config && config.fileNameFormatter || function(fileName) {
    return fileName;
  };

  var getFileName = function(htmlPath) {
    var splitByPath = htmlPath.split('/');
    if(splitByPath.length === 0) {
      return htmlPath;
    }

    var lastItem = splitByPath[splitByPath.length - 1];
    return lastItem;
  };

  var replaceFileName = function (htmlPath) {
    var originalFileName = getFileName(htmlPath);
    var formattedFileName = fileNameFormatter(originalFileName);
    if(originalFileName !== formattedFileName) {
      return htmlPath.replace(originalFileName, formattedFileName);
    }

    return htmlPath;
  };

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var originalPath = file.originalPath.replace(basePath + '/', '');
    var htmlPath = cacheIdFromPath(originalPath);
    htmlPath = applyCustomMaps(htmlPath);
    htmlPath = replaceFileName(htmlPath);
    var moduleName = getModuleName(htmlPath, originalPath);

    if (!/\.js$/.test(file.path)) {
      file.path = file.path + '.js'
    }

    if (moduleName) {
      done(util.format(SINGLE_MODULE_TPL, moduleName, moduleName, htmlPath, escapeContent(content)));
    } else {
      done(util.format(TEMPLATE, htmlPath, htmlPath, escapeContent(content)));
    }
  }
}

createHtml2JsPreprocessor.$inject = ['logger', 'config.basePath', 'config.ngHtml2JsPreprocessor'];

module.exports = createHtml2JsPreprocessor;
