import * as React from 'react';
import { Component } from 'react';

export class NumericalControl extends React.Component<NumericalControlProps> {

    lastValue: string = '';

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

    onChange(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.lastValue = value;
        const parsedValue = parseFloat(value);

        if (value.charAt(value.length - 1) == '.') {
            this.props.onChange(NaN);
            return;
        }

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

export interface NumericalControlProps {
    value: number
    onChange: (value: number) => void
    allowNegative?: boolean
}

export class ToolSelector extends Component<ToolSelectorProps> {
    render() {

        const selectedStyle = {
            border: '2px solid red'
        }

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

export interface ToolSelectorProps {
    onToolChosen: (tool: Tool) => void
    tool: Tool
}

export enum Tool {
    Point,
    Remove
}