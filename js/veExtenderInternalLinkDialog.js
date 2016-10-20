/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createInternalLinkDialog(Dialog) {
    var EMMInternalLinkDialog = function (surface, config) {
        Dialog.call(this, surface, config);
    };
    OO.inheritClass(EMMInternalLinkDialog, Dialog);

    EMMInternalLinkDialog.prototype.createFields = function () {
        //Create input fields for an internal link dialog
        this.titleField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-search")});
    };

    EMMInternalLinkDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];

        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [function () {
            if (this.isExistingResource) {
                if (this.suggestion.value != this.titleField.value)
                    this.isExistingResource = false;
            }
        }];
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

    EMMInternalLinkDialog.prototype.testDialogMode = function () {
        //Modes not implemented yet
    };

    EMMInternalLinkDialog.prototype.resetMode = function () {
        //Modes not implemented yet
    };

    EMMInternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback) {
        var query = "";
        if (!this.isExistingResource) {
            //Start building the sfautoedit query
            query += "Light Context[Supercontext]=" + currentPageID +
                "&Light Context[Heading]=" + this.titleField.getValue();
            //Find the topcontext of the current page
            var api = new mw.Api();
            api.get({
                action: 'ask',
                parameters: 'limit:10000',//check how to increase limit of ask-result; done in LocalSettings.php
                query: "[[" + currentPageID + "]]|?Topcontext|limit=10000"//
            }).done(function (data) {
                var res = data.query.results;
                if (res[currentPageID].printouts["Topcontext"][0] != null) {
                    var topContext = res[currentPageID].printouts["Topcontext"][0].fulltext;
                    query += "&Light Context[Topcontext]=" + topContext;
                    this.executeQuery(query, insertCallback);
                } else {
                    alert(OO.ui.deferMsg("visualeditor-emm-topcontext-error")());
                }
            });
        }
        else {
            insertCallback(this.suggestion.data);
        }
    };

    EMMInternalLinkDialog.prototype.executeQuery = function (query, insertCallback) {
        semanticCreateWithFormQuery(query, insertCallback, null, "Light Context");
    };

    EMMInternalLinkDialog.prototype.fillFields = function (suggestion) {
        //Nothing to fill, no editable fields beyond presentationtitle and title
        this.validator.validateAll();
    };

    EMMInternalLinkDialog.prototype.processDialogSpecificQueryResult = function (res, prop, suggestionObject) {
        //No additional behaviour on top of the default behaviour
    };

    return EMMInternalLinkDialog;
}