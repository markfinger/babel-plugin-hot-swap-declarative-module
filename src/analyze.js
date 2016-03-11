export function isDeclarativeNode(node) {
  const type = node.type;
  if (
    type === 'VariableDeclaration' ||
    type === 'FunctionDeclaration' ||
    type === 'ClassDeclaration' ||
    type === 'ImportDeclaration' ||
    type === 'ExportNamedDeclaration' ||
    type === 'ExportDefaultDeclaration' ||
    type === 'ExportAllDeclaration'
  ) {
    return true;
  }

  // White-list calls to the `console` object, to aid debugging
  if (type === 'ExpressionStatement') {
    const expression = node.expression;
    if (expression.type === 'CallExpression') {
      const callee = expression.callee;
      if (callee.type === 'MemberExpression') {
        const object = callee.object;
        if (object.type === 'Identifier' && object.name === 'console') {
          return true;
        }
      }
    }
  }

  return false;
}

export function containsOnlyDeclarativeNodes(nodes) {
  const length = nodes.length;

  for (let i=0; i<length; i++) {
    if (!isDeclarativeNode(nodes[i])) {
      return false;
    }
  }

  return true;
}