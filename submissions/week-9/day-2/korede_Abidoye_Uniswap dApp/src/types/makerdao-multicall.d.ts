// src/types/makerdao-multicall.d.ts
declare module '@makerdao/multicall' {
  export interface Call {
    target: string;
    call: string[];
    returns: [string][];
  }

  export interface Config {
    rpcUrl: string;
    multicallAddress?: string;
  }

  export interface Result {
    results: {
      transformed: Record<string, any>;
    };
  }

  export function aggregate(calls: Call[], config: Config): Promise<Result>;
}