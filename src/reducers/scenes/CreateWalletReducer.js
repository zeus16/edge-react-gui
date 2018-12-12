// @flow

import { type Reducer, combineReducers } from 'redux'

import type { Action } from '../../modules/Action.js'
import { type IsHandleAvailableType } from '../../actions/CreateWalletActions.js'

export type HandleActivationInfo = {
  supportedCurrencies: { [string]: boolean },
  activationCost: string
}

export type AccountActivationPaymentInfo = {
  paymentAddress: string,
  amount: string,
  currencyCode: string,
  expireTime: number
}

export type CreateWalletState = {
  isCreatingWallet: boolean,
  isCheckingHandleAvailability: boolean,
  isHandleAvailable: {
    isAvailable: boolean,
    message: string
  },
  handleActivationInfo: HandleActivationInfo,
  walletAccountActivationPaymentInfo: AccountActivationPaymentInfo
}

const isCreatingWallet = (state = false, action: Action): boolean => {
  switch (action.type) {
    case 'UI/WALLETS/CREATE_WALLET_START': {
      return true
    }

    case 'UI/WALLETS/CREATE_WALLET_SUCCESS': {
      return false
    }

    case 'UI/WALLETS/CREATE_WALLET_FAILURE': {
      return false
    }

    default:
      return state
  }
}

const isCheckingHandleAvailability: Reducer<boolean, Action> = (state = false, action: Action): boolean => {
  switch (action.type) {
    case 'IS_CHECKING_HANDLE_AVAILABILITY': {
      return action.data
    }
    case 'IS_HANDLE_AVAILABLE': {
      return false
    }
    default:
      return state
  }
}

const isHandleAvailable: Reducer<IsHandleAvailableType, Action> = (state = {isAvailable: false, message: ''}, action: Action): IsHandleAvailableType => {
  switch (action.type) {
    case 'IS_CHECKING_HANDLE_AVAILABILITY': {
      if (action.data === true) {
        return {
          isAvailable: false,
          message: ''
        }
      }
      return state
    }
    case 'IS_HANDLE_AVAILABLE': {
      if (!action.data) return state
      return action.data
    }
    default:
      return state
  }
}

const initialHandleActivationInfo = {
  supportedCurrencies: {},
  activationCost: ''
}

const handleActivationInfo = (state = initialHandleActivationInfo, action: Action): HandleActivationInfo => {
  switch (action.type) {
    case 'ACCOUNT_ACTIVATION_INFO':
      return action.data
    default:
      return state
  }
}

const initialActivationPaymentState = {
  paymentAddress: '',
  amount: '',
  currencyCode: '',
  expireTime: 0
}

const walletAccountActivationPaymentInfo = (state = initialActivationPaymentState, action: Action): AccountActivationPaymentInfo => {
  switch (action.type) {
    case 'ACCOUNT_ACTIVATION_PAYMENT_INFO':
      return action.data
    default:
      return state
  }
}

export const createWallet: Reducer<CreateWalletState, Action> = combineReducers({
  isCreatingWallet,
  isCheckingHandleAvailability,
  isHandleAvailable,
  handleActivationInfo,
  walletAccountActivationPaymentInfo
})
