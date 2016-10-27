/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It recieves a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMLightResourceDialog} LightResourceDialog - The 'class'-definition of EMMLightResourceDialog
 * @returns {EMMExternalLinkDialog} - returns the 'class'-definition of an EMMExternalLinkDialog
 */
function createExternalLinkDialog(LightResourceDialog) {
    /**
     * Calls the constructor of it's super class, EMMLightResourceDialog. Has no additional own behaviour.
     * @constructor
     */
    var EMMExternalLinkDialog = function () {
        LightResourceDialog.call(this);
        this.autocompleteQuery = "[[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject";
    };
    OO.inheritClass(EMMExternalLinkDialog, LightResourceDialog);

    /**
     * Creates the input fields unique for an ExternalLinkDialog, calls its parent method to create more generic fields.
     */
    EMMExternalLinkDialog.prototype.createFields = function () {
        LightResourceDialog.prototype.createFields.call(this);
        //Create input fields for an external link dialog
        this.linkField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-linkfield-placeholder-def")()});
        this.addToResourcesField = new OO.ui.CheckboxInputWidget({selected: true});
        //Set the placeholder of titleField
        this.titleField.$element.find('input').prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
    };

    /**
     * Adds fields specific for an ExternalLinkDialog to the fieldset and configures other layout options.
     *
     */
    EMMExternalLinkDialog.prototype.createDialogLayout = function () {
        LightResourceDialog.prototype.createDialogLayout.call(this);
        this.linkField.validation = [checkIfEmpty, checkIfWebsite];

        var testSuggestedLink = function () {
            if (this.isExistingResource) {
                if (this.titleField.value.length == 0) {
                    this.isExistingResource = false;
                }
            }
        };

        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [testSuggestedLink, this.testAndChangeDialogMode, function () {
            toggleAutoComplete(this, this.titleField)
        }]; //fixme temporary method toggle autocomple
        this.linkField.onChangeFunctions = [this.testAndChangeDialogMode, function () {
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

    EMMExternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        var input = null;
        if (this.dialogMode == 0) {
            if (!this.isExistingResource && this.linkField.value.length != 0) {
                if (this.suggestion != null) {
                    if (this.suggestion.hyperlink == this.linkField.value) {
                        clearInputFields(this.fieldset, [0, 2], ["OoUiLabelWidget"]);
                        this.validator.cleanUpForm();
                        return;
                    }
                    else {
                        clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                    }
                }
                else {
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                }
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                input = this.titleField.$element.find('input');
                console.log(input.autocomplete());
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
                clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                this.validator.cleanUpForm();
            }
        }
    };

    EMMExternalLinkDialog.prototype.resetMode = function () {
        this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
        this.dialogMode = 0; //TODO: check if this is still necessary
        toggleAutoComplete(this, this.titleField);
        var input = this.titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
        this.validator.cleanUpForm();
    };

    EMMExternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        //Build the sfautoedit query
        query += "&Resource Description[hyperlink]=" + this.linkField.getValue();
        this.executeQuery(query, insertCallback, linkdata);
    };

    //Call the sfautoedit query to create or edit an existing resource
    //This also happens when linking to an existing resource and not editing anything
    EMMExternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        if (this.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
    };

    EMMExternalLinkDialog.prototype.fillFields = function (suggestion) {
        LightResourceDialog.prototype.fillFields.call(this, suggestion);
        this.linkField.setValue(suggestion.hyperlink);
        this.validator.validateAll();
    };

    EMMExternalLinkDialog.prototype.processDialogSpecificQueryResult = function (singleResult, suggestionObject) {
        LightResourceDialog.prototype.processDialogSpecificQueryResult.call(this, singleResult, suggestionObject);
        suggestionObject.hyperlink = singleResult.printouts["Hyperlink"][0];
    };

    EMMExternalLinkDialog.prototype.findTemplateToUse = function () {
        if (this.addToResourcesField.isSelected()) {
            return "Cite";
        }
        return "External link";
    };


    return EMMExternalLinkDialog;
}