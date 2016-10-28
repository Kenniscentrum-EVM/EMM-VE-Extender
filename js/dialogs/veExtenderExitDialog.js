"use strict";

/**
 * Creates a custom exit dialog which is shown when the user tries to close the visual editor when the user made unsaved changes.
 */
function createExitDialog() {
    var cancelToolFactory = new OO.ui.ToolFactory();
    var cancelToolGroupFactory = new OO.ui.ToolGroupFactory();
    var cancelToolbar = new OO.ui.Toolbar(cancelToolFactory, cancelToolGroupFactory);

    /**
     * Constructor for CancelButton, calls its parent constructor.
     * @constructor
     */
    var CancelButton = function () {
        CancelButton.parent.apply(this, arguments);
    };
    OO.inheritClass(CancelButton, OO.ui.Tool);

    CancelButton.static.name = 'cancelbutton';
    CancelButton.static.title = OO.ui.deferMsg('visualeditor-emm-cancel');

    /**
     * Method that needs to be implemented in order to properly inherit from OO.ui.Tool. CancelButton has no special
     * behaviour, so this function is empty in this case.
     */
    CancelButton.prototype.onUpdateState = function () {
    };

    /**
     * What to do when the cancel button (in the top-menu) is clicked.
     */
    CancelButton.prototype.onSelect = function () {
        //When the document has been modified:
        if (ve.init.target.getSurface().getModel().hasBeenModified()) {
            //open our own exit dialog
            this.setActive(false);
            ve.init.target.getSurface().execute("window", "open", "cancelconfirm", null);
        }
        else {
            //just close the visual editor
            ve.init.target.deactivate();
        }
    };

    //Add the button to the menu
    cancelToolFactory.register(CancelButton);
    cancelToolbar.setup([
        {
            type: 'bar',
            include: ['cancelbutton']
        }
    ]);
    $('.oo-ui-toolbar-actions').children().first().after(cancelToolbar.$group);

    //Unregister the default exit dialog which is part of the visualeditor library, we don't use it because the chameleon skin breaks it.
    ve.ui.windowFactory.unregister(ve.ui.MWCancelConfirmDialog);

    /**
     * Constructor for CancelDialog, calls the constructor of ProcessDialog.
     * @constructor
     */
    var CancelDialog = function () {
        OO.ui.ProcessDialog.call(this);
    };
    OO.inheritClass(CancelDialog, OO.ui.ProcessDialog);

    //This name is very important because the visualeditor uses it to open the dialog which we are going to overwrite
    CancelDialog.static.name = 'cancelconfirm';
    CancelDialog.static.title = OO.ui.deferMsg('visualeditor-viewpage-savewarning-title');

    /**
     * Initializes the CancelDialog. This is called when the dialog is opened for the first time.
     */
    CancelDialog.prototype.initialize = function () {
        var dialogInstance = this;

        //Create an 'ok'-button for the dialog
        var okButton = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-viewpage-savewarning-discard'),
            flags: ["destructive"],
            target: "_blank"
        });
        okButton.$element.find('.oo-ui-labelElement-label').css("width", "100%");

        //Create a 'cancel'-button for the dialog
        var cancelButton = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-viewpage-savewarning-keep')
        });
        CancelDialog.super.prototype.initialize.call(this);

        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false,
            text: OO.ui.deferMsg('visualeditor-viewpage-savewarning')
        });

        this.footer = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });

        this.$body.append(this.content.$element);
        this.content.$element.after(this.footer.$element);

        okButton.$element.css("float", "right");
        /**
         * What should happen when clicking the 'ok' button.
         */
        okButton.onClick = function () {
            //Closes the visual editor
            dialogInstance.close();
            ve.init.target.deactivate(true, 'navigate-read');
        };
        //Connect the onClick function with the button
        okButton.connect(okButton, {
            click: "onClick"
        });

        /**
         * What should happen when clicking the 'cancel' button.
         */
        cancelButton.onClick = function () {
            dialogInstance.close();
        };
        //Connect the onClick function with the button
        cancelButton.connect(cancelButton, {
            click: "onClick"
        });

        cancelButton.$element.css("float", "left");
        cancelButton.$element.find('.oo-ui-labelElement-label').css("width", "100%");

        //Add the buttons to the footer
        this.footer.$element.append(okButton.$element);
        this.footer.$element.append(cancelButton.$element);

        /**
         * Set the width and height of the dialog.
         * @param {Object} dim - The current dimensions of the dialog
         */
        CancelDialog.prototype.setDimensions = function (dim) {
            this.$frame.css({
                height: this.getContentHeight() + 20
            });
        };
    };
    //register our new dialog in the factory
    ve.ui.windowFactory.register(CancelDialog);
}

