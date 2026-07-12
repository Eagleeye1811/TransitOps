/**
 * Escapes a single CSV field per RFC 4180: wraps in quotes if it contains a
 * comma, quote, or newline, and doubles any internal quotes.
 */
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCsvLine(row) {
  return row.map(escapeCsvField).join(',')
}

/**
 * Converts an array of plain row-arrays (or objects, with `columns`) into a
 * CSV string.
 */
export function arrayToCsv(rows, columns) {
  const lines = []
  if (columns?.length) {
    lines.push(rowToCsvLine(columns.map((c) => (typeof c === 'string' ? c : c.label))))
  }
  for (const row of rows) {
    if (Array.isArray(row)) {
      lines.push(rowToCsvLine(row))
    } else if (columns?.length) {
      const keys = columns.map((c) => (typeof c === 'string' ? c : c.key))
      lines.push(rowToCsvLine(keys.map((k) => row[k])))
    } else {
      lines.push(rowToCsvLine(Object.values(row)))
    }
  }
  return lines.join('\r\n')
}

/** Triggers a real browser download of a CSV string via Blob + temporary <a>. */
export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Converts rows to CSV and immediately downloads it. */
export function exportRowsAsCsv(filename, rows, columns) {
  downloadCsv(filename, arrayToCsv(rows, columns))
}

/**
 * Exports a multi-section report (KPI summary + one or more tables) as a
 * single CSV file, mirroring the {kpis, tables} shape used by pdfExport.js.
 *
 * @param {Object} params
 * @param {string} [params.filename]
 * @param {Array<{label: string, value: string|number}>} [params.kpis]
 * @param {Array<{heading: string, columns: Array<string|{label:string}>, rows: Array<Array<string|number>>}>} [params.tables]
 */
export function exportReportAsCsv({ filename = 'transitops-analytics-report.csv', kpis = [], tables = [] } = {}) {
  const lines = []

  if (kpis.length) {
    lines.push('KPI Summary')
    lines.push(rowToCsvLine(['Metric', 'Value']))
    for (const k of kpis) {
      lines.push(rowToCsvLine([k.label, k.value]))
    }
    lines.push('')
  }

  for (const table of tables) {
    if (!table.rows?.length) continue
    lines.push(table.heading)
    lines.push(rowToCsvLine(table.columns.map((c) => (typeof c === 'string' ? c : c.label))))
    for (const row of table.rows) {
      lines.push(rowToCsvLine(row))
    }
    lines.push('')
  }

  downloadCsv(filename, lines.join('\r\n'))
}
