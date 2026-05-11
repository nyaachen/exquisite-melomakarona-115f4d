import { ArchitectureParam } from '../data/architectures'

/** Parse a training command string into ArchitectureParam entries.
 *  Supports formats: `--key value`, `--key=value`, `--flag`, `--no-flag` */
export function parseTrainingCommand(command: string): ArchitectureParam[] {
  const result: ArchitectureParam[] = []
  if (!command.trim()) return result

  // Tokenize: split on whitespace but respect quotes
  const tokens = tokenize(command)

  let i = 0
  // Skip leading tokens that aren't --args (e.g. python, train.py)
  while (i < tokens.length && !tokens[i].startsWith('--')) {
    i++
  }

  for (; i < tokens.length; i++) {
    const token = tokens[i]

    // Handle --key=value form
    const eqIdx = token.indexOf('=')
    if (eqIdx > 2) {
      const rawKey = token.slice(2, eqIdx)
      const rawVal = token.slice(eqIdx + 1)
      if (rawKey) {
        result.push(buildParam(rawKey, rawVal))
      }
      continue
    }

    // Must start with --
    if (!token.startsWith('--') || token.length <= 2) continue
    const rawKey = token.slice(2)

    // --no-flag → boolean false
    if (rawKey.startsWith('no-') && rawKey.length > 3) {
      const flagKey = rawKey.slice(3)
      result.push({ name: flagKey, key: toCamelCase(flagKey), type: 'boolean', defaultValue: false, required: false, description: '' })
      continue
    }

    // Peek at next token to decide if it's a value or a flag
    const next = tokens[i + 1]
    if (next && !next.startsWith('--')) {
      // --key value
      i++
      result.push(buildParam(rawKey, next))
    } else {
      // --flag (boolean true)
      result.push({ name: rawKey, key: toCamelCase(rawKey), type: 'boolean', defaultValue: true, required: false, description: '' })
    }
  }

  return result
}

function buildParam(rawKey: string, rawVal: string): ArchitectureParam {
  const key = toCamelCase(rawKey)
  const { type, value } = inferType(rawVal)
  return {
    name: rawKey,
    key,
    type,
    defaultValue: value,
    required: false,
    description: '',
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < input.length) {
    // Skip whitespace
    while (i < input.length && /\s/.test(input[i])) i++
    if (i >= input.length) break

    if (input[i] === '"' || input[i] === "'") {
      const quote = input[i]
      i++
      let s = ''
      while (i < input.length && input[i] !== quote) {
        s += input[i]
        i++
      }
      i++ // skip closing quote
      tokens.push(s)
    } else {
      let s = ''
      while (i < input.length && !/\s/.test(input[i])) {
        s += input[i]
        i++
      }
      tokens.push(s)
    }
  }
  return tokens
}

function toCamelCase(key: string): string {
  return key.replace(/[-_]([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase())
}

function inferType(val: string): { type: ArchitectureParam['type']; value: string | number | boolean } {
  if (val === 'true') return { type: 'boolean', value: true }
  if (val === 'false') return { type: 'boolean', value: false }
  const num = Number(val)
  if (!isNaN(num) && val.trim() !== '') return { type: 'number', value: num }
  return { type: 'string', value: val }
}
