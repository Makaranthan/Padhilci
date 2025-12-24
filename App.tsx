
import React, { useState, useEffect, useMemo } from 'react';
import { View } from './types';
import { VIEWS } from './constants';
import { calculateMonthlyData, getInitialStock } from './utils/calculator';
import MonthSelector from './components/MonthSelector';
import DailyEntry from './components/DailyEntry';
import StockRegister from './components/StockRegister';
import MonthlySummary from './components/MonthlySummary';
import YearlyReport from './components/YearlyReport';
import Header from './components/Header';

const App = () => {
  const [currentView, setCurrentView] = useState(View.MONTH_SELECTION);
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [openingBalances, setOpeningBalances] = useState(getInitialStock());
  
  const lsKey = selectedDate ? `stock-register-${selectedDate.year}-${selectedDate.month}` : null;

  useEffect(() => {
    if (lsKey) {
      try {
        const savedData = localStorage.getItem(lsKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setMonthlyData(parsedData.monthlyData);
          setOpeningBalances(parsedData.openingBalances);
          setCurrentView(View.DAILY_ENTRY);
        }
      } catch (error) {
        console.error("Failed to load data from local storage", error);
        localStorage.removeItem(lsKey); // Clear corrupted data
      }
    }
  }, [lsKey]);

  // FIX: Corrected a syntax error in the try-catch block. A misplaced brace and missing braces for the catch block were causing all subsequent scope-related errors.
  const saveData = (data, balances) => {
    if (lsKey) {
      try {
        const dataToSave = { monthlyData: data, openingBalances: balances };
        localStorage.setItem(lsKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save data to local storage", error);
      }
    }
  };

  const handleMonthSelect = (month, year, balances) => {
    setSelectedDate({ month, year });
    setOpeningBalances(balances);
    const initialData = calculateMonthlyData(month, year, balances, []);
    setMonthlyData(initialData);
    saveData(initialData, balances);
    setCurrentView(View.DAILY_ENTRY);
  };

  const updateDailyRecord = (date, primaryStudents, upperPrimaryStudents, stockReceived, eggsIssued, dhalIssued, chickpeasIssued, gramIssued) => {
    const updatedData = monthlyData.map(d => 
      d.date === date ? { ...d, primaryStudents, upperPrimaryStudents, stockReceived, eggsIssued, dhalIssued, chickpeasIssued, gramIssued } : d
    );
    const recalculatedData = calculateMonthlyData(selectedDate.month, selectedDate.year, openingBalances, updatedData);
    setMonthlyData(recalculatedData);
    saveData(recalculatedData, openingBalances);
  };
  
  const handleReset = () => {
    if (lsKey) {
        localStorage.removeItem(lsKey);
    }
    setCurrentView(View.MONTH_SELECTION);
    setSelectedDate(null);
    setMonthlyData([]);
    setOpeningBalances(getInitialStock());
  };

  const isPrintable = [View.STOCK_REGISTER, View.MONTHLY_SUMMARY, View.YEARLY_SUMMARY].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case View.DAILY_ENTRY:
        return <DailyEntry monthlyData={monthlyData} updateDailyRecord={updateDailyRecord} />;
      case View.STOCK_REGISTER:
        return <StockRegister monthlyData={monthlyData} />;
      case View.MONTHLY_SUMMARY:
        return <MonthlySummary monthlyData={monthlyData} />;
      case View.YEARLY_SUMMARY:
        return <YearlyReport initialYear={selectedDate?.year || new Date().getFullYear()} />;
      case View.MONTH_SELECTION:
      default:
        return <MonthSelector onMonthSelect={handleMonthSelect} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <Header />
      <main className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {currentView !== View.MONTH_SELECTION && selectedDate && (
          <nav className="bg-white p-4 rounded-lg shadow-md mb-6 no-print">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                 <h2 className="text-xl md:text-2xl font-bold text-blue-700">
                    {new Date(selectedDate.year, selectedDate.month).toLocaleString('ta-IN', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                  {isPrintable && (
                    <button
                        onClick={() => window.print()}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm-8 6a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">அச்சிடுக / PDF</span>
                    </button>
                  )}
                  <button
                      onClick={handleReset}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300"
                  >
                      புதிய மாதம்
                  </button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(View).map(view => {
                if (view === View.MONTH_SELECTION) return null;
                return (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-300 ${
                      currentView === view
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-200 hover:bg-blue-200 text-slate-700'
                    }`}
                  >
                    {VIEWS[view]}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            {renderView()}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm no-print">
        <p>புரட்சித் தலைவர் எம்.ஜி.ஆர் சத்துணவுத் திட்டம்</p>
      </footer>
    </div>
  );
};

export default App;