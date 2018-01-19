/**
 * This module contains components meant to be placed within a Plotter component.
 * They will not be rendered if not placed within a Plotter.
 */

import * as React from 'react';
import { Component } from 'react';

import { CoordinateSystem } from './CoordinateSystem';
import { Point2D } from './Plotter';

/**
 * The radius, in pixels, of plotted points
 */
export const POINT_RADIUS = 5;

/**
 * Renders a pair of coordinate axes when placed within a Plotter component.
 */
export class Axes extends Component { }

/**
 * Renders a plotted point when placed within a plotter component
 */
export class Point extends Component<PointProps> { }

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
export class ParametricFunction extends Component<ParametricFunctionProps> { }

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
export class Custom extends Component<CustomProps> { }

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
export class Function extends Component<FunctionProps> { }

/**
 * Props for the Function component
 */
export interface FunctionProps {
    /**
     * The function to draw
     */
    func: (x: number) => number
}