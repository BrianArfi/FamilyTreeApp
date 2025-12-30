import React from 'react';
import { User, UserPlus } from 'lucide-react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    // Check if it's an ISO string from Google Sheets/JS Date
    if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        if (!isNaN(d)) {
            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        }
    }
    return dateStr;
};

const Node = ({ node, isRoot, onSelect, style }) => {
    const isMale = node.gender?.toLowerCase() === 'male';

    return (
        <div
            className="node-card"
            onClick={() => onSelect(node)}
            style={{
                ...style,
                borderLeft: `4px solid ${isMale ? '#2563eb' : '#ec4899'}`,
            }}
        >
            <div className="node-avatar">
                {node.photo_url ? (
                    <img src={node.photo_url} alt={node.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <User size={24} color={isMale ? '#2563eb' : '#ec4899'} />
                )}
            </div>
            <div className="node-name">{node.name}</div>
            <div className="node-date">{formatDate(node.birth_date)}</div>
        </div>
    );
};

export default Node;
