import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Plotter } from './plotter/Plotter';
import { Axes, Point, ParametricFunction } from './plotter/PlotterComponents';
import { R } from './plotter2';
import { NumericalControl } from './Components';

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
            unit: 20
        }
    }

    render() {
        // Render a plotter
        return (
            <table><tr>
                <td style={LEFT_TD_STYLE}>
                    <p>
                        <Plotter border={true} width={this.state.width} height={this.state.height} unit={this.state.unit} onMouseMove={this.onMouseMove.bind(this)}>
                            <Axes />
                            <Point x={this.state.xa} y={this.state.ya} />
                            <Point x={3} y={2} />
                            <ParametricFunction func={t => ({ x: Math.cos(t) * t * this.state.xa, y: Math.sin(t) * t * this.state.ya })} start={0} end={5 * Math.PI} stepSize={0.1} />
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
                        Cursor X: <R>{this.state.xa}</R>
                    </p>
                    <p>
                        Cursor Y: <R>{this.state.ya}</R>
                    </p>
                </td>
            </tr></table>
        );
    }

    onMouseMove(x: number, y: number) {
        this.setState({ xa: x, ya: y });
    }
}

interface IndexProps { }
interface IndexState {
    xa: number
    ya: number
    width: number
    height: number
    unit: number
}