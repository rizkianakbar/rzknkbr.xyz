type LootTechTagsProps = {
  tags: readonly string[];
};

export function LootTechTags(props: LootTechTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {props.tags.map((tag) => (
        <span key={tag} className="text-[11px] rounded-lg border border-border bg-muted/50 px-2 py-0.5">
          {tag}
        </span>
      ))}
    </div>
  );
}
