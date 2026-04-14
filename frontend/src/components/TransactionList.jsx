const HIGH_TRANSACTION_MIN = 10000;

export default function TransactionList({ transactions, highlightHighTransactions = false }) {
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
      {transactions.map((t, i) => {
        const amountNum = Number(t.amount);
        const isHigh =
          highlightHighTransactions &&
          t.type === 'expense' &&
          !Number.isNaN(amountNum) &&
          amountNum > HIGH_TRANSACTION_MIN;

        return (
          <div
            key={`${t.type}-${t.id}-${t.date}-${i}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-md)',
              borderBottom: i < transactions.length - 1 ? '1px solid var(--glass-border)' : 'none',
              background: isHigh ? 'rgba(253, 224, 71, 0.14)' : undefined,
              boxShadow: isHigh ? 'inset 3px 0 0 rgba(250, 204, 21, 0.75)' : undefined
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{t.title}</h4>
                {isHigh && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#ca8a04',
                      background: 'rgba(253, 224, 71, 0.35)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    High transaction
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(t.date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span style={{
                fontWeight: '600',
                color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'
              }}>
                {t.type === 'income' ? '+' : '-'}₹{amountNum.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
