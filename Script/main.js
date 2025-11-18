const buildBtn = document.querySelector('.build');
const solveBtn = document.querySelector('.solve');
const clearBtn = document.querySelector('.clear');
const gaussianBtn = document.getElementById('btn-gaussian');
const gaussJordanBtn = document.getElementById('btn-gauss-jordan');
const matrixTable = document.getElementById('matrix_table');
const output = document.getElementById('show_output');


let currentMethod = 'gauss'; // 'gauss' or 'jordan'
gaussianBtn.classList.add('active');

buildBtn.addEventListener('click', buildMatrix);
solveBtn.addEventListener('click', solveSystem);
clearBtn.addEventListener('click', clearAll);
gaussianBtn.addEventListener('click', () => setMethod('gaussian'));
gaussJordanBtn.addEventListener('click', () => setMethod('gauss-jordan'));

function setMethod(method) {
  if (method === 'gaussian') {
    currentMethod = 'gauss'; // for your solveSystem logic
  } else if (method === 'gauss-jordan') {
    currentMethod = 'jordan';
  }

  gaussianBtn.classList.toggle('active', method === 'gaussian');
  gaussJordanBtn.classList.toggle('active', method === 'gauss-jordan');
}

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
        labelTd.innerHTML = `X<sub>${j + 1}</sub> =`;
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
      if (j === highlightCol) cell.classList.add('pivot');
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

// Utility helpers used in elimination
function selectNonZeroCol(A, startCol) {
  const n = A.length, m = A[0].length;
  for (let c = startCol; c < m - 1; c++) {
    for (let r = 0; r < n; r++) {
      if (Math.abs(A[r][c]) > 1e-12) return c;
    }
  }
  return -1;
}
function returnNonZeroRow(A, col, startRow) {
  const n = A.length;
  for (let r = startRow; r < n; r++) {
    if (Math.abs(A[r][col]) > 1e-12) return r;
  }
  return -1;
}
function swapRows(A, r1, r2) {
  const tmp = A[r1];
  A[r1] = A[r2];
  A[r2] = tmp;
}

function deepCopy(A) {
  return A.map(row => row.slice());
}

function backSubstitutionSteps(A, addStepFn) {
  // A is the matrix after forward elimination (upper-triangular-ish)
  const Row = A.length;
  const Col = A[0].length;
  const n = Col - 1;
  const X = new Array(n).fill(0);

  for (let i = Row - 1; i >= 0; i--) {
    // compute rhs and display step
    const rhs = A[i][n];
    let line = `From equation R<sub>${i + 1}</sub>: X<sub>${i + 1}</sub> = ${fmt(rhs)}`;
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[i][j]) > 1e-12) {
        line += ` - (${fmt(A[i][j])} * X<sub>${j + 1}</sub>)`;
        sum += A[i][j] * X[j];
      }
    }
    let Xi = rhs - sum;
    if (Math.abs(A[i][i]) > 1e-12) Xi = Xi / A[i][i];
    X[i] = Xi;

    // Add a textual step card showing the algebra (not the whole matrix)
    const card = document.createElement('div');
    card.className = 'step-card';
    const title = document.createElement('div');
    title.className = 'step-title';
    title.innerHTML = `Back-substitution: R<sub>${i + 1}</sub>`;
    card.appendChild(title);
    const p = document.createElement('div');
    p.innerHTML = line + ` = ${fmt(X[i])}`;
    card.appendChild(p);
    output.appendChild(card);
  }

  // final solution card
  const finalCard = document.createElement('div');
  finalCard.className = 'step-card';
  const t = document.createElement('div');
  t.className = 'step-title';
  t.textContent = 'Final Solution:';
  finalCard.appendChild(t);
  const solDiv = document.createElement('div');
  solDiv.className = 'solution';
  for (let i = 0; i < n; i++) {
    const line = document.createElement('div');
    line.innerHTML = `X<sub>${i + 1}</sub> = ${fmt(X[i])}`;
    solDiv.appendChild(line);
  }
  finalCard.appendChild(solDiv);
  output.appendChild(finalCard);
}

