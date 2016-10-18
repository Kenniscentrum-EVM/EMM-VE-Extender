/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createInternalLinkDialog(Dialog) {
    console.log("Internal Link Dialog");

    var InternalLinkDialog = function (surface, config) {
        Dialog.call(this, surface, config);
        //Create input fields in case we're dealing with an internal link
        this.pageNameField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-search")});
    };
    OO.inheritClass(InternalLinkDialog, Dialog);

    InternalLinkDialog.prototype.createFields = function () {
        //Create input fields in case we're dealing with a dialog to add a file
        this.titleField = new OO.ui.TextInputWidget({
            placeholder: OO.ui.deferMsg("visualeditor-emm-filedialog-titlefield-placeholder-def")
        });
        this.fileField = new OO.ui.SelectFileWidget({
            droppable: true,
            showDropTarget: true
        });
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
    };

    InternalLinkDialog.prototype.createDialogLayout = function () {
        this.pageNameField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];

        //Things to do when the specified field changes
        this.pageNameField.onChangeFunctions = [function () {
            if (dialogInstance.isExistingResource)
                if (dialogInstance.suggestion.value != pageNameField.value)
                    dialogInstance.isExistingResource = false;
        }];

        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.pageNameField, {
                label: OO.ui.deferMsg("visualeditor-emm-page"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-page-presentationtitle"),
                align: "left"
            })
        ]);
    };

    InternalLinkDialog.prototype.resetMode = function () {
        //Empty function, because the internal link dialog has no modes
    };

    InternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback) {
        var query = "";
        if (!dialogInstance.isExistingResource) {
            //Start building the sfautoedit query
            query += "Light Context[Supercontext]=" + currentPageID +
                "&Light Context[Heading]=" + this.pageNameField.getValue();
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
            insertCallback();
        }
    };

    InternalLinkDialog.prototype.executeQuery = function (query, insertCallback) {
        semanticCreateWithFormQuery(query, insertCallback, null, "Light Context");
    };

    return InternalLinkDialog;
}