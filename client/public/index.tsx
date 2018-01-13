import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Plotter } from './plotter/Plotter';
import { Axes, Point } from './plotter/PlotterComponents';

export const index = () => {
    ReactDOM.render(<Index />, document.getElementById('root'));
}

class Index extends React.Component {
    render() {
        return (
            <Plotter border={true} width={500} height={500} unit={20}>
                <Axes />
                <Point x={0} y={0}/>
                <Point x={-1} y={1}/>
            </Plotter>
        );
    }
}