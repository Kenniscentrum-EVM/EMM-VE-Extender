/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createInternalLinkDialog(Dialog) {
    var EMMInternalLinkDialog = function () {
        Dialog.call(this);
        this.autocompleteQuery = "[[Category:Light Context||Project]]|?Semantic title|limit=10000";
        this.editQuery = "[[PAGENAMEPARAMETER]] |?Semantic title";
    };
    OO.inheritClass(EMMInternalLinkDialog, Dialog);

    EMMInternalLinkDialog.prototype.createFields = function () {
        //Set the placeholder of titleField
        this.titleField.$element.find('input').prop("placeholder", OO.ui.deferMsg("visualeditor-emm-search")());
    };

    EMMInternalLinkDialog.prototype.createDialogLayout = function () {
        Dialog.prototype.createDialogLayout.call(this);
        var dialogInstance = this;
        //Things to do when the specified field changes
        this.titleField.onChangeFunctions = [function () {
            if (this.isExistingResource && this.dialogMode != 2) {
                if (dialogInstance.titleField.value.length == 0) {
                    this.isExistingResource = false;
                }
            }
        }, this.testAndChangeDialogMode];
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

    EMMInternalLinkDialog.prototype.executeModeChange = function (mode) {
        switch(mode)
        {
            case 0:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-dialoginternallinktitle")());
                break;
            case 1:
                this.$element.find('.oo-ui-processDialog-title').text("Aanpassen & Invoegen koppeling naar pagina");
                break;
            case 2:
                this.$element.find('.oo-ui-processDialog-title').text(OO.ui.deferMsg("visualeditor-emm-inlidialog-title-edit")());
                break;
        }
        toggleAutoComplete(this); //fixme: lijkt niet te werken?
    };

    EMMInternalLinkDialog.prototype.testAndChangeDialogMode = function () {
        switch(this.dialogMode)
        {
            case 0:
                if(this.isExistingResource && this.titleField.getValue() != this.suggestion.value)
                {
                    this.dialogMode = 1;
                    this.executeModeChange(1);
                }
                break;
            case 1:
                if((this.isExistingResource && this.titleField.getValue() == this.suggestion.value) || !this.isExistingResource)
                {
                    this.dialogMode = 0;
                    this.executeModeChange(0);
                }
                break;
        }
    };


    EMMInternalLinkDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkdata) {
        var dialogInstance = this;
        var query = "Light Context[Heading]=" + this.titleField.getValue();
        if (!this.isExistingResource) {
            //Start building the sfautoedit query
            query += "&Light Context[Supercontext]=" + currentPageID;
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
                    dialogInstance.executeQuery(query, insertCallback);
                } else {
                    alert(OO.ui.deferMsg("visualeditor-emm-topcontext-error")());
                }
            });
        }
        else {
            if (this.suggestion.value != this.titleField.getValue()) {
                this.executeQuery(query, insertCallback, linkdata);
            }
            else {
                insertCallback(this.suggestion.data);
            }
        }
    };

    EMMInternalLinkDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        semanticCreateWithFormQuery(query, insertCallback, linkdata, "Light Context");
    };

    EMMInternalLinkDialog.prototype.fillFields = function () {
        //Nothing to fill, no editable fields beyond presentationtitle and title
    };

    EMMInternalLinkDialog.prototype.processDialogSpecificQueryResult = function () {
        //No additional behaviour on top of the default behaviour
    };

    EMMInternalLinkDialog.prototype.findTemplateToUse = function () {
        return "Internal link";
    };


    return EMMInternalLinkDialog;
}