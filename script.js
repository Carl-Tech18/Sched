function changeMajor() {
  const major = document.getElementById('majorSelect').value;
  const title = document.getElementById('majorTitle');
  if (major === "BSED") {
    title.textContent = "BACHELOR OF SECONDARY EDUCATION";
  } else if (major === "BSIT") {
    title.textContent = "BACHELOR OF SCIENCE IN INFO TECH";
  }
}

function changeTheme() {
  const theme = document.getElementById('theme').value;
  document.body.classList.remove('default', 'matcha', 'pink', 'blue');
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
      let input = row.cells[i].querySelector('input[type="text"]');
      rowData.push(input ? input.value.replace(/,/g, ' ') : '');
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
  const inputs = cloneContainer.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    const span = document.createElement('span');
    span.innerHTML = input.value.replace(/\n/g, '<br>');
    span.style.display = 'inline-block';
    span.style.minWidth = input.style.minWidth || '70px';
    span.style.wordBreak = 'break-word';
    input.parentNode.replaceChild(span, input);
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
