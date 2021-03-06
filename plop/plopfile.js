'use strict';
const Q = require('q');
const path = require('path');
const fs = require('fs');
const pathToBundle = path.resolve('../bin/Plop.Bundle.ts');

try {
  const stats = fs.lstatSync(pathToBundle);
  if (stats.isFile()) {
    fs.unlinkSync(pathToBundle);
  }
}
catch (e) {
}

const toExclude = ['Misc', 'Base', 'ResponsiveComponents'];

var getComponentsList = (dir)=> {
  return fs.readdirSync(path.resolve(dir)).filter((file)=> {
    return toExclude.indexOf(file) == -1;
  });
}

var getBundleByName = (name)=> {
  return `export * from '../src/${name}';`
}

var components = getComponentsList('../src/ui');

module.exports = function (plop) {
  plop.setGenerator('Create a new bundle', {
    description: `Create a new customized component bundle`,
    prompts: [{
      message: `Choose component to add to the bundle.\nPress spacebar to select multiple, enter to finish selection`,
      type: 'checkbox',
      name: 'components',
      choices: ()=> {
        return components.map((cmp)=> {
          return {name: cmp, value: cmp}
        })
      }
    }],
    actions: (data)=> {
      var actions = [];
      if (data.components.length === 0) {
        actions.push(() => {
          return `No component were selected : Exiting.`
        });
      } else {
        data.base = getBundleByName('Base');
        data.basicextensioncode = getBundleByName('UIBase');
        actions.push({
          type: 'add',
          path: path.resolve('../bin/Plop.Bundle.ts'),
          templateFile: path.resolve('./plopTemplates/plop.bundle.template.hbs')
        })
      }
      return actions;
    }
  })
  plop.setGenerator('Create a new component', {
    description: 'Create the files required to create a new component',
    prompts: [{
      message: 'Choose the component name.',
      type: 'input',
      name: 'cmpName'
    }],
    actions: (data)=> {
      let actions = [];
      data.cmpName = plop.renderString('{{pascalCase cmpName}}', data);
      console.log(`Creating new component named ${data.cmpName}`);
      actions.push({
        type: 'add',
        path: path.resolve('../src/ui/{{cmpName}}/{{cmpName}}.ts'),
        templateFile: path.resolve('./plopTemplates/plop.component.template.hbs')
      })
      actions.push(()=> {
        let tsconfig = require(path.resolve('../tsconfig.json'));
        let testtsconfig = require(path.resolve('../test/tsconfig.json'));
        tsconfig.files.push(plop.renderString('src/ui/{{pascalCase cmpName}}/{{pascalCase cmpName}}.ts', data));
        testtsconfig.files.push(plop.renderString('../test/ui/{{pascalCase cmpName}}Test.ts', data));
        fs.writeFileSync(path.resolve('../tsconfig.json'), JSON.stringify(tsconfig, undefined, 4));
        fs.writeFileSync(path.resolve('../test/tsconfig.json'), JSON.stringify(testtsconfig, undefined, 4));
        return 'Modified tsconfig.json';
      })
      actions.push(()=> {
        let newExport = plop.renderString('export \{ {{pascalCase cmpName}} \} from \'./ui/{{pascalCase cmpName}}/{{pascalCase cmpName}}\';', data);
        fs.appendFileSync(path.resolve('../src/Index.ts'), `\n${newExport}`);
        return 'Modified Index.ts';
      })
      actions.push(()=> {
        let newReference = plop.renderString('import { {{pascalCase cmpName}}Test } from \'./ui/{{pascalCase cmpName}}Test\';', data);
        let newTestExecution = plop.renderString('{{pascalCase cmpName}}Test();', data);
        fs.appendFileSync(path.resolve('../test/Test.ts'), `\n${newReference}\n${newTestExecution}`);
        return 'Modified Test.ts';
      })
      actions.push({
        type : 'add',
        path: path.resolve('../test/ui/{{pascalCase cmpName}}Test.ts'),
        templateFile : path.resolve('./plopTemplates/plop.component.test.template.hbs')
      })
      return actions;
    }
  })
}
