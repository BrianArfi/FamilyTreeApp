import React, { useMemo } from 'react';
import ReactFamilyTree from 'react-family-tree';
import Node from './Node';

const WIDTH = 200;
const HEIGHT = 120;

const Tree = ({ data, onSelect }) => {
    const formattedNodes = useMemo(() => {
        const existingIds = new Set(data.map(p => String(p.id)));
        const virtualRootId = 'VIRTUAL_ROOT_ID';

        // 1. Format all base nodes
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

        // 2. Identify potential roots (anyone without parents in the DB)
        const potentialRoots = baseNodes.filter(n => n.parents.length === 0);

        // 3. Connect all potential roots to a single Virtual Root
        // This forces the library to render EVERYONE in one coordinate system
        const nodesWithVirtualRoot = baseNodes.map(node => {
            if (node.parents.length === 0) {
                return { ...node, parents: [{ id: virtualRootId, type: 'blood' }] };
            }
            return node;
        });

        // 4. Add the virtual root itself
        nodesWithVirtualRoot.push({
            id: virtualRootId,
            gender: 'male',
            parents: [],
            children: potentialRoots.map(r => ({ id: String(r.id), type: 'blood' })),
            siblings: [],
            spouses: [],
        });

        return nodesWithVirtualRoot;
    }, [data]);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    const rootId = 'VIRTUAL_ROOT_ID';

    return (
        <div className="tree-container" style={{ minWidth: '3000px', minHeight: '3000px' }}>
            <div style={{ padding: '20px', background: '#fff9c4', fontSize: '0.8rem', textAlign: 'center', borderBottom: '1px solid #fbc02d' }}>
                💡 TIP: Use the <b>Sidebar</b> on the left to select members and set their Father/Mother/Spouse to build the tree.
            </div>

            <ReactFamilyTree
                nodes={formattedNodes}
                rootId={rootId}
                width={WIDTH}
                height={HEIGHT}
                renderNode={(node) => {
                    // DON'T render the virtual root
                    if (node.id === 'VIRTUAL_ROOT_ID') return null;

                    return (
                        <Node
                            key={node.id}
                            node={node}
                            onSelect={() => onSelect(data.find(p => String(p.id) === node.id))}
                            style={{
                                width: WIDTH - 40,
                                height: HEIGHT - 40,
                                transform: `translate(${node.left * WIDTH + 100}px, ${node.top * HEIGHT + 100}px)`,
                            }}
                        />
                    );
                }}
            />
        </div>
    );
};

export default Tree;
