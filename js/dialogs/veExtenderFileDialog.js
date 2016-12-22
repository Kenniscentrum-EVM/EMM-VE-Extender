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
     * @extends EMMLightResourceDialog
     * @constructor
     */
    var EMMFileDialog = function () {
        LightResourceDialog.call(this);
        this.autoCompleteQuery = "[[Category:Resource Description]] [[file name::+]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|sort=Semantic title|order=asc|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name";
        //Define a new upload object to handle file uploads
        this.upload = new mw.Upload({parameters: {ignorewarnings: true}});
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
        //Fixme dirty hack
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
                    fileFieldLayout.$element.show();
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


    /**
     * Method that switches the dialog to a given mode.
     * This method preforms all necessary operations to visually and logically switch the state of the dialog to a different mode.
     *
     * Dialog modes are defined in the modeEnum variable (which is defined in EMMDialog) this enum should always be used when switching modes.
     * @param {number} mode - Dialog mode to switch to.
     * @param {boolean} clearInputFields - If true the input fields of the dialog will be cleared.
     */
    EMMFileDialog.prototype.executeModeChange = function (mode, clearInputFieldsBool) {
        this.dialogMode = mode;
        var input = null;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.fieldset.items[1].$element.show();
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                if (clearInputFieldsBool) {
                    clearInputFields(this.fieldset, [1, 2]);
                }
                break;
            case this.modeEnum.INSERT_NEW:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-new")());
                if (clearInputFieldsBool) {
                    if (this.suggestion != null) {
                        if (this.suggestion.value != this.titleField.value) {
                            clearInputFields(this.fieldset, [0, 1, 2]);
                        } else {
                            clearInputFields(this.fieldset, [1, 2]);
                        }
                    } else {
                        clearInputFields(this.fieldset, [1, 2]);
                    }
                }
                break;
            case this.modeEnum.EDIT_EXISTING:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-edit")());
                break;
        }
        this.validator.cleanUpForm();
        setAutoCompleteEnabled(this, this.getAutoCompleteStateForMode(mode));
    };

    /**
     * This method is responsible for determining necessary mode changes and executing them.
     * The method is executed every time the state of the file field or title field changes.
     */
    EMMFileDialog.prototype.testAndChangeDialogMode = function () {
        switch (this.dialogMode) {
            case this.modeEnum.INSERT_EXISTING:
                if ((!this.isExistingResource && this.fileField.getValue() != null))
                    this.executeModeChange(this.modeEnum.INSERT_NEW, true);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.fileField.getValue() == null)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING, true);
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
     */
    EMMFileDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        //First call the method of the parent to build the basic query for a light resource
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        //Gather the filename in different ways depending on whether it is an existing file or not.
        var filename = "";
        if (this.isExistingResource) {
            filename = this.suggestion.data.replace("Bestand:", "").replace("File:", "");
        } else if (this.fileField.getValue() != null) {
            filename = this.fileField.getValue().name;
        }
        //Expand the existing query with a file-specific part.
        query += "&Resource Description[file name]=" + filename;
        this.executeQuery(query, insertCallback, linkdata);
    };

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new file resource or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the file into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a file resource. Should be set to the internal title of the file resource
     * you want to edit, or be empty when creating a new file resource.
     */
    EMMFileDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        //Set the target of the api-call to the internal title of an existing file resource, if the file resource already exists
        if (this.isExistingResource) {
            target = linkdata;
        }
        if (!this.isExistingResource) {
            //Upload a new file
            this.upload.setFile(this.fileField.getValue());
            this.upload.setFilename(this.fileField.getValue().name);
            this.upload.upload().fail(function (status, exceptionobject) {
                //Handle possible error messages and display them in a way the user understands them.
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
                                //unknown eroror
                                alert("An unknown error of the type " + exceptionobject.exception + " has occurred.");
                        }
                        break;
                    default:
                        alert("An unknown error of the type " + status + " has occurred.");
                }
            }).done(function () {
                semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
            });
        }
        else {
            semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
        }
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMFileDialog.prototype.isEdit = function () {
        return LightResourceDialog.prototype.isEdit.call(this);
    };

    /**
     * Fill the fields of the dialog based on a file the user has selected from the autocomplete dropdown.
     */
    EMMFileDialog.prototype.fillFields = function () {
        this.fieldset.items[1].$element.hide();
        LightResourceDialog.prototype.fillFields.call(this);
        this.validator.validateAll();
    };

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionobject by adding file-specific
     * data from the queryresult to the suggestionObject.
     * @param {String} row - String index of a row in the resultSet associative array.
     * @param {Object[]} resultSet - Associative array which functions like a dictionary, using strings as indexes, contains the result of a query.
     * @param {Object} previousSuggestion - A suggestion object that contains the information about the previous processed suggestion, useful for comparing and sorting.
     * @returns {Object} - An updated suggestionObject;
     */
    EMMFileDialog.prototype.processSingleQueryResult = function (row, resultSet, previousSuggestion) {
        var suggestionObject = LightResourceDialog.prototype.processSingleQueryResult.call(this, row, resultSet, previousSuggestion);
        suggestionObject.filename = resultSet[row].printouts["File name"][0].fulltext.replace("Bestand:", "").replace("File:", "");
        if (previousSuggestion != null) {
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.semanticTitle.toLowerCase() && previousSuggestion.value == previousSuggestion.semanticTitle)
                previousSuggestion.value = previousSuggestion.value + " (" + previousSuggestion.filename + ")";
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.value.toLowerCase())
                suggestionObject.value = suggestionObject.value + " (" + suggestionObject.filename + ")";
        }
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

    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMFileDialog;
}