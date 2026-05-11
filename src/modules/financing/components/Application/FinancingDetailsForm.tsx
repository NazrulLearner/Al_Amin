// src/modules/financing/components/Application/FinancingDetailsForm.tsx
import React from 'react';
import type { LoanType } from '../../../../types';

// Import all individual forms
import MurabahaForm from '../FinancingDetails/MurabahaForm';
import IjarahForm from '../FinancingDetails/IjarahForm';
import MusharakaForm from '../FinancingDetails/MusharakaForm';
import SalamForm from '../FinancingDetails/SalamForm';
import QardHasanahForm from '../FinancingDetails/QardHasanahForm';
import IstisnaForm from '../FinancingDetails/IstisnaForm';
import MudarabaForm from '../FinancingDetails/MudarabaForm';
import TawarruqForm from '../FinancingDetails/TawarruqForm';
import KafalahForm from '../FinancingDetails/KafalahForm';

interface LoanDetailsFormProps {
  loanType: LoanType;
  onSubmit: (loanDetails: any) => void;
  onBack: () => void;
  initialData?: any;
}

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({
  loanType,
  onSubmit,
  onBack,
  initialData
}) => {
  // Simple form mapping - কোন complexity নেই
  const renderForm = () => {
    switch (loanType) {
      case 'murabaha':
        return (
          <MurabahaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'ijarah':
        return (
          <IjarahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'musharaka':
        return (
          <MusharakaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'salam':
        return (
          <SalamForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'qardHasanah':
        return (
          <QardHasanahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'istisna':
        return (
          <IstisnaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'mudaraba':
        return (
          <MudarabaForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'tawarruq':
        return (
          <TawarruqForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      case 'kafalah':
        return (
          <KafalahForm
            onSubmit={onSubmit}
            onBack={onBack}
            initialData={initialData}
          />
        );
      default:
        return <div>লোন টাইপ সিলেক্ট করুন</div>;
    }
  };

  return <div>{renderForm()}</div>;
};

export default LoanDetailsForm;