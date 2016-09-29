"use strict";


/*  addEMMLinks
 *  This method is executed when the extention is loaded and is responsible for passing the correct information to the loadEMMDialog methods
 */
function addEMMLinks() {
    var queries = veExtenderQueries();

    loadEMMDialog("File", "file", "visualeditor-emm-menufiletitle", "visualeditor-emm-dialogfiletitle",
        queries.linkfiles,
        function (namedata, linkdata, optionalData) {
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                },
                optional: {
                    wt: optionalData
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


/*  loadEMMDialog
 *  This function is responsible for creating different menu options in the selection menu and their respective dialogues
 *  @param template a string containing the name of the template
 *  @param toolid a string containing the tool id
 *  @param menutext a string that displays the text that is displayed in the menu
 *  @param dialogText a string that displays the text that is displayed at the top of the dialogue
 *  @param askQuery a string which contains the query that should be executed in order to gather all the relevant resources
 *  @param templateresult a function that contains what is to be returned by the dialog when the user presses "ok"
 */
function loadEMMDialog(template, toolId, menuText, dialogText, askQuery, templateResult) {
    var dialogueName = "process-" + toolId + " dialogue";

    // create the dialogue
    createDialogue(dialogueName, OO.ui.deferMsg(dialogText), askQuery, template, templateResult);

    // Add a menu-item that opens the dialog
    var tool = function (toolGroup, config) {
        ve.ui.Tool.call(this, toolGroup, config);
        this.setDisabled(false);
        this.allowCollapse = null;
        this.$element.addClass("oo-ui-tool-name-extratemplate");
    };

    OO.inheritClass(tool, ve.ui.Tool);
    tool.static.name = toolId;
    tool.static.title = OO.ui.deferMsg(menuText);
    tool.static.group = "tools";
    tool.static.icon = "link";
    tool.static.allowCollapse = null;
    tool.static.dialog = dialogueName;
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        this.toolbar.getSurface().execute("window", "open", dialogueName, null);
        this.setActive(false);
    };
    ve.ui.toolFactory.register(tool);
}

/*  createDialogue
 *  This methods creates a dialogue that helps the user with inserting several types of links
 *  @param dialogueName a string that serves as the handle for the selection menu to access the dialogue
 *  @param dialogueMessage a string that will be displayed at the top of the dialogue
 *  @param askQuery a string which contains the query that should be executed in order to gather all the relevant resources
 *  @param template a string containing the name of the template
 *  @param templateResult a function that contains what is to be returned by the dialog when the user presses "ok"
 */
function createDialogue(dialogueName, dialogueMessage, askQuery, template, templateResult) {
    var dialogue = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };
    OO.inheritClass(dialogue, OO.ui.ProcessDialog);

    //Set properties of the dialogue
    dialogue.static.name = dialogueName;
    dialogue.static.title = dialogueMessage;
    dialogue.static.actions = [
        {action: "insert", label: OO.ui.deferMsg("visualeditor-emm-insert"), flags: "primary"},
        {action: "cancel", label: OO.ui.deferMsg("visualeditor-emm-cancel"), flags: "safe"}
    ];

    /**
     * Initializes the dialog.
     * Creates all visual items inside the dialog and adds the necessary logic to it
     */
    dialogue.prototype.initialize = function () {
        //put the dialogue in a variable for easier and more clear access
        var dialogueInstance = this;
        //Initialize fields for scoping and later use
        dialogueInstance.queryResult = "";
        dialogueInstance.topContext = "";
        dialogueInstance.pageid = "";

        //  create the fieldset, which is responsible for the layout of the dialogue
        var fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });

        //Create all the buttons and input fields depending on what kind of dialog we need to create
        switch (template) {
            case "File":
                //Create input fields in case we're dealing with a dialogue to add a file
                var fileNameField = new OO.ui.TextInputWidget({
                    placeholder: OO.ui.deferMsg("visualeditor-emm-search")
                });

                var presentationTextField = new OO.ui.TextInputWidget({});

                var optionalField = new OO.ui.TextInputWidget({
                    placeholder: "Optional",
                    id: "optional"
                });

                fieldset.addItems([
                    new OO.ui.FieldLayout(fileNameField, {
                        label: OO.ui.deferMsg("visualeditor-emm-file-name"),
                        align: "left"
                    }),

                    new OO.ui.FieldLayout(presentationTextField, {
                        label: OO.ui.deferMsg("visualeditor-emm-file-presentationtitle"),
                        align: "left"
                    }),

                    new OO.ui.FieldLayout(optionalField, {
                        label: OO.ui.deferMsg("visualeditor-emm-file-optional"),
                        align: "left"
                    })
                ]);
                break;
            case "Internal link":
                //Create input fields in case we're dealing with an internal link
                var pageNameField = new OO.ui.TextInputWidget({
                    placeholder: OO.ui.deferMsg("visualeditor-emm-search")
                });
                var presentationTitleField = new OO.ui.TextInputWidget({});
                var contextField = new OO.ui.TextInputWidget({value: mw.config.get('wgPageName')});
                var contextTypeField = new OO.ui.TextInputWidget({});

                fieldset.addItems([
                    new OO.ui.FieldLayout(pageNameField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(presentationTitleField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page-presentationtitle"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(contextField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page-context"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(contextTypeField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page-contexttype"),
                        align: "left"
                    })
                ]);
                break;
            case "External link": {
                //Create input fields in case we're dealing with an external link
                var titleField = new OO.ui.TextInputWidget({
                    placeholder: OO.ui.deferMsg("visualeditor-emm-search")
                });
                var linkField = new OO.ui.TextInputWidget({});
                var presentationTitleField = new OO.ui.TextInputWidget({});
                var creatorField = new OO.ui.TextInputWidget({});
                var dateField = new OO.ui.TextInputWidget({});
                var organizationField = new OO.ui.TextInputWidget({});
                var subjectField = new OO.ui.TextInputWidget({});
                var addToResourcesField = new OO.ui.CheckboxInputWidget({
                    selected: true
                });

                fieldset.addItems([
                    new OO.ui.FieldLayout(titleField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-title"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(linkField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(presentationTitleField, {
                        label: OO.ui.deferMsg("viualeditor-emm-link-presentationtitle"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(creatorField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-creator"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(dateField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-date"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(organizationField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-organization"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(subjectField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-subject"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(addToResourcesField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-add-resource"),
                        align: "left"
                    })
                ]);
                break;
            }
            default:
                alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
        }

        //Add the created items to the dialogue
        dialogue.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(fieldset.$element);
        this.$element
            .addClass("oo-ui-windowManager")
            .toggleClass("oo-ui-windowManager-modal", true);
        this.$body.append(this.content.$element);

        //  Add event-handling logic to okButton
        var insertButtonHandler = function () {
            switch (template) {
                case "File":
                    var namedata = presentationTextField.getValue();
                    var optionaldata = optionalField.getValue();
                    break;
                case "Internal link":
                    var namedata = presentationTitleField.getValue();
                    break;
                case "External link":
                    var namedata = presentationTitleField.getValue();
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }

            var linkdata = dialogueInstance.pageid.length > 0 ? dialogueInstance.pageid : "";
            var exists = true;
            if (linkdata.length == 0) {
                exists = false;
            }

            var insertCallback = function (linkTitle) {
                linkdata = linkTitle;
                var templateToUse = "";
                //Use this because the template to insert file links is for some reason named Cite
                if (template == "File") {
                    templateToUse = "Cite";
                }
                //In case of an external link we need to check if the user wants to include this link in the
                //references list
                else if (template === "External link") {
                    if (addToResourcesField.isSelected()) {
                        templateToUse = "Cite";
                    }
                    else {
                        templateToUse = template;
                    }
                }
                else {
                    templateToUse = template;
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
                                                params: templateResult(namedata, linkdata, optionaldata)
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

            var currentPageID = mw.config.get('wgPageName');
            var query = "";
            switch (template) {
                case "File":
                    //stuff
                    break;
                case "Internal link":
                    //Build the sfautoedit query
                    var superContext = "";
                    if (contextField.getValue() == "") {
                        superContext = currentPageID;
                    }

                    //Start building the query
                    query += "Light Context[Supercontext]=" + superContext +
                        "&Light Context[Heading]=" + pageNameField.getValue();
                    if (contextTypeField.getValue().length > 0) query += "&Light Context[Context type]=" + contextTypeField.getValue();
                    var target = "";
                    if (exists) {
                        target = linkdata;
                    }

                    //If there's no topcontext, find the topcontext
                    if (dialogueInstance.topContext == null) {
                        var api = new mw.Api();
                        //Store the name of the page to be linked, mostly for asynchronous use
                        api.get({
                            action: 'ask',
                            parameters: 'limit:10000',//check how to increase limit of ask-result; done in LocalSettings.php
                            query: "[[" + superContext + "]]|?Topcontext|limit=10000"//
                        }).done(function (data) {
                            var res = data.query.results;
                            var topContext = res[superContext].printouts["Topcontext"][0].fulltext;
                            query += "&Light Context[Topcontext]=" + topContext;
                            semanticCreateWithFormQuery(query, insertCallback, target, "Light Context");
                        });
                    }
                    else {
                        query += "&Light Context[Topcontext]=" + dialogueInstance.topContext;
                        semanticCreateWithFormQuery(query, insertCallback, target, "Light Context");
                    }
                    break;
                case "External link":
                    //Build the sfautoedit query
                    query += "Resource Description[created in page]=" + currentPageID +
                        "&Resource Description[hyperlink]=" + linkField.getValue() +
                        "&Resource Description[title]=" + titleField.getValue() +
                        "&Resource Description[creator]=" + creatorField.getValue() +
                        "&Resource Description[date]=" + dateField.getValue();
                    if (organizationField.getValue().length > 0) query += "&Resource Description[organization]=" + organizationField.getValue();
                    if (subjectField.getValue().length > 0) query += "&Resource Description[subject]=" + subjectField.getValue();
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
            var target = "";
            if (exists) {
                target = linkdata;
            }
            switch (template) {
                case "File":
                    break;
                case "Internal link":
                    //done after getting the topcontext
                    break;
                case "External link":
                    semanticCreateWithFormQuery(query, insertCallback, target, "Resource Hyperlink");
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }

            //Clear the input fields and close the dialogue
            clearInputFields(fieldset);
            dialogueInstance.pageid = "";
            dialogueInstance.close();
        };


        // Add event handling logic to cancelButton
        var cancelButtonHandler = function () {
            //Clear the dialog and close it
            clearInputFields(fieldset);
            dialogueInstance.close();
        };

        dialogue.prototype.getActionProcess = function (action) {
            if (action === "insert") {
                return new OO.ui.Process(function () {
                    insertButtonHandler();
                });
            }
            if (action === "cancel") {
                return new OO.ui.Process(function () {
                    cancelButtonHandler();
                });
            }
            //Use parent handler in case something goes wrong
            return MyDialog.super.prototype.getActionProcess.call(this, action);
        };

        //Declare a function to be called after the askQuery has been processed
        //This function initiates the autocmplete library for the resource input field
        //The user will be able to pick a resource from the list of all resources gathered by the askQuery
        var callback = function (queryResults) {
            switch (template) {
                case "File":
                    var fillFields = function () {
                    };
                    initAutoComplete(queryResults, fileNameField, dialogueInstance, fillFields);
                    break;
                case "Internal link":
                    var fillFields = function (suggestion) {
                        dialogueInstance.getFieldset().getItems()[2].getField().setValue(suggestion.supercontext);
                        dialogueInstance.getFieldset().getItems()[3].getField().setValue(suggestion.contexttype);
                        dialogueInstance.setTopContext(suggestion.topcontext);
                    };
                    initAutoComplete(queryResults, pageNameField, dialogueInstance, fillFields);
                    break;
                case "External link":
                    var fillFields = function (suggestion) {
                        //fixme make this independent of order
                        dialogueInstance.getFieldset().getItems()[0].getField().setValue(suggestion.hyperlink);
                        dialogueInstance.getFieldset().getItems()[3].getField().setValue(suggestion.creator);
                        dialogueInstance.getFieldset().getItems()[4].getField().setValue(fixDate(suggestion.date.raw));
                        dialogueInstance.getFieldset().getItems()[5].getField().setValue(suggestion.organization);
                        dialogueInstance.getFieldset().getItems()[6].getField().setValue(suggestion.subjects);
                    };
                    initAutoComplete(queryResults, titleField, dialogueInstance, fillFields);
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
            dialogueInstance.queryResult = queryResults;
        };

        //Execute the askQuery in order to gather all resources
        semanticAskQuery(askQuery, callback, template);

        dialogue.prototype.getFieldset = function () {
            return fieldset;
        };

        dialogue.prototype.setTopContext = function (context) {
            dialogueInstance.topContext = context;
        };

        //fixme dirty hack
        //todo in plaats van deze hack een eigen event afvuren en opvangen?
        //Selected text is gathered here and put inside the input field
        //Beyong that this is also the place where the size of the dialog is set.
        dialogue.prototype.setDimensions = function (dim) {
            switch (template) {
                case "File":
                    grabSelectedText(presentationTextField);
                    break;
                case "Internal link":
                    grabSelectedText(presentationTitleField);
                    break;
                case "External link":
                    grabSelectedText(presentationTitleField);
                    break;
                default:
                    alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
            }
            fieldset.$element.css({width: this.content.$element.outerWidth(true) - 50});
            //Inline css cause, adding classes doesn't overwrite existing css
            for (var i = 0; i < fieldset.getItems().length; i++) {
                fieldset.getItems()[i].$element.find(".oo-ui-labelElement-label").css("margin-right", 0).css("float", "left").css("width", "30%");
                fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-field").css("width", "70%");
                fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body").css("width", "100%").css("overflow", "hidden");
            }
            this.$frame.css({
                width: this.content.$element.outerWidth(true) || "",
                height: this.content.$element.outerHeight(true) + 50 || ""
            });
        };
    }
    ;

    //dialogue.$frame.css({width: 800 || ''});
    //  registers the dialogue to the window factory, from this point on the dialogue can be accessed calling the window factory
    ve.ui.windowFactory.register(dialogue);
}

/**
 * Clears the input fields of a given fieldset
 * @param fieldset the fieldset whose input fields should be cleared
 */
function clearInputFields(fieldset) {
    for (var i = 0; i < fieldset.getItems().length; i++) {
        (fieldset.getItems()[i]).getField().setValue("");
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
                    arr.push({
                        value: title,
                        data: pagename
                    });
                    break;
                case "Internal link":
                    var supercontext = "";
                    if (res[prop].printouts["Supercontext"].length > 0) {
                        supercontext = res[prop].printouts["Supercontext"][0].fulltext;
                    }
                    var topcontext = res[prop].printouts["Topcontext"][0];
                    var contexttype = res[prop].printouts["Context type"][0];
                    arr.push({
                        value: title,
                        data: pagename,
                        supercontext: supercontext,
                        topcontext: topcontext,
                        contexttype: contexttype
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
        var inputField = $(inputObject.$element).find("input");
        inputField.val(selected);
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
            dialogueInstance.pageid = suggestion.data;
            //This part of the code depends on the order in which the fields of the dialogs are defined
            fillFields(suggestion);
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}

function fixDate(dateString) {
    var replacePattern = /[0-9]+\//;
    //The result of the askQuery always returns an american date starting with *number*/, for example 1/
    //The date is of the fomat n/yyyy/mm/dd
    //Remove the first number and slash from the date and then reverse the date to change it to the european format
    dateString = dateString.replace(replacePattern, "");
    dateString = dateString.split("/");
    dateString = dateString.reverse().join("/");
    return dateString;
}