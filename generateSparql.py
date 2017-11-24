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
debug=True
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
fh = open("data.ttl",'w')
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


#doCommand(query,cmd,f)
print("--- %s seconds ---" % (time.time() - start_time))
query="[[Category:Resource Description]]|?Semantic title|?file name|?hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|limit=10000"
cmd="""
<{0}> 
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

  """
f=[ #todo: date can also be: 1/2017/4/13 --> "2016-09-06Z"^^xsd:date
              #lambda x: "wiki:Property-3ADct-3Adate  \"" + simple(x["Dct:date"][0]['raw']+'"^^xsd:gYear'),
          # lambda y: codeTitle("wiki:Property-3ADct-3Acreator  ",y["Dct:creator"],False),
          # lambda y: codeTitle("wiki:Property-3ADct-3Asubject  wiki:" ,y["Dct:subject"],True),
          # lambda y: codeTitle("wiki:Property-Organization  ",y["Organization"],False),
lambda y: codeTitle("wiki:Property-3ASupercontext  wiki:",y["Supercontext"],True),
           lambda y: codeTitle("wiki:Property-3AFile_name  wiki:",y["File name"],True),
lambda y: "wiki:Property-3AHyperlink  <"+y["Hyperlink"][0]+">",
lambda y: "wiki:Property-3ASemantic_title  \"" + escapeQuote(y["Semantic title"][0]) + "\"",
     lambda y: "wiki:Property-3AName  \"" + escapeQuote(y["Semantic title"][0]) + "\""]
#doCommand(query,cmd,f)

def getRecentChanges():
    #https://www.projectenportfolio.nl/wiki/api.php?action=query&list=recentchanges&rcprop=title&rcstart=2017-11-24T00:00:00Z
    import datetime
    today = datetime.date.today()
    print (today) #rcstart={0}T00:00:00Z&
    url = (wikiurl + "/api.php?action=query&list=recentchanges&rcprop=title&rcstart={0}T00:00:00Z&format=json") .format(today) #&rclimit=500
    print(url)
    r = requests.get(url)
    data = json.loads(r.text)
    # print(data)
    result=data["query"]["recentchanges"]
    urls=set()
    for item in result:
        title = item["title"]
        urls.add(title)
    urls=list(urls)
    possiblePages={"Resource Description","Light Context"}
    pages=dict()
    print(len(urls))
    totalNames=""
    #todo: max of 19 items per time!?
    for item in urls:
        title=item
        totalNames+="|"+urllib.parse.quote_plus(title)
        #https://www.projectenportfolio.nl/wiki/api.php?action=query&titles=PR%20SSM%2000020&prop=categories|pageprops
    totalNames = totalNames[1:]
    titleurl=(wikiurl + "/api.php?action=query&titles={0}&prop=categories|pageprops&format=json") .format(totalNames)
    print(titleurl)
    r2 = requests.get(titleurl)
    data = json.loads(r2.text)
    pagesreturn=data["query"]["pages"]
    for key in pagesreturn:
        #print(title)
        page=pagesreturn[key]
        #print(page)

        #if not "title" in page:
        #    print(page)
        #    continue
        title=page["title"]
        mypage={}
        mypage['id'] = title.replace(" ","_")
        mypage['displaytitle']=title
        for key in page:
            try:
                categories=page[key]["categories"]
                cats=[]
                for item in categories:
                    cats.append(item["title"].replace("Category:","").replace("Categorie:",""))
                mypage["categories"]=cats
            except:
                mypage["categories"] = []
            try:
                pageprops=page[key]["pageprops"]
                mypage['displaytitle'] = pageprops['displaytitle']
            except:
                pass
        cats=set(mypage["categories"])
        if len(cats-possiblePages)==0:
            cats=list(possiblePages-cats)
            mypage["categories"]=cats
            pages[key]=mypage

            # &prop=revisions&rvprop=content

    titleurl = (wikiurl + "/api.php?action=query&titles={0}&prop=revisions&rvprop=content&format=json").format(
        totalNames)
    r2 = requests.get(titleurl)
    data = json.loads(r2.text)
    contentJson = data["query"]["pages"]
    #print(pages)
    #todo: check if property hyperlink or file name is in page......... Check with content!?
    #todo: can it be done with id? That is given by page-info!
    for key in pages:
        item=pages[key]
        hyperlink = False
        pagename = False
        if "Resource Description" in item["categories"]:
            try:
                content=content["revisions"][0]['*']
                hyperlink="|hyperlink=" in content.lower()
                pagename = "|page name=" in content.lower()
                #print(hyperlink,pagename)
            except:
                pass
        cmd="""<{0}> 
  rdf:type  swivt:Subject;
  rdfs:label  "{1}";
  swivt:page  <{0}>;
  wiki:Property-3ADisplay_title_of  "{1}";
  wiki:Property-3ASelf  wiki:{2};
  wiki:Property-3ASemantic_title  "{3}";
{4}{5}
  .

  """

        lc=item["id"] #url
        self1=encodeUrl(lc)
        label=escapeQuote(item['displaytitle'])
        url=wiki+"/"+item["id"]
        semanticTitle=label
        cat="  rdf:type  wiki:Category-3A{0};\n"
        cats=""
        for c in item["categories"]:
            cats+=cat.format(c.replace(" ", "_"))
        extra=""
        if hyperlink:
            extra+="  wiki:Property-3AHyperlink  \"zomaar\";  \n"
        if pagename:
            extra+="  wiki:Property-3APage name  \"zomaar\";\n  "
        formatted = cmd.format(url, label, lc, semanticTitle, cats,extra)
        #print(formatted)

        fh.write(formatted)

getRecentChanges()
#rcstart="2017-11-21T16:18:06Z"
fh.close()
print("--- %s seconds ---" % (time.time() - start_time))
if not debug:
    command = '''curl -X PUT  -H Content-Type:text/turtle  -T data.ttl  -G http://localhost:{0}/hzportfolio/data'''.format(sparqlport)
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
