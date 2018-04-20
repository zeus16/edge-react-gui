// @flow

import { loadContactsStart } from './actions.js'
import { ContactsState, contactsReducer, initialState } from './contactsReducer.js'

export type { ContactsState }
export { loadContactsStart, initialState, contactsReducer }
