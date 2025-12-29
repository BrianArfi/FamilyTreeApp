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

        const getLevel = (id, depth = 0) => {
            if (levels.has(id)) return levels.get(id);
            if (depth > 20) return 0; // Safety break

            const member = idMap.get(id);
            if (!member) return 0;

            const fId = member.father_id ? String(member.father_id) : null;
            const mId = member.mother_id ? String(member.mother_id) : null;

            // Only recurse if parent exists in our data
            const fLevel = (fId && idMap.has(fId)) ? getLevel(fId, depth + 1) + 1 : 0;
            const mLevel = (mId && idMap.has(mId)) ? getLevel(mId, depth + 1) + 1 : 0;

            const finalLevel = Math.max(fLevel, mLevel);
            levels.set(id, finalLevel);
            return finalLevel;
        };

        members.forEach(m => getLevel(m.id));

        // Group into Rows & Filter empty slots
        const rowsMap = {};
        members.forEach(m => {
            const lvl = levels.get(m.id) || 0;
            if (!rowsMap[lvl]) rowsMap[lvl] = [];
            rowsMap[lvl].push(m);
        });

        return Object.keys(rowsMap)
            .sort((a, b) => Number(a) - Number(b))
            .map(lvl => rowsMap[lvl]);
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="tree-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: '#64748b' }}>Belum ada data keluarga. Tambahkan anggota pertama Anda!</p>
            </div>
        );
    }

    return (
        <div className="tree-container" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '60px 20px',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{
                    marginBottom: '40px',
                    padding: '12px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    border: '1px solid #bae6fd'
                }}>
                    💡 <b>Klik anggota</b> untuk mengedit hubungan (Pasangan/Orang Tua). Gunakan <b>Daftar Anggota</b> di kiri untuk mencari orang yang terpisah.
                </div>

                {generations.map((row, idx) => (
                    <div key={idx} style={{ marginBottom: '100px' }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '30px',
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}>
                            — Generasi {idx + 1} —
                        </div>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '40px'
                        }}>
                            {row.map(member => (
                                <Node
                                    key={member.id}
                                    node={member}
                                    onSelect={() => onSelect(member)}
                                    style={{
                                        position: 'relative',
                                        width: '200px',
                                        margin: '0'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tree;
