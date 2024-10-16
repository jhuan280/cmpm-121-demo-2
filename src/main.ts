import "./style.css";

const APP_NAME = "Jackie's Art Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

//-------------------------Title-------------------------

// Create an h1 element for the title
const title = document.createElement("h1");
title.textContent = APP_NAME;

// Append the h1 element to the app
app.appendChild(title);

// Update the document title
document.title = APP_NAME;

//-------------------------Canvas-------------------------

// Create a container for the canvas and buttons
const container = document.createElement("div");
container.className = "canvas-container";

// Create a canvas element
const canvas = document.createElement("canvas");

// Set the size of the canvas
canvas.width = 256;
canvas.height = 256;

// Append the canvas to the container
container.appendChild(canvas);

//-------------------------Drawing with mouse -------------------------

// Get the 2D drawing context
const context = canvas.getContext("2d")!;

// Drawing state
let isDrawing = false;
const paths: Array<Array<{x: number, y: number}>> = [];
const redoStack: Array<Array<{x: number, y: number}>> = []; // Stack for redo functionality
let currentPath: Array<{x: number, y: number}> = [];

// Function to start drawing
const startDrawing = (event: MouseEvent) => {
  isDrawing = true;
  currentPath = [];
  paths.push(currentPath);
  addPoint(event.clientX, event.clientY);
  redoStack.length = 0; // Clear the redo stack on new draw action
};

// Function to draw
const draw = (event: MouseEvent) => {
  if (!isDrawing) return;
  addPoint(event.clientX, event.clientY);
};

// Add a point to the current path
const addPoint = (x: number, y: number) => {
  const rect = canvas.getBoundingClientRect();
  const point = { x: x - rect.left, y: y - rect.top };
  currentPath.push(point);

  // Dispatch a custom event 'drawing-changed'
  const event = new CustomEvent('drawing-changed', { detail: { point: point } });
  canvas.dispatchEvent(event);
};

// Observer for 'drawing-changed' events to redraw the canvas
canvas.addEventListener('drawing-changed', () => {
  redrawCanvas();
});

// Function to redraw canvas
const redrawCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  context.beginPath();

  paths.forEach(path => {
    if (path.length === 0) return;
    context.moveTo(path[0].x, path[0].y);
    path.forEach(point => context.lineTo(point.x, point.y));
  });

  context.stroke();
  context.closePath();
};

// Function to stop drawing
const stopDrawing = () => {
  isDrawing = false;
};

// Add event listeners to the canvas
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

//-------------------------Buttons-------------------------

// Create a button container
const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";

// Create a clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";

// Add an event listener to the clear button
clearButton.addEventListener("click", () => {
  paths.length = 0; // Clear all paths
  redoStack.length = 0; // Clear redo stack
  redrawCanvas(); // Redraw canvas to reflect clearing
});

// Append the clear button to the button container
buttonContainer.appendChild(clearButton);

// Create an undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";

// Undo button event listener
undoButton.addEventListener("click", () => {
  if (paths.length > 0) {
    const lastPath = paths.pop(); // Remove the last drawing path
    if (lastPath) {
      redoStack.push(lastPath); // Add it to the redo stack if not null
    }
    // Dispatch a custom event 'drawing-changed' to update the canvas
    const event = new CustomEvent('drawing-changed');
    canvas.dispatchEvent(event);
  }
});

// Append the undo button to the button container
buttonContainer.appendChild(undoButton);

// Create a redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";

// Add an event listener to the redo button
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const pathToRedo = redoStack.pop(); // Restore the last undone path
    if (pathToRedo) paths.push(pathToRedo); // Add it back to paths
    // Dispatch a custom event 'drawing-changed' to update the canvas
    const event = new CustomEvent('drawing-changed');
    canvas.dispatchEvent(event);
  }
});

// Append the redo button to the button container
buttonContainer.appendChild(redoButton);

// Append the button container to the main container
container.appendChild(buttonContainer);

// Append the main container to the app
app.appendChild(container);