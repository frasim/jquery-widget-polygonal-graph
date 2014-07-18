$.widget("revilkent.polygonalGraphWidget", {
    options: {
        _id:'',
        _canvas:0,
        _context:0,
        _class: "polygonalGraphWidget",
        _totPoints: 0,
        textFont: "bold 16px Times New Roman",
        textColor: "#000",
        circleLineWidth: 5,
        circleRadius: 150,
        circleLineColor: "#333",
        circleBackgroundColor: "rgba(100, 161, 265, 1)",
        graph_colors: [
            "rgba(255, 0, 0, 0.6)",
            "rgba(0, 255, 0, 0.6)",
            "rgba(0, 0, 255, 0.6)"
        ],
        max_val:99,
        phase_start: (Math.PI / 2),
        margin:15,
        grid: false,
        meta: [],
        data: []
    },
    _create: function() {
        this.options = this._constrain(this.options);
        this.options._id = $(this.element).attr("id");
        this.element.addClass(this.options._class);
        this.options.canvas = document.getElementById(this.options._id);
        this.options.context = this.options.canvas.getContext("2d");
        this.refresh();
    },
    _setOption: function(key, value) {
        this._super(key, value);
    },
    _setOptions: function(options) {
        this._super(options);
        this.refresh();
    },
    refresh: function() {
        this.options.canvas.width = this.options.canvas.width;
        var context = this.options.context;
        try{
            this.options._totPoints = this.options.meta.length;
            if(this.options._totPoints < 3)
                throw "You must specify at least tree points!";
        }
        catch(err){
            this._error(err);
            return -1;
        }

        context.textAlign = "center";
        context.font = this.options.textFont;
        context.lineWidth = this.options.circleLineWidth;
        context.strokeStyle = this.options.circleLineColor;
        context.fillStyle = this.options.circleBackgroundColor;

        context.beginPath();
        var center_x = $(this.element).width() / 2;
        var center_y = $(this.element).height() / 2;
        var x = center_x - this.options.circleRadius, y = center_y - this.options.circleRadius;

        context.arc(center_x, center_y, this.options.circleRadius, 0, 2 * Math.PI, false);
        context.stroke();
        context.fill();
        //
        context.lineWidth = 2;
        context.fillStyle = this.options.textColor;

        var arr = new Array();
        for(var i = 0; i < this.options._totPoints; i++)
            arr[i] = this.options.max_val + this.options.margin;
        p = new Polygonal(arr, {
            radius:         this.options.circleRadius,
            phase_start:    this.options.phase_start

        });
        p.calculatePoints();
        for(var i = 0; i < this.options._totPoints; i++)
            context.fillText(this.options.meta[i], (p.points[i]['xScreen'] + x), (p.points[i]['yScreen'] + y));

        if((this.options.data.length > 0)&&(typeof this.options.data[0] != 'object')){
            var data_temp = new Array(this.options.data);
            this.options.data = 0;
            this.options.data = data_temp;
        }

        var s;
        try {
            for(var i = 0; i < this.options.data.length; i++){
                s = new Polygonal(this.options.data[i], {
                    radius:         this.options.circleRadius,
                    phase_start:    this.options.phase_start

                });
                s.calculatePoints();
                context.beginPath();
                context.strokeStyle = this.options.graph_colors[(i % 3)];
                context.moveTo((s.points[0]['xScreen'] + x), (s.points[0]['yScreen'] + y));
                context.fillStyle = this.options.graph_colors[(i % this.options.graph_colors.length)];
                if(s.points.length != this.options._totPoints){
                    //this._error("Data and Meta must have the same number of elements");
                    throw "Meta and Data must have the same number of elements!";
                }

                for(var j = 0; j < this.options._totPoints; j++)
                    context.lineTo((s.points[j]['xScreen'] + x), (s.points[j]['yScreen'] + y));
                context.lineTo((s.points[0]['xScreen'] + x), (s.points[0]['yScreen'] + y));
                context.moveTo((s.points[0]['xScreen'] + x), (s.points[0]['yScreen'] + y));
                context.stroke();
                context.fill();
            }
        }
        catch(err) {
            this._error(err);
            return -1;
        }
        //-----------------------------------
        if(this.options.grid){
            //this.options.max_val
            arr.length = 0;
            arr = 0;
            arr = new Array();
            for(var i = 0; i < this.options._totPoints; i++)
                arr[i] = this.options.max_val;

            l = new Polygonal(arr, {
                radius:         this.options.circleRadius,
                phase_start:    this.options.phase_start

            });
            l.calculatePoints();
            context.beginPath();
            context.strokeStyle = "#333";
            context.lineWidth = 1;
            for(var i = 0; i < l.points.length; i++){
                context.moveTo(center_x, center_y);
                context.lineTo((l.points[i]['xScreen'] + x), (l.points[i]['yScreen'] + y));
            }
            context.stroke();
        }
        //this._trigger( "complete", null, { value: 100 } );
    },
    _constrain: function(options) {
        /*
        * add constraint
        * */
        return options;
    },
    _error: function(message, fileName, lineNumber) {
        alert('ERROR: ' + message);
        return new Error(message, fileName, lineNumber);
    },
    _destroy: function() {
        this.element.removeClass(this.options._class).text("");
    }
});
//----------------------------------------------------------------------------------------------------------------------
/**
 * CLASS Coordinates
 **/
function Coordinates(args) {
    this.radius = 0;
    this.x = 0;
    this.y = 0;
    this.module = 0;
    this.phase = 0;
    this.xScreen = 0;
    this.yScreen = 0;
    this.__construct(args);
    return this;
}

Coordinates.prototype.__construct = function(args) {
    for(var i in args)
        this[i] = args[i];
};

Coordinates.prototype.polarToCartesian = function() {
    this.x = this.module * Math.cos(this.phase);
    this.y = this.module * (-Math.sin(this.phase));
    return this;
};

Coordinates.prototype.cartesianToScreen = function() {
    this.xScreen = Math.ceil(this.x + this.radius);
    this.yScreen = Math.ceil(this.y + this.radius);
    return this;
};
//----------------------------------------------------------------------------------------------------------------------
/**
 * CLASS Polygonal
 **/

function Polygonal(data, args) {
    this.radius = 150;
    this.phase_start = 0;
    this.max_val = 99;
    this.points = [];
    this.data = [];
    this.__construct(data, args);
    return this;
}

Polygonal.prototype.__construct = function(data, args) {
    this.data = data;
    if(args == null) args = new Object();
    for(var i in args)
        this[i] = args[i];
}


Polygonal.prototype.calculatePoints = function() {
    var num_points = this.data.length;
    degree = (2 * Math.PI) / num_points;
    for(var i = 0 ; i < num_points; i++){
        var module = (this.data[i] / this.max_val) * this.radius;
        var phase = this.phase_start + (degree * i);
        var c = new Coordinates({
            radius: this.radius,
            module: module,
            phase: phase
        });

        c.polarToCartesian().cartesianToScreen();
        this.points[i] = this.getScreenPoint(c);
    }
    return this.points;
}

Polygonal.prototype.getScreenPoint = function(c) {
    return {
        xScreen: c.xScreen,
        yScreen: c.yScreen
    }
};