function veExtenderQueries(){
  return {
    //used in invoegen-menu
    linkpages:'[[Category:Light Context||Project]]',//todo: naamgeving; zet links ervoor, in plaats van eracher
    linkwebsites:'[[Category:Resource Description]] [[Hyperlink::+]]',
    linkreferences:'[[Category:Resource Description]] [[:+]] OR [[Category:Resource Description]] [[File:+]] [[Pagename::~*.pdf||~*.doc||~*.docx||~*.ppt||~*.pptx||~*.odt||~*.odc||~*.odp||~*.odg||~*.txt]]',//
    //used in resource-menu
    resourcepages:'[[Category:Light Context||Project]]',
    resourcehyperlinks:'[[Category:Resource Description]] [[:+]]',
    resourceuploadables:'[[Category:Resource Description]] [[File:+]]'
  };
}
