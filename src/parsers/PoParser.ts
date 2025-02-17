// @ts-ignore
import po2json from 'po2json'
import { Parser } from './Parser'

export class PoParser extends Parser {
  id = 'po'

  constructor () {
    super(['po'], /\.?po(?:t|tx)?$/g)
  }

  readonly = true

  async parse (text: string) {
    const result = po2json.parse(text)
    for (const key of Object.keys(result))
      result[key] = result[key][1]
    return result
  }

  async dump (object: object) {
    return ''
  }
}
