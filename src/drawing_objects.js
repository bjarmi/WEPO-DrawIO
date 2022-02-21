/**
 *
 * @param x {int} X axis.
 * @param y {int} Y axis.
 * @function print console logs the x,y coordinates
 */
function Point(x, y) {
    this.x = x;
    this.y = y;

    this.add = function (point) {
        this.x += point.x;
        this.y += point.y;
    }
}

function Frame(top_left, bottom_right) {
    this.top_left = top_left;
    this.bottom_right = bottom_right;

    this.contains_point = function (point) {
        const grater_then_top_left =
            (this.top_left.x < point.x) && (this.top_left.y < point.y);

        const less_then_bottom_right =
            (this.bottom_right.x > point.x) && (this.bottom_right.y > point.y);

        return (grater_then_top_left && less_then_bottom_right);
    }
}

function Move(point, drawn_objects) {
    this.oroginal_position = point;
    this.curser_pos = point;
    this.drawing_object = null;

    // Check what drawing object the user wants to move.
    for (let i = drawn_objects.length - 1; i >= 0; i--) {
        let drawing_object = drawn_objects[i];

        // Ignoring Move objects.
        if (drawing_object.constructor.name === "Move")
            continue;

        if (drawing_object.super.drawing_frame.contains_point(
            this.curser_pos
        )) {
            this.drawing_object = drawing_object;
            break;
        }
    }

    this.draw = function (){}  // Is called in canvas.redraw_objects.

    this.update = function (point) {
        const vector = new Point(
            point.x - this.curser_pos.x,
            point.y - this.curser_pos.y
        );
        this.curser_pos = point;
        this.drawing_object.move(vector);

    }
    this.finalize = function () { this.drawing_object.finalize()}
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

    this.drawing_frame = new Frame(point, point);
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
            this.super.ctx.lineTo(this.stroke[i + 1].x, this.stroke[i + 1].y);
        }
        this.super.ctx.stroke();
        this.super.ctx.closePath();
    }

    this.move = function (vector) {
        this.stroke.forEach(point => point.add(vector));
    }

    this.finalize = function () {
        let lowest_x = this.super.point.x;
        let lowest_y = this.super.point.y;
        let highest_x = this.super.point.x;
        let highest_y = this.super.point.y;

        this.stroke.forEach(point => {
                lowest_x = point.x < lowest_x ? point.x : lowest_x;
                lowest_y = point.y < lowest_y ? point.y : lowest_y;
                highest_x = point.x > highest_x ? point.x : highest_x;
                highest_y = point.y > highest_y ? point.y : highest_y;
            }
        )

        const top_left = new Point(lowest_x, lowest_y);
        const bottom_right = new Point(highest_x, highest_y);

        this.super.drawing_frame = new Frame(top_left, bottom_right);
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

    this.move = function (vector) {
        this.super.point.add(vector);
        this.end_of_line.add(vector);
    }

    this.finalize = function () {
        const top_left = new Point(
            this.super.point.x < this.end_of_line.x ?
                this.super.point.x :
                this.end_of_line.x,
            this.super.point.y < this.end_of_line.y ?
                this.super.point.y :
                this.end_of_line.y,
        );
        const bottom_right = new Point(
            this.super.point.x > this.end_of_line.x ?
                this.super.point.x :
                this.end_of_line.x,
            this.super.point.y > this.end_of_line.y ?
                this.super.point.y :
                this.end_of_line.y,
        );
        this.super.drawing_frame = new Frame(top_left, bottom_right);
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

    this.move = function (vector) {
        this.midpoint.add(vector);
    }

    this.finalize = function () {
        const top_left = new Point(
            this.midpoint.x - this.radius,
            this.midpoint.y - this.radius,
        )

        const bottom_right = new Point(
            this.midpoint.x + this.radius,
            this.midpoint.y + this.radius,
        )

        this.super.drawing_frame = new Frame(top_left, bottom_right);
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
        this.width = width;
    };
    this.set_height = function (height) {
        this.height = height;
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

    this.move = function (vector) {
        this.super.point.add(vector);
    }


    this.finalize = function () {
        const top_left = new Point(
            this.super.point.x < this.super.point.x + this.width ?
                this.super.point.x :
                this.super.point.x + this.width,
            this.super.point.y < this.super.point.y + this.height ?
                this.super.point.y :
                this.super.point.y + this.height,
        )
        const bottom_right = new Point(
            this.super.point.x > this.super.point.x +this.width ?
                this.super.point.x :
                this.super.point.x + this.width,
            this.super.point.y > this.super.point.y + this.height ?
                this.super.point.y :
                this.super.point.y + this.height,
        )

        this.super.drawing_frame = new Frame(top_left, bottom_right)
    }
}

/**
 *  An object handling the drawing of a square.
 * @param ctx {CanvasRenderingContext2D} The canvas context that the text
 *        should be drawn onto.
 * @param point {Point} Starting position of the text.
 * @param line_width {string} Outline width of the text.
 * @param colour {string} Colour of the text in hex code or name of the
 *        color ("yellow").
 * @param font {string} a string that tells the size and the font name "48px arial".
 * @param textstring {string} The input string from the user to be drawn.
 */
function TextDraw(ctx, point, line_width, colour, font, textstring) {
    this.ctx = ctx;
    this.point = new Point(50, 50);
    this.line_width = parseInt(line_width);
    this.px_size = this.line_width * 24;
    this.ctx.strokeStyle = colour.toLowerCase();
    this.ctx.font = this.px_size + 'px ' + font;
    this.textstring = textstring;
    console.log(this.ctx.font);
    console.log(this.ctx.strokeStyle);
    console.log(this.ctx.font);

    this.update = function (point) {
        this.point.x = point.x;
        this.point.y = point.y;
        this.draw();
    }


    /**
     * Draws the text onto its canvas context.
     */
    this.draw = function () {
        this.ctx.fillText(
            this.textstring,
            this.point.x,
            this.point.y
        );
    }
}


export {PenStroke, Move, Line, Circle, Square, Point, TextDraw};