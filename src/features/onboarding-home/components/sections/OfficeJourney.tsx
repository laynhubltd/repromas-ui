import { GraduateAvatar } from "@/assets/illustrations/GraduateAvatar";
import { MarketingModuleIcon } from "@/assets/illustrations/MarketingModuleIcons";
import { useOfficeJourney } from "../../hooks/useOfficeJourney";
import type { OfficeJourney as OfficeJourneyContent } from "../../types";
import { JOURNEY_VIEWBOX } from "../../utils/journey-geometry";
import styles from "../HomePage.module.css";

type OfficeJourneyProps = {
  journey: OfficeJourneyContent;
};

const cx = (...names: (string | false)[]): string => names.filter(Boolean).join(" ");

/** Hero diagram: one student record in the centre, every office on the ring, and the student's journey between them. */
export function OfficeJourney({ journey }: OfficeJourneyProps) {
  const {
    svgRef,
    dotRef,
    setTrailRef,
    center,
    ringRadius,
    nodeRadius,
    offices,
    paths,
    stepIndex,
    stepProgress,
    isPaused,
    isRecordActive,
    isOfficeActive,
    isSpokeActive,
    togglePause,
  } = useOfficeJourney(journey);
  const dot = paths[stepIndex].pointAt(stepProgress);

  return (
    <div className={styles.heroVisual}>
      <div className={styles.journeyFrame}>
        <svg
          ref={svgRef}
          className={styles.journey}
          viewBox={`0 0 ${JOURNEY_VIEWBOX.width} ${JOURNEY_VIEWBOX.height}`}
          role="img"
          aria-labelledby="journey-title"
        >
          <title id="journey-title">{journey.title}</title>
          <circle className={styles.journeyDeco} cx={center} cy={center} r={262} strokeOpacity={0.14} />
          <circle
            className={styles.journeyDeco}
            cx={center}
            cy={center}
            r={120}
            strokeOpacity={0.16}
            strokeDasharray="2 5"
          />
          <line className={styles.journeyDeco} x1={6} y1={center} x2={554} y2={center} strokeOpacity={0.08} />
          <line className={styles.journeyDeco} x1={center} y1={6} x2={center} y2={554} strokeOpacity={0.08} />
          <circle className={styles.journeyRing} cx={center} cy={center} r={ringRadius} />

          {offices.map((office) => (
            <line
              key={office.id}
              className={cx(styles.journeySpoke, isSpokeActive(office.id) && styles.journeySpokeOn)}
              x1={office.spokeStart.x}
              y1={office.spokeStart.y}
              x2={center}
              y2={center}
            />
          ))}

          {paths.map((path, index) => (
            <path
              key={journey.steps[index].title}
              ref={setTrailRef(index)}
              className={cx(
                styles.journeyTrail,
                index < stepIndex && styles.journeyTrailDone,
                index === stepIndex && styles.journeyTrailCurrent,
              )}
              d={path.d}
              strokeDasharray={path.length}
              strokeDashoffset={
                index < stepIndex ? 0 : index === stepIndex ? path.length * (1 - stepProgress) : path.length
              }
              data-testid="journey-trail"
            />
          ))}

          {offices.map((office) => (
            <g
              key={office.id}
              className={cx(styles.journeyOffice, isOfficeActive(office.id) && styles.journeyOfficeOn)}
              data-testid="journey-office"
              data-active={isOfficeActive(office.id)}
            >
              <circle className={styles.journeyHalo} cx={office.point.x} cy={office.point.y} r={38} />
              <circle className={styles.journeyNode} cx={office.point.x} cy={office.point.y} r={nodeRadius} />
              <g transform={`translate(${office.point.x - 16} ${office.point.y - 16})`}>
                <MarketingModuleIcon id={office.icon} size={32} />
              </g>
              <text
                className={styles.journeyName}
                x={office.point.x}
                y={office.point.y + nodeRadius + 18}
                textAnchor="middle"
              >
                {office.name}
              </text>
              <text
                className={styles.journeyRole}
                x={office.point.x}
                y={office.point.y + nodeRadius + 32}
                textAnchor="middle"
              >
                {office.role}
              </text>
            </g>
          ))}

          <g className={cx(styles.journeyStudent, isRecordActive && styles.journeyStudentOn)} data-testid="journey-student">
            <GraduateAvatar
              cx={center}
              cy={center}
              ringClassName={styles.journeyStudentRing}
              haloClassName={styles.journeyStudentHalo}
            />
          </g>

          <circle ref={dotRef} className={styles.journeyDot} r={5.5} cx={dot.x} cy={dot.y} />
        </svg>
        <button
          type="button"
          className={styles.journeyPlay}
          onClick={togglePause}
          aria-pressed={isPaused}
          aria-label={isPaused ? "Play animation" : "Pause animation"}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {isPaused ? <path d="M5 3.5v9l7.5-4.5z" /> : <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" />}
          </svg>
        </button>
      </div>

      <ol className={styles.srOnly}>
        {journey.steps.map((item) => (
          <li key={item.title}>
            {item.title}: {item.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
