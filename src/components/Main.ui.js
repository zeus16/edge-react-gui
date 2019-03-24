// @flow

import { type DiskletFolder, makeReactNativeFolder } from 'disklet'
import type { EdgeContext } from 'edge-core-js'
import React, { Component } from 'react'
import { Alert, Image, Keyboard, Linking, StatusBar, TouchableWithoutFeedback, View, YellowBox, Text } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Locale from 'react-native-locale'
import { MenuProvider } from 'react-native-popup-menu'
import { Actions, Drawer, Modal, Overlay, Router, Scene, Stack, Tabs } from 'react-native-router-flux'
import slowlog from 'react-native-slowlog'
import SplashScreen from 'react-native-smart-splash-screen'
// $FlowFixMe
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator'
import { connect } from 'react-redux'
import * as URI from 'uri-js'

import ENV from '../../env.json'
import MenuIcon from '../assets/images/MenuButton/menu.png'
import exchangeIconSelected from '../assets/images/tabbar/exchange_selected.png'
import exchangeIcon from '../assets/images/tabbar/exchange.png'
import receiveIconSelected from '../assets/images/tabbar/receive_selected.png'
import receiveIcon from '../assets/images/tabbar/receive.png'
import scanIconSelected from '../assets/images/tabbar/scan_selected.png'
import scanIcon from '../assets/images/tabbar/scan.png'
import walletIconSelected from '../assets/images/tabbar/wallets_selected.png'
import walletIcon from '../assets/images/tabbar/wallets.png'
import ExchangeDropMenu from '../connectors/components/HeaderMenuExchangeConnector'
import RequestDropMenu from '../connectors/components/HeaderMenuRequestConnector'
import CurrencySettingsTitleConnector from '../connectors/CurrencySettingsTitleConnector.js'
import LoginConnector from '../connectors/scenes/LoginConnector'
import TransactionDetails from '../connectors/scenes/TransactionDetailsConnector.js'
import SendConfirmationOptions from '../connectors/SendConfirmationOptionsConnector.js'
import SpendingLimitsConnector from '../connectors/SpendingLimitsConnector.js'
import * as Constants from '../constants/indexConstants'
import { scale } from '../lib/scaling.js'
import { setIntlLocale } from '../locales/intl'
import s, { selectLocale } from '../locales/strings.js'
import * as CONTEXT_API from '../modules/Core/Context/api'
import T from '../modules/UI/components/FormattedText/index'
import BackButton from '../modules/UI/components/Header/Component/BackButton.ui'
import HelpButton from '../modules/UI/components/Header/Component/HelpButtonConnector'
import Header from '../modules/UI/components/Header/Header.ui'
import WalletName from '../modules/UI/components/Header/WalletName/WalletNameConnector.js'
import { LoadingScene } from '../modules/UI/components/Loading/LoadingScene.ui.js'
import { ifLoggedIn } from '../modules/UI/components/LoginStatus/LoginStatus.js'
import { HwBackButtonHandler } from '../modules/UI/scenes/WalletList/components/HwBackButtonHandler/index'
import { styles } from '../styles/MainStyle.js'
import { OnBoardingComponent } from './scenes/OnBoardingScene.js'

const localeInfo = Locale.constants() // should likely be moved to login system and inserted into Redux

const UTILITY_SERVER_FILE = 'utilityServer.json'

const RouterWithRedux = connect()(Router)

StatusBar.setBarStyle('light-content', true)

const tabBarIconFiles: { [tabName: string]: string } = {}
tabBarIconFiles[Constants.WALLET_LIST] = walletIcon
tabBarIconFiles[Constants.REQUEST] = receiveIcon
tabBarIconFiles[Constants.SCAN] = scanIcon
tabBarIconFiles[Constants.TRANSACTION_LIST] = exchangeIcon
tabBarIconFiles[Constants.EXCHANGE] = exchangeIcon

const tabBarIconFilesSelected: { [tabName: string]: string } = {}
tabBarIconFilesSelected[Constants.WALLET_LIST] = walletIconSelected
tabBarIconFilesSelected[Constants.REQUEST] = receiveIconSelected
tabBarIconFilesSelected[Constants.SCAN] = scanIconSelected
tabBarIconFilesSelected[Constants.TRANSACTION_LIST] = exchangeIconSelected
tabBarIconFilesSelected[Constants.EXCHANGE] = exchangeIconSelected

