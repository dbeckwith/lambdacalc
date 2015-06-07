/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import _ = require('lodash');

export class Expression {

  private _parent:Expression;

  protected static intToChar(i:number):string {
    return String.fromCharCode(i + 'a'.charCodeAt(0));
  }

  constructor() {
    this._parent = null;
  }

  get parent():Expression {
    return this._parent;
  }

  /* tslint:disable:typedef */
  set parent(parent:Expression) {
    /* tslint:enable:typedef */
    this._parent = parent;
  }

  private walk(vars:(v:Variable) => void, funcs:(f:Function) => void, apps:(a:Application) => void):void {
    function recurse(expr:Expression):void {
      if (expr instanceof Variable) {
        if (vars) {
          vars(expr);
        }
      }
      else if (expr instanceof Function) {
        if (funcs) {
          funcs(expr);
        }
        recurse(expr.body);
      }
      else if (expr instanceof Application) {
        if (apps) {
          apps(expr);
        }
        _.each(expr.exprs, recurse);
      }
    }

    recurse(this);
  }

  bindAll():Expression {
    var expr:Expression = this;
    expr.walk((v:Variable) => {
      var e:Expression = v;
      while (e !== null) {
        if (e instanceof Function) {
          var f:Function = e;
          if (f.arg === v.index) {
            v.bind(f);
            break;
          }
        }
        e = e.parent;
      }
    }, null, null);
    return expr;
  }

  copy():Expression {
    throw new Error('copy must be overloaded');
  }

  toString():string {
    throw new Error('toString must be overloaded');
  }
}

export class Variable extends Expression {

  private _index:number;
  private _binder:Function;

  constructor(index:number) {
    super();
    this._index = index;
    this._binder = null;
  }

  get index():number {
    return this._index;
  }

  get isBound():boolean {
    return this._binder !== null;
  }

  bind(binder:Function):void {
    this._binder = binder;
  }

  copy():Expression {
    return new Variable(this.index);
  }

  toString():string {
    return this.isBound ? this._binder.argStr : Expression.intToChar(this.index) + '*';
  }

}

export class Function extends Expression {

  private static CURR_ID:number = 0;

  private _id:number;
  private _arg:number;
  private _body:Expression;

  constructor(arg:number, body:Expression) {
    super();
    this._id = Function.CURR_ID++;
    this._arg = arg;
    this._body = body;

    this._body.parent = this;
  }

  get id():number {
    return this._id;
  }

  get arg():number {
    return this._arg;
  }

  get argStr():string {
    return this.id + '';
  }

  get body():Expression {
    return this._body;
  }

  copy():Expression {
    return new Function(this.arg, this.body.copy());
  }

  toString():string {
    return '\\' + this.argStr + '.' + this.body + '';
  }

}

export class Application extends Expression {

  private _exprs:Expression[];

  constructor(exprA:Expression, exprB:Expression) {
    super();
    this._exprs = [exprA, exprB];

    _.each(this._exprs, (expr:Expression) => expr.parent = this);
  }

  get exprs():Expression[] {
    return this._exprs;
  }

  get exprA():Expression {
    return this._exprs[0];
  }

  get exprB():Expression {
    return this._exprs[1];
  }

  copy():Expression {
    return new Application(this.exprA.copy(), this.exprB.copy());
  }

  toString():string {
    return _.chain(this.exprs).map((expr:Expression) => '(' + expr + ')').reduce((a:string, b:string) => a + b);
  }

}
