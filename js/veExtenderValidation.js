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
    var inputStates = {};
    this.enabled = true;
    this.cleanUp = cleanUp;
    this.fieldset = fieldset;
    function onInputChange(value) {
        if(this.onChangeFunctions != null) {
            for(var i = 0; i < this.onChangeFunctions; i++) {
                this.onChangeFunctions[i]();
            }
        }
        // is the validator enabled?
        if(validator.enabled == true) {
            if (this.validation != null) {
                if (cleanUp != null)
                    cleanUp(this);
                for (var i = 0; i < this.validation.length; i++) {
                    if (this.validation[i](value).length > 0) {
                        if (inputFail != null)
                            inputFail(this, this.validation[i](value));
                        inputStates[this.fieldId] = false;
                        return false;
                    }
                }
            }
            if (inputSuccess != null)
                inputSuccess();
            inputStates[this.fieldId] = true;
            var isValidated = true;
            $.each(inputStates, function (key, val) {
                if (!val) {
                    isValidated = false;
                    if (validationFail != null)
                        validationFail();
                    return false;
                }
            });
            if (!isValidated) return;
            if (validationSuccess != null)
                validationSuccess();
        }
    }

    for (var i = 0; i < fieldset.items.length; i++) {
        var widget = fieldset.items[i].fieldWidget;
        if (widget.validation != null) {
            widget.fieldId = i;
            inputStates[i] = false;
            widget.change = onInputChange;
            widget.connect(widget, {change: "change"});
        }
        else
            inputStates[widget.fieldId] = true;
    }
}

Validator.prototype.enable = function(){
    this.enabled = true;
}

Validator.prototype.disable = function(){
    this.enabled = false;
    this.cleanUpForm();
}

Validator.prototype.cleanUpForm = function() {
    if(this.cleanUp != null){
        for (var i = 0; i < this.fieldset.items.length; i++) {
            this.cleanUp(this.fieldset.items[i].fieldWidget);
        }
    }
}

function checkIfWebsite(value) {
    var expr = /(https:\/\/|http:\/\/)?(www\.)?[[a-z0-9]{1,256}\.[a-z]{2,6}\b\/?([-a-z0-9@:%_\+.~#?&//=]*)/ig
    if (expr.test(value)) return "";
    else return "In dit veld moet een geldige URL ingevoerd worden.";
}

function checkIfEmpty(value) {
    if (value.length > 0) return "";
    else return "Dit veld mag niet leeg zijn."; //todo translations
}

function checkIfNoSpecialCharacters(value) {
    var expr = /[^A-z\s\d][\\\^]?/g
    if(expr.test(value)) return "Er mogen geen speciale tekens (bijv: é©ß) in dit veld!";
    else return "";
}

function checkIfDate(value) {
    var expr = /((0[1-9]|[12]\d)\/(0[1-9]|1[012])|30-(0[13-9]|1[012])|(31-(0[13578]|1[02])))\/(19|20)\d\d/
    if(expr.test(value)) return "";
    else return "De datum moet als volgt geschreven worden: dd/mm/yyyy, dd-mm-yyyy of dd.mm.yyyy";
}