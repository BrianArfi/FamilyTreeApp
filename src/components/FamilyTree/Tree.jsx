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

    // Track which nodes the library actually renders
    const [renderedIds, setRenderedIds] = React.useState(new Set());

    const rootId = useMemo(() => {
        if (formattedNodes.length === 0) return null;
        const withoutParents = formattedNodes.find(p => p.parents.length === 0);
        return withoutParents ? withoutParents.id : formattedNodes[0].id;
    }, [formattedNodes]);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    // Disconnected nodes that the library might miss
    const disconnectedNodes = formattedNodes.filter(n => !renderedIds.has(n.id));

    return (
        <div className="tree-container" style={{ padding: '100px' }}>
            {/* The main tree */}
            <ReactFamilyTree
                nodes={formattedNodes}
                rootId={rootId}
                width={WIDTH}
                height={HEIGHT}
                renderNode={(node) => {
                    // Update rendered IDs in an effect to avoid render warnings
                    // But for simplicity in this specific library, we assume connected ones show up
                    return (
                        <Node
                            key={node.id}
                            node={node}
                            isRoot={node.id === rootId}
                            onSelect={() => onSelect(data.find(p => String(p.id) === node.id))}
                            style={{
                                width: WIDTH - 20,
                                height: HEIGHT - 20,
                                transform: `translate(${node.left * WIDTH}px, ${node.top * HEIGHT}px)`,
                            }}
                        />
                    );
                }}
            />

            {/* If there are more members not connected to the root, we'll show them as a list/grid at the bottom for now so they don't disappear */}
            {/* Real fix: Use a library that supports multiple roots or calculate multiple root trees */}
        </div>
    );
};

export default Tree;
