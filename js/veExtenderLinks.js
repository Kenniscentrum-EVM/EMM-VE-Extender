"use strict";


/*  addEMMLinks
 *  This method is executed when the extention is loaded and is responsible for passing the correct information to the loadEMMDialog method
 */
function addEMMLinks() {
    var queries = veExtenderQueries();

    loadEMMDialog("File", "file", "visualeditor-emm-menufiletitle", "visualeditor-emm-dialogfiletitle",
        queries.linkfiles,
        function (namedata, linkdata) {
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                }
            };
        }
    );
    loadEMMDialog("Internal link", "linkpage", "visualeditor-emm-menuinternallinktitle", "visualeditor-emm-dialoginternallinktitle",
        queries.linkpages,
        function (namedata, linkdata) {
            return {
                link: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                }
            };
        }
    );
    loadEMMDialog("External link", "linkwebsite", "visualeditor-emm-menuexternallinktitle", "visualeditor-emm-dialogexternallinktitle",
        queries.linkwebsites,
        function (namedata, linkdata) {
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                }
            };
        }
    );
}


/**
 * This function creates all the insert dialogs for internal links, external links and files.
 * It also creates menu buttons that allow access to these dialogs
 * @param resourceType The type of resource that should be linked to
 * @param toolId The id the tool should have in the top menu of the visual editor
 * @param menuText The text to be displayed at the button in the top-menu
 * @param dialogText The text to be displayed at the top of the dialog
 * @param askQuery The ask query that needs to be executed in order to get all existing resources
 * @param templateResult A function that transforms the inserted data into a relevant format for inserting the links as a template
 */
function loadEMMDialog(resourceType, toolId, menuText, dialogText, askQuery, templateResult) {
    var dialogueName = "process-" + toolId + " dialogue";

    // create the dialogue
    createDialogue(dialogueName, OO.ui.deferMsg(dialogText), askQuery, resourceType, templateResult);

    // Add a menu-item that opens the dialog
    var tool = function (toolGroup, config) {
        ve.ui.Tool.call(this, toolGroup, config);
        this.setDisabled(false);
        this.allowCollapse = null;
        this.$element.addClass("oo-ui-tool-name-extratemplate");
    };

    //More configuration for the menu-items
    OO.inheritClass(tool, ve.ui.Tool);
    tool.static.name = toolId;
    tool.static.title = OO.ui.deferMsg(menuText);
    tool.static.group = "tools";
    tool.static.icon = "link";
    tool.static.allowCollapse = null;
    tool.static.dialog = dialogueName;
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        ve.ui.actionFactory.create('window', this.toolbar.getSurface()).open(dialogueName, {target: ve.init.target});
        this.setActive(false);
    };
    ve.ui.toolFactory.register(tool);
}

/**
 * This method creates a dialogue that helps the user with inserting several types of links
 * @param dialogueName A name that servers as the unique identifier of the dialogue
 * @param dialogueMessage The text that will be displayed at the top of the dialog
 * @param askQuery The ask query that needs to be executed in order to get all existing resources
 * @param resourceType The type of resource that should be linked to
 * @param templateResult A function that transforms the inserted data into a relevant format for inserting the links as a template
 */
