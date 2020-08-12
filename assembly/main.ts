  
// @nearfile
import { Context, storage, logging, env, u128 } from "near-sdk-as";
import { AccountId, Amount } from './ft-types'
import { totalSupply, allowanceRegistry, balanceRegistry } from './ft-models'

import {
    ERR_INVALID_AMOUNT,
    ERR_INVALID_ACCOUNT,
    ERR_INVALID_ACCOUNT_ID,
    ERR_INVALID_ESCROW_ACCOUNT,
    ERR_INSUFFICIENT_BALANCE,
    ERR_INSUFFICIENT_ESCROW_BALANCE,
    ERR_INCREMENT_ALLOWANCE_OWNER,
    ERR_DECREMENT_ALLOWANCE_OWNER,
    ERR_DECREMENT_LESS_THAN_ZERO,
    ERR_TOKEN_ALREADY_MINTED,
    ERR_NOT_OWNER,
    ERR_NOT_ENOUGH_TOKENS
} from './ft-error-messages'

/**
 * Init function that creates a new fungible token and initial supply
 * @param name 
 * @param symbol 
 * @param precision 
 * @param initialSupply 
 */
export function init(name: string, symbol: string, precision: u8, initialSupply: u128): void {
    logging.log("initialOwner: " + Context.predecessor);
    assert(storage.get<string>("init") == null, ERR_TOKEN_ALREADY_MINTED);

    //set Token Name
    storage.set<string>("tokenName", name)

    //set Token Symbol
    storage.set<string>("tokenSymbol", symbol)

    //set Precision
    storage.set<u8>("precision", precision)

    //set Total Supply
    totalSupply.set('totalSupply', initialSupply);

    // assign total initial supply to owner's balance
    balanceRegistry.set(Context.predecessor, initialSupply);

    //set contract owner
    storage.set<string>("owner", Context.predecessor);

    //set init to done
    storage.set<string>("init", "done")

  }

/***************************/ 
/* FUNGIBLE TOKEN STANDARD */
/************************* */
  
// CHANGE METHODS
// --------------

/**
 * Increments the `allowance` for `escrow_account_id` by `amount` on the account of the caller of this contract
 * (`predecessor_id`) who is the balance owner.
 *
 * @param escrow_account_id
 * @param amount
 */
export function inc_allowance(escrow_account_id: AccountId, amount: Amount): void {
    assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
    assert(env.isValidAccountID(escrow_account_id), ERR_INVALID_ACCOUNT_ID)
    const owner_id = Context.predecessor
    assert(escrow_account_id==owner_id, ERR_INCREMENT_ALLOWANCE_OWNER)
  
   
    const balance = allowanceRegistry.get(keyFrom(owner_id, escrow_account_id))
    if(u128.from(balance) > u128.Zero) {
      allowanceRegistry.set(keyFrom(owner_id, escrow_account_id), u128.from(u128.add(u128.from(balance), u128.from(amount)).lo))
    } else {
      allowanceRegistry.delete(keyFrom(owner_id, escrow_account_id))
    }
    
  }
  
  
  /**
   * Decrements the `allowance` for `escrow_account_id` by `amount` on the account of the caller of this contract
   * (`predecessor_id`) who is the balance owner.
   *
   * @param escrow_account_id
   * @param amount
   */
  export function dec_allowance(escrow_account_id: AccountId, amount: Amount): void {
      assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
      assert(env.isValidAccountID(escrow_account_id), ERR_INVALID_ACCOUNT_ID)
      const owner_id = Context.predecessor
      assert(escrow_account_id==owner_id, ERR_DECREMENT_ALLOWANCE_OWNER)
    
     
      const balance = allowanceRegistry.get(keyFrom(owner_id, escrow_account_id))
      if(u128.from(balance) > u128.Zero) {
          assert(u128.sub(u128.from(balance), u128.from(amount)) > u128.Zero, ERR_DECREMENT_LESS_THAN_ZERO)
          allowanceRegistry.set(keyFrom(owner_id, escrow_account_id), u128.from(u128.sub(u128.from(balance), u128.from(amount)).lo))
      } else {
        allowanceRegistry.delete(keyFrom(owner_id, escrow_account_id))
      }
      
    }
  
  
  /**
   * Transfers the `amount` of tokens from `owner_id` to the `new_owner_id`.
   * Requirements:
   * - `amount` should be a positive integer.
   * - `owner_id` should have balance on the account greater or equal than the transfer `amount`.
   * - If this function is called by an escrow account (`owner_id != predecessor_id`),
   *   then the allowance of the caller of the function (`predecessor_id`) on
   *   the account of `owner_id` should be greater or equal than the transfer `amount`.
   * @param owner_id
   * @param new_owner_id
   * @param amount
   */
  export function transfer_from(owner_id: AccountId, new_owner_id: AccountId,  amount: Amount): void {
    assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
    assert(env.isValidAccountID(owner_id), ERR_INVALID_ACCOUNT_ID)
    assert(env.isValidAccountID(new_owner_id), ERR_INVALID_ACCOUNT_ID)
    assert(balanceRegistry.contains(owner_id), ERR_INVALID_ACCOUNT)
    assert(balanceRegistry.getSome(owner_id) >= amount, ERR_INSUFFICIENT_BALANCE)
  
    if(owner_id != Context.predecessor) {
      const key = keyFrom(owner_id, Context.predecessor)
      assert(allowanceRegistry.contains(key), ERR_INVALID_ESCROW_ACCOUNT)
  
      const allowance = allowanceRegistry.getSome(key)
      assert(allowance >= amount, ERR_INSUFFICIENT_ESCROW_BALANCE)
  
      allowanceRegistry.set(key, u128.sub(allowance, amount))
    }
  
    const balanceOfOwner = balanceRegistry.getSome(owner_id)
    const balanceOfNewOwner = balanceRegistry.get(new_owner_id, u128.Zero)!
  
    balanceRegistry.set(owner_id, u128.sub(balanceOfOwner, amount))
    balanceRegistry.set(new_owner_id, u128.add(balanceOfNewOwner, amount))
  }
  
  
  /**
   * Transfer `amount` of tokens from the caller of the contract (`predecessor_id`) to
   * `new_owner_id`.
   * Note: This call behaves as if `transfer_from` with `owner_id` equal to the caller
   * of the contract (`predecessor_id`).
   * @param new_owner_id
   * @param amount
   */
  // it bugs me that we have both of these when we decided we didn't need both for NFT
  // but i guess that's part of the spec
  export function transfer(new_owner_id: AccountId, amount: Amount): void {
    assert(env.isValidAccountID(new_owner_id), ERR_INVALID_ACCOUNT_ID)
    const owner_id = Context.predecessor
    transfer_from(owner_id, new_owner_id, amount)
  }
  
