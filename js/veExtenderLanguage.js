/**
 * Defines the translations for all text messages found in the EMMVEExtender.
 * Currently available languages: English(en) and Dutch(nl)
 */
function defineTranslations() {
    "use strict";
    var translations = {
        en: {
            "visualeditor-emm-add-file": "Add File",
            "visualeditor-emm-add-hyperlink": "Add Link",
            "visualeditor-emm-add-page": "Add Page",
            "visualeditor-emm-cannot-create-page": "Cannot create the page. Properties needed in page are lacking.",
            "visualeditor-emm-dialogfiletitle": "Insert link to file",
            "visualeditor-emm-dialogexternallinktitle": "Insert link to website",
            "visualeditor-emm-dialoginternallinktitle": "Insert link to page",
            "visualeditor-emm-dialogbibliographicreferencetitle": "Insert bibliographic reference",
            "visualeditor-emm-existing-file": "Existing file",
            "visualeditor-emm-existing-hyperlink": "Existing link",
            "visualeditor-emm-existing-page": "Existing page",
            "visualeditor-emm-dialog-error": "Error: dialog not found.",
            "visualeditor-emm-overloaded-function-error": "Error: The following overloaded function could not be found: ",

            "visualeditor-emm-link": "Link*:",
            "visualeditor-emm-link-title": "Resource title*:",
            "visualeditor-emm-link-presentationtitle": "Page-text*:",
            "visualeditor-emm-link-creator": "Author*:",
            "visualeditor-emm-link-date": "Date*:",
            "visualeditor-emm-link-organization": "Organization:",
            "visualeditor-emm-link-subject": "Keywords:",
            "visualeditor-emm-link-add-resource": "Include in references list:",

            "visualeditor-emm-page": "Resource title*:",
            "visualeditor-emm-page-presentationtitle": "Page-text*:",
            "visualeditor-emm-page-context": "Context:",
            "visualeditor-emm-page-contexttype": "Context type:",

            "visualeditor-emm-file-title": "Resource title*:",
            "visualeditor-emm-file-filename": "File*:",
            "visualeditor-emm-file-presentationtitle": "Page-text*:",
            "visualeditor-emm-file-creator": "Author*:",
            "visualeditor-emm-file-date": "Date*:",
            "visualeditor-emm-file-organization": "Organization:",
            "visualeditor-emm-file-subject": "Keywords:",
            "visualeditor-emm-file-changing-empty-file" : "An error occured: the file you are attempting to change does not exist",

            "visualeditor-emm-file-upload-timeout": "Your file upload request timed out. Please make sure the file isn't too large, check your connection and try again.",
            "visualeditor-emm-file-upload-duplicate": "Another file with the same content already exists",
            "visualeditor-emm-file-upload-exists": "Another file with the same name already exists",
            "visualeditor-emm-file-upload-verification-error": "A verification error occurred, the system returned the following message:",
            "visualeditor-emm-file-upload-parsererror": "The file extension is invalid, only the following extensions are allowed: \n" +
            "svg, png, gif, jpg, jpeg, ppt, pptx, pdf, mp3, mp4, xls, xlsx, doc, docx, odt, odc, odp, odg, txt",
            "visualeditor-emm-file-upload-file-too-large": "The file is too large. The maximum size of a file is 64MB",
            "visualeditor-emm-file-upload-empty-file": "The file that was uploaded is empty",
            "visualeditor-emm-file-upload-filetype-banned": "The file extension is invalid, only the following extensions are allowed: \n" +
            "svg, png, gif, jpg, jpeg, ppt, pptx, pdf, mp3, mp4, xls, xlsx, doc, docx, odt, odc, odp, odg, txt",
            "visualeditor-emm-file-upload-mustbeloggedin": "You need to be logged in to perform this action. Please make sure you are logged in and try again",

            "visualeditor-emm-bibref-bibtex-type" : "Document type*:",
            "visualeditor-emm-bibref-bibtex-type-select" : "Select a document type",
            "visualeditor-emm-bibref-titlefield-placeholder-def": "Search for a bibliographic reference",

            "visualeditor-emm-bibref-bibtex-type-article" : "Article",
            "visualeditor-emm-bibref-bibtex-type-book": "Book",
            "visualeditor-emm-bibref-bibtex-type-booklet": "Booklet (no publisher)",
            "visualeditor-emm-bibref-bibtex-type-incollection": "Part of a Book",
            "visualeditor-emm-bibref-bibtex-type-inproceedings": "Article from conference proceedings",
            "visualeditor-emm-bibref-bibtex-type-manual": "Manual",
            "visualeditor-emm-bibref-bibtex-type-mastersthesis": "Master thesis",
            "visualeditor-emm-bibref-bibtex-type-phdthesis": "PhD thesis",
            "visualeditor-emm-bibref-bibtex-type-proceedings": "Conference proceedings",
            "visualeditor-emm-bibref-bibtex-type-techreport": "Technical report",
            "visualeditor-emm-bibref-bibtex-type-unpublished": "Unpublished Resource",

            "visualeditor-emm-bibref-title-insert": "Insert existing bibliographic reference",
            "visualeditor-emm-bibref-title-insert-edit": "Insert and edit existing bibliographic reference",
            "visualeditor-emm-bibref-title-new": "Create new bibliographic reference",
            "visualeditor-emm-bibref-title-edit": "Edit existing bibliographic reference",


            "visualeditor-emm-cancel": "Cancel",
            "visualeditor-emm-insert": "Insert",

            "visualeditor-emm-link-to-resource": "Link:",
            "visualeditor-emm-manage-files": "Manage Files",
            "visualeditor-emm-manage-hyperlinks": "Manage Links",
            "visualeditor-emm-manage-pages": "Manage Pages",
            "visualeditor-emm-menuaddhyperlinktitle": "Link",
            "visualeditor-emm-menuaddinternaldocumenttitle": "File",
            "visualeditor-emm-menuaddpagetitle": "Page",
            "visualeditor-emm-topcontext-error": "The topcontext of this page could not be found. Please make sure the current page has a context or try again on another page",

            "visualeditor-emm-menufiletitle": "Link (file)...",
            "visualeditor-emm-menuexternallinktitle": "Link (website)...",
            "visualeditor-emm-menuinternallinktitle": "Link (page)...",
            "visualeditor-emm-menubibliographicreferencetitle": "Bibliographic reference...",
            "visualeditor-emm-menuresourcemenuname": "Resources",
            "visualeditor-emm-search": "Search",
            "visualeditor-emm-select-existing-item": "Please select an existing item",
            "visualeditor-mwtemplate-file-optional": "Optional text:",

            "visualeditor-emm-validation-required": "This field cannot be empty.",
            "visualeditor-emm-validation-website": "This field must contain a valid URL.",
            "visualeditor-emm-validation-special": "This field cannot contain special characters.",
            "visualeditor-emm-validation-date": "This field must contain a valid date.",

            "visualeditor-emm-linkdialog-title-npage": "Insert new link",
            "visualeditor-emm-linkdialog-title-edit": "Edit link to website",
            "visualeditor-emm-inlidialog-title-npage": "Insert new link to page",
            "visualeditor-emm-inlidialog-title-edit": "Edit link to page",
            "visualeditor-emm-inlidialog-title-insert-edit": "Insert & edit link to page",
            "visualeditor-emm-linkdialog-titlefield-placeholder-def": "Search for link",
            "visualeditor-emm-linkdialog-titlefield-placeholder-new": "Title new link",
            "visualeditor-emm-filedialog-title-npage": "Insert new link to file",
            "visualeditor-emm-filedialog-title-edit": "Edit link to file",
            "visualeditor-emm-filedialog-titlefield-placeholder-def": "Search for link to file",
            "visualeditor-emm-filedialog-titlefield-placeholder-new": "Title of new link to file",
            "visualeditor-emm-filedialog-uploadnf": "Upload new file version of file.",
            "visualeditor-emm-required": "*Required",

            "visualeditor-emm-notification-template-title": "Illegal operation",
            "visualeditor-emm-notification-template-body": "You are attempting to remove a system template, this is not allowed.",
            "visualeditor-emm-notification-template-copy": "You are attempting to copy a system template, this is not allowed.",
            "visualeditor-emm-notification-template-edit": "You are attempting to edit a system template, this is not allowed.",

            "visualeditor-emm-notification-err-invalidlink-body": "Could not retrieve page information for the selected reference, was the page deleted?",
            "visualeditor-emm-notification-err-invalidlink-title": "Invalid reference",

            "visualeditor-emm-suggestion-err-no-supercontext": "Missing supercontext"
        },
        nl: {
            "visualeditor-emm-add-file": "Toevoegen bestands",
            "visualeditor-emm-add-hyperlink": "Toevoegen link",
            "visualeditor-emm-add-page": "Toevoegen pagina",
            "visualeditor-emm-cannot-create-page": "Pagina kan niet worden gemaakt. Verplichte eigenschappen in de pagina ontbreken.",
            "visualeditor-emm-dialogfiletitle": "Invoegen koppeling naar bestand",
            "visualeditor-emm-dialogexternallinktitle": "Invoegen koppeling naar website",
            "visualeditor-emm-dialoginternallinktitle": "Invoegen koppeling naar pagina",
            "visualeditor-emm-dialogbibliographicreferencetitle": "Invoegen referentie naar naslagwerk",
            "visualeditor-emm-existing-file": "Bestaand bestand",
            "visualeditor-emm-existing-hyperlink": "Bestaande link",
            "visualeditor-emm-existing-page": "Bestaande pagina",
            "visualeditor-emm-dialog-error": "Error: dialoog niet gevonden.",
            "visualeditor-emm-overloaded-function-error": "Fout: De volgende overloaded functie kon niet gevonden worden: ",

            "visualeditor-emm-link": "Koppeling*:",
            "visualeditor-emm-link-title": "Brontitel*:",
            "visualeditor-emm-link-presentationtitle": "Paginatekst*:",
            "visualeditor-emm-link-creator": "Auteur*:",
            "visualeditor-emm-link-date": "Datum*:",
            "visualeditor-emm-link-organization": "Organisatie:",
            "visualeditor-emm-link-subject": "Trefwoorden:",
            "visualeditor-emm-link-add-resource": "Opnemen in referentielijst:",

            "visualeditor-emm-page": "Brontitel*:",
            "visualeditor-emm-page-presentationtitle": "Paginatekst*:",
            "visualeditor-emm-page-context": "Context:",
            "visualeditor-emm-page-contexttype": "Context type:",

            "visualeditor-emm-file-title": "Brontitel*:",
            "visualeditor-emm-file-filename": "Bestand*:",
            "visualeditor-emm-file-presentationtitle": "Paginatekst*:",
            "visualeditor-emm-file-creator": "Auteur*:",
            "visualeditor-emm-file-date": "Datum*:",
            "visualeditor-emm-file-organization": "Organisatie:",
            "visualeditor-emm-file-subject": "Trefwoorden:",
            "visualeditor-emm-file-changing-empty-file" : "Er is een fout opgetreden: Het bestand dat u probeert aan te passen bestaat al.",

            "visualeditor-emm-file-upload-timeout": "Het verzoek om een bestand te uploaden is verlopen. Controleer of het bestand niet te groot is, controleer de verbinding en probeer opnieuw.",
            "visualeditor-emm-file-upload-duplicate": "Er bestaat al een bestand met dezelfde inhoud",
            "visualeditor-emm-file-upload-exists": "Er bestaat al een bestand met deze naam",
            "visualeditor-emm-file-upload-verification-error": "Er is een verificatiefout opgetreden, het systeem gaf de volgende foutmelding:",
            "visualeditor-emm-file-upload-parsererror": "Het bestandstype is ongeldig, enkel de volgende bestandstypen zijn toegestaan: \n" +
            "svg, png, gif, jpg, jpeg, ppt, pptx, pdf, mp3, mp4, xls, xlsx, doc, docx, odt, odc, odp, odg, txt",
            "visualeditor-emm-file-upload-file-too-large": "Het bestand is te groot. De maximale grootte van een bestand is 64MB",
            "visualeditor-emm-file-upload-empty-file": "Het opgegeven bestand is leeg.",
            "visualeditor-emm-file-upload-filetype-banned": "Het bestandstype is ongeldig, enkel de volgende bestandstypen zijn toegestaan: \n" +
            "svg, png, gif, jpg, jpeg, ppt, pptx, pdf, mp3, mp4, xls, xlsx, doc, docx, odt, odc, odp, odg, txt",
            "visualeditor-emm-file-upload-mustbeloggedin": "U moet ingelogd zijn om deze actie uit te voeren. Controleer of u bent ingelogd en probeer het opnieuw.",

            "visualeditor-emm-bibref-bibtex-type": "Documentsoort*:",
            "visualeditor-emm-bibref-bibtex-type-select": "Selecteer een documentsoort",
            "visualeditor-emm-bibref-titlefield-placeholder-def": "Zoeken naar een naslagwerk",

            "visualeditor-emm-bibref-bibtex-type-article": "Artikel",
            "visualeditor-emm-bibref-bibtex-type-book": "Boek",
            "visualeditor-emm-bibref-bibtex-type-booklet": "Boekje (zonder uitgever)",
            "visualeditor-emm-bibref-bibtex-type-incollection": "Deel van een boek",
            "visualeditor-emm-bibref-bibtex-type-inproceedings": "Artikel uit een conferentiebundel",
            "visualeditor-emm-bibref-bibtex-type-manual": "Handleiding",
            "visualeditor-emm-bibref-bibtex-type-mastersthesis": "Masterscriptie",
            "visualeditor-emm-bibref-bibtex-type-phdthesis": "Proefschrift",
            "visualeditor-emm-bibref-bibtex-type-proceedings": "Conferentiebundel",
            "visualeditor-emm-bibref-bibtex-type-techreport": "Onderzoeksrapport",
            "visualeditor-emm-bibref-bibtex-type-unpublished": "Onuitgegeven stuk",

            "visualeditor-emm-bibref-title-insert": "Voeg referentie naar bestaand naslagwerk in",
            "visualeditor-emm-bibref-title-insert-edit": "Bewerk en voeg referentie naar bestaand naslagwerk in",
            "visualeditor-emm-bibref-title-new": "Maak nieuw naslagwerk aan",
            "visualeditor-emm-bibref-title-edit": "Bewerk bestaande referentie naar naslagwerk",

            "visualeditor-emm-cancel": "Annuleer",
            "visualeditor-emm-insert": "Voeg in",

            "visualeditor-emm-link-to-resource": "Link:",
            "visualeditor-emm-manage-files": "Beheer bestanden",
            "visualeditor-emm-manage-hyperlinks": "Beheer links",
            "visualeditor-emm-manage-pages": "Beheer pagina's",
            "visualeditor-emm-menuaddhyperlinktitle": "Link",
            "visualeditor-emm-menuaddinternaldocumenttitle": "Bestand",
            "visualeditor-emm-menuaddpagetitle": "Pagina",
            "visualeditor-emm-topcontext-error": "Er is geen topcontext gevonden voor deze pagina. Zorg er voor dat de huidige pagina een context bevat of probeer het opnieuw op een andere pagina",

            "visualeditor-emm-menufiletitle": "Koppeling (bestand)...",
            "visualeditor-emm-menuexternallinktitle": "Koppeling (website)...",
            "visualeditor-emm-menuinternallinktitle": "Koppeling (pagina)...",
            "visualeditor-emm-menubibliographicreferencetitle": "Referentie (naslagwerk)...",
            "visualeditor-emm-menuresourcemenuname": "Bronnen",
            "visualeditor-emm-search": "Zoeken",
            "visualeditor-emm-select-existing-item": "Kies een bestaande bron",
            "visualeditor-mwtemplate-file-optional": "Optionele tekst:",

            "visualeditor-emm-validation-required": "Dit veld mag niet leeg zijn.",
            "visualeditor-emm-validation-website": "Dit veld moet een geldige URL bevatten.",
            "visualeditor-emm-validation-special": "Dit veld mag geen speciale tekens bevatten. (!@#. ect)",
            "visualeditor-emm-validation-date": "Dit veld moet een geldige datum bevatten.",

            "visualeditor-emm-linkdialog-title-npage": "Invoegen nieuwe koppeling naar website",
            "visualeditor-emm-linkdialog-title-edit": "Aanpassen koppeling naar website",
            "visualeditor-emm-inlidialog-title-npage": "Invoegen nieuwe koppeling naar pagina",
            "visualeditor-emm-inlidialog-title-edit": "Aanpassen koppeling naar pagina",
            "visualeditor-emm-inlidialog-title-insert-edit": "Aanpassen & invoegen koppeling naar pagina",
            "visualeditor-emm-linkdialog-titlefield-placeholder-def": "Zoeken naar een koppeling",
            "visualeditor-emm-linkdialog-titlefield-placeholder-new": "Titel nieuwe koppeling",
            "visualeditor-emm-linkdialog-linkfield-placeholder-def": "Invoegen nieuwe koppeling",
            "visualeditor-emm-filedialog-title-npage": "Invoegen nieuwe koppeling naar bestand",
            "visualeditor-emm-filedialog-title-edit": "Aanpassen koppeling naar bestand",
            "visualeditor-emm-filedialog-titlefield-placeholder-def": "Zoeken naar een bestandskoppeling",
            "visualeditor-emm-filedialog-titlefield-placeholder-new": "Titel nieuwe bestandskoppeling",
            "visualeditor-emm-filedialog-uploadnf": "Upload nieuwe versie van bestand",
            "visualeditor-emm-required": "*Vereist",

            "visualeditor-emm-notification-template-title": "Actie niet toegestaan",
            "visualeditor-emm-notification-template-body": "U probeert een systeemtemplate te verwijderen, dit is niet toegestaan.",
            "visualeditor-emm-notification-template-copy": "U probeert een systeemtemplate te kopiëren, dit is niet toegestaan.",
            "visualeditor-emm-notification-template-edit": "U probeert een systeemtemplate te bewerken, dit is niet toegestaan.",

            "visualeditor-emm-notification-err-invalidlink-body": "De paginacontextinformatie van de geselecteerde referentie kon niet worden opgehaald, is de pagina verwijderd?",
            "visualeditor-emm-notification-err-invalidlink-title": "Ongeldige verwijzing",

            "visualeditor-emm-suggestion-err-no-supercontext": "Geen supercontext"
        }
    };
    var userLanguage = mw.config.get("wgUserLanguage");
    mw.messages.set(translations[userLanguage] || translations.en);
}
