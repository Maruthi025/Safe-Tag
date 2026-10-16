import { PackageOpen } from 'lucide-react'

export default function EmptyState({ title, description, action, icon: Icon = PackageOpen }) {
  return (
    <div className="text-center py-16 px-4">
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  )
}