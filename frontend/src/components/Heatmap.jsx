import React, { useEffect, useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import api from '../utils/api'
import { Calendar } from 'lucide-react'

export default function Heatmap(){
  const [data, setData] = useState([])

  useEffect(()=>{
    fetchHeatmap()
  },[])

  async function fetchHeatmap(){
    try {
      const res = await api.get('/heatmap')
      if (Array.isArray(res.data)) {
        const mapped = res.data.map(d=>({ date: d.date, count: Math.min(4, d.count) }))
        setData(mapped)
      } else {
        setData([])
      }
    } catch(e) {
      console.error(e)
      setData([])
    }
  }

  const today = new Date()
  const startDate = new Date(today.getFullYear(), 0, 1)
  const endDate = new Date(today.getFullYear(), 11, 31)

  return (
    <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={18} className="text-electric" />
            Consistency Matrix
        </h3>
        <div className="heatmap-container overflow-x-auto pb-2">
            <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={data}
                classForValue={(value) => {
                    if (!value) return 'color-empty'
                    return `color-scale-${value.count}`
                }}
            />
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-2">
            <span>Less</span>
            <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-[#1e2229] rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-[#00f2ff33] rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-[#00f2ff66] rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-[#00f2ff99] rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-[#00f2ff] rounded-sm shadow-[0_0_8px_rgba(0,242,255,0.5)]"></div>
            </div>
            <span>More</span>
        </div>

        <style>{`
            .react-calendar-heatmap .color-empty { fill: #1e2229; }
            .react-calendar-heatmap .color-scale-1 { fill: #00f2ff33; }
            .react-calendar-heatmap .color-scale-2 { fill: #00f2ff66; }
            .react-calendar-heatmap .color-scale-3 { fill: #00f2ff99; }
            .react-calendar-heatmap .color-scale-4 { fill: #00f2ff; }
            .react-calendar-heatmap rect { rx: 2; ry: 2; }
        `}</style>
    </div>
  )
}
