import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Footer from "../components/layout/Footer";

/* =========================================================
   RARE CREATIVE STUDIOS
   Services Page
   Theme: Ivory / Black / Cobalt Blue
   Responsive: Mobile / Tablet / Desktop
========================================================= */

const SERVICES = [
  {
    n: "01",
    label: "STRATEGY",
    name: ["Brand", "Strategy."],
    desc: "Before the first headline, there's a position. We define what your brand stands for, who it's for, and why it should matter.",
    detail: "Find your position.",
    type: "strategy",
  },
  {
    n: "02",
    label: "EARNED MEDIA",
    name: ["PR & Media", "Relations."],
    desc: "The right story, told to the right editors, creators, and communities, so coverage feels earned and conversation feels natural.",
    detail: "Make the story travel.",
    type: "media",
  },
  {
    n: "03",
    label: "CAMPAIGNS",
    name: ["Creative", "Campaigns."],
    desc: "Big, ownable ideas built to travel across media, talent, and culture, then executed with craft.",
    detail: "Create a point of view.",
    type: "campaign",
  },
  {
    n: "04",
    label: "NARRATIVE",
    name: ["Storytelling", "That Sticks."],
    desc: "We find the human truth inside your brand and shape it into narratives people want to share.",
    detail: "Give people something to feel.",
    type: "story",
  },
  {
    n: "05",
    label: "FILM & PRODUCTION",
    name: ["Made to", "Move You."],
    desc: "From concept to final cut, we direct, shoot, and edit films with a clear point of view and cinematic care.",
    detail: "Every frame has a purpose.",
    type: "film",
  },
  {
    n: "06",
    label: "DIGITAL",
    name: ["Digital", "Amplification."],
    desc: "Content, distribution, and audience touchpoints that keep a great idea moving long after launch.",
    detail: "Keep the conversation going.",
    type: "digital",
  },
];

const PROCESS = [
  {
    n: "01",
    name: "Insight",
    desc: "We start with the audience, the culture, and the business problem.",
    tag: "Understand",
  },
  {
    n: "02",
    name: "Idea",
    desc: "One sharp, ownable idea worth building everything around.",
    tag: "Imagine",
  },
  {
    n: "03",
    name: "Execution",
    desc: "Strategy, creative, and media delivered as one coordinated push.",
    tag: "Create",
  },
  {
    n: "04",
    name: "Impact",
    desc: "Attention that turns into conversation, and conversation into momentum.",
    tag: "Amplify",
  },
];

