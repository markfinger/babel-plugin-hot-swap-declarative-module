import * as babylon from 'babylon';
import * as types from 'babel-types';
import babelTraverse from 'babel-traverse';
import babelGenerator from 'babel-generator';
import {assert} from './assert';
import {createHotSwapVisitor, createHotSwapCall} from '../visitor';

describe('visitor', () => {
  describe('#default', () => {
    it('should insert the hot swap call to declarative modules', () => {
      const text = `
        import foo from './foo';
        export function bar() {}
        export const woz = 'woz';
      `;
      const ast = babylon.parse(text, {sourceType: 'module'});
      const visitor = createHotSwapVisitor({types}).visitor;
      babelTraverse(ast, visitor);
      const file = babelGenerator(ast, null, text);
      assert.equal(
        [
          'module.hot.accept();',
          '',
          'import foo from \'./foo\';',
          'export function bar() {}',
          'export const woz = \'woz\';'
        ].join('\n'),
        file.code
      );
    });
    it('should not insert the hot swap call to non-declarative modules', () => {
      const text = 'setTimeout(() => {}, 0);';
      const ast = babylon.parse(text, {sourceType: 'module'});
      const visitor = createHotSwapVisitor({types}).visitor;
      babelTraverse(ast, visitor);
      const file = babelGenerator(ast, null, text);
      assert.equal(
        'setTimeout(() => {}, 0);',
        file.code
      );
    });
  });
  describe('#createHotSwapCall', () => {
    it('should generate nodes equivalent to a `module.hot.accept()` call', () => {
      const call = createHotSwapCall(types);
      const ast = types.program([call]);
      const file = babelGenerator(ast);
      assert.equal(file.code, 'module.hot.accept();');
    });
  });
});