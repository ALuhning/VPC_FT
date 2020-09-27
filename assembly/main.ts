  

import { Context, storage, logging, env, u128, PersistentDeque } from "near-sdk-as"
import { AccountId, Amount } from './ft-types'
import { supply, allowanceRegistry, balanceRegistry } from './ft-models'
import { transferEvents, TransferEvent, mintEvents, MintEvent, burnEvents, BurnEvent, OwnerTransferEvent, ownerTransferEvents } from './ft-events'

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
    ERR_NOT_ENOUGH_TOKENS,
    ERR_SEND_YOURSELF,
    ERR_POSITIVE
} from './ft-error-messages'

import {
  recordApprovalEvent,
  recordTransferEvent,
  recordMintEvent,
  recordBurnEvent,
  recordOwnershipTransferEvent
} from './ft-events'

/**
 * Init function that creates a new fungible token and initial supply
 * @param name 
 * @param symbol 
 * @param precision 
 * @param initialSupply 
 */
export function init(name: string, symbol: string, precision: u128, initialSupply: u128): boolean {
    logging.log("initialOwner: " + Context.predecessor)
    assert(storage.get<string>("init") == null, ERR_TOKEN_ALREADY_MINTED)

    //set Token Name
    storage.set<string>("tokenName", name)

    //set Token Symbol
    storage.set<string>("tokenSymbol", symbol)

    //set Precision
    storage.set<u128>("precision", precision)

    //set Total Supply
    supply.set('totalSupply', initialSupply)

    //set Initial Supply
    supply.set('initialSupply', initialSupply)

    // assign total initial supply to owner's balance
    balanceRegistry.set(Context.predecessor, initialSupply)

    //set contract owner
    storage.set<string>("owner", Context.predecessor)

    //set init to done
    storage.set<string>("init", "done")

    return true
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
  assert(env.isValidAccountID(owner_id), ERR_INVALID_ACCOUNT_ID)
  assert(env.isValidAccountID(escrow_id), ERR_INVALID_ACCOUNT_ID)
  return owner_id + ":" + escrow_id
}


/**
* Returns the owner which we use in multiple places to confirm user has access to 
* do whatever they are trying to do.  Some things like minting, burning and so on
* should only be done by the owner
* @param owner 
*/
export function isOwner(owner: AccountId): boolean {
  assert(env.isValidAccountID(owner), ERR_INVALID_ACCOUNT_ID)
  return owner == storage.get<string>("owner")
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
export function inc_allowance(escrow_account_id: AccountId, amount: Amount): boolean {
    assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
    assert(env.isValidAccountID(escrow_account_id), ERR_INVALID_ACCOUNT_ID)
    
    const owner_id = Context.sender
   
    assert(escrow_account_id!=owner_id, ERR_INCREMENT_ALLOWANCE_OWNER)

    let lookup = allowanceRegistry.get(keyFrom(owner_id, escrow_account_id), u128.Zero)!

    if(lookup == u128.Zero){
      allowanceRegistry.set(keyFrom(owner_id, escrow_account_id), amount)
    }
    const balance = allowanceRegistry.getSome(keyFrom(owner_id, escrow_account_id))
    
    if(balance > u128.Zero) {
      allowanceRegistry.set(keyFrom(owner_id, escrow_account_id), u128.from(u128.add(u128.from(balance), u128.from(amount)).lo))
      const newBalance = allowanceRegistry.getSome(keyFrom(owner_id, escrow_account_id))
      if(balance && newBalance) {
        recordApprovalEvent(owner_id, escrow_account_id, balance, newBalance)
        }
    } else {
      allowanceRegistry.delete(keyFrom(owner_id, escrow_account_id))
    }
    return true
  }
  
  
  /**
   * Decrements the `allowance` for `escrow_account_id` by `amount` on the account of the caller of this contract
   * (`predecessor_id`) who is the balance owner.
   *
   * @param escrow_account_id
   * @param amount
   */
  export function dec_allowance(escrow_account_id: AccountId, amount: Amount): boolean {
      assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
      assert(env.isValidAccountID(escrow_account_id), ERR_INVALID_ACCOUNT_ID)
      const owner_id = Context.predecessor
      assert(escrow_account_id==owner_id, ERR_DECREMENT_ALLOWANCE_OWNER)
    
     
      const balance = allowanceRegistry.get(keyFrom(owner_id, escrow_account_id))
      if(u128.from(balance) > u128.Zero) {
          assert(u128.sub(u128.from(balance), u128.from(amount)) > u128.Zero, ERR_DECREMENT_LESS_THAN_ZERO)
          allowanceRegistry.set(keyFrom(owner_id, escrow_account_id), u128.from(u128.sub(u128.from(balance), u128.from(amount)).lo))
          const newBalance = allowanceRegistry.get(keyFrom(owner_id, escrow_account_id))
          if(balance && newBalance) {
          recordApprovalEvent(owner_id, escrow_account_id, balance, newBalance)
          }
      } else {
        allowanceRegistry.delete(keyFrom(owner_id, escrow_account_id))
      }
      return true
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
  export function transfer_from(owner_id: AccountId, new_owner_id: AccountId,  amount: Amount): boolean {
    assert(amount > u128.Zero, ERR_INVALID_AMOUNT)
    assert(owner_id != new_owner_id, ERR_SEND_YOURSELF)
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

    //record transfer event
    let spender = Context.predecessor
    logging.log('token transfer amount')
    logging.log(amount)
    recordTransferEvent(spender, owner_id, new_owner_id, amount)
    return true
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
  export function transfer(new_owner_id: AccountId, amount: Amount): boolean {
    assert(new_owner_id != Context.predecessor, ERR_SEND_YOURSELF)
    assert(env.isValidAccountID(new_owner_id), ERR_INVALID_ACCOUNT_ID)
    const owner_id = Context.predecessor
    transfer_from(owner_id, new_owner_id, amount)
    return true
  }
  
// VIEW METHODS
// ------------
  
  /**
   * Returns total supply of tokens.
   */
  export function get_total_supply(): u128 {
    return supply.getSome('totalSupply')
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
    assert(tokens > u128.Zero, ERR_POSITIVE)
    const balance = get_balance(Context.predecessor)
    assert(balance >= tokens, ERR_NOT_ENOUGH_TOKENS)
    let currentSupply = supply.getSome('totalSupply')
    supply.set('totalSupply', u128.sub(currentSupply, tokens))
    balanceRegistry.set(Context.predecessor, u128.sub(balance , tokens))
    recordTransferEvent(Context.predecessor, Context.predecessor, '0x0', tokens)
    recordBurnEvent(Context.predecessor, tokens)
    return true;
  }
  
/**
 * Allow owner to mint more tokens
 * @param tokens 
 */
  export function mint(tokens: u128): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_OWNER)
    assert(tokens > u128.Zero, ERR_POSITIVE)
    let currentSupply = supply.getSome('totalSupply')
    supply.set('totalSupply', u128.add(currentSupply, tokens))
    let currentBalance = get_balance(Context.predecessor)
    balanceRegistry.set(Context.predecessor, u128.add(currentBalance, tokens))
    recordTransferEvent(Context.predecessor, '0x0', Context.predecessor, tokens)
    recordMintEvent(Context.predecessor, tokens)
    return true;
  }
 
/**
 * Allow current owner to transfer ownership to a new owner
 * @param newOwner 
 */  
  export function transferOwnership(newOwner: AccountId): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_OWNER)
    assert(newOwner != Context.predecessor, ERR_SEND_YOURSELF)
    assert(env.isValidAccountID(newOwner), ERR_INVALID_ACCOUNT_ID)
    let currentBalance = get_balance(Context.predecessor)
    transfer(newOwner, currentBalance);
    storage.set<string>("owner", newOwner);
    recordOwnershipTransferEvent(Context.predecessor, newOwner)
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
    return storage.getSome<string>('tokenSymbol')
}

