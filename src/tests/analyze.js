import * as babylon from 'babylon';
import {assert} from './assert';
import {isDeclarativeNode, containsOnlyDeclarativeNodes} from '../analyze';

describe('analyze', () => {
  describe('#isDeclarativeNode', () => {
    describe('success cases', () => {
      it('should return true for variable declarations', () => {
        const ast = babylon.parse(`
          var one = 1;
          const two = 2;
          let three = 3;
        `);
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
        assert.isTrue(isDeclarativeNode(ast.program.body[1]));
        assert.isTrue(isDeclarativeNode(ast.program.body[2]));
      });
      it('should return true for function declarations', () => {
        const ast = babylon.parse(`
          function foo() {
            // ...
          }
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return true for class declarations', () => {
        const ast = babylon.parse(`
          class foo {}
          class bar extends foo {}
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
        assert.isTrue(isDeclarativeNode(ast.program.body[1]));
      });
      it('should return true for imports', () => {
        const ast = babylon.parse(`
          import foo from './foo';
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return true for named exports', () => {
        const ast = babylon.parse(`
          export const foo = 'foo';
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return true for default exports', () => {
        const ast = babylon.parse(`
          export default foo = 'foo';
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return true for export alls', () => {
        const ast = babylon.parse(`
          export * from './foo';
        `, {sourceType: 'module'});
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return true for console.* calls', () => {
        const ast = babylon.parse(`
          console.log('test');
        `);
        assert.isTrue(isDeclarativeNode(ast.program.body[0]));
      });
    });
    describe('fail cases', () => {
      it('should return false for implicit global variables', () => {
        const ast = babylon.parse(`
          four = 4;
        `);
        assert.isFalse(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return false for conditonals', () => {
        const ast = babylon.parse(`
          if (foo) {
            something();
          }
        `);
        assert.isFalse(isDeclarativeNode(ast.program.body[0]));
      });
      it('should return false for function calls', () => {
        const ast = babylon.parse(`
          someFunc();
        `);
        assert.isFalse(isDeclarativeNode(ast.program.body[0]));
      });
    });
  });
  describe('#containsOnlyDeclarativeNodes', () => {
    it('should return true for declarative modules', () => {
      const ast = babylon.parse(`
        import importOne from './default';
        import {importTwo} from './named';
        import * as importThree from './wildcard';

        var varOne = 1;
        const varTwo = 2;
        let varThree = 3;

        export const blah = one + two;

        export function func() {}
        export const arrow = () => {}

        export {exportOne} from './named';
        export default exportTwo = 'some literal';
        export * from './wildcard';
      `, {sourceType: 'module'});
      assert.isTrue(containsOnlyDeclarativeNodes(ast.program.body));
    });
    it('should return true for declarative modules with directives', () => {
      const ast = babylon.parse(`
        import importOne from './default';

        "use strict";
        "use strong";

        export const foo = 'foo';
      `, {sourceType: 'module'});
      assert.isFalse(containsOnlyDeclarativeNodes(ast.program.body));
    });
    it('should return false for modules with side-effects', () => {
      const ast = babylon.parse(`
        import importOne from './default';
        importOne();
      `, {sourceType: 'module'});
      assert.isFalse(containsOnlyDeclarativeNodes(ast.program.body));
    });
  });
});