import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Plotter, Point2D } from './plotter/Plotter';
import { Axes, Point, ParametricFunction, Custom, POINT_RADIUS } from './plotter/PlotterComponents';
import { R } from './plotter2';
import { NumericalControl, ToolSelector, Tool } from './Components';
import { CoordinateSystem } from './plotter/CoordinateSystem';

/**
 * Style for the left half of the table
 */
const LEFT_TD_STYLE = {
    verticalAlign: 'top',
    padding: '10px',
    backgroundColor: '#666666'
}

/**
 * Style for the right half of the table
 */
const RIGHT_TD_STYLE = {
    verticalAlign: 'top',
    padding: '10px',
    backgroundColor: '#EEEEEE'
}

/**
 * Entry point for index.html
 */
export const index = () => {
    // Render the base Index component in the root div
    ReactDOM.render(<Index />, document.getElementById('root'));
}

/**
 * The base component for index.html
 */
class Index extends React.Component<IndexProps, IndexState> {

    /**
     * Create a new Index component
     * @param props The passed props
     */
    constructor(props: IndexProps) {
        super(props);

        // Set the inital state values
        this.state = {
            xa: 0,
            ya: 0,
            width: 500,
            height: 500,
            unit: 20,
            tool: Tool.Point,
            points: [],
            mouseIn: false
        }
    }

    /**
     * Render the Index component to the DOM
     */
    render() {

        // Construct an array of points which should be rendered based upon the points array in the state
        const pointsToRender = this.state.points.map(point => <Point x={point.x} y={point.y} />);

        // Render a plotter
        return (
            <table><tbody><tr>
                <td style={LEFT_TD_STYLE}>
                    <p>
                        <Plotter border={true}
                            width={this.state.width}
                            height={this.state.height}
                            unit={this.state.unit}
                            onMouseMove={this.onMouseMove.bind(this)}
                            onClick={this.onClick.bind(this)}
                            onMouseLeave={this.onMouseLeave.bind(this)}>
                            <Axes />
                            <ParametricFunction func={t => ({ x: Math.cos(t) * t * this.state.xa, y: Math.sin(t) * t * this.state.ya })} start={0} end={5 * Math.PI} stepSize={0.1} />
                            {pointsToRender}
                            <Custom draw={this.drawCursor.bind(this)} />
                        </Plotter>
                    </p>
                </td>
                <td style={RIGHT_TD_STYLE}>
                    <p>
                        Height: <NumericalControl value={this.state.height}
                            allowNegative={false}
                            onChange={(value) => {
                                this.setState({ height: value });
                            }} />
                    </p>
                    <p>
                        Unit: <NumericalControl value={this.state.unit}
                            allowNegative={false}
                            onChange={(value) => {
                                this.setState({ unit: value });
                            }} />
                    </p>
                    <hr />
                    <p>
                        Cursor X: <R>{this.state.xa}</R>
                    </p>
                    <p>
                        Cursor Y: <R>{this.state.ya}</R>
                    </p>
                    <hr />
                    <ToolSelector onToolChosen={this.onToolChosen.bind(this)} tool={this.state.tool} />
                    <hr />
                    <p>
                        <button onClick={this.onClearAllPoints.bind(this)}>Clear all points</button>
                    </p>
                </td>
            </tr></tbody></table>
        );
    }

    /**
     * Handle the mouse being moved on the plotter
     * 
     * @param x The x coordinate the mouse is moved to
     * @param y The y coordinate the mouse is moved to
     */
    onMouseMove(x: number, y: number) {
        this.setState({ xa: x, ya: y, mouseIn: true });
    }

    /**
     * Handle when a tool is chosen
     * 
     * @param tool The chosen tool
     */
    onToolChosen(tool: Tool) {
        this.setState({ tool });
    }

    /**
     * Handle when the clear all points button is pressed
     */
    onClearAllPoints() {
        this.setState({ points: [] });
    }

    /**
     * Handle the mouse leaving the Plotter
     */
    onMouseLeave() {
        this.setState({ mouseIn: false });
    }

    /**
     * Handle the user clicking on the Plotter
     * 
     * @param x The x coordinate of the click
     * @param y The y coordinate of the click
     * @param cs The Plotter's coordinate system
     */
    onClick(x: number, y: number, cs: CoordinateSystem) {
        // Decide what to do based upon which tool is selected
        switch (this.state.tool) {
            case Tool.Point:
                // If the point tool is selected, add a point at the location of the click
                this.setState({ points: this.state.points.concat({ x, y }) });
                break;
            case Tool.Remove:
                // If the remove tool is selected and a point is clicked, remove that point
                for (let i = 0; i < this.state.points.length; i++) {
                    const point = this.state.points[i];
                    const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
                    if (dist < cs.invScale(POINT_RADIUS) * 2) {
                        const pointsCopy = this.state.points.slice();
                        pointsCopy.splice(i, 1);
                        this.setState({ points: pointsCopy });
                        break;
                    }
                }
                break;
        }
    }

    /**
     * Custom drawing function for the cursor
     * 
     * @param ctx 
     * @param cs 
     */
    drawCursor(ctx: CanvasRenderingContext2D, cs: CoordinateSystem) {

        // If the cursor is not in the plotter, do not run the rest of the function
        if (!this.state.mouseIn) return;

        // Get the coordinates of the cursor and scale them to screen coordinates
        const xa = this.state.xa;
        const ya = this.state.ya;
        const cx = cs.x(xa);
        const cy = cs.y(ya);

        // Draw a different cursor depending on the selected tool
        switch (this.state.tool) {
            case Tool.Point:
                // If point is selected, draw a point.
                ctx.beginPath();
                ctx.arc(cx, cy, POINT_RADIUS, 0, 2 * Math.PI);
                ctx.fill();

                break;
            case Tool.Remove:
                // If remove is slected, draw a red X.
                ctx.save();

                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;

                ctx.beginPath();
                ctx.moveTo(cx - POINT_RADIUS * 1.5, cy - POINT_RADIUS * 1.5);
                ctx.lineTo(cx + POINT_RADIUS * 1.5, cy + POINT_RADIUS * 1.5);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(cx - POINT_RADIUS * 1.5, cy + POINT_RADIUS * 1.5);
                ctx.lineTo(cx + POINT_RADIUS * 1.5, cy - POINT_RADIUS * 1.5);
                ctx.stroke();

                ctx.restore();
                break;
        }
    }
}

/**
 * Props for the Index component
 */
interface IndexProps { }

/**
 * State for the index component
 */
interface IndexState {
    /**
     * The x coordinate of the cursor in plot coordinates
     */
    xa: number

    /**
     * The y coordinate of the cursor in plot coordinates
     */
    ya: number

    /**
     * The width of the Plotter
     */
    width: number

    /**
     * The height of the Plotter
     */
    height: number

    /**
     * The unit of the Plotter's CoordinateSystem
     */
    unit: number

    /**
     * The selected tool
     */
    tool: Tool

    /**
     * The points to be drawn
     */
    points: Point2D[]

    /**
     * Whether the mouse is in the Plotter
     */
    mouseIn: boolean;
}