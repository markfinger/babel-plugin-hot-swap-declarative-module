import {containsOnlyDeclarativeNodes} from './analyze';

/**
 * Creates a babel plugin that injects hot swap calls for
 * declarative modules.
 *
 * @param {Object} types - A `babel-types` instance
 * @returns {Object}
 */
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

// Ensure that the hot swap call is at the top of the file so that
// a module that fails to execute will still indicate that hot swaps
// are accepted. This enables dependencies to synchronously fail
// without blocking further swaps of the module.
//
// Note: once the module spec has been implemented, this *may* not
// be necessary any longer. However, so long as we continue to use
// commonjs shims, it will be.
const blockHoist = Infinity;

/**
 * Generates an AST fragment representing `module.hot.accept()`.
 *
 * @param {Object} types
 * @returns {Object}
 */
export function createHotSwapCall(types) {
  const call = types.expressionStatement(
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

  call._blockHoist = blockHoist;

  return call;
}