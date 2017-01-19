# EMM-VE-Extender

Adds and removes various new functions to the visual editor including 
but not limited to:

* A cancel button to cancel editing a page with the visual editor;
* Menu's to insert links to certain types of resources and pages;
* In these menu's users can also create new resources and pages and edit existing ones;
* A custom edit-window in order to edit existing links already on a page;
* The ability to give a template a certain category which prevents a user from deleting and copying a template in the visual editor.

## Changelog

Found [here](https://bitbucket.org/expertisemanagement/emm-ve-extender/src/90f63dbeb542d8ced826ce812dca4d469406b098/ChangeLog.md?at=master&fileviewer=file-view-default) (Dutch)

## Instellen van extender op test-server

Voorlopig moeten de volgende aanpassingen gemaakt in de volgende bestanden
//Toevoegen aan pagina MediaWiki:Common.js
mw.loader.using( 'ext.EMMVEExtension', function () {
});

aanpassen in bestand veExtender.js:
Heading nl vervangen door: Semantic title