/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createNewFileDialogue(Dialogue) {
    console.log("File Dialogue");

    var FileDialogue = function(surface, config) {
        Dialogue.call(this,surface,config);
    };
    OO.inheritClass(FileDialogue, Dialogue);

    FileDialogue.prototype.createDialogueLayout = function () {
        //Create input fields in case we're dealing with a dialogue to add a file
        var titleField = new OO.ui.TextInputWidget({
            placeholder: OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")
        });
        var fileField = new OO.ui.SelectFileWidget({
            droppable: true,
            showDropTarget: true
        });
        var presentationTitleField = new OO.ui.TextInputWidget({});
        var creatorField = new OO.ui.TextInputWidget({});
        var dateField = new OO.ui.TextInputWidget({});
        var organizationField = new OO.ui.TextInputWidget({});
        var subjectField = new OO.ui.TextInputWidget({});

        titleField.validation = [checkIfEmpty];
        fileField.validation = [function (value, sender) {
            return "";
        }];

        var fileFieldLayout = new OO.ui.FieldLayout(fileField, {
            label: OO.ui.deferMsg("visualeditor-emm-file-filename"),
            align: "left"
        });

        var testDialogMode = function () {
            if (dialogueInstance.dialogMode == 0) {
                //console.log(fileField);
                //fixme dirty hack
                if (fileField.currentFile == "")
                    return;
                if ((!dialogueInstance.isExistingResource && fileField.currentFile != null)) {
                    dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
                    dialogueInstance.dialogMode = 1;
                    toggleAutoComplete(dialogueInstance, titleField);
                    var input = titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-new")());

                    if (dialogueInstance.suggestion != null) {
                        if (dialogueInstance.suggestion.value != titleField.value) {
                            clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                        }
                        else
                            clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                    }
                    else
                        clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                    validator.cleanUpForm();
                }
            }
            else {
                if (fileField.currentFile == null) {
                    dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                    dialogueInstance.dialogMode = 0;
                    toggleAutoComplete(dialogueInstance, titleField);
                    var input = titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                    clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                    validator.cleanUpForm();
                }
            }
        };

        presentationTitleField.validation = [checkIfEmpty];
        creatorField.validation = [checkIfEmpty];
        dateField.validation = [checkIfEmpty, checkIfDate];

        //Things to do when the specified field changes
        titleField.onChangeFunctions = [function () {
            //console.log(dialogueInstance.isExistingFile);
            //todo replace this temporary thing with something better.
            if (dialogueInstance.isExistingResource) {
                fileFieldLayout.$element.hide();
                if (titleField.value.length == 0) {
                    dialogueInstance.isExistingResource = false;
                    fileFieldLayout.$element.show();
                }
            }
        }, testDialogMode]; // ,testDialogMode

        fileField.onChangeFunctions = [testDialogMode];

        this.fieldset.addItems([
            new OO.ui.FieldLayout(titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-title"),
                align: "left"
            }),
            fileFieldLayout,
            new OO.ui.FieldLayout(presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-presentationtitle"),
                align: "left"
            }),
            new OO.ui.FieldLayout(creatorField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-creator"),
                align: "left"
            }),
            new OO.ui.FieldLayout(dateField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-date"),
                align: "left"
            }),
            new OO.ui.FieldLayout(organizationField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-organization"),
                align: "left"
            }),
            new OO.ui.FieldLayout(subjectField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-subject"),
                align: "left"
            })
        ]);
    };

    FileDialogue.prototype.resetMode = function () {
        var input = titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
        dialogueInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
        fileFieldLayout.$element.show();
        dialogueInstance.dialogMode = 0;
        toggleAutoComplete(dialogueInstance, titleField);
        titleField.currentFile = null;
    };

    return FileDialogue;
}