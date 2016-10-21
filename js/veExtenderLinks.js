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
    var dialogName = "process-" + toolId + " dialog";

    // create the dialog
    createDialog(dialogName, OO.ui.deferMsg(dialogText), askQuery, resourceType, templateResult);

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
    tool.static.dialog = dialogName;
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        ve.ui.actionFactory.create('window', this.toolbar.getSurface()).open(dialogName, {target: ve.init.target});
        this.setActive(false);
    };
    ve.ui.toolFactory.register(tool);
}

/**
 * This method creates a dialog that helps the user with inserting several types of links
 * @param dialogName A name that servers as the unique identifier of the dialog
 * @param dialogMessage The text that will be displayed at the top of the dialog
 * @param askQuery The ask query that needs to be executed in order to get all existing resources
 * @param resourceType The type of resource that should be linked to
 * @param templateResult A function that transforms the inserted data into a relevant format for inserting the links as a template
 */
function createDialog(dialogName, dialogMessage, askQuery, resourceType, templateResult) {
    //Constructor for EMMDialog
    var EMMDialog = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
        this.suggestion = null;
        this.isExistingResource = false;
        this.dialogMode = 0;
        this.selectionRange = null;
        this.upload = new mw.Upload({parameters: {ignorewarnings: true}});
        //Create some common fields, present in all dialogs
        this.presentationTitleField = new OO.ui.TextInputWidget({});
        //Create the fieldset, which is responsible for the layout of the dialog
        this.titleField = new OO.ui.TextInputWidget();
        this.fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });
        //Create all the fields for te dialog.
        this.createFields();
        //Add the fields created above to a fieldsetlayout that makes sure the fields and labels are in the correct place
        this.createDialogLayout();
        //add validation for the form
        var dialogInstance = this;
        this.validator = new Validator(
            this,
            null,
            function (object, message) {
                object.$element.addClass("oo-ui-flaggedElement-invalid");
                var el = $("<p>" + message + "</p>").css({
                    "margin": "0px 0px 0px",
                    "color": "red",
                    "position": "absolute"
                });
                object.$element.after(el);
                dialogInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(true);
                });
            },
            function () {
                dialogInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(false);
                });
            },
            null,
            function (object) {
                object.$element.removeClass("oo-ui-flaggedElement-invalid");
                object.$element.parent().find("p").remove();
            }
        );
    };
    OO.inheritClass(EMMDialog, OO.ui.ProcessDialog);

    //Set static properties of the dialog
    EMMDialog.static.name = dialogName;
    EMMDialog.static.title = dialogMessage;
    EMMDialog.static.actions = [
        {
            action: "insert",
            label: OO.ui.deferMsg("visualeditor-emm-insert"),
            flags: ["primary", "constructive"],
            disabled: true
        },
        {action: "cancel", label: OO.ui.deferMsg("visualeditor-emm-cancel"), flags: "safe"}
    ];

    EMMDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];
    };

    /**
     * Displays an error message for when a specific overloaded function isn't present
     * @param functionName The name of the function that has no overloaded equivalent
     */
    function displayOverloadError(functionName) {
        alert(OO.ui.deferMsg("visualeditor-emm-overloaded-function-error")() + functionName);
    }

    //Define basic versions of functions that need to be overloaded.
    //These functions display an error message to indicate that a dialog-specific overloaded function is missing.
    EMMDialog.prototype.createFields = function () {
        displayOverloadError("createFields");
    };
    EMMDialog.prototype.testDialogMode = function () {
        displayOverloadError("testDialogMode");
    };
    EMMDialog.prototype.resetMode = function () {
        displayOverloadError("resetMode");
    };
    EMMDialog.prototype.buildAndExecuteQuery = function () {
        displayOverloadError("buildAndExecuteQuery");
    };
    EMMDialog.prototype.executeQuery = function () {
        displayOverloadError("executeQuery");
    };
    EMMDialog.prototype.fillFields = function () {
        displayOverloadError("fillFields");
    };
    EMMDialog.prototype.processDialogSpecificQueryResult = function () {
        displayOverloadError("processQueryResult");
    };
    EMMDialog.prototype.findTemplateToUse = function () {
        displayOverloadError("findTemplateToUse");
    }


    var dialog = null;
    switch (resourceType) {
        case "File":
        case "External link":
            dialog = createLightResourceDialog(EMMDialog, resourceType);
            break;
        case "Internal link":
            dialog = createInternalLinkDialog(EMMDialog);
            break;
        default:
            alert(OO.ui.deferMsg("visualeditor-emm-dialog-error"));
    }
    ve.ui.windowFactory.register(dialog);

    /**
     * Initializes the dialog.
     * Creates all visual items inside the dialog and adds the necessary logic to it
     */
    EMMDialog.prototype.initialize = function () {
        //Put the dialog in a variable for easier use
        //This is also necessary because in certain cases the meaning of this changes, even though you want to be able
        //to keep accessing the dialogInstance
        var dialogInstance = this;

        //Add a label that displays the meaning of the * next to form values
        var requiredLabel = new OO.ui.LabelWidget({
            label: OO.ui.deferMsg("visualeditor-emm-required")
        });
        dialogInstance.fieldset.addItems([new OO.ui.FieldLayout(requiredLabel)]);

        //Add the created items to the dialog
        EMMDialog.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(dialogInstance.fieldset.$element);
        this.$element
            .addClass("oo-ui-windowManager")
            .toggleClass("oo-ui-windowManager-modal", true);
        this.$body.append(this.content.$element);

        //  Add event-handling logic to okButton
        var insertButtonHandler = function () {
            var namedata = dialogInstance.presentationTitleField.getValue();
            if (dialogInstance.suggestion != null) {
                var linkdata = dialogInstance.suggestion.data.length > 0 ? dialogInstance.suggestion.data : "";
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
                var templateToUse = dialogInstance.findTemplateToUse();
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
                ];
                //insert result in text
                var surfaceModel = ve.init.target.getSurface().getModel();
                if (dialogInstance.selectionRange.start < 0 || dialogInstance.selectionRange.start > surfaceModel.getDocument().getLength()) {
                    surfaceModel.getLinearFragment(new ve.Range(0, 0)).insertContent(mytemplate);
                    return;
                }
                if (dialogInstance.selectionRange.end < 0 || dialogInstance.selectionRange.end > surfaceModel.getDocument().getLength()) {
                    surfaceModel.getLinearFragment(new ve.Range(0, 0)).insertContent(mytemplate);
                    return;
                }
                surfaceModel.getLinearFragment(dialogInstance.selectionRange).insertContent(mytemplate);
            };

            var currentPageID = mw.config.get('wgPageName').replace(/_/g, " ");
            dialogInstance.buildAndExecuteQuery(currentPageID, insertCallback, linkdata);
            cleanUpDialog();
        };


        // Add event handling logic to cancelButton
        var cancelButtonHandler = function () {
            //Clear the dialog and close it
            cleanUpDialog();
        };

        EMMDialog.prototype.getActionProcess = function (action) {
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
                cleanUpDialog();
            }
            //Use parent handler in case something goes wrong
            return EMMDialog.super.prototype.getActionProcess.call(this, action);
        };

        function cleanUpDialog() {
            dialogInstance.close();
            //todo check if closed and then clean the fields for a more elegant cleanup?
            dialogInstance.validator.disable();
            clearInputFields(dialogInstance.fieldset, null, ["OoUiLabelWidget"]);
            dialogInstance.resetMode();
            dialogInstance.validator.enable();
            dialogInstance.isExistingResource = false;
            dialogInstance.suggestion = null;
            dialogInstance.dialogMode = 0;
        }

        //Declare a function to be called after the askQuery has been processed
        //This function initiates the autocomplete library for the resource input field
        //The user will be able to pick a resource from the list of all resources gathered by the askQuery
        var autocompleteCallback = function (queryResults) {
            initAutoComplete(queryResults, dialogInstance);
        };

        //Execute the askQuery in order to gather all resources
        dialogInstance.semanticAskQuery(askQuery, autocompleteCallback, dialogInstance);

        //fixme dirty hack
        //todo in plaats van deze hack een eigen event afvuren en opvangen?
        //Selected text is gathered here and put inside the input field
        //Beyong that this is also the place where the size of the dialog is set.
        EMMDialog.prototype.setDimensions = function (dim) {
            dialogInstance.selectionRange = grabSelectedText(dialogInstance.presentationTitleField);
            if (dialogInstance.presentationTitleField.value.length > 0)
                dialogInstance.validator.validateWidget(dialogInstance.presentationTitleField);
            dialogInstance.fieldset.$element.css({width: dim.width - 10});
            for (var i = 0; i < dialogInstance.fieldset.getItems().length; i++) {
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-labelElement-label").not(".oo-ui-selectFileWidget-label").css("margin-right", 0).css("float", "left").css("width", "30%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-field").css("width", "70%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body").css("width", "100%").css("overflow", "hidden");
            }
            this.$frame.css({
                width: dim.width + 50 || "",
                height: this.getContentHeight() + 20 || ""
            });
        };
    };

    EMMDialog.prototype.getFieldset = function () {
        return this.fieldset;
    };

    /*  semanticAskQuery
     *  This method is responsible for executing a call to the mediawiki API
     *  @param query (string) the query that is to be used in the API-call
     *  @param callback (function) a function that will be executed after the api-call is finished
     */
    EMMDialog.prototype.semanticAskQuery = function (query, callback) {
        var dialogInstance = this;
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
                var suggestionObject = {};
                var singleResultRow = res[prop]; //One row from the set of results
                //The data field of this object needs to contain the internal pagename of the resource in order to
                // work correctly with the atuomcplete library. This is the same for value which needs to contain the title
                suggestionObject.data = singleResultRow.fulltext;
                suggestionObject.value = "";
                var semantictitle = singleResultRow.printouts["Semantic title"][0];
                if (semantictitle)
                    suggestionObject.value = semantictitle;
                else
                    suggestionObject.value = suggestionObject.data;
                if (suggestionObject.value == prevTitle) {
                    numTitle++;
                    suggestionObject.value = suggestionObject.value + "(" + suggestionObject.data + ")";
                }
                else {
                    prevTitle = suggestionObject.value;
                    numTitle = 0;
                }
                dialogInstance.processDialogSpecificQueryResult(singleResultRow, suggestionObject);
                arr.push(suggestionObject);
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
                suggestionObject.value = item.value;
                if (suggestionObject.value == prevTitle) {
                    arr[i].value = suggestionObject.value + "(" + suggestionObject.data + ")";
                }
                else {
                    prevTitle = suggestionObject.value;
                }
            }
            callback(arr);
        });
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
    else {
        for (var i = 0; i < fieldset.getItems().length; i++) {
            //Make sure the fieldlayout doens't contain just a label field that can't be cleared
            if ($.inArray(fieldset.getItems()[i].getField().constructor.name, inputTypeExclude) == -1) {
                fieldset.getItems()[i].getField().setValue("");
            }
        }
    }
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
 * Grabs the text that is selected (outside the dialog) and insert its into the resource input inside the dialog
 * @param inputObject the input field in which the selected text should be inserted
 */
