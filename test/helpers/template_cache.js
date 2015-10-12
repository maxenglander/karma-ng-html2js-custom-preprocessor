var vm = require('vm');

module.exports = function(chai, utils) {
  var AngularModule, evaluateTemplate;

  AngularModule = (function() {
    function AngularModule(name1, deps1) {
      var templates;
      this.name = name1;
      this.deps = deps1;
      templates = this.templates = {};
    }

    AngularModule.prototype.run = function(block) {
      return block[1]({
        put: (function(_this) {
          return function(id, content) {
            return _this.templates[id] = content;
          };
        })(this)
      });
    };

    return AngularModule;

  })();

  evaluateTemplate = function(processedContent) {
    var context, modules;
    modules = {};
    context = {
      angular: {
        module: function(name, deps) {
          if (deps != null) {
            return modules[name] = new AngularModule(name, deps);
          }
          if (modules[name]) {
            return modules[name];
          }
          throw new Error("Module " + name + " does not exists!");
        }
      }
    };
    vm.runInNewContext(processedContent, context);
    return modules;
  };

  chai.Assertion.addMethod('defineModule', function(expectedModuleName) {
    var code, definedModuleNames, module, modules;
    code = utils.flag(this, 'object');
    modules = evaluateTemplate(code);
    module = modules[expectedModuleName];
    definedModuleNames = (Object.keys(modules)).join(', ');
    this.assert(module != null, "expected to define module '" + expectedModuleName + "' but only defined " + definedModuleNames);
    utils.flag(this, 'lastAssertedModule', module);
    return this;
  });

  chai.Assertion.addMethod('defineTemplateId', function(expectedTemplateId) {
    var definedTemplateIds, module, templateContent;
    module = utils.flag(this, 'lastAssertedModule');
    this.assert(module != null, "you have to assert to.defineModule before asserting to.defineTemplateId");
    templateContent = module.templates[expectedTemplateId];
    definedTemplateIds = (Object.keys(module.templates)).join(', ');
    this.assert(templateContent != null, "expected to define template '" + expectedTemplateId + "' but only defined " + definedTemplateIds);
    utils.flag(this, 'lastAssertedTemplateContent', templateContent);
    return this;
  });

  chai.Assertion.addMethod('haveContent', function(expectedContent) {
    var templateContent;
    templateContent = utils.flag(this, 'lastAssertedTemplateContent');
    this.assert(templateContent != null, "you have to assert to.defineTemplateId before asserting to.haveContent");
    return this.assert(templateContent === expectedContent, "expected template content '" + templateContent + "' to be '" + expectedContent + "'");
  });
};
