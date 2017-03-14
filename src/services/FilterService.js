/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import Jison from 'jison';

class FilterService {
  constructor() {
    function code(args) {
      var argsJs = args.map(function(a) {
        return typeof (a) == 'number' ? ('$' + a) : JSON.stringify(a);
      }).join(',');

      return '$$ = [' + argsJs + '];'
    }
    /* Jison Grammar */
    var grammar = {
      lex: {
        rules: [
          /* Operators */
          ['\\(', 'return "(";'],
          ['\\)', 'return ")";'],
          ['\\,', 'return ",";'],
          ['==', 'return "==";'],
          ['\\!=', 'return "!=";'],
          ['>=', 'return ">=";'],
          ['<=', 'return "<=";'],
          ['<', 'return "<";'],
          ['>', 'return ">";'],
          ['and[^\\w]', 'return "and";'],
          ['or[^\\w]' , 'return "or";'],
          ['not[^\\w]', 'return "not";'],
          ['in[^\\w]', 'return "in";'],
          ['like[^\\w]', 'return "like";'],

          /* Operands */
          ['[0-9]+(?:\\.[0-9]+)?\\b', 'return "NUMBER";'],
          ['[a-zA-Z][\\.a-zA-Z0-9_]*', 'return "SYMBOL";'],
          ['\'(?:[^\'])*\'', 'yytext = yytext.substr(1, yyleng-2); return "SYMBOL";'],
          ['"(?:[^"])*"', 'yytext = yytext.substr(1, yyleng-2); return "STRING";'],
          /* Remove whitespace */
          ['\\s+',  ''],
          /* End */
          ['$', 'return "EOF";']
        ]
      },
      operators: [
        ['left', 'or'],
        ['left', 'and'],
        ['left', 'in'],
        ['left', 'like'],
        ['left', '==', '!='],
        ['left', '<', '<=', '>', '>='],
        ['left', 'not'],
        ['left', 'UMINUS']
      ],
      bnf: {
        expressions: [
            ['e EOF', 'return $1;']
        ],
        e: [
          ['- e'    , code(['-', 2]), {prec: 'UMINUS'}],
          ['e and e', code(['Number(', 1, '&&', 3, ')'])],
          ['e or e' , code(['Number(', 1, '||', 3, ')'])],
          ['not e'  , code(['Number(!', 2, ')'])],
          ['e == e' , code(['Number(', 1, '==', 3, ')'])],
          ['e != e' , code(['Number(', 1, '!=', 3, ')'])],
          ['e < e'  , code(['Number(', 1, '<' , 3, ')'])],
          ['e <= e' , code(['Number(', 1, '<=', 3, ')'])],
          ['e > e'  , code(['Number(', 1, '> ', 3, ')'])],
          ['e >= e' , code(['Number(', 1, '>=', 3, ')'])],
          ['e like e' , code(['new RegExp(".*"+', 3, '+".*","i").test(', 1, ')'])],
          ['( e )'  , code([2])],
          ['e in ( inSet )', code([1, ' in (function(o) { ', 4, 'return o; })({})'])],
          ['e not in ( inSet )', code(['!(', 1, ' in (function(o) { ', 5, 'return o; })({}))'])],
          ['NUMBER' , code([1])],
          ['STRING' , code(['"', 1, '"'])],
          ['SYMBOL' , code(['data["', 1, '"]'])]
        ],
        inSet: [
          ['e', code(['o[', 1, '] = true; '], true)],
          ['inSet , e', code([1, 'o[', 3, '] = true; '], true)]
        ]
      }
    };
    this.parser = Jison.Parser(grammar);
  }
  filterToExpression(filter) {
    var expressions = [], i, ii, join = '';
    if (filter[0] === 'all' || filter[0] === 'any') {
      join = (filter[0] === 'all') ? ' and ' : ' or ';
      for (i = 1, ii = filter.length; i < ii; ++i) {
        expressions.push(filter[i][1] + ' ' + filter[i][0] + ' ' + filter[i][2]);
      }
    } else {
      expressions.push(filter[1] + ' ' + filter[0] + ' ' + filter[2]);
    }
    return expressions.join(join);
  }
  filter(expression) {
    //Construct a parse tree from the expression
    var tree = this.parser.parse(expression);
    if (tree.length <= 3) {
      throw new Error('Incomplete filter');
    }
    //Convert to js string
    var js = [];
    js.push('return ');
    function toJs(node) {
      if (Array.isArray(node)) {
        node.forEach(toJs);
      } else {
        js.push(node);
      }
    }
    tree.forEach(toJs);
    js.push(';');

    //Return function representing the expression that can be applied to a dataset
    var func = new Function('data', js.join(''));
    return function(data) {
      return func(data);
    };
  }
}

export default new FilterService();