const TRANSACTION_DETAILS = s.strings.title_transaction_details
const WALLETS = s.strings.title_wallets
const CREATE_WALLET_IMPORT = s.strings.create_wallet_import_title
const CREATE_WALLET_SELECT_CRYPTO = s.strings.title_create_wallet_select_crypto
const CREATE_WALLET_SELECT_FIAT = s.strings.title_create_wallet_select_fiat
const CREATE_WALLET = s.strings.title_create_wallet
const CREATE_WALLET_ACCOUNT_SETUP = s.strings.create_wallet_create_account
const CREATE_WALLET_ACCOUNT_ACTIVATE = s.strings.create_wallet_account_activate
const TRANSACTIONS_EXPORT = s.strings.title_export_transactions
const REQUEST = s.strings.title_request
const SCAN = s.strings.title_scan
const EDGE_LOGIN = s.strings.title_edge_login
const EXCHANGE = s.strings.title_exchange
const CHANGE_MINING_FEE = s.strings.title_change_mining_fee
const BACK = s.strings.title_back
const MANAGE_TOKENS = s.strings.title_manage_tokens
const ADD_TOKEN = s.strings.title_add_token
const EDIT_TOKEN = s.strings.title_edit_token
const SETTINGS = s.strings.title_settings
const EXCHANGE_SETTINGS = s.strings.settings_exchange_settings
const CHANGE_PASSWORD = s.strings.title_change_password
const CHANGE_PIN = s.strings.title_change_pin
const SPENDING_LIMITS = s.strings.spending_limits
const PASSWORD_RECOVERY = s.strings.title_password_recovery
const OTP = s.strings.title_otp
const DEFAULT_FIAT = s.strings.title_default_fiat
const PLUGIN_BUYSELL = s.strings.title_plugin_buysell
const PLUGIN_SPEND = s.strings.title_plugin_spend_cryptocurrency
const TERMS_OF_SERVICE = s.strings.title_terms_of_service

type Props = {
  requestPermission: (permission: Permission) => void,
  username?: string,
  setKeyboardHeight: number => void,
  addContext: (EdgeContext, DiskletFolder) => void,
  addUsernames: (Array<string>) => void,
  setDeviceDimensions: any => void,
  dispatchEnableScan: () => void,
  dispatchDisableScan: () => void,
  urlReceived: string => void,
  updateCurrentSceneKey: string => void,
  showReEnableOtpModal: () => void,
  checkEnabledExchanges: () => void,
  openDrawer: () => void,
  dispatchAddressDeepLinkReceived: (addressDeepLinkData: Object) => any,
  deepLinkPending: boolean,
  checkAndShowGetCryptoModal: () => void
}

async function queryUtilServer (context: EdgeContext, folder: DiskletFolder, usernames: Array<string>) {
  let jsonObj: null | Object = null
  try {
    const json = await folder.file(UTILITY_SERVER_FILE).getText()
    jsonObj = JSON.parse(json)
  } catch (err) {
    console.log(err)
  }

  if (jsonObj) {
    if (jsonObj.currencyCode) {
      global.currencyCode = jsonObj.currencyCode
    }
    return
  }
  if (usernames.length === 0 && !jsonObj) {
    // New app launch. Query the utility server for referral information
    try {
      const response = await fetch('https://util1.edge.app/ref')
      if (response) {
        const util = await response.json()
        if (util.currencyCode) {
          global.currencyCode = util.currencyCode
        }
        // Save util data
        folder.file(UTILITY_SERVER_FILE).setText(JSON.stringify(util))
      }
    } catch (e) {
      console.log(e)
    }
  }
}

let Scan = null
let SendConfirmation = null
let CreateWalletAccountSelectConnector = null
let CreateWalletAccountSetupConnector = null
let CreateWalletImportConnector = null
let CreateWalletReview = null
let CreateWalletSelectCrypto = null
let CreateWalletSelectFiat = null
let CryptoExchangeQuoteConnector = null
let CryptoExchangeSceneConnector = null
let AddToken = null
let ChangeMiningFeeSendConfirmation = null
let ChangePasswordConnector = null
let ChangePinConnector = null
let CurrencySettings = null
let DefaultFiatSettingConnector = null
let EdgeLoginSceneConnector = null
let EditToken = null
let ManageTokens = null
let OtpSettingsSceneConnector = null
let PasswordRecoveryConnector = null
let Request = null
let SettingsOverview = null
let TransactionListConnector = null
let TransactionsExportSceneConnector = null
let WalletList = null

let ControlPanel = null
let PluginBuySell = null
let PluginSpend = null
let PluginView = null
let renderPluginBackButton = null

