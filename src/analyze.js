export function isDeclarativeNode(node) {
  const type = node.type;
  return (
    type === 'VariableDeclaration' ||
    type === 'FunctionDeclaration' ||
    type === 'ClassDeclaration' ||
    type === 'ImportDeclaration' ||
    type === 'ExportNamedDeclaration' ||
    type === 'ExportDefaultDeclaration' ||
    type === 'ExportAllDeclaration'
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