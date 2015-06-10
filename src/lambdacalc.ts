/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import _ = require('lodash');
import lambda = require('./lambda');

export function echo(text:string):string {
  return text;
}

export var stdFuncs:{[index:string]:lambda.Function} = {
  '0': new lambda.Function(0,
    new lambda.Function(1,
      new lambda.Variable(1),
      'x'),
    'f'),
  '1': new lambda.Function(0,
    new lambda.Function(1,
      new lambda.Application(
        new lambda.Variable(0),
        new lambda.Variable(1)),
      'x'),
    'f'),
  '2': new lambda.Function(0,
    new lambda.Function(1,
      new lambda.Application(
        new lambda.Variable(0),
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Variable(1))),
      'x'),
    'f'),
  'Y': new lambda.Function(0,
    new lambda.Application(
      new lambda.Function(1,
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Application(
            new lambda.Variable(1),
            new lambda.Variable(1))),
        'x'),
      new lambda.Function(1,
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Application(
            new lambda.Variable(1),
            new lambda.Variable(1))),
        'x')
    ), 'r')
};

_.each(stdFuncs, (f:lambda.Function) => {
  f.bindAll();
});
