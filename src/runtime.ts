/**
 * Runtime context storage for the Cliq plugin.
 */

let cliqRuntime: any = null;

export function getCliqRuntime(): any {
  return cliqRuntime;
}

export function setCliqRuntime(rt: any): void {
  cliqRuntime = rt;
}
