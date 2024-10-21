import "./style.css";

// Map of words to emojis
const emojiMap: { [key: string]: string } = {
  chicken: "🐔",
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰", // Changed "star" to "rabbit"
};

const APP_NAME = "Jackie's Art Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;
let stickersData = [
  { emoji: "😀", label: "Smiley" },
  { emoji: "🎨", label: "Palette" },
  { emoji: "🌟", label: "Star" },
];

// Define the classes for Point, MarkerLine, and StickerPath

class Point {
  constructor(public x: number, public y: number) {}
}

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

    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
}

class StickerPath {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

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
    ctx.strokeStyle = "#888";
    ctx.fillStyle = "rgba(136, 136, 136, 0.3)";
    ctx.fill();
    ctx.stroke();
  }
}

class StickerPreview {
  private x: number = 0;
  private y: number = 0;
  private sticker: string = "";

  constructor(sticker: string) {
    this.sticker = sticker;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setSticker(sticker: string) {
    this.sticker = sticker;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.sticker) {
      ctx.font = "30px Arial";
      ctx.fillText(this.sticker, this.x, this.y);
    }
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
canvas.classList.add("hide-cursor");
canvas.width = 256;
canvas.height = 256;
container.appendChild(canvas);

//-------------------------Drawing with mouse -------------------------

const context = canvas.getContext("2d")!;
let isDrawing = false;
let currentLineWidth = 1;
const paths: Array<MarkerLine | StickerPath> = [];
const redoStack: Array<MarkerLine | StickerPath> = [];
let currentPath: MarkerLine | null = null;
let toolPreview: ToolPreview | null = new ToolPreview(currentLineWidth);
let stickerPreview: StickerPreview | null = null;
let activeSticker: string | null = null;

const startDrawing = (event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (activeSticker) {
    const stickerPath = new StickerPath(x, y, activeSticker);
    paths.push(stickerPath);
  } else {
    isDrawing = true;
    currentPath = new MarkerLine(x, y, currentLineWidth);
    paths.push(currentPath);
    redoStack.length = 0;
  }
  redrawCanvas();
};

const draw = (event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (!isDrawing && toolPreview) {
    toolPreview.update(x, y);
  }

  if (!isDrawing && stickerPreview) {
    stickerPreview.update(x, y);
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

  if (!isDrawing && toolPreview) {
    toolPreview.draw(context);
  }

  if (!isDrawing && stickerPreview) {
    stickerPreview.draw(context);
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

// Function to update button styles and cursor visibility
const updateSelectedTool = (selectedButton: HTMLButtonElement) => {
  const buttons = buttonContainer.querySelectorAll("button");
  buttons.forEach(button => button.classList.remove("selectedTool"));
  selectedButton.classList.add("selectedTool");
  canvas.classList.add("hide-cursor");
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
  currentLineWidth = 1;
  toolPreview = new ToolPreview(currentLineWidth);
  stickerPreview = null;
  activeSticker = null;
  updateSelectedTool(thinMarkerButton);
  redrawCanvas();
});
buttonContainer.appendChild(thinMarkerButton);

// Thick marker button
const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  currentLineWidth = 5;
  toolPreview = new ToolPreview(currentLineWidth);
  stickerPreview = null;
  activeSticker = null;
  updateSelectedTool(thickMarkerButton);
  redrawCanvas();
});
buttonContainer.appendChild(thickMarkerButton);

// Dynamic sticker button creation
function createStickerButtons() {
  // Remove existing sticker buttons
  const existingStickerButtons = buttonContainer.querySelectorAll(".stickerButton");
  existingStickerButtons.forEach(button => buttonContainer.removeChild(button));

  // Create new sticker buttons
  stickersData.forEach(({ emoji, label }) => {
    const stickerButton = document.createElement("button");
    stickerButton.className = "stickerButton";
    stickerButton.textContent = emoji;
    stickerButton.setAttribute("aria-label", label);
    stickerButton.addEventListener("click", () => {
      stickerPreview = new StickerPreview(emoji);
      toolPreview = null;
      activeSticker = emoji;
      updateSelectedTool(stickerButton);
    });
    buttonContainer.appendChild(stickerButton);
  });
}

// Custom sticker button
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";
customStickerButton.addEventListener("click", () => {
  let customSticker = prompt("Enter your custom word:");
  if (customSticker) {
    // Convert the custom sticker to an emoji if available
    const emoji = emojiMap[customSticker] ?? customSticker; // Default to text if no emoji is found
    stickersData.push({ emoji, label: `Custom: ${customSticker}` });
    createStickerButtons(); // Regenerate buttons including the new custom sticker
    stickerPreview = new StickerPreview(emoji);
    toolPreview = null;
    activeSticker = emoji;
    updateSelectedTool(customStickerButton);
  }
});
buttonContainer.appendChild(customStickerButton);

// Initially set the thin marker as selected
updateSelectedTool(thinMarkerButton);

// Create initial sticker buttons
createStickerButtons();

container.appendChild(buttonContainer);
app.appendChild(container);