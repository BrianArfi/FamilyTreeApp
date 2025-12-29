import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

const AdminModal = ({ person, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState(person || {
        name: '',
        gender: 'Male',
        birth_date: '',
        death_date: '',
        father_id: '',
        mother_id: '',
        bio: '',
        photo_url: ''
    });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData, password);
        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>{person?.id ? 'Edit Member' : 'Add Member'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="input" required />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Birth Date (DD-MM-YYYY)</label>
                            <input name="birth_date" value={formData.birth_date} onChange={handleChange} className="input" placeholder="01-01-1990" />
                        </div>
                        <div className="form-group">
                            <label>Death Date (DD-MM-YYYY)</label>
                            <input name="death_date" value={formData.death_date} onChange={handleChange} className="input" placeholder="Optional" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Admin Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required placeholder="Enter password to save" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Member'}
                        </button>
                        {person?.id && (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => onDelete(person.id, password)}
                                style={{ backgroundColor: '#ef4444' }}
                                disabled={loading}
                            >
                                <Trash2 size={18} /> Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;
