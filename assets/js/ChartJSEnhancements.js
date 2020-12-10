class ChartJSEnhancements {
    constructor(t, s = !0) {
        if (this.chartjs_object = t, this.canvas = t.canvas, this.ctx = this.chartjs_object.ctx, this.datasets = this.chartjs_object.data.datasets, this.data_length = this.datasets.reduce(function(t, s) {
                return t + s.data.length
            }, 0), this.quick_mode = this.data_length > 2e3, this.chartjs_object.options.hoverMode = this.quick_mode ? null : Chart.defaults.global.hover.mode, this.chartjs_object.options.hover.animationDuration = this.quick_mode ? 0 : 200, this.change_point_radius = s, this.change_point_radius)
            for (let t = 0; t < this.datasets.length; ++t) this.datasets[t].pointRadius = Array(this.datasets[t].data.length), this.datasets[t].pointBorderWidth = Array(this.datasets[t].data.length);
        this.chartjs_object.update({
            duration: 0
        })
    }
    setMinMax() {
        const t = this.chartjs_object.options.scales.xAxes[0].id;
        this.chartjs_object.options.scales.xAxes[0].ticks.min = this.chartjs_object.scales[t].min, this.chartjs_object.options.scales.xAxes[0].ticks.max = this.chartjs_object.scales[t].max;
        for (let t in this.chartjs_object.options.scales.yAxes) {
            const s = this.chartjs_object.options.scales.yAxes[t].id;
            this.chartjs_object.options.scales.yAxes[t].ticks.min = this.chartjs_object.scales[s].min, this.chartjs_object.options.scales.yAxes[t].ticks.max = this.chartjs_object.scales[s].max
        }
    }

    resetZoom(t = !0, s = {}) {
        this.chartjs_object.options.scales.xAxes[0].ticks.min = void 0; 
        this.chartjs_object.options.scales.xAxes[0].ticks.max = void 0;
        for (let t in this.chartjs_object.options.scales.yAxes){ 
            this.chartjs_object.options.scales.yAxes[t].ticks.min = void 0;
            this.chartjs_object.options.scales.yAxes[t].ticks.max = void 0;
        }
        t && this.chartjs_object.update(Object.assign({
            duration: this.quick_mode ? 0 : 150
        }, s)), this.setMinMax()
    }
    
    unselectPoints(t = !0) {
        this.selected_points = []; 
        this.change_point_radius && this.datasets.forEach(t => {
            t.pointRadius = Array(t.data.length), t.pointBorderWidth = Array(t.data.length)
        }); 
        t && this.chartjs_object.update({
            duration: this.quick_mode ? 0 : 300
        }); 
        void 0 !== this.after_unselect_handler && this.after_unselect_handler()
    }
    clickHandler(t) {
        if ("mousedown" === t.type) {
            if (!(t.offsetX <= this.chartjs_object.chartArea.right && t.offsetX >= this.chartjs_object.chartArea.left && t.offsetY <= this.chartjs_object.chartArea.bottom && t.offsetY >= this.chartjs_object.chartArea.top)) return void(this.cancel = !0);
            switch (this.ignore_mouse_button = !1, this.previous_action = this.action, t.buttons) {
                case this.action_buttons.zoom:
                    this.action = "zoom";
                    break;
                case this.action_buttons.select:
                    this.action = "select";
                    break;
                case this.action_buttons.pan:
                    this.action = "pan";
                    break;
                default:
                    this.ignore_mouse_button = !0, t.shiftKey && (this.action = "pan", this.using_shift = !0)
            }
            if (this.chartjs_object.unbindEvents(), this.rect_selector.startX = t.offsetX, this.rect_selector.startY = t.offsetY, this.drag = !0, this.initial_time = t.timeStamp, "select" === this.action && (this.selecting_points = !0), "pan" === this.action && (this.panning = !0), this.resetPoints(), this.mouse_button_value = t.buttons, this.panning) {
                if (this.data_length > 8e3)
                    for (let t = 0; t < this.points_backup.length; ++t) this.points_backup[t] = this.datasets[t].data, this.datasets[t].data = this.datasets[t].data.filter((t, s) => 0 == (7 & s));
                this.setMinMax()
            } else this.temp_canvas.width = this.chartjs_object.canvas.offsetWidth, this.temp_canvas.height = this.chartjs_object.canvas.offsetHeight, this.temp_ctx.clearRect(0, 0, this.chartjs_object.canvas.offsetWidth, this.chartjs_object.canvas.offsetHeight), this.chartjs_object.canvas.offsetWidth !== this.chartjs_object.canvas.width || this.chartjs_object.canvas.offsetHeight !== this.chartjs_object.canvas.height ? createImageBitmap(this.chartjs_object.canvas, {
                resizeWidth: this.chartjs_object.canvas.offsetWidth,
                resizeHeight: this.chartjs_object.canvas.offsetHeight,
                resizeQuality: "high"
            }).then(t => {
                this.temp_ctx.fillStyle = this.temp_background_color, this.temp_ctx.fillRect(0, 0, this.temp_canvas.width, this.temp_canvas.height), this.temp_ctx.drawImage(t, 0, 0)
            }).catch(t => {
                this.temp_ctx.fillStyle = this.temp_background_color, this.temp_ctx.fillRect(0, 0, this.temp_canvas.width, this.temp_canvas.height), this.temp_ctx.drawImage(this.chartjs_object.canvas, 0, 0, this.chartjs_object.canvas.width, this.chartjs_object.canvas.height, 0, 0, this.chartjs_object.canvas.offsetWidth, this.chartjs_object.canvas.offsetHeight)
            }) : (this.temp_ctx.fillStyle = this.temp_background_color, this.temp_ctx.fillRect(0, 0, this.temp_canvas.width, this.temp_canvas.height), this.temp_ctx.drawImage(this.chartjs_object.canvas, 0, 0))
        }
        const s = this.chartjs_object.chartArea.right - this.chartjs_object.chartArea.left,
            e = (t.offsetX - this.chartjs_object.chartArea.left) / s,
            i = this.chartjs_object.options.scales.xAxes[0].id,
            c = (this.chartjs_object.scales[i].max - this.chartjs_object.scales[i].min) * e + this.chartjs_object.scales[i].min;
        this.selector_points.x.push(c);
        const a = this.chartjs_object.chartArea.bottom - this.chartjs_object.chartArea.top,
            h = (t.offsetY - this.chartjs_object.chartArea.top) / a;
        for (let t in this.chartjs_object.options.scales.yAxes) {
            const s = this.chartjs_object.options.scales.yAxes[t].id;
            let e;
            e = this.chartjs_object.options.scales.yAxes[t].ticks.reverse ? this.chartjs_object.scales[s].min - (this.chartjs_object.scales[s].min - this.chartjs_object.scales[s].max) * h : this.chartjs_object.scales[s].max - (this.chartjs_object.scales[s].max - this.chartjs_object.scales[s].min) * h, this.selector_points.y[s].push(e)
        }
        if ("mouseup" === t.type && (this.ignore_mouse_button || this.mouse_button_value === this.action_buttons[this.action])) {
            if (this.cancel) return void(this.cancel = !1);
            const s = t.timeStamp - this.initial_time;
            if (!this.panning && s >= this.time_limit) {
                this.chartjs_object.draw();
                let t = {
                        min: Math.min(...this.selector_points.x),
                        max: Math.max(...this.selector_points.x)
                    },
                    s = {};
                for (let t in this.chartjs_object.options.scales.yAxes) s[this.chartjs_object.options.scales.yAxes[t].id] = {
                    min: Math.min(...this.selector_points.y[this.chartjs_object.options.scales.yAxes[t].id]),
                    max: Math.max(...this.selector_points.y[this.chartjs_object.options.scales.yAxes[t].id])
                };
                if (this.selecting_points) {
                    if ("select" === this.action) {
                        let e = Array(this.data_length),
                            i = 0;
                        for (let c = 0; c < this.datasets.length; ++c) {
                            let a = this.datasets[c];
                            for (let c = 0; c < a.data.length; ++c) {
                                let h = a.data[c];
                                const o = h.x <= t.max && h.x >= t.min && h.y <= s[a.yAxisID].max && h.y >= s[a.yAxisID].min;
                                h.index = c, o ? (this.change_point_radius && (a.pointRadius[c] = 5, a.pointBorderWidth[c] = 2), e[i++] = {
                                    x: h.x,
                                    y: h.y,
                                    dataset: a.label,
                                    index: h.index
                                }) : this.change_point_radius && (a.pointRadius[c] = 3, a.pointBorderWidth[c] = 1)
                            }
                        }
                        e = e.slice(0, i), this.selected_points = e, void 0 !== this.after_select_handler && this.after_select_handler(this.selected_points)
                    }
                } else {
                    this.chartjs_object.options.scales.xAxes[0].ticks.min = t.min, this.chartjs_object.options.scales.xAxes[0].ticks.max = t.max;
                    for (let t in this.chartjs_object.options.scales.yAxes) this.chartjs_object.options.scales.yAxes[t].ticks.reverse ? (this.chartjs_object.options.scales.yAxes[t].ticks.max = s[this.chartjs_object.options.scales.yAxes[t].id].min, this.chartjs_object.options.scales.yAxes[t].ticks.min = s[this.chartjs_object.options.scales.yAxes[t].id].max) : (this.chartjs_object.options.scales.yAxes[t].ticks.max = s[this.chartjs_object.options.scales.yAxes[t].id].max, this.chartjs_object.options.scales.yAxes[t].ticks.min = s[this.chartjs_object.options.scales.yAxes[t].id].min)
                }
            } else if (s < this.time_limit) this.unselectPoints();
            else if (this.panning && this.data_length > 8e3)
                for (let t = 0; t < this.points_backup.length; ++t) this.datasets[t].data = this.points_backup[t];
            this.chartjs_object.bindEvents(), this.chartjs_object.update({
                duration: this.quick_mode ? 0 : 150
            }), this.drag = !1, this.panning = !1, this.mouse_button_value = 0, this.selecting_points = !1, this.ignore_mouse_button && !this.using_shift || (this.action = this.previous_action, this.using_shift = !1)
        }
    }
    mousemoveHandler(t) {
        if (this.drag)
            if (this.panning) {
                if ("pan" === this.action) {
                    const s = t.offsetX - this.rect_selector.startX,
                        e = t.offsetY - this.rect_selector.startY;
                    this.rect_selector.startX += s, this.rect_selector.startY += e;
                    const i = this.chartjs_object.options.scales.xAxes[0].id,
                        c = (this.chartjs_object.scales[i].max - this.chartjs_object.scales[i].min) * s / (this.chartjs_object.chartArea.right - this.chartjs_object.chartArea.left);
                    this.chartjs_object.options.scales.xAxes[0].ticks.min -= c, this.chartjs_object.options.scales.xAxes[0].ticks.max -= c;
                    const a = e / (this.chartjs_object.chartArea.bottom - this.chartjs_object.chartArea.top);
                    for (let t in this.chartjs_object.options.scales.yAxes) {
                        const s = this.chartjs_object.options.scales.yAxes[t].id;
                        let e = (this.chartjs_object.scales[s].max - this.chartjs_object.scales[s].min) * a;
                        this.chartjs_object.options.scales.yAxes[t].ticks.reverse && (e = -e), this.chartjs_object.options.scales.yAxes[t].ticks.min += e, this.chartjs_object.options.scales.yAxes[t].ticks.max += e
                    }
                    this.chartjs_object.update({
                        duration: 0
                    })
                }
            } else {
                this.rect_selector.w = t.offsetX - this.rect_selector.startX, this.rect_selector.h = t.offsetY - this.rect_selector.startY, this.ctx.clearRect(0, 0, this.chartjs_object.canvas.offsetWidth, this.chartjs_object.canvas.offsetHeight), this.ctx.drawImage(this.temp_canvas, 0, 0);
                const s = this.ctx.strokeStyle;
                this.ctx.strokeStyle = "#444", this.ctx.strokeRect(this.rect_selector.startX, this.rect_selector.startY, this.rect_selector.w, this.rect_selector.h), this.ctx.strokeStyle = s
            }
    }
    resetPoints() {
        this.selector_points.y = Object.assign({}, ...Object.keys(this.chartjs_object.scales).map(t => ({
            [t]: []
        }))), this.selector_points.x = []
    }
    setAction(t) {
        this.action = t, this.previous_action = this.action
    }
    setAfterSelectHandler(t) {
        this.after_select_handler = t
    }
    setAfterUnselectHandler(t) {
        this.after_unselect_handler = t
    }
    setZoomXFactor(t) {
        this.zoom_x_factor = t
    }
    setZoomYFactor(t) {
        this.zoom_y_factor = t
    }
    setBackgroundColor(t) {
        this.temp_background_color = t
    }
    zoom(t) {
        t.preventDefault(), void 0 !== this.chartjs_object.options.scales.xAxes[0].ticks.min && void 0 !== this.chartjs_object.options.scales.xAxes[0].ticks.max || this.setMinMax();
        const s = -.1 * Math.sign(t.deltaY),
            e = this.chartjs_object.chartArea.right - this.chartjs_object.chartArea.left,
            i = (t.offsetX - this.chartjs_object.chartArea.left) / e,
            c = this.chartjs_object.options.scales.xAxes[0].ticks.max - this.chartjs_object.options.scales.xAxes[0].ticks.min;
        this.chartjs_object.options.scales.xAxes[0].ticks.min += this.zoom_x_factor * s * i * c, this.chartjs_object.options.scales.xAxes[0].ticks.max -= this.zoom_x_factor * s * (1 - i) * c;
        const a = this.chartjs_object.chartArea.bottom - this.chartjs_object.chartArea.top,
            h = (t.offsetY - this.chartjs_object.chartArea.top) / a;
        for (let t in this.chartjs_object.options.scales.yAxes) {
            const e = this.chartjs_object.options.scales.yAxes[t].ticks.max - this.chartjs_object.options.scales.yAxes[t].ticks.min;
            this.chartjs_object.options.scales.yAxes[t].ticks.reverse ? (this.chartjs_object.options.scales.yAxes[t].ticks.min += this.zoom_y_factor * s * h * e, this.chartjs_object.options.scales.yAxes[t].ticks.max -= this.zoom_y_factor * s * (1 - h) * e) : (this.chartjs_object.options.scales.yAxes[t].ticks.min += this.zoom_y_factor * s * (1 - h) * e, this.chartjs_object.options.scales.yAxes[t].ticks.max -= this.zoom_y_factor * s * h * e)
        }
        this.chartjs_object.update({
            duration: this.quick_mode ? 0 : 50
        })
    }
    destroy() {
        this.canvas = null, this.chartjs_object = null, this.ctx = null, this.datasets = null, this.temp_canvas = null, this.temp_ctx = null
    }
    removeEventListeners() {
        for (let t in this.event_handlers) this.canvas.removeEventListener(t, this.event_handlers[t])
    }
    initialize(t, s = "white") {
        this.temp_canvas = document.createElement("canvas"), this.temp_ctx = this.temp_canvas.getContext("2d", {
            alpha: !1
        }), this.temp_background_color = s, this.rect_selector = {}, this.selector_points = {
            x: [],
            y: {}
        }, this.resetPoints(), this.setMinMax(), this.drag = !1, this.mouse_button_value = 0, this.selecting_points = !1, this.panning = !1, this.initial_time = 0, this.cancel = !1, this.time_limit = 200, this.selected_points = [], this.points_backup = Array(this.datasets.length), this.action = "zoom", this.zoom_x_factor = 1, this.zoom_y_factor = 1, this.action_buttons = {
            zoom: 0,
            select: 0,
            pan: 0
        }, void 0 !== t && (this.action_buttons.zoom = void 0 !== t.zoom ? t.zoom : 0, this.action_buttons.select = void 0 !== t.select ? t.select : 0, this.action_buttons.pan = void 0 !== t.pan ? t.pan : 0), this.event_handlers = {
            mousedown: this.clickHandler.bind(this),
            mouseup: this.clickHandler.bind(this),
            mousemove: this.mousemoveHandler.bind(this),
            dblclick: () => {
                this.resetZoom()
            },
            wheel: this.zoom.bind(this)
        };
        for (let t in this.event_handlers) this.chartjs_object.canvas.addEventListener(t, this.event_handlers[t])
    }
}