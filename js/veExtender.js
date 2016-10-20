//redefine what tools will be initially available in the insert-menu
function redefineMenu() {
    var tools = ve.ui.toolFactory.bindings.register;
    //Helps adding tools to the insert menu, makes sure they're not hidden behind the 'show more' button
    var force = ve.ui.toolFactory.bindings.register[0].context.forceExpand;
    for (var j = 0; j < tools.length; j++) {
        var force1 = ve.ui.toolFactory.bindings.register[j].context.forceExpand;
        if (force1 == null) {
            // do something
        } else {
            for (var k = 0; k < force1.length; k++) {
                if (force1[k] == "media") {
                    force = force1;
                }
            }
        }
    }
    //remove transclusion from menu if available
    for (var i = 0; i < force.length; i++)
        if (force[i] == "transclusion") {
            force.splice(i, 1);
            break;
        }
    //add options to menu if they are not already there
    var toadd = ['file', 'linkpage', 'linkwebsite'];
    for (var i = 0; i < toadd.length; i++)
        if (force.indexOf(toadd[i]) < 0)
            force.push(toadd[i]);
}

function loadEMMExtender(){
  redefineMenu();
  defineTranslations();
  addEMMLinks();
  loadExtenderUI();
  createExitDialog();
}

mw.hook('ve.activationComplete').add(function () {
    // Register plugins to VE. will be loaded once the user opens the VE
    loadEMMExtender();
});