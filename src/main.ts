import "./style.css";

const APP_NAME = "Jackie's Art Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Define a Point class
class Point {
  constructor(public x: number, public y: number) {}
}

// Define a MarkerLine class that includes line styling
class MarkerLine {
  private points: Point[];
  private lineWidth: number;

  constructor(initialX: number, initialY: number, lineWidth: number) {
    this.points = [];
    this.lineWidth = lineWidth;
    this.addPoint(initialX, initialY);
  }

  addPoint(x: number, y: number) {
    this.points.push(new Point(x, y));
  }

  drag(x: number, y: number) {
    this.addPoint(x, y);
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    ctx.lineWidth = this.lineWidth; // Set line width
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
}

// Define a ToolPreview class
class ToolPreview {
  private x: number;
  private y: number;
  private lineWidth: number;

  constructor(lineWidth: number) {
    this.x = 0;
    this.y = 0;
    this.lineWidth = lineWidth;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setLineWidth(lineWidth: number) {
    this.lineWidth = lineWidth;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.lineWidth / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#888"; // Tool preview color
    ctx.fillStyle = "rgba(136, 136, 136, 0.3)";
    ctx.fill();
    ctx.stroke();
  }
}

//-------------------------Title-------------------------

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);
document.title = APP_NAME;

//-------------------------Canvas-------------------------

const container = document.createElement("div");
container.className = "canvas-container";

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
container.appendChild(canvas);

//-------------------------Drawing with mouse -------------------------

const context = canvas.getContext("2d")!;
let isDrawing = false;
let currentLineWidth = 1; // State variable for line width
const paths: Array<MarkerLine> = [];
const redoStack: Array<MarkerLine> = [];
let currentPath: MarkerLine | null = null;
let toolPreview: ToolPreview = new ToolPreview(currentLineWidth);

const startDrawing = (event: MouseEvent) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  currentPath = new MarkerLine(x, y, currentLineWidth);
  paths.push(currentPath);
  redoStack.length = 0;
};

const draw = (event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!isDrawing && toolPreview) {
    toolPreview.update(x, y);
  }

  if (isDrawing && currentPath) {
    currentPath.drag(x, y);
  }
  
  redrawCanvas();
};

const stopDrawing = () => {
  isDrawing = false;
};

const redrawCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(path => path.display(context));

  // Draw tool preview if available
  if (!isDrawing && toolPreview) {
    toolPreview.draw(context);
  }
};

// Add event listeners to the canvas
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

//-------------------------Buttons-------------------------

const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";

// Function to update button styles
const updateSelectedTool = (selectedButton: HTMLButtonElement) => {
  const buttons = buttonContainer.querySelectorAll("button");
  buttons.forEach(button => button.classList.remove("selectedTool"));
  selectedButton.classList.add("selectedTool");
};

// Clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  paths.length = 0;
  redoStack.length = 0;
  redrawCanvas();
});
buttonContainer.appendChild(clearButton);

// Undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  if (paths.length > 0) {
    const lastPath = paths.pop();
    if (lastPath) redoStack.push(lastPath);
    redrawCanvas();
  }
});
buttonContainer.appendChild(undoButton);

// Redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const pathToRedo = redoStack.pop();
    if (pathToRedo) paths.push(pathToRedo);
    redrawCanvas();
  }
});
buttonContainer.appendChild(redoButton);

// Thin marker button
const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
  currentLineWidth = 1; // Set line width for thin marker
  toolPreview.setLineWidth(currentLineWidth); // Update tool preview
  updateSelectedTool(thinMarkerButton); // Update UI feedback
});
buttonContainer.appendChild(thinMarkerButton);

// Thick marker button
const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  currentLineWidth = 5; // Set line width for thick marker
  toolPreview.setLineWidth(currentLineWidth); // Update tool preview
  updateSelectedTool(thickMarkerButton); // Update UI feedback
});
buttonContainer.appendChild(thickMarkerButton);

// Initially set the thin marker as selected
updateSelectedTool(thinMarkerButton);

container.appendChild(buttonContainer);
app.appendChild(container);