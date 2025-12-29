import React, { useMemo } from 'react';
import ReactFamilyTree from 'react-family-tree';
import Node from './Node';

const WIDTH = 200;
const HEIGHT = 120;

const Tree = ({ data, onSelect }) => {
    // react-family-tree expects data in a specific format
    // We might need to transform our "father_id/mother_id" to the library's format
    const rootId = useMemo(() => {
        if (data.length === 0) return null;
        // For now, let's pick the one with no parents as root or just the first one
        const withoutParents = data.find(p => !p.father_id && !p.mother_id);
        return withoutParents ? withoutParents.id : data[0].id;
    }, [data]);

    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No family data yet. Add someone to start!</div>;

    return (
        <div className="tree-container">
            <ReactFamilyTree
                nodes={data}
                rootId={rootId}
                width={WIDTH}
                height={HEIGHT}
                renderNode={(node) => (
                    <Node
                        key={node.id}
                        node={node}
                        isRoot={node.id === rootId}
                        onSelect={onSelect}
                        style={{
                            width: WIDTH - 20,
                            height: HEIGHT - 20,
                            transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                        }}
                    />
                )}
            />
        </div>
    );
};

export default Tree;
