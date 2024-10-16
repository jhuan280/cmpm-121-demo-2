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

// Create a canvas element
const canvas = document.createElement("canvas");

// Set the size of the canvas
canvas.width = 256;
canvas.height = 256;

// Append the canvas to the app
app.appendChild(canvas);

//-------------------------Drawing with mouse -------------------------

// Get the 2D drawing context
const context = canvas.getContext("2d")!;

// Drawing state
let isDrawing = false;
const paths: Array<Array<{x: number, y: number}>> = [];
let currentPath: Array<{x: number, y: number}> = [];

// Function to start drawing
const startDrawing = (event: MouseEvent) => {
  isDrawing = true;
  currentPath = [];
  paths.push(currentPath);
  addPoint(event.clientX, event.clientY);
};

// Function to draw
const draw = (event: MouseEvent) => {
  if (!isDrawing) return;
  addPoint(event.clientX, event.clientY);
  redrawCanvas();
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

//-------------------------Clear canvas button-------------------------

// Create a clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";

// Add an event listener to the clear button
clearButton.addEventListener("click", () => {
  paths.length = 0; // Clear all paths
  redrawCanvas(); // Redraw canvas to reflect clearing
});

// Append the clear button to the app
app.appendChild(clearButton);

// Optional: Add a listener for the 'drawing-changed' events
canvas.addEventListener('drawing-changed', (event) => {
  console.log('Changed:', event);
});