function veExtenderQueries(){
  return {
    //used in invoegen-menu
    linkpages:"[[Category:Light Context||Project]]|?Semantic title|limit=10000",//todo: naamgeving; zet links ervoor, in plaats van eracher
    linkwebsites:"[[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|limit=10000",
    linkfiles:"[[Category:Resource Description]] [[:+]] OR [[Category:Resource Description]] [[File:+]] [[Pagename::~*.pdf||~*.doc||~*.docx||~*.ppt||~*.pptx||~*.odt||~*.odc||~*.odp||~*.odg||~*.txt]]|?Semantic title|limit=10000",//
    //used in resource-menu
    resourcepages:"[[Category:Light Context||Project]]",
    resourcehyperlinks:"[[Category:Resource Description]] [[:+]]",
    resourceuploadables:"[[Category:Resource Description]] [[File:+]]"
  };
}
