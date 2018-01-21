/**
 * Contains code for configuring and displaying vector fields
 */


import * as React from "react";
import { Component } from "react";
import { PlotterChild } from "../plotter/PlotterComponents";
import { CoordinateSystem } from "../plotter/CoordinateSystem";
import { pointCharge } from "./electric";

const css = require('./vectorFields.css');

const FIELD_DENSITY = 10;

/**
 * Represents a two-dimensional vector
 */
export class Vector2D {
    /**
     * The vector's x component
     */
    readonly x: number

    /**
     * The vector's y component
     */
    readonly y: number

    /**
     * Create a new Vector2D with the given components
     * 
     * @param x The vector's x component
     * @param y The vector's y component
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get the magnitude of this vector
     */
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * Multiply this vector by a scalar
     * @param n A scalar
     */
    times(n: number) {
        return new Vector2D(this.x * n, this.y * n);
    }

    /**
     * Add this vector to another vector
     * 
     * @param vector The vector to add this to
     */
    plus(vector: Vector2D) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
}

/**
 * Represents a field of two-dimensional vectors
 */
export type VectorField2D = (x: number, y: number) => Vector2D;
export namespace VectorField2D {
    export function multiply(field: VectorField2D, n: number): VectorField2D {
        return (x, y) => field(x, y).times(n);
    }

    export function add(fieldA: VectorField2D, fieldB: VectorField2D): VectorField2D {
        return (x, y) => fieldA(x, y).plus(fieldB(x, y));
    }
}

const VECTOR_FIELD_OPTIONS: { [index: string]: VectorField2D } = {
    'NONE': null,
    'UNIFORM FIELD': (x, y) => new Vector2D(1, 1),
    'ELECTRIC MONOPOLE': pointCharge(.5, .5, 1.2),
    'EQUAL ELECTRIC DIPOLE': VectorField2D.add(pointCharge(-1, .5, .6), pointCharge(2, -.1, -.6)),
    'UNEQUAL ELECTRIC DIPOLE': VectorField2D.add(pointCharge(-.8, .3, -.5), pointCharge(2, -.1, 1.1)),
    'CIRCULAR FIELD': (x, y) => new Vector2D(y, -x)
}

/**
 * A component for selecting a vector field to display
 */
export class VectorFieldSelector extends Component<VectorFieldSelectorProps> {

    constructor(props: VectorFieldSelectorProps) {
        super(props);

        const selected = (VECTOR_FIELD_OPTIONS[props.selected] !== undefined) ? props.selected : 'NONE';
        props.onSelect(selected, VECTOR_FIELD_OPTIONS[selected]);
    }

    render() {

        const selected = (VECTOR_FIELD_OPTIONS[this.props.selected] !== undefined) ? this.props.selected : 'NONE';

        return (
            <div>
                <ul className={css.selectorList}>
                    {Object.keys(VECTOR_FIELD_OPTIONS).map((option) => {
                        let className: string;
                        if (option === selected) {
                            className = css.selectorItem + ' ' + css.selectedItem;
                        } else {
                            className = css.selectorItem;
                        }
                        return <li key={option} className={className} onClick={() => this.props.onSelect(option, VECTOR_FIELD_OPTIONS[option])} >{option}</li>
                    })}
                </ul>
            </div>
        )
    }
}

/**
 * Props for the VectorFieldSelector component
 */
export interface VectorFieldSelectorProps {
    /**
     * Which option from the selector is selected
     */
    selected: string

    /**
     * Called when an option is selected
     */
    onSelect: (selectedOption: string, vectorField: VectorField2D) => void
}

/**
 * Draw the given vector at the given coordinates
 */
function drawVector(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, vector: Vector2D, x: number, y: number, lengthFactor: number) {
    const scaled = lengthFactor ? vector.times(1 / lengthFactor) : vector.times(FIELD_DENSITY / vector.magnitude() / cs.unit);

    ctx.beginPath();

    ctx.moveTo(cs.x(x), cs.y(y));
    ctx.lineTo(cs.x(x + scaled.x), cs.y(y + scaled.y));

    ctx.stroke();
}

/**
 * Renders a vector field when placed within a Plotter component.
 */
export class VectorField extends PlotterChild<VectorFieldProps> {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number): void {
        const field = this.props.field;

        for (let screenX = 0; screenX < width; screenX = screenX + FIELD_DENSITY) {
            for (let screenY = 0; screenY < height; screenY = screenY + FIELD_DENSITY) {
                const x = cs.plotX(screenX);
                const y = cs.plotY(screenY);

                drawVector(ctx, cs, field(x, y), x, y, this.props.lengthFactor);
            }
        }
    }
}

/**
 * Props for the VectorField component
 */
export interface VectorFieldProps {
    field: VectorField2D
    lengthFactor: number;
}