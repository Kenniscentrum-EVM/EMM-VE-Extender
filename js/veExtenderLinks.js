"use strict";

/*  loadEMMDialog
 *  This function is responsible for creating different menu options in the selection menu and their respective dialogues
 *  @param template a string containing the name of the template
 *  @param toolid a string containing the tool id
 *  @param menutext a string that displays the text that is displayed at the top of the dialogue
 *  @param linktotext a string to be displayed as link (?)
 *  @param askQuery a string which directs the askQuery where the desired information is stored
 *  @param templateresult a function that contains what is to be returned by the dialog when the user presses "ok"
 */
function loadEMMDialog(template, toolId, menuText, dialogText, askQuery, templateResult) {

    var dialogueName = "process-" + toolId + " dialogue";
    //toolName = collection + " tool";


    //  create the dialogue
    createDialogue(dialogueName, OO.ui.deferMsg(dialogText), askQuery, template, templateResult);

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
 *  This methods creates a dialogue which is a means of interaction with the user
 *  @param dialogueName a string that serves as the handle for the selection menu to access the dialogue
 *  @param dialogueMessage a string that will be displayed at the top of the dialogue
 */
function createDialogue(dialogueName, dialogueMessage, askQuery, template, templateResult) {
    //todo perhaps this isn't a suitable location for the askQuery
    var dialogue = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };
    OO.inheritClass(dialogue, OO.ui.ProcessDialog);

    // -- dialogue properties go here -- //

    dialogue.static.name = dialogueName;
    dialogue.static.title = dialogueMessage;

    dialogue.prototype.initialize = function () {

        //put the dialogue in a variable so it can be accessed later on
        var dialogueInstance = this;
        dialogueInstance.pageid = "koek"; // wat is deze
        //var pageNames;

        // -- input widgets go here -- //
        // todo zinvolle naamgeving voor de widgets

        var nameControl = new OO.ui.TextInputWidget({
            placeholder: "A form text field"
        });

        var resourceControl = new OO.ui.TextInputWidget({
            placeholder: "A form text field"
        });

        var input3 = new OO.ui.TextInputWidget({
            placeholder: "A form text field with help"
        });

        var input4 = new OO.ui.CheckboxInputWidget({
            selected: true
        });

        //  create the buttons
        var buttonOk = new OO.ui.ButtonWidget({
            label: "OK",
            flags: ["progressive"],
            target: "_blank"
        });

        var buttonCancel = new OO.ui.ButtonWidget({
            label: "Cancel"
        });

        //  create the layout
        var fieldset = new OO.ui.FieldsetLayout({
            label: "Nieuw item toevoegen",
            classes: ["container"]
        });

        fieldset.addItems([
            new OO.ui.FieldLayout(nameControl, {
                label: "Left-aligned label, the default",
                align: "left"
            }),

            new OO.ui.FieldLayout(resourceControl, {
                label: "Right-aligned label",
                align: "right"
            }),

            new OO.ui.FieldLayout(input3, {
                label: "Top-aligned label",
                align: "top",
                help: "Hallo :)"
            }),

            new OO.ui.FieldLayout(input4, {
                label: "Inline label",
                align: "inline"
            }),


        ]);

        //todo DIRTY HACK, PLEASE FIX
        //todo inplaats van deze hack een eigen event afvuren en opvangen?
        dialogue.prototype.getBodyHeight = function () {

            grabSelectedText(dialogueInstance, nameControl);

            return this.content.$element.outerHeight(true) + 50;
        }


        //  button event handling
        buttonOk.$element.attr("id", "buttonok");
        buttonOk.$element.css("float", "right");
        buttonOk.onClick = function () {

            var linkdata = dialogueInstance.pageid.length > 0 ? dialogueInstance.pageid : "";
            var namedata = nameControl.getValue();
            if (linkdata.length == 0) {
                alert(OO.ui.deferMsg('visualeditor-emm-select-existing-item')() + '!');
                return;
            }


            var mytemplate = [
                    {
                        type: 'mwTransclusionInline',
                        attributes: {
                            mw: {
                                parts: [
                                    {
                                        template: {
                                            target: {
                                                href: 'Template:' + template,
                                                wt: template
                                            },
                                            params: templateResult(namedata, linkdata, getContentFromFieldSet(fieldset))
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


            //  Clear the dialog
            nameControl.setValue("");
            resourceControl.setValue("");
            dialogueInstance.close();

        }

        var callback = function (value) {
            initAutoComplete(value, resourceControl, dialogueInstance);
        }

        semanticAskQuery(new mw.Api(), askQuery, callback);

        buttonCancel.$element.attr("id", "buttoncancel");
        buttonCancel.$element.css("float", "right");
        buttonCancel.onClick = function () {

            // -- bahvior after the user presses cancel goes here -- //
            dialogueInstance.close();

        }


        nameControl.change = function (value) {
            console.log(dialogueInstance.pageid);
        }

        nameControl.connect(nameControl, {
            change: "change"
        });


        //  register the event handler (?)
        buttonOk.connect(buttonOk, {
            click: "onClick"
        });

        buttonCancel.connect(buttonCancel, {
            click: "onClick"
        })

        //  more initializing code
        dialogue.super.prototype.initialize.call(this)
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(fieldset.$element);
        this.$element
            .addClass("oo-ui-windowManager")
            .toggleClass("oo-ui-windowManager-modal", true);
        this.$body.append(this.content.$element);

        //  initializing the buttons visible at the bottom of the dialogue happens over here

        this.content.$element.append(buttonOk.$element);
        this.content.$element.append(buttonCancel.$element);


    }
    //  resgisters the dialogue to the window factory, from this point on the dialogue can be accessed calling the window factory

    ve.ui.windowFactory.register(dialogue);
}

function getContentFromFieldSet(fieldset) {

    var result = [];
    for (var i = 0; i < fieldset.getItems().length; i++)
        result.push($(fieldset.getItems()[i].$element).find("input").val());
    return result;
}

/*  addEMMLinks
 *  This method is executed when the extention is loaded and is responsible for passing the correct information to the loadEMMDialog methods
 */
function addEMMLinks() {

    /*
     var windowManager = new ve.ui.WindowManager();
     $("body").append(windowManager.$element);
     */

    //todo javascript objecten van de dialooggegvens maken?

    var queries = veExtenderQueries();

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
    loadEMMDialog("Cite", "linkreference", "visualeditor-emm-menucitetitle", "visualeditor-emm-dialogcitetitle",
        queries.linkreferences,
        function (namedata, linkdata, data) {
            var optionaldata = data.optional.wt;
            return {
                resource: {
                    wt: linkdata
                },
                name: {
                    wt: namedata
                },
                optional: {
                    wt: optionaldata
                }
            };
        }
    );
}

/*  semanticAskQuery
 *  This method is responsible for executing a call to the mediawiki ask query API
 *  @param api (object) the API object to use, this is passed because it may be resused
 *  @param query (string) the query that is to be passed to the ask query API
 *  @param callback (function) a function that contains the result the ask query as parameter
 */
function semanticAskQuery(api, query, callback) {

    api.get({
        action: "ask",
        parameters: "limit:10000",
        query: query + "|?Semantic title|limit=10000"
    }).done(function (data) {

        var res = data.query.results;
        var arr = [];
        var prevTitle = "";
        var numTitle = 0;

        for (var prop in res) {
            if (!res.hasOwnProperty(prop))
                continue;
            var pagename = res[prop].fulltext;
            var semantictitle = res[prop].printouts['Semantic title'][0];
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
            arr.push({value: title, data: pagename});
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

        var prevTitle = "";
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var title = item.value;
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

/*  grabSelectedText
 *
 */
function grabSelectedText(dialogueInstance, inputObject) {
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
    dialogueInstance.pageid = "";
}

function initAutoComplete(data, inputObject, dialogueInstance) {
    var inputField = $(inputObject.$element).find("input");

    $(inputField).autocomplete({
        lookup: data,
        onSelect: function (suggestion) {
            dialogueInstance.pageid = suggestion.data;
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}