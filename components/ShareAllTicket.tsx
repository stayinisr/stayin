"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { flagImgSrc, teamName } from "../lib/teams";

type ListingWithMatch = {
  id: string;
  type?: string | null;
  category?: string | null;
  quantity?: number | null;
  price?: number | null;
  seats_block?: string | null;
  seats_row?: string | null;
  match?: {
    id: string;
    fifa_match_number?: number | null;
    home_team_name?: string | null;
    away_team_name?: string | null;
    city?: string | null;
    match_date?: string | null;
    stage?: string | null;
  } | null;
  ilMatch?: {
    id: string;
    home_team_name?: string | null;
    away_team_name?: string | null;
    city?: string | null;
    match_date?: string | null;
  } | null;
};

type Props = { listings: ListingWithMatch[]; isHe: boolean; open: boolean; onClose: () => void; };

const LOGO_SRC = "/stayin-share-logo.png";
const SITE_URL = "stayin.co.il";
const fCond = "'Righteous','Nunito',sans-serif";
const navy = "#08204a";
const teal = "#1abfb0";
const C = { text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", border: "rgba(13,27,62,.09)" };
const CARD_W = 1500;
const STUB_W = 260;
const ROW_H = 120;
const STUB_HEADER_H = 100;
const STUB_FOOTER_H = 70;
const COL_SB = 80; const COL_TEAMS = 480; const COL_META = 320; const COL_SEATS = 300; const COL_PRICE = 180;

function dv(v: unknown) { if (!v) return null; const s = String(v).trim(); return s || null; }
function fmtDate(v?: string | null) { if (!v) return null; const dt = new Date(v); if (isNaN(dt.getTime())) return null; return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}`; }
function stageShort(s?: string | null, isHe = true) { const v=(s||"").toLowerCase(); if(isHe){if(v.includes("group"))return"בתים";if(v.includes("32"))return"32";if(v.includes("16"))return"שמינית";if(v.includes("quarter"))return"רבע";if(v.includes("semi"))return"חצי";if(v.includes("final"))return"גמר";}else{if(v.includes("group"))return"Group";if(v.includes("32"))return"R32";if(v.includes("16"))return"R16";if(v.includes("quarter"))return"QF";if(v.includes("semi"))return"SF";if(v.includes("final"))return"Final";}return null; }
async function waitReady(el: HTMLElement) { const imgs=Array.from(el.querySelectorAll("img")); await Promise.all(imgs.map(img=>img.complete&&img.naturalWidth>0?Promise.resolve():new Promise<void>(res=>{img.onload=img.onerror=()=>res();}))); if(document.fonts?.ready)await document.fonts.ready; await new Promise<void>(res=>setTimeout(res,600)); }
const Div = ({h=80}:{h?:number}) => <div style={{width:1,height:h,background:C.border,flexShrink:0}} />;

function AllCard({ listings, isHe }: { listings: ListingWithMatch[]; isHe: boolean }) {
  const cardH = STUB_HEADER_H + listings.length * ROW_H + STUB_FOOTER_H;
  return (
    <div style={{width:CARD_W,fontFamily:"var(--font-he,Heebo),Arial,sans-serif",direction:"ltr",filter:"drop-shadow(0 24px 60px rgba(13,27,62,.18))",position:"relative"}}>
      {[{top:-24},{bottom:-24}].map((p,i)=>(
        <div key={i} style={{position:"absolute",width:48,height:48,borderRadius:999,background:"#d8dde8",zIndex:10,left:STUB_W-24,...p}}/>
      ))}
      <div style={{width:CARD_W,height:cardH,borderRadius:44,overflow:"hidden",background:"linear-gradient(145deg,#f0f4fa,#edf1f8)",border:"1px solid rgba(13,27,62,.07)",display:"flex"}}>

        {/* STUB */}
        <div style={{width:STUB_W,flexShrink:0,background:"linear-gradient(160deg,#1c3a6e,#2a5298,#183a6e,#1a5c2a)",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(55deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 14px,transparent 14px,transparent 28px)"}}/>
          <div style={{position:"absolute",top:0,bottom:0,right:0,borderRight:"2px dashed rgba(255,255,255,.18)",zIndex:2}}/>
          <div style={{height:STUB_HEADER_H,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"1px solid rgba(255,255,255,.12)",position:"relative",flexShrink:0}}>
            <img src={LOGO_SRC} alt="Stayin" crossOrigin="anonymous" style={{width:190,objectFit:"contain",display:"block"}}/>
          </div>
          {listings.map((l,idx)=>{
            const matchNum = l.match?.fifa_match_number;
            return (
              <div key={l.id} style={{height:ROW_H,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,borderBottom:idx<listings.length-1?"1px solid rgba(255,255,255,.1)":"none",background:idx%2?"rgba(0,0,0,.07)":"transparent",flexShrink:0}}>
                {matchNum ? (
                  <>
                    <div style={{fontFamily:fCond,fontSize:12,letterSpacing:".4em",textTransform:"uppercase",color:"rgba(255,255,255,.45)"}}>MATCH</div>
                    <div style={{fontFamily:fCond,fontSize:68,fontWeight:400,lineHeight:.85,letterSpacing:"-.02em",background:"linear-gradient(180deg,#fff 0%,#a8f0e8 25%,#1abfb0 50%,#a8f0e8 75%,#fff 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 0 2px rgba(26,191,176,.7))"}}>{matchNum}</div>
                  </>
                ) : (
                  <>
                    <div style={{fontFamily:fCond,fontSize:10,letterSpacing:".3em",color:"rgba(255,255,255,.4)"}}>IL</div>
                    <div style={{fontFamily:fCond,fontSize:24,color:"rgba(255,255,255,.55)"}}>⚽</div>
                  </>
                )}
              </div>
            );
          })}
          <div style={{height:STUB_FOOTER_H,display:"flex",alignItems:"center",justifyContent:"center",borderTop:"1px solid rgba(255,255,255,.12)",flexShrink:0}}>
            <div style={{fontFamily:fCond,fontSize:20,letterSpacing:".18em",color:"#fff",textShadow:"0 0 12px rgba(26,191,176,.6)"}}>{SITE_URL}</div>
          </div>
        </div>

        {/* BODY */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{height:6,background:"linear-gradient(90deg,#1a3a6b,#c0202c,#1a5c2a)",flexShrink:0}}/>

          {/* Header row */}
          <div style={{height:STUB_HEADER_H-6,display:"flex",alignItems:"center",padding:"0 36px",gap:0,borderBottom:`1.5px solid ${C.border}`,flexShrink:0,background:"rgba(13,27,62,.02)"}}>
            <div style={{width:COL_SB,flexShrink:0}}/>
            <Div h={32}/>
            <div style={{width:COL_TEAMS,flexShrink:0,textAlign:"center"}}><span style={{fontSize:15,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",color:C.hint}}>{isHe?"משחק":"MATCH"}</span></div>
            <Div h={32}/>
            <div style={{width:COL_META,flexShrink:0,display:"flex",justifyContent:"space-around"}}>
              {[isHe?"שלב":"STAGE",isHe?"עיר":"CITY",isHe?"תאריך":"DATE"].map(l=>(
                <span key={l} style={{fontSize:13,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:C.hint}}>{l}</span>
              ))}
            </div>
            <Div h={32}/>
            <div style={{width:COL_SEATS,flexShrink:0,display:"flex",justifyContent:"space-around"}}>
              {[isHe?"קט׳":"CAT",isHe?"בלוק":"BLK",isHe?"שורה":"ROW",isHe?"כמות":"QTY"].map(l=>(
                <span key={l} style={{fontSize:13,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:C.hint}}>{l}</span>
              ))}
            </div>
            <Div h={32}/>
            <div style={{width:COL_PRICE,flexShrink:0,textAlign:"center"}}><span style={{fontSize:13,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",color:C.hint}}>{isHe?"מחיר":"PRICE"}</span></div>
          </div>

          {/* Rows */}
          {listings.map((l,idx)=>{
            const m = l.match||l.ilMatch;
            const isSell = l.type==="sell";
            const home = teamName(m?.home_team_name,isHe);
            const away = teamName(m?.away_team_name,isHe);
            const stage = stageShort(l.match?.stage,isHe);
            const city = dv(m?.city);
            const date = fmtDate(m?.match_date);
            const price = l.price?`$${Number(l.price).toLocaleString()}`:"—";
            const qty = l.quantity?`×${l.quantity}`:"—";
            const cat = dv(l.category)||"—";
            const blk = dv(l.seats_block)||"—";
            const row = dv(l.seats_row)||"—";
            const hFlag = flagImgSrc(m?.home_team_name);
            const aFlag = flagImgSrc(m?.away_team_name);
            const fSt = {width:44,height:44,borderRadius:999,objectFit:"cover" as const,border:"2px solid rgba(255,255,255,.9)",boxShadow:"0 2px 8px rgba(13,27,62,.12)",background:"#ddd"};
            const cell=(val:string,color=C.text,size=28)=><div style={{textAlign:"center",minWidth:50}}><div style={{fontSize:size,fontWeight:900,color,lineHeight:1}}>{val}</div></div>;
            return (
              <div key={l.id} style={{height:ROW_H,display:"flex",alignItems:"center",padding:"0 36px",gap:0,borderBottom:idx<listings.length-1?`1px solid ${C.border}`:"none",background:idx%2?"rgba(13,27,62,.018)":"transparent",flexShrink:0}}>
                <div style={{width:COL_SB,flexShrink:0,display:"flex",justifyContent:"center"}}>
                  <div style={{width:46,height:46,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,background:isSell?"rgba(0,104,71,.1)":"rgba(26,58,143,.1)",color:isSell?"#006847":"#1a3a8f",border:`2px solid ${isSell?"rgba(0,104,71,.25)":"rgba(26,58,143,.22)"}`}}>{isSell?"S":"B"}</div>
                </div>
                <Div/>
                <div style={{width:COL_TEAMS,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
                  {hFlag?<img src={hFlag} alt="" style={fSt}/>:<div style={{...fSt,background:"linear-gradient(135deg,#c8d6e5,#a8bfd0)"}}/>}
                  <div style={{fontSize:26,fontWeight:900,color:navy,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:140}}>{home}</div>
                  <div style={{fontSize:14,color:C.hint,fontWeight:300,letterSpacing:".1em"}}>VS</div>
                  <div style={{fontSize:26,fontWeight:900,color:"#8b0000",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:140}}>{away}</div>
                  {aFlag?<img src={aFlag} alt="" style={fSt}/>:<div style={{...fSt,background:"linear-gradient(135deg,#c8d6e5,#a8bfd0)"}}/>}
                </div>
                <Div/>
                <div style={{width:COL_META,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-around"}}>
                  {cell(stage||"—",teal,24)}
                  {cell(city||"—",C.text,22)}
                  {cell(date||"—",C.text,22)}
                </div>
                <Div/>
                <div style={{width:COL_SEATS,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-around"}}>
                  {cell(cat,C.text,26)}
                  {cell(blk,C.text,26)}
                  {cell(row,C.text,26)}
                  {cell(qty,C.muted,24)}
                </div>
                <Div/>
                <div style={{width:COL_PRICE,flexShrink:0,textAlign:"center"}}>
                  <div style={{fontSize:price.length>6?26:34,fontWeight:900,color:teal,lineHeight:1}}>{price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ShareAllTicket({ listings, isHe, open, onClose }: Props) {
  const [mounted,setMounted]=useState(false);
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);
  const [isMobile,setIsMobile]=useState(false);
  const [scale,setScale]=useState(0.3);
  const cardRef=useRef<HTMLDivElement>(null);
  const active=listings.filter(l=>l.match||l.ilMatch);
  const cardH=STUB_HEADER_H+active.length*ROW_H+STUB_FOOTER_H;

  useEffect(()=>{
    setMounted(true);
    if(!document.querySelector('link[href*="Righteous"]')){const link=document.createElement("link");link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family=Righteous&display=swap";document.head.appendChild(link);}
  },[]);

  useEffect(()=>{
    function update(){const w=window.innerWidth,h=window.innerHeight,mob=w<=768;setIsMobile(mob);const avW=Math.max(260,w-(mob?32:120)),avH=Math.max(180,h-(mob?440:400));setScale(Math.max(mob?.12:.2,Math.min(mob?.24:.52,avW/CARD_W,avH/cardH)));}
    update();window.addEventListener("resize",update);return()=>window.removeEventListener("resize",update);
  },[cardH]);

  useEffect(()=>{if(!open)return;const o=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=o;};},[open]);

  async function makeImage(){if(!cardRef.current)return null;setBusy(true);try{await waitReady(cardRef.current);const opts={cacheBust:true,pixelRatio:2,backgroundColor:"#f6fbff"};await toPng(cardRef.current,opts);await new Promise<void>(res=>setTimeout(res,120));return await toPng(cardRef.current,opts);}finally{setBusy(false);}}
  async function handleDownload(){const url=await makeImage();if(!url)return;const a=document.createElement("a");a.download="stayin-all-listings.png";a.href=url;a.click();}
  async function handleShare(){const url=await makeImage();const txt=isHe?`המודעות שלי ב-Stayin 🎟️\nstayin.co.il`:`My listings on Stayin 🎟️\nstayin.co.il`;if(url&&navigator.share&&navigator.canShare){try{const blob=await(await fetch(url)).blob();const file=new File([blob],"stayin-listings.png",{type:"image/png"});if(navigator.canShare({files:[file]})){await navigator.share({title:"Stayin",text:txt,files:[file]});return;}}catch{}}window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,"_blank","noopener,noreferrer");}
  async function handleCopy(){await navigator.clipboard.writeText("stayin.co.il");setCopied(true);setTimeout(()=>setCopied(false),1800);}

  if(!open||!mounted)return null;

  return createPortal(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:999999,background:"rgba(5,12,28,.72)",backdropFilter:"blur(14px)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:18}}>
      <div dir={isHe?"rtl":"ltr"} style={{width:isMobile?"min(100%,440px)":"min(900px,100%)",maxHeight:"94vh",overflowY:"auto",overflowX:"hidden",borderRadius:isMobile?"28px 28px 0 0":30,background:"rgba(255,255,255,.97)",boxShadow:"0 -40px 90px rgba(13,27,62,.2)"}}>
        {isMobile&&<div style={{width:36,height:4,background:"#e2e8f0",borderRadius:99,margin:"12px auto 0"}}/>}
        <div style={{padding:isMobile?"14px 20px 12px":"18px 22px 14px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",borderBottom:"1px solid rgba(13,27,62,.06)"}}>
          <div>
            <div style={{fontSize:10,fontWeight:850,letterSpacing:".16em",textTransform:"uppercase",background:`linear-gradient(135deg,${navy},${teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:5}}>Stayin · {isHe?"שיתוף":"Share"}</div>
            <div style={{fontSize:isMobile?19:18,fontWeight:900,color:C.text,letterSpacing:"-.4px"}}>{isHe?"שתף את כל המודעות":"Share all listings"}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{active.length} {isHe?"מודעות בתמונה אחת":"listings in one image"}</div>
          </div>
          <button type="button" onClick={onClose} style={{width:32,height:32,borderRadius:10,background:"#f1f5f9",border:"1px solid #e8edf5",color:C.muted,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
        </div>
        <div style={{margin:"14px 16px",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 36px rgba(13,27,62,.16),0 0 0 1px rgba(13,27,62,.06)",background:"#f6fbff"}}>
          <div style={{width:"100%",height:Math.ceil(cardH*scale),overflow:"hidden",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
            <div style={{width:CARD_W,height:cardH,transform:`scale(${scale})`,transformOrigin:"top center",flexShrink:0}}>
              <div ref={cardRef} style={{width:CARD_W,height:cardH}}><AllCard listings={active} isHe={isHe}/></div>
            </div>
          </div>
        </div>
        <div style={{margin:"0 16px 14px",padding:"10px 14px",background:"rgba(26,191,176,.06)",border:"1px solid rgba(26,191,176,.16)",borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:teal,flexShrink:0}}/>
          <div style={{fontSize:11,color:"#475569",fontWeight:500,lineHeight:1.4}}>{isHe?"תמונה אחת עם כל המודעות — מושלמת לשיתוף בקבוצות ווצאפ":"One image with all listings — perfect for WhatsApp groups"}</div>
        </div>
        <div style={{padding:"0 16px 20px",display:"flex",flexDirection:"column",gap:10}}>
          <button type="button" onClick={handleShare} disabled={busy} style={{width:"100%",height:56,borderRadius:18,border:"none",cursor:busy?"wait":"pointer",background:"linear-gradient(135deg,#25D366,#20BA5A)",color:"#fff",display:"flex",alignItems:"center",gap:12,padding:"0 20px",boxShadow:"0 4px 16px rgba(37,211,102,.3)",opacity:busy?.7:1}}>
            <div style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💬</div>
            <div style={{flex:1,textAlign:isHe?"right":"left"}}>
              <div style={{fontSize:15,fontWeight:800}}>{busy?(isHe?"מכין תמונה...":"Creating..."):isHe?"שתף בוואטסאפ":"Share on WhatsApp"}</div>
              {!busy&&<div style={{fontSize:10,opacity:.7,marginTop:1}}>{isHe?"כל המודעות בתמונה אחת":"All listings in one image"}</div>}
            </div>
            <div style={{fontSize:16,opacity:.6}}>{isHe?"←":"→"}</div>
          </button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button type="button" onClick={handleDownload} disabled={busy} style={{height:52,borderRadius:16,border:"1px solid rgba(26,58,143,.12)",cursor:busy?"wait":"pointer",background:"rgba(26,58,143,.05)",color:navy,display:"flex",alignItems:"center",gap:10,padding:"0 16px",opacity:busy?.7:1}}>
              <div style={{width:30,height:30,borderRadius:8,background:"rgba(26,58,143,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⬇</div>
              <div style={{fontSize:12,fontWeight:750}}>{busy?"...":isHe?"הורד תמונה":"Download"}</div>
            </button>
            <button type="button" onClick={handleCopy} style={{height:52,borderRadius:16,border:"1px solid #e8edf5",cursor:"pointer",background:"#f8f9fc",color:copied?teal:"#475569",display:"flex",alignItems:"center",gap:10,padding:"0 16px"}}>
              <div style={{width:30,height:30,borderRadius:8,background:"#fff",border:"1px solid #e8edf5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{copied?"✓":"🔗"}</div>
              <div style={{fontSize:12,fontWeight:750}}>{copied?(isHe?"הועתק!":"Copied!"):isHe?"העתק קישור":"Copy link"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
