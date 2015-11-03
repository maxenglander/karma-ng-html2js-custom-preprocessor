describe('preprocessors html2js', function() {
  var File, chai, createPreprocessor, expect, html2js, logger, process, templateHelpers;

  chai = require('chai');
  templateHelpers = require('./helpers/template_cache');
  chai.use(templateHelpers);
  expect = chai.expect;
  html2js = require('../lib/html2js');
  logger = {
    create: function() {
      return {
        debug: function() {}
      };
    }
  };

  process = null;
  File = function(path, mtime) {
    this.path = path;
    this.originalPath = path;
    this.contentPath = path;
    this.mtime = mtime;
    return this.isUrl = false;
  };

  createPreprocessor = function(config) {
    if (config == null) {
      config = {};
    }
    return html2js(logger, '/base', config);
  };

  beforeEach(function() {
    process = createPreprocessor();
  });

  it('should convert html to js code', function(done) {
    var HTML, file;
    file = new File('/base/path/file.html');
    HTML = '<html>test me!</html>';
    process(HTML, file, function(processedContent) {
      expect(processedContent).to.defineModule('path/file.html').and.to.defineTemplateId('path/file.html').and.to.haveContent(HTML);
      done();
    });
  });

  it('should change path to *.js', function(done) {
    var file;
    file = new File('/base/path/file.html');
    process('', file, function(processedContent) {
      expect(file.path).to.equal('/base/path/file.html.js');
      done();
    });
  });

  it('should not append *.js to a processed file\'s path more than once', function(done) {
    var file;
    file = new File('/base/path/file.html');
    process('', file, function(processedContent) {
      process('', file, function(processedContent) {
        expect(file.path).to.equal('/base/path/file.html.js');
        done();
      });
    });
  });

  it('should preserve new lines', function(done) {
    var file;
    file = new File('/base/path/file.html');
    process('first\nsecond', file, function(processedContent) {
      expect(processedContent).to.defineModule('path/file.html').and.to.defineTemplateId('path/file.html').and.to.haveContent('first\nsecond');
      done();
    });
  });

  it('should preserve Windows new lines', function(done) {
    var file;
    file = new File('/base/path/file.html');
    process('first\r\nsecond', file, function(processedContent) {
      expect(processedContent).to.not.contain('\r');
      done();
    });
  });

  it('should preserve the backslash character', function(done) {
    var file;
    file = new File('/base/path/file.html');
    process('first\\second', file, function(processedContent) {
      expect(processedContent).to.defineModule('path/file.html').and.to.defineTemplateId('path/file.html').and.to.haveContent('first\\second');
      done();
    });
  });

  return describe('options', function() {
    describe('stripPrefix', function() {
      beforeEach(function() {
        process = createPreprocessor({
          stripPrefix: 'path/'
        });
      });

      it('strips the given prefix from the file path', function(done) {
        var HTML, file;
        file = new File('/base/path/file.html');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('file.html').and.to.defineTemplateId('file.html').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('prependPrefix', function() {
      beforeEach(function() {
        process = createPreprocessor({
          prependPrefix: 'served/'
        });
      });

      it('prepends the given prefix from the file path', function(done) {
        var HTML, file;
        file = new File('/base/path/file.html');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('served/path/file.html').and.to.defineTemplateId('served/path/file.html').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('stripSuffix', function() {
      beforeEach(function() {
        process = createPreprocessor({
          stripSuffix: '.ext'
        });
      });

      it('strips the given suffix from the file path', function(done) {
        var HTML, file;
        file = new File('file.html.ext');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('file.html').and.to.defineTemplateId('file.html').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('stripSufix', function() {
      beforeEach(function() {
        process = createPreprocessor({
          stripSufix: '.ext'
        });
      });

      it('strips the given sufix from the file path', function(done) {
        var HTML, file;
        file = new File('file.html.ext');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('file.html').and.to.defineTemplateId('file.html').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('cacheIdFromPath', function() {
      beforeEach(function() {
        process = createPreprocessor({
          cacheIdFromPath: function(filePath) {
            return "generated_id_for/" + filePath;
          }
        });
      });

      it('invokes custom transform function', function(done) {
        var HTML, file;
        file = new File('/base/path/file.html');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('generated_id_for/path/file.html').and.to.defineTemplateId('generated_id_for/path/file.html').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('maps', function() {
      beforeEach(function() {
        process = createPreprocessor({
          maps: {
            'areas/path/modules/app/': 'app/',
            "Areas/Common/Modules/**/Templates/": 'app/{0}/'
          }
        });
      });

      it('resolves correct path for basic map', function(done) {
        var HTML, file;
        file = new File('/base/areas/path/modules/app/file.cshtml');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('app/file.cshtml').and.to.defineTemplateId('app/file.cshtml').and.to.haveContent(HTML);
          done();
        });
      });

      it('resolves correct path for regex (globstar) map', function(done) {
        var HTML, file;
        file = new File('/base/areas/common/modules/BlAh1/templates/file.cshtml');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('app/BlAh1/file.cshtml').and.to.defineTemplateId('app/BlAh1/file.cshtml').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('file name formatter', function() {
      beforeEach(function() {
        process = createPreprocessor({
          maps: {
            'areas/path/modules/app/': 'app/'
          },
          fileNameFormatter: function(fileName) {
            if (fileName.indexOf('.cshtml') > -1) {
              // Camel to file case
              var formatted = fileName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
              return formatted.replace('.cshtml', '').toLowerCase();
            }

            return fileName;
          }
        });
      });

      it('resolves correct file name for camel case', function(done) {
        var HTML, file;
        file = new File('/base/areas/path/modules/app/AnImportantComponent.cshtml');
        HTML = '<html></html>';
        process(HTML, file, function(processedContent) {
          expect(processedContent).to.defineModule('app/an-important-component').and.to.defineTemplateId('app/an-important-component').and.to.haveContent(HTML);
          done();
        });
      });
    });

    describe('moduleName', function() {
      it('should generate code with a given module name', function() {
        var HTML1, HTML2, bothFilesContent, file1, file2;
        process = createPreprocessor({
          moduleName: 'foo'
        });
        file1 = new File('/base/tpl/one.html');
        HTML1 = '<span>one</span>';
        file2 = new File('/base/tpl/two.html');
        HTML2 = '<span>two</span>';
        bothFilesContent = '';
        process(HTML1, file1, function(processedContent) {
          return bothFilesContent += processedContent;
        });
        process(HTML2, file2, function(processedContent) {
          return bothFilesContent += processedContent;
        });
        expect(bothFilesContent).to.defineModule('foo').and.to.defineTemplateId('tpl/one.html').and.to.haveContent(HTML1).and.to.defineTemplateId('tpl/two.html').and.to.haveContent(HTML2);
      });

      it('should generate code with multiple module names', function() {
        var HTML1, HTML2, HTML3, file1, file2, file3, threeFilesContent;
        process = createPreprocessor({
          moduleName: function(htmlPath) {
            var module;
            module = htmlPath.split('/')[0];
            if (module !== 'tpl') {
              return module;
            }
          }
        });
        file1 = new File('/base/app/one.html');
        HTML1 = '<span>one</span>';
        file2 = new File('/base/common/two.html');
        HTML2 = '<span>two</span>';
        file3 = new File('/base/tpl/three.html');
        HTML3 = '<span>three</span>';
        threeFilesContent = '';
        process(HTML1, file1, function(processedContent) {
          return threeFilesContent += processedContent;
        });
        process(HTML2, file2, function(processedContent) {
          return threeFilesContent += processedContent;
        });
        process(HTML3, file3, function(processedContent) {
          return threeFilesContent += processedContent;
        });

        expect(threeFilesContent).to.defineModule('app').and.to.defineTemplateId('app/one.html').and.to.haveContent(HTML1).and.to.defineModule('common').and.to.defineTemplateId('common/two.html').and.to.haveContent(HTML2).to.defineModule('tpl/three.html').and.to.defineTemplateId('tpl/three.html').and.to.haveContent(HTML3);
      });
    });
  });
});
