//some helper functions

function spacesToUnderscore(s) {
    return s.replace(/ /g, "_");
}
/*
 * opens a new window or tab with the address given
 */
function doOpen(address) {
    //despair! where does this come from?
    address = address.replace("%E2%80%8B", "");
    //%E2%80%8B
    //console.log('open address:'+address+':end');
    var win = window.open(address, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Error creating or opening page.');
    }
}
/*
 * returns server-address before index.php
 */
function getStartAddress() {
    var totaladdress = window.location.href;
    return totaladdress.substr(0, totaladdress.indexOf('index.php'));
}

//global variable to keep page properties
var pageProperties = {supercontext: "", topcontext: "", pagename: ""};
function getContextOfCurrentPage() {
    pageProperties.pagename = mw.config.get('wgPageName');
    pageProperties.categories = mw.config.get('wgCategories');//wgCategories

    var api = new mw.Api();
    api.get({
        action: 'ask',
        parameters: 'limit:10000',//check how to increase limit of ask-result; done in LocalSettings.php
        query: '[[' + pageProperties.pagename + ']]|?Supercontext|?Topcontext|limit=10000'//get all pages; include property Semantic title
    }).done(function (data) {
        var res = data.query.results;
        //console.log(res);

        //var contexttype='';
        //for all objects in result
        for (var prop in res) {
            if (!res.hasOwnProperty(prop)) {
                //The current property is not a direct property of p
                continue;
            }
            var supercontext = res[prop].printouts['Supercontext'][0].fulltext;
            pageProperties.supercontext = supercontext;
            var topcontext = res[prop].printouts['Topcontext'][0].fulltext;
            pageProperties.topcontext = topcontext;
            //contexttype=res[prop].printouts['Contexttype'][0].fulltext;
        }

    });
}

/*
 * main function
 */
