/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import _ = require('lodash');

export class Expression {

  private _parent:Expression;

  public static idToName(i:number):string {
    if (i < 3) {
      return String.fromCharCode(i + 'x'.charCodeAt(0));
    }
    if (i < 6) {
      return String.fromCharCode(i - 3 + 'u'.charCodeAt(0));
    }
    if (i < 26) {
      return String.fromCharCode(i - 6 + 'a'.charCodeAt(0));
    }
    return '[' + (i - 26) + ']';
  }

  constructor() {
    this._parent = null;
  }

  get parent():Expression {
    return this._parent;
  }

  set parent(parent:Expression)/* tslint:disable:typedef */ {/* tslint:enable:typedef */
    this._parent = parent;
  }

  walk(vars:(v:Variable, depth:number) => void,
       funcs:(f:Function, depth:number) => boolean,
       apps:(a:Application, depth:number) => boolean):void {
    function recurse(expr:Expression, depth:number):void {
      if (expr instanceof Variable) {
        if (vars) {
          vars(expr, depth);
        }
      }
      else if (expr instanceof Function) {
        if (funcs) {
          if (!funcs(expr, depth)) {
            return;
          }
          depth++;
        }
        recurse(expr.body, depth);
      }
      else if (expr instanceof Application) {
        if (apps) {
          if (!apps(expr, depth)) {
            return;
          }
          depth++;
        }
        _.each(expr.exprs, (e:Expression) => {
          recurse(e, depth);
        });
      }
    }

    recurse(this, 0);
  }

  findFirst<T extends Expression>(T:new(...args:any[]) => T, test:(e:T) => boolean):T {
    var e:Expression = this;
    while (e !== null) {
      if (e instanceof T && test(<T>e)) {
        return <T>e;
      }
      e = e.parent;
    }
  }

  bindAll():Expression {
    var expr:Expression = this;
    expr.walk(null, (f:Function, depth:number) => {
      f.id = depth;
      return true;
    }, null);
    expr.walk((v:Variable) => {
      v.bind(<Function>v.findFirst(Function, (f:Function) => f.arg === v.index));
      return true;
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
    return this.isBound ? this._binder.argStr : this.index + '*';
  }

}

export class Function extends Expression {

  private static CURR_ID:number = 0;

  private _id:number;
  private _arg:number;
  private _body:Expression;
  private _prefferedName:string;

  constructor(arg:number, body:Expression, prefferedName?:string) {
    super();
    this._id = Function.CURR_ID++;
    this._arg = arg;
    this._body = body;
    this._prefferedName = prefferedName;

    this._body.parent = this;
  }

  set id(id:number)/* tslint:disable:typedef */ {/* tslint:enable:typedef */
    this._id = id;
  }

  get id():number {
    return this._id;
  }

  get arg():number {
    return this._arg;
  }

  get argStr():string {
    return this._prefferedName || Expression.idToName(this.id);
  }

  get body():Expression {
    return this._body;
  }

  copy():Expression {
    return new Function(this.arg, this.body.copy());
  }

  toString():string {
    var args:string = '';
    var body:string;
    this.walk(null, (f:Function) => {
      args += f.argStr;
      if (!(f.body instanceof Function)) {
        body = f.body.toString();
        return false;
      }
      return true;
    }, null);
    return '\\' + args + '.' + body + '';
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
    /*
     var paren1 = this.expr1 instanceof Function && !(useNames && (this.expr1.hasName() ||
     (useLatex ? this.expr1.hasLatexName() : false)));
     var paren2 = (this.expr2 instanceof Function && !(useNames && (this.expr2.hasName() ||
     (useLatex ? this.expr2.hasLatexName() : false)))) || this.expr2 instanceof Application;
     */
    var parens:boolean[] = [
      this.exprs[0] instanceof Function,
      this.exprs[1] instanceof Function || this.exprs[1] instanceof Application
    ];
    return _.chain(this.exprs)
      .map((expr:Expression, i:number) => parens[i] ? '(' + expr.toString() + ')' : expr.toString())
      .reduce((a:string, b:string) => a + ' ' + b);
  }

}
