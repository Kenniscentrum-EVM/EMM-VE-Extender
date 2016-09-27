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
            "visualeditor-emm-dialog-error": "Error: dialog not found.",

            "visualeditor-emm-link": "Link*:",
            "visualeditor-emm-link-title": "Title*:",
            "viualeditor-emm-link-presentationtitle": "Presentation title*:",
            "visualeditor-emm-link-creator": "Creator*:",
            "visualeditor-emm-link-date": "Date*:",
            "visualeditor-emm-link-organization": "Organization:",
            "visualeditor-emm-link-subject": "Subject (SKOS concept):",
            "visualeditor-emm-link-add-resource": "Include in references list:",

            "visualeditor-emm-page": "Page name*:",
            "visualeditor-emm-page-title": "Presentation title*:",

            "visualeditor-emm-file-name": "Filename*",
            "visualeditor-emm-file-presentationtitle": "Presentation title*:",
            "visualeditor-emm-file-optional": "Optional text:",

            "visualeditor-emm-cancel": "Cancel",
            "visualeditor-emm-insert": "Insert",

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
            "visualeditor-mwtemplate-file-optional": "Optional text:"
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
            "visualeditor-emm-dialog-error": "Error: dialoog niet gevonden.",

            "visualeditor-emm-link": "Koppeling*:",
            "visualeditor-emm-link-title": "Titel*:",
            "viualeditor-emm-link-presentationtitle": "Presentatietitel*:",
            "visualeditor-emm-link-creator": "Auteur*:",
            "visualeditor-emm-link-date": "Datum*:",
            "visualeditor-emm-link-organization": "Organisatie:",
            "visualeditor-emm-link-subject": "Onderwerp (SKOS concept):",
            "visualeditor-emm-link-add-resource": "Opnemen in referentielijst:",

            "visualeditor-emm-page": "pagina naam*:",
            "visualeditor-emm-page-title": "Presentatietitel*:",

            "visualeditor-emm-file-name": "Bestandsnaam*",
            "visualeditor-emm-file-presentationtitle": "Presentatietitel*:",
            "visualeditor-emm-file-optional": "Optionele tekst:",

            "visualeditor-emm-cancel": "Annuleer",
            "visualeditor-emm-insert": "Voeg in",

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
            "visualeditor-mwtemplate-file-optional": "Optionele tekst:"
        }
    };
    var userLanguage = mw.config.get("wgUserLanguage");
    mw.messages.set(translations[userLanguage] || translations.en);
    //OO.ui.deferMsg( 'visualeditor-mwsignatureinspector-title' );
}
