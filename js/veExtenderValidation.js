"use strict"
/***
 * Validator class
 * @param fieldset fieldset to add validation to
 * @param inputSuccess(widgetObject) function that is called when the input of a widget passes all validation methods
 * @param inputFail(widgetObject) function that is called when the input of a widget fails a validation method
 * @param validationSuccess function that is called when all widgets have acceptable values
 * @param validationFail function that is called when one or more widgets have values that didn't pass validation
 * @param cleanUp(widgetObject) function that can cleanup the validation feedback created by the input methods
 * @constructor
 */
var Validator = function (fieldset, inputSuccess, inputFail, validationSuccess, validationFail, cleanUp) {
    var validator = this;
    this.inputStates = [];
    this.enabled = true;
    this.cleanUp = cleanUp;
    this.fieldset = fieldset;

    this.bindEvents(fieldset, eventWrapper);

    function eventWrapper(value){
        //console.log(this);
       (function (widget) {
           // is the validator enabled?
           if (validator.enabled == true) {
               // does the widget have the validation property?
               if (widget.validation != null) {
                   // was a cleanUp function provided?
                   if (cleanUp != null)
                   // execute the cleanUp method.
                       cleanUp(widget);
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
        if(this.onChangeFunctions != null)
            for(var i = 0; i < this.onChangeFunctions.length; i++)
                this.onChangeFunctions[i]();
   }
}


Validator.prototype.bindEvents = function(fieldset, eventFunction) {
    //Add event handlers to the widget given by the fieldset.
    var validator = this;
    for (var i = 0; i < fieldset.items.length; i++) {
        //uh....? closure
        (function () {
            var widget = fieldset.items[i].fieldWidget;
            fieldset.items[i].fieldWidget.$element.find("input").focusout(function () {
                widget.emit("change", validator.getWidgetValue(widget), widget);
            });
        })();
        var widget = fieldset.items[i].fieldWidget;
        if (widget.validation != null) {
            widget.fieldId = i;
            this.inputStates[i] = false;
            widget.connect(widget, {change: eventFunction});
        }
    }
}


Validator.prototype.enable = function () {
    this.enabled = true;
}

Validator.prototype.disable = function () {
    this.enabled = false;
    this.cleanUpForm();
    this.resetInputStates();
}

Validator.prototype.softDisable = function () {
    this.enabled = false;
}

Validator.prototype.cleanUpForm = function () {
    if (this.cleanUp != null) {
        for (var i = 0; i < this.fieldset.items.length; i++)
            if (this.fieldset.items[i].fieldWidget.validation != null)
                this.cleanUp(this.fieldset.items[i].fieldWidget);
    }
}

Validator.prototype.resetInputStates = function () {
    for (var i = 0; i < this.inputStates.length; i++) {
        if(this.inputStates[i] != null)
            this.inputStates[i] = false;
    }
}


Validator.prototype.validateAll = function (exclude) {
    for (var i = 0; i < this.fieldset.items.length; i++) {
        if (this.fieldset.items[i].fieldWidget.validation != null)
            this.fieldset.items[i].fieldWidget.emit("change", this.getWidgetValue(this.fieldset.items[i].fieldWidget), this.fieldset.items[i].fieldWidget);
    }
}

Validator.prototype.validateWidget = function (widget) {
    widget.emit("change", this.getWidgetValue(widget), widget);
}

Validator.prototype.getWidgetValue = function (widget) {
    //todo switch-case?
    //todo moet dit..?
    if ((widget instanceof OO.ui.TextInputWidget))
        return widget.value;
    else if ((widget instanceof OO.ui.SelectFileWidget)) {
        if (widget.getValue() != null)
            return widget.getValue().name;
        else
            return null;
    }

}

function checkIfWebsite(value, sender) {
    var expr = /(https:\/\/|http:\/\/)?(www\.)?[[a-z0-9]{1,256}\.[a-z]{2,6}\b\/?([-a-z0-9@:%_\+.~#?&//=]*)/ig
    if (expr.test(value)) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-website")();
}

function checkIfEmpty(value, sender) {
    if (value.length > 0) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-required")();
}

function checkIfNoSpecialCharacters(value, sender) {
    var expr = /[^A-z\s\d][\\\^]?/g //todo fixme?
    if (expr.test(value)) return OO.ui.deferMsg("visualeditor-emm-validation-special")();
    else return "";
}

function checkIfDate(value, sender) {
    //var expr = /((0[1-9]|[12]\d)\/(0[1-9]|1[012])|30-(0[13-9]|1[012])|(31-(0[13578]|1[02])))\/(19|20)\d\d/
    var expr = /^([0-9]|#|\+|\*|\-|\/|\\)+$/igm //todo fimxme
    if (expr.test(value)) return "";
    else return OO.ui.deferMsg("visualeditor-emm-validation-date")();
}
