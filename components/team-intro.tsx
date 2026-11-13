"use client";

import { useState } from "react";

type Person = {
  id: string;
  name: string;
  role: string;
  description: string;
  variant: "genta" | "miqdar";
};

const people: Person[] = [
  {
    id: "genta",
    name: "Genta Jaya Dilaga",
    role: "Chief Executive Officer",
    description: "Halo! Salam kenal, saya Genta Jaya Dilaga. Saya mengarahkan strategi dan kreativitas di H3 Works.",
    variant: "genta",
  },
  {
    id: "miqdar",
    name: "Muhammad Miqdar Salim",
    role: "Chief Technology Officer",
    description: "Halo! Salam kenal, saya Miqdar. Saya bertanggung jawab atas teknologi dan pengembangan di H3 Works.",
    variant: "miqdar",
  },
];

function Character({ variant }: { variant: Person["variant"] }) {
  return (
    <svg
      viewBox="0 0 240 280"
      className={`character-svg character-svg--${variant}`}
      role="img"
      aria-label={`Ilustrasi karakter ${variant === "genta" ? "Genta" : "Miqdar"}`}
    >
      <ellipse cx="120" cy="265" rx="67" ry="9" fill="#191916" opacity=".12" />

      {/* Body */}
      <path d="M65 265 Q65 190 91 177 L120 168 L149 177 Q175 190 175 265Z" className="character-shirt" />
      <path d="M105 174 L120 196 L135 174 L129 166 L111 166Z" fill="#f1eee6" />
      <path d="M111 151 L129 151 L132 178 Q120 190 108 178Z" fill="#c98768" />

      {/* Left arm */}
      <path d="M77 190 Q57 209 52 246 Q50 257 60 260 Q70 262 73 250 L94 207Z" className="character-shirt" />
      <path
        d="M54 247
           Q61 244 66 249
           L72 254
           Q77 258 72 263
           L69 265
           Q73 270 68 273
           Q63 275 61 269
           Q59 276 55 273
           Q51 271 53 266
           Q48 271 45 267
           Q42 264 47 259
           Q42 261 41 256
           Q40 252 46 250
           Q50 248 54 251Z"
        fill="#c98768"
      />
      <path
        d="M51 261 Q54 264 53 268 M59 262 Q62 265 61 269 M67 260 Q69 263 68 266"
        stroke="#a96f59"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right arm: one connected shoulder-to-hand shape */}
      <g className="character-wave">
        {/* Sleeve and arm silhouette */}
        <path
          d="M143 180
             C158 181 170 193 176 211
             L188 246
             Q192 257 182 262
             Q172 266 166 254
             L151 224
             Q142 207 134 201
             Z"
          className="character-shirt"
        />

        {/* Palm and four visible fingers */}
        <path
          d="M165 249
             Q170 246 174 250
             L181 254
             Q185 257 182 261
             L180 263
             Q185 268 181 272
             Q177 275 174 270
             Q173 277 169 276
             Q165 275 166 269
             Q162 273 159 269
             Q157 266 161 261
             Q156 262 155 258
             Q154 254 159 252
             Q162 249 165 252Z"
          fill="#c98768"
        />
        {/* Subtle finger separation */}
        <path
          d="M164 264 Q166 267 165 270 M172 264 Q174 267 173 270 M179 262 Q181 265 179 267"
          stroke="#a96f59"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Head and ears */}
      <ellipse cx="120" cy="104" rx="48" ry="57" fill="#d99d7d" />
      <ellipse cx="72" cy="111" rx="8" ry="13" fill="#d99d7d" />
      <ellipse cx="168" cy="111" rx="8" ry="13" fill="#d99d7d" />

      {/* Hair */}
      {variant === "genta" ? (
        <path d="M73 107 Q62 50 111 43 Q158 30 169 78 Q174 94 165 111 L158 89 Q143 85 132 72 Q111 91 80 91 L80 119Z" fill="#29241f" />
      ) : (
        <path d="M73 111 Q61 57 103 45 Q151 28 168 76 Q177 105 163 126 L158 91 Q137 101 119 79 Q101 100 81 94 L80 123Z" fill="#171918" />
      )}

      {/* Face */}
      <ellipse cx="103" cy="111" rx="3.5" ry="4.5" fill="#29241f" />
      <ellipse cx="137" cy="111" rx="3.5" ry="4.5" fill="#29241f" />
      <path d="M113 133 Q120 139 128 133" stroke="#754a3a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {variant === "genta" && (
        <g fill="none" stroke="#29241f" strokeWidth="2.5">
          <rect x="88" y="101" width="25" height="19" rx="7" />
          <rect x="127" y="101" width="25" height="19" rx="7" />
          <path d="M113 109 H127" />
        </g>
      )}

      {variant === "miqdar" && (
        <path d="M105 146 Q120 151 135 146" stroke="#754a3a" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

export default function TeamIntro() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="team-intro-grid">
      {people.map((person) => {
        const isActive = active === person.id;

        return (
          <div className={`team-person ${isActive ? "is-active" : ""}`} key={person.id}>
            <div className="team-character-stage">
              <div className={`team-speech ${isActive ? "is-visible" : ""}`} aria-live="polite">
                {person.description}
              </div>

              <button
                type="button"
                className="team-character-button"
                onClick={() => setActive(isActive ? null : person.id)}
                aria-label={`${isActive ? "Tutup" : "Perkenalkan"} ${person.name}`}
                aria-expanded={isActive}
              >
                <Character variant={person.variant} />
                <span className="character-hint">
                  {isActive ? "Nice to meet you!" : "Click to say hello"}
                </span>
              </button>
            </div>

            <div className="team-name-card">
              <div className="team-name-index">H3 WORKS / {person.id === "genta" ? "01" : "02"}</div>
              <div className="team-name">{person.name}</div>
              <div className="team-role">{person.role}</div>
              <div className="team-specialty">
                {person.id === "genta" ? "Strategy / Creative Direction" : "Technology / Development"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
