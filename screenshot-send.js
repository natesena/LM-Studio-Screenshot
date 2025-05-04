const screenshot = require("screenshot-desktop");
const axios = require("axios");
const yargs = require("yargs");

const argv = yargs
  .option("list", { type: "boolean", describe: "List available windows" })
  .option("window", { type: "string", describe: "Window title to capture" })
  .option("model", {
    type: "string",
    default: "gemma-3-4b-it-qat",
    describe: "Model name for LLM",
  })
  .option("max_tokens", {
    type: "number",
    default: 50,
    describe: "Max tokens for LLM response",
  })
  .option("temperature", {
    type: "number",
    default: 0.7,
    describe: "Temperature for LLM response",
  })
  .help().argv;

async function main() {
  if (argv.list) {
    const sources = await screenshot.listWindows();
    sources.forEach((w, i) => {
      console.log(`[${i}] ${w.name}`);
    });
    return;
  }

  let opts = {};
  if (argv.window) {
    const sources = await screenshot.listWindows();
    const win = sources.find((w) => w.name.includes(argv.window));
    if (!win) {
      console.error("Window not found:", argv.window);
      process.exit(1);
    }
    opts = { screen: win.id };
  }

  try {
    const img = await screenshot(opts);
    const imgBase64 = img.toString("base64");
    const payload = {
      model: argv.model,
      prompt: imgBase64,
      max_tokens: argv.max_tokens,
      temperature: argv.temperature,
    };
    const response = await axios.post(
      "http://localhost:1234/v1/completions",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("LLM response:", response.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err);
  }
}

main();
