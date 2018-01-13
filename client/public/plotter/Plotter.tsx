import * as React from 'react';
import { Component } from 'react';

import { CoordinateSystem } from './CoordinateSystem';
import { Axes, Point, POINT_RADIUS } from './PlotterComponents';

/**
 * The default plotter width
 */
const DEFAULT_WIDTH = 700;

/**
 * The default plotter height
 */
const DEFAULT_HEIGHT = 430;

/**
 * The default coordinate system unit
 */
const DEFAULT_UNIT = 20;

/**
 * Whether axes are displayed by default
 */
const DEFAULT_AXES = true;

/**
 * Determines the canvas's resolution
 */
const CANVAS_RESOLUTION_FACTOR = 4;

/**
 * Plotting component
 */
export class Plotter extends Component<PlotterProps> {

    /**
     * A reference to the canvas element on which the plot is drawn
     */
    canvas: HTMLCanvasElement = null;

    /**
     * The canvas drawing context
     */
    context: CanvasRenderingContext2D = null;

    /**
     * The coordinate system of this plotter.
     */
    coordinateSystem: CoordinateSystem;

    constructor(props: PlotterProps) {
        super(props);
        this.coordinateSystem = CoordinateSystem.centeredCoordinateSystem(props.width || DEFAULT_WIDTH, props.height || DEFAULT_HEIGHT, props.unit || DEFAULT_UNIT);
    }

    /**
     * Render the plotter
     */
    render() {
        const width = this.props.width || DEFAULT_WIDTH;
        const height = this.props.height || DEFAULT_HEIGHT;

        // Create an object holding the style for the canvas
        const canvasStyle: any = {
            width,
            height
        };

        // Add a border to the style if border is set to true in the props
        if (this.props.border) {
            canvasStyle['border'] = '1px solid gray';
        }

        return <canvas
            ref={(canvasRef) => { this.canvas = canvasRef }}
            width={width * CANVAS_RESOLUTION_FACTOR}
            height={height * CANVAS_RESOLUTION_FACTOR}
            style={canvasStyle}>
            Canvas not supported.
        </canvas>
    }

    componentDidMount() {
        this.context = this.canvas.getContext('2d');

        this.draw();
    }

    componentDidUpdate() {
        this.context = this.canvas.getContext('2d');

        this.draw();
    }

    componentWillReceiveProps(nextProps: PlotterProps) {
        if (nextProps.width != this.props.width
            || nextProps.height != this.props.height
            || nextProps.unit != this.props.unit) {
            this.coordinateSystem = CoordinateSystem.centeredCoordinateSystem(nextProps.width || DEFAULT_WIDTH, nextProps.height || DEFAULT_HEIGHT, nextProps.unit || DEFAULT_UNIT);
        }
    }

    /**
     * Draw on the canvas
     */
    draw() {
        const ctx = this.context;
        const cs = this.coordinateSystem;

        ctx.save();

        // Scale the rendering context according to the resolution
        ctx.scale(CANVAS_RESOLUTION_FACTOR, CANVAS_RESOLUTION_FACTOR);

        // Clear the canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const this_ = this;

        // Render each of this component's children, if they are supported sub-components.
        React.Children.forEach(this.props.children, (child) => {
            switch ((child as any).type) {
                case Axes:
                    this_.drawAxes();
                    break;
                case Point:
                    const pointChild = (child as any) as Point;
                    this_.plotPoint(pointChild.props.x, pointChild.props.y);
                    break;
            }
        });

        ctx.restore();
    }

    /**
     * Draw the plot's axes
     */
    drawAxes() {
        const ctx = this.context;
        const cs = this.coordinateSystem;

        // Save the current drawing settings
        ctx.save();

        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 1.5;

        // Draw the x axis
        ctx.beginPath();
        ctx.moveTo(0, cs.y(0));
        ctx.lineTo(this.props.width || DEFAULT_WIDTH, cs.y(0));
        ctx.stroke();

        // Draw the y axis
        ctx.beginPath();
        ctx.moveTo(cs.x(0), 0);
        ctx.lineTo(cs.x(0), this.props.height || DEFAULT_HEIGHT);
        ctx.stroke();

        // Restore the drawing settings
        ctx.restore();
    }

    plotPoint(x: number, y: number) {
        const ctx = this.context;
        const cs = this.coordinateSystem;

        ctx.beginPath();
        ctx.arc(cs.x(x), cs.y(y), POINT_RADIUS, 0, 2*Math.PI);
        ctx.fill();
    }
}

/**
 * Properties for the plotter component
 */
export interface PlotterProps {
    /**
     * The width, in pixels, of the plotter
     */
    width?: number

    /**
     * The height, in pixels, of the plotter
     */
    height?: number

    /**
     * The coordinate system's unit
     */
    unit?: number

    /**
     * Whether a border should be visible
     */
    border?: boolean
}