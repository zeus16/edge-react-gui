// @flow

import { connect } from 'react-redux'

import { checkHandleAvailability } from '../../actions/CreateWalletActions.js'
import { CreateWalletAccountSetup } from '../../components/scenes/CreateWalletAccountSetupScene'
import type { Dispatch, State } from '../../modules/ReduxTypes'

const mapStateToProps = (state: State) => {
  return {
    isCheckingHandleAvailability: state.ui.scenes.createWallet.isCheckingHandleAvailability,
    isAvailable: state.ui.scenes.createWallet.isHandleAvailable.isAvailable,
    errorMessage: state.ui.scenes.createWallet.isHandleAvailable.message
  }
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps) => ({
  checkHandleAvailability: (handle: string) => dispatch(checkHandleAvailability(ownProps.selectedWalletType.currencyCode, handle))
})

export const CreateWalletAccountSetupConnector = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateWalletAccountSetup)
