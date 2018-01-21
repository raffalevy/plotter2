import * as React from 'react';
import { Component } from 'react';

import * as mathjs from 'mathjs';

/**
 * Component for interactive text
 */

export class R extends Component {
    render() {
        return (
            <span style={{
                borderBottom: '1px dashed #999',
                color: '#9C27B0'
            }}>{this.props.children}</span>
        );
    }
}

/**
 * A form field for entering numbers
 */
export class NumericalControl extends React.Component<NumericalControlProps> {

    /**
     * The last string contained in the text box
     */
    private lastValue: string;

    constructor(props: NumericalControlProps) {
        super(props);
        this.lastValue = props.value.toString();
    }

    /**
     * Render the NumericalControl to the DOM
     */
    render() {

        let inputValue;

        // if (isNaN(this.props.value)) {
        //     inputValue = this.lastValue;
        // } else {
        //     inputValue = this.props.value;
        // }
        inputValue = this.lastValue;

        return (
            <input type='text' value={inputValue} onChange={this.onChange.bind(this)} />
        )
    }

    componentWillReceiveProps(nextProps: NumericalControlProps) {
        if (nextProps.value !== parseFloat(this.lastValue) && !(isNaN(nextProps.value) && isNaN(parseFloat(this.lastValue)))) {
            this.lastValue = nextProps.value.toString();
            this.forceUpdate();
        }
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

        // // Handle a trailing decimal point
        // if (value.charAt(value.length - 1) == '.') {
        //     this.props.onChange(NaN);
        //     return;
        // }

        // Check if the number could be parsed
        if (!isNaN(parsedValue)) {
            if (this.props.allowNegative == false && parsedValue < 0) {
                return;
            }
            this.props.onChange(parsedValue);
            // } else if (value == '') {
            //     this.props.onChange(NaN);
            // } else if (this.props.allowNegative != false && value == '-') {
            //     this.props.onChange(NaN);
            // }
        } else {
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

        // Get the current selected tool
        const sel = this.props.tool;

        return (
            <div>
                Tools:

                <button onClick={() => this.props.onToolChosen(Tool.Point)} className={sel == Tool.Point ? 'sel' : ''} style={{ marginLeft: '10px' }}>POINT</button>
                <button onClick={() => this.props.onToolChosen(Tool.Remove)} className={sel == Tool.Remove ? 'sel' : ''}>REMOVE</button>

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

/**
 * An input for functions
 */
export class FunctionInput extends Component<FunctionInputProps> {

    /**
     * Create a new FunctionInput component
     */
    constructor(props: FunctionInputProps) {
        super(props);

        this.onValueChange(props.value);
    }

    /**
     * Render the FunctionInput to the DOM
     */
    render() {
        return (
            <input type='text'
                value={this.props.value}
                onChange={(event) => {
                    // Get the value of the text input
                    const value = (event.target as HTMLInputElement).value;

                    this.onValueChange(value)
                }}
                placeholder={this.props.placeholder || ''} />
        )
    }

    /**
     * Called when the value of the text input is changed
     */
    onValueChange(value: string) {


        // Handle parsing and arithmetic errors
        try {
            // Parse the field value
            const compiled = mathjs.compile(value);

            // Test the function so errors can be caught
            compiled.eval({ x: 0 });

            // Return the function
            this.props.onFunctionChange((x) => {
                return compiled.eval({ x });
            }, value);
        } catch (e) {
            // If there's an error, don't return a function.
            this.props.onFunctionChange(null, value);
        }
    }
}

/**
 * Props for the FunctionInput
 */
export interface FunctionInputProps {

    /**
     * The value of the text input
     */
    value: string

    /**
     * Called when the function is changed
     */
    onFunctionChange: (func: (x: number) => number, value: string) => void

    /**
     * Placeholder text for the input
     */
    placeholder?: string;
}