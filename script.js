function changeMajor() {
  const major = document.getElementById('majorSelect').value;
  const title = document.getElementById('majorTitle');
  if (major === "BSED_FILIPINO") {
    title.textContent = "BACHELOR OF SECONDARY EDUCATION IN FILIPINO";
  } else if (major === "BSED_ENGLISH") {
    title.textContent = "BACHELOR OF SECONDARY EDUCATION IN ENGLISH";
  } else if (major === "BSIT") {
    title.textContent = "BACHELOR OF SCIENCE IN INFO-TECH";
  }
}

function changeTheme() {
  const theme = document.getElementById('theme').value;
  document.body.classList.remove('default', 'matcha', 'pink', 'black');
  document.body.classList.add(theme);
}

function saveSchedule() {
  let table = document.getElementById('scheduleTable');
  let section = document.getElementById('sectionName').value;
  let heading = document.getElementById('majorTitle').textContent;
  let subheading = document.querySelector('strong').textContent;
  let csv = heading + '\n' + subheading + '\n' + 'Section:,' + section + '\n';

  for (let row of table.rows) {
    let rowData = [];
    for (let i = 0; i < row.cells.length; i++) {
      let cell = row.cells[i];
      // Only add textarea values for visible cells
      let textarea = cell.querySelector('textarea');
      rowData.push(textarea ? textarea.value.replace(/,/g, ' ') : '');
    }
    csv += rowData.join(',') + '\n';
  }
  let blob = new Blob([csv], {type: 'text/csv'});
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'schedule.csv';
  link.click();
}

function saveAsImage() {
  const originalContainer = document.getElementById('scheduleContainer');
  const cloneContainer = originalContainer.cloneNode(true);

  // Replace all <textarea> in the clone with spans
  const textareas = cloneContainer.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const span = document.createElement('span');
    span.innerHTML = textarea.value.replace(/\n/g, '<br>');
    span.style.display = 'inline-block';
    span.style.minWidth = textarea.style.minWidth || '70px';
    span.style.wordBreak = 'break-word';
    textarea.parentNode.replaceChild(span, textarea);
  });

  // Apply theme class from body if needed
  cloneContainer.className = originalContainer.className + ' ' + document.body.className;

  // Offscreen for rendering
  cloneContainer.style.position = 'fixed';
  cloneContainer.style.top = '-9999px';
  cloneContainer.style.left = '-9999px';
  cloneContainer.style.zIndex = '9999';
  document.body.appendChild(cloneContainer);

  html2canvas(cloneContainer).then(function(canvas) {
    const link = document.createElement('a');
    link.download = 'schedule.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    document.body.removeChild(cloneContainer);
  });
}

// -------- TIME FORMAT SWITCHER --------
function changeTimeFormat() {
  const format = document.getElementById('timeFormat').value;
  const tableBody = document.querySelector('#scheduleTable tbody');

  let timeSlots = [];
  if (format === 'hour') {
    timeSlots = [
      '7:00–8:00','8:00–9:00','9:00–10:00','10:00–11:00','11:00–12:00',
      '12:00–1:00','1:00–2:00','2:00–3:00','3:00–4:00','4:00–5:00'
    ];
  } else {
    timeSlots = [
      '8:00–8:30','8:30–9:00','9:00–9:30','9:30–10:00','10:00–10:30','10:30–11:00',
      '11:00–11:30','11:30–12:00','12:00–12:30','12:30–1:00','1:00–1:30','1:30–2:00',
      '2:00–2:30','2:30–3:00','3:00–3:30','3:30–4:00','4:00–4:30','4:30–5:00'
    ];
  }

  // Save existing cell values (by row and column)
  let cellValues = [];
  for (let row of tableBody.rows) {
    let rowData = [];
    for (let i = 1; i < row.cells.length; i++) {
      let textarea = row.cells[i].querySelector('textarea');
      rowData.push(textarea ? textarea.value : '');
    }
    cellValues.push(rowData);
  }

  // Rebuild table rows
  tableBody.innerHTML = '';
  for (let i = 0; i < timeSlots.length; i++) {
    let row = document.createElement('tr');
    let timeCell = document.createElement('td');
    let input = document.createElement('input');
    input.type = 'text';
    input.value = timeSlots[i];
    timeCell.appendChild(input);
    row.appendChild(timeCell);

    for (let j = 0; j < 6; j++) {
      let td = document.createElement('td');
      let ta = document.createElement('textarea');
      ta.rows = 3;
      // Restore previous values if possible
      if (cellValues[i] && cellValues[i][j]) ta.value = cellValues[i][j];
      td.appendChild(ta);
      row.appendChild(td);
    }
    tableBody.appendChild(row);
  }

  setUpTextareaFocus();
  setUpMerging();
}

// --------- SUBJECT BUTTONS AND FOCUS TRACKING ----------
let activeTextarea = null;

function setUpTextareaFocus() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(t => {
    t.addEventListener('focus', function () {
      activeTextarea = this;
    });
  });
}

// --------- MERGE & UNMERGE FEATURE ----------
let mergeSelection = [];
function setUpMerging() {
  const table = document.getElementById("scheduleTable");
  table.querySelectorAll('td').forEach(td => {
    td.removeEventListener('click', handleCellClick);
    td.addEventListener('click', handleCellClick);
  });

  const mergeBtn = document.getElementById('mergeBtn');
  if (mergeBtn) {
    mergeBtn.onclick = mergeSelectedCells;
  }

  const unmergeBtn = document.getElementById('unmergeBtn');
  if (unmergeBtn) {
    unmergeBtn.onclick = unmergeSelectedCell;
  }
}

