import { SPRITE_SIZE, type Sprite, spriteToRuns } from '@/lib/pixel-art';

type PixelArtProps = {
  sprite: Sprite;
  className?: string;
};

/** Crisp, scalable pixel art: an SVG grid that stays sharp at any size. */
export function PixelArt(props: PixelArtProps) {
  const { sprite, className } = props;

  return (
    <svg
      viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}>
      {spriteToRuns(sprite).map((run) => (
        <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height={1} fill={run.fill} />
      ))}
    </svg>
  );
}