const FRAMES = [
  "STRATEGY",
  "STORY",
  "CULTURE",
  "CAMPAIGN",
  "CREATIVITY",
  "IMPACT",
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#124CCF]";

const SECTION =
  "relative overflow-hidden px-5 py-20 sm:px-8 sm:py-24 lg:px-[6vw] lg:py-32";

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .rcs-services-body {
    font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif;
  }

  .rcs-services-display {
    font-family: "Anton", "Arial Narrow", Impact, sans-serif;
    font-weight: 400;
    letter-spacing: -0.015em;
    line-height: 0.96;
    text-transform: uppercase;
  }

  .rcs-services-serif {
    font-family: "Playfair Display", Georgia, serif;
  }

  .rcs-services-mono {
    font-family: "IBM Plex Mono", "Courier New", monospace;
  }

  @keyframes rcs-services-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  @keyframes rcs-services-float {
    0%, 100% { transform: translateY(0px) rotate(-4deg); }
    50% { transform: translateY(-12px) rotate(-1deg); }
  }

  @keyframes rcs-services-pulse {
    0%, 100% { transform: scale(1); opacity: .75; }
    50% { transform: scale(1.06); opacity: 1; }
  }

  @keyframes rcs-services-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .rcs-services-marquee {
    animation: rcs-services-marquee 38s linear infinite;
  }

  .rcs-services-float {
    animation: rcs-services-float 7s ease-in-out infinite;
  }

  .rcs-services-pulse {
    animation: rcs-services-pulse 5s ease-in-out infinite;
  }

  .rcs-services-orbit {
    animation: rcs-services-orbit 30s linear infinite;
  }

  @media (hover: hover) {
    .rcs-services-marquee:hover {
      animation-play-state: paused;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rcs-services-marquee,
    .rcs-services-float,
    .rcs-services-pulse,
    .rcs-services-orbit {
      animation: none !important;
    }
  }
`;

/* =========================================================
   3D HERO OBJECT
========================================================= */

function RareObject() {
  const objectRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const element = objectRef.current;

    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const finePointer = window.matchMedia(
      "(pointer: fine)"
    ).matches;

    let targetX = -15;
    let targetY = 5;
    let currentX = -15;
    let currentY = 5;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      element.style.transform = `
        rotateX(${currentY}deg)
        rotateY(${currentX}deg)
      `;

      if (
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05
      ) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = 0;
      }
    };

    const requestAnimation = () => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    const handlePointer = (event) => {
      targetX =
        (event.clientX / window.innerWidth - 0.5) * 24 - 8;

      targetY =
        5 - (event.clientY / window.innerHeight - 0.5) * 12;

      requestAnimation();
    };

    const handleScroll = () => {
      targetX = Math.sin(window.scrollY / 450) * 8 - 12;
      targetY = 5 + Math.cos(window.scrollY / 550) * 3;

      requestAnimation();
    };

    const eventName = finePointer ? "pointermove" : "scroll";

    const handler = finePointer ? handlePointer : handleScroll;

    window.addEventListener(eventName, handler, {
      passive: true,
    });

    return () => {
      window.removeEventListener(eventName, handler);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const depth = 14;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[530px] select-none"
    >
      <div className="absolute inset-[8%] rounded-full bg-[#124CCF]/10 blur-3xl" />

      <div className="relative aspect-square [perspective:1000px]">
        <div className="absolute inset-[10%] rounded-full border border-[#124CCF]/15" />

        <div className="absolute inset-[19%] rounded-full border border-[#124CCF]/20" />

        <div className="absolute inset-[28%] rounded-full border border-[#124CCF]/25" />

        <div className="absolute inset-[36%] rounded-full border border-[#111111]/10" />

        <div className="absolute right-[8%] top-[15%] h-3 w-3 rounded-full bg-[#124CCF] shadow-[0_0_22px_rgba(18,76,207,0.3)]" />

        <div className="absolute bottom-[17%] left-[12%] h-2.5 w-2.5 rounded-full bg-[#C7B99D]" />

        <div
          ref={objectRef}
          className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]"
          style={{
            transform: "rotateX(5deg) rotateY(-15deg)",
          }}
        >
          {Array.from({ length: depth }, (_, index) => (
            <span
              key={index}
              className="
                rcs-services-display
                absolute
                text-[clamp(5.5rem,17vw,10.5rem)]
                leading-none
              "
              style={{
                transform: `translateZ(${-(depth - index) * 2}px)`,
                color: `hsl(222 78% ${30 + index * 2}%)`,
                WebkitTextStroke: "0.5px rgba(18,76,207,0.15)",
              }}
            >
              RARE
            </span>
          ))}

          <span
            className="
              rcs-services-display
              relative
              text-[clamp(5.5rem,17vw,10.5rem)]
              leading-none
              text-[#111111]
              drop-shadow-[0_16px_30px_rgba(17,17,17,0.10)]
            "
          >
            RARE
          </span>
        </div>

        <div className="rcs-services-float absolute bottom-[4%] right-[5%] grid h-[clamp(65px,12vw,100px)] w-[clamp(65px,12vw,100px)] place-items-center bg-[#124CCF] text-white shadow-[0_18px_40px_rgba(18,76,207,0.18)] [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]">
          <ArrowUpRight
            size={30}
            strokeWidth={1.2}
          />
        </div>
      </div>

      <div className="absolute bottom-[3%] left-0 hidden sm:block">
        <p className="rcs-services-mono text-[9px] uppercase tracking-[0.2em] text-black/45">
          Independent thinking.
        </p>

        <p className="rcs-services-mono mt-1 text-[9px] uppercase tracking-[0.2em] text-[#124CCF]">
          Uncommon outcomes.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SCROLL REVEAL
========================================================= */

function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={`
        transition-[opacity,transform]
        duration-700
        ease-out
        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-7 opacity-0"
        }
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}

/* =========================================================
   SERVICE ARTWORK
========================================================= */