let CreateWalletName = null
let CryptoExchangeQuoteProcessingScreenComponent = null
let TermsOfServiceComponent = null
let ExchangeSettingsConnector = null
let CreateWalletChoiceComponent = null
let HelpModal = null
let ErrorAlert = null
let TransactionAlert = null
let AutoLogout = null
let ContactsLoader = null
let PasswordRecoveryReminderModalConnector = null
let PasswordReminderModal = null
let ModalManager = null
let PermissionsManager = null
let PermissionStrings = null

let EdgeCoreManager = null
let DeepLinkingManager = null

export default class Main extends Component<Props> {
  keyboardDidShowListener: any
  keyboardDidHideListener: any

  constructor (props: Props) {
    super(props)
    slowlog(this, /.*/, global.slowlogOptions)
    this.state = {
      isLoaded: true
    }
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  componentDidMount () {
    const id = DeviceInfo.getUniqueID()
    global.firebase && global.firebase.analytics().setUserId(id)
    global.firebase && global.firebase.analytics().logEvent(`Start_App`)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.doDeepLink(url)
        }
        // this.navigate(url);
      })
      .catch(e => console.log(e))
    Linking.addEventListener('url', this.handleOpenURL)
    if (ENV.HIDE_IS_MOUNTED) {
      YellowBox.ignoreWarnings([
        'Warning: isMounted(...) is deprecated',
        'Module RCTImageLoader',
        'The scalesPageToFit property is not supported when useWebKit = true'
      ])
    }
    this.setState({
      isLoaded: true
    })
  }

  onCoreLoad = (context: EdgeContext) => {
    const folder = makeReactNativeFolder()

    // Put the context into Redux:
    this.props.addContext(context, folder)

    CONTEXT_API.listUsernames(context).then(usernames => {
      this.props.addUsernames(usernames)
      queryUtilServer(context, folder, usernames)
    })
    setIntlLocale(localeInfo)
    selectLocale(DeviceInfo.getDeviceLocale())
    SplashScreen.close({
      animationType: SplashScreen.animationType.fade,
      duration: 850,
      delay: 500
    })
  }

  onCoreError = (error: any) => {
    SplashScreen.close({
      animationType: SplashScreen.animationType.fade,
      duration: 850,
      delay: 500
    })
    Alert.alert('Edge core failed to load', String(error))
  }

  handleOpenURL = (event: Object) => {
    this.doDeepLink(event.url)
  }

  doDeepLink (url: string) {
    const parsedUri = URI.parse(url)

    switch (parsedUri.scheme) {
      case 'edge':
      case 'airbitz':
      case 'edge-ret':
      case 'airbitz-ret':
      case 'https':
        if (parsedUri.host === 'recovery' || parsedUri.host === 'recovery.edgesecure.co') {
          this.handleRecoveryToken(parsedUri)
        } else {
          this.handleAddress(parsedUri, url)
        }
        break
      case 'bitcoin':
      case 'bitcoincash':
      case 'ethereum':
      case 'dash':
      case 'litecoin':
        this.handleAddress(parsedUri, url)
        break
    }
  }

  handleRecoveryToken (parsedUri: URI) {
    const query = parsedUri.query
    if (!query || !query.includes('token=')) {
      return
    }
    const splitArray = query.split('token=')
    const nextString = splitArray[1]
    const finalArray = nextString.split('&')
    const token = finalArray[0]
    this.props.urlReceived(token)
  }

  handleAddress (parsedUri: URI, url: string) {
    const addressDeepLinkData = {}

    const currencyCode = this.convertCurrencyCodeFromScheme(parsedUri.scheme)

    addressDeepLinkData.currencyCode = currencyCode
    addressDeepLinkData.uri = url

    this.props.dispatchAddressDeepLinkReceived(addressDeepLinkData)
  }

  convertCurrencyCodeFromScheme (scheme: string) {
    switch (scheme) {
      case 'bitcoin':
        return 'BTC'
      case 'bitcoincash':
        return 'BCH'
      case 'ethereum':
        return 'ETH'
      case 'litecoin':
        return 'LTC'
      case 'dash':
        return 'DASH'
      default:
        console.log('Unrecognized currency URI scheme')
        return null
    }
  }

  updateSceneKeyRequest = () => {
    this.props.updateCurrentSceneKey(Constants.REQUEST)
  }

  renderCoreManager = () => {
    const { isLoaded } = this.state
    if (isLoaded) {
      EdgeCoreManager = require('./core/EdgeCoreManager.js').EdgeCoreManager
      return <EdgeCoreManager onLoad={this.onCoreLoad} onError={this.onCoreError} />
    } else {
      return null
    }
  }

  renderDeepLinkingManager = () => {
    const { isLoaded } = this.state
    if (isLoaded) {
      DeepLinkingManager = require('../modules/DeepLinkingManager.js').default
      return <DeepLinkingManager />
    } else {
      return null
    }
  }

  render () {
    return (
      <MenuProvider style={styles.mainMenuContext}>
        <RouterWithRedux backAndroidHandler={this.handleBack}>
          <Overlay>
            <Modal hideNavBar transitionConfig={() => ({ screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid })}>
              {/* <Lightbox> */}
              <Stack key={Constants.ROOT} hideNavBar panHandlers={null}>
                <Scene key={Constants.LOGIN} initial component={LoginConnector} username={this.props.username} />

                <Scene key={Constants.ONBOARDING} navTransparent={true} component={OnBoardingComponent} />

                {this.state.isLoaded && <GuiScenes isLoaded />}
              </Stack>
            </Modal>
          </Overlay>
        </RouterWithRedux>
        {this.state.isLoaded && <RouterUtils isLoaded />}
        {this.renderCoreManager()}
        {this.renderDeepLinkingManager()}

      </MenuProvider>
    )
  }

  renderCurrencySettings = () => {
    const settings = []
    for (const key in Constants.CURRENCY_SETTINGS) {
      const { pluginName, currencyCode } = Constants.CURRENCY_SETTINGS[key]
      settings.push(
        <Scene
          key={key}
          pluginName={pluginName}
          currencyCode={currencyCode}
          navTransparent={true}
          component={CurrencySettings}
          renderTitle={
            <View style={styles.titleWrapper}>
              <CurrencySettingsTitleConnector key={key} cryptoKey={key} pluginName={pluginName} currencyCode={currencyCode} />
            </View>
          }
          renderLeftButton={this.renderBackButton()}
          renderRightButton={this.renderEmptyButton()}
        />
      )
    }
    return settings
  }

  renderWalletListNavBar = () => {
    return <Header />
  }

  renderWalletName = () => {
    return (
      <View style={styles.titleWrapper}>
        <WalletName />
      </View>
    )
  }

  renderEmptyButton = () => {
    return <BackButton />
  }

  renderHelpButton = () => {
    return <HelpButton />
  }

  renderBackButton = (label: string = BACK) => {
    return <BackButton withArrow onPress={this.handleBack} label={label} />
  }

  renderTitle = (title: string) => {
    return (
      <View style={styles.titleWrapper}>
        <T style={styles.titleStyle}>{title}</T>
      </View>
    )
  }
  renderSpendTitle = (title: string) => {
    return (
      <View style={styles.titleWrapper}>
        <T style={styles.titleStyle}>{'title'}</T>
      </View>
    )
  }

  renderMenuButton = () => {
    return (
      <TouchableWithoutFeedback onPress={this.props.openDrawer}>
        <Image source={MenuIcon} />
      </TouchableWithoutFeedback>
    )
  }

  renderExchangeButton = () => {
    return <ExchangeDropMenu />
  }

  renderRequestMenuButton = () => {
    return <RequestDropMenu />
  }

  renderSendConfirmationButton = () => {
    return <SendConfirmationOptions />
  }

  icon = (tabName: string) => (props: { focused: boolean }) => {
    if (typeof tabBarIconFiles[tabName] === 'undefined' || typeof tabBarIconFilesSelected[tabName] === 'undefined') {
      throw new Error('Invalid tabbar name')
    }
    let imageFile
    if (props.focused) {
      imageFile = tabBarIconFilesSelected[tabName]
    } else {
      imageFile = tabBarIconFiles[tabName]
    }
    return <Image source={imageFile} />
  }

  keyboardDidShow = (event: any) => {
    const keyboardHeight = event.endCoordinates.height
    this.props.setKeyboardHeight(keyboardHeight)
  }

  keyboardDidHide = () => {
    this.props.setKeyboardHeight(0)
  }

  isCurrentScene = (sceneKey: string) => {
    return Actions.currentScene === sceneKey
  }

  handleBack = () => {
    if (this.isCurrentScene(Constants.LOGIN)) {
      return false
    }
    if (this.isCurrentScene(Constants.WALLET_LIST_SCENE)) {
      return HwBackButtonHandler()
    }
    if (this.isCurrentScene(Constants.EXCHANGE_QUOTE_SCENE)) {
      Actions.popTo(Constants.EXCHANGE_SCENE)
      return true
    }
    Actions.pop()
    return true
  }
}

