import PropTypes from 'prop-types'
import { TABS } from '../constants'

export function Tabs({ activeTab, onChange }) {
  return (
    <div className="tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={'tab-button' + (activeTab === tab.id ? ' active' : '')}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

Tabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
