/**
 * Created by Carlo_Laptop on 15-12-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It receives a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMLightResourceDialog} LightResourceDialog - The 'class'-definition of EMMLightResourceDialog
 * @returns {EMMBibliographicReferenceDialog} - returns the 'class'-definition of an EMMBibliographicReferenceDialog
 */
function createBibliographicReferenceDialog(LightResourceDialog) {
    /**
     * Calls the constructor of its super class, EMMLightResourceDialog. Also defines some queries used to get information
     * about bibliographic references.
     * @extends EMMLightResourceDialog
     * @constructor
     */
    var EMMBibliographicReferenceDialog = function () {
        LightResourceDialog.call(this);
        this.autoCompleteQuery = "[[Category:Resource Description]][[Bibtex type::!Misc]]|?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?Bibtex type|sort=Semantic title|order=asc|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?Bibtex type";
    };
    OO.inheritClass(EMMBibliographicReferenceDialog, LightResourceDialog);

    /**
     * Creates the input fields unique for a BibliographicReferenceDialog, calls its parent method to create more generic fields.
     * The most generic fields are created in the constructor of EMMDialog.
     */
    EMMBibliographicReferenceDialog.prototype.createFields = function () {
        LightResourceDialog.prototype.createFields.call(this);
        //Create input fields unique for a bibliographic reference dialog
        this.bibtexField = new OO.ui.DropdownWidget({
            menu: {
                items: [
                    new OO.ui.MenuOptionWidget({
                        data: "Article",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-article")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "Book",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-book")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "Booklet",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-booklet")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "InCollection",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-incollection")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "InProceedings",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-inproceedings")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "Manual",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-manual")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "MastersThesis",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-mastersthesis")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "PhDThesis",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-phdthesis")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "Proceedings",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-proceedings")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "TechReport",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-techreport")()
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: "Unpublished",
                        label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type-unpublished")()
                    })
                ]
            }
        });
        this.bibtexField.getMenu().selectItemByData("Article");
        //Set the placeholder of titleField
        this.titleField.$element.find("input").prop("placeholder", OO.ui.deferMsg("visualeditor-emm-bibref-titlefield-placeholder-def")());
    };

    /**
     * Adds fields specific for a bibliographic reference to the fieldset and configures other layout options. Calls the method
     * of the parent to do the same for more generic fields. Also sets the validation parameters of these fields and
     * adds functions that need to be executed when the content of a certain field changes.
     */
    EMMBibliographicReferenceDialog.prototype.createDialogLayout = function () {
        LightResourceDialog.prototype.createDialogLayout.call(this);
        var dialogInstance = this;

        /**
         * Checks the titlefield and sets existingresource to false if the titlefield changed to empty from a full field
         */
        var testSuggestedLink = function () {
            if (this.isExistingResource && this.dialogMode != 2) {
                if (dialogInstance.titleField.value.length == 0) {
                    this.isExistingResource = false;
                }
            }
        };

        //Defines what should happen when the content of the titlefield changes
        this.titleField.onChangeFunctions = [testSuggestedLink, this.testAndChangeDialogMode];
        //Defines what should happen when the content of the linkfield changes

        //Add all the fields to the fieldset, configuring the order in which they appear in the dialog.
        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-title"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-presentationtitle"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.bibtexField, {
                label: OO.ui.deferMsg("visualeditor-emm-bibref-bibtex-type"),
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
            })
        ]);
    };

    /**
     * Method that switches the dialog to a given mode.
     * This method preforms all necessary operations to visually and logically switch the state of the dialog to a different mode.
     *
     * Dialog modes are defined in the modeEnum variable (which is defined in EMMDialog) this enum should always be used when switching modes.
     * @param {number} mode - Dialog mode to switch to.
     */
    EMMBibliographicReferenceDialog.prototype.executeModeChange = function (mode) {
        this.dialogMode = mode;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-bibref-title-insert")());
                break;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-bibref-title-insert-edit")());
                break;
            case this.modeEnum.INSERT_NEW:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-bibref-title-new")());
                break;
            case this.modeEnum.EDIT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-bibref-title-edit")());
                break;
        }
        this.validator.cleanUpForm();
        setAutoCompleteEnabled(this, this.getAutoCompleteStateForMode(mode));
    };


    /**
     * @abstract
     * Retrieves the auto complete state for a given dialog mode.
     * @param {modeEnum} mode - dialog mode to get the auto complete state for.
     * @returns {boolean} - The value the auto complete should be set to.
     */
    EMMBibliographicReferenceDialog.prototype.getAutoCompleteStateForMode = function (mode) {
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
     * The method is executed every time the state of the link field or title field changes.
     */
    EMMBibliographicReferenceDialog.prototype.testAndChangeDialogMode = function () {
        switch (this.dialogMode) {
            case this.modeEnum.INSERT_EXISTING:
                if (this.isExistingResource && this.titleField.getValue() != this.suggestion.value)
                    this.executeModeChange(this.modeEnum.INSERT_AND_EDIT_EXISTING);
                if (!this.isExistingResource && this.titleField.getValue().length > 0)
                    this.executeModeChange(this.modeEnum.INSERT_NEW);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.isExistingResource || this.titleField.getValue().length == 0)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING);
                break;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                if ((this.isExistingResource && this.titleField.getValue() == this.suggestion.value) || this.titleField.getValue().length == 0)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING);
                break;
        }
    };

    /**
     * Builds and executes a query that creates a new external link or edits an existing one with the sfautoedit api-calll.
     * After the new external link has been added, a link is then inserted into the page by executing insertCallback.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {function} insertCallback - The function that should be executed after a new external link has been added or
     * an existing one was changed. This function handles inserting a clickable external link in the current page.
     * @param {String} linkdata - In case of an existing external link, linkdata contains the internal name of the external link
     * in order to let the api know what existing external link should be edited. Otherwise linkdata is just an empty string.
     */
    EMMBibliographicReferenceDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        //First call the method of the parent to build the basic query for a light resource
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        //Expand the sfautoedit query
        query += "&Resource Description[Bibtex type]=" + this.bibtexField.getValue();
        this.executeQuery(query, insertCallback, linkdata);
    };

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new external link or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a clickable external link into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of an external link. Should be set to the internal title of the external link
     * you want to edit, or be empty when creating a new external link.
     */
    EMMBibliographicReferenceDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        //Set the target of the api-call to the internal title of an existing external link, if the external link already exists.
        if (this.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Bibliographic Reference");
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMBibliographicReferenceDialog.prototype.isEdit = function () {
        return LightResourceDialog.prototype.isEdit.call(this) ||
            this.bibtexField.getValue() != this.suggestion["Bibtex type"];
    };

    /**
     * Fill the fields of the dialog based on a bibliographic reference the user has selected from the autocomplete dropdown.
     */
    EMMBibliographicReferenceDialog.prototype.fillFields = function () {
        LightResourceDialog.prototype.fillFields.call(this);
        this.bibtexField.getMenu().selectItemByData(this.suggestion["Bibtex type"]);
        this.validator.validateAll();
    };

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionobject by adding bibliographic reference-specific
     * data from the queryresult to the suggestionObject.
     * @param {String} row - String index of a row in the resultSet associative array.
     * @param {Object[]} resultSet - Associative array which functions like a dictionary, using strings as indexes, contains the result of a query.
     * @param {Object} previousSuggestion - A suggestion object that contains the information about the previous processed suggestion, useful for comparing and sorting.
     * @returns {Object} - An updated suggestionObject, or null when the object is invalid.
     */
    EMMBibliographicReferenceDialog.prototype.processSingleQueryResult = function (row, resultSet, previousSuggestion) {
        var suggestionObject = LightResourceDialog.prototype.processSingleQueryResult.call(this, row, resultSet, previousSuggestion);

        if (previousSuggestion != null && previousSuggestion.semanticTitle == suggestionObject.semanticTitle && previousSuggestion.value == previousSuggestion.semanticTitle)
            previousSuggestion.value = previousSuggestion.value + " (" + previousSuggestion.hyperlink + ")";
        suggestionObject["Bibtex type"] = resultSet[row].printouts["Bibtex type"][0];
        if (previousSuggestion != null && previousSuggestion.semanticTitle == suggestionObject.value)
            suggestionObject.value = suggestionObject.value + " (" + suggestionObject.hyperlink + ")";
        return suggestionObject;
    };

    /**
     * Returns what type of template to insert into the existing page in order to create a bibliographic reference.
     * For a bibliographic reference this will always be a Cite.
     * @returns {String} - A string containing either "Cite" or "External link"
     */
    EMMBibliographicReferenceDialog.prototype.findTemplateToUse = function () {
        return "Cite";
    };
    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMBibliographicReferenceDialog;
}