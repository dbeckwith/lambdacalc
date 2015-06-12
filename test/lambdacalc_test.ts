/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import nodeunit = require('nodeunit');
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

export var test:nodeunit.ITestBody = function (test:nodeunit.Test):void {
  test.expect(4 * 4);

  test.equal(lambdacalc.stdFuncs['0'].toString(), '\\fx.x');
  test.equal(lambdacalc.stdFuncs['1'].toString(), '\\fx.f x');
  test.equal(lambdacalc.stdFuncs['2'].toString(), '\\fx.f (f x)');
  test.equal(lambdacalc.stdFuncs['Y'].toString(), '\\r.(\\x.r (x x)) (\\x.r (x x))');
  _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
    test.equal(f.copy().bindAll().toString(), f.toString(), name + '\'s copy\'s str should equal its str');
  });

  _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
    test.ok(f.equals(f), name + ' should equal itself');
    test.ok(f.copy().bindAll().equals(f), name + '\'s copy should equal itself');
  });
  test.done();
};
