import { main } from "./injector.js";

// call inject funciton to inject content script
setTimeout(() => {
  console.log("injected");
  main();
}, 2000);
