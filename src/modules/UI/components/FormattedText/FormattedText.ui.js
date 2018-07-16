/* eslint-disable flowtype/require-valid-file-annotation */

import React, { Component } from 'react'
import { Text } from 'react-native'
import styles from './style'
import { getObjectDiff } from '../../../utils.js'
import { scaleFont } from '../../../../lib/scaleFont.js'

export default class FormattedText extends Component {
  shouldComponentUpdate (nextProps) {
    const diffElement = getObjectDiff(this.props, nextProps, {style: true, children: true})
    return !!diffElement
  }

  constructor (props) {
    super(props)
    this.style = this.props.isBold ? [styles.boldStyle] : [styles.defaultStyle]

    if (props.style) {
      if (Array.isArray(props.style)) {
        this.style = this.style.concat(props.style)
      } else {
        this.style.push(props.style)
      }
    }
  }

  setNativeProps (props) {
    this.refs['nativeForward'].setNativeProps(props)
  }

  // Need to pass a fontSize props for custom fontSize
  render () {
    getFontSize = () => {
      return this.props.fontSize ? { fontSize: scaleFont(this.props.fontSize) } : null
    }
    return (
      <Text {...this.props} style={[this.style, this.props.style, getFontSize() ]} ref={'nativeForward'} allowFontScaling={false}>
        {this.props.children}
      </Text>
    )
  }
}
