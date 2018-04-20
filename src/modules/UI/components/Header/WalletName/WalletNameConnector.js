// @flow

import { connect } from 'react-redux'

import type { State } from '../../../../ReduxTypes'
import * as UI_SELECTORS from '../../../selectors'
import { WalletName } from './WalletName.ui.js'
import type { Props } from './WalletName.ui'

const mapStateToProps = (state: State): Props => {
  return {
    name: UI_SELECTORS.getSelectedWallet(state).name,
    denomination: UI_SELECTORS.getSelectedCurrencyCode(state)
  }
}

export default connect(mapStateToProps)(WalletName)
