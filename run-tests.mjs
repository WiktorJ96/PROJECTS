import Jasmine from "jasmine";
import { fileURLToPath } from "url";
import path from "path";

// Create a new Jasmine instance
const jasmine = new Jasmine();

// Ustaw konfigurację dla Jasmine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżka do pliku jasmine.json
const jasmineConfigPath = path.resolve(
  __dirname,
  "./spec/support/jasmine.json"
);

// Load the Jasmine configuration
jasmine.loadConfigFile(jasmineConfigPath);

// Run all tests
jasmine.execute();
