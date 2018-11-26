// @flow

import React, { Component } from 'react'
import { Image, ScrollView, View, ActivityIndicator } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { sprintf } from 'sprintf-js'
import { fixFiatCurrencyCode } from '../../util/utils.js'
import eosLogo from '../../assets/images/currencies/fa_logo_eos.png'
import steemLogo from '../../assets/images/currencies/fa_logo_steem.png'
import * as Constants from '../../constants/indexConstants'
import s from '../../locales/strings.js'
import { PrimaryButton } from '../../modules/UI/components/Buttons/index'
import Text from '../../modules/UI/components/FormattedText'
import Gradient from '../../modules/UI/components/Gradient/Gradient.ui'
import SafeAreaView from '../../modules/UI/components/SafeAreaView/index'
import WalletListModal from '../../modules/UI/components/WalletListModal/WalletListModalConnector.js'
import styles from '../../styles/scenes/CreateWalletStyle.js'
import type { GuiFiatType, GuiWalletType } from '../../types.js'

const logos = {
  eos: eosLogo,
  steem: steemLogo
}

export type AccountPaymentParams = {
  accountCurrencyCode: string,
  accountName: string,
  paymentCurrencyCode: string
}

export type CreateWalletAccountSelectStateProps = {

}

export type CreateWalletAccountSelectOwnProps = {
  selectedFiat: GuiFiatType,
  selectedWalletType: GuiWalletType,
  accountName: string
}
type Props = CreateWalletAccountSelectOwnProps
type State = {
  walletName: string,
  walletId: string
}

export class CreateWalletAccountSelect extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      isModalVisible: false,
      error: '',
      walletId: '',
      walletName: ''
    }
    const currencyCode = props.selectedWalletType.currencyCode
    props.fetchAccountActivationInfo(currencyCode)
  }

  componentDidMount = () => {
    const { selectedFiat, selectedWalletType, createAccountBasedWallet, accountName } = this.props
    createAccountBasedWallet(accountName, selectedWalletType.value, fixFiatCurrencyCode(selectedFiat.value), false, true)
  }

  onBack = () => {
    Actions.pop()
  }

  handleChangeHandle = (accountHandle: string) => {
    this.setState({ accountHandle })
  }

  handleChangePassword = (password: string) => {
    this.setState({ password })
  }

  onPressSelect = () => {
    this.setState({
      isModalVisible: true
    })
    /* const txData = {
      currencyCode,
      publicAddress: '12q4wQJfkATzBYwTCf71aPHsxNc81qkVzu',
      nativeAmount: '100000'
    }
    this.props.createAccountTransaction(walletId, txData) */
  }

  onSelectWallet = (walletId: string, paymentCurrencyCode: string) => {
    const { wallets, accountName, selectedWalletType, fetchAccountActivationPaymentInfo } = this.props
    const paymentWallet = wallets[walletId]
    const walletName = paymentWallet.name
    this.setState({
      isModalVisible: false,
      walletId,
      walletName
    })
    const paymentInfo: AccountPaymentParams = {
      accountCurrencyCode: selectedWalletType.currencyCode,
      accountName,
      paymentCurrencyCode
    }
    fetchAccountActivationPaymentInfo(paymentInfo)
  }

  renderSelectWallet = () => {
    const { activationCost, selectedWalletType, isCreatingWallet } = this.props
    const currencyCode = selectedWalletType.currencyCode
    return (
      <View style={styles.selectPaymentLower}>
        <View style={styles.buttons}>
          <PrimaryButton style={[styles.next]} onPress={this.onPressSelect}>
            <PrimaryButton.Text>{isCreatingWallet ? <ActivityIndicator /> : s.strings.create_wallet_account_select_wallet}</PrimaryButton.Text>
          </PrimaryButton>
        </View>
        <View style={styles.paymentArea}>
          <Text style={styles.paymentLeft}>{s.strings.create_wallet_account_amount_due}</Text>
          <Text style={styles.paymentRight}>{activationCost} {currencyCode}</Text>
        </View>
      </View>
    )
  }

  renderPaymentReview = () => {
    const {
      wallets,
      paymentCurrencyCode,
      accountName,
      isCreatingWallet,
      exchangeAmount,
      selectedWalletType,
      selectedFiat
    } = this.props
    const { walletId } = this.state
    const wallet = wallets[walletId]
    const name = wallet.name

    return (
      <View>
        <View style={styles.selectPaymentLower}>
          <View style={styles.accountReviewWalletNameArea}>
            <Text style={styles.accountReviewWalletNameText}>{name}:{paymentCurrencyCode}</Text>
          </View>
          <View style={styles.paymentArea}>
            <Text style={styles.paymentLeft}>{s.strings.create_wallet_account_amount_due}</Text>
            <Text style={styles.paymentRight}>{exchangeAmount} {selectedWalletType.currencyCode}</Text>
          </View>
        </View>
        <View style={styles.accountReviewInfoArea}>
          <Text style={styles.accountReviewInfoText}>{s.strings.create_wallet_account_payment_source} {name}</Text>
          <Text style={styles.accountReviewInfoText}>{s.strings.create_wallet_crypto_type_label} {paymentCurrencyCode}</Text>
          <Text style={styles.accountReviewInfoText}>{s.strings.create_wallet_fiat_type_label} {selectedFiat.label}</Text>
          <Text style={styles.accountReviewInfoText}>{s.strings.create_wallet_name_label} {accountName}</Text>
        </View>
        <View style={styles.accountReviewConfirmArea}>
          <Text style={styles.accountReviewConfirmText}>{s.strings.create_wallet_account_confirm}</Text>
        </View>
        <View style={styles.confirmButtonArea}>
          <PrimaryButton style={[styles.confirmButton]} onPress={this.onPressSubmit}>
            <PrimaryButton.Text>{isCreatingWallet ? <ActivityIndicator /> : s.strings.submit}</PrimaryButton.Text>
          </PrimaryButton>
        </View>
      </View>
    )
  }

  render () {
    const { supportedCurrencies, selectedWalletType, activationCost } = this.props
    const instructionSyntax = sprintf(s.strings.create_wallet_account_select_instructions, `${activationCost} ${selectedWalletType.currencyCode}`)
    const confirmMessageSyntax = sprintf(s.strings.create_wallet_account_make_payment, selectedWalletType.currencyCode)
    // only included supported types of payment in WalletListModal
    const supportedCurrenciesList = []
    for (const currency in supportedCurrencies) {
      if (supportedCurrencies[currency]) {
        supportedCurrenciesList.push(currency)
      }
    }
    return (
      <SafeAreaView>
        <View style={styles.scene}>
          <Gradient style={styles.gradient} />
          <ScrollView>
            <View style={styles.view}>
              <Image source={logos['eos']} style={styles.currencyLogo} resizeMode={'cover'} />
              <View style={styles.createWalletPromptArea}>
                <Text style={styles.instructionalText}>{this.state.walletId ? confirmMessageSyntax : instructionSyntax}</Text>
              </View>
            </View>
            {this.state.walletId ? this.renderPaymentReview() : this.renderSelectWallet()}
          </ScrollView>
          {this.state.isModalVisible && (
            <WalletListModal
              topDisplacement={Constants.TRANSACTIONLIST_WALLET_DIALOG_TOP}
              type={Constants.FROM}
              onSelectWallet={this.onSelectWallet}
              includedCurrencyCodes={supportedCurrenciesList}
            />
          )}
        </View>
      </SafeAreaView>
    )
  }
}
