const statusConfig = {
  registered: { label: 'Registered', className: 'badge-blue' },
  lost: { label: 'Lost', className: 'badge-red' },
  found_report_received: { label: 'Report Received', className: 'badge-yellow' },
  recovery_in_progress: { label: 'Recovery in Progress', className: 'badge-purple' },
  recovered: { label: 'Recovered', className: 'badge-green' },
  archived: { label: 'Archived', className: 'badge-gray' },
  active: { label: 'Active', className: 'badge-red' },
  matched: { label: 'Matched', className: 'badge-yellow' },
  pending: { label: 'Pending', className: 'badge-blue' },
  owner_reviewing: { label: 'Owner Reviewing', className: 'badge-purple' },
  closed: { label: 'Closed', className: 'badge-gray' },
  strong_possible: { label: 'Strong Match', className: 'badge-green' },
  possible: { label: 'Possible Match', className: 'badge-yellow' },
  confirmed: { label: 'Confirmed', className: 'badge-green' },
  rejected: { label: 'Rejected', className: 'badge-red' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', className: 'badge-gray' }
  return <span className={config.className}>{config.label}</span>
}