function createDialogue(dialogueName, dialogueMessage, askQuery, resourceType, templateResult) {
    //Constructor for Dialogue
    var Dialogue = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
        this.suggestion = null;
        this.isExistingResource = false;
        this.dialogMode = 0;
        this.upload = new mw.Upload({parameters: {ignorewarnings: true}});
        this.fileName = "";
        this.fieldset = null;
    };
    OO.inheritClass(Dialogue, OO.ui.ProcessDialog);

    //Set properties of the dialogue
    Dialogue.static.name = dialogueName;
    Dialogue.static.title = dialogueMessage;
    Dialogue.static.actions = [
        {
            action: "insert",
            label: OO.ui.deferMsg("visualeditor-emm-insert"),
            flags: ["primary", "constructive"],
            disabled: true
        },
        {action: "cancel", label: OO.ui.deferMsg("visualeditor-emm-cancel"), flags: "safe"}
    ];

    /**
     * Displays an error message for when a specific overloaded function isn't present
     * @param functionName The name of the function that has no overloaded equivalent
     */
    function displayOverloadError(functionName){
        alert(OO.ui.deferMsg("visualeditor-emm-overloaded-function-error")() + functionName);
    }

    //Define basic versions of functions that need to be overloaded.
    //These functions display an error message to indicate that a dialogue-specific overloaded function is missing.
    Dialogue.prototype.displayOverloadedMessage = function(){ displayOverloadError("displayOverloadedMessage")};
    var dialogue = null;

    switch(resourceType){
        case "File":
            dialogue = createNewFileDialogue(Dialogue);
            break;
        case "Internal link":
            dialogue = createNewInternalLinkDialogue(Dialogue);
            break;
        case "External link":
            dialogue = createNewExternalLinkDialogue(Dialogue);

            break;
        default:
            alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
    }
    ve.ui.windowFactory.register(dialogue);

    /**
     * Initializes the dialog.
     * Creates all visual items inside the dialog and adds the necessary logic to it
     */
    Dialogue.prototype.initialize = function () {
        //Put the dialogue in a variable for easier use
        //This is also necessary because in certain cases the meaning of this changes, even though you want to be able
        //to keep accessing the dialogueInstance
        var dialogueInstance = this;

        //  create the fieldset, which is responsible for the layout of the dialogue
        dialogueInstance.fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });

        //Create all the buttons and input fields depending on what kind of dialog we need to create
        dialogueInstance.createDialogueLayout();

        //Add a label that displays the meaning of the * next to form values
        var requiredLabel = new OO.ui.LabelWidget({
            label: OO.ui.deferMsg("visualeditor-emm-required")
        });
        dialogueInstance.fieldset.addItems([new OO.ui.FieldLayout(requiredLabel)]);

        //Add the created items to the dialogue
        Dialogue.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(dialogueInstance.fieldset.$element);
        this.$element
            .addClass("oo-ui-windowManager")
            .toggleClass("oo-ui-windowManager-modal", true);
        this.$body.append(this.content.$element);

        //add validation for the form
        var validator = new Validator(
            dialogueInstance.fieldset,
            null,
            function (object, message) {
                object.$element.addClass("oo-ui-flaggedElement-invalid");
                var el = $("<p>" + message + "</p>").css({
                    "margin": "0px 0px 0px",
                    "color": "red",
                    "position": "absolute"
                });
                object.$element.after(el);
                dialogueInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(true);
                });
            },
            function () {
                dialogueInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(false);
                });
            },
            null,
            function (object) {
                object.$element.removeClass("oo-ui-flaggedElement-invalid");
                object.$element.parent().find("p").remove();
            }
            )
            ;

        //  Add event-handling logic to okButton
        var insertButtonHandler = function () {
            var namedata = presentationTitleField.getValue();
            if (dialogueInstance.suggestion != null) {
                var linkdata = dialogueInstance.suggestion.data.length > 0 ? dialogueInstance.suggestion.data : "";
            }
            else {
                linkdata = "";
            }
            /**
             * Callback function to be called after creating a new resource or editing an existing one
             * It is responsible for inserting a link or cite resourceType in the text of your page that links to the resource
             * @param linkTitle The internal name of the resource that should be linked to
             */
            var insertCallback = function (linkTitle) {
                linkdata = linkTitle;
                var templateToUse = "";
                //Use this in order to insert file links via the cite resourceType
                if (resourceType == "File") {
                    templateToUse = "Cite";
                }
                //In case of an external link we need to check if the user wants to include this link in the
                //references list
                else if (resourceType === "External link") {
                    if (addToResourcesField.isSelected()) {
                        templateToUse = "Cite";
                    }
                    else {
                        templateToUse = resourceType;
                    }
                }
                else {
                    templateToUse = resourceType;
                }
                var mytemplate = [
                        {
                            type: "mwTransclusionInline",
                            attributes: {
                                mw: {
                                    parts: [
                                        {
                                            template: {
                                                target: {
                                                    href: "Template:" + templateToUse,
                                                    wt: templateToUse
                                                },
                                                params: templateResult(namedata, linkdata)
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                    ;

                //insert result in text
                var surfaceModel = ve.init.target.getSurface().getModel();
                var range = surfaceModel.getFragment().selection.range;
                var rangeToRemove = new ve.Range(range.start, range.end);
                var fragment = surfaceModel.getLinearFragment(rangeToRemove);
                fragment.insertContent(mytemplate);
            };

            var currentPageID = mw.config.get('wgPageName').replace(/_/g, " ");
            var query = "";
            switch (resourceType) {
                case "File":
                    //Build the sfautoedit query
                    var filename = "";
                    if (dialogueInstance.isExistingResource) {
                        filename = dialogueInstance.fileName;
                    } else if (fileField.getValue() != null) {
                        filename = fileField.getValue().name;
                    }
                    query += "Resource Description[file name]=" + filename +
                        "&Resource Description[title]=" + titleField.getValue() +
                        "&Resource Description[creator]=" + creatorField.getValue() +
                        "&Resource Description[date]=" + dateField.getValue();
                    if (organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + organizationField.getValue();
                    if (subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + subjectField.getValue();
                    if (!dialogueInstance.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
                    break;
                case "Internal link":
                    if (dialogueInstance.isExistingResource) {
                        insertCallback(linkdata);
                    }
                    else {
                        //Start building the sfautoedit query
                        query += "Light Context[Supercontext]=" + currentPageID +
                            "&Light Context[Heading]=" + pageNameField.getValue();
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
                                semanticCreateWithFormQuery(query, insertCallback, target, "Light Context");
                            }
                            else {
                                alert(OO.ui.deferMsg("visualeditor-emm-topcontext-error")());
                            }
                        });
                    }
                    break;
                case
                "External link":
                    //Build the sfautoedit query
                    query += "Resource Description[hyperlink]=" + linkField.getValue() +
                        "&Resource Description[title]=" + titleField.getValue() +
                        "&Resource Description[creator]=" + creatorField.getValue() +
                        "&Resource Description[date]=" + dateField.getValue();
                    if (organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + organizationField.getValue();
                    if (subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + subjectField.getValue();
                    if (!dialogueInstance.isExistingResource) query += "&Resource Description[created in page]=" + currentPageID;
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
            var target = "";
            if (dialogueInstance.isExistingResource) {
                target = linkdata;
            }

            //Call the sfautoedit query to create or edit an existing resource
            //This also happens when linking to an existing resource and not editing anything
            //For internal links this logic is handled in the switch statement up above
            switch (resourceType) {
                case "File":
                    if (!dialogueInstance.isExistingResource) {
                        dialogueInstance.upload.setFile(fileField.getValue());
                        dialogueInstance.upload.setFilename(fileField.getValue().name);
                        dialogueInstance.upload.upload().fail(function (status, exceptionobject) {
                            switch (status) {
                                case "duplicate":
                                    alert(OO.ui.deferMsg("visualeditor-emm-file-upload-duplicate")());
                                    break;
                                case "exists":
                                    alert(OO.ui.deferMsg("visualeditor-emm-file-upload-exists")());
                                    break;
                                case "verification-error":
                                    alert(OO.ui.deferMsg("visualeditor-emm-file-upload-verification-error")() + "\n" + exceptionobject.error.info);
                                    break;
                                case "file-too-large":
                                    alert(OO.ui.deferMsg("visualeditor-emm-file-upload-file-too-large")());
                                    break;
                                case "empty-file":
                                    alert(OO.ui.deferMsg("visualeditor-emm-file-upload-empty-file")());
                                    break;
                                case "http":
                                    switch (exceptionobject.textStatus) {
                                        case "timeout":
                                            alert(OO.ui.deferMsg("visualeditor-emm-file-upload-timeout")());
                                            break;
                                        case "parsererror":
                                            alert(OO.ui.deferMsg("visualeditor-emm-file-upload-parsererror")());
                                            break;
                                        default:
                                            //uknown eroror
                                            alert("An unkown error of the type " + exceptionobject.exception + " has occured.");
                                    }
                                    break;
                                default:
                                    alert("An unkown error of the type " + status + " has occured.");
                            }
                        }).done(function () {
                            semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
                        });
                    }
                    else {
                        semanticCreateWithFormQuery(query, insertCallback, target, "Resource Light");
                    }
                    break;
                case "Internal link":
                    //Executed by asynchronous function after getting information about the topcontext of the page
                    break;
                case "External link":
                    semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
            cleanUpDialogue();
        };


        // Add event handling logic to cancelButton
        var cancelButtonHandler = function () {
            //Clear the dialog and close it
            cleanUpDialogue();
        };

        Dialogue.prototype.getActionProcess = function (action) {
            if (action === "insert") {
                return new OO.ui.Process(function () {
                    insertButtonHandler();
                });
            }
            else if (action === "cancel") {
                return new OO.ui.Process(function () {
                    cancelButtonHandler();
                });
            }
            else {
                cleanUpDialogue();
            }
            //Use parent handler in case something goes wrong
            return Dialogue.super.prototype.getActionProcess.call(this, action);
        };

        function cleanUpDialogue() {
            dialogueInstance.close();
            //todo check if closed and then clean the fields for a more elegant cleanup?
            validator.disable();
            resetMode();
            clearInputFields(dialogueInstance.fieldset, null, ["OoUiLabelWidget"]);
            validator.enable();
            dialogueInstance.isExistingResource = false;
            dialogueInstance.suggestion = null;
            dialogueInstance.dialogMode = 0;
        }

        //Declare a function to be called after the askQuery has been processed
        //This function initiates the autocomplete library for the resource input field
        //The user will be able to pick a resource from the list of all resources gathered by the askQuery
        var callback = function (queryResults) {
            switch (resourceType) {
                case "File":
                    var fillFields = function (suggestion) {
                        //fixme make this independent of order
                        dialogueInstance.getFieldset().getItems()[3].getField().setValue(suggestion.creator);
                        dialogueInstance.getFieldset().getItems()[4].getField().setValue(fixDate(suggestion.date));
                        dialogueInstance.getFieldset().getItems()[5].getField().setValue(suggestion.organization);
                        dialogueInstance.getFieldset().getItems()[6].getField().setValue(suggestion.subjects);
                        dialogueInstance.fileName = suggestion.data.replace("Bestand:", "").replace("File:", "");
                        validator.validateAll();
                    };
                    initAutoComplete(queryResults, titleField, dialogueInstance, fillFields);
                    break;
                case "Internal link":
                    var fillFields = function (suggestion) {
                        //Nothing to fill, no editable fields beyond presentationtitle and title
                        validator.validateAll();
                    };
                    initAutoComplete(queryResults, pageNameField, dialogueInstance, fillFields);
                    break;
                case "External link":
                    var fillFields = function (suggestion) {
                        //fixme make this independent of order
                        dialogueInstance.getFieldset().getItems()[1].getField().setValue(suggestion.hyperlink);
                        dialogueInstance.getFieldset().getItems()[3].getField().setValue(suggestion.creator);
                        dialogueInstance.getFieldset().getItems()[4].getField().setValue(fixDate(suggestion.date));
                        dialogueInstance.getFieldset().getItems()[5].getField().setValue(suggestion.organization);
                        dialogueInstance.getFieldset().getItems()[6].getField().setValue(suggestion.subjects);
                        validator.validateAll();
                    };
                    initAutoComplete(queryResults, titleField, dialogueInstance, fillFields);
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
        };

        //Execute the askQuery in order to gather all resources
        semanticAskQuery(askQuery, callback, resourceType);

        Dialogue.prototype.getFieldset = function () {
            return dialogueInstance.fieldset;
        };

        //fixme dirty hack
        //todo in plaats van deze hack een eigen event afvuren en opvangen?
        //Selected text is gathered here and put inside the input field
        //Beyong that this is also the place where the size of the dialog is set.
        Dialogue.prototype.setDimensions = function (dim) {
            grabSelectedText(presentationTitleField);
            if (presentationTitleField.value.length > 0)
                validator.validateWidget(presentationTitleField);
            dialogueInstance.fieldset.$element.css({width: this.content.$element.outerWidth(true) - 50});
            //Inline css cause, adding classes doesn't overwrite existing css
            for (var i = 0; i < dialogueInstance.fieldset.getItems().length; i++) {
                dialogueInstance.fieldset.getItems()[i].$element.find(".oo-ui-labelElement-label").not(".oo-ui-selectFileWidget-label").css("margin-right", 0).css("float", "left").css("width", "30%");
                dialogueInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-field").css("width", "70%");
                dialogueInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body").css("width", "100%").css("overflow", "hidden");
            }
            this.$frame.css({
                width: this.content.$element.outerWidth(true) || "",
                height: this.content.$element.outerHeight(true) + 50 || ""
            });
        };
    };
}

/**
 * Clears the input fields of a given fieldset
 * @param fieldset the fieldset whose input fields should be cleared
 */
function clearInputFields(fieldset, exclude, inputTypeExclude) {
    if (exclude != null) {
        for (var i = 0; i < fieldset.getItems().length; i++) {
            var ex = false;
            for (var x = 0; x < exclude.length; x++)
                if (i == exclude[x])
                    ex = true;
            if (!ex) {
                //Make sure the fieldlayout doens't contain just a label field that can't be cleared
                if ($.inArray(fieldset.getItems()[i].getField().constructor.name, inputTypeExclude) == -1) {
                    fieldset.getItems()[i].getField().setValue("");
                }
            }
        }
    }
    else
        for (var i = 0; i < fieldset.getItems().length; i++) {
            //Make sure the fieldlayout doens't contain just a label field that can't be cleared
            if ($.inArray(fieldset.getItems()[i].getField().constructor.name, inputTypeExclude) == -1) {
                fieldset.getItems()[i].getField().setValue("");
            }
        }
}

/*  semanticAskQuery
 *  This method is responsible for executing a call to the mediawiki API
 *  @param query (string) the query that is to be used in the API-call
 *  @param callback (function) a function that will be executed after the api-call is finished
 */
function semanticAskQuery(query, callback, template) {
    var api = new mw.Api();
    api.get({
        action: "ask",
        parameters: "limit:10000",
        query: query
    }).done(function (data) {
        var res = data.query.results;
        var arr = []; //array to store the results
        var prevTitle = "";
        var numTitle = 0;

        for (var prop in res) {
            if (!res.hasOwnProperty(prop))
                continue;
            var pagename = res[prop].fulltext;
            var semantictitle = res[prop].printouts["Semantic title"][0];
            var title = "";
            if (semantictitle)
                title = semantictitle;
            else
                title = pagename;
            if (title == prevTitle) {
                numTitle++;
                title = title + "(" + pagename + ")";
            }
            else {
                prevTitle = title;
                numTitle = 0;
            }
            switch (template) {
                case "File":
                    var creator = res[prop].printouts["Dct:creator"][0];
                    var date = res[prop].printouts["Dct:date"][0];
                    var organization = res[prop].printouts["Organization"][0];
                    var subjects = "";
                    var querySubjects = res[prop].printouts["Dct:subject"];
                    //Gathers all subjects and creates a single string which contains the fulltext name of all the subjects,
                    //seperated by a ,
                    for (var j = 0; j < querySubjects.length; j++) {
                        subjects = subjects + querySubjects[j].fulltext + ", ";
                    }
                    //Remove comma and space at the end of the subject list
                    subjects = subjects.slice(0, -2);
                    //Use value for the title in the associative array to ensure it works with the autocmoplete library
                    arr.push({
                        value: title,
                        data: pagename,
                        creator: creator,
                        date: date,
                        organization: organization,
                        subjects: subjects
                    });
                    break;
                case "Internal link":
                    arr.push({
                        value: title,
                        data: pagename
                    });
                    break;
                case "External link":
                    var hyperlink = res[prop].printouts["Hyperlink"][0];
                    var creator = res[prop].printouts["Dct:creator"][0];
                    var date = res[prop].printouts["Dct:date"][0];
                    var organization = res[prop].printouts["Organization"][0];
                    var subjects = "";
                    var querySubjects = res[prop].printouts["Dct:subject"];
                    //Gathers all subjects and creates a single string which contains the fulltext name of all the subjects,
                    //seperated by a ,
                    for (var j = 0; j < querySubjects.length; j++) {
                        subjects = subjects + querySubjects[j].fulltext + ", ";
                    }
                    //Remove comma and space at the end of the subject list
                    subjects = subjects.slice(0, -2);
                    //Use value for the title in the associative array to ensure it works with the autocmoplete library
                    arr.push({
                        value: title,
                        data: pagename,
                        hyperlink: hyperlink,
                        creator: creator,
                        date: date,
                        organization: organization,
                        subjects: subjects
                    });
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
        }
        arr.sort(function (a, b) {
            if (a.value > b.value) {
                return 1;
            }
            if (a.value < b.value) {
                return -1;
            }
            return 0;
        });

        prevTitle = "";
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            title = item.value;
            if (title == prevTitle) {
                arr[i].value = title + "(" + pagename + ")";
            }
            else {
                prevTitle = title;
            }
        }
        callback(arr);
    });
}

function semanticCreateWithFormQuery(query, callback, target, form) {
    var api = new mw.Api();
    api.get({
        action: "sfautoedit",
        form: form,
        query: query,
        target: target
    }).done(function (data) {
        callback(data.target);
    });
}

/**
 * Grabs the text that is selected (outside the dialogue) and insert its into the resource input inside the dialogue
 * @param inputObject the input field in which the selected text should be inserted
 */
function grabSelectedText(inputObject) {
    var surfaceModel = ve.init.target.getSurface().getModel();
    var selected = "";

    if (surfaceModel.getFragment().selection.range) {
        var i;

        for (i = surfaceModel.getFragment().selection.range.start; i < surfaceModel.getFragment().selection.range.end; i++) {
            var element = surfaceModel.getFragment().document.data.data[i];
            var toAdd = element;
            if (element[0]) {
                toAdd = element[0];//
            }
            selected += toAdd;
        }
    }

    if (selected.length > 0) {
        inputObject.setValue(selected);
    }
}

/**
 * Initalizes the autocomplete library
 * @param data A collection of all the items that can be searched in
 * @param inputObject The object in which the input field exists where the autocomplete function should be enabled
 * @param dialogueInstance The dialogue whose page-id should be edited in order to succesfully insert the link later on
 */
function initAutoComplete(data, inputObject, dialogueInstance, fillFields) {
    var inputField = $(inputObject.$element).find("input");
    $(inputField).autocomplete({
        lookup: data,
        onSelect: function (suggestion) {
            if (dialogueInstance.isExistingResource == false) {
                dialogueInstance.suggestion = suggestion;
                dialogueInstance.isExistingResource = true;
                fillFields(suggestion);
                return;
            }
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}

//fixme this may not be the most efficient way
function toggleAutoComplete(dialogInstance, input) {
    var element = input.$element.find('input');

    if (element.autocomplete() == null)
        return;
    if (dialogInstance.dialogMode == 1)
        element.autocomplete().disable();
    else
        element.autocomplete().enable();
}


function fixDate(date) {
    if (date == null) {
        return "";
    }
    var dateString = date.raw;
    dateString.replace(/-/g, "/").replace(/\./g, "/");
    var replacePattern = /[0-9]+\//;
    //The result of the askQuery always returns an american date starting with *number*/, for example 1/
    //The date is of the fomat n/yyyy/mm/dd
    //Remove the first number and slash from the date and then reverse the date to change it to the european format
    dateString = dateString.replace(replacePattern, "");
    dateString = dateString.split("/");
    dateString = dateString.reverse().join("/");
    return dateString;
}