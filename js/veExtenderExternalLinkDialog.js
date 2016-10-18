/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createNewExternalLinkDialog(Dialog) {
    console.log("External Link Dialog");

    var ExternalLinkDialog = function (surface, config) {
        Dialog.call(this, surface, config);
        //Create input fields in case we're dealing with an external link
        this.titleField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")()});
        this.linkField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-linkfield-placeholder-def")()});
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
        this.addToResourcesField = new OO.ui.CheckboxInputWidget({selected: true});
    };
    OO.inheritClass(ExternalLinkDialog, Dialog);

    ExternalLinkDialog.prototype.createDialogLayout = function () {
        var testSuggestedLink = function () {
            if (dialogInstance.isExistingResource) {
                if (titleField.value.length == 0) {
                    dialogInstance.isExistingResource = false;
                }
            }
        };

        var input = null;
        var testDialogMode = function () {
            if (dialogInstance.dialogMode == 0) {
                if (!dialogInstance.isExistingResource && linkField.value.length != 0) {
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                    dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                    input = this.titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-new")());
                    //todo temporary
                    dialogInstance.dialogMode = 1;
                    toggleAutoComplete(dialogInstance, this.titleField);
                    validator.cleanUpForm();
                }
            }
            else {
                if (linkField.value.length == 0) {
                    dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
                    input = this.titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                    dialogInstance.dialogMode = 0;
                    toggleAutoComplete(dialogInstance, titleField);
                    clearInputFields(this.fieldset, null, ["OoUiLabelWidget"]);
                    //validator.validateWidget(linkField);
                    validator.cleanUpForm();
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
        this.titleField.onChangeFunctions = [testSuggestedLink, testDialogMode, function () {
            toggleAutoComplete(dialogInstance, titleField)
        }]; //fixme temporary method toggle autocomple
        this.linkField.onChangeFunctions = [testDialogMode, function () {
            toggleAutoComplete(dialogInstance, titleField)
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
        dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
        var input = titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
        toggleAutoComplete(dialogInstance, titleField);
    };

    ExternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback) {
        var query = "";
        //Build the sfautoedit query
        query += "Resource Description[hyperlink]=" + linkField.getValue() +
            "&Resource Description[title]=" + titleField.getValue() +
            "&Resource Description[creator]=" + creatorField.getValue() +
            "&Resource Description[date]=" + dateField.getValue();
        if (organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + organizationField.getValue();
        if (subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + subjectField.getValue();
        if (!dialogInstance.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
        this.executeQuery(query, insertCallback);
    };

    //Call the sfautoedit query to create or edit an existing resource
    //This also happens when linking to an existing resource and not editing anything
    ExternalLinkDialog.prototype.executeQuery = function (query, insertCallback) {
        var target = "";
        if (dialogInstance.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
    };

    return ExternalLinkDialog;
}