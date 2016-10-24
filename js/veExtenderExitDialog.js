/**
 * Creates a custom exit dialog which is shown when the user tries to close the visual editor when the user made unsaved changes.
 */
function createExitDialog() {


    var cancelToolFactory = new OO.ui.ToolFactory();
    var cancelToolGroupFactory = new OO.ui.ToolGroupFactory();
    var cancelToolbar = new OO.ui.Toolbar(cancelToolFactory, cancelToolGroupFactory);

    function cancelButton() {
        cancelButton.parent.apply(this, arguments);
    }
    OO.inheritClass(cancelButton, OO.ui.Tool);

    cancelButton.static.name = 'cancelbutton';
    cancelButton.static.title = OO.ui.deferMsg('visualeditor-emm-cancel');
    cancelButton.prototype.onUpdateState = function () {
    };
    cancelButton.prototype.onSelect = function () {

        //Wanneer het document is aangepast...
        if (ve.init.target.getSurface().getModel().hasBeenModified()) {
            //open onze eigen exit dialog
            ve.init.target.getSurface().execute("window", "open", "cancelconfirm", null);
        }
        else {
            ve.init.target.deactivate();
            //ve.init.target.deactivate();
        }
    }

    cancelToolFactory.register(cancelButton);
    cancelToolbar.setup([
        {
            type: 'bar',
            //label: "Annuleren", //todo translations
            include: ['cancelbutton']
        }
    ]);




    $('.oo-ui-toolbar-actions').children().first().after(cancelToolbar.$group);


    //Unregister the default exit dialog which is part of the visualextender library, we don't use it because the chameleon skin breaks it.
    ve.ui.windowFactory.unregister(ve.ui.MWCancelConfirmDialog);

    //Dialog creation happens like usual.
    var cancelDialog = function (surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };
    OO.inheritClass(cancelDialog, OO.ui.ProcessDialog);

    //This name is very important because the visualeditor uses it to open the dialog which we are going to overwrite
    cancelDialog.static.name = 'cancelconfirm';
    cancelDialog.static.title = OO.ui.deferMsg('visualeditor-viewpage-savewarning-title');

    cancelDialog.prototype.initialize = function () {

        var diaInstance = this;

        var buttonOk = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-viewpage-savewarning-discard'),
            flags: ["destructive"],
            target: "_blank"
        });

        buttonOk.$element.find('.oo-ui-labelElement-label').css("width", "100%");

        var buttonCancel = new OO.ui.ButtonWidget({
            label: OO.ui.deferMsg('visualeditor-viewpage-savewarning-keep')
        });

        cancelDialog.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false,
            text: OO.ui.deferMsg('visualeditor-viewpage-savewarning')
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
            //ve.init.target.cancel('navigate-read');
            diaInstance.close();
            ve.init.target.deactivate(true, 'navigate-read');

        }

        buttonOk.connect(buttonOk, {
            click: "onClick"
        });

        buttonCancel.onClick = function () {
            diaInstance.close();
        }

        buttonCancel.connect(buttonCancel, {
            click: "onClick"
        });

        buttonCancel.$element.css("float", "left");
        //buttonCancel.$element.css("margin-right", "5px");

        buttonCancel.$element.find('.oo-ui-labelElement-label').css("width", "100%");

        this.footer.$element.append(buttonOk.$element);
        this.footer.$element.append(buttonCancel.$element);

        // body height is slightly increased to make the dialog look a bit prettier

        cancelDialog.prototype.getBodyHeight = function () {
            //Small bugfix for the menubutton.
            $(".oo-ui-tool-name-cancelbutton").removeClass("oo-ui-tool-active");
            return this.content.$element.outerHeight( true ) + this.footer.$element.outerHeight( true ) + 30;
        };

    }
    //register our new dialog in the factory
    ve.ui.windowFactory.register(cancelDialog);
}
