import React, { useMemo } from 'react';
import Node from './Node';

const CARD_WIDTH = 180;
const CARD_HEIGHT = 100;
const H_GAP = 60;
const V_GAP = 120;

const Tree = ({ data, onSelect }) => {
    const generations = useMemo(() => {
        if (!data || data.length === 0) return [];

        const members = [...data].map(p => ({ ...p, id: String(p.id) }));
        const idMap = new Map(members.map(m => [m.id, m]));
        const levels = new Map();

        // 1. Calculate Generations
        const getLevel = (id, visited = new Set()) => {
            if (levels.has(id)) return levels.get(id);
            if (visited.has(id)) return 0; // Prevent loops
            visited.add(id);

            const member = idMap.get(id);
            if (!member) return 0;

            const fId = String(member.father_id);
            const mId = String(member.mother_id);

            const fLevel = (fId && idMap.has(fId)) ? getLevel(fId, visited) + 1 : 0;
            const mLevel = (mId && idMap.has(mId)) ? getLevel(mId, visited) + 1 : 0;

            const finalLevel = Math.max(fLevel, mLevel);
            levels.set(id, finalLevel);
            return finalLevel;
        };

        members.forEach(m => getLevel(m.id));

        // 2. Group into Rows
        const rows = [];
        members.forEach(m => {
            const lvl = levels.get(m.id) || 0;
            if (!rows[lvl]) rows[lvl] = [];
            rows[lvl].push(m);
        });

        return rows;
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="tree-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>No family members added yet.</div>
            </div>
        );
    }

    return (
        <div className="tree-container" style={{ padding: '40px 20px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {generations.map((row, idx) => (
                    <div key={idx} className="generation-row" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '30px',
                        marginBottom: '80px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            color: '#94a3b8',
                            background: '#f8fafc',
                            padding: '2px 10px',
                            borderRadius: '10px'
                        }}>
                            GENERATION {idx + 1}
                        </div>

                        {row.map(member => (
                            <Node
                                key={member.id}
                                node={member}
                                onSelect={() => onSelect(member)}
                                style={{
                                    position: 'relative', // Override absolute from CSS
                                    width: '200px',
                                    // No absolute transforms needed - Flex handles it!
                                }}
                            />
                        ))}
                    </div>
                ))}

                {/* Simple Info Box */}
                <div style={{
                    marginTop: '100px',
                    padding: '20px',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: '#64748b'
                }}>
                    <p>💡 <b>Cara Menyambungkan:</b></p>
                    <p>Gunakan <b>Sidebar</b> di sebelah kiri untuk memilih anggota, lalu atur Ayah/Ibu/Pasangannya.</p>
                </div>
            </div>
        </div>
    );
};

export default Tree;
