import * as React from 'react';
import { Component } from 'react';

import { CoordinateSystem } from './CoordinateSystem';
import { Axes, Point, POINT_RADIUS, ParametricFunction, ParametricFunctionProps, Custom, PlotterChild } from './PlotterComponents';
import * as PlotterComponents from './PlotterComponents';

import * as PropTypes from 'prop-types';

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
        this.coordinateSystem = CoordinateSystem.centeredCoordinateSystem(props.centerX, props.centerY, props.width || DEFAULT_WIDTH, props.height || DEFAULT_HEIGHT, props.unit || DEFAULT_UNIT);
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
            backgroundColor: '#FFFFFF'
        };

        return <canvas
            ref={(canvasRef) => { this.canvas = canvasRef }}
            width={width * CANVAS_RESOLUTION_FACTOR}
            height={height * CANVAS_RESOLUTION_FACTOR}
            style={canvasStyle}
            onMouseMove={this.onMouseMove.bind(this)}
            onClick={this.onClick.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}>
            Canvas not supported.
        {this.props.children}</canvas>
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
            || nextProps.unit != this.props.unit
            || nextProps.centerX != this.props.centerX
            || nextProps.centerY != this.props.centerY) {
            this.coordinateSystem = CoordinateSystem.centeredCoordinateSystem(nextProps.centerX, nextProps.centerY, nextProps.width || DEFAULT_WIDTH, nextProps.height || DEFAULT_HEIGHT, nextProps.unit || DEFAULT_UNIT);
        }
        this.plotterChildren = []
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

        this.plotterChildren.forEach(child => {
            child.draw(ctx, cs, this.props.width || DEFAULT_WIDTH, this.props.height || DEFAULT_HEIGHT);
        });

        // Restore the saved drawing settings
        ctx.restore();
    }

    /**
     * Handle mouse move events
     * @param event The mouse move event
     */
    onMouseMove(event: MouseEvent) {
        const cs = this.coordinateSystem;

        if (this.props.onMouseMove) this.props.onMouseMove(cs.plotX(event.clientX - this.canvas.getBoundingClientRect().left), cs.plotY(event.clientY - this.canvas.getBoundingClientRect().top), cs);
    }

    /**
     * Handle click events
     * @param event The click event
     */
    onClick(event: MouseEvent) {
        const cs = this.coordinateSystem;

        if (this.props.onClick) this.props.onClick(cs.plotX(event.clientX - this.canvas.getBoundingClientRect().left), cs.plotY(event.clientY - this.canvas.getBoundingClientRect().top), cs);
    }

    /**
     * Handle when the mouse leaves the plotter
     * @param event The mouse event
     */
    onMouseLeave(event: MouseEvent) {
        if (this.props.onMouseLeave) this.props.onMouseLeave(this.coordinateSystem);
    }

    /**
     * The registered children to be drawn
     */
    plotterChildren: PlotterChild[] = [];

    getChildContext() {
        return ({
            registerPlotterChild: (child: PlotterChild) => {
                this.plotterChildren.push(child);
            }
        });
    }

    static childContextTypes = {
        registerPlotterChild: PropTypes.func
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
     * The X coordinate of the point to be centered in the plotter
     */
    centerX?: number

    /**
     * The Y coordinate of the point to be centered in the plotter
     */
    centerY?: number


    /**
     * Called when the mouse is moved within the plotter. X and y are in plot coordinates.
     */
    onMouseMove?: (x: number, y: number, cs: CoordinateSystem) => void

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

export namespace Point2D {
    /**
     * Calculate the distance between two points
     */
    export function distance(a: Point2D, b: Point2D) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
}