import {containsOnlyDeclarativeNodes} from './analyze';

export function createHotSwapVisitor({ types }) {
  return {
    visitor: {
      Program(path) {
        if (containsOnlyDeclarativeNodes(path.node.body)) {
          const hotSwapCall = createHotSwapCall(types);
          path.node.body.unshift(hotSwapCall);
        }
      }
    }
  };
}

export function createHotSwapCall(types) {
  return types.expressionStatement(
    types.callExpression(
      types.memberExpression(
        types.memberExpression(
          types.identifier('module'),
          types.identifier('hot')
        ),
        types.identifier('accept')
      ),
      []
    )
  );
}