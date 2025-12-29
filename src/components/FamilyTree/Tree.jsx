import React, { useMemo } from 'react';
import Node from './Node';

const CARD_WIDTH = 180;
const CARD_HEIGHT = 100;
const H_GAP = 60;
const V_GAP = 120;

const Tree = ({ data, onSelect }) => {
    const layout = useMemo(() => {
        if (!data || data.length === 0) return { members: [], lines: [] };

        const members = [...data].map(p => ({ ...p, id: String(p.id) }));
        const idMap = new Map(members.map(m => [m.id, m]));

        // 1. Assign Levels (Generations)
        const levels = new Map();
        const processed = new Set();

        // Find absolute roots (no parents listed, or parents not in DB)
        const roots = members.filter(m => {
            const hasFather = m.father_id && idMap.has(String(m.father_id));
            const hasMother = m.mother_id && idMap.has(String(m.mother_id));
            return !hasFather && !hasMother;
        });

        const assignLevel = (id, level) => {
            if (processed.has(id)) return;
            levels.set(id, Math.max(levels.get(id) || 0, level));
            processed.add(id);

            // Recursive to children
            members.filter(m => String(m.father_id) === id || String(m.mother_id) === id)
                .forEach(child => assignLevel(child.id, level + 1));
        };

        roots.forEach(r => assignLevel(r.id, 0));

        // Safety: any orphaned nodes get level 0
        members.forEach(m => {
            if (!levels.has(m.id)) assignLevel(m.id, 0);
        });

        // 2. Group by Level and Assign X
        const levelGroups = [];
        levels.forEach((lvl, id) => {
            if (!levelGroups[lvl]) levelGroups[lvl] = [];
            levelGroups[lvl].push(idMap.get(id));
        });

        const positionedMembers = [];
        levelGroups.forEach((group, lvl) => {
            const totalWidth = group.length * (CARD_WIDTH + H_GAP) - H_GAP;
            const startX = -totalWidth / 2; // Center horizontally

            group.forEach((m, idx) => {
                const x = startX + idx * (CARD_WIDTH + H_GAP);
                const y = lvl * (CARD_HEIGHT + V_GAP);
                positionedMembers.push({ ...m, x, y });
                const memberRef = idMap.get(m.id);
                if (memberRef) {
                    memberRef.x = x;
                    memberRef.y = y;
                }
            });
        });

        // 3. Generate Lines (Connectors)
        const lines = [];
        positionedMembers.forEach(child => {
            const father = positionedMembers.find(p => p.id === String(child.father_id));
            const mother = positionedMembers.find(p => p.id === String(child.mother_id));

            if (father) {
                lines.push({
                    x1: father.x + CARD_WIDTH / 2,
                    y1: father.y + CARD_HEIGHT,
                    x2: child.x + CARD_WIDTH / 3, // Offset slightly to separate lines if needed
                    y2: child.y
                });
            }
            if (mother) {
                lines.push({
                    x1: mother.x + CARD_WIDTH / 2,
                    y1: mother.y + CARD_HEIGHT,
                    x2: child.x + (CARD_WIDTH * 2) / 3,
                    y2: child.y
                });
            }
        });

        return { members: positionedMembers, lines };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="tree-container">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    No family data yet. Add someone to start!
                </div>
            </div>
        );
    }

    return (
        <div className="tree-container">
            <div className="tree-canvas" style={{ transform: 'translateX(600px)' }}> {/* Center buffer */}
                <svg className="tree-lines">
                    {layout.lines.map((line, i) => (
                        <path
                            key={i}
                            d={`M ${line.x1} ${line.y1} L ${line.x1} ${line.y1 + V_GAP / 2} L ${line.x2} ${line.y1 + V_GAP / 2} L ${line.x2} ${line.y2}`}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="2"
                        />
                    ))}
                </svg>

                {layout.members.map((member) => (
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
