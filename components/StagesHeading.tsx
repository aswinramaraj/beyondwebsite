import { steps } from '@/lib/content';

/** Intro heading that slides away as the pinned stages section begins (IX2 a-171). */
export default function StagesHeading() {
  return (
    <div id="approach" section-color="white" data-w-id="2a8753b8-3b85-8b9c-c07b-1f7ef622e640" className="case--new-heading-wrap">
      <div className="case--new-heading">
        <h2 id="movingText1" className="case-heading set-1 bl-steps-title">
          {steps.title}
        </h2>
        <div className="case-heading-new-botr">
          <div id="movingText3" className="b1 max-w-37-5 bl-steps-sub">{steps.sub}</div>
        </div>
      </div>
    </div>
  );
}
