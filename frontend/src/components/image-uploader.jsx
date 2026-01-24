import { useRef, useState } from "react";

export default function ImageUploader({ label = "Profile Photo", value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");

  function handleFile(file) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    
    setError("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  }

  function onSelect(e) {
    const file = e.target.files?.[0];
    handleFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  return (
    <div className="pf-field">
      <label className="pf-label">{label}</label>
      <div
        className="pf-dropzone"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        aria-label="Upload profile photo"
      >
        {preview ? (
          <img src={preview} alt="Profile preview" className="pf-avatar" />
        ) : (
          <div className="pf-dropzone-instructions">
            <div className="pf-dropzone-circle">+</div>
            <p className="pf-help">Click or drag an image here</p>
            <p className="pf-help-small">(Max 5MB, JPG/PNG)</p>
          </div>
        )}
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/*" 
          onChange={onSelect} 
          className="pf-hidden" 
        />
      </div>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}