function grabSelectedText(inputObject) {
    var surfaceModel = ve.init.target.getSurface().getModel();
    var selected = "";
    if (surfaceModel.getFragment().selection.range) {
        //fixme misschien moet er een apart selectieobject gemaakt worden waarin dit soort dingen netjes afgehandeld worden..
        for (var i = surfaceModel.getFragment().selection.range.start; i < surfaceModel.getFragment().selection.range.end; i++) {
            var node = ve.init.target.getSurface().getModel().getDocument().getDocumentNode().getNodeFromOffset(i);
            if (node.getType() == "mwTransclusionInline") {
                //fixme hier moet nog geverifieerd worden of het om een cite gaat?
                var nodeName = node.element.attributes.mw.parts[0].template.params.name.wt;
                selected += nodeName;
                continue;
            }
            var element = surfaceModel.getFragment().document.data.data[i];
            if (typeof element[0] === 'undefined')
                continue;
            //todo moet dit?
            var toAdd = element;
            if (element[0])
                toAdd = element[0];
            selected += toAdd;
        }
        if (selected.length > 0)
            inputObject.setValue(selected);
        return new ve.Range(surfaceModel.getFragment().selection.range.start, surfaceModel.getFragment().selection.range.end);
    }
    else {
        return new ve.Range(0, 0);
    }
}

/**
 * Initalizes the autocomplete library
 * @param data A collection of all the items that can be searched in
 * @param inputObject The object in which the input field exists where the autocomplete function should be enabled
 * @param dialogInstance The dialog whose page-id should be edited in order to succesfully insert the link later on
 */
function initAutoComplete(data, dialogInstance) {
    var inputField = $(dialogInstance.titleField.$element).find("input");
    $(inputField).autocomplete({
        lookup: data,
        onSelect: function (suggestion) {
            if (!dialogInstance.isExistingResource) {
                dialogInstance.suggestion = suggestion;
                dialogInstance.isExistingResource = true;
                dialogInstance.fillFields(suggestion);
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

/**
 * The datepicker requires a yyyy/mm/dd value when it's being set remotely.
 * @param date
 * @returns {*}
 */
function fixDate(date) {
    if (date == null)
        return "";
    var d = new Date(date.timestamp * 1000);
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    var yy = d.getFullYear();
    return yy + '-' + mm + '-' + dd; //(US)
}