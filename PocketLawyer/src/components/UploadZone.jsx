import { useRef, useState } from 'react'
import { compressImage } from '../utils/compressImage.js'

const MAX_IMAGES = 25
const PDF_WARN_SIZE = 10 * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UploadZone({ files, onFilesChange }) {
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef(null)

  const fileType =
    files.length === 0 ? null
    : files[0].file.type === 'application/pdf' ? 'pdf'
    : 'image'

  async function processFiles(fileList) {
    const list = Array.from(fileList).filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    if (!list.length) return

    const hasPdf = list.some(f => f.type === 'application/pdf')
    const hasImg = list.some(f => f.type.startsWith('image/'))

    if (hasPdf && hasImg) {
      alert('Cannot mix images and PDFs. Please upload one type only.')
      return
    }
    if (hasPdf && fileType === 'image') {
      alert('Remove your images first before uploading a PDF.')
      return
    }
    if (hasImg && fileType === 'pdf') {
      alert('Remove your PDF first before uploading images.')
      return
    }

    setProcessing(true)
    try {
      if (hasPdf) {
        const pdf = list[0]
        if (pdf.size > PDF_WARN_SIZE) {
          alert('PDF is large (>10MB). For best results upload only relevant pages.')
        }
        const data = await readAsBase64(pdf)
        onFilesChange([{ file: pdf, preview: null, data }])
        return
      }

      const remaining = MAX_IMAGES - files.length
      if (remaining <= 0) return
      const toAdd = list.filter(f => f.type.startsWith('image/')).slice(0, remaining)
      if (list.length > remaining) {
        alert(`Maximum ${MAX_IMAGES} images allowed. Only ${remaining} slot(s) remaining.`)
      }

      const results = []
      for (const file of toAdd) {
        const data = await compressImage(file)
        results.push({ file, preview: URL.createObjectURL(file), data })
      }
      onFilesChange([...files, ...results])
    } finally {
      setProcessing(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  function handleRemove(index) {
    const item = files[index]
    if (item.preview) URL.revokeObjectURL(item.preview)
    onFilesChange(files.filter((_, i) => i !== index))
  }

  function openPicker() {
    if (processing) return
    inputRef.current.accept = fileType === 'image' ? 'image/*' : 'image/*,application/pdf'
    inputRef.current.multiple = fileType !== 'pdf'
    inputRef.current.value = ''
    inputRef.current.click()
  }

  if (files.length === 0) {
    return (
      <div
        style={{
          border: `2px dashed ${dragging ? '#c9a84c' : 'rgba(201,168,76,0.5)'}`,
          borderRadius: '12px',
          background: dragging ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.04)',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={openPicker}
      >
        <span style={{ fontSize: '2.5rem' }}>📄</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1a1a2e', fontWeight: 700 }}>
          Drop your contract here
        </span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#6b6b80', textAlign: 'center' }}>
          Up to 25 images <em>or</em> 1 PDF — drag &amp; drop or click to browse
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#a0a0b8', letterSpacing: '0.08em' }}>
          SUPPORTED: JPG · PNG · WEBP · PDF
        </span>
        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept="image/*,application/pdf"
          multiple
          onChange={e => processFiles(e.target.files)}
        />
      </div>
    )
  }

  return (
    <div>
      {fileType === 'pdf' ? (
        <PdfCard file={files[0].file} onRemove={() => handleRemove(0)} />
      ) : (
        <ImageGrid
          files={files}
          onRemove={handleRemove}
          onAddMore={openPicker}
          showAddMore={files.length < MAX_IMAGES}
          processing={processing}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={e => processFiles(e.target.files)}
      />
    </div>
  )
}

function PdfCard({ file, onRemove }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4ddd0',
      borderLeft: '4px solid #c9a84c',
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '2rem' }}>📑</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.95rem',
          color: '#1a1a2e',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {file.name}
        </p>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.7rem',
          color: '#a0a0b8',
          letterSpacing: '0.08em',
          marginTop: '4px',
        }}>
          PDF · {formatSize(file.size)}
        </p>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: '1px solid #e4ddd0',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          cursor: 'pointer',
          color: '#a0a0b8',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >×</button>
    </div>
  )
}

function ImageGrid({ files, onRemove, onAddMore, showAddMore, processing }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {files.map((item, i) => (
        <div key={i} style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e4ddd0',
          flexShrink: 0,
        }}>
          <img
            src={item.preview}
            alt={item.file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.55)',
            padding: '3px 5px',
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.55rem',
            color: '#fff',
            letterSpacing: '0.04em',
          }}>
            {formatSize(item.file.size)}
          </div>
          <button
            onClick={() => onRemove(i)}
            style={{
              position: 'absolute',
              top: '4px', right: '4px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              padding: 0,
            }}
          >×</button>
        </div>
      ))}
      {showAddMore && (
        <button
          onClick={onAddMore}
          disabled={processing}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            border: '2px dashed rgba(201,168,76,0.5)',
            background: 'rgba(201,168,76,0.04)',
            cursor: processing ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '1.5rem', color: '#c9a84c' }}>{processing ? '…' : '+'}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#a0a0b8', letterSpacing: '0.08em' }}>
            {processing ? 'LOADING' : 'ADD MORE'}
          </span>
        </button>
      )}
    </div>
  )
}
