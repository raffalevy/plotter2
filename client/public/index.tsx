/**
 * @license MIT
 * 
 * Entry point for index.html
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Plotter, Point2D } from './plotter/Plotter';
import { Axes, Point, ParametricFunction, Custom, POINT_RADIUS, Style } from './plotter/PlotterComponents';
import * as PlotterComponents from './plotter/PlotterComponents';
import { R, NumericalControl, ToolSelector, Tool, FunctionInput } from './Components';
import { CoordinateSystem } from './plotter/CoordinateSystem';
import { VectorFieldSelector, VectorField2D, VectorField } from './vectorFields/vectorFields';

/**
 * How tolerant the remove tool is
 */
const REMOVE_TOLERANCE = 3;

const DEFAULT_STATE : IndexState = {
    xa: 0,
    ya: 0,
    width: 500,
    height: 500,
    unit: 20,
    centerX: 0,
    centerY: 0,
    tool: Tool.Point,
    points: [],
    mouseIn: false,
    func: null,
    functionInputValue: '',
    selectedVectorFieldName: '',
    selectedVectorField: null,
    lengthFactor: 0
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

        const localState = localStorage.getItem('indexState');
        if (localStorage.getItem('indexState')) {
            try {
                const localStateParsed = JSON.parse(localState);
                Object.keys(DEFAULT_STATE).forEach((key) => {
                    if (!localStateParsed.hasOwnProperty(key)) {
                        localStateParsed[key] = (DEFAULT_STATE as any)[key];
                    }
                });
                this.state = localStateParsed;
            } catch (e) {
                this.state = DEFAULT_STATE;
            }
        } else {
            // Set the inital state values
            this.state = DEFAULT_STATE;
        }
    }

    /**
     * Render the Index component to the DOM
     */
    render() {

        // Construct an array of points which should be rendered based upon the points array in the state
        const pointsToRender = this.state.points.map(point => <Point key={point.x + ',' + point.y} x={point.x} y={point.y} color={point.color} />);

        // Render a plotter
        return (
            <React.Fragment>
                <nav><span className='navText'>Plotter2</span></nav>
                <div id='main' className='row'>
                        <div className='card column left'>
                            <p>
                                <Plotter
                                    width={this.state.width} height={this.state.height}
                                    unit={this.state.unit}
                                    centerX={this.state.centerX} centerY={this.state.centerY}
                                    onMouseMove={this.onMouseMove.bind(this)}
                                    onClick={this.onClick.bind(this)}
                                    onMouseLeave={this.onMouseLeave.bind(this)}>
                                    <Axes />
                                    <Style stroke='#E040FB' lineWidth={1.5}>
                                        {this.state.selectedVectorField ?
                                            <VectorField field={this.state.selectedVectorField} lengthFactor={this.state.lengthFactor} /> :
                                            false
                                        }
                                    </Style>
                                    <Style stroke='#AB47BC' lineWidth={5}>
                                        {this.state.func ?
                                            <PlotterComponents.Function func={this.state.func} /> :
                                            false}
                                    </Style>
                                    {pointsToRender}
                                    <Custom draw={this.drawCursor.bind(this)} />
                                </Plotter>
                            </p>
                        </div>
                        <div className='card column center'>
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
                            <p>
                                Length factor: <NumericalControl value={this.state.lengthFactor}
                                    allowNegative={false}
                                    onChange={(value) => {
                                        this.setState({ lengthFactor: value });
                                    }} />
                            </p>
                            <hr />
                            <p>
                                Center X: <NumericalControl value={this.state.centerX}
                                    onChange={(value) => {
                                        this.setState({ centerX: value });
                                    }} />
                            </p>
                            <p>
                                Center Y: <NumericalControl value={this.state.centerY}
                                    onChange={(value) => {
                                        this.setState({ centerY: value });
                                    }} />
                            </p>
                            <hr />
                            <ToolSelector onToolChosen={this.onToolChosen.bind(this)} tool={this.state.tool} />
                            <hr />
                            <p>
                                <button onClick={this.onClearAllPoints.bind(this)}>CLEAR ALL POINTS</button>
                                <button onClick={() => {
                                    this.setState(DEFAULT_STATE);
                                }}>RESET ALL</button>
                            </p>
                            <hr />
                            <p>
                                Plot function:
                            </p>
                            <p>
                                f(x) = <FunctionInput onFunctionChange={(func, value) => {
                                    this.setState({ func, functionInputValue: value });
                                }} value={this.state.functionInputValue} placeholder='x^2' />
                            </p>
                        </div>
                        <div className='card column right'>
                            Vector field:
                            <VectorFieldSelector selected={this.state.selectedVectorFieldName} onSelect={(selectedOption, vectorField) => {
                                this.setState({ selectedVectorFieldName: selectedOption, selectedVectorField: vectorField });
                            }} />
                        </div>
                </div>
                <footer className='card copy'>
                    <small>Copyright 2018 Raffa Levy</small> - (<R>{this.state.xa}</R>,<R>{this.state.ya}</R>)
                </footer>
            </React.Fragment>
        );
    }

    /**
     * Save the state to local storage when the component is updated
     */
    componentDidUpdate() {
        localStorage.setItem('indexState', JSON.stringify(this.state));
    }

    /**
     * Handle the mouse being moved on the plotter
     * 
     * @param x The x coordinate the mouse is moved to
     * @param y The y coordinate the mouse is moved to
     */
    onMouseMove(x: number, y: number, cs: CoordinateSystem) {
        if (this.state.tool == Tool.Remove && this.state.points.length > 0) {

            let closest: Point2DWithColor;
            if (this.state.points.length > 0) {
                closest = this.state.points.reduce((a, b) => {
                    const aDist = Math.sqrt((a.x - x) ** 2 + (a.y - y) ** 2);
                    const bDist = Math.sqrt((b.x - x) ** 2 + (b.y - y) ** 2);
                    return (aDist <= bDist) ? a : b;
                });
            }

            const closestIndex = this.state.points.indexOf(closest);

            const arrayCopy = this.state.points.slice();

            arrayCopy.forEach(point => point.color = '#4A148C');

            if (cs.scale(Math.sqrt((closest.x - x) ** 2 + (closest.y - y) ** 2)) <= POINT_RADIUS * REMOVE_TOLERANCE) {
                arrayCopy[closestIndex] = { x: closest.x, y: closest.y, color: '#E91E63' }
            }

            this.setState({ xa: x, ya: y, mouseIn: true, points: arrayCopy });
        } else {
            this.setState({ xa: x, ya: y, mouseIn: true });
        }
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
                this.setState({ points: this.state.points.concat({ x, y, color: '#4A148C' }) });
                break;
            case Tool.Remove:
                // If the remove tool is selected and a point is clicked, remove that point
                for (let i = 0; i < this.state.points.length; i++) {
                    const point = this.state.points[i];
                    const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
                    if (dist < cs.invScale(POINT_RADIUS) * REMOVE_TOLERANCE) {
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

                ctx.save();
                ctx.fillStyle = '#E91E63'

                ctx.beginPath();
                ctx.arc(cx, cy, POINT_RADIUS, 0, 2 * Math.PI);
                ctx.fill();

                ctx.restore();

                break;
            case Tool.Remove:
                // If remove is slected, draw an X.
                ctx.save();

                ctx.strokeStyle = '#AD1457';
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

    centerX: number
    centerY: number

    /**
     * The selected tool
     */
    tool: Tool

    /**
     * The points to be drawn
     */
    points: Point2DWithColor[]

    /**
     * Whether the mouse is in the Plotter
     */
    mouseIn: boolean;

    /**
     * The value of the function input field
     */
    functionInputValue: string

    /**
     * The function being rendered
     */
    func: (x: number) => number

    /**
     * The name of the selected vector field
     */
    selectedVectorFieldName: string

    /**
     * The selected vector field
     */
    selectedVectorField: VectorField2D

    lengthFactor: number
}

/**
 * A 2d point with a color
 */
interface Point2DWithColor extends Point2D {

    /**
     * The color of the point
     */
    color: string
}