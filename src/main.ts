import "./style.css";

const APP_NAME = "Hello, I'm Jackie";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Create an h1 element for the title
const title = document.createElement("h1");
title.textContent = APP_NAME;

// Append the h1 element to the app
app.appendChild(title);

// Update the document title
document.title = APP_NAME;

// Create a canvas element
const canvas = document.createElement("canvas");

// Set the size of the canvas
canvas.width = 256;
canvas.height = 256;

// Optionally, add some border or style to the canvas for visibility (CSS in style.css may be better)
canvas.style.border = "1px solid #000";

// Append the canvas to the app
app.appendChild(canvas);