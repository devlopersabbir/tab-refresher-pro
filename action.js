import { simpleGit } from "simple-git";
import fs from "fs";

// Get input from command line arguments
const filePath = `./${process.argv[2]}`; // 1st argument
const commitMessage = process.argv[3]; // 2nd argument
const date = process.argv[4]; // 3rd argument

// Ensure inputs are provided
if (!filePath || !commitMessage || !date) {
  console.error("Error: Please provide file path, commit message, and date.");
  process.exit(1);
}

// Validate file existence
if (!fs.existsSync(filePath)) {
  console.error(`Error: File '${filePath}' does not exist.`);
  process.exit(1);
}

const git = simpleGit();

// Execute Git commands
git
  .add([filePath])
  .commit(commitMessage, { "--date": date })
  .push()
  .then(() => {
    console.log("Changes pushed successfully!");
  })
  .catch((err) => {
    console.error("Error during Git operation:", err.message);
    process.exit(1);
  });
