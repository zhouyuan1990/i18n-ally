import { Command, CodeActionProvider, CodeActionKind, languages, TextDocument, Range, Selection } from 'vscode'
import { Global, Commands, ExtractTextOptions } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

class ExtractProvider implements CodeActionProvider {
  public async provideCodeActions (document: TextDocument, selection: Range | Selection): Promise<Command[]> {
    if (!Global.enabled)
      return []

    if (!(selection instanceof Selection))
      return []

    const text = document.getText(selection)
    if (!text || selection.start.line !== selection.end.line)
      return []

    const options: ExtractTextOptions = {
      filepath: document.fileName,
      text,
      range: selection,
      languageId: document.languageId,
    }

    return [{
      command: Commands.extract_text,
      title: i18n.t('refactor.extract_text'),
      arguments: [options],
    }]
  }
}

const m: ExtensionModule = () => {
  return [
    languages.registerCodeActionsProvider(
      Global.getDocumentSelectors(),
      new ExtractProvider(),
      {
        providedCodeActionKinds: [CodeActionKind.Refactor],
      },
    ),
  ]
}

export default m
