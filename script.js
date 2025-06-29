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
      let textarea = row.cells[i].querySelector('textarea');
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

  // Replace all <input type="text"> in the clone with spans (with line breaks)
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

// Subject quick fill: Copy to clipboard on click
document.addEventListener('DOMContentLoaded', function() {
  var subjectBtns = document.querySelectorAll('.subject-btn');
  subjectBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const value = btn.getAttribute('data-value').replace(/<br\s*\/?>/gi, "\n");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value);
        btn.textContent = "Copied! (Paste in table cell)";
        setTimeout(() => {
          btn.textContent = btn.getAttribute('data-value').replace(/\n/g, ' ').replace(/<br\s*\/?>/gi, ' ');
        }, 900);
      } else {
        // fallback
        const textarea = document.createElement('textarea');
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    });
  });
});
