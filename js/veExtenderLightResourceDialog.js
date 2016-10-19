/**
 * Created by Carlo Geertse on 19-10-2016.
 */
"use strict";

function createLightResourceDialog(Dialog, resourceType) {
    console.log("Light resource dialog");

    var LightResourceDialog = function (surface, config) {
        Dialog.call(this, surface, config);
    };
    OO.inheritClass(LightResourceDialog, Dialog);

    LightResourceDialog.prototype.createFields = function () {
        this.titleField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-linkdialog-titlefield-placeholder-def")()});
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
    };

    LightResourceDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];
        this.creatorField.validation = [checkIfEmpty];
        this.dateField.validation = [checkIfEmpty, checkIfDate];
    };

    LightResourceDialog.prototype.buildQuery = function (currentPageID) {
        var query = "";
        query += "Resource Description[title]=" + this.titleField.getValue() +
            "&Resource Description[creator]=" + this.creatorField.getValue() +
            "&Resource Description[date]=" + this.dateField.getValue();
        if (this.organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + this.organizationField.getValue();
        if (this.subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + this.subjectField.getValue();
        if (!this.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
        return query;
    };

    LightResourceDialog.prototype.fillFields = function (suggestion) {
        this.creatorField.setValue(suggestion.creator);
        this.dateField.setValue(fixDate(suggestion.date));
        this.organizationField.setValue(suggestion.organization);
        this.subjectField.setValue(suggestion.subjects);
    };

    LightResourceDialog.prototype.processDialogSpecificQueryResult = function (res, prop, suggestionObject) {
        suggestionObject.creator = res[prop].printouts["Dct:creator"][0];
        suggestionObject.date = res[prop].printouts["Dct:date"][0];
        suggestionObject.organization = res[prop].printouts["Organization"][0];
        suggestionObject.subjects = "";
        var querySubjects = res[prop].printouts["Dct:subject"];
        //Gathers all subjects and creates a single string which contains the fulltext name of all the subjects,
        //seperated by a ,
        for (var j = 0; j < querySubjects.length; j++) {
            suggestionObject.subjects += querySubjects[j].fulltext + ", ";
        }
        //Remove comma and space at the end of the subject list
        suggestionObject.subjects = suggestionObject.subjects.slice(0, -2);
    };

    switch(resourceType) {
        case "File":
            return createFileDialog(LightResourceDialog);
            break;
        case "External link":
            return createExternalLinkDialog(LightResourceDialog);
            break;
        default:
            alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            return null;
    }
}