import React, { useMemo, useRef, useEffect } from 'react';
import Node from './Node';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 100;
const H_GAP = 80;
const V_GAP = 150;
const CANVAS_CENTER = 2500;

const Tree = ({ data, onSelect }) => {
    const layout = useMemo(() => {
        if (!data || data.length === 0) return { members: [], lines: [] };

        const members = [...data].map(p => ({ ...p, id: String(p.id) }));
        const idMap = new Map(members.map(m => [m.id, m]));
        const levels = new Map();

        // 1. Calculate Generations
        const getLevel = (id, depth = 0) => {
            if (levels.has(id)) return levels.get(id);
            if (depth > 50) return 0;
            const m = idMap.get(id);
            if (!m) return 0;
            const fL = (m.father_id && idMap.has(String(m.father_id))) ? getLevel(String(m.father_id), depth + 1) + 1 : 0;
            const mL = (m.mother_id && idMap.has(String(m.mother_id))) ? getLevel(String(m.mother_id), depth + 1) + 1 : 0;
            const res = Math.max(fL, mL);
            levels.set(id, res);
            return res;
        };
        members.forEach(m => getLevel(m.id));

        // 2. Arrange Rows with Spouse Grouping
        const positioned = [];
        const levelGroups = {};
        members.forEach(m => {
            const l = levels.get(m.id) || 0;
            if (!levelGroups[l]) levelGroups[l] = [];
            levelGroups[l].push(m);
        });

        Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b)).forEach(lvl => {
            const row = levelGroups[lvl];
            const processed = new Set();
            const groupedRow = [];

            row.forEach(m => {
                if (processed.has(m.id)) return;

                // Find all spouses of this member in the SAME row
                const spouseIds = (m.spouses || "").split(',').map(s => s.trim()).filter(Boolean);
                const group = [m];
                processed.add(m.id);

                spouseIds.forEach(sid => {
                    if (!processed.has(sid)) {
                        const spouse = row.find(r => r.id === sid);
                        if (spouse) {
                            group.push(spouse);
                            processed.add(sid);
                        }
                    }
                });

                // Put the main person in the middle of their spouses if polygamous
                if (group.length > 2) {
                    const main = group[0];
                    group.shift();
                    const half = Math.floor(group.length / 2);
                    group.splice(half, 0, main);
                }

                groupedRow.push(...group);
            });

            const totalWidth = groupedRow.length * CARD_WIDTH + (groupedRow.length - 1) * H_GAP;
            const startX = CANVAS_CENTER - totalWidth / 2;

            groupedRow.forEach((m, i) => {
                const x = startX + i * (CARD_WIDTH + H_GAP);
                const y = Number(lvl) * (CARD_HEIGHT + V_GAP) + 100;
                m.x = x;
                m.y = y;
                positioned.push(m);
            });
        });

        // 3. Generate Relationship Lines
        const lines = [];
        const drawnMarriageLines = new Set();

        // Marriage Lines: Connect ALL spouses
        positioned.forEach(m => {
            const spouseIds = (m.spouses || "").split(',').map(s => s.trim()).filter(Boolean);
            spouseIds.forEach(sid => {
                const s = positioned.find(p => p.id === sid);
                if (s) {
                    const pairId = [m.id, sid].sort().join('-');
                    if (!drawnMarriageLines.has(pairId)) {
                        lines.push({
                            type: 'marriage',
                            x1: Math.min(m.x, s.x) + CARD_WIDTH,
                            y1: m.y + CARD_HEIGHT / 2,
                            x2: Math.max(m.x, s.x),
                            y2: m.y + CARD_HEIGHT / 2
                        });
                        drawnMarriageLines.add(pairId);
                    }
                }
            });
        });

        // Parent-Child Connectors (Orthogonal)
        positioned.forEach(child => {
            const fId = child.father_id ? String(child.father_id) : null;
            const mId = child.mother_id ? String(child.mother_id) : null;
            const f = fId ? positioned.find(p => p.id === fId) : null;
            const m = mId ? positioned.find(p => p.id === mId) : null;

            if (f && m) {
                const midX = (f.x + m.x + CARD_WIDTH) / 2;
                const midY = f.y + CARD_HEIGHT + (V_GAP / 3);
                lines.push({
                    type: 'connector',
                    path: `M ${midX} ${f.y + CARD_HEIGHT / 2} L ${midX} ${midY} L ${child.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${child.y}`
                });
            } else if (f || m) {
                const p = f || m;
                const midY = p.y + CARD_HEIGHT + (V_GAP / 3);
                lines.push({
                    type: 'connector',
                    path: `M ${p.x + CARD_WIDTH / 2} ${p.y + CARD_HEIGHT} L ${p.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${child.y}`
                });
            }
        });

        return { members: positioned, lines };
    }, [data]);

    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = CANVAS_CENTER - containerRef.current.clientWidth / 2;
        }
    }, [layout]);

    if (data.length === 0) return <div className="tree-container"><div style={{ padding: '2rem', textAlign: 'center' }}>Belum ada data keluarga.</div></div>;

    const canvasHeight = Math.max(...layout.members.map(m => m.y + CARD_HEIGHT), 0) + 200;

    return (
        <div className="tree-container" ref={containerRef}>
            <div className="tree-canvas" style={{ width: '5000px', height: `${canvasHeight}px` }}>
                <svg className="tree-lines" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {layout.lines.map((line, i) => (
                        line.type === 'marriage' ? (
                            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#f472b6" strokeWidth="4" strokeDasharray="6,4" strokeLinecap="round" />
                        ) : (
                            <path key={i} d={line.path} fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        )
                    ))}
                </svg>

                {layout.members.map(member => (
                    <Node key={member.id} node={member} onSelect={() => onSelect(member)} style={{ left: member.x, top: member.y, width: CARD_WIDTH, height: CARD_HEIGHT }} />
                ))}
            </div>
        </div>
    );
};

export default Tree;
