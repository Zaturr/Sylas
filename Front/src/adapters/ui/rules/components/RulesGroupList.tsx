import type { BusinessRuleGroup } from '../rulesCatalog';

type RulesGroupListProps = {
  groups: BusinessRuleGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
};

export function RulesGroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
}: RulesGroupListProps) {
  if (groups.length === 0) {
    return <p className="rules-group-list__empty">No hay reglas para mostrar.</p>;
  }

  return (
    <div className="rules-group-list">
      {groups.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`rules-group-list__item${
            selectedGroupId === group.id ? ' rules-group-list__item--active' : ''
          }`}
          onClick={() => onSelectGroup(group.id)}
        >
          <span className="rules-group-list__title">{group.title}</span>
          <span className="rules-group-list__count">{group.rules.length} reglas</span>
        </button>
      ))}
    </div>
  );
}
