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

var expect:Chai.ExpectStatic = chai.expect;

describe('Expression', ():void => {
  before(():void => {
    lambda.DEBUG = false;
  });

  describe('#toString()', ():void => {
    it('should convert expressions to the proper string format', ():void => {
      expect(lambdacalc.stdFuncs['0'].toString()).to.be.equal('\\fx.x');
      expect(lambdacalc.stdFuncs['1'].toString()).to.be.equal('\\fx.f x');
      expect(lambdacalc.stdFuncs['2'].toString()).to.be.equal('\\fx.f (f x)');
      expect(lambdacalc.stdFuncs['Y'].toString()).to.be.equal('\\r.(\\x.r (x x)) (\\x.r (x x))');

      expect(lambda.Function.multiArg([0, 1, 2],
        lambda.Application.multiApp([new lambda.Variable(0), new lambda.Variable(2),
                                     new lambda.Variable(1)])).bindAll().toString()).to.be.equal('\\xyz.x z y');

      expect(new lambda.Application(lambdacalc.stdFuncs['Y'],
        lambdacalc.stdFuncs['0']).reduceOnce().bindAll().toString())
        .to.be.equal('(\\x.(\\fx.x) (x x)) (\\x.(\\fx.x) (x x))');
    });

    it('should be the same for an expression and its copy', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f.copy().bindAll().toString()).to.be.equal(f.toString(), name + '\'s copy\'s str should equal its str');
      });
    });
  });

  describe('#equals()', ():void => {
    it('should say that expressions are equal to themselves', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f).to.satisfy((f:lambda.Function) => f.equals(f), name + ' should equal itself');
      });
    });
    it('should say that expressions\' copies are equal to themselves', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
        expect(f).to.satisfy((f:lambda.Function) => f.copy().bindAll().equals(f),
          name + '\'s copy should equal itself');
      });
    });
  });

  describe('#reduce()', ():void => {
    it('should reduce 1 applied to anything as that thing', ():void => {
      expect(new lambda.Application(lambdacalc.stdFuncs['1'],
        lambdacalc.stdFuncs['2'])).to.satisfy((e:lambda.Expression) => e.reduce().equals(lambdacalc.stdFuncs['2']),
        '1 2 should equal 2');
    });
  });
});
