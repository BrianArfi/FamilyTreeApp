import React, { useState, useEffect } from 'react';
import { Network, Plus, RefreshCw } from 'lucide-react';
import Tree from './components/FamilyTree/Tree';
import AdminModal from './components/Admin/AdminModal';
import { fetchFamilyData, sendAction } from './utils/api';
import './index.css';

function App() {
  const [familyData, setFamilyData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchFamilyData();
    setFamilyData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelect = (person) => {
    setSelectedPerson(person);
    setIsAdminModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPerson(null);
    setIsAdminModalOpen(true);
  };

  const handleSave = async (formData, password) => {
    const action = formData.id ? 'EDIT' : 'ADD';
    const result = await sendAction(action, password, formData);

    if (result.success) {
      setIsAdminModalOpen(false);
      loadData();
      alert('Success!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDelete = async (id, password) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    const result = await sendAction('DELETE', password, { id });

    if (result.success) {
      setIsAdminModalOpen(false);
      loadData();
      alert('Deleted successfully');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <Network size={28} />
          <span>Our Family Tree</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary" onClick={loadData} title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={18} /> Add Member
          </button>
        </div>
      </header>

      <main className="tree-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Loading family data...
          </div>
        ) : (
          <Tree data={familyData} onSelect={handleSelect} />
        )}
      </main>

      {isAdminModalOpen && (
        <AdminModal
          person={selectedPerson}
          onClose={() => setIsAdminModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

export default App;
