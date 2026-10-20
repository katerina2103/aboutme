import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';
const md=new MarkdownIt({html:false,breaks:false});
const read=p=>fs.readFileSync(path.join('content',p),'utf8');
const yaml=p=>YAML.parse(read(p));
export default function(config){
 config.addFilter('markdown',s=>md.render(s||''));
 config.addFilter('inline',s=>md.renderInline(String(s||'').replace(/<br\s*\/?>/g,'LINEBREAKTOKEN').replace(/<em>(.*?)<\/em>/g,'*$1*')).replaceAll('LINEBREAKTOKEN','<br>'));
 config.addFilter('json',s=>JSON.stringify(s).replaceAll('<','\\u003c'));
 config.addGlobalData('copy',()=>{
  const site=yaml('site.yaml'),text=yaml('labels.yaml');
  const prose={};
  for(const file of fs.readdirSync('content').filter(f=>f.endsWith('.md')&&f!=='README.md')){
   const group=file.slice(0,-3)==='home'?'hero':file.slice(0,-3);
   for(const match of read(file).matchAll(/<!-- (paragraph\d+) -->\s*([\s\S]*?)(?=<!-- paragraph\d+ -->|$)/g))prose[group+'-'+match[1]]=match[2].trim();
  }
  const cases=fs.readdirSync('content/cases').filter(f=>f.endsWith('.md')).map(f=>{const raw=read('cases/'+f);const [,meta,body]=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);return {...YAML.parse(meta),body:md.render(body)}}).sort((a,b)=>a.order-b.order);
  const panels=yaml('audiences.yaml').map(p=>[p.title,p.body,p.action]);
  const stories=['vision','strategy','roadmap','prototype'].map(f=>md.render(read('product-story/'+f+'.md')));
  // Resolve a single shared email value for every authored mailto link.
  for(const group of Object.values(text))if(group&&typeof group==='object'&&!Array.isArray(group))for(const [k,v]of Object.entries(group))if(typeof v==='string'&&v.startsWith('mailto:'))group[k]=v.replace(/^mailto:[^?]+/,'mailto:'+site.email);
  return {site,text,prose,cases,testimonials:yaml('testimonials.yaml'),interactive:{cases,panels,principles:yaml('principles.yaml'),stories,email:site.email}};
 });
 config.addWatchTarget('content');
 config.addPassthroughCopy({'src/styles.css':'styles.css','src/app.js':'app.js','src/assets':'assets'});
 return {dir:{input:'templates',output:'dist'},templateFormats:['njk'],htmlTemplateEngine:'njk'};
}