class Kylan extends Component<{}> {
  componentDidMount = () => {
    SplashScreen.close({
      animationType: SplashScreen.animationType.fade,
      duration: 850,
      delay: 500
    })
  }
  render () {
    return (
      <View><Text>Kylan</Text></View>
    )
  }
}

class RouterUtils extends Component <{}> {
  render () {
    const { isLoaded } = this.props
    if (isLoaded) {
      HelpModal = require('../modules/UI/components/HelpModal/index').default
      ErrorAlert = require('../modules/UI/components/ErrorAlert/ErrorAlertConnector').default
      TransactionAlert = require('../modules/UI/components/TransactionAlert/TransactionAlertConnector').default
      AutoLogout = require('../modules/UI/components/AutoLogout/AutoLogoutConnector').default
      ContactsLoader = require('../modules/UI/components/ContactsLoader/indexContactsLoader.js').ContactsLoaderConnecter
      PasswordRecoveryReminderModalConnector = require('../modules/UI/components/PasswordRecoveryReminderModal/PasswordRecoveryReminderModalConnector.js').PasswordRecoveryReminderModalConnector
      PasswordReminderModal = require('../modules/UI/components/PasswordReminderModal/indexPasswordReminderModal.js').passwordReminderModalConnector
      ModalManager = require('edge-components').ModalManager
      PermissionsManager = require('../modules/PermissionsManager.js').default
      PermissionStrings = require('../modules/PermissionsManager.js').PermissionStrings
      return (
        <View>
          <HelpModal style={{ flex: 1 }} />
          <ErrorAlert />
          <TransactionAlert />
          <AutoLogout />
          <ContactsLoader />
          <PasswordReminderModal />
          <PasswordRecoveryReminderModalConnector />
          <ModalManager />
          <PermissionsManager />
        </View>
      )
    } else {
      return null
    }
  }
}