function handleCellClick(e) {
  // Only handle left-clicks (not right-clicks or double-clicks)
  if (e.button !== 0) return;
  // Don't select time column (first cell)
  if (this.cellIndex === 0) return;

  // For unmerge, select only one cell at a time
  if (mergeSelection.length && !e.ctrlKey && !e.shiftKey) {
    clearMergeSelection();
  }

  this.classList.toggle('selected-to-merge');
  const row = this.parentElement.rowIndex;
  const col = this.cellIndex;
  const idx = mergeSelection.findIndex(s => s.row === row && s.col === col);
  if (idx > -1) {
    mergeSelection.splice(idx, 1);
  } else {
    mergeSelection.push({ row, col });
  }
}

function mergeSelectedCells() {
  if (mergeSelection.length < 2) {
    alert("Select at least 2 adjacent cells in the same column to merge.");
    return;
  }
  // Check all in same column and consecutive rows
  const col = mergeSelection[0].col;
  const rows = mergeSelection.map(s => s.row).sort((a, b) => a - b);
  for (let s of mergeSelection) {
    if (s.col !== col) {
      alert("All selected cells must be in the same column!");
      clearMergeSelection();
      return;
    }
  }
  for (let i = 1; i < rows.length; i++) {
    if (rows[i] !== rows[i - 1] + 1) {
      alert("Cells must be adjacent rows!");
      clearMergeSelection();
      return;
    }
  }
  // Don't allow merging cells that are already merged (rowSpan > 1)
  const table = document.getElementById("scheduleTable");
  const tbody = table.tBodies[0];
  for (let i = 0; i < rows.length; i++) {
    const cell = tbody.rows[rows[i]].cells[col];
    if (cell.rowSpan > 1) {
      alert("Cannot merge cells that include an already merged cell.");
      clearMergeSelection();
      return;
    }
  }
  // Merge: set rowspan on first, remove following cells
  const firstRow = rows[0];
  const startCell = tbody.rows[firstRow].cells[col];
  startCell.rowSpan = rows.length;
  startCell.classList.add("merged-cell");
  // Combine textarea values
  let mergedVal = '';
  mergeSelection.forEach((s, idx) => {
    const ta = tbody.rows[s.row].cells[s.col].querySelector('textarea');
    if (ta) mergedVal += (mergedVal ? '\n' : '') + ta.value;
  });
  startCell.querySelector('textarea').value = mergedVal;
  // Remove cells in subsequent rows
  for (let i = 1; i < rows.length; i++) {
    tbody.rows[rows[i]].deleteCell(col);
  }
  // Store merge info for unmerging
  startCell.dataset.merged = "true";
  startCell.dataset.mergeRows = rows.length;
  clearMergeSelection();
  setUpMerging(); // re-attach listeners
}

function unmergeSelectedCell() {
  if (mergeSelection.length !== 1) {
    alert("Select a single merged cell to unmerge.");
    return;
  }
  const table = document.getElementById("scheduleTable");
  const tbody = table.tBodies[0];
  const { row, col } = mergeSelection[0];
  let cell = tbody.rows[row].cells[col];
  if (!(cell.dataset && cell.dataset.merged === "true")) {
    alert("Selected cell is not a merged cell.");
    clearMergeSelection();
    return;
  }

  const numRows = parseInt(cell.dataset.mergeRows, 10) || cell.rowSpan || 1;
  const textareaVal = cell.querySelector('textarea').value;
  const splitVals = textareaVal.split(/\r?\n/);

  // Unmerge: reset rowspan, add missing cells back
  cell.rowSpan = 1;
  cell.classList.remove("merged-cell");
  delete cell.dataset.merged;
  delete cell.dataset.mergeRows;

  // Insert the missing cells in the rows below
  for (let i = 1; i < numRows; i++) {
    const rowIdx = row + i;
    if (tbody.rows[rowIdx]) {
      const newCell = tbody.rows[rowIdx].insertCell(col);
      let ta = document.createElement('textarea');
      ta.rows = 3;
      ta.value = splitVals[i] || '';
      newCell.appendChild(ta);
    }
  }
  // Fill the first cell with the first value
  cell.querySelector('textarea').value = splitVals[0] || '';

  clearMergeSelection();
  setUpTextareaFocus();
  setUpMerging();
}

function clearMergeSelection() {
  document.querySelectorAll('.selected-to-merge').forEach(td => td.classList.remove('selected-to-merge'));
  mergeSelection = [];
}

document.addEventListener('DOMContentLoaded', function () {
  setUpTextareaFocus();

  // Subject quick fill: both copy to clipboard and insert into selected textarea
  const subjectBtns = document.querySelectorAll('.subject-btn');
  subjectBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const value = btn.getAttribute('data-value').replace(/<br\s*\/?>/gi, "\n");

      // Insert into last focused textarea if exists
      if (activeTextarea) {
        activeTextarea.value = value;
        activeTextarea.focus();
      } else {
        alert("Click a table cell first before choosing a subject.");
      }

      // Copy to clipboard as well
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value);
        btn.textContent = "Copied! (Paste in table cell)";
        setTimeout(() => {
          btn.textContent = btn.getAttribute('data-value').replace(/\n/g, ' ').replace(/<br\s*\/?>/gi, ' ');
        }, 900);
      } else {
        // Fallback for older browsers
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = value;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }
    });
  });

  // Set initial table format on page load
  const timeFormat = document.getElementById('timeFormat');
  if (timeFormat) {
    timeFormat.value = 'hour';
    changeTimeFormat();
  }
  setUpMerging();
});
