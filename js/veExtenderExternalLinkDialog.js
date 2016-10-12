/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createNewExternalLinkDialogue(Dialogue) {
    console.log("External Link Dialogue");

    var ExternalLinkDialogue = function (surface, config) {
        Dialogue.call(this, surface, config);
        //Create input fields in case we're dealing with an external link
        this.titleField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")()});
        this.linkField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-linkfield-placeholder-def")()});
        this.presentationTitleField = new OO.ui.TextInputWidget({});
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
        this.addToResourcesField = new OO.ui.CheckboxInputWidget({selected: true});
    };
    OO.inheritClass(ExternalLinkDialogue, Dialogue);

    ExternalLinkDialogue.prototype.createDialogueLayout = function () {
        var testSuggestedLink = function () {
            if (dialogueInstance.isExistingResource) {
                if (titleField.value.length == 0) {
                    dialogueInstance.isExistingResource = false;
                }
            }
        };

        var input = null;
        var testDialogMode = function () {
            if (dialogueInstance.dialogMode == 0) {
                if (!dialogueInstance.isExistingResource && linkField.value.length != 0) {
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                    dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                    input = titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-new")());
                    //todo temporary
                    dialogueInstance.dialogMode = 1;
                    toggleAutoComplete(dialogueInstance, titleField);
                    validator.cleanUpForm();
                }
            }
            else {
                if (linkField.value.length == 0) {
                    dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
                    input = titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                    dialogueInstance.dialogMode = 0;
                    toggleAutoComplete(dialogueInstance, titleField);
                    clearInputFields(this.fieldset, null, ["OoUiLabelWidget"]);
                    //validator.validateWidget(linkField);
                    validator.cleanUpForm();
                }
            }
        };

        // todo validation property verplaatsen.
        titleField.validation = [checkIfEmpty];
        linkField.validation = [checkIfEmpty, checkIfWebsite];
        presentationTitleField.validation = [checkIfEmpty];
        creatorField.validation = [checkIfEmpty];
        dateField.validation = [checkIfEmpty, checkIfDate];

        //Things to do when the specified field changes
        titleField.onChangeFunctions = [testSuggestedLink, testDialogMode, function () {
            toggleAutoComplete(dialogueInstance, titleField)
        }]; //fixme temporary method toggle autocomple
        linkField.onChangeFunctions = [testDialogMode, function () {
            toggleAutoComplete(dialogueInstance, titleField)
        }]; //fixme temporary method toggle autocomplete

        this.fieldset.addItems([
            new OO.ui.FieldLayout(titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-title"),
                align: "left"
            }),
            new OO.ui.FieldLayout(linkField, {
                label: OO.ui.deferMsg("visualeditor-emm-link"),
                align: "left"
            }),
            new OO.ui.FieldLayout(presentationTitleField, {
                label: OO.ui.deferMsg("viualeditor-emm-link-presentationtitle"),
                align: "left"
            }),
            new OO.ui.FieldLayout(creatorField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-creator"),
                align: "left"
            }),
            new OO.ui.FieldLayout(dateField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-date"),
                align: "left"
            }),
            new OO.ui.FieldLayout(organizationField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-organization"),
                align: "left"
            }),
            new OO.ui.FieldLayout(subjectField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-subject"),
                align: "left"
            }),
            new OO.ui.FieldLayout(addToResourcesField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-add-resource"),
                align: "left"
            })
        ]);
    };


    ExternalLinkDialogue.prototype.resetMode = function () {
        dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
        var input = titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
        toggleAutoComplete(dialogueInstance, titleField);
    };

    return ExternalLinkDialogue;
}