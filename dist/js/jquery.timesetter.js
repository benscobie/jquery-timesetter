"use strict";

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
        var unit = "minutes"; /* minutes or hours */
        var inputHourTextbox = null;
        var inputMinuteTextbox = null;
        var btnUp = null;
        var btnDown = null;
        var container = null;
        var htmlTemplate = '<div class="timesetter-container">' + '<div class="timesetter-time-value-border">' + '<input type="text" class="timesetter-time-part timesetter-hours hours" data-unit="hours" autocomplete="off" />' + '<span class="timesetter-hour-symbol"></span>' + '<span class="timesetter-time-delimiter">:</span>' + '<input type="text" class="timesetter-time-part timesetter-minutes minutes" data-unit="minutes" autocomplete="off" />' + '<span class="timesetter-minute-symbol"></span>' + '<div class="timesetter-button-time-control">' + '<div type="button" data-direction="increment" class="timesetter-btn-up timesetter-updown-button">' + '<i class="glyphicon glyphicon-triangle-top"></i>' + '</div>' + '<div type="button" data-direction="decrement" class="timesetter-btn-down timesetter-updown-button">' + '<i class="glyphicon glyphicon-triangle-bottom"></i>' + '</div>' + '</div>' + '</div>' + '<label class="timesetter-postfix-position"></label>' + '</div>';

        /**
         * get max length based on input field options max value.
         */
        var getMaxLength = function getMaxLength(unitSettings) {
            return unitSettings.max.toString().length;
        };

        /**
         * save the element options' values as a data value within the element.
         */
        var saveOptions = function saveOptions(options) {
            if (options) {
                self.settings = $.extend(self.settings, options);
            } else {
                self.settings = self.getDefaultSettings();
            }

            return self.settings;
        };

        /**
        * Capture the time unit which is about to update from events.
        */
        var unitChanged = function unitChanged(sender) {
            unit = $(sender).data("unit");
        };

        /**
         * Change the time setter values from UI events.
         */
        var updateTimeValue = function updateTimeValue(sender) {
            self.settings.hour.value = parseInt(inputHourTextbox.val());
            self.settings.minute.value = parseInt(inputMinuteTextbox.val());

            var direction = $(sender).data("direction");

            // validate hour and minute values
            if (isNaN(self.settings.hour.value)) {
                self.settings.hour.value = self.settings.hour.min;
            }

            if (isNaN(self.settings.minute.value)) {
                self.settings.minute.value = self.settings.minute.min;
            }

            var oldHourValue;
            var newHourValue;
            var oldMinuteValue;
            var newMinuteValue;

            // update time setter by changing hour value
            if (unit === "hours") {
                oldHourValue = parseInt($(inputHourTextbox).val().trim());
                newHourValue = 0;

                if (direction === "decrement") {
                    newHourValue = oldHourValue - self.settings.hour.step;

                    // tolerate the wrong step number and move to a valid step
                    if (newHourValue % self.settings.hour.step > 0) {
                        newHourValue = newHourValue - newHourValue % self.settings.hour.step; // set to the previous adjacent step
                    }

                    if (newHourValue <= self.settings.hour.min) {
                        newHourValue = self.settings.hour.min;
                    }
                } else if (direction === "increment") {
                    newHourValue = oldHourValue + self.settings.hour.step;

                    // tolerate the wrong step number and move to a valid step
                    if (newHourValue % self.settings.hour.step > 0) {
                        newHourValue = newHourValue - newHourValue % self.settings.hour.step; // set to the previous adjacent step
                    }

                    if (newHourValue >= self.settings.hour.max) {
                        newHourValue = self.settings.hour.max - self.settings.hour.step;
                    }
                }

                $(inputHourTextbox).val(padLeft(newHourValue.toString(), getMaxLength(self.settings.hour), self.settings.numberPaddingChar));
                $(container).attr("data-hour-value", newHourValue);
                $(inputHourTextbox).select();
            } else if (unit === "minutes") // update time setter by changing minute value
                {
                    oldHourValue = self.settings.hour.value;
                    newHourValue = oldHourValue;
                    oldMinuteValue = self.settings.minute.value;
                    newMinuteValue = oldMinuteValue;

                    if (direction === "decrement") {
                        newMinuteValue = oldMinuteValue - self.settings.minute.step;

                        // tolerate the wrong step number and move to a valid step
                        if (newMinuteValue % self.settings.minute.step > 0) {
                            newMinuteValue = newMinuteValue - newMinuteValue % self.settings.minute.step; // set to the previuos adjacent step
                        }

                        if (newHourValue <= self.settings.hour.min && oldMinuteValue <= self.settings.minute.min) {
                            newHourValue = self.settings.hour.min;
                            newMinuteValue = self.settings.minute.min;
                        }
                    } else if (direction === "increment") {
                        newMinuteValue = oldMinuteValue + self.settings.minute.step;

                        // tolerate the wrong step number and move to a valid step
                        if (newMinuteValue % self.settings.minute.step > 0) {
                            newMinuteValue = newMinuteValue - newMinuteValue % self.settings.minute.step; // set to the previous adjacent step
                        }

                        if (newHourValue >= self.settings.hour.max - self.settings.hour.step && oldMinuteValue >= self.settings.minute.max - self.settings.minute.step) {
                            newHourValue = self.settings.hour.max - self.settings.hour.step;
                            newMinuteValue = self.settings.minute.max - self.settings.minute.step;
                        }
                    }

                    // change the hour value when the minute value exceed its limits
                    if (newMinuteValue >= self.settings.minute.max && newHourValue != self.settings.hour.max && newMinuteValue) {
                        newMinuteValue = self.settings.minute.min;
                        newHourValue = oldHourValue + self.settings.hour.step;
                    } else if (newMinuteValue < self.settings.minute.min && oldHourValue >= self.settings.hour.step) {
                        newMinuteValue = self.settings.minute.max - self.settings.minute.step;
                        newHourValue = oldHourValue - self.settings.hour.step;
                    } else if (newMinuteValue < self.settings.minute.min && oldHourValue < self.settings.hour.step) {
                        newMinuteValue = self.settings.minute.min;
                        newHourValue = self.settings.hour.min;
                    }

                    $(inputHourTextbox).val(padLeft(newHourValue.toString(), getMaxLength(self.settings.hour), self.settings.numberPaddingChar));
                    $(inputMinuteTextbox).val(padLeft(newMinuteValue.toString(), getMaxLength(self.settings.minute), self.settings.numberPaddingChar));
                    $(container).attr("data-hour-value", newHourValue);
                    $(container).attr("data-minute-value", newMinuteValue);
                    $(inputMinuteTextbox).select();
                }

            if (oldHourValue != newHourValue || oldMinuteValue != newMinuteValue) {
                self.trigger('change.timesetter', [{
                    hour: self.getHoursValue(),
                    minute: self.getMinutesValue()
                }]);
            }
        };

        /**
         * Change the time setter values from arrow up/down key events
         */
        var updateTimeValueByArrowKeys = function updateTimeValueByArrowKeys(sender, event) {
            switch (event.which) {
                case 13:
                    // return
                    break;

                case 37:
                    // left
                    break;

                case 38:
                    // up
                    btnUp.click();
                    break;

                case 39:
                    // right
                    break;

                case 40:
                    // down
                    btnDown.click();
                    break;

                default:
                    return; // exit this handler for other keys
            }

            event.preventDefault(); // prevent the default action (scroll / move caret)
            $(sender).select();
        };

        /**
         * apply sanitization to the input value and apply corrections.
         */
        var formatInput = function formatInput(e) {
            var element = $(e.target);
            var unitSettings;

            if (unit === "hours") {
                unitSettings = self.settings.hour;
            } else if (unit === "minutes") {
                unitSettings = self.settings.minute;
            }

            var maxLength = getMaxLength(unitSettings);

            if (!$.isNumeric(element.val())) {
                $(element).val(padLeft(unitSettings.min.toString(), getMaxLength(unitSettings), self.settings.numberPaddingChar));
                return false;
            }

            var value = parseInt(parseFloat(element.val()));
            var maxLengthUnitSettings = getMaxLength(unitSettings);

            // tolerate the wrong step number and move to a valid step
            // ex: user enter 20 while step is 15, auto correct to 15
            if (value >= unitSettings.max) {
                value = unitSettings.max - unitSettings.step;
                $(element).val(padLeft(value.toString(), maxLengthUnitSettings, self.settings.numberPaddingChar));
                return false;
            } else if (value <= unitSettings.min) {
                $(element).val(padLeft(unitSettings.min.toString(), maxLengthUnitSettings, self.settings.numberPaddingChar));
                return false;
            } else if (padLeft(value.toString(), maxLengthUnitSettings, self.settings.numberPaddingChar) !== $(element).val()) {
                $(element).val(padLeft(value.toString(), maxLengthUnitSettings, self.settings.numberPaddingChar));
                return false;
            } else if (value % unitSettings.step > 0) {
                value = value - value % unitSettings.step; // set to the previous adjacent step
                $(element).val(padLeft(value.toString(), maxLengthUnitSettings, self.settings.numberPaddingChar));
                return false;
            }

            //if the letter is not digit then display error and don't type anything
            if (e.which != 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
                //display error message
                return false;
            }

            if (value >= Math.pow(10, maxLengthUnitSettings)) {
                $(element).val(padLeft((Math.pow(10, maxLengthUnitSettings) - 1).toString(), maxLengthUnitSettings, self.settings.numberPaddingChar));
                return false;
            }
        };

        /**
         * get the hour value from the control.
         */
        self.getHoursValue = function () {
            if ($.isNumeric(inputHourTextbox.val())) {
                return parseInt(inputHourTextbox.val());
            }
            return self.settings.hour.min;
        };

        /**
         * get the minute value from the control.
         */
        self.getMinutesValue = function () {
            if ($.isNumeric(inputMinuteTextbox.val())) {
                return parseInt(inputMinuteTextbox.val());
            }
            return self.settings.minute.min;
        };

        /**
         * get the total number of minutes from the control.
         */
        self.getTotalMinutes = function () {
            var hourValue = 0;
            var minuteValue = 0;

            if ($.isNumeric(inputHourTextbox.val()) && $.isNumeric(inputMinuteTextbox.val())) {
                hourValue = parseInt(inputHourTextbox.val());
                minuteValue = parseInt(inputMinuteTextbox.val());
            }
            return hourValue * 60 + minuteValue;
        };

        /**
         * get the postfix display text.
         */
        self.getPostfixText = function () {
            return container.find(".timesetter-postfix-position").text();
        };

        /**
         * set the hour value to the control.
         */
        self.setHour = function (hourValue) {
            if ($.isNumeric(hourValue)) {
                inputHourTextbox.val(hourValue);
            } else {
                inputHourTextbox.val(padLeft(self.settings.hour.min.toString(), getMaxLength(self.settings.hour), self.settings.numberPaddingChar));
            }

            unit = "hours";
            inputHourTextbox.change();
            return this;
        };

        /**
         * set the minute value to the control.
         */
        self.setMinute = function (minuteValue) {
            if ($.isNumeric(minuteValue)) {
                inputMinuteTextbox.val(minuteValue);
            } else {
                inputMinuteTextbox.val(padLeft(self.settings.minute.min.toString(), getMaxLength(self.settings.minute), self.settings.numberPaddingChar));
            }
            unit = "minutes";
            inputMinuteTextbox.change();
            return this;
        };

        /**
         * set the values by calculating based on total number of minutes by caller.
         */
        self.setValuesByTotalMinutes = function (totalMinutes) {
            var hourValue = 0;
            var minuteValue = 0;

            // total minutes must be less than total minutes per day
            if (totalMinutes && totalMinutes > 0 && totalMinutes < 24 * 60) {
                minuteValue = totalMinutes % 60;
                hourValue = (totalMinutes - minuteValue) / 60;
            }

            inputHourTextbox.val(padLeft(hourValue.toString(), getMaxLength(self.settings.hour), self.settings.numberPaddingChar));
            inputMinuteTextbox.val(padLeft(minuteValue.toString(), getMaxLength(self.settings.minute), self.settings.numberPaddingChar));

            // trigger formattings
            unit = "minutes";
            inputMinuteTextbox.change(); // one event is enough to do formatting one time for all the input fields
            return this;
        };

        /**
         * set the postfix display text.
         */
        self.setPostfixText = function (textValue) {
            container.find(".timesetter-postfix-position").text(textValue);
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
                postfixText: "", // text to display after the input fields
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

        saveOptions(options);

        btnUp = container.find('.timesetter-btn-up');
        btnDown = container.find('.timesetter-btn-down');
        btnUp.unbind('click').bind('click', function (event) {
            updateTimeValue(this, event);
        });
        btnDown.unbind('click').bind('click', function (event) {
            updateTimeValue(this, event);
        });

        inputHourTextbox.unbind('focusin').bind('focusin', function (event) {
            $(this).select();unitChanged(this, event);
        });
        inputMinuteTextbox.unbind('focusin').bind('focusin', function (event) {
            $(this).select();unitChanged(this, event);
        });

        inputHourTextbox.unbind('keydown').bind('keydown', function (event) {
            updateTimeValueByArrowKeys(this, event);
        });
        inputMinuteTextbox.unbind('keydown').bind('keydown', function (event) {
            updateTimeValueByArrowKeys(this, event);
        });

        container.find("input[type=text]").each(function () {
            $(this).change(function (e) {
                formatInput(e);
            });
        });

        // set default values
        if (inputHourTextbox.val().length === 0) {
            inputHourTextbox.val(padLeft(self.settings.hour.min.toString(), getMaxLength(self.settings.hour), self.settings.numberPaddingChar));
        }

        if (inputMinuteTextbox.val().length === 0) {
            inputMinuteTextbox.val(padLeft(self.settings.minute.min.toString(), getMaxLength(self.settings.minute), self.settings.numberPaddingChar));
        }

        var timesetterHourSymbolSpan = inputHourTextbox.siblings("span.timesetter-hour-symbol:first");
        timesetterHourSymbolSpan.text(self.settings.hour.symbol);

        var timesetterMinuteSymbolSpan = inputMinuteTextbox.siblings("span.timesetter-minute-symbol:first");
        timesetterMinuteSymbolSpan.text(self.settings.minute.symbol);

        var postfixLabel = container.find(".timesetter-postfix-position");
        postfixLabel.text(self.settings.postfixText);

        return this;
    };
})(jQuery);
