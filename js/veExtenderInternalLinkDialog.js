/**
 * Created by Carlo Geertse on 12-10-2016.
 */
"use strict";

function createNewInternalLinkDialogue(Dialogue) {
    console.log("Internal Link Dialogue");

    var InternalLinkDialogue = function (surface, config) {
        Dialogue.call(this, surface, config);
        //Create input fields in case we're dealing with an internal link
        this.pageNameField = new OO.ui.TextInputWidget({placeholder: OO.ui.deferMsg("visualeditor-emm-search")});
        this.presentationTitleField = new OO.ui.TextInputWidget({});
    };
    OO.inheritClass(InternalLinkDialogue, Dialogue);

    InternalLinkDialogue.prototype.createDialogueLayout = function () {
        this.pageNameField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];

        //Things to do when the specified field changes
        this.pageNameField.onChangeFunctions = [function () {
            if (dialogueInstance.isExistingResource)
                if (dialogueInstance.suggestion.value != pageNameField.value)
                    dialogueInstance.isExistingResource = false;
        }];

        this.fieldset.addItems([
            new OO.ui.FieldLayout(this.pageNameField, {
                label: OO.ui.deferMsg("visualeditor-emm-page"),
                align: "left"
            }),
            new OO.ui.FieldLayout(this.presentationTitleField, {
                label: OO.ui.deferMsg("visualeditor-emm-page-presentationtitle"),
                align: "left"
            })
        ]);
    };

    InternalLinkDialogue.prototype.resetMode = function () {
        //Empty function, because the internal link dialogue has no modes
    };

    return InternalLinkDialogue;
}