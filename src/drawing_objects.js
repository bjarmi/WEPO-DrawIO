/**
 *
 * @param x {int} X axis.
 * @param y {int} Y axis.
 * @function print console logs the x,y coordinates
 */
function Point(x, y) {
    this.x = x;
    this.y = y;

    this.print = function () {
        console.log(`x: ${this.x}, y: ${this.y}`);
    }
}

/**
 * Master object for the different drawing methods.
 * @param ctx {CanvasRenderingContext2D} The canvas context that this object
 *        should be drawn onto.
 * @param point {Point} Position of the drawing object.
 * @param line_width {number} Line width of the drawing object.
 * @param colour {string} Colour of the Drawing Object in hex code or name
 *        of the color ("yellow")
 */
function DrawingObject(ctx, point, line_width, colour) {
    this.ctx = ctx;
    this.point = point;

    this.ctx.strokeStyle = colour;
    this.ctx.lineWidth = line_width;
}

/**
 * An object handling the drawing with a Pen.
 * @param ctx {CanvasRenderingContext2D} The canvas context that the pen stroke
 *        should be drawn onto.
 * @param point {Point} Starting position of the pen stroke.
 * @param line_width {number} Width of the pen stroke.
 * @param colour {string} Colour of the pen stroke in hex code or name of
 *        the color ("yellow").
 */
function PenStroke(ctx, point, line_width, colour) {
    this.super = new DrawingObject(ctx, point, line_width, colour);
    this.stroke = [point];

    /**
     *  Adds a stroke to the drawing.
     * @param point {Point}
     */
    this.update = function (point) {
        this.stroke.push(point);
        this.draw();
    }

    /**
     * Draws the whole stroke to its canvas context.
     */
    this.draw = function () {
        this.super.ctx.beginPath();
        for (let i = 0; i < this.stroke.length - 1; i++) {
            this.super.ctx.moveTo(this.stroke[i].x, this.stroke[i].y);
            this.super.ctx.lineTo(this.stroke[i+1].x, this.stroke[i+1].y);
        }
        this.super.ctx.stroke();
        this.super.ctx.closePath();
    }

}

/**
 * An object handling the drawing of a line.
 * @param ctx {CanvasRenderingContext2D} The canvas context that the line
 *        should be drawn onto.
 * @param point {Point} Starting position of the line.
 * @param line_width {number} Width of the line.
 * @param colour {string} Colour of the line in hex code or name of the
 * color ("yellow").
 */
function Line(ctx, point, line_width, colour) {
    this.super = new DrawingObject(ctx, point, line_width, colour);
    this.end_of_line = null;

    /**
     * Update the length and angle of the line.
     * @param point {Point} Point representing end of the line.
     */
    this.update = function (point) {
        this.end_of_line = point;
        this.draw();
    }

    /**
     * Draw the line onto its canvas context.
     */
    this.draw = function () {
        const start_of_line = this.super.point;

        this.super.ctx.beginPath();

        this.super.ctx.moveTo(start_of_line.x, start_of_line.y);
        this.super.ctx.lineTo(this.end_of_line.x, this.end_of_line.y)

        this.super.ctx.stroke();
        this.super.ctx.closePath();
    }
}

/**
 *  An object handling the drawing of a circle.
 * @param ctx {CanvasRenderingContext2D} The canvas context that the circle
 *        should be drawn onto.
 * @param point {Point} Starting position of the circle.
 * @param line_width {number} Outline width of the circle.
 * @param colour {string} Colour of the circle in hex code or name of the
 *        color ("yellow").
 */
function Circle(ctx, point, line_width, colour) {
    this.super = new DrawingObject(ctx, point, line_width, colour);
    this.midpoint = null;
    this.radius = null;

    /**
     * Update the size of the circle.
     * @param point {Point} Point used to calculate the size of the circle.
     */
    this.update = function (point) {
        const width = point.x - this.super.point.x;
        const height = point.y - this.super.point.y;

        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;

        this.midpoint = new Point(
            (this.super.point.x + point.x) / 2,
            (this.super.point.y + point.y) / 2
        )
        this.draw();
    }

    /**
     * Draw the circle onto its canvas context.
     */
    this.draw = function () {
        this.super.ctx.beginPath();
        this.super.ctx.arc(
            this.midpoint.x,
            this.midpoint.y,
            this.radius,
            0,
            Math.PI * 2
        );
        this.super.ctx.stroke();
        this.super.ctx.closePath();
    }
}

/**
 *  An object handling the drawing of a square.
 * @param ctx {CanvasRenderingContext2D} The canvas context that the square
 *        should be drawn onto.
 * @param point {Point} Starting position of the square.
 * @param line_width {number} Outline width of the square.
 * @param colour {string} Colour of the square in hex code or name of the
 *        color ("yellow").
 */
function Square(ctx, point, line_width, colour) {
    this.super = new DrawingObject(ctx, point, line_width, colour);

    this.width = 0;
    this.height = 0;

    this.set_width = function (width) {
        this.width = width
    };
    this.set_height = function (height) {
        this.height = height
    };

    /**
     * Updates the scale of the square and draws it out.
     * @param point {Point} The point used to calculate the scale (point -
     * position)
     */
    this.update = function (point) {
        this.set_width(point.x - this.super.point.x);
        this.set_height(point.y - this.super.point.y);
        this.draw();
    }

    /**
     * Draws the square onto its canvas context.
     */
    this.draw = function () {
        this.super.ctx.strokeRect(
            this.super.point.x,
            this.super.point.y,
            this.width,
            this.height
        );
        this.super.ctx.closePath();
    }
}

export {PenStroke, Line, Circle, Square, Point};