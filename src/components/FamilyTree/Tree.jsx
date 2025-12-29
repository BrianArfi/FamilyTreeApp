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

    // Group nodes into disconnected families
    const families = useMemo(() => {
        if (formattedNodes.length === 0) return [];

        const visited = new Set();
        const results = [];

        formattedNodes.forEach(startNode => {
            if (visited.has(startNode.id)) return;

            const family = [];
            const queue = [startNode.id];
            visited.add(startNode.id);

            while (queue.length > 0) {
                const id = queue.shift();
                const node = formattedNodes.find(n => n.id === id);
                if (!node) continue;
                family.push(node);

                // Find all immediate relatives
                const relatives = [
                    ...node.parents.map(p => p.id),
                    ...node.spouses.map(s => s.id),
                    ...formattedNodes.filter(n => n.parents.some(p => p.id === id)).map(n => n.id),
                    ...formattedNodes.filter(n => n.spouses.some(s => s.id === id)).map(n => n.id)
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
        <div className="tree-container" style={{ padding: '80px' }}>
            {families.length === 0 && <div style={{ padding: '2rem' }}>No data found.</div>}

            {families.map((family, index) => {
                // Find a root (someone with no parents)
                const familyRoot = family.find(n => n.parents.length === 0) || family[0];

                return (
                    <div key={index} className="family-section" style={{
                        marginBottom: '150px',
                        position: 'relative',
                        minHeight: '300px',
                        borderLeft: '3px solid var(--primary-light)',
                        paddingLeft: '40px'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: -40,
                            left: 0,
                            background: 'var(--primary-light)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: 'var(--primary)'
                        }}>
                            FAMILY GROUP {index + 1}
                        </div>

                        <ReactFamilyTree
                            nodes={family}
                            rootId={familyRoot.id}
                            width={WIDTH}
                            height={HEIGHT}
                            renderNode={(node) => (
                                <Node
                                    key={node.id}
                                    node={node}
                                    onSelect={() => onSelect(data.find(p => String(p.id) === node.id))}
                                    style={{
                                        width: WIDTH - 30,
                                        height: HEIGHT - 30,
                                        transform: `translate(${node.left * WIDTH}px, ${node.top * HEIGHT}px)`,
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
