/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createExternalLinkDialog(Dialog) {
    console.log("External Link Dialog");

    var ExternalLinkDialog = function (surface, config) {
        Dialog.call(this, surface, config);
    };
    OO.inheritClass(ExternalLinkDialog, Dialog);

    ExternalLinkDialog.prototype.createFields = function () {
        //Create input fields for an external link dialog
        this.titleField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")()});
        this.linkField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-linkfield-placeholder-def")()});
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
        this.addToResourcesField = new OO.ui.CheckboxInputWidget({selected: true});
    };

    ExternalLinkDialog.prototype.createDialogLayout = function () {
        var testSuggestedLink = function () {
            if (this.isExistingResource) {
                if (this.titleField.value.length == 0) {
                    this.isExistingResource = false;
                }
            }
        };

        // todo validation property verplaatsen.
        this.titleField.validation = [checkIfEmpty];
        this.linkField.validation = [checkIfEmpty, checkIfWebsite];
        this.presentationTitleField.validation = [checkIfEmpty];
        this.creatorField.validation = [checkIfEmpty];
        this.dateField.validation = [checkIfEmpty, checkIfDate];

        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [testSuggestedLink, this.testDialogMode, function () {
            toggleAutoComplete(this, this.titleField)
        }]; //fixme temporary method toggle autocomple
        this.linkField.onChangeFunctions = [this.testDialogMode, function () {
            toggleAutoComplete(this, this.titleField)
        }]; //fixme temporary method toggle autocomplete

        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-title"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.linkField, {
                label: OO.ui.deferMsg("visualeditor-emm-link"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("viualeditor-emm-link-presentationtitle"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.creatorField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-creator"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.dateField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-date"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.organizationField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-organization"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.subjectField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-subject"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.addToResourcesField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-add-resource"),
                align: "left"
            })
        ]);
    };

    ExternalLinkDialog.prototype.resetMode = function () {
        this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
        this.dialogMode = 0; //TODO: check if this is still necessary
        toggleAutoComplete(this, this.titleField);
        var input = this.titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
        this.validator.cleanUpForm();
    };

    ExternalLinkDialog.prototype.testDialogMode = function () {
        var input = null;
        if (this.dialogMode == 0) {
            if (!this.isExistingResource && this.linkField.value.length != 0) {
                clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-new")());
                //todo temporary
                this.dialogMode = 1;
                toggleAutoComplete(this, this.titleField);
                this.validator.cleanUpForm();
            }
        }
        else {
            if (this.linkField.value.length == 0) {
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                this.dialogMode = 0;
                toggleAutoComplete(this, this.titleField);
                clearInputFields(this.fieldset, null, ["OoUiLabelWidget"]);
                this.validator.cleanUpForm();
            }
        }
    };

    ExternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        var query = "";
        //Build the sfautoedit query
        query += "Resource Description[hyperlink]=" + this.linkField.getValue() +
            "&Resource Description[title]=" + this.titleField.getValue() +
            "&Resource Description[creator]=" + this.creatorField.getValue() +
            "&Resource Description[date]=" + this.dateField.getValue();
        if (this.organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + this.organizationField.getValue();
        if (this.subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + this.subjectField.getValue();
        if (!this.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
        this.executeQuery(query, insertCallback, linkdata);
    };

    //Call the sfautoedit query to create or edit an existing resource
    //This also happens when linking to an existing resource and not editing anything
    ExternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        if (this.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
    };

    ExternalLinkDialog.prototype.fillFields = function (suggestion) {
        this.linkField.setValue(suggestion.hyperlink);
        this.creatorField.setValue(suggestion.creator);
        this.dateField.setValue(fixDate(suggestion.date));
        this.organizationField.setValue(suggestion.organization);
        this.subjectField.setValue(suggestion.subjects);
        this.validator.validateAll();
    };

    ExternalLinkDialog.prototype.processDialogSpecificQueryResult = function (res, prop, suggestionObject) {
        suggestionObject.hyperlink = res[prop].printouts["Hyperlink"][0];
        suggestionObject.creator = res[prop].printouts["Dct:creator"][0];
        suggestionObject.date = res[prop].printouts["Dct:date"][0];
        suggestionObject.organization = res[prop].printouts["Organization"][0];
        suggestionObject.subjects = "";
        var querySubjects = res[prop].printouts["Dct:subject"];
        //Gathers all subjects and creates a single string which contains the fulltext name of all the subjects,
        //seperated by a ,
        for (var j = 0; j < querySubjects.length; j++) {
            suggestionObject.subjects += querySubjects[j].fulltext + ", ";
        }
        //Remove comma and space at the end of the subject list
        suggestionObject.subjects = suggestionObject.subjects.slice(0, -2);
    };

    return ExternalLinkDialog;
}