"use client";

import { useEffect, useState } from "react";

function Character({ person }: { person: "genta" | "miqdar" }) {
  const genta = person === "genta";
  const skin = "#c98768";
  const shirt = genta ? "#e85b3c" : "#34433e";
  const pants = genta ? "#29241f" : "#293532";
  const hair = genta ? "#29241f" : "#171918";

  return (
    <div className={`intro-character intro-${person}`}>
      <svg viewBox="0 0 220 390" role="img" aria-label={`Ilustrasi ${genta ? "Genta" : "Miqdar"}`}>
        <ellipse cx="110" cy="372" rx="54" ry="8" fill="#191916" opacity=".13"/>

        <g className="character-legs">
          <g className="leg leg-back">
            <path d="M91 250 L88 302 L78 346 L99 351 L117 306 L122 258Z" fill={pants}/>
            <path d="M78 343 L101 346 L100 358 L66 359 Q60 354 78 343Z" fill="#191916"/>
          </g>
          <g className="leg leg-front">
            <path d="M119 250 L133 300 L143 344 L122 351 L104 307 L99 258Z" fill={pants}/>
            <path d="M122 344 L145 341 L158 357 L123 359 Q115 355 122 344Z" fill="#191916"/>
          </g>
        </g>

        <g className="character-torso">
          <path d="M78 145 Q62 151 59 180 L55 260 Q110 278 165 260 L160 180 Q157 151 140 145 L128 138 L91 138Z" fill={shirt}/>
          <path d="M91 140 L110 164 L129 140 L122 132 L98 132Z" fill="#f1eee6"/>
          <path d="M98 116 L122 116 L126 145 Q110 160 94 145Z" fill={skin}/>
          <path d="M88 166 Q110 177 132 166" fill="none" stroke="#ffffff" strokeOpacity=".12" strokeWidth="3"/>
        </g>

        <g className="arm arm-left">
          <path d="M66 164 Q43 177 39 207 L48 231" fill="none" stroke={shirt} strokeWidth="21" strokeLinecap="round"/>
          <path d="M48 231 L69 245" fill="none" stroke={skin} strokeWidth="15" strokeLinecap="round"/>
          <circle cx="70" cy="246" r="10" fill={skin}/>
        </g>
        <g className="arm arm-right">
          <path d="M154 164 Q177 177 181 207 L172 231" fill="none" stroke={shirt} strokeWidth="21" strokeLinecap="round"/>
          <path d="M172 231 L151 245" fill="none" stroke={skin} strokeWidth="15" strokeLinecap="round"/>
          <circle cx="150" cy="246" r="10" fill={skin}/>
        </g>

        <g className="character-head">
          <ellipse cx="110" cy="79" rx="38" ry="46" fill={skin}/>
          <path d="M72 80 Q68 29 108 25 Q151 21 149 77 L142 91 L137 57 Q113 63 96 43 Q87 59 74 61Z" fill={hair}/>
          {genta && (
            <g fill="none" stroke={hair} strokeWidth="3.5">
              <rect x="78" y="72" width="27" height="21" rx="7"/>
              <rect x="115" y="72" width="27" height="21" rx="7"/>
              <path d="M105 79 H115"/>
            </g>
          )}
          <circle cx="96" cy="83" r="2.5" fill="#29241f"/>
          <circle cx="124" cy="83" r="2.5" fill="#29241f"/>
          <path d="M101 108 Q110 114 120 108" fill="none" stroke="#754a3a" strokeWidth="2.5" strokeLinecap="round"/>
        </g>

        <g className="character-grip">
          <path d="M68 246 Q77 239 83 249" fill="none" stroke={skin} strokeWidth="6" strokeLinecap="round"/>
          <path d="M152 246 Q143 239 137 249" fill="none" stroke={skin} strokeWidth="6" strokeLinecap="round"/>
        </g>
      </svg>

      <div className="character-label">
        <strong>{genta ? "GENTA" : "MIQDAR"}</strong>
        <span>{genta ? "THE VISION" : "THE BUILDER"}</span>
      </div>
    </div>
  );
}

export default function IntroAnimation() {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setAnimate(false);
    }, 10500);

    return () => window.clearTimeout(timer);
  }, []);

  function skipIntro() {
    setAnimate(false);
  }

  return (
    <section
      className={`intro-hero ${animate ? "intro-playing" : "intro-static"}`}
      aria-label="H3 Works Creative introduction"
    >
      {animate && (
        <button className="intro-skip" onClick={skipIntro}>
          SKIP INTRO ↗
        </button>
      )}

      <div className="intro-topline">
        <span>H3 WORKS CREATIVE</span>
      </div>

      <div className="intro-stage">
        <div className="intro-caption">TWO MINDS. ONE DIRECTION.</div>

        <svg className="intro-ropes" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <g className="rope-swing">
            <path className="rope" d="M220 350 C220 40 780 40 780 350"/>
            <path className="rope rope-return" d="M220 350 C220 460 780 460 780 350"/>
          </g>
        </svg>

        <div className="intro-title">
          <span className="intro-word intro-ideas">IDEAS</span>
          <span className="intro-word intro-into">INTO</span>
          <span className="intro-word intro-works">WORKS<span>.</span></span>
        </div>

        <Character person="genta"/>
        <Character person="miqdar"/>

        <div className="intro-pull-label">PULLING IDEAS INTO REALITY</div>
      </div>

      <div className="intro-bottomline">
        <span>THINK.</span>
        <span>MAKE.</span>
        <span>REPEAT.</span>
      </div>
    </section>
  );
}
