# Gaussian Elimination Solver

A web-based interactive tool that builds and solves linear systems using **Gaussian Elimination** and presents each step visually.

This project helps students, engineers, and anyone studying linear algebra understand the full workflow of row operations, pivots, and reduced row-echelon form (RREF).

---

## 🚀 Features

- Build custom augmented matrices (A | b) for any number of variables and equations
- Step-by-step Gaussian elimination with:
  - Row swapping
  - Row scaling
  - Row replacement
  - Pivot highlighting
- Detects and shows:
  - Unique solution
  - Infinite solutions
  - No solution (inconsistent)
- Clean, responsive UI with animated step cards

---

## 🧮 How to Use

1. Enter number of **variables** and **equations**.
2. Click **Build** to generate the augmented matrix.
3. Fill the matrix values.
4. Click **Solve** to see every elimination step and the final result.
5. Click **Clear** to reset.

--- 

## 📘 Gaussian Elimination Algorithm

1. Identify the first non-zero column
   Scan the matrix from left to right to locate the first column that contains at least one non-zero element.
   This column will be used to form the pivot.
2. Make the top element of this column non-zero
   If the element in the pivot position is zero, apply elementary row operations (row swapping) to bring a non-zero value into the pivot position.
3. Scale the pivot row so the pivot becomes 1
   Divide the entire pivot row by the pivot value to normalize it.
   This makes the leading coefficient of the row equal to 1.
4. Eliminate all other entries in the pivot column
   Use elementary row operations to make all other elements in the pivot column equal to 0.
   This creates a clean pivot column.
5. Reduce the matrix to a smaller submatrix
   After forming a pivot, ignore the pivot row and pivot column.
   Focus on the submatrix formed by rows below and columns to the right of the pivot.
6. Repeat the same steps on the submatrix
   Continue the elimination process until the matrix reaches upper-triangular form and then Reduced Row-Echelon Form (RREF).
