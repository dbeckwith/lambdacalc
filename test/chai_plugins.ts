/**
 * Created by Daniel Beckwith on 7/1/15.
 */

///<reference path="_ref.d.ts"/>

import chai = require('chai');
import lambda = require('../src/lambda');

function setup():void {
  chai.use(function (_chai:any, utils:any):void {
    utils.addMethod(_chai.Assertion.prototype, 'exprEqual', function (expr2:lambda.Expression):void {
      var expr1:lambda.Expression = utils.flag(this, 'object');
      new _chai.Assertion(expr1).assert(expr1.equals(expr2),
        'expected ' + expr1.toString() + ' to be equal to ' + expr2.toString(),
        'expected ' + expr1.toString() + ' to be not equal to ' + expr2.toString());
    });
    utils.addMethod(_chai.Assertion.prototype, 'equiv', function (expr2:lambda.Expression):void {
      var expr1:lambda.Expression = utils.flag(this, 'object');
      new _chai.Assertion(expr1).assert(lambda.equiv(expr1, expr2),
        'expected ' + expr1.toString() + ' to be equivalent to ' + expr2.toString(),
        'expected ' + expr1.toString() + ' to be not equivalent to ' + expr2.toString());
    });
  });
}

export = setup;
