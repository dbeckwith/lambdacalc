/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import chai = require('chai');
import chai_plugins = require('./chai_plugins');
import _ = require('lodash');
import lambda = require('../src/lambda');
import lambdacalc = require('../src/lambdacalc');

var expect:Chai.ExpectStatic = chai.expect;
chai_plugins();

describe('lambdacalc', ():void => {
  describe('getStdFunc()', ():void => {
    it('should return a shallow copy of the stored functions', ():void => {
      _.each(lambdacalc.stdFuncs, (f:lambda.Function) => {
        expect(f).to.not.be.equal(lambdacalc.getStdFunc(f.preferredName));
      });
      _.each(lambdacalc.stdFuncs, (f:lambda.Function) => {
        expect(f).to.be.exprEqual(lambdacalc.getStdFunc(f.preferredName));
      });
      _.each(lambdacalc.stdFuncs, (f:lambda.Function) => {
        expect(f).to.be.equiv(lambdacalc.getStdFunc(f.preferredName));
      });
    });
  });
});