class GuiScenes extends Component <{}> {
  render = () => {
    const { isLoaded } = this.props
    if (isLoaded) {
      Scan = require('../connectors/scenes/ScanConnector').default
      SendConfirmation = require('../connectors/scenes/SendConfirmationConnector.js').default
      CreateWalletAccountSelectConnector = require('../connectors/scenes/CreateWalletAccountSelectConnector.js').CreateWalletAccountSelectConnector
      CreateWalletAccountSetupConnector = require('../connectors/scenes/CreateWalletAccountSetupConnector.js').CreateWalletAccountSetupConnector
      CreateWalletImportConnector = require('../connectors/scenes/CreateWalletImportConnector.js').CreateWalletImportConnector
      CreateWalletReview = require('../connectors/scenes/CreateWalletReviewConnector').CreateWalletReview
      CreateWalletSelectCrypto = require('../connectors/scenes/CreateWalletSelectCryptoConnector').CreateWalletSelectCrypto
      CreateWalletSelectFiat = require('../connectors/scenes/CreateWalletSelectFiatConnector').CreateWalletSelectFiat
      CryptoExchangeQuoteConnector = require('../connectors/scenes/CryptoExchangeQuoteConnector.js').CryptoExchangeQuoteConnector
      CryptoExchangeSceneConnector = require('../connectors/scenes/CryptoExchangeSceneConnector').CryptoExchangeSceneConnector
      AddToken = require('../connectors/scenes/AddTokenConnector.js').default
      ChangeMiningFeeSendConfirmation = require('../connectors/scenes/ChangeMiningFeeSendConfirmationConnector.ui').default
      ChangePasswordConnector = require('../connectors/scenes/ChangePasswordConnector.ui').default
      ChangePinConnector = require('../connectors/scenes/ChangePinConnector.ui').default

      CurrencySettings = require('../connectors/scenes/CurrencySettingsConnector').default
      DefaultFiatSettingConnector = require('../connectors/scenes/DefaultFiatSettingConnector').default
      EdgeLoginSceneConnector = require('../connectors/scenes/EdgeLoginSceneConnector').default
      EditToken = require('../connectors/scenes/EditTokenConnector.js').default
      ManageTokens = require('../connectors/scenes/ManageTokensConnector.js').default
      OtpSettingsSceneConnector = require('../connectors/scenes/OtpSettingsSceneConnector.js').default
      PasswordRecoveryConnector = require('../connectors/scenes/PasswordRecoveryConnector.js').default
      Request = require('../connectors/scenes/RequestConnector.js').default
      SettingsOverview = require('../connectors/scenes/SettingsOverviewConnector').default
      TransactionListConnector = require('../connectors/scenes/TransactionListConnector').default
      TransactionsExportSceneConnector = require('../connectors/scenes/TransactionsExportSceneConnector').default
      WalletList = require('../connectors/scenes/WalletListConnector').default

      ControlPanel = require('../modules/UI/components/ControlPanel/ControlPanelConnector').ControlPanel
      PluginBuySell = require('../modules/UI/scenes/Plugins/index').PluginBuySell
      PluginSpend = require('../modules/UI/scenes/Plugins/index').PluginSpend
      PluginView = require('../modules/UI/scenes/Plugins/index').PluginView
      renderPluginBackButton = require('../modules/UI/scenes/Plugins/index').renderPluginBackButton
      CreateWalletName = require('./scenes/CreateWalletNameScene.js').CreateWalletName
      CryptoExchangeQuoteProcessingScreenComponent = require('./scenes/CryptoExchangeQuoteProcessingScene.js').CryptoExchangeQuoteProcessingScreenComponent
      TermsOfServiceComponent = require('./scenes/TermsOfServiceScene.js').TermsOfServiceComponent
      ExchangeSettingsConnector = require('../connectors/ExchangeSettingsConnector.js').ExchangeSettingsConnector
      CreateWalletChoiceComponent = require('../components/scenes/CreateWalletChoiceScene.js').CreateWalletChoiceComponent
      const ExchangeConnector = CryptoExchangeSceneConnector
      return (
        <Drawer key={Constants.EDGE} hideNavBar contentComponent={ControlPanel} hideDrawerButton={true} drawerPosition="right" drawerWidth={scale(280)}>
          {/* Wrapper Scene needed to fix a bug where the tabs would reload as a modal ontop of itself */}
          <Scene key={'AllMyTabs'} hideNavBar>
            <Tabs
              key={Constants.EDGE}
              swipeEnabled={false}
              navTransparent={true}
              tabBarPosition={'bottom'}
              showLabel={true}
              tabBarStyle={styles.footerTabStyles}
            >
              <Stack key={Constants.WALLET_LIST} icon={this.icon(Constants.WALLET_LIST)} tabBarLabel={WALLETS}>
                <Scene
                  key={Constants.WALLET_LIST_SCENE}
                  navTransparent={true}
                  component={WalletList}
                  renderTitle={this.renderTitle(WALLETS)}
                  renderLeftButton={this.renderHelpButton()}
                  renderRightButton={this.renderMenuButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_CHOICE}
                  navTransparent={true}
                  component={CreateWalletChoiceComponent}
                  renderTitle={this.renderTitle(CREATE_WALLET)}
                  renderLeftButton={this.renderBackButton(WALLETS)}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_IMPORT}
                  navTransparent={true}
                  component={CreateWalletImportConnector}
                  renderTitle={this.renderTitle(CREATE_WALLET_IMPORT)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_SELECT_CRYPTO}
                  navTransparent={true}
                  component={CreateWalletSelectCrypto}
                  renderTitle={this.renderTitle(CREATE_WALLET_SELECT_CRYPTO)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_NAME}
                  navTransparent={true}
                  component={CreateWalletName}
                  renderTitle={this.renderTitle(CREATE_WALLET)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_SELECT_FIAT}
                  navTransparent={true}
                  component={CreateWalletSelectFiat}
                  renderTitle={this.renderTitle(CREATE_WALLET_SELECT_FIAT)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_REVIEW}
                  navTransparent={true}
                  component={CreateWalletReview}
                  renderTitle={this.renderTitle(CREATE_WALLET)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_ACCOUNT_SETUP}
                  navTransparent={true}
                  component={CreateWalletAccountSetupConnector}
                  renderTitle={this.renderTitle(CREATE_WALLET_ACCOUNT_SETUP)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderHelpButton()}
                />

                <Scene
                  key={Constants.CREATE_WALLET_ACCOUNT_SELECT}
                  navTransparent={true}
                  component={CreateWalletAccountSelectConnector}
                  renderTitle={this.renderTitle(CREATE_WALLET_ACCOUNT_ACTIVATE)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderHelpButton()}
                />

                <Scene
                  key={Constants.TRANSACTION_LIST}
                  onEnter={() => {
                    this.props.requestPermission(PermissionStrings.CONTACTS)
                    this.props.updateCurrentSceneKey(Constants.TRANSACTION_LIST)
                  }}
                  navTransparent={true}
                  component={TransactionListConnector}
                  renderTitle={this.renderWalletListNavBar()}
                  renderLeftButton={this.renderBackButton(WALLETS)}
                  renderRightButton={this.renderMenuButton()}
                />

                <Scene
                  key={Constants.MANAGE_TOKENS}
                  renderLeftButton={this.renderBackButton()}
                  navTransparent={true}
                  component={ManageTokens}
                  renderTitle={this.renderTitle(MANAGE_TOKENS)}
                  renderRightButton={this.renderEmptyButton()}
                  animation={'fade'}
                  duration={600}
                />
                <Scene
                  key={Constants.ADD_TOKEN}
                  component={AddToken}
                  navTransparent={true}
                  onLeft={Actions.pop}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                  renderTitle={this.renderTitle(ADD_TOKEN)}
                />
                <Scene
                  key={Constants.EDIT_TOKEN}
                  component={EditToken}
                  navTransparent={true}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderEmptyButton()}
                  renderTitle={this.renderTitle(EDIT_TOKEN)}
                />
                <Scene
                  key={Constants.TRANSACTIONS_EXPORT}
                  navTransparent={true}
                  component={ifLoggedIn(TransactionsExportSceneConnector, LoadingScene)}
                  renderTitle={this.renderTitle(TRANSACTIONS_EXPORT)}
                  renderLeftButton={this.renderBackButton(WALLETS)}
                  renderRightButton={this.renderEmptyButton()}
                />
              </Stack>

              <Scene
                key={Constants.REQUEST}
                navTransparent={true}
                onEnter={this.updateSceneKeyRequest}
                icon={this.icon(Constants.REQUEST)}
                tabBarLabel={REQUEST}
                component={Request}
                renderTitle={this.renderWalletListNavBar()}
                renderLeftButton={this.renderRequestMenuButton()}
                renderRightButton={this.renderMenuButton()}
              />

              <Stack key={Constants.SCAN} icon={this.icon(Constants.SCAN)} tabBarLabel={SCAN}>
                <Scene
                  key={Constants.SCAN_NOT_USED}
                  navTransparent={true}
                  onEnter={() => {
                    this.props.requestPermission(PermissionStrings.CAMERA)
                    this.props.dispatchEnableScan()
                    this.props.checkAndShowGetCryptoModal()
                  }}
                  onExit={this.props.dispatchDisableScan}
                  component={Scan}
                  renderTitle={this.renderWalletListNavBar()}
                  renderLeftButton={this.renderHelpButton()}
                  renderRightButton={this.renderMenuButton()}
                />
                <Scene
                  key={Constants.EDGE_LOGIN}
                  navTransparent={true}
                  component={EdgeLoginSceneConnector}
                  renderTitle={this.renderTitle(EDGE_LOGIN)}
                  renderLeftButton={this.renderHelpButton()}
                  renderRightButton={this.renderEmptyButton()}
                />
              </Stack>

              <Stack key={Constants.EXCHANGE} icon={this.icon(Constants.EXCHANGE)} tabBarLabel={EXCHANGE}>
                <Scene
                  key={Constants.EXCHANGE_SCENE}
                  navTransparent={true}
                  component={ExchangeConnector}
                  renderTitle={this.renderTitle(EXCHANGE)}
                  renderLeftButton={this.renderExchangeButton()}
                  renderRightButton={this.renderMenuButton()}
                  onEnter={() => this.props.checkEnabledExchanges()}
                />
                <Scene
                  key={Constants.EXCHANGE_QUOTE_PROCESSING_SCENE}
                  navTransparent={true}
                  hideTabBar
                  component={CryptoExchangeQuoteProcessingScreenComponent}
                  renderTitle={this.renderTitle(EXCHANGE)}
                  renderLeftButton={this.renderEmptyButton()}
                  renderRightButton={this.renderEmptyButton()}
                />
                <Scene
                  key={Constants.EXCHANGE_QUOTE_SCENE}
                  navTransparent={true}
                  component={CryptoExchangeQuoteConnector}
                  renderTitle={this.renderTitle(EXCHANGE)}
                  renderLeftButton={this.renderBackButton()}
                  renderRightButton={this.renderMenuButton()}
                />
              </Stack>
            </Tabs>

            <Stack key={Constants.SEND_CONFIRMATION} hideTabBar>
              <Scene
                key={Constants.SEND_CONFIRMATION_NOT_USED}
                navTransparent={true}
                hideTabBar
                panHandlers={null}
                component={SendConfirmation}
                renderTitle={this.renderWalletName()}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderSendConfirmationButton()}
              />
              <Scene
                key={Constants.CHANGE_MINING_FEE_SEND_CONFIRMATION}
                navTransparent={true}
                component={ChangeMiningFeeSendConfirmation}
                renderTitle={this.renderTitle(CHANGE_MINING_FEE)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderHelpButton()}
              />
            </Stack>

