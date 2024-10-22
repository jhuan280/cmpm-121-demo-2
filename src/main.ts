import "./style.css";

const APP_NAME = "Jackie's Art Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;
let stickersData = [
  { emoji: "😀", label: "Smiley" },
  { emoji: "🎨", label: "Palette" },
  { emoji: "🌟", label: "Star" },
];

// Random color generator
function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Define the classes for Point, MarkerLine, and StickerPath
class Point {
  constructor(public x: number, public y: number) {}
}

class MarkerLine {
  private points: Point[];
  private lineWidth: number;
  private color: string;

  constructor(initialX: number, initialY: number, lineWidth: number, color: string) {
    this.points = [];
    this.lineWidth = lineWidth;
    this.color = color;
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
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach((point) => {
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
  private color: string;

  constructor(lineWidth: number, color: string) {
    this.x = 0;
    this.y = 0;
    this.lineWidth = lineWidth;
    this.color = color;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setLineWidth(lineWidth: number) {
    this.lineWidth = lineWidth;
  }

  setColor(color: string) {
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.lineWidth, 0, Math.PI * 2); // Use lineWidth for circle size
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color + "66"; // Semi-transparent to maintain clarity
    ctx.fill();
    ctx.stroke();
  }
}

class StickerPreview {
  private x: number = 0;
  private y: number = 0;
  private sticker: string = "";
  private rotation: number = 0; // Rotation for sticker preview

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

  setRotation(rotation: number) {
    this.rotation = rotation;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.sticker) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.font = "30px Arial";
      ctx.fillText(this.sticker, 0, 0);
      ctx.restore();
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
let currentColor = "#000000"; // Default to black
const paths: Array<MarkerLine | StickerPath> = [];
const redoStack: Array<MarkerLine | StickerPath> = [];
let currentPath: MarkerLine | null = null;
let toolPreview: ToolPreview | null = new ToolPreview(currentLineWidth, currentColor);
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
    currentPath = new MarkerLine(x, y, currentLineWidth, currentColor);
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
  paths.forEach((path) => path.display(context));

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

const regularButtonContainer = document.createElement("div");
regularButtonContainer.className = "regular-button-container";

const colorButtonContainer = document.createElement("div");
colorButtonContainer.className = "color-button-container";

const stickerButtonContainer = document.createElement("div");
stickerButtonContainer.className = "sticker-button-container";

// Fixed color label
const fixedColorLabel = document.createElement("span");
fixedColorLabel.textContent = "Fixed Color: ";
colorButtonContainer.appendChild(fixedColorLabel);

// Add all buttons to their respective containers

// Clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  paths.length = 0;
  redoStack.length = 0;
  redrawCanvas();
});
regularButtonContainer.appendChild(clearButton);

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
regularButtonContainer.appendChild(undoButton);

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
regularButtonContainer.appendChild(redoButton);

// Thin marker button
const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
  currentLineWidth = 1; // Set thin line width
  currentColor = getRandomColor(); // Randomize color
  toolPreview = new ToolPreview(currentLineWidth, currentColor);
  stickerPreview = null;
  activeSticker = null;
  updateSelectedTool(thinMarkerButton);
  redrawCanvas();
});
regularButtonContainer.appendChild(thinMarkerButton);

// Thick marker button
const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  currentLineWidth = 5; // Set thick line width
  currentColor = getRandomColor(); // Randomize color
  toolPreview = new ToolPreview(currentLineWidth, currentColor);
  stickerPreview = null;
  activeSticker = null;
  updateSelectedTool(thickMarkerButton);
  redrawCanvas();
});
regularButtonContainer.appendChild(thickMarkerButton);

// Custom sticker button
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Custom Sticker";
customStickerButton.addEventListener("click", () => {
  let customSticker = prompt("Paste your emoji here:");
  if (customSticker) {
    activeSticker = customSticker;
    stickersData.push({ emoji: customSticker, label: `Custom: ${customSticker}` });
    createStickerButtons();
    stickerPreview = new StickerPreview(customSticker);
    stickerPreview.setRotation(0); // Fix rotation to 0 for sticker preview
    toolPreview = null;
    updateSelectedTool(customStickerButton);
  }
});
regularButtonContainer.appendChild(customStickerButton);

// Export button
const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d")!;

  exportContext.scale(4, 4);
  paths.forEach(path => path.display(exportContext));

  const dataURL = exportCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'artwork.png';
  link.click();
});
regularButtonContainer.appendChild(exportButton);

// Color buttons
const colorOptions = {
  Black: "#000000",
  Red: "#ff0000",
  Blue: "#0000ff",
  Green: "#008000"
};

Object.entries(colorOptions).forEach(([colorName, hex]) => {
  const colorButton = document.createElement("button");
  colorButton.textContent = colorName;
  colorButton.addEventListener("click", () => {
    currentColor = hex; // Set to specified color
    toolPreview?.setColor(currentColor); // Update the preview color
    updateSelectedTool(colorButton);
  });
  colorButtonContainer.appendChild(colorButton);
});

// Append button containers to the main button container
buttonContainer.appendChild(regularButtonContainer);
buttonContainer.appendChild(colorButtonContainer);
buttonContainer.appendChild(stickerButtonContainer);

// Function to create sticker buttons in 'stickerButtonContainer'
function createStickerButtons() {
  // Clear previous sticker buttons
  stickerButtonContainer.innerHTML = '';

  // Create new sticker buttons
  stickersData.forEach(({ emoji, label }) => {
    const stickerButton = document.createElement("button");
    stickerButton.className = "stickerButton";
    stickerButton.textContent = emoji;
    stickerButton.setAttribute("aria-label", label);
    stickerButton.addEventListener("click", () => {
      activeSticker = emoji;
      stickerPreview = new StickerPreview(emoji);
      stickerPreview.setRotation(0); // Ensure rotation is set to 0
      toolPreview = null;
      updateSelectedTool(stickerButton);
    });
    stickerButtonContainer.appendChild(stickerButton);
  });
}

// Function to update button styles and cursor visibility
const updateSelectedTool = (selectedButton: HTMLButtonElement) => {
  const buttons = buttonContainer.querySelectorAll("button");
  buttons.forEach((button) => button.classList.remove("selectedTool"));
  selectedButton.classList.add("selectedTool");
  canvas.classList.add("hide-cursor");
};

// Initially set the thin marker as selected
updateSelectedTool(thinMarkerButton);

// Create initial sticker buttons
createStickerButtons();

container.appendChild(buttonContainer);
app.appendChild(container);