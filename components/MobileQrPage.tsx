import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ShieldCheck, Clock, RefreshCw, QrCode } from 'lucide-react';

interface UpiQrData {
  amount: number;
  billNo: string;
  upiId: string;
  upiName: string;
  upiUri: string;
  timestamp: number;
}

const MobileQrPage: React.FC = () => {
  const [upiData, setUpiData] = useState<UpiQrData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const qrRef = ref(db, 'activeUpiQr');
    const unsubscribe = onValue(qrRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as UpiQrData;
        setUpiData(data);
      } else {
        setUpiData(null);
      }
    }, (error) => {
      console.error("Firebase subscription error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!upiData) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const elapsedMs = Date.now() - upiData.timestamp;
      const remainingSec = Math.max(0, Math.ceil((120000 - elapsedMs) / 1000));
      return remainingSec;
    };

    const initialRemaining = calculateTimeLeft();
    setTimeLeft(initialRemaining);

    if (initialRemaining <= 0) return;

    const intervalId = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [upiData]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const isActive = upiData && timeLeft > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-orange-900/30">
            D
          </div>
          <span className="font-black text-xl tracking-wider text-slate-200">DRONA <span className="text-orange-500">POS</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Sync Active</span>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        {isActive ? (
          <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl shadow-black transition-all animate-in fade-in duration-300">
            {/* Invoice Info */}
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Bill Invoice</span>
              <h2 className="text-lg font-black text-slate-300 mt-0.5">{upiData.billNo}</h2>
            </div>

            {/* QR Code Container */}
            <div className="relative p-5 bg-white rounded-2xl shadow-xl shadow-black/40 border border-slate-700/50 mb-6 group transition-transform hover:scale-[1.01]">
              <QRCodeSVG
                value={upiData.upiUri}
                size={220}
                level="Q"
                includeMargin={false}
                imageSettings={{
                  src: "/dronaiconn.ico",
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>

            {/* Amount */}
            <div className="text-center mb-5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Amount to Pay</span>
              <div className="text-4xl font-black text-orange-500 mt-1 flex items-center justify-center gap-1">
                <span className="text-2xl font-bold">₹</span>
                <span>{upiData.amount.toFixed(0)}</span>
              </div>
            </div>

            {/* Expire Timer */}
            <div className="w-full bg-slate-950/60 border border-slate-900 py-3 px-4 rounded-2xl flex items-center justify-between mb-4 text-sm font-semibold">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={16} className="text-orange-500 animate-pulse" />
                <span>Timer Countdown</span>
              </div>
              <span className={`font-mono text-base font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Security Label */}
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>GPay, PhonePe, Paytm, BHIM or any UPI App</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md text-center py-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            {/* Standby Graphic */}
            <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-slate-950/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <QrCode size={44} className="text-slate-600 group-hover:text-orange-500 transition-colors duration-500 animate-pulse" />
            </div>

            {/* Standby Message */}
            <h2 className="text-2xl font-black text-slate-200 mb-3 tracking-tight">Payment Display Standby</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">
              Please request the staff to generate the payment UPI QR code from the counter terminal.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-6 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">
        <span>© {new Date().getFullYear()} Drona POS Inc.</span>
        <div className="flex items-center gap-1.5">
          <Smartphone size={10} className="text-slate-600" />
          <span>Customer Counter Display Screen</span>
        </div>
      </div>
    </div>
  );
};

export default MobileQrPage;
