/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import chai = require('chai');
import _ = require('lodash');
import lambda = require('../src/lambda');
import lambdacalc = require('../src/lambdacalc');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

// TODO: maybe no typescript for tests??
// TODO: equiv tests were failing
// TODO: maybe don't use names in string format yet (breaks first toString() tests)

var expect:Chai.ExpectStatic = chai.expect;

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

describe('Expression', ():void => {
  before(():void => {
    lambda.DEBUG = false;
  });

  describe('#toString()', ():void => {
    it('should convert expressions to the proper string format', ():void => {
      expect(lambdacalc.getStdFunc('0').toString()).to.be.equal('\\fx.x');
      expect(lambdacalc.getStdFunc('1').toString()).to.be.equal('\\fx.f x');
      expect(lambdacalc.getStdFunc('2').toString()).to.be.equal('\\fx.f (f x)');
      expect(lambdacalc.getStdFunc('Y').toString()).to.be.equal('\\r.(\\x.r (x x)) (\\x.r (x x))');

      expect(lambda.Function.multiArg([0, 1, 2], null,
        lambda.Application.multiApp([new lambda.Variable(0), new lambda.Variable(2),
                                     new lambda.Variable(1)])).bindAll().toString()).to.be.equal('\\xyz.x z y');

      expect(new lambda.Application(lambdacalc.getStdFunc('Y'),
        lambdacalc.getStdFunc('0')).reduceOnce().bindAll().toString())
        .to.be.equal('(\\x.(\\fx.x) (x x)) (\\x.(\\fx.x) (x x))');
    });

    it('should be the same for an expression and its copy', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f.copy().bindAll().toString(), name).to.be.equal(f.toString());
      });
    });
  });

  describe('#equals()', ():void => {
    it('should say that expressions are equal to themselves', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f).to.be.exprEqual(f);
      });
    });

    it('should say that expressions\' copies are equal to themselves', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f).to.be.exprEqual(f.copy().bindAll());
      });
    });
  });

  describe('#equiv()', ():void => {
    it('should say that expressions are equivalent to themselves', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f).to.be.equiv(f);
      });
    });

    it('should say that two similar expressions are equivalent', ():void => {
      function eqv(e1:lambda.Expression, e2:lambda.Expression):void {
        e1.bindAll();
        e2.bindAll();
        expect(e1).to.be.equiv(e2);
      }

      eqv(new lambda.Application(
          new lambda.Function(0, null,
            new lambda.Variable(0)),
          new lambda.Function(0, null,
            new lambda.Application(
              new lambda.Function(1, null,
                new lambda.Application(
                  new lambda.Variable(0),
                  new lambda.Variable(1))),
              new lambda.Variable(0)))),
        new lambda.Application(
          new lambda.Function(3, null,
            new lambda.Variable(3)),
          new lambda.Function(2, null,
            new lambda.Application(
              new lambda.Function(1, null,
                new lambda.Application(
                  new lambda.Variable(2),
                  new lambda.Variable(1))),
              new lambda.Variable(2)))));
    });
  });

  describe('#reduce()', ():void => {
    it('should reduce 1 applied to anything as that thing', ():void => {
      function eqv(e:lambda.Expression):void {
        expect(e).to.be.equiv(new lambda.Application(lambdacalc.getStdFunc('1'), e).reduce());
      }

      eqv(lambdacalc.getStdFunc('0'));
      eqv(lambdacalc.getStdFunc('1'));
      eqv(lambdacalc.getStdFunc('2'));
    });

    it('should reduce n applied to 1 applied to anything as that thing', ():void => {
      function eqv(n:lambda.Function, e:lambda.Expression):void {
        expect(e).to.be.equiv(lambda.Application.multiApp([n, lambdacalc.getStdFunc('1'), e]).reduce());
      }

      eqv(lambdacalc.getStdFunc('0'), lambdacalc.getStdFunc('0'));
      eqv(lambdacalc.getStdFunc('0'), lambdacalc.getStdFunc('1'));
      eqv(lambdacalc.getStdFunc('0'), lambdacalc.getStdFunc('2'));
      eqv(lambdacalc.getStdFunc('1'), lambdacalc.getStdFunc('0'));
      eqv(lambdacalc.getStdFunc('1'), lambdacalc.getStdFunc('1'));
      eqv(lambdacalc.getStdFunc('1'), lambdacalc.getStdFunc('2'));
      eqv(lambdacalc.getStdFunc('2'), lambdacalc.getStdFunc('0'));
      eqv(lambdacalc.getStdFunc('2'), lambdacalc.getStdFunc('1'));
      eqv(lambdacalc.getStdFunc('2'), lambdacalc.getStdFunc('2'));
    });
  });
});