function addEMMResources() {
    var toolFactory = new OO.ui.ToolFactory();
    var toolGroupFactory = new OO.ui.ToolGroupFactory();
    var toolbar = new OO.ui.Toolbar(toolFactory, toolGroupFactory);
    getContextOfCurrentPage();
    //get context of current page

    // Register tools
    function AddPageTool() {
        AddPageTool.parent.apply(this, arguments);
    }

    OO.inheritClass(AddPageTool, OO.ui.Tool);
    AddPageTool.static.name = 'addpage';
    AddPageTool.static.icon = 'page-existing';
    AddPageTool.static.title = OO.ui.deferMsg('visualeditor-emm-menuaddpagetitle')();
    AddPageTool.prototype.onUpdateState = function () {
    };
    AddPageTool.prototype.onSelect = function () {
        ve.init.target.getSurface().execute('window', 'open', 'addresourcedialog', null);
        //processResult();


        this.setActive(false);
    };
    toolFactory.register(AddPageTool);

    function AddHyperlinkTool() {
        AddHyperlinkTool.parent.apply(this, arguments);
    }

    OO.inheritClass(AddHyperlinkTool, OO.ui.Tool);
    AddHyperlinkTool.static.name = 'addhyperlink';
    AddHyperlinkTool.static.icon = 'link';
    AddHyperlinkTool.static.title = OO.ui.deferMsg('visualeditor-emm-menuaddhyperlinktitle')();
    AddHyperlinkTool.prototype.onUpdateState = function () {
    };
    AddHyperlinkTool.prototype.onSelect = function () {
        ve.init.target.getSurface().execute('window', 'open', 'addhyperlinkdialog', null);//addlocallinkdialog

        /*var address=getStartAddress()+'index.php/Special:FormEdit/Resource_Hyperlink?Resource_Description%5Bcreated+in+page%5D='+pageProperties.pagename;
         doOpen(address);*/
        this.setActive(false);
    };
    toolFactory.register(AddHyperlinkTool);

    function AddInternalDocumentTool() {
        AddInternalDocumentTool.parent.apply(this, arguments);
    }

    OO.inheritClass(AddInternalDocumentTool, OO.ui.Tool);
    AddInternalDocumentTool.static.name = 'addinternaldocument';
    AddInternalDocumentTool.static.icon = 'parameter';
    AddInternalDocumentTool.static.title = OO.ui.deferMsg('visualeditor-emm-menuaddinternaldocumenttitle')();
    AddInternalDocumentTool.prototype.onUpdateState = function () {
    };
    AddInternalDocumentTool.prototype.onSelect = function () {
        //doOpen(getStartAddress()+'index.php/Special:FormEdit/Resource_Light?Resource_Description%5Bcreated+in+page%5D='+pageProperties.pagename);
        ve.init.target.getSurface().execute('window', 'open', 'addlocallinkdialog', null);//
        this.setActive(false);
    };
    toolFactory.register(AddInternalDocumentTool);

    toolbar.setup([
        {
            // 'list' tool groups display both the titles and icons, in a dropdown list.
            type: 'list',
            indicator: 'down',
            label: OO.ui.deferMsg('visualeditor-emm-menuresourcemenuname')(),
            include: ['addpage', 'addhyperlink', 'addinternaldocument']
        }

    ]);

    //console.log(toolbar);
    $('.ve-test-toolbar-insert').after(
        toolbar.$group);

    function processResult() {
        //console.log('save!');
        //check if page has Category Light Context
        var lightContext = false;
        for (var i = 0; i < pageProperties.categories.length; i++) {
            if (pageProperties.categories[i] == 'Light Context')
                lightContext = true;
        }

        if (pageProperties.topcontext.length == 0) {
            alert(OO.ui.deferMsg('topcontexterror')());
        } else {
            var cmd = 'Light_Context?Light_Context%5BSupercontext%5D=' + pageProperties.pagename + '&Light_Context%5BTopcontext%5D=' + pageProperties.topcontext + '&Light_Context%5BContext+type%5D=Situation';
            var uri = getStartAddress() + 'index.php/Special:FormEdit/' + cmd;
            //var uri=getStartAddress()+'index.php/Special:FormEdit/Resource_Light?Resource_Description%5Bcreated+in+page%5D='+pageProperties.pagename;
            doOpen(uri);
        }

    }

    var queries = veExtenderQueries();
    //todo: use queries.resourcepages
    createDialog('addresourcedialog', queries.resourcepages, OO.ui.deferMsg('visualeditor-emm-add-page')(),
        processResult, OO.ui.deferMsg('visualeditor-emm-add-page')(),
        OO.ui.deferMsg('visualeditor-emm-manage-pages')(),
        OO.ui.deferMsg('visualeditor-emm-existing-page')() + ':', function (pageName) {
            //todo: characters are added to end of string; see why this happens!?
            doOpen(encodeURI(getStartAddress() + 'index.php?title=' + spacesToUnderscore(pageName)));

        });
    createDialog('addhyperlinkdialog', queries.resourcehyperlinks, OO.ui.deferMsg('visualeditor-emm-add-hyperlink')(),
        function () {
            doOpen(getStartAddress() + 'index.php/Special:FormEdit/Resource_Hyperlink?Resource_Description%5Bcreated+in+page%5D=' + pageProperties.pagename);
        }
        , OO.ui.deferMsg('visualeditor-emm-add-hyperlink')(),
        OO.ui.deferMsg('visualeditor-emm-manage-hyperlinks')(),
        OO.ui.deferMsg('visualeditor-emm-existing-hyperlink')() + ':', function (pageName) {
            //todo: characters are added to end of string; see why this happens!?
            doOpen(encodeURI(getStartAddress() + 'index.php?title=' + spacesToUnderscore(pageName) + '&action=formedit​'));

        });
    createDialog('addlocallinkdialog', queries.resourceuploadables,
        OO.ui.deferMsg('visualeditor-emm-add-file')(),
        function () {
            //todo: nakijken wat de form is die hier gebruikt moet worden.
            doOpen(getStartAddress() + 'index.php/Special:FormEdit/Resource_Light?Resource_Description%5Bcreated+in+page%5D=' + pageProperties.pagename);
        }
        , OO.ui.deferMsg('visualeditor-emm-add-file')(),
        OO.ui.deferMsg('visualeditor-emm-manage-files')(),
        OO.ui.deferMsg('visualeditor-emm-existing-file')() + ':', function (pageName) {
            //todo: characters are added to end of string; see why this happens!?
            doOpen(encodeURI(getStartAddress() + 'index.php/Special:FormEdit/Resource_Light/' + spacesToUnderscore(pageName)));

        });
}

/*
 * create dialog to add or edit resource
 */
