import React from 'react';
import { FiiDiiSectorRadar } from '../components/fiidii/FiiDiiSectorRadar';

export const FiiDiiPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          FII / DII Institutional Flow & Sector Rotation
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Follow the footprints of smart money: Cash inflows, Index Futures positioning, and sectoral momentum
        </p>
      </div>

      <FiiDiiSectorRadar />
    </div>
  );
};
