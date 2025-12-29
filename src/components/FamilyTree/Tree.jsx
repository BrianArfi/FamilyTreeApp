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

                // Relatives: parents, children, spouses
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

    console.log("Tree Debug - Families found:", families.length, families);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    return (
        <div className="tree-container" style={{ padding: '100px', minHeight: '100%' }}>
            <div style={{ padding: '15px', background: '#e3f2fd', fontSize: '0.85rem', textAlign: 'center', marginBottom: '40px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                💡 <b>Tip:</b> If members are separated, click one in the sidebar and set their <b>Father/Mother/Spouse</b> to connect them.
            </div>

            {families.map((family, fIdx) => {
                // Pick a root for this component
                const root = family.find(n => n.parents.length === 0) || family[0];
                console.log(`Rendering Family ${fIdx + 1} with root ${root.name}`);

                return (
                    <div key={fIdx} style={{ position: 'relative', minHeight: '400px', marginBottom: '200px', borderTop: fIdx > 0 ? '1px dashed #ccc' : 'none', paddingTop: '40px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '10px' }}>FAMILY GROUP {fIdx + 1}</div>
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
