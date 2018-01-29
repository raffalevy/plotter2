import { Vector2D, VectorField2D } from './vectorFields';
import { Point2D } from '../plotter/Plotter';

/**
 * Returns the field created by a charge of given magnitude at the given coordinates
 */
export function electricPointField(x: number, y: number, charge: number) {
    return (xa: number, ya: number) => {
        const distance = Point2D.distance({ x, y }, { x: xa, y: ya });
        return new Vector2D(xa - x, ya - y).times(charge).times(1 / distance ** 3);
    }
}

export function electricLineField(startX: number, startY: number, endX: number, endY: number, charge: number, precision: number) {
    const length = Point2D.distance({ x: startX, y: startY }, { x: endX, y: endY });
    const xStep = (endX - startX) / precision;
    const yStep = (endY - startY) / precision;
    const step = length / precision;
    const pointChargeMagnitude = charge / precision;

    return (xa: number, ya: number) => {
        let x = startX;
        let y = startY;
        let elapsed = 0;

        let vec = new Vector2D(0,0);

        while (elapsed <= length) {
            vec = vec.plus(electricPointField(x, y, pointChargeMagnitude)(xa, ya));

            x += xStep;
            y += yStep;
            elapsed += step;
        }

        return vec;
    }
}

export function magneticPointField(x: number, y: number, charge: number) : VectorField2D {
    return (xa: number, ya: number) => {
        const distance = Point2D.distance({ x, y }, { x: xa, y: ya });
        return new Vector2D(y - ya, xa - x).times(charge).times(1 / distance ** 3);
    }
}

export function magneticLine(x: number, y: number, charge: number) : VectorField2D {
    return (xa: number, ya: number) => {
        const distance = Point2D.distance({ x, y }, { x: xa, y: ya });
        return new Vector2D(y - ya, xa - x).times(charge).times(1 / distance ** 3);
    }
}