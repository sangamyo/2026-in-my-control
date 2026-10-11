import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'

export default function AIInsight() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  async function fetchReport() {
    try {
      setLoading(true)
      const res = await api.get('/ai-report')
      setReport(res.data)
    } catch (e) {
      console.error('AI report error', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
      <Loader2 className="animate-spin mb-4 text-electric" size={32} />
      <p className="animate-pulse">Analyzing your discipline matrix...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles size={18} className="text-electric" />
          AI Strategy Report
        </h3>
        <button 
           onClick={fetchReport}
           className="text-xs text-electric hover:underline flex items-center gap-1"
        >
          Refresh Analysis <ArrowRight size={12} />
        </button>
      </div>

      {!report ? (
         <div className="p-4 bg-[#0D0F14] rounded-xl border border-dashed border-gray-800 text-center">
            <p className="text-sm text-gray-500 italic">Complete at least one check-in for AI analysis</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-[#0D0F14] rounded-xl border border-gray-800">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Consistency Index</h4>
              <p className="text-white font-medium">{report.consistencyPercent || 0}% Accuracy</p>
            </div>
            <div className="p-4 bg-electric/5 rounded-xl border border-electric/20 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Sparkles size={40} />
               </div>
               <h4 className="text-xs font-bold text-electric uppercase mb-2">AI Summary</h4>
               <p className="text-sm text-gray-300 leading-relaxed italic">
                 "{report.summary || "You are currently establishing the foundation. Keep pushing."}"
               </p>
            </div>
          </div>

          <div className="p-4 bg-[#0D0F14] rounded-xl border border-gray-800">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">AI Suggestions</h4>
            <ul className="space-y-3">
              {(report.suggestions || ["Start tagging your check-ins with more detail", "Aim for a 3-day streak to unlock momentum insights"]).map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric mt-1.5 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
