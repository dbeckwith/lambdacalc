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
  _.each(lambdacalc.stdFuncs, (f:lambda.Function, name:string) => {
    console.log(name + ': ' + f.toString());
  });
}

export = cli;
