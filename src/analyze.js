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
  return (
    type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.callee.type === 'MemberExpression' &&
    node.expression.callee.object === 'Identifier' &&
    node.expression.callee.name === 'console'
  );
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