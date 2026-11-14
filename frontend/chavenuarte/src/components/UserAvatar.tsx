import { useEffect, useState } from 'react';
import type { UserIdentity } from '../types/domain';
export function UserAvatar({ user }: { user: UserIdentity }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [user.photoUrl]);
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?';
    return (
        <span className="avatar" aria-hidden="true">
            {user.photoUrl && !failed ? (
                <img
                    src={user.photoUrl}
                    alt=""
                    onError={() => setFailed(true)}
                />
            ) : (
                initials
            )}
        </span>
    );
}
