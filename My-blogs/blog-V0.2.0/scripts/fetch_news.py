"""Fetch RSS feeds and generate data/news.json (Top 10)."""
from __future__ import annotations
import json, datetime, ssl
from urllib.request import urlopen, Request
from xml.etree import ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'news.json'
FEEDS=[('CNN','http://rss.cnn.com/rss/edition.rss'),('NYTimes','https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'),('NASA','https://www.nasa.gov/rss/dyn/breaking_news.rss'),('ReutersBest','https://reutersbest.com/feed/'),('TheVerge','https://www.theverge.com/rss/index.xml')]

def get(url):
  req=Request(url,headers={'User-Agent':'Mozilla/5.0'});
  return urlopen(req,context=ssl.create_default_context(),timeout=25).read()

def parse(xml,src):
  root=ET.fromstring(xml); out=[]
  for it in root.findall('.//item')[:12]:
    t=(it.findtext('title') or '').strip(); l=(it.findtext('link') or '').strip(); p=(it.findtext('pubDate') or it.findtext('{http://purl.org/dc/elements/1.1/}date') or '').strip()
    if t and l: out.append({'title':t,'url':l,'source':src,'published':p})
  if out: return out
  ns={'a':'http://www.w3.org/2005/Atom'}
  for e in root.findall('.//a:entry',ns)[:12]:
    t=(e.findtext('a:title',default='',namespaces=ns) or '').strip(); link=e.find('a:link',ns); l=(link.get('href') if link is not None else '').strip(); p=(e.findtext('a:updated',default='',namespaces=ns) or '').strip()
    if t and l: out.append({'title':t,'url':l,'source':src,'published':p})
  return out

def main():
  items=[]
  for n,u in FEEDS:
    try: items+=parse(get(u),n)
    except Exception: pass
  seen=set(); uniq=[]
  for x in items:
    if x['url'] in seen: continue
    seen.add(x['url']); uniq.append(x)
  OUT.parent.mkdir(exist_ok=True)
  OUT.write_text(json.dumps({'updated':datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),'items':uniq[:10]},ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':
  main()
