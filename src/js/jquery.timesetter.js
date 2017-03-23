/**
 * Author: Sandun Angelo Perera & Ben Scobie
 * Date: 2017-03-17
 * Description: jquery-timesetter is a jQuery plugin which generates a UI component which is useful to take user inputs or 
 * to display time values with hour and minutes in a friendly format. UI provide intutive behaviours for better user experience 
 * such as validations in realtime and keyboard arrow key support.
 * Dependency: 
 *              jQuery >=1.7.0
 *              bootstrap css: https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
 * 
 * https://github.com/benscobie/jquery-timesetter
 */

(function ($) {
    /**
	 * Support function to construct string with padded with a given character to the left side.
	 */
    function padLeft(value, l, c) {
        return Array(l - value.toString().length + 1).join(c || " ") + value.toString();
    }

    /**
     * Initialize all the time setter controls in the document.
     */
    $.fn.timesetter = function (options) {
        var self = this;

        /**
         * unit is taken out from self.settings to make it globally affect as currently user is concern about which unit to change.
         */
        var currentlySelectedUnit = "minutes"; /* minutes or hours */
        var inputHourTextbox = null;
        var inputMinuteTextbox = null;
        var currentHourValue = null;
        var currentMinuteValue = null;
        var btnUp = null;
        var btnDown = null;
        var container = null;
        var htmlTemplate =
            '<div class="timesetter-container">' +
            '<div class="timesetter-time-value-border">' +
            '<input type="text" class="timesetter-time-part timesetter-hours hours" data-unit="hours" autocomplete="off" />' +
            '<span class="timesetter-hour-symbol"></span>' +
            '<span class="timesetter-time-delimiter">:</span>' +
            '<input type="text" class="timesetter-time-part timesetter-minutes minutes" data-unit="minutes" autocomplete="off" />' +
            '<span class="timesetter-minute-symbol"></span>' +
            '<div class="timesetter-button-time-control">' +
            '<div type="button" data-direction="increment" class="timesetter-btn-up timesetter-updown-button">' +
            '<i class="glyphicon glyphicon-triangle-top"></i>' +
            '</div>' +
            '<div type="button" data-direction="decrement" class="timesetter-btn-down timesetter-updown-button">' +
            '<i class="glyphicon glyphicon-triangle-bottom"></i>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        /**
         * get max length based on input field options max value.
         */
        var getMaxLength = function (unitSettings) {
            return unitSettings.max.toString().length;
        };

        /**
         * save the element options' values as a data value within the element.
         */
        var updateSettings = function (options) {
            if (options) {
                self.settings = $.extend(self.settings, options);
            }
            else {
                self.settings = self.getDefaultSettings();
            }
        };

        /**
        * Capture the time unit which is about to update from events.
        */
        var unitChanged = function (sender) {
            currentlySelectedUnit = $(sender).data("unit");
        };

        /**
         * Change the time setter values from UI events.
         */
        var updateTimeValue = function (sender) {
            var direction = $(sender).data("direction");
            var newHourValue;
            var newMinuteValue;

            if (currentlySelectedUnit === "hours") {
                newHourValue = 0;

                if (direction === "decrement") {
                    newHourValue = currentHourValue - self.settings.hour.step;

                    // tolerate the wrong step number and move to a valid step
                    if ((newHourValue % self.settings.hour.step) > 0) {
                        newHourValue = (newHourValue - (newHourValue % self.settings.hour.step)); // set to the previous adjacent step
                    }

                    if (newHourValue <= self.settings.hour.min) {
                        newHourValue = self.settings.hour.min;
                    }
                }
                else if (direction === "increment") {
                    newHourValue = currentHourValue + self.settings.hour.step;

                    // tolerate the wrong step number and move to a valid step
                    if ((newHourValue % self.settings.hour.step) > 0) {
                        newHourValue = (newHourValue - (newHourValue % self.settings.hour.step)); // set to the previous adjacent step
                    }

                    if (newHourValue >= self.settings.hour.max) {
                        newHourValue = self.settings.hour.max - self.settings.hour.step;
                    }
                }

                self.setHour(newHourValue);
                inputHourTextbox.select();
            }
            else if (currentlySelectedUnit === "minutes") {
                newHourValue = currentHourValue;
                newMinuteValue = currentMinuteValue;

                if (direction === "decrement") {
                    newMinuteValue = currentMinuteValue - self.settings.minute.step;

                    // tolerate the wrong step number and move to a valid step
                    if ((newMinuteValue % self.settings.minute.step) > 0) {
                        newMinuteValue = (newMinuteValue - (newMinuteValue % self.settings.minute.step)); // set to the previuos adjacent step
                    }

                    if (newHourValue <= self.settings.hour.min &&
                        currentMinuteValue <= self.settings.minute.min) {
                        newHourValue = self.settings.hour.min;
                        newMinuteValue = self.settings.minute.min;
                    }
                }
                else if (direction === "increment") {
                    newMinuteValue = currentMinuteValue + self.settings.minute.step;

                    // tolerate the wrong step number and move to a valid step
                    if ((newMinuteValue % self.settings.minute.step) > 0) {
                        newMinuteValue = (newMinuteValue - (newMinuteValue % self.settings.minute.step)); // set to the previous adjacent step
                    }

                    if (newHourValue >= (self.settings.hour.max - self.settings.hour.step) &&
                        currentMinuteValue >= (self.settings.minute.max - self.settings.minute.step)) {
                        newHourValue = self.settings.hour.max - self.settings.hour.step;
                        newMinuteValue = self.settings.minute.max - self.settings.minute.step;
                    }
                }

                // change the hour value when the minute value exceed its limits
                if (newMinuteValue >= self.settings.minute.max && newHourValue != self.settings.hour.max && newMinuteValue) {
                    newMinuteValue = self.settings.minute.min;
                    newHourValue = currentHourValue + self.settings.hour.step;
                }
                else if (newMinuteValue < self.settings.minute.min && currentHourValue >= self.settings.hour.step) {
                    newMinuteValue = self.settings.minute.max - self.settings.minute.step;
                    newHourValue = currentHourValue - self.settings.hour.step;
                }
                else if (newMinuteValue < self.settings.minute.min && currentHourValue < self.settings.hour.step) {
                    newMinuteValue = self.settings.minute.min;
                    newHourValue = self.settings.hour.min;
                }

                self.setHourAndMinute(newHourValue, newMinuteValue);
                inputMinuteTextbox.select();
            }
        };

        /**
         * Change the time setter values from arrow up/down key events
         */
        var updateTimeValueByArrowKeys = function (sender, event) {
            switch (event.which) {
                case 13: // return
                    break;

                case 37: // left
                    break;

                case 38: // up
                    btnUp.click();
                    break;

                case 39: // right
                    break;

                case 40: // down
                    btnDown.click();
                    break;

                default: return; // exit this handler for other keys
            }

            event.preventDefault(); // prevent the default action (scroll / move caret)
            $(sender).select();
        };

        /**
         * apply sanitization to the input value and apply corrections.
         */
        var formatValue = function (value, unitChanged) {
            var currentValue = value;
            var unitSettings;
            if (unitChanged === "hours") {
                unitSettings = self.settings.hour;
            }
            else if (unitChanged === "minutes") {
                unitSettings = self.settings.minute;
            }

            var maxLengthUnitSettings = getMaxLength(unitSettings);

            if (!$.isNumeric(value)) {
                value = unitSettings.min;
            } else {
                value = parseInt(parseFloat(value));

                // tolerate the wrong step number and move to a valid step
                // ex: user enter 20 while step is 15, auto correct to 15
                if (value > unitSettings.max) {
                    value = unitSettings.max - unitSettings.step;
                }
                else if (value < unitSettings.min) {
                    value = unitSettings.min;
                }
                else if ((value % unitSettings.step) > 0) {
                    value = (value - (value % unitSettings.step)); // set to the previous adjacent step  
                }
                else if (value >= Math.pow(10, maxLengthUnitSettings)) {
                    value = (Math.pow(10, maxLengthUnitSettings) - 1);
                }
            }

            value = padLeft(value, getMaxLength(unitSettings), self.settings.numberPaddingChar);
            return value;
        };

        /**
         * get the hour value from the control.
         */
        self.getHours = function () {
            return currentHourValue;
        };

        /**
         * get the minute value from the control.
         */
        self.getMinutes = function () {
            return currentMinuteValue;
        };

        /**
         * get the total number of minutes from the control.
         */
        self.getTotalMinutes = function () {
            return ((self.getHours() * 60) + self.getMinutes());
        };

        self.setHourAndMinute = function (newHourValue, newMinuteValue) {
            var updatedHours = setHourInternal(newHourValue);
            var updatedMinutes = setMinuteInternal(newMinuteValue);

            if (updatedHours || updatedMinutes) {
                wrapper.change();
            }

            return this;
        }

        var setHourInternal = function (newHourValue) {
            var newFormattedValue = formatValue(newHourValue, "hours");
            inputHourTextbox.val(newFormattedValue);

            if (currentHourValue != parseInt(newFormattedValue)) {
                currentHourValue = parseInt(newFormattedValue);
                container.attr("data-hour-value", self.getHours());
                return true;
            }

            return false;
        };

        /**
         * set the hour value to the control.
         */
        self.setHour = function (newHourValue) {
            if (setHourInternal(newHourValue)) {
                wrapper.change();
            }

            return this;
        };

        var setMinuteInternal = function (newMinuteValue) {
            var newFormattedValue = formatValue(newMinuteValue, "minutes");
            inputMinuteTextbox.val(newFormattedValue);

            if (currentMinuteValue != parseInt(newFormattedValue)) {
                currentMinuteValue = parseInt(newFormattedValue);
                container.attr("data-minute-value", self.getMinutes());
                return true;
            }

            return false;
        };

        /**
         * set the minute value to the control.
         */
        self.setMinute = function (newMinuteValue) {
            if (setMinuteInternal(newMinuteValue)) {
                wrapper.change();
            }

            return this;
        };

        /**
         * set the values by calculating based on total number of minutes by caller.
         */
        self.setTotalMinutes = function (totalMinutes) {
            var hourValue = 0;
            var minuteValue = 0;

            // total minutes must be less than total minutes per day
            if (totalMinutes && totalMinutes > 0 && totalMinutes < (24 * 60)) {
                minuteValue = (totalMinutes % 60);
                hourValue = ((totalMinutes - minuteValue) / 60);
            }

            setHourInternal(hourValue);
            setMinuteInternal(minuteValue);
            return this;
        };

        /**
         * plugin default options for the element
         */
        self.getDefaultSettings = function () {
            return {
                hour: {
                    value: 0,
                    min: 0,
                    max: 24,
                    step: 1,
                    symbol: "h"
                },
                minute: {
                    value: 0,
                    min: 0,
                    max: 60,
                    step: 15,
                    symbol: "mins"
                },
                numberPaddingChar: '0' // number left padding character ex: 00052
            };
        };

        /**
         * plugin options for the element
         */
        self.settings = self.getDefaultSettings();

        var wrapper = $(this);
        if (wrapper.find(".timesetter-container").length !== 1) {
            wrapper.html(htmlTemplate);
        }

        container = wrapper.find(".timesetter-container");
        inputHourTextbox = container.find('.timesetter-hours');
        inputMinuteTextbox = container.find('.timesetter-minutes');

        updateSettings(options);

        // set default values
        if (currentHourValue === null) setHourInternal(self.settings.hour.min);
        if (currentMinuteValue === null) setMinuteInternal(self.settings.minute.min);

        btnUp = container.find('.timesetter-btn-up');
        btnDown = container.find('.timesetter-btn-down');
        btnUp.unbind('click').bind('click', function (event) { updateTimeValue(this, event); });
        btnDown.unbind('click').bind('click', function (event) { updateTimeValue(this, event); });

        inputHourTextbox.unbind('focusin').bind('focusin', function (event) { $(this).select(); unitChanged(this, event); });
        inputMinuteTextbox.unbind('focusin').bind('focusin', function (event) { $(this).select(); unitChanged(this, event); });

        inputHourTextbox.unbind('keydown').bind('keydown', function (event) { updateTimeValueByArrowKeys(this, event); });
        inputMinuteTextbox.unbind('keydown').bind('keydown', function (event) { updateTimeValueByArrowKeys(this, event); });

        inputHourTextbox.change(function (e) { self.setHour($(this).val()); e.stopPropagation(); });
        inputMinuteTextbox.change(function (e) { self.setMinute($(this).val()); e.stopPropagation(); });

        var timesetterHourSymbolSpan = inputHourTextbox.siblings("span.timesetter-hour-symbol:first");
        timesetterHourSymbolSpan.text(self.settings.hour.symbol);

        var timesetterMinuteSymbolSpan = inputMinuteTextbox.siblings("span.timesetter-minute-symbol:first");
        timesetterMinuteSymbolSpan.text(self.settings.minute.symbol);

        return this;
    };

}(jQuery));