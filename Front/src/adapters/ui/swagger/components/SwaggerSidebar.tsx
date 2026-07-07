import { SWAGGER_SECTION_TITLE } from '../apiCatalog';

type SwaggerSidebarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export function SwaggerSidebar({ searchTerm, onSearchChange }: SwaggerSidebarProps) {
  return (
    <div className="swagger-sidebar">
      <div className="swagger-sidebar__header">
        <h2 className="swagger-sidebar__title">{SWAGGER_SECTION_TITLE}</h2>
        <input
          type="search"
          className="swagger-sidebar__search"
          placeholder="Buscar endpoint..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
}
