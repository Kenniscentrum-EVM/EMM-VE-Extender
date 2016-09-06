"use strict";

/*  loadEMMDialog
 *  This function is responsible for creating different menu options in the selection menu and their respective dialogues
 *  @param template a string containing the name of the template
 *  @param toolid a string containing the tool id
 *  @param menutext a string that displays the text that is displayed at the top of the dialogue
 *  @param linktotext a string to be displayed as link (?)
 *  @param askQuery a string which directs the askQuery where the desired information is stored
 *  @param templateresult a function that contains what is to be returned by the dialog when the user presses 'ok'
 *  @param myfields an array that contains elements which should be added to the dialog
 */
function loadEMMDialog(template, toolid, menutext, dialogtext, linktotext, askQuery, templateResult, myfields, heightForm) {

    /*  makeInsertTool
    *   This function creates the menu items in the selection menu on the top of the visual editor window
    *   @param buttonMessage the text on the button of the menu item
    *   @param dialogueMessage the text that is displayed in the dialogue
    *   @param collection handle for controling the element (?)
    */
    var makeInsertTool = function (buttonMessage, collection) {
        var dialogueName = collection + " dialogue",
            toolName = collection + " tool";

        createDialogue(dialogueName, OO.ui.deferMsg(dialogtext));

        var tool = function (toolGroup, config) {
            ve.ui.Tool.call(this, toolGroup, config);
            this.setDisabled(false);
            this.allowCollapse = null;
            this.$element.addClass('oo-ui-tool-name-extratemplate');
        };
        OO.inheritClass(tool, ve.ui.Tool);
        tool.static.name = toolid;
        tool.static.title = buttonMessage;
        tool.static.group = 'tools';
        tool.static.icon = 'link';
        tool.static.allowCollapse = null;
        tool.static.dialog = dialogueName;
        tool.static.deactivateOnSelect = true;
        tool.prototype.onSelect = function () {
            this.toolbar.getSurface().execute('window', 'open', dialogueName, null);
            this.setActive(false);
        };
        ve.ui.toolFactory.register(tool);
    };

    makeInsertTool(
        OO.ui.deferMsg(menutext)(),
        "process-" + toolid);

}
/*  createDialogue
 *  This methods creates a dialogue which is a means of interaction with the user
 *  @param dialogueName a string that serves as the handle for the selection menu to access the dialogue
 *  @param dialogueMessage a string that will be displayed at the top of the dialogue
 */
function createDialogue(dialogueName, dialogueMessage){
    var dialogue = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };
    OO.inheritClass(dialogue, OO.ui.ProcessDialog);

    // -- dialogue properties go here -- //

    dialogue.static.name = dialogueName;
    dialogue.static.title = dialogueMessage;

    // -- x -- //

    dialogue.prototype.initialize = function () {

        // -- input widgets go here -- //

        var input1 = new OO.ui.TextInputWidget({
            placeholder: 'A form text field'
        });

        var input2 = new OO.ui.TextInputWidget({
            placeholder: 'A form text field'
        });

        var input3 = new OO.ui.TextInputWidget({
            placeholder: 'A form text field with help'
        });

        var input4 = new OO.ui.CheckboxInputWidget({
            selected: true
        });

        // create the layout
        var fieldset = new OO.ui.FieldsetLayout({
            label: 'FieldsetLayout: Examples of label alignment and help text',
            classes: ["container"]
        });

        fieldset.addItems([
            new OO.ui.FieldLayout(input1, {
                label: 'Left-aligned label, the default',
                align: 'left'
            }),

            new OO.ui.FieldLayout(input2, {
                label: 'Right-aligned label',
                align: 'right'
            }),

            new OO.ui.FieldLayout(input3, {
                label: 'Top-aligned label',
                align: 'top',
                help: 'A bit of help'
            }),

            new OO.ui.FieldLayout(input4, {
                label: 'Inline label',
                align: 'inline'
            })
        ]);

        // -- x -- //


        dialogue.super.prototype.initialize.call(this)
        this.content = new OO.ui.PanelLayout({padded: true, expanded: false});
        this.content.$element.append(fieldset.$element);
        this.$element
            .addClass('oo-ui-windowManager')
            .toggleClass('oo-ui-windowManager-modal', true);



        this.$body.append(this.content.$element);
        
    }
    ve.ui.windowFactory.register(dialogue);
}

function addEMMLinks() {
    var queries = veExtenderQueries();
    loadEMMDialog('Internal link', "linkpage", 'visualeditor-emm-menuinternallinktitle', 'visualeditor-emm-dialoginternallinktitle', 'visualeditor-emm-link-to-page',
        queries.linkpages, function (namedata, linkdata) {
            return {
                link: {wt: linkdata},
                name: {wt: namedata}
            };
        }, [],
        120
    );
    loadEMMDialog('External link', "linkwebsite", 'visualeditor-emm-menuexternallinktitle', 'visualeditor-emm-dialogexternallinktitle', 'visualeditor-emm-link-to-resource',
        queries.linkwebsites, function (namedata, linkdata) {
            return {
                resource: {wt: linkdata},
                name: {wt: namedata}
            };
        }, [],
        120
    );
    loadEMMDialog('Cite', "linkreference", 'visualeditor-emm-menucitetitle', 'visualeditor-emm-dialogcitetitle', 'visualeditor-emm-link-to-resource',
        queries.linkreferences, function (namedata, linkdata, data) {
            var optionaldata = data.optional.wt;
            return {
                resource: {wt: linkdata},
                name: {wt: namedata},
                optional: {wt: optionaldata}
            };
        }, [{
            label: "optional",
            defaultval: "",
            type: "text",
            description: OO.ui.deferMsg('visualeditor-mwtemplate-cite-optional')
        }],
        160
    );

}
