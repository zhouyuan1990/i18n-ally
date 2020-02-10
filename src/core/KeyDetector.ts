import { TextDocument, Position, Range } from 'vscode'
import { KeyInDocument } from '../core'
import { regexFindKeys } from '../utils'
import { Global } from './Global'
import { RewriteKeyContext } from './types'

export class KeyDetector {
  static getKeyByContent (text: string) {
    const keys = new Set<string>()
    const regs = Global.getKeyMatchReg()

    for (const reg of regs) {
      (text.match(reg) || [])
        .forEach(key =>
          keys.add(key.replace(reg, '$1')),
        )
    }

    return Array.from(keys)
  }

  static getKeyRange (document: TextDocument, position: Position, dotEnding?: boolean) {
    const regs = Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
    for (const regex of regs) {
      const range = document.getWordRangeAtPosition(position, regex)
      if (range) {
        const key = document.getText(range).replace(regex, '$1')

        if (key && (dotEnding || !key.endsWith('.')))
          return { range, key }
      }
    }
  }

  static getKey (document: TextDocument, position: Position, dotEnding?: boolean) {
    const keyRange = KeyDetector.getKeyRange(document, position, dotEnding)
    if (!keyRange)
      return
    return keyRange.key
  }

  static getKeyAndRange (document: TextDocument, position: Position, dotEnding?: boolean) {
    const { range, key } = KeyDetector.getKeyRange(document, position, dotEnding) || {}
    if (!range || !key)
      return
    const end = range.end.character - 1
    const start = end - key.length
    const keyRange = new Range(
      new Position(range.end.line, start),
      new Position(range.end.line, end),
    )
    return {
      range: keyRange,
      key,
    }
  }

  static getKeys (document: TextDocument | string, regs?: RegExp[], dotEnding?: boolean): KeyInDocument[] {
    let text = ''
    let rewriteContext: RewriteKeyContext| undefined
    if (typeof document !== 'string') {
      regs = regs ?? Global.getKeyMatchReg(document.languageId, document.uri.fsPath)
      text = document.getText()
      rewriteContext = {
        targetFile: document.uri.fsPath,
      }
    }
    else {
      regs = Global.getKeyMatchReg()
      text = document
    }

    return regexFindKeys(text, regs, dotEnding, rewriteContext)
  }

  static getKeysWithPrefix (document: TextDocument | string, regs?: RegExp[], dotEnding?: boolean): KeyInDocument[] {
    const prefix = KeyDetector.getKeyPrefix(document)
    const list = KeyDetector.getKeys(document, regs, dotEnding)
    if (prefix) {
      return list.map((item) => {
        return {
          ...item,
          key: `${prefix}.${item.key}`,
        }
      })
    }
    else {
      return list
    }
  }

  static getKeyPrefix (document: TextDocument | string) {
    const text = typeof document !== 'string' ? document.getText() : document
    const reg = /i18n-ally-prefix ([\w\d.-]*)/gm
    const result = reg.exec(text)
    return result ? result[1] : ''
  }
}
