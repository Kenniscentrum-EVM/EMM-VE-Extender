/**
 * Created by Carlo Geertse on 19-10-2016.
 */
"use strict";


/**
 * This function more or less functions like a factory. It receives a parent 'class', it then adds its own behavior on
 * top of the existing behavior. When done with modifying the 'class' this method then returns the modified class/function.
 * @param {EMMDialog} EMMDialog - The 'class'-definition of EMMLightResourceDialog
 * @param {String} resourceType - The type of resource for which this 'factory' should create a class
 * @returns {EMMLightResourceDialog} - returns the 'class'-definition of an EMMLightResourceDialog
 */
function createLightResourceDialog(EMMDialog, resourceType) {
    /**
     * Calls the constructor of it's super class, EMMDialog.
     * @extends EMMDialog
     * @constructor
     */
    var EMMLightResourceDialog = function () {
        EMMDialog.call(this);
    };
    OO.inheritClass(EMMLightResourceDialog, EMMDialog);

    /**
     * Creates generic input fields for a dialog that handles a Light Resource.
     * The most generic fields are created in the constructor of EMMDialog.
     */
    EMMLightResourceDialog.prototype.createFields = function () {
        this.creatorField = new OO.ui.TextInputWidget({});
        this.dateField = new OO.ui.TextInputWidget({type: "date"});
        this.organizationField = new OO.ui.TextInputWidget({});
        this.subjectField = new OO.ui.TextInputWidget({});
    };

    /**
     * Add validation to the generic fields for a dialog that handles a Light Resource.
     * Validation for the most generic fields is added in the constructor of EMMDialog.
     */
    EMMLightResourceDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];
        this.creatorField.validation = [checkIfEmpty];
        this.dateField.validation = [checkIfEmpty, checkIfDate];
    };

    /**
     * Retrieves the auto complete state for a given dialog mode.
     * @abstract
     * @param {modeEnum} mode - dialog mode to get the auto complete state for.
     * @returns {boolean} - The value the auto complete should be set to.
     */
    EMMLightResourceDialog.prototype.getAutoCompleteStateForMode = function (mode) {
        switch (mode) {
            case this.modeEnum.INSERT_EXISTING:
                return true;
            case this.modeEnum.INSERT_AND_EDIT_EXISTING:
                return false;
            case this.modeEnum.INSERT_NEW:
                return false;
            case this.modeEnum.EDIT_EXISTING:
                return false;
            default:
                return false;
        }
    };

    /**
     * Builds a generic query for editing or creating a light resource, should be expanded on in classes that extend this class.
     * @param {String} currentPageID - The internal name of the current page
     * @returns {string} - Returns a basic query for editing or creating a light resource, should be expanded on for
     * specific kinds of light resources.
     */
    EMMLightResourceDialog.prototype.buildQuery = function (currentPageID) {
        var query = "";
        var heading = this.titleField.getValue();
        heading = heading.replace(/&/g,"%26").replace(/\+/g,"%2B"); //Escape the &-charcter and +-character
        query += "Resource Description[title]=" + heading +
            "&Resource Description[creator]=" + this.creatorField.getValue() +
            "&Resource Description[date]=" + this.dateField.getValue();
        if (this.organizationField.getValue().length > 0) {
            query += "&Resource Description[organization]=" + this.organizationField.getValue();
        }
        if (this.subjectField.getValue().length > 0) {
            query += "&Resource Description[subject]=" + this.subjectField.getValue();
        }
        if (!this.isExistingResource) {
            query += "&Resource Description[created in page]=" + currentPageID;
        }
        return query;
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMLightResourceDialog.prototype.isEdit = function () {
        return EMMDialog.prototype.isEdit.call(this) ||
            this.creatorField.getValue() != this.suggestion.creator ||
            this.dateField.getValue() != fixDate(this.suggestion.date) ||
            (this.organizationField.getValue() != this.suggestion.organization && !(this.organizationField.getValue() == "" && this.suggestion.organization == null)) ||
            (this.subjectField.getValue() != this.suggestion.subjects && !(this.subjectField.getValue() == "" && this.suggestion.subjects == null));
    };

    EMMLightResourceDialog.prototype.initVariables = function () {
        //LightResourceDialog.prototype.initVariables.call(this);
    };
    /**
     * Fill the generic fields of a dialog handling a light resource based on a selected resource from the autocomplete dropdown.
     * Fields for a specific type of Light Resource should be filled in their own method.
     */
    EMMLightResourceDialog.prototype.fillFields = function () {
        var thatdialog=this;
        var callFillFields=function(){
            thatdialog.creatorField.setValue(thatdialog.suggestion.creator);
            thatdialog.dateField.setValue(fixDate(thatdialog.suggestion.date));
            thatdialog.organizationField.setValue(thatdialog.suggestion.organization);
            thatdialog.subjectField.setValue(thatdialog.suggestion.subjects);
        };

        /*if (sparqlStore.sparqlActive){
            console.log("self:",this.suggestion);
            sparqlStore.getLightContextProperties(this.suggestion.data,function(data){
                var resultSet=data.query.results;
                var row=Object.keys(resultSet)[0];
                thatdialog.suggestion = thatdialog.processSingleQueryResult( row, resultSet, null);
                callFillFields();
            });

        }
        else */{
            callFillFields();
        }
    };

    /**
     * Processes (a part of) a single row in the resultset of an ask-query that gathered information about all light
     * resources of a certain type. May need to be further expanded for filling specific fields only present in more
     * specific types of Light Resource. This expands a suggestion object that already contains generic information for
     * an EMMDialog.
     * @param {String} row - String index of a row in the resultSet associative array.
     * @param {Object[]} resultSet - Associative array which functions like a dictionary, using strings as indexes, contains the result of a query.
     * @param {Object} previousSuggestion - A suggestion object that contains the information about the previous processed suggestion, useful for comparing and sorting.
     * @returns {Object} - An updated suggestionObject.
     */
    EMMLightResourceDialog.prototype.processSingleQueryResult = function (row, resultSet, previousSuggestion) {
        var suggestionObject = EMMDialog.prototype.processSingleQueryResult.call(this, row, resultSet, previousSuggestion);

        suggestionObject.creator = resultSet[row].printouts["Dct:creator"][0];
        suggestionObject.date = resultSet[row].printouts["Dct:date"][0];
        suggestionObject.organization = resultSet[row].printouts.Organization[0];
        suggestionObject.subjects = "";
        var querySubjects = resultSet[row].printouts["Dct:subject"];
        //Gathers all subjects and creates a single string which contains the fulltext name of all the subjects,
        //separated by a ,
        for (var j = 0; j < querySubjects.length; j++) {
            suggestionObject.subjects += querySubjects[j].fulltext + ", ";
        }
        //Remove comma and space at the end of the subject list
        suggestionObject.subjects = suggestionObject.subjects.slice(0, -2);
        return suggestionObject;
    };

    /**
     * Decide what type of dialog-class the 'factory' function should return.
     */
    switch (resourceType) {
        case "File":
            return createFileDialog(EMMLightResourceDialog);
            break;
        case "External link":
            return createExternalLinkDialog(EMMLightResourceDialog);
            break;
        case "Bibliographic reference":
            return createBibliographicReferenceDialog(EMMLightResourceDialog);
            break;
        default:
            mw.notify(OO.ui.deferMsg("visualeditor-emm-dialog-error")(), {
                autoHide: false,
                type: "error"
            });
            return null;
    }
}