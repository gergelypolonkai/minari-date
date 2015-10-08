/*
 * Minari Date extension for GNOME Shell
 *
 * Copyright © 2014-2015
 *     Gergely Polonkai <gergely@polonkai.eu>
 *
 * This file is part of gnome-shell-extension-minari-date.
 *
 * gnome-shell-extension-minari-date is free software: you can
 * redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * gnome-shell-extension-minari-date is distributed in the hope that
 * it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gnome-shell-extension-minari-date.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

const Main = imports.ui.main;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

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

const MinariDateButton = new Lang.Class({
    Name: 'MinariDateButton',

    Extends: PanelMenu.Button,
    updateInterval: 5,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this.panelContainer = new St.BoxLayout({style_class: "panel-box"});
        this.actor.add_actor(this.panelContainer);
        this.actor.add_style_class_name('panel-status-button');

        this.label = new St.Label({
            text: 'Initializing',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.panelContainer.add(this.label);

        this._updateDate();
        this.timer = MainLoop.timeout_add_seconds(
            this.updateInterval,
            Lang.bind(this, this._updateDate));
    },

    stop: function() {
        MainLoop.remove_source(this.timer);
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

        let new_text = minariYear + ' '
            + (
                (minariSpecialDay == -1)
                    ? _minariMonthNames[minariMonth]
                        + ' '
                        + minariDay
                        + ' ('
                        + _minariWeekdayNames[minariWeekday]
                        + ')'
                    : _minariSpecialDayNames[minariSpecialDay]);

        this.label.set_text(new_text);

        return true;
    }
});

let minariDateMenu;

function init(metadata) {
}

function enable() {
    minariDateMenu = new MinariDateButton();
    Main.panel.addToStatusArea('minaridate', minariDateMenu, null, 'center');
}

function disable() {
    minariDateMenu.stop();
    minariDateMenu.destroy();
}
