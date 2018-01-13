import {index} from './index';

const LOG_ENABLED = true;

/**
 * Log a message to the console if logging is enabled
 * @param message The message to log
 */
export function log(message: string) {
    if (LOG_ENABLED) {
        console.log(message);
    }
}

/**
 * Add scripts to the global window object
 */
(window as any).plotter2 = {
    index
};