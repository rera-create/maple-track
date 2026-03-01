import { useState, useEffect, useRef } from "react";

// ── Animated background — base + floating dust only ─────────────────────────
function Background() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const PI2 = Math.PI * 2;

    // no dust here — rendered in SidebarDust component above sidebar

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Warm near-black base
      ctx.fillStyle = "#0F0C06";
      ctx.fillRect(0, 0, W, H);
      const warm = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, W*0.7);
      warm.addColorStop(0,  "rgba(55,42,12,0.20)");
      warm.addColorStop(0.6,"rgba(32,24, 6,0.08)");
      warm.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = warm; ctx.fillRect(0, 0, W, H);



      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
}


// ── Dust canvas rendered inside the sidebar, above sidebar content ────────────
function SidebarDust({ enabled }) {
  const canvasRef = useRef(null);
  const enabledRef = useRef(enabled);
  const drawRef = useRef(null);
  useEffect(() => {
    enabledRef.current = enabled;
    if (enabled && drawRef.current) drawRef.current();
  }, [enabled]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const PI2 = Math.PI * 2;

    const dust = Array.from({length: 120}, () => ({
      x:  Math.random(),
      y:  Math.random(),
      r:  0.2 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.00008,
      vy: -(0.00014 + Math.random() * 0.00024),
      ph: Math.random() * PI2,
      al: 0.10 + Math.random() * 0.35,
    }));

    let t = 0;
    const draw = () => {
      drawRef.current = draw;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const d of dust) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.01) { d.y = 1.01; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;

        // Brighter near the two light bars (top: 22px, bottom: 22px)
        const nearTop = Math.max(0, 1 - Math.abs(d.y * H - 22)  / 80);
        const nearBtm = Math.max(0, 1 - Math.abs(d.y * H - (H - 22)) / 80);
        const boost   = 1 + (nearTop + nearBtm) * 2.8;
        const shimmer = 0.35 + 0.65 * Math.sin(t * 0.0020 + d.ph);
        const al = d.al * shimmer * boost;
        if (al < 0.008) continue;

        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, PI2);
        ctx.fillStyle = `rgba(255,254,227,${Math.min(al, 0.90)})`;
        ctx.fill();
      }

      t++;
      if (enabledRef.current) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        zIndex: 5, pointerEvents: "none",
      }}
    />
  );
}