            <Stack key={Constants.MANAGE_TOKENS} hideTabBar>
              <Scene
                key={Constants.MANAGE_TOKENS_NOT_USED}
                navTransparent={true}
                component={ManageTokens}
                renderTitle={this.renderTitle(MANAGE_TOKENS)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />

              <Scene
                key={Constants.ADD_TOKEN}
                navTransparent={true}
                component={AddToken}
                renderTitle={this.renderTitle(ADD_TOKEN)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
            </Stack>

            <Stack key={Constants.SETTINGS_OVERVIEW_TAB} hideDrawerButton={true}>
              <Scene
                key={Constants.SETTINGS_OVERVIEW}
                navTransparent={true}
                onEnter={() => this.props.showReEnableOtpModal()}
                component={SettingsOverview}
                renderTitle={this.renderTitle(SETTINGS)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.CHANGE_PASSWORD}
                navTransparent={true}
                component={ChangePasswordConnector}
                renderTitle={this.renderTitle(CHANGE_PASSWORD)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.CHANGE_PIN}
                navTransparent={true}
                component={ChangePinConnector}
                renderTitle={this.renderTitle(CHANGE_PIN)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.OTP_SETUP}
                navTransparent={true}
                component={OtpSettingsSceneConnector}
                renderTitle={this.renderTitle(OTP)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.RECOVER_PASSWORD}
                navTransparent={true}
                component={PasswordRecoveryConnector}
                renderTitle={this.renderTitle(PASSWORD_RECOVERY)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.SPENDING_LIMITS}
                navTransparent={true}
                component={SpendingLimitsConnector}
                renderTitle={this.renderTitle(SPENDING_LIMITS)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              <Scene
                key={Constants.EXCHANGE_SETTINGS}
                navTransparent={true}
                component={ExchangeSettingsConnector}
                renderTitle={this.renderTitle(EXCHANGE_SETTINGS)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
              {this.renderCurrencySettings()}
              <Scene
                key={Constants.DEFAULT_FIAT_SETTING}
                navTransparent={true}
                component={DefaultFiatSettingConnector}
                renderTitle={this.renderTitle(DEFAULT_FIAT)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderEmptyButton()}
              />
            </Stack>

            <Stack key={Constants.BUY_SELL} hideDrawerButton={true}>
              <Scene
                key={Constants.BUY_SELL}
                navTransparent={true}
                component={PluginBuySell}
                renderTitle={this.renderTitle(PLUGIN_BUYSELL)}
                renderLeftButton={this.renderBackButton(BACK)}
                renderRightButton={this.renderEmptyButton()}
                onLeft={Actions.pop}
              />
              <Scene
                key={Constants.PLUGIN}
                navTransparent={true}
                component={ifLoggedIn(PluginView, LoadingScene)}
                renderTitle={this.renderTitle(PLUGIN_BUYSELL)}
                renderLeftButton={renderPluginBackButton(BACK)}
                renderRightButton={this.renderEmptyButton()}
              />
            </Stack>

            <Stack key={Constants.SPEND} hideDrawerButton={true}>
              <Scene
                key={Constants.SPEND}
                navTransparent={true}
                component={PluginSpend}
                renderTitle={this.renderTitle(PLUGIN_SPEND)}
                renderLeftButton={this.renderBackButton(BACK)}
                renderRightButton={this.renderEmptyButton()}
                onLeft={Actions.pop}
              />
              <Scene
                key={Constants.PLUGIN_SPEND}
                navTransparent={true}
                component={ifLoggedIn(PluginView, LoadingScene)}
                renderTitle={this.renderTitle(PLUGIN_SPEND)}
                renderLeftButton={this.renderBackButton(BACK)}
                renderRightButton={this.renderEmptyButton()}
              />
            </Stack>
            <Stack key={Constants.TERMS_OF_SERVICE}>
              <Scene
                key={Constants.TERMS_OF_SERVICE}
                navTransparent={true}
                component={TermsOfServiceComponent}
                renderTitle={this.renderTitle(TERMS_OF_SERVICE)}
                renderLeftButton={this.renderBackButton(BACK)}
                renderRightButton={this.renderEmptyButton()}
                onLeft={Actions.pop}
              />
            </Stack>
            <Stack key={Constants.TRANSACTION_DETAILS}>
              <Scene
                key={Constants.TRANSACTION_DETAILS}
                navTransparent={true}
                onEnter={() => this.props.requestPermission(PermissionStrings.CONTACTS)}
                clone
                component={TransactionDetails}
                renderTitle={this.renderTitle(TRANSACTION_DETAILS)}
                renderLeftButton={this.renderBackButton()}
                renderRightButton={this.renderMenuButton()}
              />
            </Stack>
          </Scene>
        </Drawer>
      )
    } else {
      return null
    }
  }
}