function createDialog(dialogName, askQuery, actionName, processResult, actionTitle, dialogTitle, labelTitle, editPage) {
    /* Static Properties */
//was: ve.ui.EditOrInsertDialog
    var addOrEditResourceDialog = function (manager, config) {
        // Parent constructor
        addOrEditResourceDialog.super.call(this, manager, config);

    };
    /* Inheritance */

    OO.inheritClass(addOrEditResourceDialog, ve.ui.FragmentDialog);

    addOrEditResourceDialog.static.name = dialogName;
    addOrEditResourceDialog.static.title = dialogTitle;
    addOrEditResourceDialog.static.size = 'medium';
    addOrEditResourceDialog.prototype.getBodyHeight = function () {
        var dialogthat = this;

        var api = new mw.Api();
        // Start a "GET" request
        //console.log('Query:'+askQuery+'|?Semantic title');
        api.get({
            action: 'ask',
            parameters: 'limit:10000',//todo:check how to increase limit of ask-result; done in LocalSettings.php
            query: askQuery + '|?Semantic title'//get all pages; include property Semantic title
        }).done(function (data) {
            //console.log(data);
            //parse data
            //first get results within data
            var res = data.query.results;
            //console.log(res);

            //array to store results
            var pagenames = [];
            for (var prop in res) {
                if (!res.hasOwnProperty(prop)) {
                    //The current property is not a direct property of p
                    continue;
                }
                //property defined
                //now get pagename and Semantic title (if available)
                var pagename = res[prop].fulltext;
                var semantictitle = res[prop].printouts['Semantic title'][0];
                var title = '';
                if (semantictitle)
                    title = semantictitle;
                else
                    title = pagename;
                pagenames.push({value: title, data: pagename});
            }


            pagenames.sort(function (a, b) {
                if (a.value > b.value) {
                    return 1;
                }
                if (a.value < b.value) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
            var prevTitle = "";
            for (var i = 0; i < pagenames.length; i++) {
                var item = pagenames[i];
                var title = item.value;
                if (title == prevTitle) {
                    pagenames[i].value = title + "(" + pagename + ")";
                }
                else {
                    prevTitle = title;
                }
            }


            var complete = $("#" + dialogName + "id").find("input");
            //TODO workaround, set width of label to 450px
            $(".oo-ui-fieldLayout-body").width(450);
            //store data in inputfields
            $(complete).autocomplete({
                lookup: pagenames,//pagenames are created at the start of dialog
                onSelect: function (suggestion) {
                    editPage(suggestion.data);
                    //that.pageid=suggestion.data;
                    dialogthat.close();
                    dialogthat.subject.setValue("");
                },
                appendTo: complete.parentElement
            });
        });
        return 120;
    }
    addOrEditResourceDialog.prototype.initialize = function () {
        addOrEditResourceDialog.super.prototype.initialize.call(this);
        this.panel = new OO.ui.PanelLayout({'$': this.$, 'scrollable': true, 'padded': true});
        this.inputsFieldset = new OO.ui.FieldsetLayout({
            '$': this.$
        });
        // input from
        this.subject = new OO.ui.TextInputWidget(
            {'$': this.$, 'multiline': false, 'placeholder': OO.ui.deferMsg('visualeditor-emm-search')()}
        );
        //add DOM-id to parent of input-field
        this.subject.$element.attr("id", dialogName + "id");
        this.subjectField = new OO.ui.FieldLayout(this.subject, {
            '$': this.$,
            'label': labelTitle
        });
        this.subjectField.$element.attr("id", dialogName + "nameid");
        addOrEditResourceDialog.static.actions = [

            {action: 'save', label: actionTitle, flags: [/*'primary',*/ 'progressive']},
            {
                'label': OO.ui.deferMsg('visualeditor-dialog-action-cancel'),
                'flags': 'safe',
                'modes': ['edit', 'insert', 'select']
            }
        ];
        this.inputsFieldset.$element.append(
            this.subjectField.$element
        );
        this.panel.$element.append(this.inputsFieldset.$element);
        this.$body.append(this.panel.$element);

    }
    addOrEditResourceDialog.prototype.getActionProcess = function (action) {
        var that = this;


        switch (action) {
            case "cancel":
                return new OO.ui.Process(function () {
                    that.close();
                });

            case "save":
                return new OO.ui.Process(function () {
                    processResult();
                    that.close();
                });

            default:
                return addOrEditResourceDialog.super.prototype.getActionProcess.call(this, action);
        }
    };
    ve.ui.windowFactory.register(addOrEditResourceDialog);
}


