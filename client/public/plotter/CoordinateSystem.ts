/**
 * Represents a mapping from plot coordinates to screen coordinates.
 * Note that in plot coordinates, positive y is up, while in screen
 * coordinates, positive y is down.
 */
export class CoordinateSystem {

    /**
     * The x, in screen coordinates, of the origin
     */
    originX: number

    /**
     * The y, in screen coordinates, of the origin
     */
    originY: number

    /**
     * The number of pixels which corresponds to one unit in plot coordinates
     */
    unit: number

    /**
     * Returns a new coordinate system centered in the viewport with the given width and height.
     * @param width The width of the viewport
     * @param height The height of the viewport
     * @param unit The number of pixels which corresponds to one unit in plot coordinates
     */
    static centeredCoordinateSystem(centerX: number, centerY: number, width: number, height: number, unit: number) : CoordinateSystem {
        const cX = (typeof centerX == 'number' && !isNaN(centerX - centerX)) ? centerX : 0;
        const cY = (typeof centerY == 'number' && !isNaN(centerY - centerY)) ? centerY : 0;
        return new CoordinateSystem(width / 2 - cX * unit, height / 2 + cY * unit, unit);
    }

    /**
     * Creates a new coordinate system
     * @param originX The x, in screen coordinates, of the origin
     * @param originY The y, in screen coordinates, of the origin
     * @param unit The number of pixels which corresponds to one unit in plot coordinates
     */
    constructor(originX: number, originY: number, unit: number) {
        this.originX = originX;
        this.originY = originY;
        this.unit = unit;
    }

    /**
     * Convert from x in plot coordinates to screen coordinates
     */
    x(plotX: number) : number {
        return plotX * this.unit + this.originX;
    }

    /**
     * Convert from y in plot coordinates to screen coordinates
     */
    y(plotY: number) : number{
        return this.originY - plotY * this.unit;
    }

    /**
     * Scale a width or height from plot coordinates to screen coordinates
     * @param plotDimension the length to scale
     */
    scale(plotDimension: number) {
        return plotDimension * this.unit;
    }

    /**
     * Inverse of the scale method
     */
    invScale(screenDimension: number) {
        return screenDimension / this.unit;
    }

    /**
     * Convert from x in screen coordinates to plot coordinates
     */
    plotX(screenX: number) : number {
        return (screenX - this.originX) / this.unit;
    }

    /**
     * Convert from Y in screen coordinates to plot coordinates
     */
    plotY(screenY: number) : number{
        return (this.originY - screenY) / this.unit;
    }

    /**
     * Fill a rectangle using plot coordinates
     * 
     * @param ctx The rendering context
     * @param x The x coordinate of the rectangle's bottom left corner
     * @param y The y coordinate of the rectangle's bottom left corner
     * @param width The width of the rectangle
     * @param height The height of the rectangle
     */
    fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
        ctx.fillRect(this.x(x), this.y(y)-this.scale(height), this.scale(width), this.scale(height));
    }
}