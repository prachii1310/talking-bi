'use client'

export default function LayoutSelector({ onConfirm }: { onConfirm: () => void }) {
  return (
    <button
      className="btn btn-primary"
      onClick={onConfirm}
      style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
    >
      Use this dashboard → go to chat
    </button>
  )
}
