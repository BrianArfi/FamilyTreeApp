import React, { useMemo } from 'react';
import ReactFamilyTree from 'react-family-tree';
import Node from './Node';

const WIDTH = 200;
const HEIGHT = 120;

const Tree = ({ data, onSelect }) => {
    const formattedNodes = useMemo(() => {
        const existingIds = new Set(data.map(p => String(p.id)));

        return data.map(person => {
            const parents = [];
            if (person.father_id && person.father_id !== "" && existingIds.has(String(person.father_id))) {
                parents.push({ id: String(person.father_id), type: 'blood' });
            }
            if (person.mother_id && person.mother_id !== "" && existingIds.has(String(person.mother_id))) {
                parents.push({ id: String(person.mother_id), type: 'blood' });
            }

            const spouses = [];
            if (person.spouses && person.spouses !== "") {
                person.spouses.split(',').forEach(spouseId => {
                    if (spouseId !== "" && existingIds.has(String(spouseId))) {
                        spouses.push({ id: String(spouseId), type: 'married' });
                    }
                });
            }

            return {
                ...person,
                id: String(person.id),
                gender: (person.gender || 'male').toLowerCase(),
                parents,
                children: [],
                siblings: [],
                spouses
            };
        });
    }, [data]);

    // Split nodes into disconnected families
    const families = useMemo(() => {
        const visited = new Set();
        const results = [];

        formattedNodes.forEach(node => {
            if (visited.has(node.id)) return;
            const family = [];
            const queue = [node.id];
            visited.add(node.id);

            while (queue.length > 0) {
                const id = queue.shift();
                const n = formattedNodes.find(i => i.id === id);
                if (!n) continue;
                family.push(n);

                // Find all relatives to group them
                const relatives = [
                    ...n.parents.map(p => p.id),
                    ...formattedNodes.filter(o => o.parents.some(p => p.id === id)).map(o => o.id),
                    ...n.spouses.map(s => s.id),
                    ...formattedNodes.filter(o => o.spouses.some(s => s.id === id)).map(o => o.id)
                ];

                relatives.forEach(relId => {
                    if (!visited.has(relId)) {
                        visited.add(relId);
                        queue.push(relId);
                    }
                });
            }
            results.push(family);
        });
        return results;
    }, [formattedNodes]);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    return (
        <div className="tree-container" style={{ minHeight: '800px' }}>
            {families.map((family, familyIndex) => {
                const root = family.find(n => n.parents.length === 0) || family[0];
                return (
                    <div key={familyIndex} style={{ position: 'relative' }}>
                        <ReactFamilyTree
                            nodes={family}
                            rootId={root.id}
                            width={WIDTH}
                            height={HEIGHT}
                            renderNode={(node) => (
                                <Node
                                    key={node.id}
                                    node={node}
                                    onSelect={() => onSelect(data.find(p => String(p.id) === node.id))}
                                    style={{
                                        width: WIDTH - 40,
                                        height: HEIGHT - 40,
                                        // Offset each family vertically so they don't overlap
                                        transform: `translate(${node.left * WIDTH + 50}px, ${node.top * HEIGHT + (familyIndex * (HEIGHT * 2)) + 50}px)`,
                                    }}
                                />
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default Tree;
