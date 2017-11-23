import requests,json
import os
import urllib.parse
import yaml

# todo: check in ve-extender dat lijsten alleen worden opgevraagd met sparql, en update-info etc via ask.....

# [[Category:Resource Description]] [[file name::+]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|sort=Semantic title|order=asc|limit=10000
# hieronder uitgewerkt:
# [[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title|order=asc|limit=10000
# [[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|sort=Semantic title|order=asc|limit=10000
# [[Category:Resource Description]]|?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|?Hyperlink|sort=Semantic title|order=asc|limit=10000

# for the Resource Description:
"""
rdf:type  swivt:Subject
rdf:type  wiki:Category-3AResource_Description
rdfs:label  "Bestand:141027agenda programmagroep22.docx"
swivt:page  <https://www.projectenportfolio.nl/wiki/index.php/Bestand:141027agenda_programmagroep22.docx>
wiki:Property-3ADct-3Acreator  "Cora Dourlein"
wiki:Property-3ADct-3Adate  "2017-04-13Z"^^xsd:date
wiki:Property-3ADct-3Atitle  "141027 Agenda programmagroep"
wiki:Property-3ASemantic_title  "141027 Agenda programmagroep"
wiki:Property-3ASelf  wiki:Bestand-3A141027agenda_programmagroep22.docx
swivt:file  <https://www.projectenportfolio.nl/images/5/5b/141027agenda_programmagroep22.docx>
wiki:Property-3ACreated_in_page  wiki:LC_00083
wiki:Property-3ADct-3Adate-23aux  "2457856.5"^^xsd:double
wiki:Property-3AFile_name  wiki:Bestand-3A141027agenda_programmagroep22.docx
wiki:Property-3APagename  "Bestand:141027agenda programmagroep22.docx"
"""
debug=False
def codeTitle(prefix,title_,url):
    if debug:
        print(title_)
    ret=""
    if not type(title_) is list:
        title_=[title_]
    for item in title_:
        s=item
        if 'fulltext' in item:
            s=item['fulltext']
        if url:
            ret+= prefix + encodeUrl(s) + " ;"
        else:
            ret += prefix + '"'+escapeQuote(s)+ "\";"
    return ret

    #return urllib.parse.quote_plus(title_.replace(" ", "_")).replace("%", "-")


def encodeUrl(s):
    return urllib.parse.quote_plus(s.replace(" ", "_")).replace("%", "-").replace(".", "\\.")

def escapeQuote(s):
    return s.replace("\"","\\\"")

def simple(x):
    if debug:
        print(x)
    return x

stream = open('parameters.yml', 'r')    # 'document.yaml' contains a single YAML document.
parameters = yaml.load(stream)['parameters']


wikiurl=parameters.get('wikiurl',"http://localhost:5555/wikis/hzportfolio/wiki")
sparqlport=parameters.get('sparqlport',"5030")
wiki=wikiurl+"/index.php"
fname=parameters.get('datafilename',"data.ttl")
print("wiki url:",wikiurl)
print("sparql port:",sparqlport)

header="""
PREFIX wiki: <{0}/Speciaal:URIResolver/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX swivt: <http://semantic-mediawiki.org/swivt/1.0#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
""".format(wiki)
fh = open(fname,'w')
fh.write(header)

cmd = """<{0}> 
  rdf:type  swivt:Subject;
[3]
  rdfs:label  "{1}";
  swivt:page  <{0}>;
[6]
[4]
  wiki:Property-3ADisplay_title_of  "{1}";
[5]
  wiki:Property-3ASelf  wiki:{2}
  .

  """

f = [lambda x: codeTitle("rdf:type  wiki:",x["Category"],True).replace("Categorie", "Category"),
     lambda y: codeTitle("wiki:Property-3ASupercontext  wiki:",y["Supercontext"],True),
     lambda y: "wiki:Property-3ASemantic_title  \"" + escapeQuote(y["Semantic title"][0]) + "\"",
     lambda y: "wiki:Property-3AName  \"" + escapeQuote(y["Semantic title"][0]) + "\""]

query="[[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title|order=asc|limit=10000"
# look for sparql-result:
# select ?p ?o where { <http://localhost:5555/wikis/hzportfolio/wiki/index.php/LC_00249> ?p ?o}


def doCommand(query,cmd,f):
    url = wikiurl + "/api.php?action=ask&query=" + urllib.parse.quote_plus(query) + "&format=json"
    print(url)
    r = requests.get(url)
    data = json.loads(r.text)
    # print(data)
    l = data['query']['results']
    for key,mydict in l.items():
        lc=key #url
        self1=encodeUrl(lc)
        label=escapeQuote(l[lc]['displaytitle'])
        url=l[lc]['fullurl']
        #for k1 in mydict:
        #    print(l[key][k1])
        printouts=l[key]["printouts"]

        formatted=cmd.format(url,label,self1)# ,f[0](printouts),f[1](printouts),f[2](printouts)
        for i in range (0,len(f)):
            id="["+str(i+3)+"]"
            try:
                formatted=formatted.replace(id,"  "+f[i](printouts)+ ";")
            except:
                pass
            formatted = formatted.replace(id, "")
        formatted=formatted.replace(";;", ";").replace(":-",":")
        fh.write(formatted)

import time
start_time = time.time()


doCommand(query,cmd,f)
print("--- %s seconds ---" % (time.time() - start_time))
doCommand("[[Category:Resource Description]]|?Semantic title|?file name|?hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|limit=10000",
          """<{0}> 
  rdf:type  swivt:Subject;
  rdf:type  wiki:Category-3AResource_Description;
[3]
  rdfs:label  "{1}";
  swivt:page  <{0}>;
[6]
[7]
[4]
  wiki:Property-3ADisplay_title_of  "{1}";
[5]
  wiki:Property-3ASelf  wiki:{2}
  .

  """,
          [ #todo: date can also be: 1/2017/4/13 --> "2016-09-06Z"^^xsd:date
              #lambda x: "wiki:Property-3ADct-3Adate  \"" + simple(x["Dct:date"][0]['raw']+'"^^xsd:gYear'),
           #lambda y: codeTitle("wiki:Property-3ADct-3Acreator  ",y["Dct:creator"],False),
           #lambda y: codeTitle("wiki:Property-3ADct-3Asubject  wiki:" ,y["Dct:subject"],True),
           #lambda y: codeTitle("wiki:Property-Organization  ",y["Organization"],False),
lambda y: codeTitle("wiki:Property-3ASupercontext  wiki:",y["Supercontext"],True),
           lambda y: codeTitle("wiki:Property-3AFile_name  wiki:",y["File name"],True),
lambda y: "wiki:Property-3AHyperlink  <"+y["Hyperlink"][0]+">",
lambda y: "wiki:Property-3ASemantic_title  \"" + escapeQuote(y["Semantic title"][0]) + "\"",
     lambda y: "wiki:Property-3AName  \"" + escapeQuote(y["Semantic title"][0]) + "\""]
          )

fh.close()
print("--- %s seconds ---" % (time.time() - start_time))
if not debug:
    command = '''curl -X PUT  -H Content-Type:text/turtle  -T {0}  -G http://localhost:{1}/hzportfolio/data'''.format(fname,sparqlport)
    print(command)
    print(os.system(command))

print("--- %s seconds ---" % (time.time() - start_time))

# So doing a POST on .../ds/data?graph=mygraph.net, with Content-Type= application/rdf+xml worked
#print(data[ 'query'][ 'results'])

# upload data with:
"""
curl -X PUT \
     -H Content-Type:text/turtle \
     -T data.ttl \
     -G http://localhost:5030/hzportfolio/data 
"""
