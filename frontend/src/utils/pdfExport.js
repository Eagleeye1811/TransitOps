import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const MARGIN = 40
const BRAND_RGB = [79, 70, 229] // brand-600

/**
 * Generates and downloads a PDF report.
 *
 * @param {Object} params
 * @param {string} [params.title] - Report title shown at the top of the document.
 * @param {Array<{label: string, value: string|number}>} [params.kpis] - KPI summary rows.
 * @param {Array<{heading: string, columns: Array<string|{label:string}>, rows: Array<Array<string|number>>}>} [params.tables]
 * @param {string} [params.filename] - Filename for the downloaded PDF.
 */
export function exportAnalyticsReport({
  title = 'TransitOps Analytics Report',
  kpis = [],
  tables = [],
  filename = 'transitops-analytics-report.pdf',
} = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let cursorY = 50

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(30, 34, 48)
  doc.text(title, MARGIN, cursorY)
  cursorY += 20

  // Generation timestamp
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120, 128, 140)
  doc.text(`Generated ${new Date().toLocaleString()}`, MARGIN, cursorY)
  doc.setTextColor(30, 34, 48)
  cursorY += 18

  // Rule under header
  doc.setDrawColor(226, 232, 240)
  doc.line(MARGIN, cursorY, pageWidth - MARGIN, cursorY)
  cursorY += 18

  const ensureSpace = (needed) => {
    if (cursorY + needed > pageHeight - MARGIN) {
      doc.addPage()
      cursorY = 50
    }
  }

  // KPI summary section
  if (kpis.length) {
    ensureSpace(60)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('KPI Summary', MARGIN, cursorY)
    cursorY += 10

    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Metric', 'Value']],
      body: kpis.map((k) => [String(k.label), String(k.value)]),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: BRAND_RGB, textColor: 255 },
    })
    cursorY = doc.lastAutoTable.finalY + 28
  }

  // One autoTable per data table
  for (const table of tables) {
    if (!table.rows?.length) continue

    ensureSpace(60)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(table.heading, MARGIN, cursorY)
    cursorY += 10

    const headRow = table.columns.map((c) => (typeof c === 'string' ? c : c.label))

    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGIN, right: MARGIN },
      head: [headRow],
      body: table.rows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: BRAND_RGB, textColor: 255 },
      didDrawPage: () => {
        cursorY = 50
      },
    })
    cursorY = doc.lastAutoTable.finalY + 28
  }

  doc.save(filename)
}
