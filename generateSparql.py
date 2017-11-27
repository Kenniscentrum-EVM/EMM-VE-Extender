import requests,json
import os
import urllib.parse

import sys
import yaml
import pickle
import datetime

# [[Category:Resource Description]] [[file name::+]] |?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|sort=Semantic title|order=asc|limit=10000
# hieronder uitgewerkt:
# [[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title|order=asc|limit=10000
# [[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|sort=Semantic title|order=asc|limit=10000
# [[Category:Resource Description]]|?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|?Hyperlink|sort=Semantic title|order=asc|limit=10000


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
method = "PUT"

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


def doCommand(query,cmd,f,listdata):
    url = wikiurl + "/api.php?action=ask&query=" + urllib.parse.quote_plus(query) + "&format=json"
    print(url)
    r = requests.get(url)
    data = json.loads(r.text)
    # print(data)
    l = data['query']['results']
    for key,mydict in l.items():
        listdata.append(key)
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

def saveAllResources():
    """
    dump two lists to SPARQL
    :return:
    """
    listdata = []

    #save Light Context
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

    f = [lambda x: codeTitle("rdf:type  wiki:", x["Category"], True).replace("Categorie", "Category"),
         lambda y: codeTitle("wiki:Property-3ASupercontext  wiki:", y["Supercontext"], True),
         lambda y: "wiki:Property-3ASemantic_title  \"" + escapeQuote(y["Semantic title"][0]) + "\"",
         lambda y: "wiki:Property-3AName  \"" + escapeQuote(y["Semantic title"][0]) + "\""]

    query = "[[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title|order=asc|limit=10000"
    # look for sparql-result:
    # select ?p ?o where { <http://localhost:5555/wikis/hzportfolio/wiki/index.php/LC_00249> ?p ?o}
    doCommand(query,cmd,f,listdata)
    print("--- %s seconds ---" % (time.time() - start_time))

    #save Resource Descriptions
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
    doCommand(query,cmd,f,listdata)

    #save list of pagenames to file
    afile = open('save.pkl', 'wb')
    pickle.dump([datetime.datetime.utcnow(),listdata], afile)
    afile.close()

def getRecentChanges():
    #data must be added to SPARQL, do not overwrite it
    global method
    method = "POST"

    #read list pagenames from file
    try:
        afile = open('save.pkl', 'rb')
        [prevdate,listdata]=pickle.load(afile)
        afile.close()
    except:
        listdata={}
        prevdate=datetime.datetime.utcnow() - datetime.timedelta(days=3*365)
    print(prevdate)

    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")

    #get list of recent changes
    #https://www.projectenportfolio.nl/wiki/api.php?action=query&list=recentchanges&rcprop=title&rcstart=2017-11-24T00:00:00Z
    #print (today) #rcstart={0}T00:00:00Z&
    #timestamp example: "2017-11-23T10:56:43Z"
    #previous:&rcstart={0}T00:00:00Z
    url = (wikiurl + "/api.php?action=query&list=recentchanges&rcprop=title|timestamp&rclimit=100&format=json") .format(today) #&rclimit=500
    print(url)
    r = requests.get(url)
    data = json.loads(r.text)
    # print(data)
    result=data["query"]["recentchanges"]

    #filter recent changes; compare date and check for uniqueness
    urls=set()
    maxdate=prevdate
    for item in result:
        title = item["title"]
        #print(title)
        if title in listdata:
            #print("title in list")
            continue
        timestamp=item["timestamp"]
        time=datetime.datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ")
        if time<prevdate:
            continue
        listdata.append(title)
        if time>maxdate:
            maxdate=time
        #print(time)
        urls.add(title)
        print("add:"+title)

    #nothing to do?
    if len(urls)==0:

        global debug
        debug=True
        return

    #update pagenames on disk
    afile = open('save.pkl', 'wb')
    pickle.dump([maxdate,listdata], afile)
    afile.close()
    urls=list(urls)
    possiblePages={"Resource Description","Light Context"}
    pages=dict()
    print(len(urls))

    #max of 19 items per time!?
    for item in urls:
        title=item
        #remnant of try to get more than one page per call
        totalNames = ""
        totalNames+="|"+urllib.parse.quote_plus(title)
        #https://www.projectenportfolio.nl/wiki/api.php?action=query&titles=PR%20SSM%2000020&prop=categories|pageprops
        totalNames = totalNames[1:]

        #get page description(s)
        titleurl=(wikiurl + "/api.php?action=query&titles={0}&prop=categories|pageprops&format=json") .format(totalNames)
        print(titleurl)
        r2 = requests.get(titleurl)
        data = json.loads(r2.text)
        pagesreturn=data["query"]["pages"]
        mypage = {}
        for key in pagesreturn:
            #print(title)
            page=pagesreturn[key]
            print(page)

            #if not "title" in page:
            #    print(page)
            #    continue
            title=page["title"]
            mypage['id'] = title.replace(" ","_")
            #todo: semantic title is not set when it is saved as resource; only when updated with properties......
            mypage['displaytitle']=title
            #for key in page:
            if "categories" in page:
                categories=page["categories"]
                cats=[]
                for item in categories:
                    cats.append(item["title"].replace("Category:","").replace("Categorie:",""))
                mypage["categories"]=cats
            else:
                mypage["categories"] = []
            if "pageprops" in page:
                pageprops=page["pageprops"]
                #mypage['displaytitle'] = 'wiki:Property-3ADisplay_title_of  "{1}"'.format(escapeQuote(pageprops['displaytitle']))
                if 'displaytitle' in pageprops:
                    mypage['displaytitle'] = pageprops['displaytitle']
            else:
                pass
            cats=set(mypage["categories"])
            print("cats:",cats)
            mypage["categories"]=[]
            if len(cats)>0 and len(cats-possiblePages)==0:
                cats=list(possiblePages.intersection(cats))
                mypage["categories"]=cats
                pages[key]=mypage

                # &prop=revisions&rvprop=content

        titleurl = (wikiurl + "/api.php?action=query&titles={0}&prop=revisions&rvprop=content&format=json").format(
            totalNames)
        r2 = requests.get(titleurl)
        data = json.loads(r2.text)
        contentJson = data["query"]["pages"]

        for key in contentJson:
            item=contentJson[key]
            hyperlink = False
            pagename = False
            try:
                content = item["revisions"][0]['*']
                print("content:",content)
                if "{{Light Context" in content:
                    mypage["categories"] = list(set(mypage["categories"].append('Light Context')))
                if "{{Resource Description" in content:
                    print("inside")
                    import re
                    regex = r"(?<=\|title=).+$"

                    matches = re.finditer(regex, content, re.MULTILINE)

                    m=""
                    for matchNum, match in enumerate(matches):
                        mypage['displaytitle']=match.group()
                    #print("title:",m)
                    mypage["categories"]=list(set(mypage["categories"].append('Resource Description')))
                    #cats.add('Resource Description')

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

            item=mypage
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
            print(formatted)

            fh.write(formatted)
try:
    param=sys.argv[1]
except:
    param="dump"
if param=="dump":
    saveAllResources()
else:
    getRecentChanges()
#rcstart="2017-11-21T16:18:06Z"
fh.close()
print("--- %s seconds ---" % (time.time() - start_time))
#Use accessor.add(m) instead of putModel(m)
if not debug:
    command = '''curl -X {1}  -H Content-Type:text/turtle  -T data.ttl  -G http://localhost:{0}/hzportfolio/data'''.format(sparqlport,
                                                                                                                           method)
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
