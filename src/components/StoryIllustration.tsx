import React from 'react';
import { MaxDog } from './MaxDog';

export interface StoryIllustrationProps {
  pageNumber: number | 'cover' | 'result';
  className?: string;
  aspectRatio?: '4/3' | '3/4' | '16/10' | '1/1';
}

/**
 * StoryIllustration renders each scene of the picture book.
 * It uses the shared, identical MaxDog SVG component on EVERY scene,
 * while preserving all environment elements and inference clues.
 */
export const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  pageNumber,
  className = '',
  aspectRatio = '4/3',
}) => {
  const aspectClass =
    aspectRatio === '3/4'
      ? 'aspect-[3/4]'
      : aspectRatio === '16/10'
      ? 'aspect-[16/10]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : 'aspect-[4/3]';

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-amber-50 select-none ${className}`}
    >
      {/* ============================================================== */}
      {/* COVER SCENE                                                    */}
      {/* ============================================================== */}
      {pageNumber === 'cover' && (
        <svg viewBox="0 0 400 533" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="coverSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="60%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <linearGradient id="coverGrass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="40%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>

          {/* Sky with warm morning sun */}
          <rect width="400" height="340" fill="url(#coverSky)" />
          <circle cx="340" cy="80" r="50" fill="#FDE047" opacity="0.8" />
          <circle cx="340" cy="80" r="70" fill="#FEF08A" opacity="0.3" />

          {/* Soft Puffy Clouds */}
          <path d="M 50 90 Q 70 70 95 85 Q 120 70 140 90 Q 155 105 135 115 L 60 115 Q 40 105 50 90 Z" fill="#FFFFFF" opacity="0.9" />
          <path d="M 220 120 Q 235 105 255 115 Q 275 105 290 120 Q 305 135 285 145 L 230 145 Q 210 135 220 120 Z" fill="#FFFFFF" opacity="0.85" />

          {/* Distant Hills */}
          <ellipse cx="100" cy="350" rx="200" ry="80" fill="#BBF7D0" />
          <ellipse cx="320" cy="360" rx="180" ry="70" fill="#A7F3D0" />

          {/* Wooden Picket Fence */}
          <g fill="#FDE68A" stroke="#D97706" strokeWidth="2">
            {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x) => (
              <path key={x} d={`M ${x - 12} 310 L ${x} 280 L ${x + 12} 310 L ${x + 12} 380 L ${x - 12} 380 Z`} />
            ))}
            <line x1="10" y1="320" x2="390" y2="320" stroke="#D97706" strokeWidth="4" />
            <line x1="10" y1="355" x2="390" y2="355" stroke="#D97706" strokeWidth="4" />
          </g>

          {/* Doghouse in background right */}
          <g transform="translate(260, 240)">
            {/* Wall */}
            <rect x="0" y="40" width="100" height="90" rx="4" fill="#F87171" stroke="#DC2626" strokeWidth="3" />
            {/* Roof */}
            <polygon points="-10,40 50,-5 110,40" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
            {/* Doorway */}
            <path d="M 25 130 L 25 80 Q 50 60 75 80 L 75 130 Z" fill="#7F1D1D" />
            {/* Bone emblem (NO letters) */}
            <path d="M 40 45 C 38 42 35 45 37 47 C 35 49 38 52 40 49 L 60 49 C 62 52 65 49 63 47 C 65 45 62 42 60 45 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
          </g>

          {/* Front Lawn */}
          <path d="M 0 350 Q 200 330 400 350 L 400 533 L 0 533 Z" fill="url(#coverGrass)" />

          {/* Cobblestone Garden Path */}
          <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5">
            <ellipse cx="140" cy="460" rx="35" ry="14" />
            <ellipse cx="205" cy="485" rx="40" ry="15" fill="#F1F5F9" />
            <ellipse cx="270" cy="510" rx="36" ry="14" />
          </g>

          {/* Cheerful Flowers */}
          <g transform="translate(30, 420)">
            <circle cx="10" cy="0" r="7" fill="#F43F5E" />
            <circle cx="10" cy="0" r="3" fill="#FDE047" />
            <path d="M 10 7 L 10 30" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="15" r="8" fill="#FB923C" />
            <circle cx="32" cy="15" r="3.5" fill="#FEF08A" />
            <path d="M 32 23 L 32 40" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Max the Dog (Centered, Proud & Brave) */}
          <g transform="translate(110, 275)">
            <MaxDog pose="proud_stand" expression="proud" size={200} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 1: "Max is a very brave watch dog. He guards the garden." */}
      {/* Clue: Max stands proudly alert, but is a tiny fluffy puppy.    */}
      {/* ============================================================== */}
      {pageNumber === 1 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Sunny Sky & Lawn */}
          <rect width="400" height="180" fill="#BAE6FD" />
          <circle cx="340" cy="45" r="35" fill="#FDE047" opacity="0.9" />
          <path d="M 0 170 Q 200 150 400 170 L 400 300 L 0 300 Z" fill="#4ADE80" />

          {/* Garden Fence */}
          <g fill="#FEF08A" stroke="#D97706" strokeWidth="2">
            {[40, 90, 140, 190, 240, 290, 340].map((x) => (
              <path key={x} d={`M ${x - 10} 125 L ${x} 100 L ${x + 10} 125 L ${x + 10} 185 L ${x - 10} 185 Z`} />
            ))}
            <line x1="20" y1="135" x2="380" y2="135" stroke="#D97706" strokeWidth="3.5" />
          </g>

          {/* Flowers in corner */}
          <g transform="translate(30, 210)">
            <circle cx="15" cy="0" r="7" fill="#F43F5E" />
            <circle cx="15" cy="0" r="3" fill="#FDE047" />
            <path d="M 15 7 L 15 35" stroke="#16A34A" strokeWidth="2.5" />
            <circle cx="40" cy="10" r="8" fill="#A855F7" />
            <circle cx="40" cy="10" r="3.5" fill="#FDE047" />
            <path d="M 40 18 L 40 45" stroke="#16A34A" strokeWidth="2.5" />
          </g>

          {/* Cute fluttering butterfly */}
          <g transform="translate(280, 80)">
            <ellipse cx="-4" cy="-4" rx="6" ry="4" fill="#F43F5E" transform="rotate(-20)" />
            <ellipse cx="4" cy="-4" rx="6" ry="4" fill="#F43F5E" transform="rotate(20)" />
            <line x1="0" y1="-8" x2="0" y2="2" stroke="#1E293B" strokeWidth="1.5" />
          </g>

          {/* Max standing proudly like a brave watchdog */}
          <g transform="translate(130, 105)">
            <MaxDog pose="proud_stand" expression="proud" size={170} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 2 / QUESTION 1: "A dangerous monster enters the yard..."  */}
      {/* Clue: Cat is sleeping peacefully on fence; Max hides in fear.  */}
      {/* ============================================================== */}
      {pageNumber === 2 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Outdoor Garden */}
          <rect width="400" height="175" fill="#BAE6FD" />
          <path d="M 0 165 Q 200 150 400 165 L 400 300 L 0 300 Z" fill="#4ADE80" />

          {/* Fence across yard */}
          <g fill="#FDE68A" stroke="#D97706" strokeWidth="2">
            {[40, 90, 140, 190, 240, 290, 340].map((x) => (
              <path key={x} d={`M ${x - 10} 115 L ${x} 90 L ${x + 10} 115 L ${x + 10} 175 L ${x - 10} 175 Z`} />
            ))}
            <line x1="20" y1="125" x2="380" y2="125" stroke="#D97706" strokeWidth="4" />
          </g>

          {/* SLEEPING ORANGE CAT ON THE FENCE (The "dangerous monster"!) */}
          <g transform="translate(255, 95)">
            {/* Curled orange body */}
            <ellipse cx="30" cy="15" rx="26" ry="17" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
            {/* Orange tabby stripes */}
            <path d="M 22 2 Q 24 12 28 14" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
            <path d="M 32 2 Q 34 12 38 14" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
            {/* Sleeping Cat Head */}
            <circle cx="10" cy="10" r="14" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
            {/* Cat Ears */}
            <polygon points="2,0 8,-10 14,0" fill="#FB923C" stroke="#EA580C" strokeWidth="1.5" />
            <polygon points="12,0 18,-10 24,0" fill="#FB923C" stroke="#EA580C" strokeWidth="1.5" />
            {/* Sleeping Closed Eyes */}
            <path d="M 5 10 Q 8 13 11 10" stroke="#7C2D12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 13 10 Q 16 13 19 10" stroke="#7C2D12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Cute nose & whiskers */}
            <circle cx="12" cy="15" r="1.5" fill="#FDA4AF" />
            <line x1="2" y1="15" x2="-6" y2="13" stroke="#7C2D12" strokeWidth="1" />
            <line x1="2" y1="17" x2="-5" y2="19" stroke="#7C2D12" strokeWidth="1" />
            {/* Relaxed Curled Tail hanging down */}
            <path d="M 52 18 Q 62 25 58 38" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Cat Zzz */}
            <text x="50" y="-5" fill="#EA580C" fontSize="12" fontWeight="bold">z</text>
            <text x="60" y="-15" fill="#EA580C" fontSize="14" fontWeight="bold">Z</text>
          </g>

          {/* Terracotta Flowerpot in foreground */}
          <g transform="translate(60, 160)">
            {/* Big Flowerpot */}
            <polygon points="20,50 15,110 85,110 80,50" fill="#EA580C" stroke="#C2410C" strokeWidth="2.5" />
            <rect x="15" y="42" width="70" height="14" rx="3" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
            {/* Green Fern / Plant Leaves */}
            <path d="M 50 45 Q 25 15 10 30 Q 30 45 50 45 Z" fill="#16A34A" />
            <path d="M 50 45 Q 50 5 60 15 Q 55 35 50 45 Z" fill="#22C55E" />
            <path d="M 50 45 Q 80 15 95 35 Q 75 45 50 45 Z" fill="#15803D" />
          </g>

          {/* MAX HIDING NERVOUSLY BEHIND THE FLOWERPOT (Inference Clue!) */}
          <g transform="translate(95, 125)">
            <MaxDog pose="hiding_pot" expression="nervous" size={150} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 3: "Max never eats human snacks. He loves healthy food."  */}
      {/* Clue: In kitchen eating peanut butter with jar and spoon!     */}
      {/* ============================================================== */}
      {pageNumber === 3 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Kitchen Wall with Tile Pattern */}
          <rect width="400" height="200" fill="#FEF3C7" />
          <g stroke="#FDE68A" strokeWidth="1" opacity="0.6">
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="180" />
            ))}
            {[30, 60, 90, 120, 150].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} />
            ))}
          </g>

          {/* Kitchen Counter / Cupboard */}
          <rect x="0" y="180" width="400" height="120" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          <rect x="0" y="175" width="400" height="15" fill="#D97706" />

          {/* Kitchen Shelf on Wall */}
          <rect x="30" y="45" width="160" height="10" rx="2" fill="#B45309" />
          {/* Spices / Jars on Shelf */}
          <rect x="50" y="25" width="16" height="20" rx="2" fill="#F87171" />
          <rect x="75" y="20" width="18" height="25" rx="2" fill="#60A5FA" />
          <rect x="105" y="22" width="20" height="23" rx="2" fill="#34D399" />

          {/* OPEN PEANUT BUTTER JAR ON COUNTER (Clear Clue, NO text) */}
          <g transform="translate(60, 140)">
            {/* Glass Jar Body */}
            <rect x="0" y="10" width="50" height="55" rx="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
            {/* Peanut Butter inside */}
            <rect x="4" y="20" width="42" height="40" rx="4" fill="#92400E" />
            {/* Label with peanut symbol (NO words) */}
            <rect x="8" y="28" width="34" height="22" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
            <ellipse cx="22" cy="39" rx="5" ry="3" fill="#B45309" />
            <ellipse cx="28" cy="39" rx="5" ry="3" fill="#B45309" />
            {/* Jar Lid off to side */}
            <ellipse cx="-12" cy="55" rx="14" ry="4" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            {/* Spoon sticking out of jar with peanut butter blob */}
            <line x1="30" y1="18" x2="15" y2="-8" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="-8" r="5" fill="#92400E" />
          </g>

          {/* MAX SITTING BY COUNTER EATING WITH PEANUT BUTTER ON NOSE */}
          <g transform="translate(160, 110)">
            <MaxDog pose="eating_snack" expression="eating" peanutButterOnNose={true} size={175} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 4 / QUESTION 2: "He helps clean the living room..."        */}
      {/* Clue: Paper towel roll completely unrolled across floor!       */}
      {/* ============================================================== */}
      {pageNumber === 4 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Living Room Floor (Wood Planks) */}
          <rect width="400" height="300" fill="#FEF3C7" />
          <rect width="400" height="90" fill="#E2E8F0" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="#CBD5E1" strokeWidth="3" />

          {/* Wooden Floor Planks */}
          {[130, 175, 220, 265].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#FDE68A" strokeWidth="2" />
          ))}

          {/* UNROLLED TOILET PAPER RIBBONS ACROSS THE FLOOR (Inference Clue!) */}
          <g fill="none" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path d="M 40 180 Q 90 220 160 190 Q 230 160 300 210 Q 360 250 380 230" />
            <path d="M 120 230 Q 180 270 260 250 Q 320 230 350 270" />
            <path d="M 80 150 Q 140 120 210 145" />
          </g>
          {/* Inner paper shadow lines */}
          <g fill="none" stroke="#E2E8F0" strokeWidth="2">
            <path d="M 40 180 Q 90 220 160 190 Q 230 160 300 210 Q 360 250 380 230" />
            <path d="M 120 230 Q 180 270 260 250 Q 320 230 350 270" />
          </g>

          {/* Empty cardboard roll tipped over */}
          <g transform="translate(35, 170)">
            <ellipse cx="10" cy="10" rx="8" ry="12" fill="#D97706" />
            <ellipse cx="8" cy="10" rx="4" ry="7" fill="#78350F" />
          </g>

          {/* Muddy paw prints tracked across floor */}
          <g fill="#78350F" opacity="0.8">
            <ellipse cx="90" cy="245" rx="5" ry="3.5" />
            <ellipse cx="150" cy="265" rx="5" ry="3.5" />
            <ellipse cx="220" cy="245" rx="5" ry="3.5" />
            <ellipse cx="290" cy="260" rx="5" ry="3.5" />
          </g>

          {/* MAX SITTING IN THE MIDDLE WITH TOILET PAPER STRAND OVER HEAD */}
          <g transform="translate(140, 115)">
            <MaxDog pose="messy_play" expression="silly" muddyPaws={true} size={170} />
            {/* Strand of toilet paper draped across ear */}
            <path
              d="M 60 70 Q 75 55 100 70 Q 115 80 125 110"
              stroke="#FFFFFF"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 5: "Max loves rainy days. He always keeps paws dry."       */}
      {/* Clue: Rain falling, stomping front paws in big mud puddle!    */}
      {/* ============================================================== */}
      {pageNumber === 5 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Overcast Rainy Sky */}
          <rect width="400" height="170" fill="#94A3B8" />
          <path d="M 40 40 Q 80 20 130 35 Q 180 20 220 40 Q 250 55 230 75 L 50 75 Z" fill="#64748B" opacity="0.8" />
          <path d="M 200 50 Q 240 30 290 45 Q 340 30 370 50 Q 390 65 370 85 L 210 85 Z" fill="#64748B" opacity="0.8" />

          {/* Wet Lawn */}
          <rect y="160" width="400" height="140" fill="#22C55E" />

          {/* Rain streaks */}
          <g stroke="#BAE6FD" strokeWidth="1.8" opacity="0.8" strokeLinecap="round">
            {[
              [30, 20], [70, 60], [120, 25], [160, 70], [210, 30],
              [260, 65], [310, 20], [350, 75], [50, 110], [100, 140],
              [190, 115], [240, 135], [290, 110], [340, 140], [380, 100]
            ].map(([x, y], i) => (
              <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 22} />
            ))}
          </g>

          {/* BIG BROWN MUD PUDDLE IN LAWN (Inference Clue!) */}
          <g transform="translate(100, 210)">
            {/* Puddle Base */}
            <ellipse cx="100" cy="40" rx="95" ry="32" fill="#78350F" stroke="#92400E" strokeWidth="2.5" />
            <ellipse cx="95" cy="38" rx="80" ry="24" fill="#92400E" />
            {/* Water Ripple rings */}
            <ellipse cx="95" cy="38" rx="60" ry="16" fill="none" stroke="#B45309" strokeWidth="2" />
            <ellipse cx="95" cy="38" rx="35" ry="9" fill="none" stroke="#D97706" strokeWidth="1.5" />
            {/* Muddy Splashes flying up */}
            <circle cx="30" cy="18" r="4" fill="#78350F" />
            <circle cx="50" cy="8" r="3" fill="#78350F" />
            <circle cx="150" cy="10" r="3.5" fill="#78350F" />
            <circle cx="170" cy="20" r="4" fill="#78350F" />
          </g>

          {/* MAX STOMPING FRONT PAWS IN MUD PUDDLE SPLASHING WITH JOY */}
          <g transform="translate(115, 110)">
            <MaxDog pose="puddle_splash" expression="splashing" muddyPaws={true} size={175} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 6 / QUESTION 3: "Max catches the red ball in the air."    */}
      {/* Clue: Leaping high to catch red ball, but muddy paws from mud!  */}
      {/* ============================================================== */}
      {pageNumber === 6 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Backyard Sky & Grass */}
          <rect width="400" height="190" fill="#BAE6FD" />
          <path d="M 0 180 Q 200 160 400 180 L 400 300 L 0 300 Z" fill="#4ADE80" />

          {/* Mud Puddle on ground below */}
          <ellipse cx="180" cy="245" rx="85" ry="26" fill="#78350F" stroke="#92400E" strokeWidth="2" />
          <ellipse cx="180" cy="244" rx="70" ry="18" fill="#92400E" />

          {/* BRIGHT RED BOUNCY BALL IN THE AIR (High in top-right) */}
          <g transform="translate(300, 55)">
            {/* Motion swoosh lines */}
            <path d="M -30 20 Q -10 10 0 0" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="3 3" fill="none" />
            {/* Red Ball */}
            <circle cx="0" cy="0" r="18" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
            {/* White highlight shine */}
            <circle cx="-5" cy="-6" r="6" fill="#FFFFFF" opacity="0.8" />
            {/* Ball stripe */}
            <path d="M -16 6 Q 0 0 16 6" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
          </g>

          {/* MAX LEAPING MID-AIR WITH MUDDY PAWS EXTENDED */}
          <g transform="translate(110, 75)">
            <MaxDog pose="leaping_catch" expression="leaping" muddyPaws={true} size={185} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 7: "Bath time is Max’s favorite hobby. He jumps in happily"*/}
      {/* Clue: Bathtub, water splashing everywhere, rubber duck, suds.  */}
      {/* ============================================================== */}
      {pageNumber === 7 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Bathroom Tiled Wall */}
          <rect width="400" height="210" fill="#E0F2FE" />
          <g stroke="#BAE6FD" strokeWidth="1.5" opacity="0.7">
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="210" />
            ))}
            {[35, 70, 105, 140, 175].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} />
            ))}
          </g>

          {/* Bathroom Floor */}
          <rect y="210" width="400" height="90" fill="#CBD5E1" />

          {/* WHITE PORCELAIN CLAWFOOT BATHTUB */}
          <g transform="translate(60, 130)">
            {/* Tub Base */}
            <ellipse cx="140" cy="95" rx="130" ry="25" fill="#E2E8F0" />
            <path
              d="M 10 30 Q 140 15 270 30 L 255 100 Q 140 115 25 100 Z"
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth="3.5"
            />
            {/* Tub Rim */}
            <ellipse cx="140" cy="30" rx="130" ry="22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
            {/* Water Inside Tub */}
            <ellipse cx="140" cy="32" rx="120" ry="18" fill="#38BDF8" opacity="0.8" />

            {/* Clawfoot tub legs */}
            <ellipse cx="40" cy="110" rx="8" ry="12" fill="#F59E0B" />
            <ellipse cx="240" cy="110" rx="8" ry="12" fill="#F59E0B" />

            {/* YELLOW RUBBER DUCK FLOATING IN TUB */}
            <g transform="translate(65, 15)">
              <circle cx="12" cy="10" r="9" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
              <ellipse cx="18" cy="17" rx="14" ry="9" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
              {/* Duck Beak */}
              <polygon points="5,10 0,12 5,14" fill="#FB923C" />
              <circle cx="9" cy="8" r="1.5" fill="#0F172A" />
            </g>

            {/* BUBBLES FLOATING IN AIR */}
            <g fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1.5">
              <circle cx="210" cy="-10" r="12" />
              <circle cx="235" cy="5" r="9" />
              <circle cx="25" cy="-5" r="10" />
              <circle cx="50" cy="-25" r="7" />
              <circle cx="190" cy="-35" r="8" />
            </g>
          </g>

          {/* MAX IN THE TUB SPLASHING WATER WITH BUBBLES ON HEAD */}
          <g transform="translate(125, 60)">
            <MaxDog pose="bath_splash" expression="splashing" soapBubbles={true} size={165} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 8 / QUESTION 4: "Now Max is completely dry..."            */}
      {/* Clue: Bathroom floor is completely flooded, Max dripping wet!  */}
      {/* ============================================================== */}
      {pageNumber === 8 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Bathroom Tiled Wall */}
          <rect width="400" height="190" fill="#E0F2FE" />
          <g stroke="#BAE6FD" strokeWidth="1.5" opacity="0.6">
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="190" />
            ))}
          </g>

          {/* FLOODED BATHROOM FLOOR (Inference Clue!) */}
          <rect y="190" width="400" height="110" fill="#94A3B8" />

          {/* Huge puddles of water on tiles */}
          <ellipse cx="120" cy="245" rx="80" ry="25" fill="#38BDF8" opacity="0.75" />
          <ellipse cx="280" cy="255" rx="90" ry="28" fill="#38BDF8" opacity="0.75" />
          <ellipse cx="200" cy="275" rx="120" ry="20" fill="#0EA5E9" opacity="0.6" />

          {/* Knocked-over shampoo bottle leaking suds */}
          <g transform="translate(60, 220)">
            <rect x="0" y="0" width="30" height="15" rx="4" transform="rotate(25)" fill="#EC4899" />
            <circle cx="28" cy="20" r="8" fill="#FFFFFF" opacity="0.9" />
            <circle cx="38" cy="25" r="5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Soggy wet bath mat */}
          <ellipse cx="200" cy="250" rx="90" ry="28" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <ellipse cx="200" cy="250" rx="80" ry="22" fill="#60A5FA" />

          {/* Droplets flying off fur */}
          <g fill="#38BDF8">
            <circle cx="110" cy="180" r="3.5" />
            <circle cx="125" cy="195" r="3" />
            <circle cx="280" cy="185" r="3.5" />
            <circle cx="295" cy="200" r="3" />
          </g>

          {/* MAX SOAKING WET DRIPPING WATER (Clearly NOT dry!) */}
          <g transform="translate(115, 105)">
            <MaxDog pose="wet_shiver" expression="nervous" isWet={true} soapBubbles={true} size={175} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 9: "Max stays awake all night. He protects the house."    */}
      {/* Clue: Bedroom at night, starry sky, Max sound asleep with cat!  */}
      {/* ============================================================== */}
      {pageNumber === 9 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Dark Cozy Bedroom Wall */}
          <rect width="400" height="300" fill="#1E1B4B" />

          {/* Arched Window with Night Sky */}
          <g transform="translate(40, 25)">
            {/* Arched Frame */}
            <path d="M 0 100 L 0 50 Q 50 0 100 50 L 100 100 Z" fill="#0F172A" stroke="#4338CA" strokeWidth="4" />
            {/* Crescent Moon */}
            <path d="M 60 30 A 18 18 0 0 0 45 60 A 24 24 0 0 1 60 30 Z" fill="#FDE047" />
            {/* Twinkling Stars */}
            <circle cx="25" cy="40" r="1.5" fill="#FFFFFF" />
            <circle cx="80" cy="35" r="2" fill="#FFFFFF" />
            <circle cx="75" cy="70" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Warm Bedside Lamp glowing */}
          <g transform="translate(340, 70)">
            <ellipse cx="0" cy="0" rx="35" ry="35" fill="#FEF08A" opacity="0.15" />
            <polygon points="-15,10 15,10 22,35 -22,35" fill="#FDE047" />
            <rect x="-3" y="35" width="6" height="30" fill="#78350F" />
          </g>

          {/* BIG COZY WOODEN BED */}
          <g transform="translate(50, 130)">
            {/* Headboard */}
            <rect x="0" y="0" width="300" height="30" rx="6" fill="#78350F" />
            {/* Mattress & Pillows */}
            <rect x="10" y="25" width="280" height="110" rx="10" fill="#F1F5F9" />
            <rect x="25" y="25" width="120" height="30" rx="12" fill="#E2E8F0" />
            <rect x="155" y="25" width="120" height="30" rx="12" fill="#E2E8F0" />

            {/* COLORFUL PATCHWORK QUILT BLANKET */}
            <g transform="translate(10, 60)">
              <rect width="280" height="80" rx="8" fill="#F43F5E" />
              {/* Quilt squares */}
              {[
                [0, 0, '#3B82F6'], [70, 0, '#F59E0B'], [140, 0, '#10B981'], [210, 0, '#8B5CF6'],
                [0, 40, '#EC4899'], [70, 40, '#06B6D4'], [140, 40, '#EAB308'], [210, 40, '#6366F1'],
              ].map(([x, y, color], i) => (
                <rect key={i} x={x as number} y={y as number} width="70" height="40" fill={color as string} stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
              ))}
            </g>

            {/* SLEEPING ORANGE CAT CUDDLED NEXT TO MAX */}
            <g transform="translate(180, 20)">
              <ellipse cx="25" cy="20" rx="22" ry="15" fill="#FB923C" stroke="#EA580C" strokeWidth="1.8" />
              <circle cx="10" cy="15" r="12" fill="#FB923C" stroke="#EA580C" strokeWidth="1.8" />
              <polygon points="4,7 8,-1 13,7" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
              <polygon points="12,7 16,-1 20,7" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
              <path d="M 6 15 Q 9 18 12 15" stroke="#7C2D12" strokeWidth="1.5" fill="none" />
              <circle cx="10" cy="18" r="1.5" fill="#FDA4AF" />
              {/* Cat Zzz */}
              <text x="35" y="0" fill="#FB923C" fontSize="12" fontWeight="bold">z</text>
            </g>
          </g>

          {/* MAX SOUND ASLEEP UNDER BLANKET (Inference Clue: Not awake!) */}
          <g transform="translate(85, 100)">
            <MaxDog pose="sleeping_cozy" expression="sleepy" size={160} />
          </g>
        </svg>
      )}

      {/* ============================================================== */}
      {/* PAGE 10 / QUESTION 5: "He is the most dangerous guard..."      */}
      {/* Clue: Close-up sleeping nose-to-nose with cat, sweet & cuddly! */}
      {/* ============================================================== */}
      {pageNumber === 10 && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Night Bedroom Zoom */}
          <rect width="400" height="300" fill="#1E1B4B" />

          {/* Soft Glow */}
          <circle cx="200" cy="150" r="180" fill="#312E81" opacity="0.6" />

          {/* Fluffy Bed Pillow */}
          <rect x="30" y="50" width="340" height="150" rx="30" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="3" />

          {/* Patchwork Quilt Edge tucked across bottom */}
          <path d="M 0 190 Q 200 170 400 190 L 400 300 L 0 300 Z" fill="#F43F5E" />
          <g opacity="0.7">
            <rect x="0" y="200" width="100" height="100" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="100" y="200" width="100" height="100" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="200" y="200" width="100" height="100" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="300" y="200" width="100" height="100" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* SLEEPING ORANGE TABBY CAT (Nose-to-nose on the right) */}
          <g transform="translate(210, 65)">
            <ellipse cx="60" cy="65" rx="50" ry="38" fill="#FB923C" stroke="#EA580C" strokeWidth="3" />
            {/* Tabby stripes */}
            <path d="M 50 35 Q 55 55 65 60" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            <path d="M 70 35 Q 75 55 85 60" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Cat Head facing Max */}
            <circle cx="15" cy="55" r="28" fill="#FB923C" stroke="#EA580C" strokeWidth="3" />
            <polygon points="5,35 15,10 26,33" fill="#FB923C" stroke="#EA580C" strokeWidth="2.5" />
            <polygon points="24,33 34,10 42,35" fill="#FB923C" stroke="#EA580C" strokeWidth="2.5" />
            {/* Cat sleeping closed eye */}
            <path d="M 2 55 Q 8 62 14 55" stroke="#7C2D12" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="4" cy="62" r="3" fill="#FDA4AF" />
            {/* Whiskers */}
            <line x1="-3" y1="60" x2="-20" y2="55" stroke="#7C2D12" strokeWidth="1.5" />
            <line x1="-3" y1="65" x2="-20" y2="68" stroke="#7C2D12" strokeWidth="1.5" />
            {/* Zzz */}
            <text x="70" y="20" fill="#FB923C" fontSize="16" fontWeight="bold">z</text>
            <text x="85" y="5" fill="#FB923C" fontSize="20" fontWeight="bold">Z</text>
          </g>

          {/* MAX SLEEPING NOSE-TO-NOSE WITH CAT ON THE LEFT */}
          <g transform="translate(45, 45)">
            <MaxDog pose="sleeping_closeup" expression="sleepy" size={190} />
          </g>

          {/* Heart between them */}
          <path
            d="M 195 110 C 195 105, 185 100, 185 110 C 185 120, 195 125, 195 125 C 195 125, 205 120, 205 110 C 205 100, 195 105, 195 110 Z"
            fill="#F43F5E"
            opacity="0.8"
          />
        </svg>
      )}

      {/* ============================================================== */}
      {/* RESULT / CELEBRATION SCENE                                     */}
      {/* ============================================================== */}
      {pageNumber === 'result' && (
        <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Festive Background */}
          <rect width="400" height="300" fill="#FEF3C7" />
          <circle cx="200" cy="150" r="140" fill="#FFFBEB" />

          {/* Colorful Confetti ribbons */}
          {[
            [40, 40, '#EF4444'], [80, 70, '#3B82F6'], [120, 30, '#10B981'],
            [280, 40, '#F59E0B'], [320, 80, '#8B5CF6'], [360, 35, '#EC4899'],
            [50, 150, '#06B6D4'], [350, 160, '#EAB308'], [70, 240, '#10B981'],
            [330, 230, '#EF4444']
          ].map(([x, y, color], i) => (
            <rect
              key={i}
              x={x as number}
              y={y as number}
              width="10"
              height="6"
              rx="2"
              fill={color as string}
              transform={`rotate(${((i * 37) % 80) - 40}, ${x}, ${y})`}
            />
          ))}

          {/* Golden Trophy / Podium Floor */}
          <ellipse cx="200" cy="245" rx="110" ry="25" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
          <ellipse cx="200" cy="242" rx="95" ry="18" fill="#FEF08A" />

          {/* MAX CELEBRATING WITH SHINY GOLD MEDAL */}
          <g transform="translate(115, 60)">
            <MaxDog pose="celebrating" expression="celebrating" hasMedal={true} size={175} />
          </g>
        </svg>
      )}
    </div>
  );
};