// VIEW METHODS
// ------------
  
  /**
   * Returns total supply of tokens.
   */
  export function get_total_supply(): u128 {
    return totalSupply.getSome('totalSupply')
  }
  
  
  /**
   * Returns balance of the `owner_id` account.
   * @param owner_id
   */
  // do we need a warning similar to the one for get_allowance?
  export function get_balance(owner_id: AccountId): u128 {
    assert(balanceRegistry.contains(owner_id), ERR_INVALID_ACCOUNT)
    return balanceRegistry.getSome(owner_id)
  }
  
  
  /**
   * Returns current allowance of `escrow_account_id` for the account of `owner_id`.
   *
   * NOTE: Other contracts should not rely on this information, because by the moment a contract
   * receives this information, the allowance may already be changed by the owner.
   * So this method should only be used on the front-end to see the current allowance.
   */
  export function get_allowance(owner_id: AccountId, escrow_account_id: AccountId): u128 {
    const key = keyFrom(owner_id, escrow_account_id)
    assert(allowanceRegistry.contains(key), ERR_INVALID_ACCOUNT)
    return allowanceRegistry.get(key, u128.Zero)!
  }


/******************************************************/ 
/* NON-SPEC METHODS TO EXTEND FUNGIBLE TOKEN STANDARD */
/******************************************************/
  
// CHANGE METHODS
// --------------

/**
  * Allow owner to burn tokens
  * @param tokens 
  */
 export function burn(tokens: u128): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_OWNER)
    const balance = get_balance(Context.predecessor)
    assert(balance >= tokens, ERR_NOT_ENOUGH_TOKENS)
    let currentSupply = totalSupply.getSome('totalSupply')
    totalSupply.set('totalSupply', u128.sub(currentSupply, tokens))
    balanceRegistry.set(Context.predecessor, u128.sub(balance , tokens))
    return true;
  }
  
/**
 * Allow owner to mint more tokens
 * @param tokens 
 */
  export function mint(tokens: u128): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_OWNER)
    let currentSupply = totalSupply.getSome('totalSupply')
    totalSupply.set('totalSupply', u128.add(currentSupply, tokens))
    let currentBalance = get_balance(Context.predecessor)
    balanceRegistry.set(Context.predecessor, u128.add(currentBalance, tokens));
    return true;
  }
 
/**
 * Allow current owner to transfer ownership to a new owner
 * @param newOwner 
 */  
  export function transferOwnership(newOwner: AccountId): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_OWNER)
    assert(env.isValidAccountID(newOwner), ERR_INVALID_ACCOUNT_ID)
    storage.set<string>("owner", newOwner);
    return true;
  }

// VIEW METHODS
// ------------

/**
 * get name of the token
 */
export function getTokenName(): string {
    return storage.getSome<string>('tokenName')
}

/**
 * get token symbol
 */
export function getTokenSymbol(): string {
    return storage.getSome('tokenSymbol')
}

/**
 * returns number of decimals the token uses. e.g. 8 means to divide the token
 * amount by 100000000 to get its user representation
 */
export function getPrecision(): u8 {
    return storage.getSome<u8>('precision')
}

/*********************/ 
/* UTILITY FUNCTIONS */
/*********************/

/**
 * Generate a consistent key format for looking up which 'owner_id' has given 
 * an 'escrow_id' some 'allowance' to transfer on their behalf
 * @param owner_id
 * @param escrow_id
 */

export function keyFrom(owner_id: AccountId, escrow_id: AccountId): string {
    return owner_id + ":" + escrow_id
}


/**
 * Returns the owner which we use in multiple places to confirm user has access to 
 * do whatever they are trying to do.  Some things like minting, burning and so on
 * should only be done by the owner
 * @param owner 
 */
export function isOwner(owner: AccountId): boolean {
    return owner == storage.get<string>("owner");
}