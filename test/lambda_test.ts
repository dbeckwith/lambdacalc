/**
 * Created by Daniel Beckwith on 7/1/15.
 */

///<reference path="_ref.d.ts"/>

import chai = require('chai');
import chai_plugins = require('./chai_plugins');
import _ = require('lodash');
import lambda = require('../src/lambda');
import lambdacalc = require('../src/lambdacalc');

var expect:Chai.ExpectStatic = chai.expect;
chai_plugins();

describe('lambda', ():void => {
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

        var f1:lambda.Function = lambda.Function.multiArg([0, 1, 2], null,
          lambda.Application.multiApp([new lambda.Variable(0), new lambda.Variable(2), new lambda.Variable(1)]));
        f1.bindAll();
        expect(f1.toString()).to.be.equal('\\xyz.x z y');

        var e1:lambda.Expression = new lambda.Application(lambdacalc.getStdFunc('Y'),
          lambdacalc.getStdFunc('0')).reduceOnce();
        e1.bindAll();
        expect(e1.toString()).to.be.equal('(\\x.(\\fx.x) (x x)) (\\x.(\\fx.x) (x x))');
      });

      it('should be the same for an expression and its copy', ():void => {
        _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
          var e:lambda.Expression = f.copy();
          e.bindAll();
          expect(e.toString(), name).to.be.equal(f.toString());
        });
      });

      it('should use function names at the correct depth', ():void => {
        expect(lambdacalc.getStdFunc('0').toString()).to.be.equal('\\fx.x');
        expect(lambdacalc.getStdFunc('0').toString(0)).to.be.equal('0');
        expect(lambdacalc.getStdFunc('0').toString(1)).to.be.equal('\\fx.x');
        expect(lambdacalc.getStdFunc('0').toString(10)).to.be.equal('\\fx.x');
        var f1:lambda.Function = new lambda.Function(0, null, lambdacalc.getStdFunc('0'));
        f1.bindAll();
        expect(f1.toString(), 'non-named, no depth').to.be.equal('\\xfx.x');
        expect(f1.toString(0), 'non-named, depth 0').to.be.equal('\\x.0');
        expect(f1.toString(1), 'non-named, depth 1').to.be.equal('\\x.0');
        expect(f1.toString(10), 'non-named, depth 10').to.be.equal('\\xfx.x');
        var f2:lambda.Function = new lambda.Function(0, null, lambdacalc.getStdFunc('0'), 'BLA');
        f2.bindAll();
        expect(f2.toString(), 'named, no depth').to.be.equal('\\xfx.x');
        expect(f2.toString(0), 'named, depth 0').to.be.equal('BLA');
        expect(f2.toString(1), 'named, depth 1').to.be.equal('\\x.0');
        expect(f2.toString(10), 'named, depth 10').to.be.equal('\\xfx.x');
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
          var e:lambda.Expression = f.copy();
          e.bindAll();
          expect(f).to.be.exprEqual(e);
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
});