function solveSystem() {
  output.innerHTML = '';
  stepIndex = 0;

  const Aorig = readMatrix();
  if (!Aorig.length) return alert('Build matrix first.');

  const A = deepCopy(Aorig);
  addStep('Initial Augmented Matrix (A | b):', A);

  const n = A.length;
  const m = A[0].length;

  let startRow = 0, startCol = 0;

  while (startRow < n && startCol < m - 1) {
    const pivotCol = selectNonZeroCol(A, startCol);
    if (pivotCol === -1) break;

    const pivotRow = returnNonZeroRow(A, pivotCol, startRow);
    if (pivotRow === -1) {
      startCol++;
      continue;
    }

    addStep(`Start submatrix (Pivot column ${pivotCol + 1})`, A, pivotCol);

    if (pivotRow !== startRow) {
      swapRows(A, pivotRow, startRow);
      addStep(`Swap R${pivotRow + 1} ↔ R${startRow + 1}`, A);
    }

    const pivotVal = A[startRow][pivotCol];
    if (Math.abs(pivotVal) > 1e-12 && Math.abs(pivotVal - 1) > 1e-12) {
      for (let j = 0; j < m; j++) A[startRow][j] /= pivotVal;
      addStep(`(1/${fmt(pivotVal)}) × R${startRow + 1} → R${startRow + 1}`, A);
    }

    if (currentMethod === 'jordan') {
      for (let r = 0; r < n; r++) {
        if (r === startRow) continue;
        const factor = -A[r][pivotCol];
        if (Math.abs(factor) < 1e-12) continue;
        for (let j = 0; j < m; j++) A[r][j] += factor * A[startRow][j];
        addStep(`${fmt(factor)} × R${startRow + 1} + R${r + 1} → R${r + 1}`, A);
      }
    } else {
      for (let r = startRow + 1; r < n; r++) {
        const factor = -A[r][pivotCol];
        if (Math.abs(factor) < 1e-12) continue;
        for (let j = 0; j < m; j++) A[r][j] += factor * A[startRow][j];
        addStep(`${fmt(factor)} × R${startRow + 1} + R${r + 1} → R${r + 1}`, A);
      }
    }

    startRow++;
    startCol = pivotCol + 1;
  }

  addStep('Final Reduced Row-Echelon Form:', A);

  let pivotCount = 0;
  let hasNoSolution = false;

  for (let i = 0; i < n; i++) {
    const leftZero = A[i].slice(0, m - 1).every(v => Math.abs(v) < 1e-12);
    const rhsNonZero = Math.abs(A[i][m - 1]) > 1e-12;

    if (leftZero && rhsNonZero) {
      hasNoSolution = true;
      break;
    }
    if (!leftZero) pivotCount++;
  }

  if (hasNoSolution) {
    const card = document.createElement('div');
    card.className = 'step-card';
    const t = document.createElement('div');
    t.className = 'step-title';
    t.textContent = 'Result';
    const sol = document.createElement('div');
    sol.className = 'solution';
    sol.style.color = '#ff6b6b';
    sol.textContent = 'You have no solutions.';
    card.appendChild(t);
    card.appendChild(sol);
    output.appendChild(card);
    return;
  }

  if (pivotCount < m - 1) {
    const card = document.createElement('div');
    card.className = 'step-card';
    const t = document.createElement('div');
    t.className = 'step-title';
    t.textContent = 'Result';
    const sol = document.createElement('div');
    sol.className = 'solution';
    sol.style.color = '#ffa500';
    sol.textContent = 'You have infinite solutions.';
    card.appendChild(t);
    card.appendChild(sol);
    output.appendChild(card);
    return;
  }

  if (currentMethod === 'jordan') {
    const card = document.createElement('div');
    card.className = 'step-card';
    const t = document.createElement('div');
    t.className = 'step-title';
    t.textContent = 'Result';
    card.appendChild(t);
    const solDiv = document.createElement('div');
    solDiv.className = 'solution';
    for (let i = 0; i < n; i++) {
      const leftZero = A[i].slice(0, m - 1).every(v => Math.abs(v) < 1e-12);
      if (leftZero && Math.abs(A[i][m - 1]) < 1e-12) continue;
      const line = document.createElement('div');
      line.innerHTML = `X<sub>${i + 1}</sub> = ${fmt(A[i][m - 1])}`;
      solDiv.appendChild(line);
    }
    card.appendChild(solDiv);
    output.appendChild(card);
    return;
  }

  backSubstitutionSteps(A);
}