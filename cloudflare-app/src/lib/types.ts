export type UUID = string;


export type Clue = {
id: string; // slug or nanoid
location: string; // human label ("Big Oak by the gate")
text: string; // clue text
tagId?: string; // optional NFC/QR tag id if assigned
order: number; // 0..N-1 within route
};


export type HuntConfig = {
id: UUID;
name: string;
createdAt: string; // ISO
createdBy?: string;
template?: string; // e.g. "schoolyard", "office", "park"
route: Clue[];
cooldownSeconds?: number; // default 60
public: boolean; // if true, expose without auth
};


export type GroupState = {
groupId: string;
huntId: UUID;
progressIndex: number; // index of next clue to reveal
lastScanAt?: string; // ISO for cooldown logic
startedAt: string; // ISO
completedAt?: string; // ISO
};


export type AiGenerateRequest = {
context: string; // free text context about venue and vibe
locations: string[]; // list of simple place labels
style?: string; // e.g. "playful", "premium", "riddle"
};