/**
 * returns number of decimals the token uses. e.g. 8 means to divide the token
 * amount by 100000000 to get its user representation
 */
export function getPrecision(): u128 {
    return storage.getSome<u128>('precision')
}

/**
 * returns initial supply that was set for the token
 */
export function getInitialSupply(): u128 {
  return supply.getSome('initialSupply')
}

/**
 * returns current token owner
 */
export function getOwner(): string {
  return storage.getSome<string>("owner")
}

/**
 * returns token init status
 */
export function getInit(): string {
  return storage.getSome<string>("init")
}

// Event Retrieval View Methods

/**
 * returns all Transfer Events
 */
export function getAllTransferEvents(): Array<TransferEvent> {
  let _transferList = new Array<TransferEvent>();
  logging.log(transferEvents)
  logging.log(transferEvents.length)
  if(transferEvents.length != 0) {
    for(let i: i32 = 0; i < transferEvents.length; i++) {
      logging.log(transferEvents)
      _transferList.push(transferEvents[i]);
    }
  }
  return _transferList;
}

/**
 * returns all Minting Events
 */
export function getAllMintEvents(): Array<MintEvent> {
  let _mintList = new Array<MintEvent>();
  logging.log(mintEvents)
  logging.log(mintEvents.length)
  if(mintEvents.length != 0) {
    for(let i: i32 = 0; i < mintEvents.length; i++) {
      logging.log(mintEvents)
      _mintList.push(mintEvents[i]);
    }
  }
  return _mintList;
}

/**
 * returns all Burn Events
 */
export function getAllBurnEvents(): Array<BurnEvent> {
  let _burnList = new Array<BurnEvent>();
  logging.log(burnEvents)
  logging.log(burnEvents.length)
  if(burnEvents.length != 0) {
    for(let i: i32 = 0; i < burnEvents.length; i++) {
      logging.log(burnEvents)
      _burnList.push(burnEvents[i]);
    }
  }
  return _burnList;
}

/**
 * returns all Ownership Transfer Events
 */
export function getAllOwnerTransferEvents(): Array<OwnerTransferEvent> {
  let _otList = new Array<OwnerTransferEvent>();
  logging.log(ownerTransferEvents)
  logging.log(ownerTransferEvents.length)
  if(ownerTransferEvents.length != 0) {
    for(let i: i32 = 0; i < ownerTransferEvents.length; i++) {
      logging.log(ownerTransferEvents)
      _otList.push(ownerTransferEvents[i]);
    }
  }
  return _otList;
}
