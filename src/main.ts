import "./style.css";

const APP_NAME = "Jackie's Art Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Define a Point class
class Point {
  constructor(public x: number, public y: number) {}
}

// Define a Path class
class Path {
  protected points: Point[];  

  constructor() {
    this.points = [];
  }

  addPoint(x: number, y: number) {
    this.points.push(new Point(x, y));
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
}

// Define a MarkerLine class that extends Path
class MarkerLine extends Path {
  constructor(initialX: number, initialY: number) {
    super();
    this.addPoint(initialX, initialY);
  }

  drag(x: number, y: number) {
    this.addPoint(x, y);
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
const paths: Array<Path> = [];
const redoStack: Array<Path> = [];
let currentPath: MarkerLine | null = null;  // Change the type to MarkerLine

const startDrawing = (event: MouseEvent) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  currentPath = new MarkerLine(event.clientX - rect.left, event.clientY - rect.top);
  paths.push(currentPath);
  redoStack.length = 0; 
};

const draw = (event: MouseEvent) => {
  if (isDrawing && currentPath) {
    const rect = canvas.getBoundingClientRect();
    currentPath.drag(event.clientX - rect.left, event.clientY - rect.top);
    redrawCanvas();
  }
};

const stopDrawing = () => {
  isDrawing = false;
};

const redrawCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(path => path.display(context));
};

// Add event listeners to the canvas
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

//-------------------------Buttons-------------------------

const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  paths.length = 0;
  redoStack.length = 0;
  redrawCanvas();
});
buttonContainer.appendChild(clearButton);

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

container.appendChild(buttonContainer);
app.appendChild(container);