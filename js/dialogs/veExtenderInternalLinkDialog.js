/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";


/**
 * This function more or less functions like a factory. It receives a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMDialog} EMMDialog - The 'class'-definition of EMMDialog
 * @returns {EMMInternalLinkDialog} - returns the 'class'-definition of an EMMInternalLinkDialog
 */
function createInternalLinkDialog(EMMDialog) {
    /**
     * Calls the constructor of it's super class, EMMDialog. Also defines some queries used to get information
     * about internal links.
     * @extends EMMDialog
     * @constructor
     */
    var EMMInternalLinkDialog = function () {
        EMMDialog.call(this);
        this.autoCompleteQuery = "[[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title|order=asc|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Category=Category";
    };
    OO.inheritClass(EMMInternalLinkDialog, EMMDialog);

    /**
     * Creates the input fields unique for a EMMInternalLinkDialog.
     * The generic fields are created in the constructor of EMMDialog.
     */
    EMMInternalLinkDialog.prototype.createFields = function () {
        //Set the placeholder of titleField
        this.titleField.$element.find("input").prop("placeholder", OO.ui.deferMsg("visualeditor-emm-search")());
    };

    /**
     * Adds fields specific for an EMMInternalLinkDialog to the fieldset and configures other layout options. Calls the method
     * of the parent to do the same for more generic fields. Also sets the validation parameters of these fields and
     * adds functions that need to be executed when the content of a certain field changes.
     */
    EMMInternalLinkDialog.prototype.createDialogLayout = function () {
        EMMDialog.prototype.createDialogLayout.call(this);
        var dialogInstance = this;
        //Define what functions to execute when the content of this field changes.
        this.titleField.onChangeFunctions = [function () {
            if (this.isExistingResource && this.dialogMode != this.modeEnum.EDIT_EXISTING) {
                if (dialogInstance.titleField.getValue().length == 0) {
                    this.isExistingResource = false;
                }
            }
        }, this.testAndChangeDialogMode];
        //Add all the fields to the fieldset, configuring the order in which they appear in the dialog.
        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-page"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-page-presentationtitle"),
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
    EMMInternalLinkDialog.prototype.executeModeChange = function (mode, clearInputFieldsBool) {
        this.dialogMode = mode;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialoginternallinktitle")());
                break;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-inlidialog-title-insert-edit")());
                break;
            case this.modeEnum.INSERT_NEW:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-inlidialog-title-npage")());
                break;
            case this.modeEnum.EDIT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-inlidialog-title-edit")());
                break;
        }
        setAutoCompleteEnabled(this, this.getAutoCompleteStateForMode(mode));
    };

    /**
     * Retrieves the auto complete state for a given dialog mode.
     * @param {modeEnum} mode - dialog mode to get the auto complete state for.
     * @returns {boolean} - The value the auto complete should be set to.
     */
    EMMInternalLinkDialog.prototype.getAutoCompleteStateForMode = function (mode) {
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                return true;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                return false;
            case this.modeEnum.INSERT_NEW:
                return true;
            case this.modeEnum.EDIT_EXISTING:
                return false;
            default:
                return false;
        }
    };

    /**
     * This method is responsible for determining necessary mode changes and executing them.
     * The method is executed every time the state of the title field changes.
     */
    EMMInternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        switch (this.dialogMode) {
            case this.modeEnum.INSERT_EXISTING:
                if (this.isExistingResource && this.titleField.getValue() != this.suggestion.value)
                    this.executeModeChange(this.modeEnum.INSERT_AND_EDIT_EXISTING, true);
                if (!this.isExistingResource && this.titleField.getValue().length > 0)
                    this.executeModeChange(this.modeEnum.INSERT_NEW, true);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.isExistingResource || this.titleField.getValue().length == 0)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING, true);
                break;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                if ((this.isExistingResource && this.titleField.getValue() == this.suggestion.value) || this.titleField.getValue().length == 0)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING, true);
                break;
        }
    };

    /**
     * Builds and executes a query that creates a new Light Context or edits an existing one with the sfautoedit api-calll.
     * After the new Light Context has been added, a link is then inserted into the page by executing insertCallback.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {function} insertCallback - The function that should be executed after a new Light Context has been added or
     * an existing one was changed. This function handles inserting a clickable link to the Light Context in the current page.
     * @param {String} linkdata - In case of an existing file, linkdata contains the internal name of the Light Context
     * in order to let the api know what Light Context should be edited. Otherwise linkdata is just an empty string.
     */
    EMMInternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        var dialogInstance = this;
        var query = "";
        if (this.isExistingResource) { //This is true whenever we're editing an existing resource
            var formCategory = "";
            for (var i = 0; i < this.suggestion.category.length; i++) {
                if (/Light Context/g.test(this.suggestion.category[i].fulltext)) {
                    formCategory = "Light Context";
                    query += "Light Context[Heading]=" + this.titleField.getValue();
                    dialogInstance.executeQuery(query, insertCallback, linkdata, "Light Context");
                    break;
                }
                else if (/Project/g.test(this.suggestion.category[i].fulltext)) {
                    formCategory = "Project";
                    query += "Project[Name]=" + this.titleField.getValue();
                    dialogInstance.executeQuery(query, insertCallback, linkdata, "Project");
                    break;
                }
            }
        } else {
            //Start building the sfautoedit query
            var heading = this.titleField.getValue();
            heading = heading.replace(/&/g,"%26"); //Escape the and-character
            query += "Light Context[Heading]=" + heading;
            query += "&Light Context[Supercontext]=" + currentPageID;
            //Find the topcontext of the current page
            var api = new mw.Api();
            api.get({
                action: "ask",
                parameters: "limit:10000",//check how to increase limit of ask-result; done in LocalSettings.php
                query: "[[" + currentPageID + "]]|?Topcontext|limit=10000"//
            }).done(function (data) {
                var res = data.query.results;
                if (res[currentPageID].printouts.Topcontext[0] != null) {
                    var topContext = res[currentPageID].printouts.Topcontext[0].fulltext;
                    query += "&Light Context[Topcontext]=" + topContext;
                    dialogInstance.executeQuery(query, insertCallback, linkdata, "Light Context");
                } else {
                    mw.notify(OO.ui.deferMsg("visualeditor-emm-topcontext-error")(), {
                        autoHide: false,
                        type: "error"
                    });
                    setDisabledDialogElements(dialogInstance, false);
                }
            });
        }
    };

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new Light Context or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the Light Context into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a Light Context resource. Should be set to the internal title of the Light Context
     * you want to edit, or be empty when creating a new file resource.
     * @param {String} form - What type of form to use in order to execute the query.
     */
    EMMInternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata, form) {
        var target = "";
        //Set the target of the api-call to the internal title of an existing internal link, if the internal link already exists.
        if (this.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, form);
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMInternalLinkDialog.prototype.isEdit = function () {
        return EMMDialog.prototype.isEdit.call(this);
    };

    /**
     * Fill the fields of the dialog based on a Light Context the user has selected from the autocomplete dropdown.
     * Because internal link has no fields that should be filled after selecting the autocomplete this function is currently empty.
     */
    EMMInternalLinkDialog.prototype.fillFields = function () {
        //Nothing to fill, no editable fields beyond presentationtitle and title
    };

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionObject by adding internal link-specific
     * data from the resultSet to the suggestionObject.
     * @param {String} row - String index of a row in the resultSet associative array.
     * @param {Object[]} resultSet - Associative array which functions like a dictionary, using strings as indexes, contains the result of a query.
     * @param {Object} previousSuggestion - A suggestion object that contains the information about the previous processed suggestion, useful for comparing and sorting.
     * @returns {Object} - An updated suggestionObject, or null when the categories are invalid.
     */
    EMMInternalLinkDialog.prototype.processSingleQueryResult = function (row, resultSet, previousSuggestion) {
        var suggestionObject = EMMDialog.prototype.processSingleQueryResult.call(this, row, resultSet, previousSuggestion);
        suggestionObject.category = resultSet[row].printouts.Category;
        suggestionObject.suffix = resultSet[row].printouts["Supercontext"];

        if (previousSuggestion != null) {
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.semanticTitle.toLowerCase() && previousSuggestion.value == previousSuggestion.semanticTitle)
                previousSuggestion.value = checkAndPrintSuffix(previousSuggestion, resultSet[previousSuggestion.suffix[0].fulltext]);
            if (previousSuggestion.semanticTitle.toLowerCase() == suggestionObject.value.toLowerCase())
                suggestionObject.value = checkAndPrintSuffix(suggestionObject, resultSet[suggestionObject.suffix[0].fulltext]);
        }
        for (var i = 0; i < suggestionObject.category.length; i++)
            if (/:\bLight Context\b/.test(suggestionObject.category[i].fulltext) || /:\bProject\b/.test(suggestionObject.category[i].fulltext))
                return suggestionObject;

        return null;
    };

    /**
     * Returns what type of template to insert into the existing page in order to create an internal link to a Light Context.
     * In case of an internal link this will always be a template of the "Internal Link" type.
     * @returns {String} - A string containing "Internal Link"
     */
    EMMInternalLinkDialog.prototype.findTemplateToUse = function () {
        return "Internal link";
    };

    function checkAndPrintSuffix(suggestionObject, suffix) {
        if (suffix != null)
            return suggestionObject.value + " (" + suffix.printouts["Semantic title"][0] + ")";
        else
            return suggestionObject.value + " " + OO.ui.deferMsg("visualeditor-emm-suggestion-err-no-supercontext")();
    }

    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMInternalLinkDialog;
}