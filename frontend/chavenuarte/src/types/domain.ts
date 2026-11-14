export type Role = 'supervisor' | 'admin' | 'bolsista' | 'unauthorized';
export type Permission =
    | 'overview'
    | 'keys'
    | 'movements'
    | 'operate'
    | 'manageKeys'
    | 'manageTeam'
    | 'manageSettings'
    | 'supervise';
export type View =
    | 'overview'
    | 'keys'
    | 'movements'
    | 'team'
    | 'settings'
    | 'management';
export type KeyStatus = 'available' | 'in_use' | 'inactive' | 'blocked';
export type ReservationState =
    | 'scheduled'
    | 'in_use'
    | 'returned'
    | 'overdue'
    | 'cancelled';

export interface UserIdentity {
    id: number;
    name: string;
    registration: string;
    photoUrl: string | null;
}
export interface TeamMember extends UserIdentity {
    role: Role;
    status: 'active' | 'suspended' | 'revoked';
    suspendedUntil: string | null;
    shift: string;
}
export interface Space {
    id: number;
    name: string;
    block: string;
    room: string;
}
export interface TimeWindow {
    start: string;
    end: string;
}
export interface AccessRules {
    weekdays: number[];
    windows: TimeWindow[];
    maxDurationMinutes: number | null;
    allowedMemberIds: number[];
}
export interface KeyBlock {
    kind: 'temporary' | 'permanent';
    reason: string;
    startsAt: string | null;
    endsAt: string | null;
}
export interface Key {
    id: number;
    name: string;
    description: string;
    active: boolean;
    code: string;
    spaceId: number | null;
    rules: AccessRules;
    block: KeyBlock | null;
}
export interface Reservation {
    id: number;
    keyId: number;
    operatorId: number;
    registration: string;
    startsAt: string;
    endsAt: string;
    status: 'approved' | 'checked_out' | 'returned' | 'cancelled';
    purpose: string;
    checkedOutAt: string | null;
    returnedAt: string | null;
    borrower: string;
    notes: string;
    returnNotes: string;
}
// Physical events are separate from future reservations and retained for traceability.
export interface Movement {
    id: number;
    keyId: number;
    reservationId: number;
    kind: 'withdrawal' | 'return';
    occurredAt: string;
    responsible: string;
}
export interface PendingChange {
    id: string;
    label: string;
    deadline: number;
}
export interface DashboardSnapshot {
    referenceDate: string;
    currentUser: TeamMember;
    spaces: Space[];
    keys: Key[];
    reservations: Reservation[];
    movements: Movement[];
    team: TeamMember[];
    globalRules: AccessRules;
    pendingChange: PendingChange | null;
}
export interface ReservationRequest {
    keyId: number;
    mode: 'now' | 'schedule';
    startsAt?: string;
    endsAt: string;
    purpose: string;
    notes: string;
}
export interface ReturnRequest {
    reservationId: number;
    notes: string;
}
export interface KeyDraft {
    code: string;
    name: string;
    description: string;
    spaceId: number | null;
    newSpace?: Omit<Space, 'id'>;
    rules: AccessRules;
    block: KeyBlock | null;
}
export type AdminAction =
    | { type: 'save-key'; keyId?: number; value: KeyDraft }
    | { type: 'archive-key'; keyId: number }
    | { type: 'set-key-block'; keyId: number; block: KeyBlock | null }
    | {
          type: 'team-access';
          userId: number;
          role: Role;
          status: TeamMember['status'];
          suspendedUntil: string | null;
      }
    | { type: 'global-rules'; rules: AccessRules };
export interface ServiceEvent {
    snapshot: DashboardSnapshot;
    message?: string;
    error?: string;
}
export interface KeyService {
    load(signal?: AbortSignal): Promise<DashboardSnapshot>;
    registerMovement(
        keyId: number,
        kind: Movement['kind'],
        signal?: AbortSignal,
    ): Promise<DashboardSnapshot>;
    reserve(
        request: ReservationRequest,
        signal?: AbortSignal,
    ): Promise<DashboardSnapshot>;
    checkoutReservation(
        id: number,
        signal?: AbortSignal,
    ): Promise<DashboardSnapshot>;
    returnKey(
        request: ReturnRequest,
        signal?: AbortSignal,
    ): Promise<DashboardSnapshot>;
    cancelReservation(id: number): Promise<DashboardSnapshot>;
    stageAdmin(action: AdminAction): Promise<DashboardSnapshot>;
    undoPending(id: string): Promise<DashboardSnapshot>;
    subscribe(listener: (event: ServiceEvent) => void): () => void;
    dispose(): void;
}
