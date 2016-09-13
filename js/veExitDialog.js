/**
 * Creates a custom exit dialog which is shown when the user tries to close the visual editor when the user made unsaved changes.
 */
function createExitDialog()
{
    //Unregister the default exit dialogue which is part of the visualextender library, we don't use it because the chameleon skin breaks it.
    ve.ui.windowFactory.unregister(ve.ui.MWCancelConfirmDialog);

    //Dialog creation happens like usual.
    var cancelDialogue = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };
    OO.inheritClass(cancelDialogue, OO.ui.ProcessDialog);

    //This name is very important because the visualeditor uses it to open the dialog which we are going to overwrite
    cancelDialogue.static.name = 'cancelconfirm';
    cancelDialogue.static.title = OO.ui.deferMsg('visualeditor-emm-canceldialog-title');

    cancelDialogue.prototype.initialize = function () {

        var diaInstance = this;

        var buttonOk = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-emm-confirm'),
            flags: ["destructive"],
            target: "_blank"
        });

        var buttonCancel = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-emm-cancel')
        });

        cancelDialogue.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false,
            text: OO.ui.deferMsg('visualeditor-emm-canceldialog-message')
        });

        this.footer = new OO.ui.PanelLayout({
            padded: true,
            expanded: false,
        });

        this.$body.append(this.content.$element);

        this.content.$element.after(this.footer.$element);


        buttonOk.$element.css("float", "right");
        buttonOk.onClick = function () {
            //Closes the visual editor
            ve.init.target.cancel('navigate-read');
        }

        buttonOk.connect(buttonOk, {
            click: "onClick"
        });


        buttonCancel.onClick = function () {

            diaInstance.close();
            //Small bugfix for the menubutton.
            $(".oo-ui-tool-name-cancelbutton").removeClass("oo-ui-tool-active");
        }

        buttonCancel.connect(buttonCancel, {
            click: "onClick"
        });

        buttonCancel.$element.css("float", "right");
        buttonCancel.$element.css("margin-right", "5px");

        this.footer.$element.append(buttonOk.$element);
        this.footer.$element.append(buttonCancel.$element);


        // body height is slightly increased to make the dialog look a bit prettier

        cancelDialogue.prototype.getBodyHeight = function () {
            return this.content.$element.outerHeight( true ) + this.footer.$element.outerHeight( true ) + 27;
        };

    }

    //register our new dialog in the factory
    ve.ui.windowFactory.register(cancelDialogue);
}
