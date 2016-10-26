"use strict";


/**
 * This method is executed when the extention is loaded and is responsible for passing the correct information to the loadEMMDialog method
 * At the moment it calls loadEMMDialog to create three dialogs and menu items: File, Internal link and External link
 */
function addEMMLinks() {
    //Create a File-dialog and add a menu item for the dialog
    loadEMMDialog("File", "file", OO.ui.deferMsg("visualeditor-emm-menufiletitle"), OO.ui.deferMsg("visualeditor-emm-dialogfiletitle"),
        function (namedata, linkdata) {
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                },
                dialog: {
                    wt: "process-file-dialog"
                }
            };
        }
    );
    //Create an internal-link-dialog and add a menu item for the dialog
    loadEMMDialog("Internal link", "linkpage", OO.ui.deferMsg("visualeditor-emm-menuinternallinktitle"), OO.ui.deferMsg("visualeditor-emm-dialoginternallinktitle"),
        function (namedata, linkdata) {
            return {
                link: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                },
                dialog: {
                    wt: "process-linkpage-dialog"
                }
            };
        }
    );
    //Create an external-link-dialog and add a menu item for the dialog
    loadEMMDialog("External link", "linkwebsite", OO.ui.deferMsg("visualeditor-emm-menuexternallinktitle"), OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle"),
        function (namedata, linkdata) {
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                },
                dialog: {
                    wt: "process-linkwebsite-dialog"
                }
            };
        }
    );
}

/**
 * This function creates a dialog of the specified type, it also adds a menu button to the insert-menu in order to access the dialog
 * Currently available dialog types are: Internal link, External link and File
 * @param {string} resourceType - The name of the resource type for which we want to create a dialog and manu-items
 * @param {string} toolId - The internal name for the tool/button in the menu-bar
 * @param {string} menuText - The text that should be displayed in the menu-bar
 * @param {string} dialogText - The text that should be displayed at the top of the dialog
 * @param {function} templateResult - A function that transforms the inserted data into the required format for inserting the links as a template
 */
function loadEMMDialog(resourceType, toolId, menuText, dialogText, templateResult) {
    var dialogName = "process-" + toolId + "-dialog";

    // create the dialog of the given type
    createDialog(dialogName, dialogText, resourceType, templateResult);

    // Add a menu-item that opens the dialog
    var tool = function (config) {
        ve.ui.Tool.call(this, config);
        this.setDisabled(false);
        this.allowCollapse = null;
        this.$element.addClass("oo-ui-tool-name-extratemplate");
    };

    //More configuration for the menu-item
    OO.inheritClass(tool, ve.ui.Tool);
    tool.static.name = toolId;
    tool.static.title = menuText;
    tool.static.group = "tools";
    tool.static.icon = "link";
    tool.static.allowCollapse = null;
    tool.static.dialog = dialogName;
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        //Target: ve.init.target is passed in order to enable closing the dialog with the escape key.
        ve.ui.actionFactory.create('window', this.toolbar.getSurface()).open(dialogName, {target: ve.init.target});
        this.setActive(false);
    };
    ve.ui.toolFactory.register(tool);
}

/**
 * This method creates a dialog that helps the user with inserting a specific type of link
 * @param {string} dialogName - The internal name of the dialog
 * @param {string} dialogMessage - The text that will be displayed at the top of the dialog
 * @param {string} resourceType - For what type of resource the dialog should be created, currently available types: File, Internal link, External link
 * @param {function} templateResult - A function that transforms the inserted data into the required format for inserting the links as a template
 */
