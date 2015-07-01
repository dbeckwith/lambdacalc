/**
 * Created by Daniel Beckwith on 7/1/15.
 */

///<reference path="_ref.d.ts"/>

declare module Chai {
  interface Assertion {
    exprEqual: (value:any, message?:string) => Assertion;
    equiv: (value:any, message?:string) => Assertion;
  }
}
