import { Vector2D, VectorField2D } from './vectorFields';
import { Point2D } from '../plotter/Plotter';

/**
 * Returns the field created by a charge of given magnitude at the given coordinates
 */
export function pointCharge(x: number, y: number, charge: number) {
    return (xa: number, ya: number) => {
        const distance = Point2D.distance({ x, y }, { x: xa, y: ya });
        return new Vector2D(xa - x, ya - y).times(charge).times(1 / distance ** 3);
    }
}