function createDialog(dialogName, dialogMessage, resourceType, templateResult) {
    /**
     * Constructor for EMMDialog, all relevant fields are initiated, mostly with default null or 0 values.
     * @constructor
     */
    var EMMDialog = function () {
        OO.ui.ProcessDialog.call(this);
        this.suggestion = null;
        this.isExistingResource = false;
        this.dialogMode = 0;
        this.selectionRange = null;
        //Create some common fields, present in all dialogs
        this.presentationTitleField = new OO.ui.TextInputWidget();
        this.titleField = new OO.ui.TextInputWidget();
        //Create an empty fieldset, which is responsible for the layout of the dialog
        this.fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });
        /*Create all the fields for te dialog. This method should be overwritten so all the fields required for a specific
         type of dialog are created.*/
        this.createFields();
        //Add the fields created above to a fieldsetlayout that makes sure the fields and labels are in the correct place.
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
    //Define EMMDialog as a subclass of OO.ui.ProcessDialog
    OO.inheritClass(EMMDialog, OO.ui.ProcessDialog);

    //Set static properties of the dialog
    EMMDialog.static.name = dialogName;
    EMMDialog.static.title = dialogMessage;
    //Define what actions the dialog should have, these are represented as buttons on the top-side of the dialog.
    EMMDialog.static.actions = [
        {
            action: "insert",
            label: OO.ui.deferMsg("visualeditor-emm-insert"),
            flags: ["primary", "constructive"],
            disabled: true
        },
        {action: "cancel", label: OO.ui.deferMsg("visualeditor-emm-cancel"), flags: "safe"}
    ];

    /**
     * Behaviour for the function createDialogLayout which is present in all dialogs.
     * Initiates validation for the common fields present in all dialogs.
     * Needs to be expanded on for behavior for specific dialogs.
     */
    EMMDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];
    };

    /**
     * Returns the query that is used to gather information for all existing resources of a certain type.
     */
    EMMDialog.prototype.getAutocompleteQuery = function () {
        return this.autocompleteQuery;
    };

    /**
     * Returns the query that is used to gather the information about a single resource.
     * @param internalPageName - The internal name of the page where a certain resource is described.
     */
    EMMDialog.prototype.getEditQuery = function (internalPageName) {
        return this.editQuery.replace(/PAGENAMEPARAMETER/g, internalPageName);
    };
    
    EMMDialog.prototype.getReadyProcess = function( config ) {
        var dialogInstance = this;
        //are we editing?
        if(config.source != null)
        {
            config.source = config.source.replace(/ /g,"_");
            var api = new mw.Api();
            var query = this.getEditQuery(config.source);
            api.get({
                action: "ask",
                query: query
            }).done(function (queryData) {
                dialogInstance.validator.disable();
                dialogInstance.validator.disableOnChange();
                var res = queryData.query.results;

                for(var row in res) {
                    var suggestion = dialogInstance.processSingleQueryResult(row, res);
                    this.suggestion = suggestion;
                    dialogInstance.titleField.setValue(suggestion.value);
                    this.isExistingResource = true;
                    dialogInstance.fillFields(suggestion);
                }
                dialogInstance.validator.enable();
                dialogInstance.validator.validateAll();
                dialogInstance.validator.enableOnChange();
            });
        }
        return EMMDialog.super.prototype.getReadyProcess.call(this, config);
    };

    /**
     * Displays an error message for when a specific overloaded function isn't present
     * @param {String} functionName - The name of the function that has no overloaded equivalent
     */
    function displayOverloadError(functionName) {
        alert(OO.ui.deferMsg("visualeditor-emm-overloaded-function-error")() + functionName);
    }

    /*Define basic versions of functions that need to be overloaded.
     These functions display an error message to indicate that a dialog-specific overloaded function is missing.
     These functions are an attempt to emulate the idea of an abstract method as seen in other Object Oriented languages*/

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Creates all the inputfields of a dialog that are not yet created in the constructor of the general EMMDialog.
     */
    EMMDialog.prototype.createFields = function () {
        displayOverloadError("createFields");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Checks the status of the dialog and changes the dialogmode if necessary.
     */
    EMMDialog.prototype.testAndChangeDialogMode = function () {
        displayOverloadError("testAndChangeDialogMode");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Resets the dialogmode and resets the properties of the dialog to the default values.
     */
    EMMDialog.prototype.resetMode = function () {
        displayOverloadError("resetMode");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Builds and executes a query that inserts the new resource or edits an existing one. After the new resource has
     * been added, a link is then inserted into the page by executing the insertCallback.
     * @param {String} currentPageId - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters an whitespace
     * @param {function} insertCallback - The function that should be executed after a new resource has been added or
     * an existing one was changed. This function handles inserting a link into the current page.
     * @param {String} linkdata - In case of an existing resource, linkdata contains the internal name of the resource
     * in order to let the api know what existing resource should be edited. Otherwise linkdata is just an empty string.
     */
    EMMDialog.prototype.buildAndExecuteQuery = function (currentPageId, insertCallback, linkdata) {
        displayOverloadError("buildAndExecuteQuery");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Executes a query by using the mediawiki api. This query either creates a new resource or updates an existing one
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the newly created or edited resource
     * into the current page. This is executed after the api has finished processing the request.
     * @param {String} linkdata - The internal title of a resource. Should be set to the internal title of the resource
     * you want to edit, or be empty when creating a new resource.
     */
    EMMDialog.prototype.executeQuery = function (query, insertCallback, linkdata) {
        displayOverloadError("executeQuery");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Fill the fields of the dialog based on a resource the user has selected from the autocomplete dropdown.
     * @param {Object} suggestion - An object containing properties of the selected resource. This is first created when
     * initiating the autocomplete library.
     */
    EMMDialog.prototype.fillFields = function (suggestion) {
        displayOverloadError("fillFields");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Processes part of the result of a ask query. Expands an existing suggestionobject by adding dialog-specific
     * data from the result to the suggestionObject.
     * @param {Object} singleresult - A single row from the result of the api-call that contains all the information
     * asked for in the query.
     * @param {Object} suggestionObject - A single suggestion that should be expanded. Should already contain
     * dialog-independent data.
     */
    EMMDialog.prototype.processDialogSpecificQueryResult = function (singleresult, suggestionObject) {
        displayOverloadError("processQueryResult");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Depending on the type of resource and choices made by the user in the dialog, links to diffrent types of resources
     * are created in the current page with diffrent types of templates. This function returns what template type to use.
     * @returns {String} - Null in the abastract case, but should be a String containing the type of template to use.
     */
    EMMDialog.prototype.findTemplateToUse = function () {
        displayOverloadError("findTemplateToUse");
        return null;
    };

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
        /*Put the dialog in a variable for easier use
         This is also necessary because in certain cases the meaning of the this keyword changes, even though you want
         to be able to keep accessing the dialogInstance*/
        var dialogInstance = this;

        //Add a label that displays the meaning of the * next to form values
        var requiredLabel = new OO.ui.LabelWidget({
            label: OO.ui.deferMsg("visualeditor-emm-required")
        });
        dialogInstance.fieldset.addItems([new OO.ui.FieldLayout(requiredLabel)]);

        //Add the created fieldset to the dialog
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

        /**
         * Define what should happen when the insert button is clicked.
         */
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
             * It is responsible for inserting a template in the text of your page that links to the resource
             * @param linkTitle The internal name of the resource that should be linked to
             */
            var insertCallback = function (linkTitle) {
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
                                            params: templateResult(namedata, linkTitle)
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

            //Get the name of the current page and replace any underscores with whitespaces to prevent errors later on.
            var currentPageID = mw.config.get('wgPageName').replace(/_/g, " ");
            dialogInstance.buildAndExecuteQuery(currentPageID, insertCallback, linkdata);
            cleanUpDialog();
        };


        /**
         * Define what should happen when the cancel button is clicked.
         */
        var cancelButtonHandler = function () {
            //Clear the dialog and close it
            cleanUpDialog();
        };

        /**
         * Link event handling functions to the buttons of the dialog
         * @param {String} action - The symbolic name of the action for which we need a process
         * @returns {function} - Returns the parent function in case an action that isn't related to an EMMDialog happens
         */
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
            //Needed to enable proper dialog-closing behavior when closing a dialog by pressing the escape-button.
            else {
                cleanUpDialog();
            }
            //Use parent handler in case something goes wrong
            return EMMDialog.super.prototype.getActionProcess.call(this, action);
        };

        /**
         * Empties all the fields of the dialog and resets it to its default state.
         */
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

        /**
         * A function that should be called after the askQuery is done gathering all available resources of a specified type
         * This function initiates the autocomplete library for the resource input field
         * The user will be able to pick a resource from the list of all resources gathered by the askQuery
         * @param {Ojbect[]} queryResults - An array containing all the possible options for the autocomplete dropdown
         */
        var autocompleteCallback = function (queryResults) {
            initAutoComplete(queryResults, dialogInstance);
            toggleAutoComplete(dialogInstance);
        };

        //Execute the askQuery in order to gather all resources
        dialogInstance.semanticAskQuery(dialogInstance.getAutocompleteQuery(), autocompleteCallback, dialogInstance);

        //fixme dirty hack
        //todo in plaats van deze hack een eigen event afvuren en opvangen?
        /**
         * Selected text is gathered here and put inside the input field
         * Beyond that this is also the place where the size of the dialog is set.
         * @param {Object} dim - An object containing css properties for the dimensions of the dialog
         */
        EMMDialog.prototype.setDimensions = function (dim) {
            dialogInstance.selectionRange = grabSelectedText(dialogInstance.presentationTitleField);
            if (dialogInstance.presentationTitleField.value.length > 0) {
                dialogInstance.validator.validateWidget(dialogInstance.presentationTitleField);
            }
            dialogInstance.fieldset.$element.css({width: dim.width - 10});
            this.$frame.css({
                width: dim.width + 250 || "",
                height: this.getContentHeight() + 20 || ""
            });
            dialogInstance.fieldset.$element.css("width", "100%");
            for (var i = 0; i < dialogInstance.fieldset.getItems().length; i++) {
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-labelElement-label").not(".oo-ui-selectFileWidget-label").css("margin-right", 0).css("float", "left").css("width", "30%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-field").css("width", "70%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body").css("width", "100%").css("overflow", "hidden");
            }
        };
    };

    /**
     * Getter function for the fieldset of the dialog
     * @returns {OO.ui.FieldsetLayout} - The fieldset corresponding to this dialog
     */
    EMMDialog.prototype.getFieldset = function () {
        return this.fieldset;
    };

    /*  semanticAskQuery
     *  This method is responsible for executing a call to the mediawiki API of the type "ask"
     *  @param query {String} the query that is to be used in the API-call
     *  @param callback {function} a function that will be executed after the api-call is finished
     */

    EMMDialog.prototype.processSingleQueryResult = function(row, resultSet){
        var suggestionObject = {};
        var singleResultRow = resultSet[row]; //One row from the set of results
        //The data field of this object needs to contain the internal pagename of the resource in order to
        // work correctly with the atuomcplete library. This is the same for value which needs to contain the title
        suggestionObject.data = singleResultRow.fulltext;
        suggestionObject.value = "";
        var semanticTitle = singleResultRow.printouts["Semantic title"][0];
        if (semanticTitle)
            suggestionObject.value = semanticTitle;
        else
            suggestionObject.value = suggestionObject.data;
        this.processDialogSpecificQueryResult(singleResultRow, suggestionObject);
        return suggestionObject;
    };

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
            for (var row in res) {
                if (!res.hasOwnProperty(row))
                    continue;
                arr.push(dialogInstance.processSingleQueryResult(row, res));
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
            callback(arr);
        });
    };
}

/**
 * Clears the input fields of a given fieldset
 * @param {OO.ui.fieldsetLayout} fieldset - The fieldset wose input fields should be emptied
 * @param {int[]} exclude - The indices of the fields in the fieldset that should not be cleared
 * @param {String[]} inputTypeExclude - An array of the names of types of fields that should not be cleared
 */
function clearInputFields(fieldset, exclude, inputTypeExclude) {
    if (exclude != null) {
        for (var i = 0; i < fieldset.getItems().length; i++) {
            var ex = false;
            for (var x = 0; x < exclude.length; x++)
                if (i == exclude[x])
                    ex = true;
            if (!ex) {
                //Make sure the fieldlayout doens't contain a field of the given types
                if ($.inArray(fieldset.getItems()[i].getField().constructor.name, inputTypeExclude) == -1) {
                    fieldset.getItems()[i].getField().setValue("");
                }
            }
        }
    }
    else {
        for (var i = 0; i < fieldset.getItems().length; i++) {
            //Make sure the fieldlayout doens't contain just a field of the given types
            if ($.inArray(fieldset.getItems()[i].getField().constructor.name, inputTypeExclude) == -1) {
                fieldset.getItems()[i].getField().setValue("");
            }
        }
    }
}

/**
 * Creates a new resource or edits an existing one, depending on whether target is empty or not.
 * @param {String} query - The query that should be executed for the given target.
 * @param {function} callback - The callback function that will be executed after creating or updating a resource.
 * @param {String} target - The internal title of the target of the query when editing an existing resource,
 * or empty when creating a new resource.
 * @param {String} form - The name of the semantic form that should be used to create or update the resource.
 */
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
 * Grabs the text that is selected (outside the dialog) and inserts it into the presentationtitle field inside the dialog
 * @param inputObject the field in which the selected text should be inserted
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
                selected += node.element.attributes.mw.parts[0].template.params.name.wt;
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
 * Initializes the autocomplete library
 * @param data A collection fo all the items that can be searched through
 * @param dialogInstance The dialog for which the autocomplete dropdown should be activated
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

            }
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}

/**
 *
 * @param dialogInstance
 * @param input
 */
function toggleAutoComplete(dialogInstance) {
    var element = dialogInstance.titleField.$element.find('input');
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
    if (date == null) {
        return "";
    }
    var d = new Date(date.timestamp * 1000);
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    var yy = d.getFullYear();
    return yy + '-' + mm + '-' + dd; //(US)
}