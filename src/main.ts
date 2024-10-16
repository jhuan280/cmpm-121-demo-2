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

// Function to start drawing
const startDrawing = (event: MouseEvent) => {
  isDrawing = true;
  context.beginPath();
  context.moveTo(event.offsetX, event.offsetY);
};

// Function to draw
const draw = (event: MouseEvent) => {
  if (!isDrawing) return;
  context.lineTo(event.offsetX, event.offsetY);
  context.stroke();
};

// Function to stop drawing
const stopDrawing = () => {
  isDrawing = false;
  context.closePath();
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
  context.clearRect(0, 0, canvas.width, canvas.height);
});

// Append the clear button to the app
app.appendChild(clearButton);