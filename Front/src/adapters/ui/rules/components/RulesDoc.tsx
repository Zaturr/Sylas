import type { BusinessRuleGroup } from '../rulesCatalog';
import { formatRuleText } from '../formatRuleText';

type RulesDocProps = {
  group: BusinessRuleGroup | null;
};

export function RulesDoc({ group }: RulesDocProps) {
  if (!group) {
    return <p className="rules-doc__empty">Selecciona un tipo de regla.</p>;
  }

  return (
    <article className="rules-doc">
      <header className="rules-doc__header">
        <h1 className="rules-doc__title">{group.title}</h1>
        {group.intro && <p className="rules-doc__intro">{formatRuleText(group.intro)}</p>}
      </header>

      {group.rules.map((rule) => (
        <section key={rule.id} className="rules-doc__section">
          <h2 className="rules-doc__code">{rule.code}</h2>
          <h3 className="rules-doc__subtitle">{formatRuleText(rule.title)}</h3>
          <p className="rules-doc__description">{formatRuleText(rule.description)}</p>

          {rule.bullets && rule.bullets.length > 0 && (
            <ul className="rules-doc__bullets">
              {rule.bullets.map((item, index) => (
                <li key={`${rule.id}-bullet-${index}`}>{formatRuleText(item)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
