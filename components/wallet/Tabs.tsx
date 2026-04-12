// components/wallet/Tabs.tsx
'use client'

interface TabsProps {
  activeTab: 'assets' | 'activity'
  onTabChange: (tab: 'assets' | 'activity') => void
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { id: 'assets', label: '代币' },
    { id: 'activity', label: '活动' },
  ] as const

  return (
    <div className="flex border-b border-gray-100 bg-white sticky top-[73px] z-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-4 text-sm font-black transition-all relative ${
            activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab.label}
          {/* 活跃状态的下划线动画 */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full mx-8 animate-in fade-in zoom-in duration-300" />
          )}
        </button>
      ))}
    </div>
  )
}