/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It recieves a parent 'class', it then adds its own behavior on
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
        this.autocompleteQuery = "[[Category:Resource Description]] [[file name::+]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|limit=10000";
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
        this.titleField.$element.find('input').prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
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

        //Seperate declaration in order to more easily access this fieldlayout for hiding and showing.
        var fileFieldLayout = new OO.ui.FieldLayout(this.fileField, {
            label: OO.ui.deferMsg("visualeditor-emm-file-filename"),
            align: "left"
        });

        /**
         * Checks the titlefield and sets existingresource to false if the titlefield changed to empty from a full field
         */
        var testSuggestedLink = function () {
            //todo replace this temporary thing with something better.
            if (this.isExistingResource) {
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
     * TODO commentaar Nick
     */
    EMMFileDialog.prototype.testAndChangeDialogMode = function () {
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

    /**
     * TODO Commentaar Nick
     */
    EMMFileDialog.prototype.resetMode = function () {
        this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")());
        this.dialogMode = 0;
        toggleAutoComplete(this, this.titleField);
        var input = this.titleField.$element.find('input');
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")());
        this.fileField.$element.show();
        this.titleField.currentFile = null;
        this.validator.cleanUpForm();
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
        //Gather the filename in diffrent ways depending on whether it is an existing file or not.
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

    /**
     * Fill the fields of the dialog based on a file the user has selected from the autocomplete dropdown.
     * @param {Object} suggestion - An object containing the properties of the selected file.
     * This ojbect is created when initiating the autocomplete library.
     */
    EMMFileDialog.prototype.fillFields = function (suggestion) {
        this.fieldset.items[1].$element.hide();
        LightResourceDialog.prototype.fillFields.call(this, suggestion);
        this.validator.validateAll();
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