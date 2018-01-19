import * as React from 'react';
import { Component } from 'react';

import { CoordinateSystem } from './CoordinateSystem';
import { Axes, Point, POINT_RADIUS, ParametricFunction, ParametricFunctionProps, Custom } from './PlotterComponents';

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
     * Render the plotter to the DOM
     */
    render() {
        const width = this.props.width || DEFAULT_WIDTH;
        const height = this.props.height || DEFAULT_HEIGHT;

        // Create an object holding the style for the canvas
        const canvasStyle: any = {
            width,
            height,
            cursor: 'none',
            backgroundColor: '#FFFFFF'
        };

        // Add a border to the style if border is set to true in the props
        if (this.props.border) {
            canvasStyle['border'] = '1px solid gray';
        }

        return <canvas
            ref={(canvasRef) => { this.canvas = canvasRef }}
            width={width * CANVAS_RESOLUTION_FACTOR}
            height={height * CANVAS_RESOLUTION_FACTOR}
            style={canvasStyle}
            onMouseMove={this.onMouseMove.bind(this)}
            onClick={this.onClick.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}>
            Canvas not supported.
        </canvas>
    }

    /**
     * Called when the component is mounted to the DOM
     */
    componentDidMount() {
        this.context = this.canvas.getContext('2d');

        this.draw();
    }

    /**
     * Called after the component is updated (i.e by changing props)
     */
    componentDidUpdate() {
        this.context = this.canvas.getContext('2d');

        this.draw();
    }

    /**
     * Called when the props are going to be changed
     * @param nextProps The new props
     */
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

        // Save the current drawing settings
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
                case ParametricFunction:
                    const pChild = (child as any) as ParametricFunction;
                    this_.drawParametricFunction(pChild.props);
                    break;
                case Custom:
                    const cChild = (child as any) as Custom;
                    cChild.props.draw(this.context, this.coordinateSystem);
            }
        });

        // Restore the saved drawing settings
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

    /**
     * Plots a point on the graph
     * @param x The x coordinate of the point
     * @param y The y coordinate of the point
     */
    plotPoint(x: number, y: number) {
        const ctx = this.context;
        const cs = this.coordinateSystem;

        ctx.beginPath();
        ctx.arc(cs.x(x), cs.y(y), POINT_RADIUS, 0, 2*Math.PI);
        ctx.fill();
    }

    /**
     * Plot a parametric function with the given properties.
     */
    drawParametricFunction(pProps : ParametricFunctionProps) {

        // Make sure the properties are valid
        if (pProps.stepSize == 0 || pProps.start >= pProps.end) {
            return;
        }

        const ctx = this.context;
        const cs = this.coordinateSystem;

        const func = pProps.func;

        ctx.beginPath();

        let t = pProps.start;

        ctx.moveTo(cs.x(func(t).x), cs.y(func(t).y));

        while (t < pProps.end) {
            ctx.lineTo(cs.x(func(t).x), cs.y(func(t).y));
            t = t + pProps.stepSize;
        }

        ctx.lineTo(cs.x(func(pProps.end).x), cs.y(func(pProps.end).y));
        ctx.stroke();
    }

    /**
     * Handle mouse move events
     * @param event The mouse move event
     */
    onMouseMove(event: MouseEvent) {
        const cs = this.coordinateSystem;
        
        if (this.props.onMouseMove) this.props.onMouseMove(cs.plotX(event.pageX - this.canvas.offsetLeft), cs.plotY(event.pageY - this.canvas.offsetTop), cs);
    }

    /**
     * Handle click events
     * @param event The click event
     */
    onClick(event: MouseEvent) {
        const cs = this.coordinateSystem;
        
        if (this.props.onClick) this.props.onClick(cs.plotX(event.pageX - this.canvas.offsetLeft), cs.plotY(event.pageY - this.canvas.offsetTop), cs);
    }

    /**
     * Handle when the mouse leaves the plotter
     * @param event The mouse event
     */
    onMouseLeave(event: MouseEvent) {
        if (this.props.onMouseLeave) this.props.onMouseLeave(this.coordinateSystem);
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

    /**
     * Called when the mouse is moved within the plotter. X and y are in plot coordinates.
     */
    onMouseMove?: (x : number, y: number, cs: CoordinateSystem) => void

    /**
     * Called when the user clicks within the plotter. X and y are in plot coordinates.
     */
    onClick?: (x: number, y: number, cs: CoordinateSystem) => void

    /**
     * Called when the mouse leaves the plotter.
     */
    onMouseLeave?: (cs: CoordinateSystem) => void
}

/**
 * Represents a point on the 2D plane
 */
export interface Point2D {
    /**
     * The x coordinate of the point
     */
    x: number

    /**
     * The y coordinate of the point
     */
    y: number
}