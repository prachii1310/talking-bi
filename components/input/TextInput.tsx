'use client'
import { useState, KeyboardEvent } from 'react'

interface Props {
  onSubmit:    (text: string) => void
  placeholder?: string
  disabled?:   boolean
  value?:      string
  onChange?:   (v: string) => void
}

export default function TextInput({ onSubmit, placeholder = 'Type your KPIs or question...', disabled, value, onChange }: Props) {
  const [internal, setInternal] = useState('')

  // Support both controlled (value+onChange) and uncontrolled mode
  const val    = value    !== undefined ? value    : internal
  const setVal = onChange !== undefined ? onChange : setInternal

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && val.trim() && !disabled) {
      onSubmit(val.trim())
      if (onChange === undefined) setInternal('')
    }
  }

  function handleSend() {
    if (val.trim() && !disabled) {
      onSubmit(val.trim())
      if (onChange === undefined) setInternal('')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        className="input"
        placeholder={placeholder}
        value={val}
        disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1 }}
      />
      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={disabled || !val.trim()}
        style={{ opacity: disabled || !val.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
      >
        Send →
      </button>
    </div>
  )
}