import React, { useMemo } from 'react';
import ReactFamilyTree from 'react-family-tree';
import Node from './Node';

const WIDTH = 200;
const HEIGHT = 120;

const Tree = ({ data, onSelect }) => {
    const formattedNodes = useMemo(() => {
        const existingIds = new Set(data.map(p => String(p.id)));

        // Stage 1: Basic Formatting
        const baseNodes = data.map(person => {
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

        // Stage 2: Add Virtual Root to connect disconnected components
        const roots = baseNodes.filter(n => n.parents.length === 0);
        const virtualRootId = 'VIRTUAL_ROOT_ID';

        const finalNodes = baseNodes.map(node => {
            if (node.parents.length === 0) {
                return { ...node, parents: [{ id: virtualRootId, type: 'blood' }] };
            }
            return node;
        });

        finalNodes.push({
            id: virtualRootId,
            gender: 'male',
            parents: [],
            children: roots.map(r => ({ id: r.id, type: 'blood' })),
            siblings: [],
            spouses: [],
            isVirtual: true
        });

        return finalNodes;
    }, [data]);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    const rootId = 'VIRTUAL_ROOT_ID';

    return (
        <div className="tree-container" style={{ minWidth: '2000px', minHeight: '2000px', padding: '200px' }}>
            <ReactFamilyTree
                nodes={formattedNodes}
                rootId={rootId}
                width={WIDTH}
                height={HEIGHT}
                renderNode={(node) => {
                    if (node.id === 'VIRTUAL_ROOT_ID') return null;

                    const originalPerson = data.find(p => String(p.id) === node.id);
                    return (
                        <Node
                            key={node.id}
                            node={{ ...node, ...originalPerson }} // Merge back full details
                            onSelect={() => onSelect(originalPerson)}
                            style={{
                                width: WIDTH - 30,
                                height: HEIGHT - 30,
                                transform: `translate(${node.left * WIDTH}px, ${node.top * HEIGHT}px)`,
                            }}
                        />
                    );
                }}
            />
        </div>
    );
};

export default Tree;
