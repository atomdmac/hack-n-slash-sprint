function PlayMenuState () {
    var self = this,
        options = {
            fontSize: 20,
            spacing: 5,
            selectColor: 'red',
            textColor: 'black'
        },
        items = [
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six"
        ],
        textItems = [],
        index = 0,
        isMoving = false;
    
    function moveDown () {
        if(index!=items.length) {
            index++;
        }
    }
    
    function moveUp () {
        if(index!==0) {
            index--;
        }
    }
    
    function onMoveFinish () {
        // TODO
    }
    
    self.setup = function () {
        var i =0, ilen = items.length;
        
        for(; i<ilen; i++) {
            textItems.push(new jaws.Text({
                text: items[i],
                fontSize: options.fontSize,
                x   : 0,
                y   : i * (options.fontSize + options.spacing) + options.fontSize
            }));
        }
    };
    
    self.update = function () {
        // Down
        if(jaws.pressedWithoutRepeat("down")) {
            moveDown();
        }
        // Up
        if(jaws.pressedWithoutRepeat("up")) {
            moveUp();
        }
    };
    
    self.draw = function () {
        var i = 0, ilen = textItems.length;
        
        jaws.clear();
        jaws.context.save();
        jaws.context.strokeStyle = "black";
        jaws.context.beginPath();
        jaws.context.rect(0, 0, 100, 115);
        jaws.context.stroke();
        jaws.context.clip();
        
        for(; i<ilen; i++) {
            if(i===index) {
                textItems[i].color = "red";
            } else {
                textItems[i].color = "black";
            }
            textItems[i].draw();
        }
        jaws.context.restore();
    };
}

// Frame Tween
var FrameTween = {
    
    // Is an an animation currently playing?
    _isPlaying: false,
    
    // Current element/position/time
    _current: null,
    
    // Do another iteration of the animation.
    _tick: function () {
        this._current.frame++;
        
        var func = this._easing[this._current.easing];
        
        // TODO: Remove the nead to include "null" as the first arg.
        this._current.curX = func(null, 
                                  this._current.frame,
                                  this._current.startX,
                                  this._current.deltaX,
                                  this._current.duration);
        this._current.curY = func(null, 
                                  this._current.frame,
                                  this._current.startY,
                                  this._current.deltaY,
                                  this._current.duration);
        
        
        this._current.element.style.left = this._current.curX + "px";
        this._current.element.style.top  = this._current.curY + "px";
        
        if(this._current.frame === this._current.duration) {
            this.stop();
        }
    },
    
    // Return an object with an elements x/y coordinates.
    _getCoords: function (element) {
        var top  = window.getComputedStyle(element).top,
            left = window.getComputedStyle(element).left;
        return {
            "x": parseInt(top.substr(0,  top.length - 2)),
            "y": parseInt(left.substr(0, left.length - 2))
        }
    },
    
    start: function (element, endX, endY, duration, easing) {
        // Animation already in progress
        if(this._isPlaying) return;
        
        this._isPlaying = true;
        
        // No animation is already in progress.
        // TODO: Don't tween if current and end coords are the same.
        if(this._current == null) {
            var curCoords = this._getCoords(element);
            this._current = {
                "element"    : element,
                "startX"     : curCoords.x,
                "startY"     : curCoords.y,
                "deltaX"     : endX - curCoords.x,
                "deltaY"     : endY - curCoords.y,
                "curX"       : curCoords.x,
                "curY"       : curCoords.y,
                "duration"   : duration,
                "frame"      : 0,
                "easing"     : easing || "linear"
            }
            console.log("Current: ", this._current);
        }
        
        // Start the animation.
        var self = this;
        this._interval = setInterval(function () {
            self._tick.apply(self);
        }, 20);
    },
    
    pause: function () {
        if(this._isPlaying === true && this._current != null) {
            this._isPlaying = false;
            clearInterval(this._interval);
        }
    },
    
    stop: function () {
        clearInterval(this._interval);
        this._current = null;
        this._isPlaying = false;
    },
    
    _easing: {
        linear: function(x, t, b, c, d) {
            t/=d;
            return b+c*(t);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
            return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
}