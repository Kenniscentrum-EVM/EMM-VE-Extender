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
     * @constructor
     */
    var EMMInternalLinkDialog = function () {
        EMMDialog.call(this);
        this.autoCompleteQuery = "[[Category:Light Context||Project]]|?Semantic title|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title";
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
                if (dialogInstance.titleField.value.length == 0) {
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
     * TODO expand this and comment
     */
    EMMInternalLinkDialog.prototype.executeModeChange = function (mode) {
        this.dialogMode = mode;
        switch(mode)
        {
            case this.modeEnum.INSERT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialoginternallinktitle")());
                break;
            case this.modeEnum.INSERT_NEW:
                this.$element.find('.oo-ui-processDialog-title').text("Aanpassen & Invoegen koppeling naar pagina");
                break;
            case this.modeEnum.EDIT_EXISTING:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-inlidialog-title-edit")());
                break;
        }
        //console.log(this.titleField.$element.find("input").autocomplete());
        toggleAutoComplete(this);

    };

    /**
     * TODO expand this and comment
     */
    EMMInternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        switch(this.dialogMode)
        {
            case this.modeEnum.INSERT_EXISTING:
                if(this.isExistingResource && this.titleField.getValue() != this.suggestion.value)
                    this.executeModeChange(this.modeEnum.INSERT_NEW);
                break;
            case this.modeEnum.INSERT_NEW:
                if((this.isExistingResource && this.titleField.getValue() == this.suggestion.value) || !this.isExistingResource)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING);
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
        var query = "Light Context[Heading]=" + this.titleField.getValue();
        if (!this.isExistingResource) {
            //Start building the sfautoedit query
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
                    dialogInstance.executeQuery(query, insertCallback, linkdata);
                } else {
                    alert(OO.ui.deferMsg("visualeditor-emm-topcontext-error")());
                }
            });
        }
        else {
            this.executeQuery(query, insertCallback, linkdata);
        }
    };

    /**
     * Executes an sf-autoedit api call by using the mediawiki api. This call either creates a new Light Context or updates an existing one.
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the Light Context into the current page.
     * This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a Light Context resource. Should be set to the internal title of the Light Context
     * you want to edit, or be empty when creating a new file resource.
     */
    EMMInternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        semanticCreateWithFormQuery(query, insertCallback, linkdata, "Light Context");
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
     * data from the queryresult to the suggestionObject. Currently this function is empty, because an EMMInternalLinkDialog
     * does not contain any other fields beyond the basic fields of an EMMDialog.
     * @param {Object} singleResult - A single row from the result of the api-call that contains all the information
     * about an internal link that was asked for in the query.
     * @param {Object} suggestionObject - A single suggestion for the autocomplete dropdown that should be expanded.
     * Should already contain data of generic resource and a lightResource.
     */
    EMMInternalLinkDialog.prototype.processDialogSpecificQueryResult = function (singleResult, suggestionObject) {
        //No additional behaviour on top of the default behaviour
    };

    /**
     * Returns what type of template to insert into the existing page in order to create an internal link to a Light Context.
     * In case of an internal link this will always be a template of the "Internal Link" type.
     * @returns {String} - A string containing "Internal Link"
     */
    EMMInternalLinkDialog.prototype.findTemplateToUse = function () {
        return "Internal link";
    };

    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMInternalLinkDialog;
}