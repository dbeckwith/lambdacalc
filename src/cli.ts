/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import lambda = require('./lambda');
import lambdacalc = require('./lambdacalc');
import _ = require('lodash');

function cli(args:string[]):void {
  var Y:lambda.Function = new lambda.Function(0,
    new lambda.Application(
      new lambda.Function(1,
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Variable(1)),
        'x'),
      new lambda.Function(1,
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Application(
            new lambda.Variable(1),
            new lambda.Variable(1))),
        'x')
    ), 'r');
  Y.bindAll();
  console.log(Y.applyExpr(lambdacalc.stdFuncs['1'].copy().bindAll()).bindAll().toString());
  console.log((<lambda.Function>lambdacalc.stdFuncs['Y'].copy().bindAll())
    .applyExpr(lambdacalc.stdFuncs['1'].copy().bindAll()).bindAll().toString());
  // (λx.xyx) (λx.x)
  var f1:lambda.Function =
    new lambda.Function(0,
      new lambda.Application(
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Variable(1)),
        new lambda.Variable(0)));
  var f2:lambda.Expression = new lambda.Function(0,
    new lambda.Variable(0));
  f1.bindAll();
  f2.bindAll();
  console.log(f1.toString());
  console.log(f2.toString());
  console.log(f1.applyExpr(f2).bindAll().toString());
  console.log('\
these are the same object, so when reduced should be turned into unique objects so that when the FV is applied to the\n\
first function, the second one does not have the same thing done to it');
  _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
    console.log(name + ': ' + f.toString());
  });

  console.log('------------');
  console.log(new lambda.Function(0, new lambda.Variable(0)).bindAll().reduce().toString());
  console.log('\
in step 2, end up with different FVs both named y, so they get bound to the same thing, need to do alpha reduction to\n\
make sure they are differentiated, but then names are lost? (or just reduce vars??)');
  console.log(new lambda.Application(lambdacalc.stdFuncs['1'],
    lambdacalc.stdFuncs['2']).reduce().toString());
}

export = cli;
