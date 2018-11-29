// @flow

import React, { Component } from 'react'
import { Animated } from 'react-native'
import { AnimatableComponent } from 'react-native-animatable'

import { scale } from '../../lib/scaling.js'

type Props = {
  style?: any,
  children: string,
  fontSize?: number
}

type State = {
  color: AnimatableComponent
}
export class AnimatedText extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      color: new Animated.Value(0)
    }
  }

  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.children !== this.props.children) {
      this.state.color.setValue(0)
      Animated.timing(this.state.color, {
        toValue: 1,
        duration: 3000
      }).start()
    }
  }

  render () {
    const fontSize = this.props.fontSize ? scale(this.props.fontSize) : scale(14)
    const color = this.state.color.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 128, 0, 0.5)', 'rgba(13, 33, 69, 1)']
    })
    return (
      <Animated.Text {...this.props} style={{ color, ...this.props.style, fontSize }}>
        {this.props.children}
      </Animated.Text>
    )
  }
}
