import * as React from 'react';
import { Component } from 'react';

import { CoordinateSystem } from './CoordinateSystem';

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
interface PointProps {
    /**
     * The x, in plot coordinates, of the point
     */
    x: number

    /**
     * The y, in plot coordinates, of the point
     */
    y: number
}