// @flow

import type { EdgeCurrencyWallet } from 'edge-core-js'
import React, { Component } from 'react'
import { ActivityIndicator, Image, ScrollView, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { sprintf } from 'sprintf-js'

import eosLogo from '../../assets/images/currencies/fa_logo_eos.png'
import steemLogo from '../../assets/images/currencies/fa_logo_steem.png'
import * as Constants from '../../constants/indexConstants'
import { intl } from '../../locales/intl'
import s from '../../locales/strings.js'
import { PrimaryButton } from '../../modules/UI/components/Buttons/index'
import Text from '../../modules/UI/components/FormattedText'
import Gradient from '../../modules/UI/components/Gradient/Gradient.ui'
import SafeAreaView from '../../modules/UI/components/SafeAreaView/index'
import WalletListModal from '../../modules/UI/components/WalletListModal/WalletListModalConnector.js'
import styles from '../../styles/scenes/CreateWalletStyle.js'
import type { GuiFiatType, GuiWallet, GuiWalletType } from '../../types.js'
import { decimalOrZero, fixFiatCurrencyCode, truncateDecimals } from '../../util/utils.js'

const logos = {
  eos: eosLogo,
  steem: steemLogo
}

export type AccountPaymentParams = {
  requestedAccountName: string,
  currencyCode: string,
  ownerPublicKey: string,
  activePublicKey: string
}

export type CreateWalletAccountSelectStateProps = {
  wallets: { [string]: GuiWallet },
  paymentCurrencyCode: string,
  paymentAddress: string,
  exchangeAmount: string,
  amount: string,
  expireTime: string,
  supportedCurrencies: { [string]: boolean },
  activationCost: string,
  isCreatingWallet: boolean,
  paymentDenominationSymbol: string
}

type CreateWalletAccountSelectOwnProps = {
  selectedFiat: GuiFiatType,
  selectedWalletType: GuiWalletType,
  accountName: string
}

export type CreateWalletAccountSelectDispatchProps = {
  createAccountBasedWallet: (string, string, string, boolean, boolean) => any,
  fetchAccountActivationInfo: string => void,
  createAccountTransaction: (string, string, string) => void,
  fetchWalletAccountActivationPaymentInfo: AccountPaymentParams => void
}

type Props = CreateWalletAccountSelectOwnProps & CreateWalletAccountSelectDispatchProps & CreateWalletAccountSelectStateProps

type State = {
  walletName: string,
  walletId: string,
  isModalVisible: boolean,
  error: string,
  createdWallet: Promise<EdgeCurrencyWallet>,
  paymentCurrencyCode: string
}

export class CreateWalletAccountSelect extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const { selectedFiat, selectedWalletType, createAccountBasedWallet, accountName } = props
    const createdWallet = createAccountBasedWallet(accountName, selectedWalletType.value, fixFiatCurrencyCode(selectedFiat.value), false, true)
    this.state = {
      isModalVisible: false,
      error: '',
      walletId: '',
      walletName: '',
      createdWallet,
      paymentCurrencyCode: ''
    }
    const currencyCode = props.selectedWalletType.currencyCode
    props.fetchAccountActivationInfo(currencyCode)
  }

  onBack = () => {
    Actions.pop()
  }

  onPressSelect = () => {
    this.setState({
      isModalVisible: true
    })
  }

  onPressSubmit = async () => {
    const { createAccountTransaction, accountName } = this.props
    const { walletId } = this.state
    const createdWallet = await this.state.createdWallet
    const createdWalletId = createdWallet.id
    // will grab data from state in actions
    createAccountTransaction(createdWalletId, accountName, walletId)
  }

  onSelectWallet = async (walletId: string, paymentCurrencyCode: string): mixed => {
    const { wallets, accountName, fetchWalletAccountActivationPaymentInfo } = this.props
    const paymentWallet = wallets[walletId]
    const walletName = paymentWallet.name
    this.setState({
      isModalVisible: false,
      walletId,
      walletName,
      paymentCurrencyCode
    })
    const activatingWallet = await this.state.createdWallet
    const ownerPublicKey = activatingWallet.keys.ownerPublicKey
    const activePublicKey = activatingWallet.keys.publicKey
    const paymentInfo: AccountPaymentParams = {
      ownerPublicKey,
      activePublicKey,
      requestedAccountName: accountName,
      currencyCode: paymentCurrencyCode
    }

    fetchWalletAccountActivationPaymentInfo(paymentInfo)
  }

  renderSelectWallet = () => {
    const { activationCost, selectedWalletType } = this.props
    const roundedActivationCost = intl.formatNumber(decimalOrZero(truncateDecimals(activationCost, 6), 6))
    const currencyCode = selectedWalletType.currencyCode
    return (
      <View style={styles.selectPaymentLower}>
        <View style={styles.buttons}>
          <PrimaryButton style={[styles.next]} onPress={this.onPressSelect}>
            <PrimaryButton.Text>{s.strings.create_wallet_account_select_wallet}</PrimaryButton.Text>
          </PrimaryButton>
        </View>
        <View style={styles.paymentArea}>
          <Text style={styles.paymentLeft}>{s.strings.create_wallet_account_amount_due}</Text>
          <Text style={styles.paymentRight}>
            {roundedActivationCost} {currencyCode}
          </Text>
        </View>
      </View>
    )
  }

  renderPaymentReview = () => {
    const {
      wallets,
      accountName,
      isCreatingWallet,
      amount, // amount of payment type (non-EOS)
      paymentDenominationSymbol, // denomination symbol of payment type currency (non-EOS)
      selectedWalletType, // account-based currency wallet being created (EOS)
      selectedFiat,
      activationCost // amount of account-based currency required to activate
    } = this.props
    const { walletId, paymentCurrencyCode } = this.state
    const wallet = wallets[walletId] // wallet to pay with (non-EOS)
    const { name, symbolImageDarkMono } = wallet // name and logo of said wallet
    const roundedActivationCost = intl.formatNumber(decimalOrZero(truncateDecimals(activationCost, 6), 6))
    const roundedAmount = intl.formatNumber(decimalOrZero(truncateDecimals(amount, 6), 6))
    const walletTypeToCreate = selectedWalletType.currencyCode // (EOS)
    return (
      <View>
        <View style={styles.selectPaymentLower}>
          <View style={styles.accountReviewWalletNameArea}>
            <Text style={styles.accountReviewWalletNameText}>
              {name}:{paymentCurrencyCode}
            </Text>
          </View>
          <View style={styles.paymentAndIconArea}>
            <View style={styles.paymentLeftIconWrap}>
              {symbolImageDarkMono && <Image style={styles.paymentLeftIcon} source={{ uri: symbolImageDarkMono }} resizeMode="cover" />}
            </View>
            <View style={styles.paymentArea}>
              <Text style={styles.paymentLeft}>
                {paymentDenominationSymbol} {roundedAmount === '0' ? <ActivityIndicator /> : `${roundedAmount} ${paymentCurrencyCode}`}
              </Text>
              <Text style={styles.paymentRight}>
                {roundedActivationCost} {walletTypeToCreate}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.accountReviewInfoArea}>
          <Text style={styles.accountReviewInfoText}>
            {s.strings.create_wallet_account_payment_source} {name}
          </Text>
          <Text style={styles.accountReviewInfoText}>
            {s.strings.create_wallet_crypto_type_label} {paymentCurrencyCode}
          </Text>
          <Text style={styles.accountReviewInfoText}>
            {s.strings.create_wallet_fiat_type_label} {selectedFiat.label}
          </Text>
          <Text style={styles.accountReviewInfoText}>
            {s.strings.create_wallet_name_label} {accountName}
          </Text>
        </View>
        <View style={styles.accountReviewConfirmArea}>
          <Text style={styles.accountReviewConfirmText}>{s.strings.create_wallet_account_confirm}</Text>
        </View>
        <View style={styles.confirmButtonArea}>
          <PrimaryButton disabled={isCreatingWallet} style={[styles.confirmButton]} onPress={this.onPressSubmit}>
            <PrimaryButton.Text>{isCreatingWallet ? <ActivityIndicator /> : s.strings.submit}</PrimaryButton.Text>
          </PrimaryButton>
        </View>
      </View>
    )
  }

  render () {
    const { supportedCurrencies, selectedWalletType, activationCost } = this.props
    const roundedActivationCost = intl.formatNumber(decimalOrZero(truncateDecimals(activationCost, 6), 6))

    const instructionSyntax = sprintf(s.strings.create_wallet_account_select_instructions, `${roundedActivationCost} ${selectedWalletType.currencyCode}`)
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
