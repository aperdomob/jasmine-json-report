const fs = require('fs');
const path = require('path');

const createFolderStructure = (fullPath) => {
  const paths = fullPath.split(path.normalize(path.sep));

  let currentPath = '';

  paths.forEach((part) => {
    currentPath = path.join(currentPath, part);

    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
};

const removeParent = (tree) => {
  // eslint-disable-next-line no-param-reassign
  delete tree.parent;

  if (tree.children) {
    tree.children.forEach((node) => {
      removeParent(node);
    });
  }
};

const saveFile = (fullPath, fileName, json) => {
  fs.writeFileSync(path.join(fullPath, fileName), JSON.stringify(json));
};

class JsonReport {
  static getReport(properties) {
    const jsonResult = {
      children: []
    };

    let current = null;

    return {
      jasmineStarted: () => {
        jsonResult.description = 'suite execution';
        current = jsonResult;
      },
      suiteStarted: (suite) => {
        const node = Object.assign({}, suite);
        node.children = [];
        node.parent = current;

        current.children.push(node);
        current = node;
      },
      specDone: (test) => {
        const node = Object.assign({}, test);
        node.children = [];

        current.children.push(node);
      },
      suiteDone: () => {
        current = current.parent;
      },
      jasmineDone: () => {
        removeParent(jsonResult);

        const reportPath = properties && properties.path ? properties.path : 'report/json';
        const fileName = properties && properties.fileName ? properties.fileName : 'result.json';

        createFolderStructure(reportPath);
        saveFile(reportPath, fileName, jsonResult);
        if (!fs.existsSync(reportPath)) {
          fs.mkdirSync(reportPath);
        }

        const fullFileName = path.join(reportPath, fileName);

        fs.writeFileSync(fullFileName, JSON.stringify(jsonResult));
      }
    };
  }
}

exports.JsonReport = JsonReport;
