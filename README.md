# EMM-VE-Extender

Adds and removes various new functions to the visual editor including 
but not limited to:

* A cancel button to cancel editing a page with the visual editor;
* Menu's to insert links to certain types of resources and pages;
* In these menu's users can also create new resources and pages and edit existing ones;
* A custom edit-window in order to edit existing links already on a page;
* The ability to give a template a certain category which prevents a user from deleting and copying a template in the visual editor.

## Changelog
Found [here](https://bitbucket.org/expertisemanagement/emm-ve-extender/src/5c48a88ad1d8c74a26ae4b37ea3c23bffbc2ea35/ChangeLog.md?at=master&fileviewer=file-view-default)

## Instellen van extender op test-server
Voorlopig moeten de volgende aanpassingen gemaakt in de volgende bestanden
//Toevoegen aan pagina MediaWiki:Common.js
mw.loader.using( 'ext.EMMVEExtension', function () {
});

aanpassen in bestand veExtender.js:
Heading nl vervangen door: Semantic title