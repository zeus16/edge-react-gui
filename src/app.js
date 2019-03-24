// @flow

/* global __DEV__ */

import './util/polyfills'

import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Provider } from 'react-redux'
import SplashScreen from 'react-native-smart-splash-screen'
import configureStore from './lib/configureStore'

const store: {} = configureStore({})
class Kylan extends Component<{}> {
  componentDidMount = () => {
    SplashScreen.close({
      animationType: SplashScreen.animationType.fade,
      duration: 150,
      delay: 100
    })
  }
  render () {
    return (
      <View><Text>Kylan</Text></View>
    )
  }
}

export default class App extends Component<{}> {
  render () {
    return (
      <Provider store={store}>
        <Kylan />
      </Provider>
    )
  }
}
