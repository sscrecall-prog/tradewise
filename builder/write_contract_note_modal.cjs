const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, '..', 'src');

const code = `import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { PaperOrder } from "../../types";
import { Printer, ShieldCheck, Download, CheckCircle2, FileText } from "lucide-react";

interface ContractNoteModalProps {
  order: PaperOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractNoteModal: React.FC<ContractNoteModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!order) return null;

  const charges = order.charges || {
    brokerage: 20,
    stt: 0,
    exchangeCharges: 0.88,
    gst: 3.76,
    sebiCharges: 0.03,
    stampDuty: 0.90,
    totalCharges: 25.57,
    breakevenPoints: 0.25
  };

  const turnover = order.turnover || (order.price * order.quantity);
  const netAmount = order.direction === "BUY"
    ? turnover + charges.totalCharges
    : turnover - charges.totalCharges;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-accent" />
          <span className="text-base font-bold text-text-primary">Electronic Contract Note / Tax Invoice</span>
        </div>
      }
      subtitle={\`Order Ref: \${order.contractNoteId || order.id} • Regulatory Settlement Note\`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs text-text-secondary print:text-black">
        {/* Broker Header Box */}
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-text-primary tracking-wide">
                TRADEWISE SECURITIES (INDIA) PVT. LTD.
              </span>
              <Badge variant="positive" size="sm">SEBI REG. SIM-INZ000031633</Badge>
            </div>
            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
              Member: National Stock Exchange of India (NSE) & BSE Ltd.<br />
              SEBI Single Regn No: INZ000031633 • CIN: U67120KA2010PTC054000
            </p>
          </div>

          <div className="text-right sm:text-right space-y-0.5">
            <div className="font-mono font-bold text-text-primary">
              Invoice #{order.contractNoteId || \`CN-\${order.id.slice(-6)}\`}
            </div>
            <div className="text-[11px] text-text-muted">Trade Date: {order.timestamp}</div>
            <div className="text-[11px] text-text-muted">Client: Rohan Sharma (TW894120)</div>
          </div>
        </div>

        {/* Trade Execution Specification */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-positive" />
            Execution Summary
          </h4>
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated border-b border-border-subtle text-[11px] text-text-muted font-medium">
                  <th className="p-2.5">Security / Scrip</th>
                  <th className="p-2.5">Exchange</th>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5">Order Type</th>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Gross Price</th>
                  <th className="p-2.5 text-right">Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono text-xs">
                <tr className="hover:bg-bg-elevated/40">
                  <td className="p-2.5 font-sans font-bold text-text-primary">
                    {order.stockSymbol}
                    <span className="block text-[10px] font-normal text-text-muted">{order.stockName}</span>
                  </td>
                  <td className="p-2.5 font-sans">NSE</td>
                  <td className="p-2.5 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-bg-secondary border border-border-subtle">
                      {order.productType}
                    </span>
                  </td>
                  <td className="p-2.5 font-sans">{order.orderType}</td>
                  <td className="p-2.5">
                    <span className={\`font-bold \${order.direction === "BUY" ? "text-brand-positive" : "text-brand-negative"}\`}>
                      {order.direction}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-text-primary">{order.quantity}</td>
                  <td className="p-2.5 text-right font-bold text-text-primary">₹{order.price.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-bold text-text-primary">₹{turnover.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Taxes & Regulatory Charges Breakdown (Zerodha / Angel One Schedule) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center justify-between">
            <span>Regulatory Levies & Brokerage Breakdown</span>
            <span className="text-[10px] font-normal text-text-muted normal-case">
              As per SEBI / Finance Act (India) Schedule
            </span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Brokerage & Direct Taxes */}
            <div className="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60">
                <span>Brokerage (Max ₹20 / executed order)</span>
                <span className="font-mono font-bold text-text-primary">₹{charges.brokerage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Securities Transaction Tax (STT)</span>
                <span className="font-mono font-bold text-text-primary">₹{charges.stt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>NSE Exchange Transaction Charge (0.00297%)</span>
                <span className="font-mono font-bold text-text-primary">₹{charges.exchangeCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>SEBI Turnover Fees (₹10 / Crore)</span>
                <span className="font-mono font-bold text-text-primary">₹{charges.sebiCharges.toFixed(2)}</span>
              </div>
            </div>

            {/* Duties & GST */}
            <div className="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle/60">
                <span>Stamp Duty (0.003% Intraday / 0.015% Delivery)</span>
                <span className="font-mono font-bold text-text-primary">₹{charges.stampDuty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Central GST (CGST 9% on Brokerage & Txn Fee)</span>
                <span className="font-mono font-bold text-text-primary">₹{(charges.gst / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>State GST (SGST 9% on Brokerage & Txn Fee)</span>
                <span className="font-mono font-bold text-text-primary">₹{(charges.gst / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border-subtle/60 text-brand-accent">
                <span className="font-semibold">Points to Breakeven</span>
                <span className="font-mono font-bold">+{charges.breakevenPoints?.toFixed(2) || (charges.totalCharges / order.quantity).toFixed(2)} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Settlement Amount Strip */}
        <div className="p-4 rounded-2xl bg-bg-elevated border border-brand-accent/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-text-muted">Total Taxes & Brokerage Deducted</div>
            <div className="text-base font-bold text-brand-negative font-mono">
              -₹{charges.totalCharges.toFixed(2)}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-xs text-text-muted">Net Settlement Obligation</div>
            <div className="text-xl font-extrabold text-text-primary font-mono tracking-tight">
              ₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-bg-card border border-border-subtle text-[11px] text-text-muted leading-relaxed">
          <p>
            <strong>Note:</strong> This document represents a virtual simulated contract note for paper trading education.
            Brokerage and statutory charges are calculated according to prevailing SEBI, NSE, and GST guidelines in India.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
            Print Invoice
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
`;

fs.writeFileSync(path.join(srcDir, 'components/modals/ContractNoteModal.tsx'), code);
console.log('ContractNoteModal.tsx created');
