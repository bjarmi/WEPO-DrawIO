import {PenStroke, Line, Circle, Square, Point, TextDraw} from "./drawing_objects.js";


const canvas = {
    'element': null,
    'ctx': null,
    'current_tool': PenStroke,
    'new_drawing': null,
    'removed_objects': [],
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

        canvas.add_events();
    },

    add_events() {
        canvas.element.on('mousedown', canvas.start_drawing);
        canvas.element.on('mouseup', canvas.stop_drawing);

        $('#undo').on('click', canvas.undo);
        $('#redo').on('click', canvas.redo);
        $('#confirm-trash').on('click', canvas.trash);
        $('#text').on('click', canvas.textbox);
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
    start_drawing(event) {
        if (!canvas.drawn_objects.length) {
            $('#undo').removeClass('disabled');
            $('#trash').removeClass('disabled');
        }

        canvas.reset_redo();

        canvas.new_drawing = new canvas.current_tool(
            canvas.ctx,
            canvas.get_mouse_position(event),
            3,
            'black',
            '48px arial'
        )
        canvas.element.on('mousemove', canvas.update_drawing);
    },

    /**
     * Update the new drawing, as its being drawn.
     * @param event {MouseEvent} Event object used to get the position for
     * the update of the new drawing object.
     */
    update_drawing(event) {
        canvas.clear_canvas();
        canvas.redraw_objects();

        const point = canvas.get_mouse_position(event);
        canvas.new_drawing.update(point);
    },

    /**
     * Finish the new drawing.
     * @param event {MouseEvent} Event object used to get the position
     */
    stop_drawing(event) {
        canvas.element.off('mousemove', this.update_drawing);
        canvas.drawn_objects.push(canvas.new_drawing);
        canvas.new_drawing = null;
    },

    undo() {
        if (!canvas.removed_objects.length)
            $('#redo').removeClass('disabled');

        const removed_object = canvas.drawn_objects.pop();
        canvas.removed_objects.push(removed_object);

        canvas.clear_canvas();
        canvas.redraw_objects();

        if (!canvas.drawn_objects.length)
            $('#undo').addClass('disabled');
    },

    redo() {
        if (!canvas.drawn_objects.length)
            $('#undo').removeClass('disabled');

        const removed_object = canvas.removed_objects.pop();
        canvas.drawn_objects.push(removed_object);

        canvas.clear_canvas();
        canvas.redraw_objects();

        if (!canvas.removed_objects.length)
            $('#redo').addClass('disabled');
    },

    trash() {
        canvas.drawn_objects = [];
        canvas.removed_objects = [];
        canvas.clear_canvas();

        $('#undo').addClass('disabled');
        $('#redo').addClass('disabled');
        $('#trash').addClass('disabled');
    },

    reset_redo() {
        $('#redo').addClass('disabled');
        canvas.removed_objects = [];
    },
    textbox() {
        let text = prompt('Enter the text you want');
        if (!canvas.drawn_objects.length) {
            $('#undo').removeClass('disabled');
            $('#trash').removeClass('disabled');
        }

        canvas.reset_redo();

        canvas.new_drawing = new canvas.current_tool(
            canvas.ctx,
            canvas.get_mouse_position(event),
            3,
            'black',
            '48px arial',
            text
        )
        canvas.new_drawing.draw()

    }
}

const tool_box = {
    'pen': PenStroke,
    'line': Line,
    'circle': Circle,
    'square': Square,
    'text': TextDraw,  // TODO: Add functionality for drawing text.
    'move': null   // TODO: Add functionality for moving objects.
}

const switch_tool = (button) => {
    $('#tools').find('.active').removeClass('active');
    $(button).addClass('active');

    canvas.current_tool = tool_box[$(button).attr('id')];
}

$("#tools").find('.btn').click(function () {
    switch_tool(this);
});


canvas.init('#canvas');