import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Plotter, Point2D } from './plotter/Plotter';
import { Axes, Point, ParametricFunction, Custom, POINT_RADIUS } from './plotter/PlotterComponents';
import { R } from './plotter2';
import { NumericalControl, ToolSelector, Tool } from './Components';
import { CoordinateSystem } from './plotter/CoordinateSystem';

const LEFT_TD_STYLE = {
    'vertical-align': 'top',
    padding: '10px',
    'background-color': '#666666'
}

const RIGHT_TD_STYLE = {
    'vertical-align': 'top',
    padding: '10px',
    'background-color': '#EEEEEE'
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

    constructor(props: IndexProps) {
        super(props);

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

    render() {

        const pointsToRender = this.state.points.map(point => <Point x={point.x} y={point.y} />);

        // Render a plotter
        return (
            <table><tr>
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
                    <p>
                        Cursor X: <R>{this.state.xa}</R>
                    </p>
                    <p>
                        Cursor Y: <R>{this.state.ya}</R>
                    </p>
                    <ToolSelector onToolChosen={this.onToolChosen.bind(this)} tool={this.state.tool} />
                </td>
            </tr></table>
        );
    }

    onMouseMove(x: number, y: number) {
        this.setState({ xa: x, ya: y, mouseIn: true});
    }

    onToolChosen(tool: Tool) {
        this.setState({ tool });
    }

    onMouseLeave() {
        this.setState({mouseIn: false});
    }

    onClick(x: number, y: number, cs: CoordinateSystem) {
        switch (this.state.tool) {
            case Tool.Point:
                this.setState({points: this.state.points.concat({x,y})});
                break;
            case Tool.Remove:
                for (let i = 0; i < this.state.points.length; i++) {
                    const point = this.state.points[i];
                    const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
                    if (dist < cs.invScale(POINT_RADIUS) * 2) {
                        const pointsCopy = this.state.points.slice();
                        pointsCopy.splice(i, 1);
                        this.setState({points: pointsCopy});
                        break;
                    }
                }
                break;
        }
    }

    drawCursor(ctx: CanvasRenderingContext2D, cs: CoordinateSystem) {

        if (!this.state.mouseIn) return;

        const xa = this.state.xa;
        const ya = this.state.ya;

        const cx = cs.x(xa);
        const cy = cs.y(ya);

        switch (this.state.tool) {
            case Tool.Point:
                ctx.beginPath();
                ctx.arc(cx, cy, POINT_RADIUS, 0, 2 * Math.PI);
                ctx.fill();

                break;
            case Tool.Remove:
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

interface IndexProps { }
interface IndexState {
    xa: number
    ya: number
    width: number
    height: number
    unit: number
    tool: Tool
    points: Point2D[]
    mouseIn: boolean;
}