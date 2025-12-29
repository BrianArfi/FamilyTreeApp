import React from 'react';
import { User, UserPlus } from 'lucide-react';

const Node = ({ node, isRoot, onSelect, style }) => {
    const isMale = node.gender?.toLowerCase() === 'male';

    return (
        <div
            className="node-card"
            onClick={() => onSelect(node)}
            style={{
                ...style,
                borderLeft: `4px solid ${isMale ? '#2563eb' : '#db2777'}`,
            }}
        >
            <div className="node-avatar">
                {node.photo_url ? (
                    <img src={node.photo_url} alt={node.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <User size={24} color={isMale ? '#2563eb' : '#db2777'} />
                )}
            </div>
            <div className="node-name">{node.name}</div>
            <div className="node-date">{node.birth_date || 'Unknown'}</div>
        </div>
    );
};

export default Node;
