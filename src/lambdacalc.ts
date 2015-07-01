/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import _ = require('lodash');
import lambda = require('./lambda');

export function echo(text:string):string {
  return text;
}

export var stdFuncs:lambda.Function[] = [
  new lambda.Function(0, 'f',
    new lambda.Function(1, 'x',
      new lambda.Variable(1)),
    '0'),
  new lambda.Function(0, 'f',
    new lambda.Function(1, 'x',
      new lambda.Application(
        new lambda.Variable(0),
        new lambda.Variable(1))),
    '1'),
  new lambda.Function(0, 'f',
    new lambda.Function(1, 'x',
      new lambda.Application(
        new lambda.Variable(0),
        new lambda.Application(
          new lambda.Variable(0),
          new lambda.Variable(1)))),
    '2'),
  new lambda.Function(0, 'r',
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
    'Y')
];
_.each(stdFuncs, (f:lambda.Function) => {
  f.bindAll();
});

export function getStdFunc(name:string):lambda.Function {
  return _.find(stdFuncs, (f:lambda.Function):boolean => f.preferredName === name);
}
