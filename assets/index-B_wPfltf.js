(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function o(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(e){if(e.ep)return;e.ep=!0;const s=o(e);fetch(e.href,s)}})();function y(t,n){const o=t.length+1,l=n.length+1,e=new Array(o).fill(0).map(()=>new Array(l).fill(0)),s=new Array(o-1).fill(0).map(()=>new Array(l-1).fill(""));for(let r=1;r<o;r++)for(let a=1;a<l;a++)t[r-1]==n[a-1]?(e[r][a]=e[r-1][a-1]+1,s[r-1][a-1]="↖"):e[r-1][a]>=e[r][a-1]?(e[r][a]=e[r-1][a],s[r-1][a-1]="↑"):(e[r][a]=e[r][a-1],s[r-1][a-1]="←");return{weights:e,paths:s,query:[t,n]}}const d=document.querySelector(":root"),E=document.querySelector(".grid"),m=new Map([["←",[-1,0]],["↑",[0,-1]],["↖",[-1,-1]]]),c={grid:"grid",label:"label",items:"items",box:"box",even:"even",footer:"footer",animationControls:"animation-controls",result:"result",resultItem:"result-item"};function b(t){const{footer:n,result:o,lcs:l}=t;let e;for(;e=n.lastChild;)e.remove();const s=document.createElement("div");s.classList.add(c.result),s.appendChild(document.createTextNode(`LCS(${l.query[0]}, ${l.query[1]}) = ${o?o.split("").reverse().join(""):"no match"}`)),n.appendChild(s)}function w(t){const{colElement:n,rowElement:o,itemElement:l,lcs:e,items:s}=t;l.ontransitionend=null;const[r]=l.textContent;if(r=="0")return b(t);let a=0;for(let g of m.keys()){if(g!=r){a++;continue}a==2?(n.dataset.selected="match",o.dataset.selected="match",t.result+=n.textContent,t.colElement=n.previousElementSibling,t.rowElement=o.previousElementSibling):a==1?t.rowElement=o.previousElementSibling:t.colElement=n.previousElementSibling;break}const i=parseInt(l.dataset.col)+m.get(r)[0],h=(parseInt(l.dataset.row)+m.get(r)[1])*e.weights[0].length+i,u=s[h];t.itemElement=u,u.ontransitionend=()=>w(t),u.dataset.selected="true"}function C(t){const{rowElement:n,colElement:o,itemElement:l,b:e,lcs:s}=t,r=parseInt(l.dataset.col),a=parseInt(l.dataset.row);l.textContent=`${s.paths[a-1][r-1]}${s.weights[a][r]}`,e.ontransitionend=null,e.dataset.selected="false";let i;if(o.dataset.selected="false",i=o.nextElementSibling)return l.dataset.selected="false",t.colElement=i,f(t);if(n.dataset.selected="false",i=n.nextElementSibling){l.dataset.selected="false",t.colElement=o.parentElement.firstElementChild,t.rowElement=i,i.ontransitionend=()=>f(t),i.dataset.selected="true";return}e.ontransitionend=()=>w(t)}function v(t){const{itemElement:n,items:o,lcs:l}=t;n.ontransitionend=null;const[e]=n.textContent,s=parseInt(n.dataset.col)+m.get(e)[0],a=(parseInt(n.dataset.row)+m.get(e)[1])*l.weights[0].length+s,i=o[a];i.ontransitionend=()=>C({...t,b:i}),i.dataset.selected="true"}function S(t){const{colElement:n,rowElement:o,lcs:l,items:e}=t;n.ontransitionend=null;const s=parseInt(n.dataset.col)+1,a=(parseInt(o.dataset.row)+1)*l.weights[0].length+s,i=e[a];t.itemElement=e[a],i.ontransitionend=()=>v(t),i.dataset.selected="true"}function f(t){const{rowElement:n,colElement:o}=t;n.ontransitionend=null,o.ontransitionend=()=>S(t),n.textContent==o.textContent?(o.dataset.selected="match",n.dataset.selected="match"):(o.dataset.selected="true",n.dataset.selected="true")}function I(t,n,o){const e=window.getComputedStyle(d).getPropertyValue("--delay");let s=parseInt(e.slice(0,e.indexOf("ms")))+50;if(s>500){t.disabled=!0;return}const r=t.nextElementSibling;r==null||r.removeAttribute("disabled"),d.style.setProperty("--delay",`${s}ms`),n.dataset.content=`${s}ms`,clearTimeout(o.id),o.id=setTimeout(()=>{n.dataset.content="animation speed"},1200)}function L(t,n,o){const e=window.getComputedStyle(d).getPropertyValue("--delay");let s=parseInt(e.slice(0,e.indexOf("ms")))-50;if(s<=0){t.disabled=!0;return}const r=t.previousElementSibling;r==null||r.removeAttribute("disabled"),d.style.setProperty("--delay",`${s}ms`),n.dataset.content=`${s}ms`,clearTimeout(o.id),o.id=setTimeout(()=>{n.dataset.content="animation speed"},1200)}function p(t,n){const o=document.createElement("div");o.classList.add(c.label);const l=n=="row"?0:1;for(let e=0;e<t.lcs.query[l].length;e++){const s=document.createElement("span");s.classList.add(c.box),s.dataset.selected="false",s.textContent=t.lcs.query[l][e],n=="row"?s.dataset.row=`${e}`:s.dataset.col=`${e}`,e||(t[n=="row"?"rowElement":"colElement"]=s),o.appendChild(s)}return o.dataset.flow=n,o}function $(t){const n=document.createElement("div");n.classList.add(c.items);for(let o=0;o<t.lcs.weights.length;o++)for(let l=0;l<t.lcs.weights[0].length;l++){const e=document.createElement("span");e.classList.add(c.box),e.dataset.selected="false",e.dataset.row=`${o}`,e.dataset.col=`${l}`,o&&l?e.textContent="↑0":e.textContent="0",n.appendChild(e)}return t.items=Array.from(n.children),n}function A(t){const n=document.createElement("div");n.classList.add(c.footer);const o={id:void 0},l=document.createElement("div");l.classList.add(c.animationControls),l.dataset.content="animation speed";for(let e=0;e<2;e++){const s=document.createElement("button");s.textContent=e?"+":"-",e?s.onclick=()=>L(s,l,o):(s.toggleAttribute("disabled"),s.onclick=()=>I(s,l,o)),l.appendChild(s)}return n.appendChild(l),t.footer=n,n}function q(t,n){let o;for(;o=t.lastChild;)o.remove();d.style.setProperty("--length",`${n.lcs.weights[0].length}`),t.append(p(n,"row"),p(n,"col"),$(n),A(n))}function P(t){d.style.setProperty("--delay","500ms"),requestAnimationFrame(()=>{t.rowElement.ontransitionend=()=>f(t),t.rowElement.dataset.selected="true"})}document.querySelector(".request-form").onsubmit=t=>{t.preventDefault();const n=t.currentTarget,o=Array.from(n.children),l={lcs:y(o[0].value,o[1].value),result:""};q(E,l),P(l)};
