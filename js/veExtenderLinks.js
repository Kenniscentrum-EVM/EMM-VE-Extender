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

    // Add a button that opens the dialog to te menu
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

    /**
     * Initializes the dialog.
     * Creates all visual items inside the dialog and adds the necessary logic to it
     */
    dialogue.prototype.initialize = function () {
        //put the dialogue in a variable for easier and more clear access
        var dialogueInstance = this;

        //  create the fieldset, which is responsible for the layout of the dialogue
        var fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });

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

                //var presentationTitleField = new OO.ui.TextInputWidget({
                //    placeholder: OO.ui.deferMsg("visualeditor-emm-search")
                //});

                //var contextField = new OO.ui.TextInputWidget({});
                //var contextTypeField = new OO.ui.TextInputWidget({});

                fieldset.addItems([
                    new OO.ui.FieldLayout(pageNameField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(presentationTitleField, {
                        label: OO.ui.deferMsg("visualeditor-emm-page-title"),
                        align: "left"
                    })
                    /*new OO.ui.FieldLayout(presentationTitleField, {
                     label: OO.ui.deferMsg("viualeditor-emm-link-presentationtitle"),
                     align: "left"
                     }),
                     new OO.ui.FieldLayout(contextField, {
                     label: OO.ui.deferMsg("visualeditor-emm-link-")
                     })*/
                ]);
                break;
            case "External link": {
                //Create input fields in case we're dealing with an external link
                var linkField = new OO.ui.TextInputWidget({});
                var titleField = new OO.ui.TextInputWidget({
                    placeholder: OO.ui.deferMsg("visualeditor-emm-search")
                });

                var presentationTitleField = new OO.ui.TextInputWidget({});
                var creatorField = new OO.ui.TextInputWidget({});
                var dateField = new OO.ui.TextInputWidget({});
                var organizationField = new OO.ui.TextInputWidget({});
                var subjectField = new OO.ui.TextInputWidget({});

                fieldset.addItems([
                    new OO.ui.FieldLayout(linkField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link"),
                        align: "left"
                    }),
                    new OO.ui.FieldLayout(titleField, {
                        label: OO.ui.deferMsg("visualeditor-emm-link-title"),
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
                        label: OO.ui.deferMsg("visualeditor-emm-link-subject")
                    })
                ]);
                break;
            }
            default:
                alert("Invalid button was pressed")
        }
        ;

        //  create the buttons
        var okButton = new OO.ui.ButtonWidget({
            label: "OK",
            flags: ["progressive"],
            target: "_blank"
        });

        var cancelButton = new OO.ui.ButtonWidget({
            label: "Cancel"
        });

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

        //  Making the buttons visible at the bottom of the dialogue happens over here
        this.content.$element.append(okButton.$element);
        this.content.$element.append(cancelButton.$element);

        //  Add event-handling logic to okButton
        okButton.$element.attr("id", "okbutton");
        okButton.$element.css("float", "right");
        okButton.onClick = function () {
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
                    alert("Invalid dialog button was pressed");
            }

            var linkdata = dialogueInstance.pageid.length > 0 ? dialogueInstance.pageid : "";
            if (linkdata.length == 0) {
                alert(OO.ui.deferMsg("visualeditor-emm-select-existing-item")() + "!");
                return;
            }

            //Use this because the template to insert file links is for some reason named Cite
            if (template == "File") {
                template = "Cite";
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
                                                href: "Template:" + template,
                                                wt: template
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
            //Use this because the template to insert file links is for some reason named Cite
            if (template == "Cite") {
                template = "File";
            }

            //insert result in text
            var surfaceModel = ve.init.target.getSurface().getModel();
            var range = surfaceModel.getFragment().selection.range;
            var rangeToRemove = new ve.Range(range.start, range.end);
            var fragment = surfaceModel.getLinearFragment(rangeToRemove);
            fragment.insertContent(mytemplate);

            //Clear the input fields and close the dialogue
            clearInputFields(fieldset);
            dialogueInstance.close();
        };


        // Add event handling logic to cancelButton
        cancelButton.$element.attr("id", "cancelbutton");
        cancelButton.$element.css("float", "right");
        cancelButton.onClick = function () {
            //Clear the dialog and close it
            clearInputFields(fieldset);
            dialogueInstance.close();
        };

        //  register the event handlers to the buttons
        okButton.connect(okButton, {
            click: "onClick"
        });
        cancelButton.connect(cancelButton, {
            click: "onClick"
        });


        //Declare a function to be called after the askQuery has been processed
        //This function initiates the autocmplete library for the resource input field
        //The user will be able to pick a resource from the list of all resources gathered by the askQuery
        var callback = function (queryResults) {
            switch (template) {
                case "File":
                    initAutoComplete(queryResults, fileNameField, dialogueInstance, template);
                    break;
                case "Internal link":
                    initAutoComplete(queryResults, pageNameField, dialogueInstance, template);
                    break;
                case "External link":
                    initAutoComplete(queryResults, titleField, dialogueInstance, template);
                    break;
                default:
                    alert("Invalid dialog opened");
            }
        };

        //Execute the askQuery in order to gather all resources
        semanticAskQuery(askQuery, callback, template);

        dialogue.prototype.getFieldset = function () {
            return fieldset;
        };

        //fixme dirty hack
        //todo in plaats van deze hack een eigen event afvuren en opvangen?
        //Selected text is gathered here and put inside the input field
        dialogue.prototype.getBodyHeight = function () {
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
                    alert("Invalid dialog opened");
            }

            return this.content.$element.outerHeight(true) + 50;
        };


    }
    ;
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
        query: query //+ "|?Semantic title|limit=10000"
    }).done(function (data) {
        var res = data.query.results;
        var arr = [];
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
                    alert("Invalid dialog was used");
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
function initAutoComplete(data, inputObject, dialogueInstance, template) {
    var inputField = $(inputObject.$element).find("input");

    $(inputField).autocomplete({
        lookup: data,
        onSelect: function (suggestion) {
            dialogueInstance.pageid = suggestion.data;
            //This part of the code is dependant on the order in which the fields of the dialogs are defined
            //fixme make this independant of order
            switch (template) {
                case "File":
                    break;
                case "Internal link":
                    break;
                case "External link":
                    dialogueInstance.getFieldset().getItems()[0].getField().setValue(suggestion.hyperlink);
                    dialogueInstance.getFieldset().getItems()[3].getField().setValue(suggestion.creator);
                    dialogueInstance.getFieldset().getItems()[4].getField().setValue(suggestion.date.raw);
                    dialogueInstance.getFieldset().getItems()[5].getField().setValue(suggestion.organization);
                    dialogueInstance.getFieldset().getItems()[6].getField().setValue(suggestion.subjects);
                    break;
                default:
                    alert("Invalid dialog was used");
            }
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}