import * as React from 'react';
import { Component } from 'react';

/**
 * A form field for entering numbers
 */
export class NumericalControl extends React.Component<NumericalControlProps> {

    /**
     * The last string contained in the text box
     */
    private lastValue: string = '';

    /**
     * Render the NumericalControl to the DOM
     */
    render() {

        let inputValue;

        if (isNaN(this.props.value)) {
            inputValue = this.lastValue;
        } else {
            inputValue = this.props.value;
        }

        return (
            <input type='text' value={inputValue} onChange={this.onChange.bind(this)} />
        )
    }

    /**
     * Handle input events to the text box
     * @param event The input event
     */
    onChange(event: Event) {
        // Get the value of the text input
        const value = (event.target as HTMLInputElement).value

        // Update the stored last value
        this.lastValue = value;

        // Parse the value as a number
        const parsedValue = parseFloat(value);

        // Handle a trailing decimal point
        if (value.charAt(value.length - 1) == '.') {
            this.props.onChange(NaN);
            return;
        }

        // Check if the number could be parsed
        if (!isNaN(parsedValue)) {
            if (this.props.allowNegative == false && parsedValue < 0) {
                return;
            }
            this.props.onChange(parsedValue);
        } else if (value == '') {
            this.props.onChange(NaN);
        } else if (this.props.allowNegative != false && value == '-') {
            this.props.onChange(NaN);
        }

    }
}

/**
 * Props for the NumericalControl component
 */
export interface NumericalControlProps {
    /**
     * The value of the input
     */
    value: number

    /**
     * Called when the input value is changed
     */
    onChange: (value: number) => void

    /**
     * Whether to allow negative values
     */
    allowNegative?: boolean
}

/**
 * A component for selecting a tool for the Plotter
 */
export class ToolSelector extends Component<ToolSelectorProps> {

    /**
     * Render the ToolSelector to the DOM
     */
    render() {

        // Style for the selected tool button
        const selectedStyle = {
            border: '2px solid red'
        }

        // Get the current selected tool
        const sel = this.props.tool;

        return (
            <div>
                <p>Tools:</p>
                <p>
                    <button onClick={() => this.props.onToolChosen(Tool.Point)} style={sel == Tool.Point ? selectedStyle : {}}>Point</button>
                    <button onClick={() => this.props.onToolChosen(Tool.Remove)} style={sel == Tool.Remove ? selectedStyle : {}}>Remove</button>
                </p>
            </div>
        )
    }
}

/**
 * Props for the ToolSelector component
 */
export interface ToolSelectorProps {
    /**
     * Called when a tool is selected
     */
    onToolChosen: (tool: Tool) => void

    /**
     * The current selected tool
     */
    tool: Tool
}

/**
 * Represents a selectable tool
 */
export enum Tool {
    Point,
    Remove
}