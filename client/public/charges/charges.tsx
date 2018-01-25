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
            windowHeight: window.innerHeight,
            mouseX: 0,
            mouseY: 0,
            magnetic: false
        }
    }

    render() {
        return (
            <>
            <div className={css.plotterDiv}>
                <Plotter width={this.state.windowWidth} height={this.state.windowHeight} onClick={(x, y) => {
                    this.addCharge({ point: { x, y }, charge: this.state.inputCharge });
                }} onMouseMove={( x, y ) => {
                    this.setState({mouseX: x, mouseY: y});
                }}>
                    <Axes />
                    <VectorField field={this.calculateField()} lengthFactor={0} transparency={true} />
                    {this.state.charges.map((charge, index) =>
                        <Point key={index} x={charge.point.x} y={charge.point.y} color={charge.charge > 0 ? '#FF0000' : '#0000FF'} />
                    )}
                    <Point x={this.state.mouseX} y={this.state.mouseY} color={this.state.inputCharge > 0 ? '#FF0000' : '#0000FF'} />
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
                <div className={css.shadowDiv}>
                    <input type='radio' name='emSelector' checked={!this.state.magnetic} onChange={() => {
                        this.setState({magnetic: false});
                    }} value='electric' />
                    <label>Electric</label><br/>
                    <input type='radio' name='emSelector' checked={this.state.magnetic} onChange={() => {
                        this.setState({magnetic: true});
                    }} value='magnetic' />
                    <label>Magnetic</label>
                </div>
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
        const field = this.state.magnetic ? coolCircleThing : pointCharge;
        return (x, y) => {
            let vec = new Vector2D(0, 0);

            this.state.charges.forEach((charge) => {
                vec = vec.plus(field(charge.point.x, charge.point.y, charge.charge)(x, y));
            });

            vec = vec.plus(field(this.state.mouseX, this.state.mouseY, this.state.inputCharge)(x, y));

            return vec;
        }
    }
}

interface ChargesRootState {
    charges: PointCharge[]
    inputCharge: ChargeSelectorCharge;
    windowWidth: number;
    windowHeight: number;
    mouseX: number;
    mouseY: number;
    magnetic: boolean;
}

interface PointCharge {
    point: Point2D
    charge: number;
}

function coolCircleThing(x: number, y: number, charge: number) : VectorField2D {
    return (xa: number, ya: number) => {
        const distance = Point2D.distance({ x, y }, { x: xa, y: ya });
        return new Vector2D(y - ya, xa - x).times(charge).times(1 / distance ** 3);
    }
}