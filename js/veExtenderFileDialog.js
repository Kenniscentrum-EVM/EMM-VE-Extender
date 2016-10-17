/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createNewFileDialog(Dialog) {
    console.log("File Dialog");

    var FileDialog = function(surface, config) {
        Dialog.call(this,surface,config);
        //Create input fields in case we're dealing with a dialog to add a file
        this.titleField = new OO.ui.TextInputWidget({
            placeholder: OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")
        });
        this.fileField = new OO.ui.SelectFileWidget({
            droppable: true,
            showDropTarget: true
        });
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
    };
    OO.inheritClass(FileDialog, Dialog);

    FileDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.fileField.validation = [function (value, sender) {
            return "";
        }];

        var fileFieldLayout = new OO.ui.FieldLayout(this.fileField, {
            label: OO.ui.deferMsg("visualeditor-emm-file-filename"),
            align: "left"
        });

        var testDialogMode = function () {
            if (dialogInstance.dialogMode == 0) {
                //console.log(fileField);
                //fixme dirty hack
                if (this.fileField.currentFile == "")
                    return;
                if ((!dialogInstance.isExistingResource && this.fileField.currentFile != null)) {
                    dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
                    dialogInstance.dialogMode = 1;
                    toggleAutoComplete(dialogInstance, titleField);
                    var input = this.titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-new")());

                    if (dialogInstance.suggestion != null) {
                        if (dialogInstance.suggestion.value != this.titleField.value) {
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
                if (this.fileField.currentFile == null) {
                    dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                    dialogInstance.dialogMode = 0;
                    toggleAutoComplete(dialogInstance, this.titleField);
                    var input = this.titleField.$element.find('input');
                    input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                    clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                    validator.cleanUpForm();
                }
            }
        };

        this.presentationTitleField.validation = [checkIfEmpty];
        this.creatorField.validation = [checkIfEmpty];
        this.dateField.validation = [checkIfEmpty, checkIfDate];

        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [function () {
            //console.log(dialogInstance.isExistingFile);
            //todo replace this temporary thing with something better.
            if (dialogInstance.isExistingResource) {
                fileFieldLayout.$element.hide();
                if (titleField.value.length == 0) {
                    dialogInstance.isExistingResource = false;
                    fileFieldLayout.$element.show();
                }
            }
        }, testDialogMode]; // ,testDialogMode

        this.fileField.onChangeFunctions = [testDialogMode];

        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-title"),
                align: "left"
            }),
            fileFieldLayout,
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-presentationtitle"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.creatorField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-creator"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.dateField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-date"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.organizationField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-organization"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.subjectField, {
                label: OO.ui.deferMsg("visualeditor-emm-file-subject"),
                align: "left"
            })
        ]);
    };

    FileDialog.prototype.resetMode = function () {
        var input = this.titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
        dialogInstance.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
        this.fileFieldLayout.$element.show();
        dialogInstance.dialogMode = 0;
        toggleAutoComplete(dialogInstance, this.titleField);
        titleField.currentFile = null;
    };

    FileDialog.prototype.buildQuery = function (currentPageID) {
        //Build the sfautoedit query
        var filename = "";
        var query = "";
        if (dialogInstance.isExistingResource) {
            filename = this.fileName;
        } else if (this.fileField.getValue() != null) {
            filename = this.fileField.getValue().name;
        }
        query += "Resource Description[file name]=" + filename +
            "&Resource Description[title]=" + this.titleField.getValue() +
            "&Resource Description[creator]=" + this.creatorField.getValue() +
            "&Resource Description[date]=" + this.dateField.getValue();
        if (this.organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + this.organizationField.getValue();
        if (this.subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + this.subjectField.getValue();
        if (!dialogInstance.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
        return query;
    };

    return FileDialog;
}