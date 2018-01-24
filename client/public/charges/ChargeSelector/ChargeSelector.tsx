import * as React from "react";

export const css = require('./ChargeSelector.css');

export function ChargeSelector(props: {
    charge: ChargeSelectorCharge
    onChargeSelected: (charge: ChargeSelectorCharge) => void
}) {
    const plusSel = props.charge === ChargeSelectorCharge.Plus ? ' ' + css.selected : '';
    const minusSel = props.charge === ChargeSelectorCharge.Minus ? ' ' + css.selected : '';

    return (
        <div className={css.container}>
            <button className={css.plusButton + plusSel} onClick={() => props.onChargeSelected(ChargeSelectorCharge.Plus)}>+</button>
            <button className={css.minusButton + minusSel} onClick={() => props.onChargeSelected(ChargeSelectorCharge.Minus)}>-</button>
        </div>
    );
}

export enum ChargeSelectorCharge {
    Plus = 1,
    Minus = -1
}