function defineTranslations() {
    "use strict";
    var translations = {
        en: {
            "visualeditor-emm-add-file": "Add File",
            "visualeditor-emm-add-hyperlink": "Add Link",
            "visualeditor-emm-add-page": "Add Page",
            "visualeditor-emm-cannot-create-page": "Cannot create the page. Properties needed in page are lacking.",
            "visualeditor-emm-dialogfiletitle": "Insert file",
            "visualeditor-emm-dialogexternallinktitle": "Insert link to website",
            "visualeditor-emm-dialoginternallinktitle": "Insert link to page",
            "visualeditor-emm-existing-file": "Existing file",
            "visualeditor-emm-existing-hyperlink": "Existing link",
            "visualeditor-emm-existing-page": "Existing page",
            "visualeditor-emm-link": "Link*:",
            "visualeditor-emm-link-title": "Title*:",
            "viualeditor-emm-link-presentationtitle": "Presentationtitle*:",
            "visualeditor-emm-link-to-resource": "Link:",
            "visualeditor-emm-manage-files": "Manage Files",
            "visualeditor-emm-manage-hyperlinks": "Manage Links",
            "visualeditor-emm-manage-pages": "Manage Pages",
            "visualeditor-emm-menuaddhyperlinktitle": "Link",
            "visualeditor-emm-menuaddinternaldocumenttitle": "File",
            "visualeditor-emm-menuaddpagetitle": "Page",
            "visualeditor-emm-menufiletitle": "File...",
            "visualeditor-emm-menuexternallinktitle": "Link (website)...",
            "visualeditor-emm-menuinternallinktitle": "Link (page)...",
            "visualeditor-emm-menuresourcemenuname": "Resources",
            "visualeditor-emm-search": "Search",
            "visualeditor-emm-select-existing-item": "Please select an existing item",
            "visualeditor-mwtemplate-file-optional": "Optional text:",
            "visualeditor-emm-file-name": "Filename*"
        },
        nl: {
            "visualeditor-emm-add-file": "Toevoegen bestand",
            "visualeditor-emm-add-hyperlink": "Toevoegen link",
            "visualeditor-emm-add-page": "Toevoegen pagina",
            "visualeditor-emm-cannot-create-page": "Pagina kan niet worden gemaakt. Verplichte eigenschappen in de pagina ontbreken.",
            "visualeditor-emm-dialogfiletitle": "Invoegen bestand",
            "visualeditor-emm-dialogexternallinktitle": "Invoegen koppeling naar website",
            "visualeditor-emm-dialoginternallinktitle": "Invoegen koppeling naar pagina",
            "visualeditor-emm-existing-file": "Bestaand bestand",
            "visualeditor-emm-existing-hyperlink": "Bestaande link",
            "visualeditor-emm-existing-page": "Bestaande pagina",
            "visualeditor-emm-link": "Koppeling*:",
            "visualeditor-emm-link-title": "Titel*:",
            "viualeditor-emm-link-presentationtitle": "Presentatietitel*:",
            "visualeditor-emm-link-to-resource": "Link:",
            "visualeditor-emm-manage-files": "Beheer bestanden",
            "visualeditor-emm-manage-hyperlinks": "Beheer links",
            "visualeditor-emm-manage-pages": "Beheer pagina's",
            "visualeditor-emm-menuaddhyperlinktitle": "Link",
            "visualeditor-emm-menuaddinternaldocumenttitle": "Bestand",
            "visualeditor-emm-menuaddpagetitle": "Pagina",
            "visualeditor-emm-menufiletitle": "Bestand...",
            "visualeditor-emm-menuexternallinktitle": "Koppeling (website)...",
            "visualeditor-emm-menuinternallinktitle": "Koppeling (pagina)...",
            "visualeditor-emm-menuresourcemenuname": "Bronnen",
            "visualeditor-emm-search": "Zoeken",
            "visualeditor-emm-select-existing-item": "Kies een bestaande bron",
            "visualeditor-mwtemplate-file-optional": "Optionele tekst:",
            "visualeditor-emm-file-name": "Bestandsnaam*"
        }
    };
    var userLanguage = mw.config.get("wgUserLanguage");
    mw.messages.set(translations[userLanguage] || translations.en);
    //OO.ui.deferMsg( 'visualeditor-mwsignatureinspector-title' );
}
