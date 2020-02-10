import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, ExtensionContext, languages, CompletionList } from 'vscode'
import { Global, KeyDetector, Loader, CurrentFile, LocaleTree, LocaleNode, Config } from '../core'
import { ExtensionModule } from '../modules'

class CompletionProvider implements CompletionItemProvider {
  public provideCompletionItems (
    document: TextDocument,
    position: Position,
  ) {
    if (!Global.enabled)
      return

    const loader: Loader = CurrentFile.loader

    const key = KeyDetector.getKey(document, position, true)

    if (key === undefined) {
      const list = loader.localeValueTree[Config.displayLanguage]
      const prefix = KeyDetector.getKeyPrefix(document)
      if (!prefix) {
        return new CompletionList(list)
      }
      else {
        const matchPrefixList = list
          .filter(item => item.detail?.indexOf(prefix) === 0)
          .map((item) => {
            return {
              ...item,
              insertText: item.insertText ? String(item.insertText).substring(prefix.length + 1) : '',
            }
          })
        return new CompletionList(matchPrefixList)
      }
    }

    let parent = ''

    const parts = key.split('.')

    if (parts.length > 1)
      parent = parts.slice(0, -1).join('.')

    let node: LocaleTree | LocaleNode | undefined

    if (!key)
      node = loader.root

    if (!node)
      node = loader.getTreeNodeByKey(key)

    if (!node && parent)
      node = loader.getTreeNodeByKey(parent)

    if (!node || node.type !== 'tree')
      return

    return Object.values(node.children).map((child) => {
      return new CompletionItem(
        child.keyname,
        child.type === 'tree'
          ? CompletionItemKind.Field
          : CompletionItemKind.Text,
      )
    })
  }
}

const m: ExtensionModule = (ctx: ExtensionContext) => {
  return languages.registerCompletionItemProvider(
    Global.getDocumentSelectors(),
    new CompletionProvider(),
    '.', '\'', '"', '`',
  )
}

export default m
