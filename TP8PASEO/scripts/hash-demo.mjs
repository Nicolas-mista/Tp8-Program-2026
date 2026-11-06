import { assignVariant } from "../lib/experiment.ts";

const id = "lab-visitor-demo-01";
const runs = Array.from({ length: 5 }, () => assignVariant(id));
const stable = new Set(runs).size === 1;

console.log(`Identificador: ${id}`);
console.log(`Variantes:     ${runs.join(", ")}`);
console.log(`Estable:       ${stable ? "sí" : "no"}`);

if (!stable) process.exit(1);
