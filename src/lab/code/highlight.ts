/** Tiny, dependency-free syntax highlighter for Python and SQL (returns safe HTML). */

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const PY_KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '),
)
const PY_BUILTINS = new Set('print len range sorted sum min max enumerate zip list dict set tuple str int float round abs map filter isinstance any all'.split(' '))

const SQL_KEYWORDS = new Set(
  'select from where and or not in is null as join inner left right outer on group by order having limit offset insert into values update set delete create table primary key foreign references integer text real distinct count sum avg min max case when then else end asc desc like between union all exists with'.split(' '),
)

type Lang = 'python' | 'sql'

const PATTERNS: Record<Lang, RegExp> = {
  python: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|\s+|.)/g,
  sql: /('(?:''|[^'])*'|--[^\n]*|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|\s+|.)/g,
}

export function highlight(code: string, lang: Lang): string {
  let out = ''
  const re = PATTERNS[lang]
  re.lastIndex = 0
  let m: RegExpExecArray | null
  let prevWord = ''
  while ((m = re.exec(code))) {
    const tok = m[0]
    const after = code.slice(re.lastIndex).trimStart()[0]
    let cls = ''
    if (/^("|')/.test(tok)) cls = 'tk-str'
    else if (tok.startsWith('#') || tok.startsWith('--')) cls = 'tk-com'
    else if (/^\d/.test(tok)) cls = 'tk-num'
    else if (/^[A-Za-z_]/.test(tok)) {
      if (lang === 'python') {
        if (PY_KEYWORDS.has(tok)) cls = 'tk-kw'
        else if (prevWord === 'def' || prevWord === 'class') cls = 'tk-fn'
        else if (PY_BUILTINS.has(tok)) cls = 'tk-bi'
        else if (after === '(') cls = 'tk-fn'
      } else if (SQL_KEYWORDS.has(tok.toLowerCase())) cls = 'tk-kw'
      else if (after === '(') cls = 'tk-fn'
      prevWord = tok
    }
    out += cls ? `<span class="${cls}">${escape(tok)}</span>` : escape(tok)
  }
  // Trailing newline keeps the overlay height in sync with the textarea
  return out + '\n'
}
