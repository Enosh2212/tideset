"use client";
import { useEffect, useRef } from "react";

const scenes = [
  {
    title: "The conversation",
    label: "01 / BEFORE THE PLAN",
    text: "Good intentions. Different expectations.",
  },
  {
    title: "The agreement",
    label: "02 / ON THE SAME PAGE",
    text: "One $600 project. Three clear $200 stages.",
  },
  {
    title: "The next step",
    label: "03 / MOVING TOGETHER",
    text: "Payment recorded. Work reviewed. Each tracked separately.",
  },
];
export function IllustratedStory() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    section.current
      ?.querySelectorAll(".story-scene")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="tide-story tide-section"
      ref={section}
      aria-labelledby="story-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE SPACE BETWEEN A YES AND A DONE</span>
          <h2 id="story-heading">
            A little clarity.
            <br />
            <em>A different kind of working together.</em>
          </h2>
        </div>
        <p>
          Projects don’t fall apart over ambition.
          <br />
          Often, it’s the expectations left unsaid.
        </p>
      </div>
      <div className="storyboard">
        {scenes.map((scene, i) => (
          <article
            className={"story-scene scene-" + i}
            key={scene.title}
            style={{ "--scene-index": i } as React.CSSProperties}
          >
            <div
              className="scene-art"
              role="img"
              aria-label={
                i === 0
                  ? "Two collaborators discuss uncertain payment expectations."
                  : i === 1
                    ? "The collaborators review a three-stage plan together."
                    : "The customer checks a payment record while the provider prepares work."
              }
            >
              <div
                className="story-artwork"
                style={{ backgroundPosition: i * 50 + "% bottom" }}
              />
              {i === 0 && (
                <div className="scene-dialogue">
                  <span>How much should I pay now?</span>
                  <span>When do I get paid?</span>
                </div>
              )}
              {i === 1 && (
                <div className="scene-stage-strip">
                  {[1, 2, 3].map((n) => (
                    <span key={n}>
                      0{n}
                      <b>$200</b>
                    </span>
                  ))}
                </div>
              )}
              {i === 2 && (
                <div className="scene-progress">
                  <span>Payment record</span>
                  <span>Next deliverable</span>
                </div>
              )}
            </div>
            <div className="scene-caption">
              <span className="eyebrow">{scene.label}</span>
              <h3>{scene.title}</h3>
              <p>{scene.text}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="story-footnote">
        An illustrative collaboration. Payment and work progress are separate
        records. Bothway does not hold funds in escrow.
      </p>
    </section>
  );
}
