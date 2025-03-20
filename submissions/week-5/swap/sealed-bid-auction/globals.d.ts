declare module '@nomicfoundation/hardhat-ethers/signers' {
    import { Signer, Provider } from 'ethers';
  
    export interface SignerWithAddress extends Signer {
      address: string;
      provider: Provider;
    }
  }