import { useState } from 'react'
import axios from 'axios'
import TripForm from './components/TripForm'
import RouteMap from './components/RouteMap'
import LogSheet from './components/LogSheet'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function App() {
  const [tripData, setTripData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const [activeDay, setActiveDay] = useState(0)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setTripData(null)

    try {
      const response = await axios.post(`${API_URL}/trip-plan/`, formData)
      setTripData(response.data)
      setActiveDay(0)
      setActiveTab('map')
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {loading && (
        <div className="loader-overlay">
          <div className="loader-card">
            <div className="loader-icon" aria-hidden="true">
              <span className="loader-icon-mark"></span>
            </div>
            <p className="loader-text">Planning your trip</p>
            <p className="loader-sub">Calculating route, stops &amp; HOS compliance...</p>
            <div className="loader-progress">
              <div className="loader-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="brand">
          <img src="/favicon.svg" alt="Spotter logo" className="brand-logo" />
          <div>
            <p className="brand-kicker">Spotter</p>
            <h1>Trip Planner</h1>
          </div>
        </div>
        <span className="badge">FMCSA HOS Compliant</span>
      </header>

      <main className="app-main">
        <section className="hero-panel">
          <h2>Plan cleaner routes with compliant daily logs</h2>
          <p>Generate optimized truck routes, fueling and rest stops, and printable HOS logs in one workflow.</p>
        </section>

        {error && (
          <div className="error-toast">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="app-layout">
          <aside className="sidebar-panel">
            <TripForm onSubmit={handleSubmit} loading={loading} />
          </aside>

          <section className="results-panel">
            {!tripData && !loading && (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true"></div>
                <h3>Ready to plan your route</h3>
                <p>Enter your trip details on the left and we'll handle the rest — HOS compliance, fuel stops, and daily log sheets.</p>
              </div>
            )}

            {tripData && !loading && (
              <div className="fade-in">
                <div className="trip-summary">
                  <div className="summary-card">
                    <div className="stat-icon" aria-hidden="true"></div>
                    <div className="stat-value">{tripData.route.total_distance_miles}</div>
                    <div className="stat-label">Total Miles</div>
                  </div>
                  <div className="summary-card">
                    <div className="stat-icon" aria-hidden="true"></div>
                    <div className="stat-value">{tripData.trip.total_driving_hours}</div>
                    <div className="stat-label">Driving Hours</div>
                  </div>
                  <div className="summary-card">
                    <div className="stat-icon" aria-hidden="true"></div>
                    <div className="stat-value">{tripData.trip.estimated_days}</div>
                    <div className="stat-label">Trip Days</div>
                  </div>
                  <div className="summary-card">
                    <div className="stat-icon" aria-hidden="true"></div>
                    <div className="stat-value">{tripData.trip.stops.length}</div>
                    <div className="stat-label">Stops</div>
                  </div>
                </div>

                <div className="tabs">
                  <button className={`tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Route Map</button>
                  <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Log Sheets</button>
                </div>

                <div className="content-card">
                  {activeTab === 'map' && (
                    <RouteMap geometry={tripData.route.geometry} stops={tripData.trip.stops} segments={tripData.route.segments} />
                  )}
                  {activeTab === 'logs' && (
                    <div style={{ padding: '1.5rem' }}>
                      <div className="day-pills">
                        {tripData.daily_logs.map((log, index) => (
                          <button key={index} className={`day-pill ${activeDay === index ? 'active' : ''}`} onClick={() => setActiveDay(index)}>
                            Day {log.day_number}
                          </button>
                        ))}
                      </div>
                      {tripData.daily_logs[activeDay] && <LogSheet logData={tripData.daily_logs[activeDay]} dayOffset={activeDay} />}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">Based on FMCSA Hours of Service Regulations (49 CFR Part 395) · Property-Carrying · 70-Hour / 8-Day Rule</footer>
    </div>
  )
}

export default App