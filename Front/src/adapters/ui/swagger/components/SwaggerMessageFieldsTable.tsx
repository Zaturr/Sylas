import type { SwaggerMessageField } from '../simfMessageSchemas';

type SwaggerMessageFieldsTableProps = {
  fields: readonly SwaggerMessageField[];
};

export function SwaggerMessageFieldsTable({ fields }: SwaggerMessageFieldsTableProps) {
  return (
    <table className="swagger-endpoint-doc__table">
      <thead>
        <tr>
          <th>Parámetro</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => (
          <tr key={field.name}>
            <td>
              <code>{field.name}</code>
            </td>
            <td>{field.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
