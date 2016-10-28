"use strict";

/***
 * Validator class
 * This class reads the fieldSet of the assigned dialogInstance and checks if the InputWidgets of the fieldSet have the 'validation' property.
 * InputWidgets that own a 'validation' property are given a 'change event' handler and are added to an internal list that keeps track of
 * the validation progress.
 *
 * The validation property is an array of functions where each function is responsible for validating a specific thing.
 *
 * Furthermore, the validator will also execute any functions in the onChangeFunctions property (which is also an array of functions)
 * in order to execute other 'onChange' behaviour parallel to validation.
 *
 * @param {EMMDialog} dialogInstance - Dialog to add validation to.
 * @param {function} inputSuccess - Function that is called when the input of a widget passes all validation checks.
 * @param {function} inputFail - Function that is called when the input of a widget fails a validation check.
 * @param {function} validationSuccess -  Function that is called when all widgets have passed all validation checks.
 * @param {function} validationFail - Function that is called when one or more widgets have values that didn't pass a validation check.
 * @param {function} cleanUp - Function that can cleanup the validation feedback created by the input methods.
 */
var Validator = function (dialogInstance, inputSuccess, inputFail, validationSuccess, validationFail, cleanUp) {
    var validator = this;
    this.inputStates = [];
    this.enabled = true;
    this.onChangeEnabled = true;
    this.cleanUp = cleanUp;
    this.dialogInstance = dialogInstance;
    this.fieldset = dialogInstance.fieldset;

    // assign the on-change events to the InputWidgets in the fieldSet. (if they're required)
    this.bindEvents(this.fieldset, eventWrapper);

    /**
     * wrapper function because we're using a closure to facilitate the 'return' behaviour of the validator.
     * @param {*} value - Parameter given to this method by the eventhandler, currently not used
     */
    function eventWrapper(value) {
        (function (widget) {
            // is the validator enabled?
            if (validator.enabled == true) {
                // does the widget have the validation property?
                if (widget.validation != null) {
                    // was a cleanUp function provided?
                    if (cleanUp != null) {
                        // execute the cleanUp method.
                        cleanUp(widget);
                    }
                    // Loop through the validation functions.
                    for (var i = 0; i < widget.validation.length; i++) {
                        if (widget.validation[i](validator.getWidgetValue(widget), widget).length > 0) {
                            // execute inputFail if the widget fails to pass validation
                            if (inputFail != null)
                                inputFail(widget, widget.validation[i](validator.getWidgetValue(widget), widget));
                            // set the widget to false in the input States map.
                            validator.inputStates[widget.fieldId] = false;
                            // terminate the function.
                            return false;
                        }
                    }
                }
                // execute inputSuccess because the input passed validation
                if (inputSuccess != null)
                    inputSuccess();
                // set the inputState of the widget to true
                validator.inputStates[widget.fieldId] = true;
                //This awkward way of iterating is implemented because of the restrictions
                var isValidated = true;
                $.each(validator.inputStates, function (key, val) {
                    if (!val && val != null) {
                        isValidated = false;
                        if (validationFail != null)
                            validationFail();
                        return false;
                    }
                });
                //Are we completely validated? if not, return.
                if (!isValidated) return;
                //All elements are validated, execute validationSuccess
                if (validationSuccess != null)
                    validationSuccess();
            }
        })(this);
        // execute the onChangeFunctions..
        if (validator.onChangeEnabled) {
            if (this.onChangeFunctions != null)
                for (var i = 0; i < this.onChangeFunctions.length; i++)
                    this.onChangeFunctions[i].call(validator.dialogInstance);
        }
    }
};

/**
 * Event binding helper function.
 * @param {OO.ui.FieldsetLayout} fieldSet - Fieldset to iterate containing the to be validated InputWidgets.
 * @param {function} eventFunction - Function that is executed every time the 'change' event fires.
 */
Validator.prototype.bindEvents = function (fieldSet, eventFunction) {
    //Add event handlers to the widget given by the fieldSet.
    var validator = this;
    for (var i = 0; i < fieldSet.items.length; i++) {
        //Use closure to solve issues with widget
        (function () {
            var widget = fieldSet.items[i].fieldWidget;
            fieldSet.items[i].fieldWidget.$element.find("input").focusout(function () {
                widget.emit("change", validator.getWidgetValue(widget), widget);
            });
        })();
        var widget = fieldSet.items[i].fieldWidget;
        if (widget.validation != null) {
            widget.fieldId = i;
            this.inputStates[i] = false;
            widget.connect(widget, {change: eventFunction});
        }
    }
};

/**
 * Enables the validator, preforms a cleanup on the dialog and resets the inputStates.
 */
Validator.prototype.enable = function () {
    this.enabled = true;
    this.cleanUpForm();
    this.resetInputStates();
};

