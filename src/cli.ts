/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import lambda = require('./lambda');
import lambdacalc = require('./lambdacalc');
import _ = require('lodash');

function cli(args:string[]):void {
  lambda.DEBUG = true;

  var Y:lambda.Function = new lambda.Function(0, 'r',
    new lambda.Application(
      new lambda.Function(1, 'x',
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Application(
            new lambda.Variable(1),
            new lambda.Variable(1)))),
      new lambda.Function(1, 'x',
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Application(
            new lambda.Variable(1),
            new lambda.Variable(1))))),
    'Y');
  Y.bindAll();
  var e1:lambda.Expression = Y.applyExpr(lambdacalc.getStdFunc('1'));
  e1.bindAll();
  console.log(e1.toString());
  var e2:lambda.Expression = lambdacalc.getStdFunc('Y')
    .applyExpr(lambdacalc.getStdFunc('1'));
  e2.bindAll();
  console.log(e2.toString());
  // (λx.xyx) (λx.x)
  var f1:lambda.Function =
    new lambda.Function(0, null,
      new lambda.Application(
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Variable(1)),
        new lambda.Variable(0)));
  var f2:lambda.Expression = new lambda.Function(0, null,
    new lambda.Variable(0));
  f1.bindAll();
  f2.bindAll();
  console.log(f1.toString());
  console.log(f2.toString());
  var e3:lambda.Expression = f1.applyExpr(f2);
  e3.bindAll();
  console.log(e3.toString());
  console.log('\
these are the same object, so when reduced should be turned into unique objects so that when the FV is applied to the\n\
first function, the second one does not have the same thing done to it');
  _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
    console.log(name + ': ' + f.toString());
  });

  console.log('------------');
  var f3:lambda.Function = new lambda.Function(0, null, new lambda.Variable(0));
  f3.bindAll();
  console.log(f3.reduce().toString());
  console.log('\
in step 2, end up with different FVs both named y, so they get bound to the same thing, need to do alpha reduction to\n\
make sure they are differentiated, but then names are lost? (or just reduce vars??)');
  var f4:lambda.Expression = new lambda.Application(lambdacalc.getStdFunc('1'),
    lambdacalc.getStdFunc('2')).reduce();
  console.log(f4.toString());
  console.log('------------');
  console.log(lambda.equiv(f4, lambdacalc.getStdFunc('2')));

  console.log('------------');
  lambda.DEBUG = false;
  var f5:lambda.Expression = new lambda.Application(new lambda.Application(lambdacalc.getStdFunc('2'),
      lambdacalc.getStdFunc('1')),
    lambdacalc.getStdFunc('0'));
  console.log(f5.toString());
  console.log(lambda.equiv(f5.reduce(), lambdacalc.getStdFunc('0')));
  _.times(10, ():void => {
    f5 = f5.reduceOnce();
    f5.bindAll();
    f5.alphaReduce();
    console.log(f5.toString());
  });
  f5.alphaNormalize();
  console.log(f5.toString());
  console.log(_.find(lambdacalc.stdFuncs, (f:lambda.Function) => lambda.equiv(f5, f)).preferredName);
}

export = cli;
