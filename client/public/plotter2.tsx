import * as React from 'react';
import { Component } from 'react';

import { index } from './index';

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
 * Component for interactive text (simply applies the .reactive class)
 */

export class R extends Component {
    render() {
        return (
            <span style={{
                borderBottom: '1px dashed #999',
                color: '#0000FF'
            }}>{this.props.children}</span>
        );
    }
}

// Add scripts to the global window object
(window as any).plotter2 = {
    index
};