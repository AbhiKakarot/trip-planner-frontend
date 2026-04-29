import { useState } from 'react'
import './TripForm.css'

function TripForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: '',
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.current_location.trim()) newErrors.current_location = 'Required'
    if (!formData.pickup_location.trim()) newErrors.pickup_location = 'Required'
    if (!formData.dropoff_location.trim()) newErrors.dropoff_location = 'Required'
    const cycle = parseFloat(formData.current_cycle_hours)
    if (formData.current_cycle_hours === '' || isNaN(cycle) || cycle < 0 || cycle > 70) {
      newErrors.current_cycle_hours = 'Enter 0–70'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        current_location: formData.current_location.trim(),
        pickup_location: formData.pickup_location.trim(),
        dropoff_location: formData.dropoff_location.trim(),
        current_cycle_hours: parseFloat(formData.current_cycle_hours) || 0,
      })
    }
  }

  return (
    <div className="form-panel">
      <h2>Plan your trip</h2>
      <form onSubmit={handleSubmit}>

        {/* AIRBNB-STYLE: All 3 location inputs in one row */}
        <div className="form-row">
          <div className="form-group">
            <label>Current</label>
            <input
              type="text"
              name="current_location"
              value={formData.current_location}
              onChange={handleChange}
              placeholder="Where?"
            />
          </div>
          <div className="form-group">
            <label>Pickup</label>
            <input
              type="text"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleChange}
              placeholder="Pickup?"
            />
          </div>
          <div className="form-group">
            <label>Dropoff</label>
            <input
              type="text"
              name="dropoff_location"
              value={formData.dropoff_location}
              onChange={handleChange}
              placeholder="Deliver?"
            />
          </div>
        </div>

        {/* Show errors below the row if any */}
        {Object.keys(errors).filter(k => k !== 'current_cycle_hours').length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {(errors.current_location || errors.pickup_location || errors.dropoff_location) && (
              <span className="field-error">
                All location fields are required
              </span>
            )}
          </div>
        )}

        <div className="form-divider"></div>

        <div className="form-group">
          <label>Cycle hours used</label>
          <input
            type="number"
            name="current_cycle_hours"
            value={formData.current_cycle_hours}
            onChange={handleChange}
            placeholder="0"
            min="0"
            max="70"
            step="0.5"
            className={errors.current_cycle_hours ? 'input-error' : ''}
          />
          {errors.current_cycle_hours && <span className="field-error">{errors.current_cycle_hours}</span>}
        </div>

        <div className="cycle-hint">
          <span className="hint-icon" aria-hidden="true"></span>
          On-duty hours already worked in your current 70hr/8day cycle
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Planning...
            </>
          ) : (
            'Generate trip plan'
          )}
        </button>
      </form>
    </div>
  )
}

export default TripForm