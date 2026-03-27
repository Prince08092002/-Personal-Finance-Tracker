export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
        <p className="color-muted text-center" style={{ margin: 0 }}>
          No recent transactions found.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
      {transactions.map((t, i) => (
        <div 
          key={`${t.type}-${t.id}-${t.date}-${i}`} 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: 'var(--space-md)',
            borderBottom: i < transactions.length - 1 ? '1px solid var(--glass-border)' : 'none'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{t.title}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {new Date(t.date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span style={{ 
              fontWeight: '600', 
              color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' 
            }}>
              {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
