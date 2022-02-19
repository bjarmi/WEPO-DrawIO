import {Square, Pen, Point} from "./drawing_objects.js";


const canvas = {
    'element': null,
    'ctx': null,
    'current_tool': null,
    'new_drawing': null,
    'drawn_objects': [],

    /**
     * Initializes the canvas for rendering drawings.
     * @param id {string} Id of the canvas element.
     */
    init (id) {
        canvas.element = $(id);
        canvas.ctx = this.element[0].getContext('2d');

        $(window).on('resize', this.resize);
        canvas.resize();

        canvas.element.on('mousedown', canvas.initialize_drawing);
        canvas.element.on('mouseup', canvas.finish_drawing);
    },

    /**
     * Resizes the canvas to the same size as its parent.
     */
    resize() {
        const canvas_parent = canvas.element.parent();
        canvas.ctx.canvas.width = canvas_parent.width();
        canvas.ctx.canvas.height = canvas_parent.height();
    },

    /**
     * Clears all drawing on the canvas.
     */
    clear_canvas() {
        canvas.ctx.clearRect(
            0,
            0,
            canvas.ctx.canvas.width,
            canvas.ctx.canvas.height
        )
    },

    /**
     * Redraws all the objects in canvas.drawn_objects.
     */
    redraw_objects() {
        canvas.drawn_objects.forEach(x => x.draw(canvas.ctx));
    },

    /**
     * Get the position of the mouse when a given MouseEvent was triggered.
     * @param event {MouseEvent}
     * @returns {Point} The position of the mouse.
     */
    get_mouse_position(event) {
        return new Point(
            event.clientX - canvas.element[0].offsetLeft,
            event.clientY - canvas.element[0].offsetTop
        )
    },

    /**
     * Initialize a new drawing.
     * @param event {MouseEvent} Event object used to get the position for
     * the new drawing object.
     */
    initialize_drawing(event) {
        canvas.new_drawing = new Pen(
            canvas.ctx,
            canvas.get_mouse_position(event),
            3,
            'black'
        )
        canvas.element.on('mousemove', canvas.update_drawing);
    },

    /**
     * Update the new drawing, as its being drawn.
     * @param event {MouseEvent} Event object used to get the position for
     * the update of the new drawing object.
     */
    update_drawing(event) {
        if (!(canvas.new_drawing.constructor.name === "Pen")) {
            canvas.clear_canvas();
            canvas.redraw_objects();
        }

        const point = canvas.get_mouse_position(event);
        canvas.new_drawing.update(point);
    },

    /**
     * Finish the new drawing.
     * @param event {MouseEvent} Event object used to get the position
     */
    finish_drawing(event) {
        canvas.element.off('mousemove', this.update_drawing);
        canvas.drawn_objects.push(canvas.new_drawing);
        canvas.new_drawing = null;
    }
}


let history = {}

const switch_tool = (button) => {
    $('#tools').find('.active').removeClass('active');
    $(button).addClass('active');
}


$("#tools").find('.btn').click(function () {
    switch_tool(this);
});

canvas.init('#canvas');