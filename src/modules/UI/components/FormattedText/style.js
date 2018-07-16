// @flow

import THEME from '../../../../theme/variables/airbitz'
import { scaleFont } from '../../../../lib/scaleFont.js'


export default {
  defaultStyle: {
    fontFamily: THEME.FONTS.DEFAULT,
    fontSize: scaleFont(14)
  },
  boldStyle: {
    fontFamily: THEME.FONTS.BOLD,
    fontSize: scaleFont(14)
  }
}
