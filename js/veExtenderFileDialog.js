/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createFileDialog(Dialog) {
    console.log("File Dialog");

    var FileDialog = function (surface, config) {
        Dialog.call(this, surface, config);
    };
    OO.inheritClass(FileDialog, Dialog);

    FileDialog.prototype.createFields = function () {
        //Create input fields in for a file dialog
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

    FileDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.fileField.validation = [function (value, sender) {
            return "";
        }];

        var fileFieldLayout = new OO.ui.FieldLayout(this.fileField, {
            label: OO.ui.deferMsg("visualeditor-emm-file-filename"),
            align: "left"
        });

        this.presentationTitleField.validation = [checkIfEmpty];
        this.creatorField.validation = [checkIfEmpty];
        this.dateField.validation = [checkIfEmpty, checkIfDate];


        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [function () {
            //todo replace this temporary thing with something better.
            if (this.isExistingResource) {
                fileFieldLayout.$element.hide();
                if (this.titleField.value.length == 0) {
                    this.isExistingResource = false;
                    fileFieldLayout.$element.show();
                }
            }
        }, this.testDialogMode]; // ,testDialogMode

        this.fileField.onChangeFunctions = [this.testDialogMode];

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
        this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
        this.dialogMode = 0;
        toggleAutoComplete(this, this.titleField);
        var input = this.titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
        this.fieldset.getItems()[1].$element.show();
        this.titleField.currentFile = null;
        this.validator.cleanUpForm();
    };

    FileDialog.prototype.testDialogMode = function () {
        var input = null;
        if (this.dialogMode == 0) {
            //fixme dirty hack
            if (this.fileField.currentFile == "")
                return;
            if ((!this.isExistingResource && this.fileField.currentFile != null)) {
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
                this.dialogMode = 1;
                toggleAutoComplete(this, this.titleField);
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-new")());

                if (this.suggestion != null) {
                    if (this.suggestion.value != this.titleField.value) {
                        clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                    }
                    else
                        clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                }
                else
                    clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                this.validator.cleanUpForm();
            }
        }
        else {
            if (this.fileField.currentFile == null) {
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                this.dialogMode = 0;
                toggleAutoComplete(this, this.titleField);
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                this.validator.cleanUpForm();
            }
        }
    };

    FileDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        //Build the sfautoedit query
        var filename = "";
        var query = "";
        if (this.isExistingResource) {
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
        if (!this.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
        this.executeQuery(query, insertCallback, linkdata);
    };

    //Call the sfautoedit query to create or edit an existing resource
    //This also happens when linking to an existing resource and not editing anything
    FileDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        if (this.isExistingResource) {
            target = linkdata;
        }
        if (!this.isExistingResource) {
            this.upload.setFile(this.fileField.getValue());
            this.upload.setFilename(this.fileField.getValue().name);
            this.upload.upload().fail(function (status, exceptionobject) {
                switch (status) {
                    case "duplicate":
                        alert(OO.ui.deferMsg("visualeditor-emm-file-upload-duplicate")());
                        break;
                    case "exists":
                        alert(OO.ui.deferMsg("visualeditor-emm-file-upload-exists")());
                        break;
                    case "verification-error":
                        alert(OO.ui.deferMsg("visualeditor-emm-file-upload-verification-error")() + "\n" + exceptionobject.error.info);
                        break;
                    case "file-too-large":
                        alert(OO.ui.deferMsg("visualeditor-emm-file-upload-file-too-large")());
                        break;
                    case "empty-file":
                        alert(OO.ui.deferMsg("visualeditor-emm-file-upload-empty-file")());
                        break;
                    case "http":
                        switch (exceptionobject.textStatus) {
                            case "timeout":
                                alert(OO.ui.deferMsg("visualeditor-emm-file-upload-timeout")());
                                break;
                            case "parsererror":
                                alert(OO.ui.deferMsg("visualeditor-emm-file-upload-parsererror")());
                                break;
                            default:
                                //uknown eroror
                                alert("An unkown error of the type " + exceptionobject.exception + " has occured.");
                        }
                        break;
                    default:
                        alert("An unkown error of the type " + status + " has occured.");
                }
            }).done(function () {
                semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
            });
        }
        else {
            semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
        }
    };

    FileDialog.prototype.fillFields = function (suggestion) {
        this.creatorField.setValue(suggestion.creator);
        this.dateField.setValue(fixDate(suggestion.date));
        this.organizationField.setValue(suggestion.organization);
        this.subjectField.setValue(suggestion.subjects);
        this.fileName = suggestion.data.replace("Bestand:", "").replace("File:", "");
        this.validator.validateAll();
    };

    FileDialog.prototype.processDialogSpecificQueryResult = function (res, prop, suggestionObject) {
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

    return FileDialog;
}