/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It receives a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMLightResourceDialog} LightResourceDialog - The 'class'-definition of EMMLightResourceDialog
 * @returns {EMMFileDialog} - returns the 'class'-definition of an EMMFileDialog
 */
function createFileDialog(LightResourceDialog) {
    /**
     * Calls the constructor of it's super class, EMMLightResourceDialog. Also defines some queries used to get information
     * about files.
     * @constructor
     */
    var EMMFileDialog = function () {
        LightResourceDialog.call(this);
        this.autoCompleteQuery = "[[Category:Resource Description]] [[file name::+]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name";
    };
    OO.inheritClass(EMMFileDialog, LightResourceDialog);

    /**
     * Creates the input fields unique for a FileDialog, calls its parent method to create more generic fields.
     * The most generic fields are created in the constructor of EMMDialog.
     */
    EMMFileDialog.prototype.createFields = function () {
        LightResourceDialog.prototype.createFields.call(this);
        //Create input fields for a file dialog
        this.fileField = new OO.ui.SelectFileWidget({
            droppable: true,
            showDropTarget: true
        });
        //Set the placeholder of titleField
        this.titleField.$element.find("input").prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
    };

    /**
     * Adds fields specific for a FileDialog to the fieldset and configures other layout options. Calls the method
     * of the parent to do the same for more generic fields. Also sets the validation parameters of these fields and
     * adds functions that need to be executed when the content of a certain field changes.
     */
    EMMFileDialog.prototype.createDialogLayout = function () {
        LightResourceDialog.prototype.createDialogLayout.call(this);
        var dialogInstance = this;
        //Temporary hack method in order to still activate the validator and onChangeFunctions for fileField.
        //Fixme dirty hack, temporary problem
        this.fileField.validation = [function (value, sender) {
            return "";
        }];

        //Separate declaration in order to more easily access this fieldlayout for hiding and showing.
        var fileFieldLayout = new OO.ui.FieldLayout(this.fileField, {
            label: OO.ui.deferMsg("visualeditor-emm-file-filename"),
            align: "left"
        });

        /**
         * Checks the titlefield and sets existingresource to false if the titlefield changed to empty from a full field
         */
        var testSuggestedLink = function () {
            //todo replace this temporary thing with something better.
            if (this.isExistingResource && this.dialogMode != 2) {
                if (dialogInstance.titleField.value.length == 0) {
                    this.isExistingResource = false;
                }
            }
        };

        //Defines what should happen when the content of titleField or fileField change.
        this.titleField.onChangeFunctions = [testSuggestedLink, this.testAndChangeDialogMode]; // ,testAndChangeDialogMode
        this.fileField.onChangeFunctions = [this.testAndChangeDialogMode];

        //Add all the fields to the fieldset, configuring the order in which they appear in the dialog.
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

    EMMFileDialog.prototype.executeModeChange = function (mode) {
        this.dialogMode = mode;
        var input = null;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.fieldset.items[1].$element.show();
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                break;
            case this.modeEnum.INSERT_NEW:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
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
                break;
            case this.modeEnum.EDIT_EXISTING:
                break;
        }
        this.validator.cleanUpForm();
        toggleAutoComplete(this);
    };

    /**
     * TODO Commentaar Nick
     */
    EMMFileDialog.prototype.testAndChangeDialogMode = function () {
        switch (this.dialogMode) {
            case this.modeEnum.INSERT_EXISTING:
                if (this.fileField.currentFile == "")
                    return;
                if ((!this.isExistingResource && this.fileField.currentFile != null))
                    this.executeModeChange(this.modeEnum.INSERT_NEW);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.fileField.currentFile == null)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING);
                break;
            case this.modeEnum.EDIT_EXISTING:
                break;
        }
    };

    /**
     * Builds and executes a query that creates a new file resource or edits an existing one with the sfautoedit api-calll.
     * After the new file resource has been added, a link is then inserted into the page by executing insertCallback.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {function} insertCallback - The function that should be executed after a new file resource has been added or
     * an existing one was changed. This function handles inserting a clickable link to the file in the current page.
     * @param {String} linkdata - In case of an existing file, linkdata contains the internal name of the file
     * in order to let the api know what file link should be edited. Otherwise linkdata is just an empty string.
     * @param {boolean} upload - If a new file or a new version of that file should be uploaded.
     * @param {boolean} newUploadVersion - True if the upload is a new version of an existing file
     * @return {boolean} - Returns true or false depending on the success of executing the action.
     */
    EMMFileDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata, upload, newUploadVersion) {
        //First call the method of the parent to build the basic query for a light resource
        console.log("upload is: ", upload);
        console.log("newUploadVersion is: ", newUploadVersion);
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        //Gather the filename in different ways depending on whether it is an existing file or not.
        var filename = "";
        if (upload) {
            filename = this.fileField.getValue().name;
        } else {
            filename = this.suggestion.data.replace("Bestand:", "").replace("File:", "");
        }
        //Expand the existing query with a file-specific part.
        query += "&Resource Description[file name]=" + filename;
        return this.executeQuery(query, insertCallback, linkdata, upload, newUploadVersion);
    }
    ;

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new file resource or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the file into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a file resource. Should be set to the internal title of the file resource
     * you want to edit, or be empty when creating a new file resource.
     * @param {boolean} upload - If a new file or new version of that file should be uploaded.
     * @param {boolean} newUploadVersion - True if the upload is a new version of an existing file
     * @return {boolean} - Returns true or false depending on the success of executing the query.
     */
    EMMFileDialog.prototype.executeQuery = function (query, insertCallback, linkdata, upload, newUploadVersion) {
        console.log("query: ",query);
        var dialogInstance = this;
        var target = "";
        //Set the target of the api-call to the internal title of an existing file, if the file already exists.
        if (this.isExistingResource) {
            target = linkdata;
        }
        //Set the target of the api-call to the internal title of an existing file resource, if the file resource already exists
        if (upload) {
            console.log(this.fileField);
            console.log(this.fileField.getValue());
            var ignorewarnings = newUploadVersion ? 1 : 0;
            var file = this.fileField.getValue();
            var filedata = {
                filename: file.name,
                ignorewarnings: ignorewarnings
            };
            new mw.Api().upload(file, filedata).fail(function (status, exceptionobject) {
                //Handle possible error messages and display them in a way the user understands them.
                if (newUploadVersion && status == "exists") {
                    semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
                } else {
                    dialogInstance.handleUploadFail(status, exceptionobject);
                    return false;
                }
            }).done(function () {
                semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
            });
        }
        else {
            semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
        }
        return true;
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMFileDialog.prototype.isEdit = function () {
        console.log("in filefield zit:", this.fileField.getValue());
        return LightResourceDialog.prototype.isEdit.call(this);
    };

    /**
     * Fill the fields of the dialog based on a file the user has selected from the autocomplete dropdown.
     */
    EMMFileDialog.prototype.fillFields = function () {
        LightResourceDialog.prototype.fillFields.call(this);
        this.validator.validateAll();
    };

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionobject by adding file-specific
     * data from the queryresult to the suggestionObject.
     * @param {Object} singleResult - A single row from the result of the api-call that contains all the information
     * about a file that was asked for in the query.
     * @param {Object} suggestionObject - A single suggestion for the autocomplete dropdown that should be expanded.
     * Should already contain data of generic resource and a lightResource.
     * @returns {Object} - An updated suggestionObject, or null when the singleresult is invalid
     */
    EMMFileDialog.prototype.processDialogSpecificQueryResult = function (singleResult, suggestionObject) {
        suggestionObject = LightResourceDialog.prototype.processDialogSpecificQueryResult.call(this, singleResult, suggestionObject);
        suggestionObject.filename = singleResult.printouts["File name"][0].fulltext;
        return suggestionObject;
    };

    /**
     * Returns what type of template to insert into the existing page in order to create a link to the file.
     * In case of a file this will always be a template of the "Cite" type.
     * @returns {String} - A string containing "Cite"
     */
    EMMFileDialog.prototype.findTemplateToUse = function () {
        return "Cite";
    };

    /**
     * @override
     * Overrides the original function by defining its own behavior for picking what to do after the insert button is pressed.
     * Checks what should happen after a user has pressed the insert button. Depending on what the user was trying to do
     * we either need to call a query, or simply only link to the selected resource.
     * @param {function} insertCallback - The callback function that creates a link on the wiki page to the selected or
     * created resource. Will be executed directly, or after the query has finished processing if a query was executed.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {String} linkdata - In case of an existing resource, linkdata contains the internal name of the resource
     * in order to let the api know what existing resource should be edited. Otherwise linkdata is just an empty string.
     * @return {boolean} - Returns true or false depending on the success of executing the action.
     */
    EMMFileDialog.prototype.executeInsertAction = function (insertCallback, currentPageID, linkdata) {
        //See the documentation wiki for a visual representation of this if/else mess
        var dialogInstance = this;
        console.log("isexistingresource", this.isExistingResource);
        console.log("filefield null", this.fileField.getValue() == null);
        console.log("filefield lege string", this.fileField.getValue() == "");
        if (this.suggestion != null) {
            console.log("isEdit", this.isEdit());
            if (this.fileField.getValue() != null) {
                console.log("filefield", this.fileField.getValue().name, "suggestion", this.suggestion.filename.replace("Bestand:", "").replace("File:", "").toLowerCase());
                console.log("filefield gelijk aan suggestion", this.fileField.getValue().name == this.suggestion.filename);
            }
        }
        if (this.isExistingResource) {
            if (this.fileField.getValue() != null && this.fileField.getValue() != "") {
                if (this.fileField.getValue().name != this.suggestion.filename.replace("Bestand:", "").replace("File:", "").toLowerCase()) {
                    //Upload new file and create a new resource, because the file has a diffrent name.
                    //A diffrent filename will lead to a diffrent internal name for the File.
                    //Linkdata is left empty on purpose
                    return this.buildAndExecuteQuery(currentPageID, insertCallback, "", true, false);
                } else {
                    if (!this.isEdit()) {
                        //Just upload a new version of the file
                        console.log(this.fileField);
                        console.log(this.fileField.getValue());
                        var file = this.fileField.getValue();
                        var filedata = {
                            filename: file.name,
                            ignorewarnings: 1
                        };
                        new mw.Api().upload(file, filedata).upload(this.fileField.getValue()).fail(function (status, exceptionobject) {
                            //Handle possible error messages and display them in a way the user understands them.
                            if (status == "exists") {
                                insertCallback(dialogInstance.suggestion.data);
                            } else {
                                dialogInstance.handleUploadFail(status, exceptionobject);
                                return false;
                            }
                        }).done(function () {
                            insertCallback(dialogInstance.suggestion.data);
                        });
                    }
                    else {
                        //Upload a new version of the file and edit the existing resource
                        return this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, true, true);
                    }
                }
            } else {
                if (this.isEdit()) {
                    //Just update the resource, don't upload anything
                    return this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, false, false);
                } else {
                    //Only insert a link to the file, don't change anything
                    insertCallback(dialogInstance.suggestion.data);
                }

            }
        } else {
            if (this.fileField.getValue() == null || this.fileField.getValue() == "") {
                //Generate an error, the filename of the selected file is empty for some reason
                alert(OO.ui.deferMsg("visualeditor-emm-file-changing-empty-file")());
                return false;
            } else {
                //Insert a new resource and upload a new file
                return this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, true, false);
            }
        }

        return true;
    };

    /**
     * Error handling for when the upload of a file fails, should be passed the first two parameters of the .fail method
     * for a JQuery promise.
     * @param status {String} - The status of the error
     * @param exceptionobject {Object} - In case of some errors there is a more specific exception object with more information
     */
    EMMFileDialog.prototype.handleUploadFail = function (status, exceptionobject) {
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
            case "filetype-banned":
                alert(OO.ui.deferMsg("visualeditor-emm-file-upload-filetype-banned")());
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
                        //unknown eroror
                        alert("An unknown error of the type " + exceptionobject.exception + " has occurred.");
                }
                break;
            default:
                alert("An unknown error of the type " + status + " has occurred.");
        }
    };

    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMFileDialog;
}