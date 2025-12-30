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

        // 1. Calculate Generations (Levels)
        const getLevel = (id, depth = 0) => {
            if (levels.has(id)) return levels.get(id);
            if (depth > 50) return 0;
            const m = idMap.get(id);
            if (!m) return 0;

            const fId = m.father_id ? String(m.father_id) : null;
            const mId = m.mother_id ? String(m.mother_id) : null;

            const fL = (fId && idMap.has(fId)) ? getLevel(fId, depth + 1) + 1 : 0;
            const mL = (mId && idMap.has(mId)) ? getLevel(mId, depth + 1) + 1 : 0;
            const res = Math.max(fL, mL);
            levels.set(id, res);
            return res;
        };
        members.forEach(m => getLevel(m.id));

        // 2. Position members horizontally per generation
        const positioned = [];
        const levelGroups = {};
        members.forEach(m => {
            const l = levels.get(m.id) || 0;
            if (!levelGroups[l]) levelGroups[l] = [];
            levelGroups[l].push(m);
        });

        Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b)).forEach(lvl => {
            const row = levelGroups[lvl];
            const totalWidth = row.length * CARD_WIDTH + (row.length - 1) * H_GAP;
            const startX = CANVAS_CENTER - totalWidth / 2;
            row.forEach((m, i) => {
                const x = startX + i * (CARD_WIDTH + H_GAP);
                const y = Number(lvl) * (CARD_HEIGHT + V_GAP) + 100;
                m.x = x;
                m.y = y;
                positioned.push(m);
            });
        });

        // 3. Generate Relationship Lines
        const lines = [];
        positioned.forEach(child => {
            const fId = child.father_id ? String(child.father_id) : null;
            const mId = child.mother_id ? String(child.mother_id) : null;
            const f = fId ? positioned.find(p => p.id === fId) : null;
            const m = mId ? positioned.find(p => p.id === mId) : null;

            if (f && m) {
                // Both parents: Marriage line + Branch
                const midX = (f.x + m.x + CARD_WIDTH) / 2;
                const midY = f.y + CARD_HEIGHT + (V_GAP / 3);

                // Marriage line (Dashed)
                lines.push({
                    type: 'marriage',
                    x1: Math.min(f.x, m.x) + CARD_WIDTH,
                    y1: f.y + CARD_HEIGHT / 2,
                    x2: Math.max(f.x, m.x),
                    y2: f.y + CARD_HEIGHT / 2
                });

                // Vertical from marriage line down
                lines.push({
                    type: 'connector',
                    path: `M ${midX} ${f.y + CARD_HEIGHT / 2} L ${midX} ${midY} L ${child.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${child.y}`
                });
            } else if (f || m) {
                // Single parent: Orthogonal connector
                const parent = f || m;
                const midY = parent.y + CARD_HEIGHT + (V_GAP / 3);
                lines.push({
                    type: 'connector',
                    path: `M ${parent.x + CARD_WIDTH / 2} ${parent.y + CARD_HEIGHT} L ${parent.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${midY} L ${child.x + CARD_WIDTH / 2} ${child.y}`
                });
            }

            // Independent Marriage Lines (if spouse defined but not already handled by parents logic)
            if (child.spouses && child.spouses.trim() !== "") {
                child.spouses.split(',').forEach(sid => {
                    const s = positioned.find(p => p.id === sid.trim());
                    if (s) {
                        // Draw horizontal line between them
                        const x1 = Math.min(child.x, s.x) + CARD_WIDTH;
                        const x2 = Math.max(child.x, s.x);
                        if (x1 < x2) {
                            lines.push({ type: 'marriage', x1, y1: child.y + CARD_HEIGHT / 2, x2, y2: child.y + CARD_HEIGHT / 2 });
                        }
                    }
                });
            }
        });

        return { members: positioned, lines };
    }, [data]);

    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            // Initially scroll to center
            containerRef.current.scrollLeft = CANVAS_CENTER - containerRef.current.clientWidth / 2;
        }
    }, []);

    if (data.length === 0) {
        return (
            <div className="tree-container">
                <div style={{ padding: '2rem', textAlign: 'center' }}>Belum ada data keluarga.</div>
            </div>
        );
    }

    const canvasHeight = Math.max(...layout.members.map(m => m.y + CARD_HEIGHT), 0) + 200;

    return (
        <div className="tree-container" ref={containerRef} style={{ position: 'relative' }}>
            <div className="tree-canvas" style={{ width: '5000px', height: `${canvasHeight}px` }}>
                <svg className="tree-lines" style={{ width: '100%', height: '100%' }}>
                    {layout.lines.map((line, i) => (
                        line.type === 'marriage' ? (
                            <line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#f472b6"
                                strokeWidth="3"
                                strokeDasharray="5,5"
                            />
                        ) : (
                            <path
                                key={i}
                                d={line.path}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        )
                    ))}
                </svg>

                {layout.members.map(member => (
                    <Node
                        key={member.id}
                        node={member}
                        onSelect={() => onSelect(member)}
                        style={{
                            left: member.x,
                            top: member.y,
                            width: CARD_WIDTH,
                            height: CARD_HEIGHT
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Tree;