// ── Magic circle — extravagant, shining, with color ─────────────────────────
function Circuitry({ enabled }) {
  const canvasRef = useRef(null);
  const enabledRef = useRef(enabled);
  const drawRef = useRef(null);
  useEffect(() => {
    enabledRef.current = enabled;
    if (enabled && drawRef.current) drawRef.current();
  }, [enabled]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const PI2 = Math.PI * 2;

    const OUTER  = "ΩΧΞΦΨΛΣΔΘΓΠΒΩΧΞΦΨΛΣΔΘΓΠΒΩΧΞΦΨΛΣΔΘΓΠΒΩΧΞΦΨΛΣ".split("");
    const MIDDLE = "ʕΩXΩʕΨΦʃΛΣΔΘΓΠΒΩΧΞΦΨΛΣΔΘΓΠΒΩΧΞΦΨΛΣ".split("");
    const INNER  = "ΩΧΞΦΨΛΣΔΘΓΠΒΩΧΞΦΨΛΣΔ".split("");

    // Color palette — warm gold + touches of amber and pale yellow-white
    const C = {
      bright:  (a) => `rgba(255,254,227,${a})`,       // #FFFEE3 near-white gold
      gold:    (a) => `rgba(255,220,80,${a})`,         // warm gold
      amber:   (a) => `rgba(255,185,40,${a})`,         // deep amber accent
      glow:    (a) => `rgba(255,240,150,${a})`,        // soft glow yellow
    };

    // Shimmer glow helper — draws a blurred halo around a shape
    const glowLine = (drawFn, color, blur, alpha) => {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = blur;
      ctx.globalAlpha = alpha;
      drawFn();
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const arcText = (chars, r, rotOffset, size, alpha) => {
      const step = PI2 / chars.length;
      ctx.font = `${size}px serif`;
      ctx.fillStyle = C.bright(alpha);
      ctx.shadowColor = C.gold(0.8);
      ctx.shadowBlur  = 6;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      chars.forEach((ch, i) => {
        const a = rotOffset + step * i;
        ctx.save();
        ctx.rotate(a); ctx.translate(0,-r);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });
      ctx.shadowBlur = 0;
    };

    // Ornate symmetrical lance — layered with filigree details
    const drawSpear = (ctx, len, baseW, alpha) => {
      const a = alpha;
      ctx.save();

      // ── Outer glow pass ──
      ctx.shadowColor = C.gold(0.9);
      ctx.shadowBlur  = 18;

      // Main spearhead — elegant diamond with stepped shoulders
      ctx.beginPath();
      ctx.moveTo(0, 0);                         // tip
      ctx.lineTo( baseW*0.55, len*0.12);
      ctx.lineTo( baseW*0.90, len*0.22);        // widest point — stepped shoulder
      ctx.lineTo( baseW*0.70, len*0.32);
      ctx.lineTo( baseW*0.40, len*0.52);        // narrowing toward base
      ctx.lineTo( baseW*0.18, len*0.72);
      ctx.lineTo(0,           len*0.88);        // base tip
      ctx.lineTo(-baseW*0.18, len*0.72);
      ctx.lineTo(-baseW*0.40, len*0.52);
      ctx.lineTo(-baseW*0.70, len*0.32);
      ctx.lineTo(-baseW*0.90, len*0.22);
      ctx.lineTo(-baseW*0.55, len*0.12);
      ctx.closePath();
      ctx.fillStyle   = C.amber(a * 0.10);
      ctx.strokeStyle = C.bright(a);
      ctx.lineWidth   = 0.9;
      ctx.fill(); ctx.stroke();

      ctx.shadowBlur = 0;

      // ── Inner spine — central glow line ──
      ctx.beginPath();
      ctx.moveTo(0, len*0.03);
      ctx.lineTo(0, len*0.85);
      ctx.strokeStyle = C.glow(a * 0.7);
      ctx.lineWidth   = 0.7;
      ctx.stroke();

      // ── Side filigree fins at shoulder level ──
      // Left fin
      ctx.save();
      ctx.shadowColor = C.amber(0.7); ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo( baseW*0.70, len*0.32);
      ctx.lineTo( baseW*1.45, len*0.24);   // sweeps outward
      ctx.lineTo( baseW*1.65, len*0.30);
      ctx.lineTo( baseW*1.30, len*0.40);
      ctx.lineTo( baseW*0.70, len*0.32);
      ctx.fillStyle   = C.amber(a * 0.08);
      ctx.strokeStyle = C.bright(a * 0.75);
      ctx.lineWidth   = 0.7;
      ctx.fill(); ctx.stroke();
      // Right fin (mirror)
      ctx.scale(-1, 1);
      ctx.beginPath();
      ctx.moveTo( baseW*0.70, len*0.32);
      ctx.lineTo( baseW*1.45, len*0.24);
      ctx.lineTo( baseW*1.65, len*0.30);
      ctx.lineTo( baseW*1.30, len*0.40);
      ctx.lineTo( baseW*0.70, len*0.32);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Cross-guard bar at 28% down ──
      ctx.beginPath();
      ctx.moveTo(-baseW*0.90, len*0.28);
      ctx.lineTo( baseW*0.90, len*0.28);
      ctx.strokeStyle = C.bright(a * 0.55);
      ctx.lineWidth   = 0.6;
      ctx.stroke();
      // Guard end nodes
      [-baseW*0.90, baseW*0.90].forEach(x => {
        ctx.beginPath();
        ctx.arc(x, len*0.28, 1.3, 0, PI2);
        ctx.fillStyle = C.gold(a * 0.8);
        ctx.fill();
      });

      // ── Second cross-guard at 55% ──
      ctx.beginPath();
      ctx.moveTo(-baseW*0.42, len*0.55);
      ctx.lineTo( baseW*0.42, len*0.55);
      ctx.strokeStyle = C.bright(a * 0.40);
      ctx.lineWidth   = 0.5;
      ctx.stroke();

      // ── Ornamental diamond node at mid-shaft (44%) ──
      ctx.save();
      ctx.translate(0, len*0.44);
      ctx.shadowColor = C.gold(0.9); ctx.shadowBlur = 8;
      const dn = baseW * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, -dn); ctx.lineTo(dn*0.6, 0); ctx.lineTo(0, dn); ctx.lineTo(-dn*0.6, 0);
      ctx.closePath();
      ctx.fillStyle   = C.glow(a * 0.35);
      ctx.strokeStyle = C.bright(a * 0.85);
      ctx.lineWidth   = 0.65;
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Small diamond node at shoulder inflection (32%) ──
      ctx.save();
      ctx.translate(0, len*0.32);
      const sn = baseW * 0.12;
      ctx.beginPath();
      ctx.moveTo(0, -sn); ctx.lineTo(sn*0.6, 0); ctx.lineTo(0, sn); ctx.lineTo(-sn*0.6, 0);
      ctx.closePath();
      ctx.fillStyle   = C.amber(a * 0.4);
      ctx.strokeStyle = C.bright(a * 0.6);
      ctx.lineWidth   = 0.5;
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // ── Tip accent — tiny starburst ──
      ctx.save();
      ctx.translate(0, len*0.04);
      ctx.shadowColor = C.glow(1); ctx.shadowBlur = 10;
      for(let i=0;i<4;i++){
        const angle = (PI2/4)*i;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(angle)*baseW*0.30, Math.sin(angle)*baseW*0.30);
        ctx.strokeStyle = C.bright(a*0.55);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.restore();
    };

    const drawStar = (ctx, r1, r2, alpha, fill=true) => {
      ctx.shadowColor = C.gold(1.0);
      ctx.shadowBlur  = 18;
      ctx.beginPath();
      for(let i=0;i<8;i++){
        const a=(PI2/8)*i-Math.PI/4, r=i%2===0?r1:r2;
        i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
      }
      ctx.closePath();
      if(fill){ctx.fillStyle=C.glow(alpha*0.9);ctx.fill();}
      ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=1.0; ctx.stroke();
      ctx.shadowBlur=0;
    };

    const drawStar8 = (ctx, r1, r2, alpha) => {
      drawStar(ctx,r1,r2,alpha,true);
      ctx.save(); ctx.rotate(Math.PI/4);
      drawStar(ctx,r1*0.75,r2,alpha*0.55,false);
      ctx.restore();
    };

    const drawGear = (ctx, r, alpha) => {
      ctx.shadowColor = C.amber(0.8);
      ctx.shadowBlur  = 10;
      ctx.beginPath(); ctx.arc(0,0,r,0,PI2);
      ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=1.1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,r*0.52,0,PI2);
      ctx.strokeStyle=C.gold(alpha*0.65); ctx.lineWidth=0.8; ctx.stroke();
      for(let i=0;i<4;i++){
        const a=(PI2/4)*i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*r*0.52,Math.sin(a)*r*0.52);
        ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
        ctx.strokeStyle=C.bright(alpha*0.9); ctx.lineWidth=2.2; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0,0,r*0.20,0,PI2);
      ctx.fillStyle=C.glow(alpha*0.7); ctx.fill();
      ctx.shadowBlur=0;
    };

    const drawBracket = (ctx, w, h, alpha) => {
      ctx.beginPath();
      ctx.moveTo(-w,0); ctx.lineTo(-w,-h); ctx.lineTo(w,-h); ctx.lineTo(w,0);
      ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=0.8; ctx.stroke();
    };

    // Draw a glowing circle arc
    const glowArc = (r, color, blur, lw, alpha) => {
      ctx.shadowColor = color; ctx.shadowBlur = blur;
      ctx.beginPath(); ctx.arc(0,0,r,0,PI2);
      ctx.strokeStyle = C.bright(alpha); ctx.lineWidth = lw; ctx.stroke();
      ctx.shadowBlur = 0;
    };

    let rot=0;
    const draw = () => {
      drawRef.current = draw;
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.lineCap="round"; ctx.lineJoin="round";

      const cx=W*0.50, cy=H*0.50;
      const R=Math.min(W,H)*0.40;

      // Helper: draw a regular polygon
      const drawPoly = (n, r, alpha, lw=0.7) => {
        ctx.beginPath();
        for(let i=0;i<n;i++){
          const a=(PI2/n)*i-Math.PI/2;
          i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
        }
        ctx.closePath();
        ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=lw; ctx.stroke();
      };

      // Helper: draw an arcane sigil (small rune-like cross/arrow)
      const drawSigil = (size, alpha) => {
        ctx.beginPath();
        ctx.moveTo(0,-size); ctx.lineTo(0,size);
        ctx.moveTo(-size,0); ctx.lineTo(size,0);
        ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=0.5; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size*0.5,-size*0.5); ctx.lineTo(size*0.5,-size*0.5);
        ctx.moveTo(-size*0.5, size*0.5); ctx.lineTo(size*0.5, size*0.5);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,size*0.28,0,PI2);
        ctx.strokeStyle=C.gold(alpha*0.7); ctx.lineWidth=0.4; ctx.stroke();
      };

      // Helper: radial line burst
      const drawBurst = (r1, r2, count, alpha) => {
        for(let i=0;i<count;i++){
          const a=(PI2/count)*i;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);
          ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);
          ctx.strokeStyle=C.bright(alpha); ctx.lineWidth=0.5; ctx.stroke();
        }
      };


      // ════════════════════════════════════════════════════════════════════
      // ── OUTERMOST LETTER RING ─────────────────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot*0.05);

      const Rmid=R*0.94;
      const Ro=Rmid+8, Ri=Rmid-8;

      // Three concentric boundary rings
      glowArc(Ro+14, C.amber(0.6), 6, 0.4, 0.08);
      glowArc(Ro,    C.gold(1),   22, 1.6, 0.50);
      glowArc(Ri,    C.gold(1),   10, 1.0, 0.28);
      glowArc(Ri-10, C.amber(0.4), 4, 0.4, 0.10);

      // Outer tick marks — 3 sizes
      for(let i=0;i<120;i++){
        const a=(PI2/120)*i;
        const major=i%15===0, semi=i%5===0;
        const len=major?14:semi?7:3;
        const alp=major?0.70:semi?0.35:0.12;
        ctx.shadowColor=major?C.gold(1):"transparent"; ctx.shadowBlur=major?9:0;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*Ro,Math.sin(a)*Ro);
        ctx.lineTo(Math.cos(a)*(Ro+len),Math.sin(a)*(Ro+len));
        ctx.strokeStyle=C.bright(alp); ctx.lineWidth=major?1.0:0.6; ctx.stroke();
      }
      ctx.shadowBlur=0;

      // Inner tick marks (inside Ri, pointing inward)
      for(let i=0;i<48;i++){
        const a=(PI2/48)*i;
        const len=i%8===0?8:i%4===0?4:2;
        const alp=i%8===0?0.35:i%4===0?0.18:0.08;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*Ri,Math.sin(a)*Ri);
        ctx.lineTo(Math.cos(a)*(Ri-len),Math.sin(a)*(Ri-len));
        ctx.strokeStyle=C.bright(alp); ctx.lineWidth=0.5; ctx.stroke();
      }

      arcText(OUTER, Rmid, -Math.PI/2, 14, 0.80);

      // ── 8 Ornate Lances radiating outward ────────────────────────────
      const spikeA=Array.from({length:8},(_,i)=>(PI2/8)*i-Math.PI/2);
      spikeA.forEach((a,i)=>{
        const isCard=i%2===0;
        ctx.save(); ctx.rotate(a); ctx.translate(0,-Ro-4);
        drawSpear(ctx, isCard?R*0.52:R*0.32, isCard?11:8, isCard?0.70:0.52);
        ctx.restore();
      });
      // Crown stars at tips of cardinal lances
      spikeA.filter((_,i)=>i%2===0).forEach(a=>{
        ctx.save(); ctx.rotate(a); ctx.translate(0,-(Ro+6+R*0.52));
        drawStar8(ctx,28,9,0.82);
        ctx.restore();
      });
      // Smaller stars at intercardinal lance tips
      spikeA.filter((_,i)=>i%2!==0).forEach(a=>{
        ctx.save(); ctx.rotate(a); ctx.translate(0,-(Ro+6+R*0.32));
        drawStar(ctx,20,7,0.65);
        ctx.restore();
      });
      // Gear medallions between lances
      for(let i=0;i<8;i++){
        const a=(PI2/8)*i-Math.PI/2+Math.PI/16;
        ctx.save();
        ctx.translate(Math.cos(a)*(Ro+R*0.12),Math.sin(a)*(Ro+R*0.12));
        drawGear(ctx,R*0.065,0.42);
        ctx.restore();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── GEODESIC BAND — rotating hexagon + 12-gon frame ─────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(-rot*0.08);
      const Rhex=R*0.85;
      ctx.shadowColor=C.amber(0.3); ctx.shadowBlur=5;
      drawPoly(12, Rhex, 0.18, 0.6);
      ctx.shadowBlur=0;
      // Chord lines across the 12-gon (every other vertex connected)
      ctx.beginPath();
      for(let i=0;i<12;i++){
        const a1=(PI2/12)*i-Math.PI/2, a2=(PI2/12)*(i+4)-Math.PI/2;
        ctx.moveTo(Math.cos(a1)*Rhex,Math.sin(a1)*Rhex);
        ctx.lineTo(Math.cos(a2)*Rhex,Math.sin(a2)*Rhex);
      }
      ctx.strokeStyle=C.bright(0.07); ctx.lineWidth=0.5; ctx.stroke();
      // Small diamond nodes at each vertex of 12-gon
      for(let i=0;i<12;i++){
        const a=(PI2/12)*i-Math.PI/2;
        ctx.save();
        ctx.translate(Math.cos(a)*Rhex,Math.sin(a)*Rhex);
        ctx.rotate(a+Math.PI/2);
        const dn=3.5;
        ctx.beginPath();
        ctx.moveTo(0,-dn); ctx.lineTo(dn*0.5,0); ctx.lineTo(0,dn); ctx.lineTo(-dn*0.5,0);
        ctx.closePath();
        ctx.fillStyle=C.amber(0.30);
        ctx.strokeStyle=C.bright(0.45); ctx.lineWidth=0.5;
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── OUTER-MIDDLE RING WITH SEGMENTS ──────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(-rot*0.10);
      const R1b=R*0.74;
      // Three rings in the band
      ctx.shadowColor=C.amber(0.5); ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(0,0,R1b,0,PI2);
      ctx.strokeStyle=C.bright(0.28); ctx.lineWidth=1.1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,R1b*0.935,0,PI2);
      ctx.strokeStyle=C.bright(0.18); ctx.lineWidth=0.7; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,R1b*0.870,0,PI2);
      ctx.strokeStyle=C.bright(0.10); ctx.lineWidth=0.5; ctx.stroke();
      ctx.shadowBlur=0;
      // Arc segments — dashed pill shapes
      for(let i=0;i<24;i++){
        const a1=(PI2/24)*i, a2=a1+(PI2/24)*0.50;
        ctx.beginPath(); ctx.arc(0,0,R1b*0.952,a1,a2);
        ctx.strokeStyle=C.gold(0.40); ctx.lineWidth=2.4; ctx.stroke();
      }
      // Radial spokes connecting outer/inner ring of this band at 12 positions
      for(let i=0;i<12;i++){
        const a=(PI2/12)*i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*R1b*0.87,Math.sin(a)*R1b*0.87);
        ctx.lineTo(Math.cos(a)*R1b*1.00,Math.sin(a)*R1b*1.00);
        ctx.strokeStyle=C.bright(0.22); ctx.lineWidth=0.8; ctx.stroke();
      }
      // Brackets at 6 positions
      for(let i=0;i<6;i++){
        const a=(PI2/6)*i;
        ctx.save(); ctx.rotate(a); ctx.translate(0,-R1b*0.952);
        drawBracket(ctx,6,5,0.40);
        ctx.restore();
      }
      // Sigils at 3 positions
      for(let i=0;i<3;i++){
        const a=(PI2/3)*i+Math.PI/6;
        ctx.save();
        ctx.translate(Math.cos(a)*R1b*0.952,Math.sin(a)*R1b*0.952);
        ctx.rotate(a+Math.PI/2);
        drawSigil(5,0.30);
        ctx.restore();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── ROTATING HEXAGRAM FRAME ───────────────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot*0.07);
      const Rhg=R*0.67;
      // Star of David style — two overlapping triangles
      ctx.shadowColor=C.gold(0.5); ctx.shadowBlur=8;
      [0, Math.PI/3].forEach((offset,ti)=>{
        ctx.beginPath();
        for(let i=0;i<3;i++){
          const a=(PI2/3)*i+offset-Math.PI/2;
          i===0?ctx.moveTo(Math.cos(a)*Rhg,Math.sin(a)*Rhg):ctx.lineTo(Math.cos(a)*Rhg,Math.sin(a)*Rhg);
        }
        ctx.closePath();
        ctx.strokeStyle=C.bright(ti===0?0.22:0.15); ctx.lineWidth=0.8; ctx.stroke();
      });
      ctx.shadowBlur=0;
      // Hexagon connecting the 6 hexagram points
      drawPoly(6, Rhg, 0.12, 0.5);
      // Small accent circles at each of the 6 points
      for(let i=0;i<6;i++){
        const a=(PI2/6)*i-Math.PI/2;
        ctx.beginPath(); ctx.arc(Math.cos(a)*Rhg,Math.sin(a)*Rhg,3,0,PI2);
        ctx.strokeStyle=C.gold(0.5); ctx.lineWidth=0.6; ctx.stroke();
        ctx.fillStyle=C.amber(0.15); ctx.fill();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── MIDDLE LETTER RING ────────────────────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot*0.15);
      const R2mid=R*0.58;
      const R2o=R2mid+5.5, R2i=R2mid-5.5;
      ctx.shadowColor=C.gold(0.7); ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(0,0,R2o,0,PI2);
      ctx.strokeStyle=C.bright(0.38); ctx.lineWidth=1.3; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,R2i,0,PI2);
      ctx.strokeStyle=C.bright(0.22); ctx.lineWidth=0.8; ctx.stroke();
      // Extra hairline outside
      ctx.beginPath(); ctx.arc(0,0,R2o+7,0,PI2);
      ctx.strokeStyle=C.amber(0.12); ctx.lineWidth=0.4; ctx.stroke();
      ctx.shadowBlur=0;
      arcText(MIDDLE,R2mid,-Math.PI/2,9,0.68);
      // 4 mini lances between letter ring and hexagram
      for(let i=0;i<4;i++){
        const a=(PI2/4)*i;
        ctx.save(); ctx.rotate(a); ctx.translate(0,-R2o-2);
        drawSpear(ctx,R*0.14,5,0.45);
        ctx.restore();
      }
      // 8 tick marks
      for(let i=0;i<32;i++){
        const a=(PI2/32)*i;
        if(i%4===0){
          ctx.beginPath();
          ctx.moveTo(Math.cos(a)*R2o,Math.sin(a)*R2o);
          ctx.lineTo(Math.cos(a)*(R2o+5),Math.sin(a)*(R2o+5));
          ctx.strokeStyle=C.bright(0.28); ctx.lineWidth=0.6; ctx.stroke();
        }
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── PENTAGRAM FRAME — counter-rotates ─────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(-rot*0.12);
      const Rpent=R*0.50;
      ctx.shadowColor=C.amber(0.3); ctx.shadowBlur=6;
      // Pentagon outline
      drawPoly(5, Rpent, 0.13, 0.5);
      // Pentagram star lines
      ctx.beginPath();
      const ppts=Array.from({length:5},(_,i)=>{
        const a=(PI2/5)*i-Math.PI/2;
        return [Math.cos(a)*Rpent,Math.sin(a)*Rpent];
      });
      // Connect every other vertex for pentagram
      [0,2,4,1,3,0].forEach((vi,i)=>{
        i===0?ctx.moveTo(ppts[vi][0],ppts[vi][1]):ctx.lineTo(ppts[vi][0],ppts[vi][1]);
      });
      ctx.strokeStyle=C.bright(0.14); ctx.lineWidth=0.6; ctx.stroke();
      ctx.shadowBlur=0;
      // Tiny glyphs at each pentagon vertex
      for(let i=0;i<5;i++){
        const a=(PI2/5)*i-Math.PI/2;
        ctx.save();
        ctx.translate(Math.cos(a)*Rpent,Math.sin(a)*Rpent);
        ctx.rotate(a+Math.PI/2);
        drawSigil(4.5,0.28);
        ctx.restore();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── INNER LETTER RING ─────────────────────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(-rot*0.22);
      const R3mid=R*0.405;
      const R3o=R3mid+5, R3i=R3mid-5;
      ctx.shadowColor=C.gold(0.6); ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(0,0,R3o,0,PI2);
      ctx.strokeStyle=C.bright(0.32); ctx.lineWidth=1.0; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,R3i,0,PI2);
      ctx.strokeStyle=C.bright(0.20); ctx.lineWidth=0.7; ctx.stroke();
      // Extra thin outer ring
      ctx.beginPath(); ctx.arc(0,0,R3o+6,0,PI2);
      ctx.strokeStyle=C.amber(0.10); ctx.lineWidth=0.4; ctx.stroke();
      ctx.shadowBlur=0;
      arcText(INNER,R3mid,-Math.PI/2,8,0.62);
      // Radial burst between inner and middle rings
      drawBurst(R3o+1, R2i-5, 24, 0.08);
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── SQUARE + DIAMOND FRAME ────────────────────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot*0.18);
      const Rsq=R*0.325;
      ctx.shadowColor=C.gold(0.4); ctx.shadowBlur=7;
      drawPoly(4, Rsq, 0.22, 0.7);          // square
      ctx.rotate(Math.PI/4);
      drawPoly(4, Rsq*0.88, 0.12, 0.5);     // rotated inner square = diamond
      ctx.shadowBlur=0;
      // Corner nodes on outer square
      for(let i=0;i<4;i++){
        const a=(PI2/4)*i-Math.PI/2;
        ctx.beginPath(); ctx.arc(Math.cos(a)*Rsq,Math.sin(a)*Rsq,2.5,0,PI2);
        ctx.fillStyle=C.gold(0.55); ctx.fill();
        ctx.strokeStyle=C.bright(0.70); ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── INNERMOST DASHED RING + SEGMENTED ARC ────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(rot*0.32);
      const R4=R*0.26;
      ctx.shadowColor=C.amber(0.6); ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(0,0,R4,0,PI2);
      ctx.strokeStyle=C.bright(0.32); ctx.lineWidth=1.0; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,R4*0.82,0,PI2);
      ctx.strokeStyle=C.bright(0.14); ctx.lineWidth=0.5; ctx.stroke();
      ctx.shadowBlur=0;
      // Segmented arcs
      for(let i=0;i<20;i++){
        const a1=(PI2/20)*i, a2=a1+(PI2/20)*0.48;
        ctx.beginPath(); ctx.arc(0,0,R4,a1,a2);
        ctx.strokeStyle=C.gold(0.48); ctx.lineWidth=2.2; ctx.stroke();
      }
      // 4 inward micro-lances
      for(let i=0;i<4;i++){
        const a=(PI2/4)*i;
        ctx.save(); ctx.rotate(a+Math.PI); ctx.translate(0,-R4+2);
        drawSpear(ctx,R*0.07,3.5,0.38);
        ctx.restore();
      }
      // Radial lines from center to innermost ring (like a compass rose)
      for(let i=0;i<8;i++){
        const a=(PI2/8)*i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*R4*0.20,Math.sin(a)*R4*0.20);
        ctx.lineTo(Math.cos(a)*R4*0.80,Math.sin(a)*R4*0.80);
        ctx.strokeStyle=C.bright(0.12); ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();


      // ════════════════════════════════════════════════════════════════════
      // ── CENTRAL COMPLEX — layered stars + orb ────────────────────────
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      ctx.translate(cx,cy);

      // Outer star slowly CCW
      ctx.save(); ctx.rotate(-rot*0.40);
      drawStar8(ctx,R*0.155,R*0.055,0.70);
      ctx.restore();

      // Inner star faster CW
      ctx.save(); ctx.rotate(rot*0.70);
      drawStar(ctx,R*0.095,R*0.035,0.60,true);
      ctx.restore();

      // Central glowing orb
      ctx.shadowColor=C.glow(1); ctx.shadowBlur=20;
      const orbGrad=ctx.createRadialGradient(0,0,0,0,0,R*0.055);
      orbGrad.addColorStop(0,C.bright(0.75));
      orbGrad.addColorStop(0.5,C.gold(0.45));
      orbGrad.addColorStop(1,C.amber(0));
      ctx.beginPath(); ctx.arc(0,0,R*0.055,0,PI2);
      ctx.fillStyle=orbGrad; ctx.fill();
      ctx.shadowBlur=0;

      // 4-axis crosshair lines through center
      ctx.save(); ctx.rotate(rot*0.25);
      for(let i=0;i<4;i++){
        const a=(PI2/4)*i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*R*0.06,Math.sin(a)*R*0.06);
        ctx.lineTo(Math.cos(a)*R*0.22,Math.sin(a)*R*0.22);
        ctx.strokeStyle=C.bright(0.18); ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();

      ctx.restore();


      rot+=0.010;
      if (enabledRef.current) raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return (
    <canvas ref={canvasRef} style={{
      position:"absolute",inset:0,width:"100%",height:"100%",
      zIndex:0,pointerEvents:"none",opacity:0.72,
    }}/>
  );
}


