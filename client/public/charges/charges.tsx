import { Component } from "react";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { Plotter, Point2D } from "../plotter/Plotter";
import { Axes, Point } from "../plotter/PlotterComponents";
import { VectorField2D, Vector2D, VectorField } from "../vectorFields/vectorFields";
import { pointCharge } from "../vectorFields/electric";
import { ChargeSelector, ChargeSelectorCharge } from "./ChargeSelector/ChargeSelector";

const css = require('./charges.css');

export const charges = () => {
    ReactDOM.render(<ChargesRoot />, document.getElementById('root'));
}

class ChargesRoot extends Component<{}, ChargesRootState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            charges: [],
            inputCharge: ChargeSelectorCharge.Plus,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        }
    }

    render() {
        return (
            <>
            <div className={css.plotterDiv}>
                <Plotter width={this.state.windowWidth} height={this.state.windowHeight} onClick={(x, y) => {
                    this.addCharge({ point: { x, y }, charge: this.state.inputCharge });
                }}>
                    <Axes />
                    <VectorField field={this.calculateField()} lengthFactor={0} transparency={true} />
                    {this.state.charges.map((charge, index) =>
                        <Point key={index} x={charge.point.x} y={charge.point.y} color={charge.charge > 0 ? '#FF0000' : '#0000FF'} />
                    )}
                </Plotter>
            </div>
            <div className={css.optionsDiv}>
                <div className={css.shadowDiv}>
                    <ChargeSelector charge={this.state.inputCharge} onChargeSelected={(inputCharge) => {
                        this.setState({ inputCharge });
                    }} />
                </div>
                <button className={css.resetButton} onClick={() => {
                    this.setState({ charges: [] });
                }}>
                    RESET
                </button>
            </div>
            </>
        )
    }

    componentDidMount() {
        let time = Date.now();
        window.addEventListener('resize', () => {
            if (Date.now() - time > 10) {
                this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
                time = Date.now();
            }
        });
    }

    addCharge(charge: PointCharge) {
        this.setState({
            charges: [...this.state.charges, charge]
        });
    }

    calculateField(): VectorField2D {
        return (x, y) => {
            let vec = new Vector2D(0, 0);

            this.state.charges.forEach((charge) => {
                vec = vec.plus(pointCharge(charge.point.x, charge.point.y, charge.charge)(x, y));
            });

            return vec;
        }
    }
}

interface ChargesRootState {
    charges: PointCharge[]
    inputCharge: ChargeSelectorCharge;
    windowWidth: number;
    windowHeight: number;
}

interface PointCharge {
    point: Point2D
    charge: number;
}