/**
 * Enables the execution of the functions in the 'onChangeFunctions' property.
 */
Validator.prototype.enableOnChange = function () {
    this.onChangeEnabled = true;
};

/**
 * Disables the execution of the functions in the 'onChangeFunctions' property.
 */
Validator.prototype.disableOnChange = function () {
    this.onChangeEnabled = false;
};

/**
 * Disables the validator, preforms a cleanup on the dialog and resets the inputStates.
 */
Validator.prototype.disable = function () {
    this.enabled = false;
    this.cleanUpForm();
    this.resetInputStates();
};

/**
 * Disables the validator.
 */
Validator.prototype.softDisable = function () {
    this.enabled = false;
};

/**
 * Preforms the cleanUp function on every InputWidget with validation.
 */
Validator.prototype.cleanUpForm = function () {
    if (this.cleanUp != null) {
        for (var i = 0; i < this.fieldset.items.length; i++)
            if (this.fieldset.items[i].fieldWidget.validation != null)
                this.cleanUp(this.fieldset.items[i].fieldWidget);
    }
};

/**
 * Resets the inputStates, setting them all to false.
 */
Validator.prototype.resetInputStates = function () {
    for (var i = 0; i < this.inputStates.length; i++) {
        if (this.inputStates[i] != null)
            this.inputStates[i] = false;
    }
};

/**
 * Triggers the 'change' event to fire on all InputWidgets with validation, thus validating all of them.
 */
Validator.prototype.validateAll = function () {
    for (var i = 0; i < this.fieldset.items.length; i++) {
        if (this.fieldset.items[i].fieldWidget.validation != null)
            this.fieldset.items[i].fieldWidget.emit("change", this.getWidgetValue(this.fieldset.items[i].fieldWidget), this.fieldset.items[i].fieldWidget);
    }
};

/**
 * Triggers a 'change' event on the given InputWidget, thus attempting validating it.
 * @param {OO.ui.InputWidget} widget - Widget to validate.
 */
Validator.prototype.validateWidget = function (widget) {
    widget.emit("change", this.getWidgetValue(widget), widget);
};

/**
 * Gets a usable value from a specified InputWidget.
 * @param {OO.ui.InputWidget} widget - Widget to get the value from.
 * @returns {String} - Returns a value which can be read by the validator.
 */
Validator.prototype.getWidgetValue = function (widget) {
    if ((widget instanceof OO.ui.TextInputWidget))
        return widget.value;
    else if ((widget instanceof OO.ui.SelectFileWidget)) {
        if (widget.getValue() != null)
            return widget.getValue().name;
        else
            return null;
    }
};

/**
 * Validation method, checks if the input is a valid website.
 * @param {String} value - Input to be validated.
 * @param {OO.ui.InputWidget} sender - Object reference to the InputWidget from which the validation was executed.
 * @returns {String} - Error message to be displayed.
 */
function checkIfWebsite(value, sender) {
    var expr = /(https:\/\/|http:\/\/)?(www\.)?\[[a-z0-9]{1,256}\.[a-z]{2,6}\b\/?([a-z0-9\-@:%_\+.~#?&\/=]*)/ig;
    if (expr.test(value)) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-website")();
}

/**
 * Validation method, checks if the input isn't empty.
 * @param {String} value - Input to be validated.
 * @param {OO.ui.InputWidget} sender - Object reference to the InputWidget from which the validation was executed.
 * @returns {String} - Error message to be displayed.
 */
function checkIfEmpty(value, sender) {
    if (value.length > 0) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-required")();
}

/**
 * Validation method, checks if the input doesn't contain 'special characters'.
 * @param {String} value - Input to be validated.
 * @param {OO.ui.InputWidget} sender - Object reference to the InputWidget from which the validation was executed.
 * @returns {String} - Error message to be displayed.
 */
function checkIfNoSpecialCharacters(value, sender) {
    var expr = /[^A-z\s\d][\\\^]?/g;
    if (expr.test(value)) return OO.ui.deferMsg("visualeditor-emm-validation-special")();
    else return "";
}

/**
 * Validation method, checks if the input adheres to a valid date format.
 * @param {String} value - Input to be validated.
 * @param {OO.ui.InputWidget} sender - Object reference to the InputWidget from which the validation was executed.
 * @returns {String} - Error message to be displayed.
 */
function checkIfDate(value, sender) {
    //var expr = /((0[1-9]|[12]\d)\/(0[1-9]|1[012])|30-(0[13-9]|1[012])|(31-(0[13578]|1[02])))\/(19|20)\d\d/
    var expr = /^([0-9]|#|\+|\*|\-|\/|\\)+$/igm;
    if (expr.test(value)) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-date")();
}
