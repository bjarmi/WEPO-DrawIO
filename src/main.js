import {
    Point,
    Move,
    PenStroke,
    Line,
    Circle,
    Square,
    TextDraw
} from "./drawing_objects.js";


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

    initiate_tool (event) {
        if (canvas.current_tool === Move) {
            canvas.new_drawing = new Move(
                canvas.get_mouse_position(event),
                canvas.drawn_objects
            );

            // If no objects were found.
            if (!canvas.new_drawing.drawing_object)
                return;

            canvas.element.on('mousemove', canvas.update_drawing);
        }
        else
            canvas.start_drawing(event);
    },

    add_events() {
        canvas.element.on('mousedown', canvas.initiate_tool);
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
        canvas.new_drawing.finalize();
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

        canvas.new_drawing = new TextDraw(
            canvas.ctx,
            canvas.get_mouse_position(event),
            $('#size').text(),
            $('#color').text(),
            $('#font').text(),
            text
        )
        canvas.new_drawing.draw()

    }
}


const tool_box = Object.freeze(
    {
        'pen': PenStroke,
        'line': Line,
        'circle': Circle,
        'square': Square,
        'move': Move
    }
)

const switch_tool = (button) => {
    $('#tools').find('.active').removeClass('active');
    $(button).addClass('active');

    canvas.current_tool = tool_box[$(button).attr('id')];
}

$("#tools").find('.btn').click(function () {
    switch_tool(this);
});


$('.font-btn').click(function () {
    $('#font').text($(this).attr('id'));
});

$('.size-btn').click(function () {
    $('#size').text($(this).attr('id'));
});

$('.color-btn').click(function () {
    $('#color').text($(this).attr('id'));
});

$('.fa-download').click(function () {
    localStorage.setItem('mycanvas', JSON.stringify(canvas.drawn_objects));
    console.log(JSON.stringify(canvas.drawn_objects));
});

$('.fa-upload').click(function () {
    canvas.drawn_objects = JSON.parse(localStorage.getItem('mycanvas'));
    console.log(canvas.drawn_objects);
    canvas.redraw_objects();
});

canvas.init('#canvas');