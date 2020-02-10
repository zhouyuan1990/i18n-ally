import { languages, TextDocument, Position, CancellationToken, Definition, DefinitionLink, Uri, workspace, Location, Range } from 'vscode'
import { ExtensionModule } from '../modules'
import { Global, KeyDetector, Config, CurrentFile } from '../core'

class DefinitionProvider {
  async provideDefinition (document: TextDocument, position: Position, token: CancellationToken): Promise<Definition | DefinitionLink[]> {
    let key = KeyDetector.getKey(document, position)

    if (!key)
      return []

    const prefix = KeyDetector.getKeyPrefix(document)
    key = prefix ? `${prefix}.${key}` : key

    const filepath = CurrentFile.loader.getFilepathByKey(key)
    if (!filepath)
      return []

    const localeDocument = await workspace.openTextDocument(filepath)
    if (!localeDocument)
      return []

    const parser = Global.getMatchedParser(filepath)
    if (!parser)
      return []

    const range = parser.navigateToKey(localeDocument.getText(), key, Config.keyStyle)

    const { start = 0, end = 0 } = range || {}

    return new Location(
      Uri.file(filepath),
      new Range(
        localeDocument.positionAt(start),
        localeDocument.positionAt(end),
      ),
    )
  }
}

const definition: ExtensionModule = () => {
  return [
    languages.registerDefinitionProvider(
      Global.getDocumentSelectors(),
      new DefinitionProvider(),
    ),
  ]
}

export default definition