function ServiceArtwork({ type, index }) {
  switch (type) {
    case "strategy":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#EFEBE1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(18,76,207,0.08),transparent_65%)]" />

          <div className="absolute left-[15%] top-[16%] h-[22%] w-[70%] border border-[#124CCF]/20" />

          <div className="absolute left-[22%] top-[26%] h-[22%] w-[56%] border border-[#124CCF]/35" />

          <div className="absolute left-[30%] top-[36%] h-[22%] w-[40%] border border-[#124CCF]/50" />

          <div className="absolute left-[38%] top-[46%] h-[22%] w-[24%] bg-[#124CCF] transition-transform duration-700 group-hover:translate-y-[-8px]" />

          <span className="rcs-services-mono absolute bottom-[12%] left-[9%] text-[9px] uppercase tracking-[0.2em] text-black/50">
            Position / 001
          </span>

          <span className="absolute bottom-[12%] right-[9%] text-[#124CCF]">
            <ArrowUpRight size={22} strokeWidth={1.2} />
          </span>
        </div>
      );

    case "media":
      return (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#EAE6DC]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49.8%,rgba(17,17,17,0.07)_50%,transparent_50.2%)] bg-[length:28px_28px]" />

          <div className="relative w-[65%] rotate-[-5deg] bg-[#F9F7F1] p-4 shadow-[0_25px_60px_rgba(17,17,17,0.12)] transition-transform duration-700 group-hover:rotate-0 sm:p-6">
            <div className="border-b-2 border-black pb-2">
              <p className="rcs-services-display text-lg sm:text-2xl">
                THE DAILY
              </p>

              <p className="rcs-services-mono mt-1 text-[7px] uppercase tracking-[0.15em] text-black/50">
                Culture / People / Ideas
              </p>
            </div>

            <div className="mt-4 grid grid-cols-[1.3fr_0.7fr] gap-2">
              <div className="h-20 bg-[#124CCF] sm:h-28" />

              <div className="flex flex-col justify-between gap-2">
                <span className="h-2 w-full bg-black/80" />
                <span className="h-2 w-4/5 bg-black/20" />
                <span className="h-2 w-full bg-black/20" />
                <span className="h-2 w-3/5 bg-black/20" />
              </div>
            </div>

            <p className="rcs-services-serif mt-4 text-lg italic sm:text-2xl">
              A story worth telling.
            </p>

            <div className="mt-3 h-px bg-black/15" />

            <div className="mt-3 flex items-center justify-between">
              <span className="rcs-services-mono text-[7px] tracking-widest text-black/45">
                EDITION 001
              </span>

              <ArrowUpRight size={15} />
            </div>
          </div>
        </div>
      );

    case "campaign":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#F0ECE3]">
          <div className="absolute -left-[8%] top-[15%] h-[70%] w-[40%] rotate-[-12deg] bg-[#124CCF] transition-transform duration-700 group-hover:-rotate-[18deg]" />

          <div className="absolute left-[29%] top-[10%] flex h-[80%] w-[42%] rotate-[4deg] flex-col justify-between bg-[#F9F7F1] p-4 shadow-xl transition-transform duration-700 group-hover:rotate-0 sm:p-6">
            <p className="rcs-services-mono text-[8px] tracking-widest text-black/45">
              CAMPAIGN / 003
            </p>

            <p className="rcs-services-display text-[clamp(1.7rem,5vw,4rem)] leading-[0.88] text-black">
              BIG
              <br />
              IDEAS.
            </p>

            <span className="flex items-center justify-between border-t border-black/15 pt-3">
              <span className="rcs-services-mono text-[7px] uppercase tracking-widest text-black/50">
                Make it matter
              </span>

              <ArrowUpRight size={17} />
            </span>
          </div>

          <div className="absolute -right-[6%] bottom-[13%] h-[35%] w-[30%] rotate-[15deg] border border-[#124CCF]/50 transition-transform duration-700 group-hover:rotate-[22deg]" />

          <div className="absolute right-[9%] top-[12%] h-4 w-4 rounded-full bg-[#124CCF]" />
        </div>
      );

    case "story":
      return (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#EAE6DC]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,76,207,0.10),transparent_70%)]" />

          <div className="relative aspect-[2/1] w-[82%] overflow-hidden border border-black/10 bg-[#F8F5EE] p-4 shadow-[0_20px_60px_rgba(17,17,17,0.08)] transition-transform duration-700 group-hover:scale-[1.025] sm:p-7">
            <div className="flex items-center justify-between">
              <span className="rcs-services-mono text-[7px] tracking-widest text-black/45 sm:text-[9px]">
                STORY / FRAME 001
              </span>

              <span className="h-2 w-2 rounded-full bg-[#124CCF]" />
            </div>

            <div className="mt-4 flex h-[55%] items-center justify-center overflow-hidden bg-[#124CCF]">
              <span className="rcs-services-serif text-[clamp(1.2rem,4vw,3.2rem)] italic text-white">
                The human truth.
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="rcs-services-display text-xs sm:text-base">
                Chapter one.
              </span>

              <ArrowUpRight size={19} />
            </div>
          </div>
        </div>
      );

    case "film":
      return (
        <div className="absolute inset-0 flex flex-col justify-center gap-3 overflow-hidden bg-[#EAE6DC] p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rcs-services-mono text-[8px] tracking-widest text-black/50">
              PRODUCTION STUDIO
            </span>

            <span className="rcs-services-mono text-[8px] text-[#124CCF]">
              REC ●
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "ROLL", bg: "bg-[#124CCF]", fg: "text-white" },
              { label: "FRAME", bg: "bg-[#F8F5EE]", fg: "text-black" },
              { label: "CUT", bg: "bg-[#DCD4C4]", fg: "text-black" },
              { label: "WRAP", bg: "bg-[#111111]", fg: "text-white" },
            ].map((frame, i) => (
              <div
                key={frame.label}
                className={`
                  ${frame.bg}
                  ${frame.fg}
                  rcs-services-display
                  grid
                  aspect-[3/4]
                  place-items-center
                  text-[clamp(0.55rem,1.8vw,1rem)]
                  transition-transform
                  duration-500
                  group-hover:-translate-y-2
                `}
                style={{
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                {frame.label}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-black/15 pt-3">
            <span className="rcs-services-mono text-[8px] uppercase tracking-widest text-black/50">
              Every frame matters.
            </span>

            <ArrowUpRight size={18} />
          </div>
        </div>
      );

    case "digital":
      return (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#EFEBE1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,76,207,0.10),transparent_65%)]" />

          <div className="relative aspect-square w-[75%]">
            {[0, 12, 24, 36, 48].map((inset, i) => (
              <span
                key={inset}
                className="
                  absolute
                  rounded-full
                  border
                  border-[#124CCF]/50
                  transition-transform
                  duration-700
                  group-hover:scale-105
                "
                style={{
                  inset: `${inset}%`,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            ))}

            <span className="rcs-services-pulse absolute inset-[43%] rounded-full bg-[#124CCF] shadow-[0_0_45px_rgba(18,76,207,0.22)]" />

            <span className="absolute right-[2%] top-[15%] h-3 w-3 rounded-full bg-[#111111]" />

            <span className="absolute bottom-[10%] left-[7%] h-2 w-2 rounded-full bg-[#C7B99D]" />
          </div>

          <span className="rcs-services-mono absolute bottom-[8%] left-[8%] text-[8px] uppercase tracking-widest text-black/45">
            Signal / Reach / Impact
          </span>
        </div>
      );

    default:
      return (
        <div className="absolute inset-0 grid place-items-center bg-[#EFEBE1]">
          <span className="rcs-services-display text-5xl text-[#124CCF]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      );
  }
}

/* =========================================================
   SERVICE ROW
========================================================= */

function ServiceRow({ service, index }) {
  const reverse = index % 2 === 1;

  return (
    <section
      id={`service-${service.n}`}
      aria-labelledby={`service-heading-${service.n}`}
      className={`
        group
        relative
        overflow-hidden
        border-t
        border-black/[0.09]
        px-5
        py-16
        sm:px-8
        sm:py-20
        lg:px-[6vw]
        lg:py-28
        ${index % 2 === 1 ? "bg-[#EFEBE1]" : "bg-[#F5F2EA]"}
      `}
    >
      <Reveal className="mx-auto grid max-w-[1380px] items-center gap-10 sm:gap-12 md:grid-cols-2 md:gap-14 lg:gap-24">
        <div className={reverse ? "md:order-2" : ""}>
          <p className="rcs-services-mono mb-6 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-black/50 sm:text-[10px]">
            <span className="text-[#124CCF]">
              {service.n}
            </span>

            <span className="h-px w-7 bg-black/20" />

            {service.label}
          </p>

          <h2
            id={`service-heading-${service.n}`}
            className="
              rcs-services-display
              max-w-[12ch]
              text-[clamp(2.5rem,7.5vw,5.5rem)]
              text-[#111111]
            "
          >
            {service.name.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="mt-6 max-w-[43ch] text-sm leading-[1.85] text-black/65 sm:text-base">
            {service.desc}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-5">
            <span className="rcs-services-serif text-base italic text-[#124CCF] sm:text-lg">
              {service.detail}
            </span>

            <Link
              to="/letsconnect"
              aria-label={`Discuss ${service.label.toLowerCase()} with Rare Creative Studios`}
              className={`
                grid
                h-11
                w-11
                shrink-0
                place-items-center
                rounded-full
                border
                border-black/20
                text-[#111111]
                transition-all
                duration-300
                hover:border-[#124CCF]
                hover:bg-[#124CCF]
                hover:text-white
                ${FOCUS}
              `}
            >
              <ArrowUpRight
                size={19}
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>

        <div className={reverse ? "md:order-1" : ""}>
          <div className="relative">
            <div className="absolute -inset-3 border border-black/[0.06] transition-transform duration-700 group-hover:inset-0" />

            <div className="relative aspect-[4/3] overflow-hidden border border-black/[0.08]">
              <ServiceArtwork
                type={service.type}
                index={index}
              />
            </div>

            <div className="rcs-services-mono mt-3 flex items-center justify-between text-[8px] uppercase tracking-[0.18em] text-black/40 sm:text-[9px]">
              <span>Rare Creative Studios</span>

              <span>{service.n} / 06</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* =========================================================
   PROCESS STEP
========================================================= */

function ProcessStep({ step, index }) {
  return (
    <Reveal
      as="li"
      delay={index * 100}
      className="
        relative
        border-t
        border-black/15
        pt-6
        sm:pt-8
      "
    >
      <div className="mb-8 flex items-center justify-between">
        <span className="rcs-services-mono text-[10px] tracking-widest text-[#124CCF]">
          {step.n}
        </span>

        <span className="rcs-services-mono text-[9px] uppercase tracking-widest text-black/40">
          {step.tag}
        </span>
      </div>

      <h3 className="rcs-services-display text-[clamp(1.65rem,3vw,2.7rem)] text-[#111111]">
        {step.name}
      </h3>

      <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-black/60">
        {step.desc}
      </p>

      <div className="mt-7 flex items-center justify-between">
        <div className="h-px flex-1 bg-black/10" />

        <span className="ml-3 grid h-8 w-8 place-items-center rounded-full border border-black/15 text-[#124CCF] transition-colors duration-300 hover:bg-[#124CCF] hover:text-white">
          <Plus size={14} />
        </span>
      </div>
    </Reveal>
  );
}

/* =========================================================
   MAIN SERVICES PAGE
========================================================= */

export default function Services() {
  const scrollToServices = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.getElementById("services-start")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <style>{FONT_CSS}</style>

      <main className="rcs-services-body overflow-hidden bg-[#F5F2EA] text-[#111111]">
        {/* =================================================
            HERO
        ================================================= */}

        <header className="relative isolate overflow-hidden bg-[#F5F2EA] px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 md:pb-24 md:pt-40 lg:px-[6vw] lg:pt-44">
          {/* Subtle paper-like geometry */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute right-[-20%] top-[-20%] h-[70vw] w-[70vw] rounded-full bg-[#124CCF]/[0.045] blur-3xl" />

            <div className="absolute bottom-0 left-0 h-px w-full bg-black/10" />

            <div className="absolute right-[8%] top-[18%] hidden h-[35%] w-px bg-black/[0.07] lg:block" />

            <div className="absolute right-[8%] top-[18%] hidden h-px w-[20%] bg-black/[0.07] lg:block" />
          </div>

          <div className="mx-auto grid max-w-[1380px] items-center gap-8 md:grid-cols-12 md:gap-5 lg:gap-10">
            {/* Hero copy */}

            <div className="relative z-10 md:col-span-7">
              <Reveal>
                <p className="rcs-services-mono mb-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-black/55 sm:text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-[#124CCF]" />

                  Strategy / Story / Culture
                </p>

                <h1 className="rcs-services-display max-w-[11ch] text-[clamp(3.1rem,9.2vw,8.2rem)] text-[#111111]">
                  <span className="block">
                    We make
                  </span>

                  <span className="block">
                    brands
                  </span>

                  <span className="rcs-services-serif block font-normal italic tracking-[-0.06em] text-[#124CCF]">
                    impossible
                  </span>

                  <span className="block">
                    to ignore.
                  </span>
                </h1>

                <p className="mt-7 max-w-[43ch] text-sm leading-[1.9] text-black/65 sm:text-base">
                  We combine strategy, storytelling, PR, and
                  creative production to turn brands into
                  conversations people want to be part of.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-5 sm:mt-10 sm:gap-8">
                  <button
                    type="button"
                    onClick={scrollToServices}
                    className={`
                      group
                      inline-flex
                      min-h-12
                      items-center
                      gap-4
                      rounded-full
                      bg-[#124CCF]
                      px-6
                      text-[11px]
                      font-semibold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-[#111111]
                      sm:px-7
                      ${FOCUS}
                    `}
                  >
                    Explore our services

                    <ArrowDown
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-y-1"
                    />
                  </button>

                  <Link
                    to="/letsconnect"
                    className={`
                      group
                      inline-flex
                      min-h-12
                      items-center
                      gap-3
                      text-[11px]
                      font-semibold
                      text-[#111111]
                      transition-colors
                      duration-300
                      hover:text-[#124CCF]
                      ${FOCUS}
                    `}
                  >
                    Let's collaborate

                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Animated 3D object */}

            <div className="relative md:col-span-5">
              <Reveal delay={150}>
                <RareObject />
              </Reveal>
            </div>
          </div>

          {/* Hero bottom information */}

          <div className="mx-auto mt-10 flex max-w-[1380px] flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between md:mt-12">
            <span className="rcs-services-mono text-[9px] uppercase tracking-[0.2em] text-black/45">
              Independent creative studio
            </span>

            <span className="rcs-services-mono text-[9px] uppercase tracking-[0.2em] text-black/45">
              Hyderabad / Everywhere
            </span>
          </div>
        </header>

        {/* =================================================
            MOVING CAPABILITIES STRIP
        ================================================= */}

        <section
          aria-label="Creative capabilities"
          className="overflow-hidden border-b border-black/10 bg-[#EFEBE1] py-5 sm:py-7"
        >
          <div className="rcs-services-mono mb-4 text-center text-[8px] uppercase tracking-[0.25em] text-black/40 sm:text-[9px]">
            What moves us
          </div>

          <div className="relative overflow-hidden">
            <div className="rcs-services-marquee flex w-max motion-reduce:transform-none">
              {[...FRAMES, ...FRAMES].map((frame, index) => (
                <div
                  key={`${frame}-${index}`}
                  className="mx-2 flex shrink-0 items-center gap-5 sm:mx-4 sm:gap-8"
                >
                  <span
                    className={`
                      rcs-services-display
                      text-[clamp(1.5rem,4vw,3rem)]
                      ${
                        index % 3 === 1
                          ? "text-[#124CCF]"
                          : "text-[#111111]"
                      }
                    `}
                  >
                    {frame}
                  </span>

                  <span className="h-2 w-2 shrink-0 rotate-45 bg-[#124CCF]/45" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            INTRODUCTION TO SERVICES
        ================================================= */}

        <section
          className="
            bg-[#F5F2EA]
            px-5
            py-16
            sm:px-8
            sm:py-20
            lg:px-[6vw]
            lg:py-24
          "
        >
          <Reveal className="mx-auto grid max-w-[1380px] gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="rcs-services-mono mb-5 text-[9px] uppercase tracking-[0.25em] text-[#124CCF]">
                What we do
              </p>

              <h2 className="rcs-services-display max-w-[12ch] text-[clamp(2.5rem,6.5vw,6rem)] text-[#111111]">
                Good work.
                <br />

                <span className="rcs-services-serif font-normal italic text-[#124CCF]">
                  Real meaning.
                </span>
              </h2>
            </div>

            <div className="md:col-span-5 md:justify-self-end">
              <p className="max-w-[43ch] text-sm leading-[1.9] text-black/60 sm:text-base">
                We bring the right minds together to build
                stories, experiences, and campaigns that earn
                attention instead of asking for it.
              </p>

              <p className="rcs-services-mono mt-5 text-[9px] uppercase tracking-[0.18em] text-black/40">
                Six capabilities. One point of view.
              </p>
            </div>
          </Reveal>
        </section>

        {/* =================================================
            SERVICES
        ================================================= */}

        <div id="services-start" className="scroll-mt-20">
          {SERVICES.map((service, index) => (
            <ServiceRow
              key={service.n}
              service={service}
              index={index}
            />
          ))}
        </div>

        {/* =================================================
            PROCESS
        ================================================= */}

        <section
          aria-labelledby="process-heading"
          className="
            relative
            overflow-hidden
            border-t
            border-black/10
            bg-[#EFEBE1]
            px-5
            py-20
            sm:px-8
            sm:py-24
            lg:px-[6vw]
            lg:py-32
          "
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#124CCF]/[0.045] blur-3xl"
          />

          <div className="relative mx-auto max-w-[1380px]">
            <Reveal>
              <p className="rcs-services-mono mb-5 text-[9px] uppercase tracking-[0.25em] text-[#124CCF]">
                How we work
              </p>

              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <h2
                  id="process-heading"
                  className="rcs-services-display max-w-[10ch] text-[clamp(2.8rem,7vw,6.5rem)] text-[#111111]"
                >
                  From first thought
                  <span className="rcs-services-serif block font-normal italic text-[#124CCF]">
                    to lasting impact.
                  </span>
                </h2>

                <p className="max-w-[32ch] pb-2 text-sm leading-[1.9] text-black/60 sm:text-base">
                  A clear process. A collaborative approach.
                  An outcome worth remembering.
                </p>
              </div>
            </Reveal>

            <ol className="mt-14 grid gap-10 sm:mt-20 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-8">
              {PROCESS.map((step, index) => (
                <ProcessStep
                  key={step.n}
                  step={step}
                  index={index}
                />
              ))}
            </ol>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section
          aria-labelledby="services-cta-heading"
          className="
            relative
            isolate
            overflow-hidden
            border-t
            border-black/10
            bg-[#F5F2EA]
            px-5
            py-20
            sm:px-8
            sm:py-28
            lg:px-[6vw]
            lg:py-36
          "
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -right-[10%] top-[-40%] h-[80vw] w-[80vw] rounded-full bg-[#124CCF]/[0.055] blur-3xl" />

            <div className="absolute bottom-0 left-0 h-px w-full bg-black/10" />

            <div className="absolute right-[10%] top-[18%] hidden h-20 w-20 rounded-full border border-[#124CCF]/20 sm:block" />

            <div className="absolute right-[13%] top-[22%] hidden h-14 w-14 rounded-full border border-black/10 sm:block" />
          </div>

          <Reveal className="mx-auto flex max-w-[1380px] flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-12">
            <div>
              <p className="rcs-services-mono mb-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-black/50">
                <span className="h-2 w-2 rounded-full bg-[#124CCF]" />

                Your next big thing starts here
              </p>

              <h2
                id="services-cta-heading"
                className="rcs-services-display max-w-[12ch] text-[clamp(3rem,8vw,7.5rem)] text-[#111111]"
              >
                Got a big
                <br />

                <span className="rcs-services-serif font-normal italic text-[#124CCF]">
                  idea?
                </span>
              </h2>

              <p className="mt-6 max-w-[42ch] text-sm leading-[1.9] text-black/60 sm:text-base">
                Tell us what you're thinking. Let's make
                something people remember.
              </p>
            </div>

            <Link
              to="/letsconnect"
              className={`
                group
                inline-flex
                min-h-14
                w-fit
                items-center
                gap-5
                rounded-full
                bg-[#124CCF]
                px-6
                text-[12px]
                font-semibold
                text-white
                transition-all
                duration-300
                hover:bg-[#111111]
                sm:px-8
                ${FOCUS}
              `}
            >
              Start a conversation

              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/30 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={17} />
              </span>
            </Link>
          </Reveal>
        </section>
      </main>

      {/* Shared ivory footer */}

    </>
  );
}