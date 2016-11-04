/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It receives a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMLightResourceDialog} LightResourceDialog - The 'class'-definition of EMMLightResourceDialog
 * @returns {EMMExternalLinkDialog} - returns the 'class'-definition of an EMMExternalLinkDialog
 */
function createExternalLinkDialog(LightResourceDialog) {
    /**
     * Calls the constructor of it's super class, EMMLightResourceDialog. Also defines some queries used to get information
     * about external links.
     * @constructor
     */
    var EMMExternalLinkDialog = function () {
        LightResourceDialog.call(this);
        this.autoCompleteQuery = "[[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject";
    };
    OO.inheritClass(EMMExternalLinkDialog, LightResourceDialog);

    /**
     * Creates the input fields unique for an ExternalLinkDialog, calls its parent method to create more generic fields.
     * The most generic fields are created in the constructor of EMMDialog.
     */
    EMMExternalLinkDialog.prototype.createFields = function () {
        LightResourceDialog.prototype.createFields.call(this);
        //Create input fields for an external link dialog
        this.linkField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-linkfield-placeholder-def")()});
        this.addToResourcesField = new OO.ui.CheckboxInputWidget({selected: true});
        //Set the placeholder of titleField
        this.titleField.$element.find("input").prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
    };

    /**
     * Adds fields specific for an ExternalLinkDialog to the fieldset and configures other layout options. Calls the method
     * of the parent to do the same for more generic fields. Also sets the validation parameters of these fields and
     * adds functions that need to be executed when the content of a certain field changes.
     */
    EMMExternalLinkDialog.prototype.createDialogLayout = function () {
        LightResourceDialog.prototype.createDialogLayout.call(this);
        var dialogInstance = this;
        this.linkField.validation = [checkIfEmpty, checkIfWebsite];

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
        this.linkField.onChangeFunctions = [this.testAndChangeDialogMode];

        //Add all the fields to the fieldset, configuring the order in which they appear in the dialog.
        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.titleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-title"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.linkField, {
                label: OO.ui.deferMsg("visualeditor-emm-link"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-presentationtitle"),
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
            }),
            new OO.ui.FieldLayout(this.addToResourcesField, {
                label: OO.ui.deferMsg("visualeditor-emm-link-add-resource"),
                align: "left"
            })
        ]);
    };

    /**
     * Executes a dialog mode change.
     * @param {Number} mode - Dialog mode to switch to (defined in modeEnum).
     */
    EMMExternalLinkDialog.prototype.executeModeChange = function (mode) {
        this.dialogMode = mode;
        var input = null;
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                clearInputFields(this.fieldset, [2], ["OoUiLabelWidget"]);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.suggestion != null) {
                    if (this.suggestion.hyperlink == this.linkField.value) {
                        clearInputFields(this.fieldset, [0, 2], ["OoUiLabelWidget"]);
                        this.validator.cleanUpForm();
                        return;
                    }
                    else {
                        clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                    }
                }
                else {
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                }
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-new")());
                //todo temporary
                break;
            case this.modeEnum.EDIT_EXISTING:
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-edit")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                clearInputFields(this.fieldset, [2], ["OoUiLabelWidget"]);
                break;
        }
        this.validator.cleanUpForm();
        toggleAutoComplete(this);
    };

    /**
     * Checks the dialog variables to determine if a mode-change is needed.
     * If one is needed, execute it.
     */
    EMMExternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        switch (this.dialogMode) {
            case this.modeEnum.INSERT_EXISTING:
                if (!this.isExistingResource && this.linkField.value.length != 0)
                    this.executeModeChange(this.modeEnum.INSERT_NEW);
                break;
            case this.modeEnum.INSERT_NEW:
                if (this.linkField.value.length == 0)
                    this.executeModeChange(this.modeEnum.INSERT_EXISTING);
                break;
            case this.modeEnum.EDIT_EXISTING:
                if (!this.isExistingResource) {
                    //todo discuss with Hans.
                }
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
    EMMExternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        //First call the method of the parent to build the basic query for a light resource
        var query = LightResourceDialog.prototype.buildQuery.call(this, currentPageID);
        //Expand the sfautoedit query
        query += "&Resource Description[hyperlink]=" + this.linkField.getValue();
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
    EMMExternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        var target = "";
        //Set the target of the api-call to the internal title of an existing external link, if the external link already exists.
        if (this.isExistingResource) {
            target = linkdata;
        }
        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMExternalLinkDialog.prototype.isEdit = function () {
        return LightResourceDialog.prototype.isEdit.call(this) ||
            this.linkField.getValue() != this.suggestion.hyperlink;
    };

    /**
     * Fill the fields of the dialog based on an external link the user has selected from the autocomplete dropdown.
     */
    EMMExternalLinkDialog.prototype.fillFields = function () {
        LightResourceDialog.prototype.fillFields.call(this);
        this.linkField.setValue(this.suggestion.hyperlink);
        this.validator.validateAll();
    };

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionobject by adding external link-specific
     * data from the queryresult to the suggestionObject.
     * @param {Object} singleResult - A single row from the result of the api-call that contains all the information
     * about an external link that was asked for in the query.
     * @param {Object} suggestionObject - A single suggestion for the autocomplete dropdown that should be expanded.
     * Should already contain data of generic resource and a lightResource.
     */

    /**
     * Processes part of the result of an ask query. Expands an existing suggestionobject by adding external link-specific
     * data from the queryresult to the suggestionObject.
     * @param {Object} singleResult - A single row from the result of the api-call that contains all the information
     * about an external link that was asked for in the query.
     * @param {Object} suggestionObject - A single suggestion for the autocomplete dropdown that should be expanded.
     * Should already contain data of generic resource and a lightResource.
     * @returns {Object} - An updated suggestionObject, or null when the singleresult is invalid
     */
    EMMExternalLinkDialog.prototype.processDialogSpecificQueryResult = function (singleResult, suggestionObject) {
        if (/Bestand:|File:/ig.test(suggestionObject.data)) {
            return null;
        }
        else {
            suggestionObject = LightResourceDialog.prototype.processDialogSpecificQueryResult.call(this, singleResult, suggestionObject);
            suggestionObject.hyperlink = singleResult.printouts.Hyperlink[0];
            return suggestionObject;
        }
    };

    /**
     * Returns what type of template to insert into the existing page in order to create an external link. For an external
     * link this can either be a cite or an external link, depending on the state of the checkbox at the bottom of the dialog.
     * @returns {String} - A string containing either "Cite" or "External link"
     */
    EMMExternalLinkDialog.prototype.findTemplateToUse = function () {
        if (this.addToResourcesField.isSelected()) {
            return "Cite";
        }
        return "External link";
    };
    //Return the entire 'class' in order to pass this definition to the window factory.
    return EMMExternalLinkDialog;
}