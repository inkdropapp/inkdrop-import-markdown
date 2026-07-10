"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEnv = setEnv;
exports.getEnv = getEnv;
/**
 * Captures the `Environment` instance handed to `activate()` so the plugin's
 * other modules can reach it without touching the (discouraged) global
 * `inkdrop` variable.
 */
let captured;
function setEnv(env) {
    captured = env;
}
function getEnv() {
    if (!captured) {
        throw new Error('import-markdown: env accessed before activate()');
    }
    return captured;
}
