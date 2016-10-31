/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

/**
 * This function more or less functions like a factory. It recieves a parent 'class', it then adds its own behavior on
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
            if (this.isExistingResource) {
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
                label: OO.ui.deferMsg("viualeditor-emm-link-presentationtitle"),
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
     * TODO commentaar Nick
     */
    EMMExternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        var input = null;
        if (this.dialogMode == 0) {
            if (!this.isExistingResource && this.linkField.value.length != 0) {
                if (this.suggestion != null) {
                    if (this.suggestion.hyperlink == this.linkField.value) {
                        clearInputFields(this.fieldset, [0, 2], ["OoUiLabelWidget"]);
                        this.validator.cleanUpForm();
                        return;
                    }
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                }
                else {
                    clearInputFields(this.fieldset, [0, 1, 2], ["OoUiLabelWidget"]);
                }
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-linkdialog-title-npage")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-new")());
                //todo temporary
                this.dialogMode = 1;
                toggleAutoComplete(this, this.titleField);
                this.validator.cleanUpForm();
            }
        }
        else {
            if (this.linkField.value.length == 0) {
                this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
                input = this.titleField.$element.find("input");
                input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
                this.dialogMode = 0;
                toggleAutoComplete(this, this.titleField);
                clearInputFields(this.fieldset, [1, 2], ["OoUiLabelWidget"]);
                this.validator.cleanUpForm();
            }
        }
    };

    /**
     * TODO Commentaar Nick
     */
    EMMExternalLinkDialog.prototype.resetMode = function () {
        this.$element.find(".oo-ui-processDialog-title").text(OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")());
        this.dialogMode = 0; //TODO: check if this is still necessary
        toggleAutoComplete(this, this.titleField);
        var input = this.titleField.$element.find("input");
        input.prop("placeholder", OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")());
        this.validator.cleanUpForm();
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
     * Fill the fields of the dialog based on an external link the user has selected from the autocomplete dropdown.
     * @param {Object} suggestion - An object containing the properties of the selected external link.
     * This ojbect is created when initiating the autocomplete library.
     */
    EMMExternalLinkDialog.prototype.fillFields = function (suggestion) {
        LightResourceDialog.prototype.fillFields.call(this, suggestion);
        this.linkField.setValue(suggestion.hyperlink);
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
    EMMExternalLinkDialog.prototype.processDialogSpecificQueryResult = function (singleResult, suggestionObject) {
        LightResourceDialog.prototype.processDialogSpecificQueryResult.call(this, singleResult, suggestionObject);
        suggestionObject.hyperlink = singleResult.printouts.Hyperlink[0];
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