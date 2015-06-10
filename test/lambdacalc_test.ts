/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import nodeunit = require('nodeunit');
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
  test.equal(lambdacalc.stdFuncs['0'].toString(), '\\fx.x');
  test.equal(lambdacalc.stdFuncs['1'].toString(), '\\fx.f x');
  test.equal(lambdacalc.stdFuncs['2'].toString(), '\\fx.f (f x)');
  test.equal(lambdacalc.stdFuncs['Y'].toString(), '\\r.(\\x.r (x x)) (\\x.r (x x))');
  test.done();
};
