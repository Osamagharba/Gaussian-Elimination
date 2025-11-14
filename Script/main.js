const buildBtn = document.querySelector('.build');
const solveBtn = document.querySelector('.solve');
const clearBtn = document.querySelector('.clear');
const matrixTable = document.getElementById('matrix_table');
const output = document.getElementById('show_output');

buildBtn.addEventListener('click', buildMatrix);
solveBtn.addEventListener('click', solveSystem);
clearBtn.addEventListener('click', clearAll);

function buildMatrix() {
  const vars = parseInt(document.getElementById('variables').value) || 1;
  const eqs = parseInt(document.getElementById('equations').value) || 1;

  matrixTable.innerHTML = '';
  for (let i = 0; i < eqs; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < vars + 1; j++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = 'any';
      inp.value = '';
      inp.style.width = "55px";
      inp.style.textAlign = "center";
      inp.style.appearance = "textfield";
      inp.style.MozAppearance = "textfield";
      inp.style.WebkitAppearance = "textfield";
      td.appendChild(inp);
      tr.appendChild(td);

      if (j < vars - 1) {
        const labelTd = document.createElement('td');
        labelTd.className = 'label';
        labelTd.innerHTML = `X<sub>${j + 1}</sub> +`;
        tr.appendChild(labelTd);
      }
      else if (j === vars - 1) {
        const labelTd = document.createElement('td');
        labelTd.className = 'label';
        labelTd.innerHTML = `x<sub>${j + 1}</sub> =`;
        tr.appendChild(labelTd);
      }
    }

    matrixTable.appendChild(tr);
  }

  output.innerHTML = '';
}

function clearAll() {
  matrixTable.innerHTML = '';
  output.innerHTML = '';
}

function fmt(x) {
  if (Math.abs(x) < 1e-9) return '0';
  return parseFloat(x.toFixed(3)).toString();
}

function readMatrix() {
  const rows = Array.from(matrixTable.querySelectorAll('tr'));
  const A = rows.map(tr => {
    return Array.from(tr.querySelectorAll('input')).map(inp => {
      const v = parseFloat(inp.value);
      return isNaN(v) ? 0 : v;
    });
  });
  return A;
}

function renderMatrixDOM(A, highlightCol = -1) {
  const box = document.createElement('div');
  box.className = 'matrix-box';
  for (let i = 0; i < A.length; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'mrow';
    for (let j = 0; j < A[i].length; j++) {
      const cell = document.createElement('div');
      cell.className = 'mcell';
      cell.textContent = fmt(A[i][j]);
      if (j === highlightCol) cell.style.backgroundColor = '#00ff0033'; // تمييز العمود الأخضر
      rowDiv.appendChild(cell);
    }
    box.appendChild(rowDiv);
  }
  return box;
}

let stepIndex = 0;
function addStep(title, A, highlightCol = -1) {
  const card = document.createElement('div');
  card.className = 'step-card';
  card.style.animationDelay = (stepIndex * 80) + 'ms';
  stepIndex++;

  const titleDiv = document.createElement('div');
  titleDiv.className = 'step-title';
  titleDiv.textContent = title;

  card.appendChild(titleDiv);
  card.appendChild(renderMatrixDOM(A, highlightCol));
  output.appendChild(card);

  setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80);
}

function solveSystem() {
  output.innerHTML = '';
  stepIndex = 0;
  const A = readMatrix();
  if (!A.length) return alert('Build matrix first.');

  addStep('Initial Augmented Matrix (A | b):', A);

  const n = A.length;
  const m = A[0].length;

  let startRow = 0, startCol = 0;

  function selectNonZeroCol(A, startCol) {
    for (let c = startCol; c < m - 1; c++) {
      for (let r = 0; r < n; r++) {
        if (Math.abs(A[r][c]) > 1e-12) return c;
      }
    }
    return -1;
  }
  function returnNonZeroRow(A, col, startRow) {
    for (let r = startRow; r < n; r++) {
      if (Math.abs(A[r][col]) > 1e-12) return r;
    }
    return -1;
  }
  function swapRows(A, r1, r2) {
    const tmp = A[r1]; A[r1] = A[r2]; A[r2] = tmp;
  }

  while (startRow < n && startCol < m - 1) {
    const pivotCol = selectNonZeroCol(A, startCol);
    if (pivotCol === -1) break;

    const pivotRow = returnNonZeroRow(A, pivotCol, startRow);
    if (pivotRow === -1) {
      startCol++;
      continue;
    }

    addStep(`Start Submatrix (Pivot Column ${pivotCol + 1})`, A, pivotCol);

    if (pivotRow !== startRow) {
      swapRows(A, pivotRow, startRow);
      addStep(`Swap R${pivotRow + 1} ↔ R${startRow + 1}`, A);
    }

    const pivotVal = A[startRow][pivotCol];
    if (Math.abs(pivotVal) > 1e-12 && Math.abs(pivotVal - 1) > 1e-12) {
      for (let j = 0; j < m; j++) A[startRow][j] /= pivotVal;
      addStep(`(1/${fmt(pivotVal)}) × R${startRow + 1} → R${startRow + 1}`, A);
    }

    for (let r = 0; r < n; r++) {
      if (r === startRow) continue;
      const factor = -A[r][pivotCol];
      if (Math.abs(factor) < 1e-12) continue;
      for (let j = 0; j < m; j++) {
        A[r][j] += factor * A[startRow][j];
      }
      addStep(`${fmt(factor)} × R${startRow + 1} + R${r + 1} → R${r + 1}`, A);
    }

    startRow++;
    startCol = pivotCol + 1;
  }

  addStep('Final Reduced Row-Echelon Form:', A);

  const card = document.createElement('div');
  card.className = 'step-card';
  const t = document.createElement('div');
  t.className = 'step-title';
  t.textContent = 'Result';
  card.appendChild(t);

  for (let r = 0; r < n; r++) {
    const leftZero = A[r].slice(0, m - 1).every(v => Math.abs(v) < 1e-9);
    if (leftZero && Math.abs(A[r][m - 1]) > 1e-9) {
      const sol = document.createElement('div');
      sol.className = 'solution';
      sol.style.color = '#ff6b6b';
      sol.textContent = 'No solution.';
      card.appendChild(sol);
      output.appendChild(card);
      return;
    }
  }

  let pivotCount = 0;
  for (let r = 0; r < n; r++) {
    if (!A[r].slice(0, m - 1).every(v => Math.abs(v) < 1e-9)) pivotCount++;
  }

  if (pivotCount < m - 1) {
    const sol = document.createElement('div');
    sol.className = 'solution';
    sol.style.color = '#ffa500';
    sol.textContent = 'Infinite solutions.';
    card.appendChild(sol);
    output.appendChild(card);
    return;
  }

  const solDiv = document.createElement('div');
  solDiv.className = 'solution';
  for (let i = 0; i < Math.min(n, m - 1); i++) {
    const v = Math.abs(A[i][m - 1]) < 1e-12 ? 0 : A[i][m - 1];
    const line = document.createElement('div');
    line.style.color = '#7fffd4';
    line.textContent = `X${i + 1} = ${fmt(v)}`;
    solDiv.appendChild(line);
  }
  card.appendChild(solDiv);
  output.appendChild(card);
}