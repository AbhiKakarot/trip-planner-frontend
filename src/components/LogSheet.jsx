import { useRef } from 'react'
import './LogSheet.css'

const STATUS_LABELS = {
  off_duty: 'OFF DUTY',
  sleeper_berth: 'SLEEPER BERTH',
  driving: 'DRIVING',
  on_duty: 'ON DUTY (Not Driving)',
}

const STATUS_COLORS = {
  off_duty: '#e2e8f0',
  sleeper_berth: '#bee3f8',
  driving: '#c6f6d5',
  on_duty: '#fefcbf',
}

const STATUS_BORDER = {
  off_duty: '#a0aec0',
  sleeper_berth: '#63b3ed',
  driving: '#68d391',
  on_duty: '#ecc94b',
}

function LogSheet({ logData, dayOffset }) {
  const printRef = useRef(null)

  const handlePrint = () => {
    window.print()
  }

  // Build consolidated segments for drawing
  const buildSegments = () => {
    if (logData.entries && logData.entries.length > 0) {
      return logData.entries
        .filter(entry => entry.end_hour > entry.start_hour)
        .map(entry => ({
          status: entry.status,
          startHour: entry.start_hour,
          endHour: entry.end_hour,
        }))
    }

    // Backward-compatible fallback for older API payloads.
    const segments = []
    let currentStatus = null
    let startHour = null

    for (let hour = 0; hour < 24; hour++) {
      const cell = logData.grid?.find(g => g.hour === hour)
      const status = cell ? cell.status : null
      if (status !== currentStatus) {
        if (currentStatus !== null) {
          segments.push({
            status: currentStatus,
            startHour,
            endHour: hour,
          })
        }
        currentStatus = status
        startHour = hour
      }
    }

    if (currentStatus !== null) {
      segments.push({
        status: currentStatus,
        startHour,
        endHour: 24,
      })
    }

    return segments
  }

  const segments = buildSegments()

  return (
    <div className="log-sheet-wrapper">
      <button className="print-btn" onClick={handlePrint}>
        Print Log Sheet
      </button>

      <div ref={printRef} className="log-sheet">
        {/* Header */}
        <div className="log-header">
          <h3>DRIVER'S DAILY LOG</h3>
          <p className="log-subtitle">(One Form for Each 24-Hour Period — Original: File at Home Terminal)</p>
          <div className="log-header-row">
            <span><strong>From:</strong> Day {logData.day_number} (00:00)</span>
            <span><strong>To:</strong> Day {logData.day_number} (24:00)</span>
            <span><strong>Total Miles Driving Today:</strong> {logData.total_miles || 0}</span>
          </div>
        </div>

        {/* Graph Grid */}
        <div className="grid-container">
          <div className="grid-labels">
            <div className="status-label">OFF DUTY</div>
            <div className="status-label">SLEEPER BERTH</div>
            <div className="status-label">DRIVING</div>
            <div className="status-label">ON DUTY (Not Driving)</div>
          </div>

          <div className="grid-area">
            {/* Hour markers */}
            <div className="hour-row">
              <span className="hour-label">Midnight</span>
              {[1,2,3,4,5,6,7,8,9,10,11].map(h => (
                <span key={h} className="hour-label">{h}</span>
              ))}
              <span className="hour-label">Noon</span>
              {[1,2,3,4,5,6,7,8,9,10,11].map(h => (
                <span key={h+12} className="hour-label">{h}</span>
              ))}
            </div>

            {/* Grid rows for each status */}
            <div className="grid-rows">
              {['off_duty', 'sleeper_berth', 'driving', 'on_duty'].map(status => (
                <div key={status} className="grid-row">
                  {segments
                    .filter(seg => seg.status === status)
                    .map((seg, i) => (
                      <div
                        key={i}
                        className="grid-segment"
                        style={{
                          left: `${(seg.startHour / 24) * 100}%`,
                          width: `${((seg.endHour - seg.startHour) / 24) * 100}%`,
                          backgroundColor: STATUS_COLORS[status],
                          borderColor: STATUS_BORDER[status],
                        }}
                        title={`${STATUS_LABELS[status]}: ${seg.startHour.toFixed(2)} - ${seg.endHour.toFixed(2)}`}
                      >
                        {seg.endHour - seg.startHour >= 2 && (
                          <span className="segment-label">
                            {STATUS_LABELS[status]}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Vertical hour lines */}
            <div className="vertical-lines">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="vline"
                  style={{ left: `${(i / 24) * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="totals-row">
          {logData.totals && Object.entries(logData.totals).map(([key, value]) => (
            <div key={key} className="total-item">
              <strong>{STATUS_LABELS[key] || key}:</strong> {value}
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div className="remarks-section">
          <h4>REMARKS</h4>
          {logData.remarks && logData.remarks.length > 0 ? (
            <ul className="remarks-list">
              {logData.remarks.map((remark, i) => (
                <li key={i}>{remark}</li>
              ))}
            </ul>
          ) : (
            <p className="no-remarks">No remarks recorded</p>
          )}
        </div>

        {/* Footer */}
        <div className="log-footer">
          <div>
            <strong>Name of Carrier:</strong> _________________________________
          </div>
          <div>
            <strong>Driver's Signature:</strong> _________________________________
          </div>
          <div>
            <strong>Co-Driver:</strong> _________________________________
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogSheet