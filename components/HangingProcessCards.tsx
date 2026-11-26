"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { processSteps, StageMiniature, StagePreview } from "./StagePreview";
export function HangingProcessCards() {
  const [active, setActive] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (n: number, focus = false) => {
    const next = (n + 5) % 5;
    setActive(next);
    if (focus) refs.current[next]?.focus();
  };
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    select(
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 4
          : active + (event.key === "ArrowRight" ? 1 : -1),
      true,
    );
  }
  return (
    <section
      className="tide-process tide-section"
      id="how-it-works"
      aria-labelledby="process-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">LESS GUESSWORK. MORE GOOD WORK.</span>
          <h2 id="process-heading">
            From the first idea
            <br />
            <em>to the final handoff.</em>
          </h2>
        </div>
        <p>
          Five small steps. One shared direction.
          <br />
          <span className="process-hint">
            <RotateCw size={14} /> Select a stage to turn it over.
          </span>
        </p>
      </div>
      <div className="exhibition" onKeyDown={keyboard}>
        <div className="exhibition-rail" aria-hidden="true">
          <i />
          <span>TIDESET / THE PROCESS</span>
          <i />
        </div>
        <div
          className="hanging-stages"
          aria-label="Explore the five project stages"
        >
          {processSteps.map((step, i) => (
            <div
              className={"stage-object " + (active === i ? "selected" : "")}
              key={step.title}
              style={{ "--card-index": i } as React.CSSProperties}
            >
              <div className="stage-attachment" aria-hidden="true">
                <i />
                <span />
              </div>
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                className="stage-toggle"
                aria-label={"Stage " + (i + 1) + ": " + step.title}
                aria-pressed={active === i}
                aria-controls="process-details"
                onClick={() => select(i)}
              >
                <span className="stage-rotor">
                  <span
                    className="stage-face stage-front"
                    aria-hidden={active === i}
                  >
                    <span className="stage-number">
                      0{i + 1}
                      <ArrowRight size={16} />
                    </span>
                    <StageMiniature step={i} />
                    <strong>{step.title}</strong>
                    <span className="stage-subtitle">{step.short}</span>
                  </span>
                  <span
                    className="stage-face stage-back"
                    aria-hidden={active !== i}
                  >
                    <span className="stage-number">
                      0{i + 1}
                      <step.icon size={18} />
                    </span>
                    <strong>{step.title}</strong>
                    <span>{step.detail}</span>
                    <span className="stage-turn-cue">
                      Explore this step <ArrowRight size={15} />
                    </span>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
        <div className="process-mobile-nav">
          <button
            aria-label="Previous stage"
            onClick={() => select(active - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            0{active + 1} <i>/ 05</i>
          </span>
          <button aria-label="Next stage" onClick={() => select(active + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        className="process-details"
        id="process-details"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="process-detail-copy" key={active}>
          <span className="eyebrow">STEP 0{active + 1}</span>
          <h3>{processSteps[active].short}</h3>
          <p>{processSteps[active].detail}</p>
          <a href="/signup" className="text-link">
            Start your own agreement <ArrowRight size={17} />
          </a>
        </div>
        <StagePreview step={active} />
      </div>
    </section>
  );
}
