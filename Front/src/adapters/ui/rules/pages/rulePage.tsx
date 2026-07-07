import { useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import type { AppPage } from '../../navigation';
import { BUSINESS_RULE_GROUPS } from '../rulesCatalog';
import { RulesSidebar } from '../components/RulesSidebar';
import { RulesGroupList } from '../components/RulesGroupList';
import { RulesDoc } from '../components/RulesDoc';
import '../rules_layout.css';
import '../rules_theme.css';

type RulesPageProps = {
  onNavigate: (page: AppPage) => void;
};

export function RulesPage({ onNavigate }: RulesPageProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(
    BUSINESS_RULE_GROUPS[0]?.id ?? '',
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return BUSINESS_RULE_GROUPS;
    }

    return BUSINESS_RULE_GROUPS.filter((group) => {
      const groupMatches =
        group.title.toLowerCase().includes(term) ||
        (group.intro ?? '').toLowerCase().includes(term);

      const ruleMatches = group.rules.some(
        (rule) =>
          rule.code.toLowerCase().includes(term) ||
          rule.title.toLowerCase().includes(term) ||
          rule.description.toLowerCase().includes(term) ||
          rule.bullets?.some((bullet) => bullet.toLowerCase().includes(term)),
      );

      return groupMatches || ruleMatches;
    });
  }, [searchTerm]);

  const selectedGroup =
    BUSINESS_RULE_GROUPS.find((group) => group.id === selectedGroupId) ??
    filteredGroups[0] ??
    null;

  return (
    <AppShell
      activeItem="rules"
      onNavigate={onNavigate}
      pageClassName="dashboard-page--rules"
      mainClassName="dashboard-main--rules"
    >
      <div className="rules-page">
        <aside className="rules-page__sidebar">
          <RulesSidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <RulesGroupList
            groups={filteredGroups}
            selectedGroupId={selectedGroup?.id ?? null}
            onSelectGroup={setSelectedGroupId}
          />
        </aside>

        <section className="rules-page__doc">
          <RulesDoc group={selectedGroup} />
        </section>
      </div>
    </AppShell>
  );
}
