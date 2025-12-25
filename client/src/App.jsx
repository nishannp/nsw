import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FeeLedger from './components/FeeLedger';
import TransactionLog from './components/TransactionLog';
import SavingsGoals from './components/SavingsGoals';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'fees': return <FeeLedger />;
      case 'transactions': return <TransactionLog />;
      case 'savings': return <SavingsGoals />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
