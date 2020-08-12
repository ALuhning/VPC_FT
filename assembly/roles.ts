import { Context, PersistentMap, storage } from 'near-sdk-as'
import { AccountId } from './ft-types'
import {
    ERR_NOT_AUTH_MODERATOR_ADD,
    ERR_NOT_AUTH_MODERATOR_REMOVE
} from './ft-error-messages'

const moderators = new PersistentMap<string, string>("m:")

export function isOwner(owner: AccountId): boolean {
    return owner == storage.get<string>("owner");
}
  
export function isModerator(moderator: AccountId): boolean {
    return <boolean>moderators.contains(moderator);
}

export function addModerator(moderator: AccountId): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_AUTH_MODERATOR_ADD);
    moderators.set(moderator, moderator);
    return true;
}
  
  export function removeModerator(moderator: AccountId): boolean {
    assert(isOwner(Context.predecessor), ERR_NOT_AUTH_MODERATOR_REMOVE);
    moderators.delete(moderator);
    return true;
}