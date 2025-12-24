
import React, { useMemo } from 'react';
import { COMMODITY_NAMES, COMMODITIES } from '../constants';
import { getInitialStock } from '../utils/calculator';

const MonthlySummary = ({ monthlyData }) => {
  const totals = useMemo(() => {
    const consumptionTotal = getInitialStock();
    const receivedTotal = getInitialStock();
    
    monthlyData.forEach(day => {
      COMMODITIES.forEach(commodity => {
        consumptionTotal[commodity] += day.consumption[commodity];
        if (day.stockReceived && day.stockReceived.primary) {
            receivedTotal[commodity] += day.stockReceived.primary[commodity] + day.stockReceived.upperPrimary[commodity];
        }
      });
    });

    return { consumptionTotal, receivedTotal };
  }, [monthlyData]);

  const openingBalance = monthlyData.length > 0 ? monthlyData[0].openingBalance : getInitialStock();
  const closingBalance = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].closingBalance : getInitialStock();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">மாதாந்திர சுருக்கம்</h2>
      </div>

      <div className="overflow-auto printable-table">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 border text-left sticky top-0 left-0 bg-gray-200 z-20">பொருள்</th>
              <th className="py-3 px-4 border text-right sticky top-0 bg-gray-200 z-10">தொடக்க இருப்பு</th>
              <th className="py-3 px-4 border text-right sticky top-0 bg-gray-200 z-10">மாத மொத்த வரவு</th>
              <th className="py-3 px-4 border text-right sticky top-0 bg-gray-200 z-10">மாத மொத்த செலவு</th>
              <th className="py-3 px-4 border text-right sticky top-0 bg-gray-200 z-10">இறுதி இருப்பு</th>
            </tr>
          </thead>
          <tbody>
            {COMMODITIES.map((commodity, index) => (
              <tr key={commodity} className={`group hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className={`py-2 px-4 border font-semibold text-gray-700 sticky left-0 group-hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>{COMMODITY_NAMES[commodity].name} ({COMMODITY_NAMES[commodity].unit})</td>
                <td className="py-2 px-4 border text-right font-mono">{commodity === 'egg' ? openingBalance.egg.toFixed(0) : openingBalance[commodity].toFixed(3)}</td>
                <td className="py-2 px-4 border text-right font-mono text-green-700">{commodity === 'egg' ? totals.receivedTotal.egg.toFixed(0) : totals.receivedTotal[commodity].toFixed(3)}</td>
                <td className="py-2 px-4 border text-right font-mono text-red-700">{commodity === 'egg' ? totals.consumptionTotal.egg.toFixed(0) : totals.consumptionTotal[commodity].toFixed(3)}</td>
                <td className="py-2 px-4 border text-right font-mono font-bold">{commodity === 'egg' ? closingBalance.egg.toFixed(0) : closingBalance[commodity].toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlySummary;
