import "./style.css";

const APP_NAME = "Hello, I'm Jackie";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
