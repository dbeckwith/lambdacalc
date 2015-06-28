/**
 * Created by Daniel Beckwith on 6/6/15.
 */

///<reference path="_ref.d.ts"/>

import _ = require('lodash');

export var DEBUG:boolean = false;

function dbg(msg:any):void {
  if (DEBUG) {
    console.log(msg);
  }
}

export class Expression {

  static idToName(i:number):string {
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

  static equiv(e1:Expression, e2:Expression):boolean {
    e1 = e1.copy();
    e2 = e2.copy();
    e1.alphaNormalize();
    e2.alphaNormalize();
    return e1.equals(e2);
  }

  parent:Expression;

  constructor() {
    this.parent = null;
  }

  /**
   * Walks an expression tree.
   * @param vars The function to call on each variable
   * @param funcs The function to call on each function (return true to continue walk, false to end)
   * @param apps The function to call on each application (return true to continue walk, false to end)
   */
  walk(vars:(v:Variable, depth:number) => void,
       funcs:(f:Function, depth:number) => boolean,
       apps:(a:Application, depth:number) => boolean):void {
    function recurse(expr:Expression, depth:number):void {
      if (expr instanceof Variable) {
        if (vars) {
          vars(<Variable>expr, depth);
        }
      }
      else if (expr instanceof Function) {
        if (funcs) {
          if (!funcs(<Function>expr, depth)) {
            return;
          }
          depth++;
        }
        recurse(expr.body, depth);
      }
      else if (expr instanceof Application) {
        if (apps) {
          if (!apps(<Application>expr, depth)) {
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

  /**
   * Finds the first parent expression of the given type matching the given test.
   * @param T The expression type to search for
   * @param test The test that the expression must pass
   * @returns {T}
   */
  findFirst<T extends Expression>(T:new(...args:any[]) => T, test:(e:T) => boolean):T {
    var e:Expression = this;
    while (e !== null) {
      if (e instanceof T && test(<T>e)) {
        return <T>e;
      }
      e = e.parent;
    }
  }

  /**
   * Binds all variables in this expression tree to their target functions.
   * @returns {Expression} the new expression, as bound as possible
   */
  bindAll():Expression {
    var expr:Expression = this;
    /*expr.walk(null, (f:Function, depth:number) => {
     f.id = depth;
     return true;
     }, null);*/
    expr.walk((v:Variable) => {
      if (!v.isBound) {
        v.bind(<Function>v.findFirst(Function, (f:Function) => f.arg === v.index));
      }
      return true;
    }, null, null);
    return expr;
  }

  /**
   * Searches the expression tree for any duplicate names and renames functions when neccessary.
   * @param used The function names used so far in this branch of the tree
   */
  alphaReduce(...used:number[]):void {
    throw new Error('alphaReduce must be overloaded');
  }

  /**
   * Reduces the function names in this expression tree such that they are in a normal form. This method does not
   * preserve function names as well as {@link Expression#alphaReduce}
   * @param minArg The lowest name used so far in this branch of the tree
   */
  alphaNormalize(minArg?:number):void {
    throw new Error('alphaNormalize must be overloaded');
  }

  /**
   * Replaces all variables bound to the given binder by the given expression.
   * @param binder The binder function of the variables to replace
   * @param replacement The replacement expression
   */
  replace(binder:Function, replacement:Expression):Expression {
    throw new Error('replace must be overloaded');
  }

  /**
   * Reduces this expression by resolving at most a single redux.
   */
  reduceOnce():Expression {
    throw new Error('reduceOnce must be overloaded');
  }

  /**
   * Fully reduces this expression by calling {@link Expression#reduceOnce} until no more reduxes exist.
   * @returns {Expression}
   */
  reduce():Expression {
    var expr:Expression = this;
    var reduced:Expression;
    dbg(expr.toString());
    while (true) {
      reduced = expr.reduceOnce();
      dbg('reduced: ' + reduced.toString());
      reduced.bindAll();
      dbg('bound: ' + reduced.toString());
      reduced.alphaReduce();
      dbg('alphaReduced: ' + reduced.toString());
      if (expr.equals(reduced)) {
        break;
      }
      expr = reduced;
    }
    return reduced;
  }

  /**
   * Creates a deep copy of this expression (variables will be unbound).
   */
  copy():Expression {
    throw new Error('copy must be overloaded');
  }

  /**
   * Tests if this expression is equal to the given expression.
   * @param expr
   */
  equals(expr:Expression):boolean {
    throw new Error('equals must be overloaded');
  }

  /**
   * Converts this expression to a string format.
   */
  toString():string {
    throw new Error('toString must be overloaded');
  }
}

export class Variable extends Expression {

  index:number;
  binder:Function;

  constructor(index:number) {
    super();
    this.index = index;
    this.binder = null;
  }

  get isBound():boolean {
    return this.binder !== null;
  }

  bind(binder:Function):void {
    if (!binder) {
      binder = null;
    }
    this.binder = binder;
  }

  alphaReduce(...used:number[]):void {
  }

  alphaNormalize(minArg?:number):void {
  }

  replace(binder:Function, replacement:Expression):Expression {
    if (this.binder === binder) {
      return replacement;
    }
    return this.copy();
  }

  reduceOnce():Expression {
    return this.copy();
  }

  copy():Expression {
    return new Variable(this.index);
  }

  equals(expr:Expression):boolean {
    if (expr instanceof Variable) {
      return this.index === expr.index;
    }
    else {
      return false;
    }
  }

  toString():string {
    return this.isBound ? this.binder.argStr : DEBUG ? '[' + this.index + '*]' : Expression.idToName(this.index);
  }

}

interface ArgName {
  arg: number;
  preferredName?: string;
}

export class Function extends Expression {

  private static CURR_ID:number = 0;

  static multiArg(args:ArgName[]|number[], body:Expression):Function {
    if (args.length === 0) {
      throw new Error('Must have at least one argument');
    }
    var arg:number, name:string;

    function getArgs(i:number):void {
      if (typeof args[i] === 'number') {
        arg = <number>args[i];
        name = void 0;
      }
      else {
        arg = (<ArgName>args[i]).arg;
        name = (<ArgName>args[i]).preferredName;
      }
    }

    getArgs(args.length - 1);
    var f:Function = new Function(arg, body, name);
    for (var i:number = args.length - 2; i >= 0; i--) {
      getArgs(i);
      f = new Function(arg, f, name);
    }
    return f;
  }

  id:number;
  arg:number;
  body:Expression;
  preferredName:string;

  constructor(arg:number, body:Expression, preferredName?:string) {
    super();
    this.id = Function.CURR_ID++;
    this.arg = arg;
    this.body = body;
    this.preferredName = preferredName;

    this.body.parent = this;
  }

  get hasPreferredName():boolean {
    return !!this.preferredName;
  }

  get argStr():string {
    return DEBUG ? '[' + this.id + '|' + this.arg + ']' : this.preferredName || Expression.idToName(this.arg);
  }

  applyExpr(expr:Expression):Expression {
    return this.body.replace(this, expr);
  }

  alphaReduce(...used:number[]):void {
    if (_.contains(used, this.arg)) {
      this.arg = _.max(used) + 1;
      this.body.walk((v:Variable) => {
        if (v.binder === this) {
          v.index = this.arg;
        }
      }, null, null);
    }
    var newUsed:number[] = used.slice(0);
    newUsed.push(this.arg);
    this.body.alphaReduce.apply(this.body, newUsed);
  }

  alphaNormalize(minArg?:number):void {
    this.arg = minArg || 0;
    this.body.alphaNormalize(this.arg + 1);
  }

  replace(binder:Function, replacement:Expression):Expression {
    return new Function(this.arg, this.body.replace(binder, replacement), this.preferredName);
  }

  reduceOnce():Expression {
    return new Function(this.arg, this.body.reduceOnce(), this.preferredName);
  }

  copy():Expression {
    return new Function(this.arg, this.body.copy(), this.preferredName);
  }

  equals(expr:Expression):boolean {
    if (expr instanceof Function) {
      return this.arg === expr.arg && this.body.equals(expr.body);
    }
    else {
      return false;
    }
  }

  toString():string {
    var args:string = '';
    var body:string = '[error]';
    this.walk(null, (f:Function) => {
      args += f.argStr;
      if (!(f.body instanceof Function)) {
        body = f.body.toString();
        return false;
      }
      return true;
    }, null);
    return '\\' + /* '[' + this.id + ']' + */ args + '.' + body + '';
  }

}

export class Application extends Expression {

  static multiApp(exprs:Expression[]):Application {
    if (exprs.length < 2) {
      throw new Error('Must apply at least two expressions');
    }
    var app:Application = new Application(exprs[0], exprs[1]);
    for (var i:number = 2; i < exprs.length; i++) {
      app = new Application(app, exprs[i]);
    }
    return app;
  }

  exprs:Expression[];

  constructor(exprA:Expression, exprB:Expression) {
    super();
    this.exprs = [exprA, exprB];

    _.each(this.exprs, (expr:Expression) => expr.parent = this);
  }

  get exprA():Expression {
    return this.exprs[0];
  }

  get exprB():Expression {
    return this.exprs[1];
  }

  alphaReduce(...used:number[]):void {
    _.each(this.exprs, (expr:Expression) => expr.alphaReduce.apply(expr, used.slice(0)));
  }

  alphaNormalize(minArg?:number):void {
    _.each(this.exprs, (expr:Expression) => expr.alphaNormalize(minArg));
  }

  replace(binder:Function, replacement:Expression):Expression {
    var newExprs:Expression[] = _.map(this.exprs, (expr:Expression) => expr.replace(binder, replacement));
    return new Application(newExprs[0], newExprs[1]);
  }

  reduceOnce():Expression {
    if (this.exprA instanceof Function) {
      return (<Function>this.exprA).applyExpr(this.exprB.copy());
    }
    else {
      return new Application(this.exprA.reduceOnce(), this.exprB.reduceOnce());
    }
  }

  copy():Expression {
    return new Application(this.exprA.copy(), this.exprB.copy());
  }

  equals(expr:Expression):boolean {
    if (expr instanceof Application) {
      return this.exprs.length === expr.exprs.length &&
             _.all(this.exprs, (e1:Expression, i:number) => e1.equals(expr.exprs[i]));
    }
    else {
      return false;
    }
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
    return _(this.exprs)
      .map((expr:Expression, i:number) => parens[i] ? '(' + expr.toString() + ')' : expr.toString())
      .reduce((a:string, b:string) => a + ' ' + b);
  }

}
