/**
 * This module contains components meant to be placed within a Plotter component.
 * They will not be rendered if not placed within a Plotter.
 */

import * as React from 'react';
import { Component, ReactNode, Fragment } from 'react';

import { CoordinateSystem } from './CoordinateSystem';
import { Point2D } from './Plotter';

import * as PropTypes from 'prop-types';

/**
 * The radius, in pixels, of plotted points
 */
export const POINT_RADIUS = 5;

/**
 * A component which can be placed within a Plotter to render it on the Plotter's canvas
 */
export abstract class PlotterChild<P = {}, S = {}> extends Component<P, S> {
    render(): ReactNode {
        this.context.registerPlotterChild(this);
        return false;
    }

    static contextTypes = {
        registerPlotterChild: PropTypes.func
    }

    abstract draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number): void
}

/**
 * Renders a pair of coordinate axes when placed within a Plotter component.
 */
export class Axes extends PlotterChild {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {

        // Save the current drawing settings
        ctx.save();

        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 1.5;

        // Draw the x axis
        ctx.beginPath();
        ctx.moveTo(0, cs.y(0));
        ctx.lineTo(width, cs.y(0));
        ctx.stroke();

        // Draw the y axis
        ctx.beginPath();
        ctx.moveTo(cs.x(0), 0);
        ctx.lineTo(cs.x(0), height);
        ctx.stroke();

        // Restore the drawing settings
        ctx.restore();
    }
}

/**
 * Renders a plotted point when placed within a plotter component
 */
export class Point extends PlotterChild<PointProps> {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {
        ctx.save();
        ctx.fillStyle = this.props.color;

        const x = this.props.x;
        const y = this.props.y;

        ctx.beginPath();
        ctx.arc(cs.x(x), cs.y(y), POINT_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Properties for the point component
 */
export interface PointProps {
    /**
     * The x, in plot coordinates, of the point
     */
    x: number

    /**
     * The y, in plot coordinates, of the point
     */
    y: number

    /**
     * The hex color of the point
     */
    color?: string
}

/**
 * Renders a plot of a parametric function within a plotter component.
 */
export class ParametricFunction extends PlotterChild<ParametricFunctionProps> {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {
        // Make sure the properties are valid
        if (this.props.stepSize == 0 || this.props.start >= this.props.end) {
            return;
        }

        const func = this.props.func;

        ctx.beginPath();

        let t = this.props.start;

        ctx.moveTo(cs.x(func(t).x), cs.y(func(t).y));

        while (t < this.props.end) {
            ctx.lineTo(cs.x(func(t).x), cs.y(func(t).y));
            t = t + this.props.stepSize;
        }

        ctx.lineTo(cs.x(func(this.props.end).x), cs.y(func(this.props.end).y));
        ctx.stroke();
    }
}

/**
 * Properties for the ParametricFunction component
 */
export interface ParametricFunctionProps {
    /**
     * The parametric function; takes in a number and returns a 2D point.
     */
    func: (t: number) => Point2D

    /**
     * The value of t at which to start plotting
     */
    start: number

    /**
     * The value of t at which to stop plotting
     */
    end: number

    /**
     * The size of each step in the plot
     */
    stepSize: number
}

/**
 * Renders a custom drawing within a Plotter component
 */
export class Custom extends PlotterChild<CustomProps> {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {
        this.props.draw(ctx, cs);
    }
}

/**
 * Props for the Custom component
 */
export interface CustomProps {

    /**
     * Custom drawing method
     */
    draw: (ctx: CanvasRenderingContext2D, cs: CoordinateSystem) => void
}

/**
 * Renders a 2d function within a Plotter component
 */
export class Function extends PlotterChild<FunctionProps> {
    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {
        const func = this.props.func;

        const startX = cs.plotX(0);
        const endX = cs.plotX(width);

        ctx.beginPath();

        let x = startX;

        const fx = func(x);
        if (!isNaN(fx) && isFinite(fx)) {
            ctx.moveTo(cs.x(x), cs.y(fx));
        }

        let wasOutOfBounds = false;

        while (x <= endX) {
            const goTo = wasOutOfBounds ? ctx.moveTo.bind(ctx) : ctx.lineTo.bind(ctx);

            const fx = func(x);
            if (!isNaN(fx) && isFinite(fx)) {
                if (fx > cs.plotY(0)) {
                    goTo(cs.x(x), 0);
                    wasOutOfBounds = true;
                } else if (fx < cs.plotY(height)) {
                    goTo(cs.x(x), height);
                    wasOutOfBounds = true;
                } else {
                    goTo(cs.x(x), cs.y(fx));
                    wasOutOfBounds = false;
                }
            }
            x = x + cs.invScale(1);
        }

        ctx.stroke();
    }
}

/**
 * Props for the Function component
 */
export interface FunctionProps {
    /**
     * The function to draw
     */
    func: (x: number) => number
}

/**
 * Styles any nested PlotterChilds
 */
export class Style extends PlotterChild<ColorProps> {
    render(): ReactNode {
        this.context.registerPlotterChild(this);
        return <Fragment>{this.props.children}</Fragment>;
    }

    draw(ctx: CanvasRenderingContext2D, cs: CoordinateSystem, width: number, height: number) {
        ctx.save();

        if (this.props.fill) {
            ctx.fillStyle = this.props.fill;
        }

        if (this.props.stroke) {
            ctx.strokeStyle = this.props.stroke;
        }

        if (this.props.lineWidth) {
            ctx.lineWidth = this.props.lineWidth;
        }

        this.plotterChildren.forEach(child => {
            child.draw(ctx, cs, width, height);
        });

        ctx.restore();
    }

    plotterChildren: PlotterChild[] = [];

    getChildContext() {
        return ({
            registerPlotterChild: (child: PlotterChild) => {
                this.plotterChildren.push(child);
            }
        });
    }

    componentWillReceiveProps() {
        this.plotterChildren = []
    }

    static childContextTypes = {
        registerPlotterChild: PropTypes.func
    }
}

export interface ColorProps {
    /**
     * A valid CSS color to set the fill to
     */
    fill?: string

    /**
     * A valid CSS color to set the stroke to
     */
    stroke?: string

    /**
     * The width with which to draw lines
     */
    lineWidth?: number
}