// ── Placeholder page — consistent shell for pages not yet built ───────────────
function PlaceholderPage({ title, sub, icon, desc }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 24, padding: 48,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 48, opacity: 0.6 }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52, letterSpacing: "0.06em",
          color: "rgba(255,254,227,0.85)",
          lineHeight: 1,
          textShadow: "0 0 40px rgba(255,220,80,0.25)",
        }}>{title}</div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9,
          letterSpacing: "0.28em", textTransform: "uppercase",
          color: "rgba(240,220,128,0.55)", marginTop: 8,
        }}>{sub} · Coming Soon</div>
      </div>
      <div style={{
        maxWidth: 320, fontSize: 12, lineHeight: 1.7,
        color: "rgba(255,255,255,0.30)",
        fontFamily: "var(--mono)",
      }}>{desc}</div>
      <div style={{
        width: 120, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(240,220,128,0.4), transparent)",
      }}/>
    </div>
  );
}

// Swap this for your R2 public bucket URL when ready
const IMG_BASE = "https://pub-2f8b565f5d5e4601814c638f74967ba9.r2.dev";

const characters = [
  { name: "Yunli",    cls: "Ren",          type: "Warrior",  level: 288, badge: "Main",         img: "ren"       },
  { name: "Lecia",    cls: "Hero",         type: "Warrior",  level: 287, badge: "Farming",      img: "hero"      },
  { name: "Gremory",  cls: "Cadena",       type: "Thief",    level: 270, badge: "Farming",      img: "cadena"    },
  { name: "Guilty",   cls: "Bishop",       type: "Magician", level: 268, badge: "Farming",      img: "bishop"    },
  { name: "Iono",     cls: "Lynn",         type: "Magician", level: 263, badge: "Farming",      img: "lynn"      },
  { name: "Yutet",    cls: "Demon Slayer", type: "Warrior",  level: 262, badge: "In Progress",  img: "ds"        },
  { name: "Kisaki",   cls: "Khali",        type: "Thief",    level: 260, badge: "In Progress",  img: "khali"     },
  { name: "Kasel",    cls: "Kanna",        type: "Magician", level: 260, badge: "In Progress",  img: "kanna"     },
  { name: "Filene",   cls: "Fire/Poison",  type: "Mage",     level: 260, badge: "In Progress",  img: "fp"        },
  { name: "Aijou",    cls: "Battle Mage",  type: "Magician", level: 260, badge: "In Progress",  img: "bam"       },
  { name: "Fuyuko",   cls: "Aran",         type: "Warrior",  level: 260, badge: "In Progress",  img: "aran"      },
  { name: "Solais",   cls: "Sia Astelle",  type: "Magician", level: 253, badge: "In Progress",  img: "sia"       },
  { name: "Cordelia", cls: "Adele",        type: "Warrior",  level: 252, badge: "In Progress",  img: "adele"     },
  { name: "Ramizel",  cls: "Lara",         type: "Magician", level: 251, badge: "In Progress",  img: "lara"      },
  { name: "Yubel",    cls: "Shade",        type: "Warrior",  level: 251, badge: "In Progress",  img: "shade"     },
  { name: "Ramuh",    cls: "Buccaneer",    type: "Pirate",   level: 250, badge: "In Progress",  img: "buccaneer" },
];

