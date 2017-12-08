/**
 * Created by Carlo Geertse on 12-10-2016.
 * Updated by Anton Bil at 8-12-2017
 */
"use strict";

//valid prefixes for file; language-dependant
const VALID_PREFIXES=["Bestand","File"];
/**
 * Helper function
 * */
function getExtension(filename){
    var parts = filename.split('.');
    var ext=(parts.length > 1) ? parts.pop() : '';
    return ext;
}

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
        this.setFileName("");
        this.file_prefix="Bestand";
    };
    OO.inheritClass(EMMFileDialog, LightResourceDialog);

    EMMFileDialog.prototype.setFileName = function (filename) {
        this.old_filename=filename;
        console.log("filename:",filename);
        if (filename.length>0)
            $(".oo-ui-selectFileWidget-selectButton .oo-ui-labelElement-label").text(filename);
        else
            this.setPlaceholderOfTitlefield();

    };

    EMMFileDialog.prototype.processSparql = function (sparqlFunction) {
        sparqlStore.getResources(sparqlFunction)
    };

    EMMFileDialog.prototype.setPlaceholderOfTitlefield = function () {
        this.titleField.$element.find("input").prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
    };
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
        this.setPlaceholderOfTitlefield();
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
        //Fixme dirty hack, temporary problem validatie toevoegen voor file veld
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
            if (this.isExistingResource && this.dialogMode != 2 && dialogInstance.titleField.value.length == 0) {
                this.isExistingResource = false;
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
     * @param {boolean} clearInputFieldsBool - If true the input fields of the dialog will be cleared.
     */
    EMMFileDialog.prototype.executeModeChange = function (mode, clearInputFieldsBool) {
        this.dialogMode = mode;
        var input = null;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
                if (clearInputFieldsBool) {
                    clearInputFields(this.fieldset, [1, 2]);
                }
                break;
            case this.modeEnum.INSERT_NEW:
                this.setFileName("");
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-filedialog-title-npage")());
                input = this.titleField.$element.find('input');
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-new")());
                if (clearInputFieldsBool) {
                    console.log("clear inputs:");
                    this.setFileName("");
                    //this.old_filename="";
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
                console.log("insert new:");
                if (this.fileField.getValue() == null)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING, true);
                break;
            case this.modeEnum.EDIT_EXISTING:
                break;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                break;
        }

        //todo this is done every keystroke, you'd much rather try to do this only once. Potential fix: add a new mode for when the dialog initially opens.
        if (this.isExistingResource)
            this.fileField.$element.find(".oo-ui-selectFileWidget-dropLabel").text(OO.ui.deferMsg("visualeditor-emm-filedialog-uploadnf")());
        else
            this.fileField.$element.find(".oo-ui-selectFileWidget-dropLabel").text(OO.ui.deferMsg("ooui-selectfile-dragdrop-placeholder")());
    };
    /**
     * get filename without prefix
     * @param filename
     * @returns {filename without prefix}
     */
    EMMFileDialog.prototype.getCleanFilename = function (filename) {
        var parts=filename.split(":");
        if (parts.length>1){
            var prefix=parts[0];
            
            if (VALID_PREFIXES.indexOf(prefix) > -1){
                this.file_prefix=prefix;
                filename=parts[parts.length-1];
            } else return filename;
        }
        //filename.replace("Bestand:", "").replace("File:", "");
        return filename;
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
     * @param {boolean} newResourcePage - True if we are creating a new resource page, mainly used for adding created in page
     * to the query even when we are 'editing' an existing resource.
     */
    EMMFileDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata, upload, newUploadVersion, newResourcePage) {
        //First call the method of the parent to build the basic query for a light resource
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        if (newResourcePage) {
            //In this case we should be dealing with an existing resource description that needs to be 'copied' over to
            //a new page, and should contain currentpageID in the query.
            //For completely new resources this happens in the buildAndExecuteQuery of EMMLightResourceDialog
            query += "&Resource Description[created in page]=" + currentPageID;
        }
        //Gather the filename in different ways depending on whether it is an existing file or not.
        try{
	        var filename = "";
	        if (upload) {
	            filename = this.fileField.getValue().name;
	        } else {
	            filename = this.getCleanFilename(this.suggestion.data);
	        }
	        //Expand the existing query with a file-specific part.
	        query += "&Resource Description[file name]=" + filename;
	    } catch(e){}
        this.executeQuery(query, insertCallback, linkdata, upload, newUploadVersion);
    };

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new file resource or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the file into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a file resource. Should be set to the internal title of the file resource
     * you want to edit, or be empty when creating a new file resource.
     * @param {boolean} upload - If a new file or new version of that file should be uploaded.
     * @param {boolean} newUploadVersion - True if the upload is a new version of an existing file
     */
    EMMFileDialog.prototype.executeQuery = function (query, insertCallback, linkdata, upload, newUploadVersion) {
        var localFilePrefix=this.file_prefix;
        var target = "";
        //Set the target of the api-call to the internal title of an existing file resource, if the file already exists.
        if (this.isExistingResource) {
            target = linkdata;
        }
        //Handle uploading of a new file or new version of a file.
        if (upload) {
        	//uploadtarget=target
            this.uploadFile(newUploadVersion, function (fname) {
                semanticCreateWithFormQuery(query, insertCallback, localFilePrefix+":"+/*"Bestand:"+*/fname, "Resource Light");
            });
        }
        else {
            semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
        }
    };

    /**
     * Fill the fields of the dialog based on a file the user has selected from the autocomplete dropdown.
     */
    EMMFileDialog.prototype.fillFields = function (suggestion) {
        //console.log("suggestion:",suggestion);
        try{
            console.log("fill:",suggestion);
            this.setFileName(suggestion.filename);
        } catch(e){}
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
        try {
            suggestionObject.filename = this.getCleanFilename(resultSet[row].printouts["File name"][0].fulltext);
        }catch(e){}
        if (previousSuggestion != null) {
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.semanticTitle.toLowerCase() && previousSuggestion.value == previousSuggestion.semanticTitle)
                previousSuggestion.value = previousSuggestion.value + " (" + previousSuggestion.filename + ")";
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.value.toLowerCase())
                suggestionObject.value = suggestionObject.value + " (" + suggestionObject.filename + ")";
        }
        return suggestionObject;
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
     */
    EMMFileDialog.prototype.executeInsertAction = function (insertCallback, currentPageID, linkdata) {
        //See the documentation wiki for a visual representation of this if/else mess
        var dialogInstance = this;
        if (this.isExistingResource) {
            if (this.fileField.getValue() != null) {

                this.setFileName(this.suggestion.filename);
                if (this.fileField.getValue().name != this.getCleanFilename(this.suggestion.filename).toLowerCase()) {
                    //Upload new file and create a new resource, because the file has a diffrent name.
                    //A diffrent filename will lead to a diffrent internal name for the File.
                    //Linkdata is left empty on purpose
                    this.buildAndExecuteQuery(currentPageID, insertCallback, "", true, false, true);
                } else {
                    if (!this.isEdit()) {
                        //Uplaod a new version of the file
                        this.uploadFile(true, function () {
                            insertCallback(dialogInstance.suggestion.data);
                        })
                    }
                    else {
                        //Upload a new version of the file and edit the existing resource
                        this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, true, true, false);
                    }
                }
            } else {
                if (this.isEdit()) {
                    //Just update the resource, don't upload anything
                    this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, false, false, false);
                } else {
                    //Only insert a link to the file, don't change anything
                    insertCallback(dialogInstance.suggestion.data);
                }
            }
        } else {
            //Insert a new resource and upload a new file
            this.buildAndExecuteQuery(currentPageID, insertCallback, linkdata, true, false, false);
        }
    };

    /**
     * Error handling for when the upload of a file fails, should be passed the first two parameters of the .fail method
     * for a JQuery promise.
     * @param status {String} - The status of the error
     * @param exceptionobject {Object} - In case of some errors there is a more specific exception object with more information
     */
    EMMFileDialog.prototype.handleUploadFail = function (status, exceptionobject) {
        var dialogInstance = this;
        switch (status) {
            case "duplicate":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-duplicate")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "exists":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-exists")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "exists-normalized":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-exists")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "verification-error":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-verification-error")() + "\n" + exceptionobject.error.info, {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "file-too-large":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-file-too-large")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "empty-file":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-empty-file")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "filetype-banned":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-filetype-banned")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "mustbeloggedin":
                mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-not-logged-in")(), {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
                break;
            case "http":
                switch (exceptionobject.textStatus) {
                    case "timeout":
                        mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-timeout")(), {
                            autoHide: false,
                            type: "error"
                        });
                        setDisabledDialogElements(dialogInstance, false);
                        break;
                    case "parsererror":
                        mw.notify(OO.ui.deferMsg("visualeditor-emm-file-upload-parsererror")(), {
                            autoHide: false,
                            type: "error"
                        });
                        setDisabledDialogElements(dialogInstance, false);
                        break;
                    default:
                        //unknown eroror
                        mw.notify("An unknown error of the type " + exceptionobject.exception + " has occurred.", {
                            autoHide: false,
                            type: "error"
                        });
                        setDisabledDialogElements(dialogInstance, false);
                }
                break;
            default:
                mw.notify("An unknown error of the type " + status + " has occurred.", {
                    autoHide: false,
                    type: "error"
                });
                setDisabledDialogElements(dialogInstance, false);
        }
    };


    /**
     * Uploads a file to the wiki and executes the correct action after succeeding or failing
     * @param {boolean} newUploadVersion - True if the upload is a new version of an existing file
     * @param {function} postUploadFunction - Function that will be executed after successfully executing the query.
     */
    EMMFileDialog.prototype.uploadFile = function (newUploadVersion, postUploadFunction) {
    	try{
	        var dialogInstance = this;
            if (!newUploadVersion)
                    newUploadVersion=this.isExistingResource;
	        var ignorewarnings = newUploadVersion ? 1 : 0;
	        var file = this.fileField.getValue();
                var newFileName=file.name;
                if (this.old_filename.length>0) newFileName=this.old_filename;
                if (getExtension(file.name) !=getExtension(newFileName)){
                    mw.notify("filetypes old and new files do not match", {
                        autoHide: false,
                        type: "error"
                    });
                    setDisabledDialogElements(dialogInstance, false);
                    return;
                }
	        var filedata = {
	            filename: newFileName,
	            ignorewarnings: ignorewarnings
	        };
	        new mw.Api().upload(file, filedata).fail(function (status, exceptionobject) {
	            //Handle possible error messages and display them in a way the user understands them.
	            //If we're uploading a new version and the file already exists, ignore the error and insert a link anyway.
	            if (newUploadVersion && (status == "exists" || status == "exists-normalized")) {
	                postUploadFunction(newFileName);
	            } else {
	                dialogInstance.handleUploadFail(status, exceptionobject);
	            }
	        }).done(function () {
	            postUploadFunction(newFileName);
	        });
	    } catch(e){
	    	postUploadFunction(newFileName);
	    }
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
