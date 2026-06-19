import { useAlias } from '../hooks/useAlias';

export const Dashboard = () => {
  const { aliases, loading, error, refetch } = useAlias();

  if (loading) return <p>Cargando alias...</p>;
  if (error) return <div><p>Error: {error}</p><button onClick={refetch}>Reintentar</button></div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Panel de Control de Alias</h2>
      
      {aliases.length === 0 ? (
        <p>No hay alias registrados.</p>
      ) : (
        <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Alias</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Cuentas</th>
            </tr>
          </thead>
          <tbody>
            {aliases.map((alias) => (
              <tr key={alias.customer_id}>
                <td>{alias.first_name} {alias.last_name}</td>
                <td>{alias.document_number}</td>
                <td><strong>{alias.alias}</strong></td>
                <td>{alias.email}</td>
                <td>{alias.phone}</td>
                <td>
                  <ul>
                    {alias.accounts?.map((acc, idx) => (
                      <li key={idx}>{acc.bank} - {acc.account_number}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};