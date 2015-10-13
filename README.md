# karma-ng-html2js-preprocessor

[Blog post on this fork](https://seandrumm.co.uk/testing-directives-with-server-side-templates/)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/karma-runner/karma-ng-html2js-preprocessor)
 [![npm version](https://img.shields.io/npm/v/karma-ng-html2js-preprocessor.svg?style=flat-square)](https://www.npmjs.com/package/karma-ng-html2js-preprocessor) [![npm downloads](https://img.shields.io/npm/dm/karma-ng-html2js-preprocessor.svg?style=flat-square)](https://www.npmjs.com/package/karma-ng-html2js-preprocessor)

[![Build Status](https://travis-ci.org/sjdweb/karma-ng-html2js-custom-preprocessor.svg?branch=master)](https://travis-ci.org/sjdweb/karma-ng-html2js-custom-preprocessor)

> Preprocessor for converting HTML files to [AngularJS 1.x](http://angularjs.org/) templates.

*Note:* If you are looking for a general preprocessor that is not tied to Angular, check out [karma-html2js-preprocessor](https://github.com/karma-runner/karma-html2js-preprocessor).

*Note:* If you are using Angular 2.x, use [karma-redirect-preprocessor](https://github.com/sjelin/karma-redirect-preprocessor).

## Installation

The easiest way is to keep `karma-ng-html2js-preprocessor` as a devDependency in your `package.json`. Just run

```bash
$ npm install karma-ng-html2js-preprocessor --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      'Areas/Common/Modules/**/*.cshtml': ['ng-html2js-custom'],
    },

    files: [
      '*.js',
      '*.html',
      '*.html.ext',
      // if you wanna load template files in nested directories, you must use this
      '**/*.html'
    ],

    // if you have defined plugins explicitly, add karma-ng-html2js-preprocessor
    // plugins: [
    //     <your plugins>
    //     'karma-ng-html2js-preprocessor',
    // ]

    ngHtml2JsPreprocessor: {
      maps: {
        'Areas/Common/Modules/**/Templates/': 'common/{0}/'
      },
      fileNameFormatter: function(fileName) {
        if (fileName.indexOf('.cshtml') > -1) {
          // Camel to file case
          var formatted = fileName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
          return formatted.replace('.cshtml', '').toLowerCase();
        }

        return fileName;
      }
    }
  })
}
```

### Multiple module names

Use *function* if more than one module that contains templates is required.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ...

    ngHtml2JsPreprocessor: {
      // ...

      moduleName: function (htmlPath, originalPath) {
        return htmlPath.split('/')[0];
      }
    }
  })
}
```

If only some of the templates should be placed in the modules,
return `''`, `null` or `undefined` for those which should not.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ...

    ngHtml2JsPreprocessor: {
      // ...

      moduleName: function (htmlPath, originalPath) {
        var module = htmlPath.split('/')[0];
        return module !== 'tpl' ? module : null;
      }
    }
  })
}
```


## How does it work ?

This preprocessor converts HTML files into JS strings and generates Angular modules. These modules, when loaded, puts these HTML files into the `$templateCache` and therefore Angular won't try to fetch them from the server.

For instance this `template.html`...
```html
<div>something</div>
```
... will be served as `template.html.js`:
```js
angular.module('template.html', []).run(function($templateCache) {
  $templateCache.put('template.html', '<div>something</div>')
})
```

See the [ng-directive-testing](https://github.com/vojtajina/ng-directive-testing) for a complete example.

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
