const Main = imports.ui.main;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const _minariSpecialDayNames = new Array(
    'Hëður',
    'Rideyy',
    'Morkh',
    'Morkh+',
    'Khmerd',
    'Chamog'
);

const _minariWeekdayNames = new Array(
    'Ro\'unn',
    'Mïrdu',
    'Hëmi',
    'Drak',
    'Þodon',
    'Charm'
);

const _minariMonthNames = new Array(
    null,
    'Mëbel',
    'Dirann',
    'Ma\'uþ',
    'Gerub',
    'Þrei',
    'Dimoc',
    'Xentor',
    'Mëðïr',
    'Draþ',
    'Quaden',
    'Ridïmel',
    'Rodom'
);

let _updateInterval = 5;

function MinariDate() {
    this._init();
}

MinariDate.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this.label = new St.Label({ text: 'Initializing' });
        this.actor.add_actor(this.label);
    },

    _updateDate: function() {
        let today = new Date();

        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        today.setDate(today.getDate() + 11);
        let leapCheck = new Date(today.getFullYear(), 1, 29);
        let minariLeap = (leapCheck.getDate() == 29);
        let oneJan = new Date(today.getFullYear(), 0, 1);
        let doy = Math.ceil((today - oneJan) / 86400000);
        let minariYear = today.getFullYear() - 1873;
        let minariMonth = 0;
        let minariDoy = 0;
        let minariDay = 0;
        let minariWeekday = 0;
        let minariSpecialDay = -1;

        switch (doy) {
            case 0:
                minariMonth = 0;
                minariDay = 0;
                minariSpecialDay = 0;

                break;
            case 91:
                minariMonth = 0;
                minariDay = 0;
                minariSpecialDay = 1;

                break;
            case 182:
                minariMonth = 0;
                minariDay = 0;
                minariSpecialDay = 2;

                break;
            case 183:
                if (minariLeap) {
                    minariMonth = 0;
                    minariDay = 0;
                    minariSpecialDay = 3;
                }

                break;
            case 273:
                if (!minariLeap) {
                    minariMonth = 0;
                    minariDay = 0;
                    minariSpecialDay = 4;
                }

                break;
            case 274:
                if (minariLeap) {
                    minariMonth = 0;
                    minariDay = 0;
                    minariSpecialDay = 4;
                }

                break;
            case 364:
                if (!minariLeap) {
                    minariMonth = 0;
                    minariDay = 0;
                    minariSpecialDay = 5;
                }

                break;
            case 365:
                minariMonth = 0;
                minariDay = 0;
                minariSpecialDay = 5;

                break;
        }

        if (minariSpecialDay == -1) {
            let decr = 0;
            minariDoy = doy;

            if (minariDoy > 0) {
                decr++;
            }

            if (minariDoy > 91) {
                decr++;
            }

            if (minariDoy > 182) {
                decr++;
            }

            if ((minariDoy > 183) && minariLeap) {
                decr++;
            }

            if ((minariDoy > 273) && !minariLeap) {
                decr++;
            }

            if ((minariDoy > 274) && minariLeap) {
                decr++;
            }

            minariDoy = minariDoy - decr + 1;

            minariMonth = Math.ceil(minariDoy / 30);
            minariDay = minariDoy % 30;

            if (minariDay == 0) {
                minariDay = 30;
            }

            minariWeekday = minariDay % 6;
        }

        let new_text = minariYear + ' ' + ((minariSpecialDay == -1) ? _minariMonthNames[minariMonth] + ' ' + minariDay + ' (' + _minariWeekdayNames[minariWeekday] + ')' : _minariSpecialDayNames[minariSpecialDay]);

        this.label.set_text(new_text);

        _timer = MainLoop.timeout_add_seconds(_updateInterval, Lang.bind(_indicator, _indicator._updateDate));
    }
};

function init(metadata) {
}

let _indicator;
let _timer;

function enable() {
    _indicator = new MinariDate;
    Main.panel.addToStatusArea('minari_date', _indicator, null, 'center');
    _indicator._updateDate();
    _timer = MainLoop.timeout_add_seconds(_updateInterval, Lang.bind(_indicator, _indicator._updateDate));
}

