import { Framework } from '../base'
import { LanguageId } from '../../utils'

class LarkFramework extends Framework {
  id = 'lark'
  display = 'lark'

  detection = {
    packageJSON: [
      '@dcloudio/uni-h5',
    ],
  }

  languageIds: LanguageId[] = [
    'vue',
    'vue-html',
    'javascript',
    'typescript',
    'ejs',
    'xml',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    // eslint-disable-next-line no-useless-escape
    /[^\w\d](?:i18n|t)\.([[\w\d\.\-\[\]]*)/gm,
  ]

  refactorTemplates (keypath: string) {
    return [
      keypath,
    ]
  }
}

export default LarkFramework
