import { RULES_SECTION_TITLE } from '../rulesCatalog';

type RulesSidebarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export function RulesSidebar({ searchTerm, onSearchChange }: RulesSidebarProps) {
  return (
    <div className="rules-sidebar">
      <div className="rules-sidebar__header">
        <h2 className="rules-sidebar__title">{RULES_SECTION_TITLE}</h2>
        <input
          type="search"
          className="rules-sidebar__search"
          placeholder="Buscar regla..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
}
