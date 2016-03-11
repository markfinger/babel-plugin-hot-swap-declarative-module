import * as babylon from 'babylon';
import * as types from 'babel-types';
import * as babel from 'babel-core';
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
    it('should place the call at the top of the file', () => {
      const text = `
        import foo from './foo';
        export function bar() {}
        export const woz = 'woz';
      `;
      const file = babel.transform(text, {
        plugins: [
          // We verify that our block hoist still functions when combined
          // with other plugins that use similar mechanisms
          'transform-es2015-modules-commonjs',
          require.resolve('..')
        ]
      });
      const location = file.code.indexOf('\'use strict\';\n\nmodule.hot.accept();');
      assert.equal(location, 0);
    });
  });
  describe('#createHotSwapCall', () => {
    it('should generate nodes equivalent to a `module.hot.accept()` call', () => {
      const call = createHotSwapCall(types);
      const ast = types.program([call]);
      const file = babelGenerator(ast);
      assert.equal(file.code, 'module.hot.accept();');
    });
    it('should ensure that the hot swap call is at the top of the file', () => {
      const call = createHotSwapCall(types);
      assert.equal(call._blockHoist, Infinity);
    });
  });
});