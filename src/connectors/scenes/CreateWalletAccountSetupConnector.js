// @flow

import { connect } from 'react-redux'

import { CreateWalletAccountSetup } from '../../components/scenes/CreateWalletAccountSetupScene'
import { checkHandleAvailability } from '../../actions/CreateWalletActions.js'
import type { Dispatch, State } from '../../modules/ReduxTypes'

const mapStateToProps = (state: State) => ({
  isCheckingHandleAvailability: state.ui.scenes.createWallet.isCheckingHandleAvailability,
  isHandleAvailable: state.ui.scenes.createWallet.isHandleAvailable
})

const mapDispatchToProps = (dispatch: Dispatch): CreateWalletAccountSetupDispatchProps => ({
  checkHandleAvailability: (handle: string) => dispatch(checkHandleAvailability(handle))
})

export const CreateWalletAccountSetupConnector = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateWalletAccountSetup)
