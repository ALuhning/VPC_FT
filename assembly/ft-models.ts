import { u128, PersistentMap } from 'near-sdk-as'

// Data Types and Storage
export const allowanceRegistry = new PersistentMap<string, u128>('a')
export const balanceRegistry = new PersistentMap<string, u128>('b')
export const totalSupply = new PersistentMap<string, u128>('c')