const TIER = {
  Main:  { label: "Legendary", dim: "rgba(0,180,0,0.55)",    lit: "#7eff7e" },
  Farming:        { label: "Unique",    dim: "rgba(220,160,0,0.55)",  lit: "#ffe080" },
  "In Progress":  { label: "Epic",      dim: "rgba(160,80,255,0.55)", lit: "#c89fff" },
};

const JOB_HUE = {
  Warrior: 350, Thief: 270, Magician: 210, Mage: 210, Pirate: 38,
};

const G      = "#F0DC80";   // luminescent pale gold — the edge color
const G_DIM  = "rgba(240,220,128,0.18)";
const G_GLOW = "rgba(240,220,128,0.7)";

// A single prism card — the card face IS the monolith face
// Gold lines the edges and optionally bisects the face vertically
function PrismCard({ char, index, isSel, isHov, onClick, onEnter, onLeave }) {
  const tier  = TIER[char.badge];
  const hue   = JOB_HUE[char.type] ?? JOB_HUE.Magician;
  const lit   = isSel || isHov;
  const [imgErr, setImgErr] = useState(false);

  // Which cards get the center seam (every 3rd)
  const hasSeam = index % 3 === 1;

  const edgeOpacity  = lit ? 1   : 0.22;
  const glowStrength = lit ? "drop-shadow(0 0 4px rgba(240,220,128,0.9)) drop-shadow(0 0 12px rgba(240,220,128,0.5))" : "none";

  const isMain = char.badge === "Main";
  const riseDelay = `${index * 0.03 + 0.06}s`;

  return (
    <div
      className={`prism${isSel ? " sel" : ""}${isMain ? " is-main" : ""}`}
      style={{ animationDelay: riseDelay, "--rise-delay": riseDelay }}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ── Edge geometry — SVG overlay traces the prism edges ── */}
      <svg className="edges" viewBox="0 0 100 160" preserveAspectRatio="none">
        <defs>
          <filter id={`eg${index}`} x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur stdDeviation={lit ? "2" : "0.5"} result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Four bounding edges of the prism face */}
        {/* Left edge — full height, primary structural line */}
        <line x1="0" y1="0" x2="0" y2="160"
          stroke={G} strokeWidth={lit ? "1.5" : "0.8"}
          opacity={edgeOpacity}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Top edge */}
        <line x1="0" y1="0" x2="100" y2="0"
          stroke={G} strokeWidth={lit ? "1.2" : "0.7"}
          opacity={edgeOpacity * 0.85}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Right edge — subtler, suggests depth */}
        <line x1="100" y1="0" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "0.9" : "0.5"}
          opacity={edgeOpacity * 0.6}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Bottom edge */}
        <line x1="0" y1="160" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "1.0" : "0.6"}
          opacity={edgeOpacity * 0.7}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />

        {/* Corner nodes — where edges meet */}
        {[[0,0],[100,0],[0,160],[100,160]].map(([cx,cy],i) => (
          <rect key={i}
            x={cx === 0 ? 0 : cx - 3} y={cy === 0 ? 0 : cy - 3}
            width="3" height="3"
            fill={G}
            opacity={lit ? 0.95 : 0.25}
            filter={lit ? `url(#eg${index})` : undefined}
            style={{ transition: "opacity .15s ease" }}
          />
        ))}

        {/* Center vertical seam — runs down the middle of the face */}
        {hasSeam && (
          <line x1="50" y1="0" x2="50" y2="160"
            stroke={G} strokeWidth={lit ? "0.7" : "0.3"}
            opacity={lit ? 0.45 : 0.08}
            filter={`url(#eg${index})`}
            strokeDasharray={lit ? "none" : "4 6"}
            style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
          />
        )}

        {/* Horizontal divider — one third down, separates avatar zone */}
        <line x1="0" y1="72" x2="100" y2="72"
          stroke={G} strokeWidth={lit ? "0.8" : "0.4"}
          opacity={lit ? 0.50 : 0.10}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Node on the divider — left side */}
        <rect x="0" y="70" width="3" height="3"
          fill={G} opacity={lit ? 0.8 : 0.15}
          filter={lit ? `url(#eg${index})` : undefined}
          style={{ transition: "opacity .15s ease" }}
        />
      </svg>

      {/* ── Inner glow: the prism radiates light from within ── */}
      <div className="prism-glow" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 35%,
          rgba(240,220,128,${lit ? "0.07" : "0.02"}) 0%, transparent 70%)`,
        transition: "background .18s ease",
      }}/>

      {/* ── Card content ── */}
      <div className="prism-body">

        {/* Sprite — overflows top and sides, anchored to bottom of upper zone */}
        <div className="prism-sprite-wrap">
          {!imgErr ? (
            <img
              className="prism-sprite"
              src={`${IMG_BASE}/${char.img}.png`}
              alt={char.name}
              onError={() => setImgErr(true)}
            />
          ) : (
            /* Fallback initial if image not uploaded yet */
            <div className="prism-av-fallback"
              style={{ background: `hsl(${hue}deg 45% 38%)` }}>
              {char.name[0]}
            </div>
          )}
        </div>

        {/* Lower zone — data */}
        <div className="prism-lower">
          <div className="prism-tier" style={{
            color: lit ? tier.lit : tier.dim,
            filter: lit ? `drop-shadow(0 0 5px ${tier.lit})` : "none",
            transition: "color .12s, filter .12s",
          }}>
            {tier.label}
          </div>
          <div className="prism-name">{char.name}</div>
          <div className="prism-cls">{char.cls}</div>
          <div className="prism-lv">
            <span className="prism-lv-l">Lv</span>
            <span className="prism-lv-n" style={{
              color: lit ? G : "#1a1a1a",
              filter: lit ? `drop-shadow(0 0 8px ${G_GLOW})` : "none",
              transition: "color .12s, filter .12s",
            }}>{char.level}</span>
          </div>
        </div>
      </div>

      {/* Particle shimmer — only rendered on Main, CSS controls visibility */}
      {char.badge === "Main" && (
        <div className="prism-particles" aria-hidden="true">
          {[
            { tx: "-8px",  delay: "0.0s", dur: "1.0s", left: "22%" },
            { tx:  "5px",  delay: "0.3s", dur: "1.1s", left: "38%" },
            { tx: "-4px",  delay: "0.7s", dur: "0.9s", left: "50%" },
            { tx:  "9px",  delay: "0.2s", dur: "1.2s", left: "62%" },
            { tx: "-6px",  delay: "0.9s", dur: "1.0s", left: "74%" },
            { tx:  "3px",  delay: "0.5s", dur: "0.9s", left: "30%" },
            { tx: "-10px", delay: "1.1s", dur: "1.1s", left: "58%" },
            { tx:  "7px",  delay: "0.4s", dur: "1.0s", left: "44%" },
          ].map((p, i) => (
            <div key={i} className="particle" style={{
              left: p.left,
              "--tx":    p.tx,
              "--delay": p.delay,
              "--dur":   p.dur,
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const [hovered,  setHovered]  = useState(null);
  const [navPage,  setNavPage]  = useState("experience");
  const [animEnabled, setAnimEnabled] = useState(true);
  const [editingField, setEditingField] = useState(null); // 'eyebrow' | 'name'
  const [eyebrow, setEyebrow] = useState("Bera · AbyssGuild");
  const [guildName, setGuildName] = useState("Abyss\nGuild");

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const sel = selected;

  // Lock page scroll — bar must stay fixed at viewport bottom
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── Theme: Crown — deep black, warm gold ── */
        :root {
          --G:          #D4AF5A;
          --Gr:         212,175,90;
          --Gdim:       rgba(212,175,90,0.18);
          --Glo:        rgba(212,175,90,0.65);
          --bg:         #0a0804;
          --card-bg:    rgba(18,14,8,0.72);
          --card-hover: rgba(26,20,10,0.88);
          --sidebar-bg: rgba(12,10,5,0.82);
          --border:     rgba(212,175,90,0.20);
          --text:       #f0e8d0;
          --text-mid:   #a89878;
          --dim:        #6a5f4a;
          --dim2:       #3a3328;
          --nav-active-bg: rgba(212,175,90,0.10);
          --nav-active-text: #f0e8d0;
          --mono: 'DM Mono', monospace;
        }

        html, body { background: #0a0804; margin:0; padding:0; overflow:hidden; height:100vh; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--text);
          background: var(--bg);
        }

        /* Root transparent so canvas orbs show through */
        .root {
          height: 100vh;
          background: transparent;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        /* ── Root layout — full viewport, two columns ── */
        .layout {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Left panel — dashboard, fixed width ── */
        .sidebar {
          width: 380px;
          min-width: 380px;
          height: 100vh;
          background: var(--sidebar-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid var(--border);
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0; transform: translateX(-12px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .sidebar.in { opacity:1; transform:translateX(0); }

        /* TOP bar — sits just above eyebrow text, flush with sidebar */
        .sidebar::before {
          content: '';
          position: absolute;
          top: 22px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,254,227,0.95);
          box-shadow:
            0 0 4px 2px   rgba(255,254,227,1.00),
            0 0 12px 6px  rgba(252,240,175,0.70),
            0 0 30px 14px rgba(245,222,135,0.40),
            0 0 60px 28px rgba(232,205,100,0.18),
            0 0 100px 45px rgba(218,188,75,0.07);
          z-index: 10;
          pointer-events: none;
        }

        /* BOTTOM bar — mirrors top, same distance from bottom edge */
        .sidebar-floor {
          position: absolute;
          bottom: 22px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,254,227,0.95);
          box-shadow:
            0 0 4px 2px   rgba(255,254,227,1.00),
            0 0 12px 6px  rgba(252,240,175,0.70),
            0 0 30px 14px rgba(245,222,135,0.40),
            0 0 60px 28px rgba(232,205,100,0.18),
            0 0 100px 45px rgba(218,188,75,0.07);
          z-index: 10;
          pointer-events: none;
        }

        /* Gold right-edge glow on sidebar */
        .sidebar::after {
          content: '';
          position: absolute;
          top: 60px; bottom: 60px; right: -1px;
          width: 1px;
          background: linear-gradient(180deg,
            transparent,
            rgba(212,175,90,0.4) 20%,
            rgba(212,175,90,0.85) 50%,
            rgba(212,175,90,0.4) 80%,
            transparent);
          filter: drop-shadow(0 0 8px rgba(212,175,90,0.6));
        }

        /* Guild name + meta at top of sidebar */
        .sidebar-hdr {
          padding: 44px 36px 32px;
          border-bottom: 1px solid rgba(240,220,128,0.14);
          position: relative;
        }
        .sidebar-hdr::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 36px; right: 36px;
          height: 1px;
          background: linear-gradient(90deg,
            rgba(240,220,128,0.8), transparent);
          filter: drop-shadow(0 0 5px rgba(240,220,128,0.6));
        }
        .sidebar-eyebrow {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(240,220,128,0.75);
          filter: drop-shadow(0 0 5px rgba(240,220,128,0.5));
          margin-bottom: 10px;
        }
        .sidebar-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px;
          letter-spacing: .06em;
          line-height: 1;
          color: var(--text);
          text-shadow: 0 0 60px rgba(var(--Gr),0.18);
          margin-bottom: 14px;
        }
        .sidebar-meta {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sidebar-dot {
          width: 5px; height: 5px;
          background: #6ee7b7;
          box-shadow: 0 0 5px #6ee7b7, 0 0 12px rgba(110,231,183,.4);
          animation: pulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse { 0%,100%{opacity:1} 55%{opacity:.3} }
        .sidebar-server {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #bbb;
        }
        .sidebar-count {
          font-family: var(--mono);
          font-size: 9px;
          color: #bbb;
          letter-spacing: .10em;
          margin-left: auto;
        }
        .sidebar-count strong {
          color: var(--G);
          font-weight: 400;
          filter: drop-shadow(0 0 4px rgba(240,220,128,.6));
        }

        /* Inline edit fields */
        .editable-field {
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
        }
        .editable-field:hover .edit-icon { opacity: 1; }
        .edit-icon {
          font-size: 11px;
          opacity: 0;
          transition: opacity .15s;
          color: rgba(240,220,128,0.55);
          font-style: normal;
          flex-shrink: 0;
          align-self: center;
        }
        .name-edit-icon { font-size: 14px; }

        /* ── Animations toggle ── */
        .anim-toggle { user-select: none; }
        .toggle-pill {
          margin-left: auto;
          width: 30px; height: 16px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(240,220,128,0.25);
          border-radius: 8px;
          position: relative;
          flex-shrink: 0;
          transition: background .18s, border-color .18s;
          cursor: pointer;
        }
        .toggle-pill.on {
          background: rgba(240,220,128,0.22);
          border-color: rgba(240,220,128,0.60);
          box-shadow: 0 0 6px rgba(240,220,128,0.30);
        }
        .toggle-knob {
          position: absolute;
          top: 2px; left: 2px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(240,220,128,0.40);
          transition: transform .18s, background .18s;
        }
        .toggle-pill.on .toggle-knob {
          transform: translateX(14px);
          background: rgba(240,220,128,0.90);
          box-shadow: 0 0 4px rgba(240,220,128,0.6);
        }

        /* Pause all CSS animations when anim-off is set */
        .anim-off *, .anim-off *::before, .anim-off *::after {
          animation-play-state: paused !important;
          transition: none !important;
        }
        .placeholder-text {
          color: rgba(240,220,128,0.25);
          font-style: italic;
        }
        .sidebar-edit-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(240,220,128,0.45);
          outline: none;
          color: inherit;
          font-family: inherit;
          caret-color: rgba(240,220,128,0.9);
          padding: 0;
          width: 100%;
        }
        .eyebrow-input {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(240,220,128,0.75);
          margin-bottom: 10px;
          display: block;
        }
        .name-input {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 46px;
          letter-spacing: .06em;
          line-height: 1;
          color: var(--text);
          margin-bottom: 14px;
          display: block;
        }

        /* Sidebar scrollable body */
        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 0 0 40px;
        }

        /* Navigation section */
        .nav {
          padding: 28px 0 0;
        }
        .nav-section-label {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: var(--dim);
          padding: 0 36px 10px;
          opacity: 0.6;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 36px;
          cursor: pointer;
          position: relative;
          transition: background .1s ease;
          text-decoration: none;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          background: rgba(var(--Gr),0.06);
        }
        .nav-item.active {
          background: var(--nav-active-bg);
        }
        /* Gold left accent on active item */
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 2px;
          background: var(--G);
          filter: drop-shadow(0 0 5px var(--G));
        }
        /* Icon box */
        .nav-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(var(--Gr),0.15);
          flex-shrink: 0;
          transition: border-color .1s, filter .1s;
        }
        .nav-item:hover   .nav-icon,
        .nav-item.active  .nav-icon {
          border-color: rgba(var(--Gr),0.45);
          filter: drop-shadow(0 0 4px rgba(var(--Gr),0.3));
        }
        .nav-icon svg {
          width: 14px; height: 14px;
          stroke: var(--dim);
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: square;
          transition: stroke .1s;
        }
        .nav-item:hover   .nav-icon svg,
        .nav-item.active  .nav-icon svg { stroke: var(--G); }

        .nav-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-mid);
          letter-spacing: .01em;
          transition: color .1s;
        }
        .nav-item:hover  .nav-label { color: var(--text); }
        .nav-item.active .nav-label { color: var(--nav-active-text); }

        .nav-sub {
          font-family: var(--mono);
          font-size: 8px;
          color: var(--dim);
          letter-spacing: .08em;
          margin-left: auto;
        }
        .nav-item.active .nav-sub {
          color: rgba(var(--Gr),0.7);
        }

        /* Thin gold separator between nav groups */
        .nav-sep {
          height: 1px;
          margin: 14px 36px;
          background: linear-gradient(90deg, rgba(var(--Gr),0.25), transparent);
        }



        /* ── Right panel — cards + detail ── */
        .content {
          flex: 1;
          height: 100vh;
          min-width: 0;
          padding: 40px 48px 80px 52px;
          overflow-y: auto;
          box-sizing: border-box;
          position: relative;
          opacity: 0; transform: translateY(8px);
          transition: opacity .45s .1s ease, transform .45s .1s ease;
        }
        .content.in { opacity:1; transform:translateY(0); }

        /* ── Filter bar ── */
        .bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .filters {
          display: flex;
          gap: 0;
          border: 1px solid rgba(240,220,128,0.22);
          position: relative;
        }
        .fbtn {
          padding: 8px 26px;
          border: none;
          border-right: 1px solid rgba(240,220,128,0.14);
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .22em;
          text-transform: uppercase;
          cursor: pointer;
          background: transparent;
          color: #bbb;
          transition: color .14s, background .14s;
          position: relative;
        }
        .fbtn:last-child { border-right: none; }
        .fbtn:hover { color: #666; background: rgba(240,220,128,0.04); }
        .fbtn.on {
          color: #111;
          background: rgba(240,220,128,0.07);
        }
        .fbtn.on::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -1px;
          height: 1.5px;
          background: var(--G);
          filter: drop-shadow(0 0 5px var(--G));
        }

        .bar-ct {
          font-family: var(--mono);
          font-size: 9px;
          color: var(--dim);
          letter-spacing: .12em;
        }
        .bar-ct strong {
          color: var(--G);
          font-weight: 400;
          filter: drop-shadow(0 0 4px rgba(240,220,128,.7));
        }

        /* ── Prism grid — original sizing, 3 cols ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 180px));
          column-gap: 72px;
          row-gap: 140px;
          padding-top: 120px;
          padding-bottom: 40px;
        }

        /* ── Prism card ── */
        .prism {
          position: relative;
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          cursor: pointer;
          overflow: visible;
          opacity: 0;
          animation: rise .38s ease forwards;
          transition: border-color .12s ease, box-shadow .12s ease, transform .10s ease;
          /* Each hovered card rises above its neighbours */
          z-index: 1;
        }
        .prism:hover, .prism.sel { z-index: 10; }
        @keyframes rise {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Default hover / selected ── */
        .prism:hover, .prism.sel {
          background: var(--card-hover);
          border-color: rgba(var(--Gr),0.55);
          box-shadow:
            inset 0 0 60px rgba(212,175,90,0.08),
            inset 0 -30px 40px rgba(212,175,90,0.05),
            0 0 0 1px rgba(212,175,90,0.18),
            0 8px 32px rgba(0,0,0,0.6),
            0 0 24px rgba(212,175,90,0.10);
          transform: translateY(-3px);
        }

        /* ── Main card — idle gold pulse on edges ── */
        .prism.is-main {
          border-color: rgba(240,220,128,0.35);
          animation: rise .38s ease forwards, edge-pulse 3s ease-in-out infinite;
          animation-delay: var(--rise-delay), 1s;
        }
        @keyframes edge-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(240,220,128,0.12),
              0 0 12px rgba(240,220,128,0.08);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(240,220,128,0.45),
              0 0 22px rgba(240,220,128,0.20),
              inset 0 0 30px rgba(240,220,128,0.06);
          }
        }

        /* ── Particle shimmer — floats up from bottom of Main card on hover ── */
        .prism-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 6;
          overflow: visible;
        }
        .particle {
          position: absolute;
          bottom: 18%;
          width: 1px;
          height: 18px;
          border-radius: 1px;
          background: linear-gradient(to top, var(--G), transparent);
          box-shadow: 0 0 3px 0px var(--G);
          opacity: 0;
          z-index: 8;  /* above sprite (4), vignettes (5), edges (2) */
        }
        .prism.is-main:hover .particle,
        .prism.is-main.sel   .particle {
          animation: shimmer-rise var(--dur) ease-in-out var(--delay) infinite;
        }
        @keyframes shimmer-rise {
          0%   { transform: translate(var(--tx), 0)       scaleY(1);   opacity: 0;   }
          10%  { opacity: 0.9; }
          50%  { opacity: 0.6; }
          85%  { opacity: 0.2; }
          100% { transform: translate(var(--tx), -140px)  scaleY(0.3); opacity: 0;   }
        }

        /* ── Main card hover — Crown bloom ── */
        .prism.is-main:hover, .prism.is-main.sel {
          border-color: rgba(212,175,90,0.90);
          box-shadow:
            0 0 0 1px rgba(212,175,90,0.60),
            0 0 40px rgba(212,175,90,0.32),
            0 0 80px rgba(212,175,90,0.14),
            0 0 120px rgba(180,140,50,0.08),
            inset 0 0 50px rgba(212,175,90,0.10),
            inset 0 -40px 60px rgba(212,175,90,0.06);
          animation: rise .38s ease forwards;
        }

        /* SVG edge overlay — fills the card exactly */
        .edges {
          position: absolute;
          inset: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* Radial inner glow — the energy inside the monolith */
        .prism-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* Content sits above everything */
        .prism-body {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Sprite wrapper — anchored to card, sprite floats above */
        .prism-sprite-wrap {
          position: relative;
          width: 100%;
          height: 110px;          /* visible zone inside the card border */
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
          overflow: visible;      /* sprite escapes upward freely */
        }

        /* The sprite itself sits centred and overflows upward */
        .prism-sprite {
          display: block;
          height: 200px;
          width: auto;
          object-fit: contain;
          object-position: bottom center;
          position: relative;
          bottom: 0;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.22))
                  drop-shadow(0 1px 3px rgba(0,0,0,0.14));
          transition: filter .12s ease, transform .12s ease;
          pointer-events: none;
          z-index: 4;
        }

        /* Hover lift — all cards */
        .prism:hover .prism-sprite,
        .prism.sel   .prism-sprite {
          transform: translateY(-8px) scale(1.04);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.18))
                  drop-shadow(0 0 14px rgba(240,220,128,0.30))
                  drop-shadow(0 0 30px rgba(240,220,128,0.14));
        }

        /* Main card hover — stronger gold aura on sprite */
        .prism.is-main:hover .prism-sprite,
        .prism.is-main.sel   .prism-sprite {
          transform: translateY(-10px) scale(1.06);
          filter: drop-shadow(0 10px 22px rgba(0,0,0,0.16))
                  drop-shadow(0 0 20px rgba(240,220,128,0.55))
                  drop-shadow(0 0 40px rgba(240,220,128,0.28));
        }

        /* Side vignettes — gradient overlays that simulate wrap-around shadow */
        .prism-sprite-wrap::before,
        .prism-sprite-wrap::after {
          content: '';
          position: absolute;
          top: -100px;            /* reach up to cover the full sprite height */
          bottom: 0;
          width: 28%;
          pointer-events: none;
          z-index: 5;
        }
        /* Left vignette */
        .prism-sprite-wrap::before {
          left: 0;
          background: linear-gradient(to right,
            rgba(10,8,4,0.80) 0%,
            rgba(10,8,4,0.40) 40%,
            transparent 100%);
        }
        /* Right vignette */
        .prism-sprite-wrap::after {
          right: 0;
          background: linear-gradient(to left,
            rgba(10,8,4,0.80) 0%,
            rgba(10,8,4,0.40) 40%,
            transparent 100%);
        }
        /* On hover, soften the vignettes so we see more of the sprite */
        .prism:hover .prism-sprite-wrap::before,
        .prism.sel   .prism-sprite-wrap::before {
          background: linear-gradient(to right,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.20) 40%,
            transparent 100%);
        }
        .prism:hover .prism-sprite-wrap::after,
        .prism.sel   .prism-sprite-wrap::after {
          background: linear-gradient(to left,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.20) 40%,
            transparent 100%);
        }

        /* Fallback initial circle when image not yet uploaded */
        .prism-av-fallback {
          width: 64px; height: 64px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: .04em;
          color: rgba(255,255,255,0.88);
          margin-bottom: 16px;
        }

        /* Lower zone — text data */
        .prism-lower {
          padding: 10px 13px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .prism-tier {
          font-family: var(--mono);
          font-size: 7.5px;
          letter-spacing: .22em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .prism-name {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -.01em;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: letter-spacing .12s ease, filter .12s ease, color .12s ease;
        }
        .prism:hover .prism-name,
        .prism.sel   .prism-name {
          letter-spacing: .02em;
          color: #f0e8d0;
          filter: drop-shadow(0 0 6px rgba(212,175,90,0.45));
        }
        /* Main card — name lights up gold on hover */
        .prism.is-main:hover .prism-name,
        .prism.is-main.sel   .prism-name {
          color: #c8a030;
          filter: drop-shadow(0 0 8px rgba(240,220,128,0.7));
          letter-spacing: .04em;
        }

        .prism-cls {
          font-family: var(--mono);
          font-size: 8.5px;
          color: var(--dim);
          letter-spacing: .04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 10px;
        }

        .prism-lv {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }
        .prism-lv-l {
          font-family: var(--mono);
          font-size: 8px;
          color: #ccc;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .prism-lv-n {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          line-height: 1;
          letter-spacing: .04em;
        }

        /* ── Detail panel ── */
        .det-wrap {
          margin-top: 10px;
          opacity: 0; transform: translateY(5px);
          transition: opacity .22s ease, transform .22s ease;
          pointer-events: none;
        }
        .det-wrap.vis { opacity:1; transform:translateY(0); pointer-events:auto; }

        .det {
          border: 1px solid rgba(240,220,128,0.45);
          background: var(--card-hover);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          position: relative;
          overflow: hidden;
          box-shadow:
            inset 0 0 80px rgba(240,220,128,0.04),
            0 0 0 1px rgba(240,220,128,0.10);
        }

        /* Top beam */
        .det-beam {
          height: 1.5px;
          background: linear-gradient(90deg,
            transparent,
            rgba(240,220,128,0.4) 10%,
            rgba(240,220,128,1) 50%,
            rgba(240,220,128,0.4) 90%,
            transparent);
          filter: drop-shadow(0 0 8px rgba(240,220,128,1));
        }

        /* Vertical left edge inside detail panel */
        .det-edge {
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1.5px;
          background: linear-gradient(180deg,
            rgba(240,220,128,0.8),
            rgba(240,220,128,0.3) 50%,
            rgba(240,220,128,0.6));
          filter: drop-shadow(0 0 4px rgba(240,220,128,0.8));
        }

        .det-body {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 18px 28px 18px 32px;
          position: relative; z-index: 2;
        }

        .det-av {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex; align-items:center; justify-content:center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: .04em;
          color: rgba(255,255,255,0.88);
          flex-shrink: 0;
          box-shadow: 0 0 0 1.5px rgba(240,220,128,0.5),
                      0 0 12px rgba(240,220,128,0.2);
        }

        .det-info { flex:1; min-width:0; }
        .det-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; letter-spacing: .06em;
          color: var(--text); line-height:1;
          margin-bottom: 4px;
          text-shadow: 0 0 40px rgba(240,220,128,0.15);
        }
        .det-sub {
          font-family: var(--mono);
          font-size: 9px; color: var(--dim);
          letter-spacing: .12em; text-transform: uppercase;
        }

        .det-sep {
          width: 1px; height: 44px; flex-shrink:0;
          background: rgba(240,220,128,0.25);
          filter: drop-shadow(0 0 4px rgba(240,220,128,0.3));
        }

        .det-stats { display:flex; gap:24px; align-items:center; flex-shrink:0; }
        .det-stat { text-align: center; }
        .det-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: .04em;
          line-height:1; margin-bottom:3px;
          filter: drop-shadow(0 0 5px currentColor);
        }
        .det-lbl {
          font-family: var(--mono);
          font-size: 8px; letter-spacing: .18em;
          text-transform: uppercase; color: var(--dim);
        }

        /* Enter button */
        .enter {
          position: relative;
          padding: 10px 22px;
          border: 1px solid rgba(240,220,128,0.45);
          background: transparent;
          font-family: var(--mono);
          font-size: 9px; letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--G);
          cursor: pointer; flex-shrink:0;
          overflow: hidden;
          transition: filter .18s ease, border-color .18s ease;
          filter: drop-shadow(0 0 3px rgba(240,220,128,0.2));
        }
        .enter::before {
          content:'';
          position:absolute; inset:0;
          background: rgba(240,220,128,0.09);
          transform: scaleX(0); transform-origin:left;
          transition: transform .22s ease;
        }
        .enter:hover::before { transform: scaleX(1); }
        .enter:hover {
          border-color: rgba(240,220,128,0.8);
          filter: drop-shadow(0 0 10px rgba(240,220,128,0.5));
        }
        .enter span { position:relative; z-index:1; }

        /* Empty state */
        .det-empty {
          display: flex; align-items:center; gap:14px;
          padding: 16px 32px;
          position: relative; z-index:2;
        }
        .det-empty-line {
          flex:1; height:1px;
          background: rgba(240,220,128,0.12);
        }
        .det-empty-txt {
          font-family: var(--mono);
          font-size: 9px; color: var(--dim);
          letter-spacing: .24em; text-transform: uppercase;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(var(--Gr),0.25); }
      `}</style>

      <div className={`root${animEnabled ? "" : " anim-off"}`} style={{height:"100vh",overflow:"hidden",position:"relative"}}>
        <Background/>

        <div className="layout">

          {/* ── Left: Sidebar dashboard ── */}
          <aside className={`sidebar ${mounted ? "in" : ""}`}><div className="sidebar-floor"/><SidebarDust enabled={animEnabled}/>
            <div className="sidebar-hdr">
              {/* Eyebrow — editable */}
              {editingField === 'eyebrow' ? (
                <input
                  autoFocus
                  className="sidebar-edit-input eyebrow-input"
                  value={eyebrow}
                  onChange={e => setEyebrow(e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
                />
              ) : (
                <div className="sidebar-eyebrow editable-field" onClick={() => setEditingField('eyebrow')}>
                  {eyebrow || <span className="placeholder-text">Insert Text</span>}
                  <span className="edit-icon">✎</span>
                </div>
              )}

              {/* Guild name — editable */}
              {editingField === 'name' ? (
                <input
                  autoFocus
                  className="sidebar-edit-input name-input"
                  value={guildName.replace('\n', ' ')}
                  onChange={e => setGuildName(e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
                />
              ) : (
                <div className="sidebar-name editable-field" onClick={() => setEditingField('name')}>
                  {guildName || <span className="placeholder-text">Insert Text</span>}
                  <span className="edit-icon name-edit-icon">✎</span>
                </div>
              )}
            </div>

            <div className="sidebar-body">
              <nav className="nav">
                <div className="nav-section-label">Character</div>

                {[
                  { id:"experience", label:"Experience", sub:"EXP",
                    icon:<><line x1="3" y1="12" x2="11" y2="12"/><polyline points="8 8 12 12 8 16"/><rect x="1" y="3" width="14" height="18" rx="0"/></> },
                  { id:"equipment",  label:"Equipment",  sub:"GEAR",
                    icon:<><rect x="2" y="6" width="12" height="8"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="14" x2="8" y2="18"/></> },
                ].map(item => (
                  <button key={item.id}
                    className={`nav-item${navPage===item.id?" active":""}`}
                    onClick={() => setNavPage(item.id)}>
                    <div className="nav-icon">
                      <svg viewBox="0 0 16 16">{item.icon}</svg>
                    </div>
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sub">{item.sub}</span>
                  </button>
                ))}

                <div className="nav-sep"/>
                <div className="nav-section-label">Daily &amp; Weekly</div>

                {[
                  { id:"dailies",  label:"Dailies",  sub:"DAY",
                    icon:<><circle cx="8" cy="8" r="6"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="8" y1="8" x2="11" y2="10"/></> },
                  { id:"weeklies", label:"Weeklies", sub:"WK",
                    icon:<><rect x="2" y="2" width="12" height="12"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></> },
                  { id:"bosses",   label:"Bosses",   sub:"BOSS",
                    icon:<><polygon points="8 2 14 14 2 14"/><line x1="8" y1="7" x2="8" y2="10"/><line x1="8" y1="12" x2="8" y2="13"/></> },
                ].map(item => (
                  <button key={item.id}
                    className={`nav-item${navPage===item.id?" active":""}`}
                    onClick={() => setNavPage(item.id)}>
                    <div className="nav-icon">
                      <svg viewBox="0 0 16 16">{item.icon}</svg>
                    </div>
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sub">{item.sub}</span>
                  </button>
                ))}
                <div className="nav-sep"/>
                <div className="nav-section-label">Settings</div>
                <label className="nav-item anim-toggle" style={{cursor:'pointer'}}>
                  <div className="nav-icon">
                    <svg viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="5"/><line x1="8" y1="1" x2="8" y2="3"/>
                      <line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/>
                      <line x1="13" y1="8" x2="15" y2="8"/>
                    </svg>
                  </div>
                  <span className="nav-label">Animations</span>
                  <div className={`toggle-pill${animEnabled ? ' on' : ''}`}
                    onClick={e => { e.preventDefault(); setAnimEnabled(v => !v); }}>
                    <div className="toggle-knob"/>
                  </div>
                </label>
              </nav>


            </div>
          </aside>

          {/* ── Right: Cards + detail ── */}
          <main className={`content ${mounted ? "in" : ""}`}>
            <Circuitry enabled={animEnabled}/>

            {navPage === "experience" && <>
            {/* Prism grid */}
            <div className="grid">
              {characters.map((char, i) => (
                <PrismCard
                  key={char.name}
                  char={char}
                  index={i}
                  isSel={selected?.name === char.name}
                  isHov={hovered === char.name}
                  onClick={() => setSelected(selected?.name === char.name ? null : char)}
                  onEnter={() => setHovered(char.name)}
                  onLeave={() => setHovered(null)}
                />
              ))}
            </div>

            {/* Detail panel */}
            <div className={`det-wrap ${sel ? "vis" : ""}`}>
              <div className="det">
                <div className="det-beam"/>
                <div className="det-edge"/>
                {sel ? (() => {
                  const tier = TIER[sel.badge];
                  const hue  = JOB_HUE[sel.type] ?? JOB_HUE.Magician;
                  return (
                    <div className="det-body">
                      <div className="det-av" style={{ background: `hsl(${hue}deg 45% 38%)` }}>
                        {sel.name[0]}
                      </div>
                      <div className="det-info">
                        <div className="det-name">{sel.name}</div>
                        <div className="det-sub">{sel.cls} · {sel.type}</div>
                      </div>
                      <div className="det-sep"/>
                      <div className="det-stats">
                        <div className="det-stat">
                          <div className="det-val" style={{ color: G }}>{sel.level}</div>
                          <div className="det-lbl">Level</div>
                        </div>
                        <div className="det-stat">
                          <div className="det-val" style={{ color: tier.lit, filter: `drop-shadow(0 0 5px ${tier.lit})` }}>
                            {tier.label}
                          </div>
                          <div className="det-lbl">Potential</div>
                        </div>
                        <div className="det-stat">
                          <div className="det-val" style={{ color: "#999" }}>{sel.type}</div>
                          <div className="det-lbl">Job</div>
                        </div>
                      </div>
                      <div className="det-sep"/>
                      <button className="enter"><span>Log In →</span></button>
                    </div>
                  );
                })() : (
                  <div className="det-empty">
                    <div className="det-empty-line"/>
                    <span className="det-empty-txt">Select a character</span>
                    <div className="det-empty-line"/>
                  </div>
                )}
              </div>
            </div>

            </>}

            {navPage === "equipment" && <PlaceholderPage title="Equipment" sub="GEAR" icon="⚔️" desc="Manage your characters' gear, set effects, and upgrade paths." />}
            {navPage === "dailies"   && <PlaceholderPage title="Dailies"   sub="DAY"  icon="🕐" desc="Track daily quests, arcane symbols, and sacred symbols across your roster." />}
            {navPage === "weeklies"  && <PlaceholderPage title="Weeklies"  sub="WK"   icon="📅" desc="Track weekly bosses, guild quests, and maple tour across your roster." />}
            {navPage === "bosses"    && <PlaceholderPage title="Bosses"    sub="BOSS" icon="⚠️" desc="Track boss clears and crystals across all characters." />}

          </main>
        </div>
      </div>
    </>
  );
}
