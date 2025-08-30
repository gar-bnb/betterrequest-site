const GROUP_KEY = "bq.groupId";


export function getOrCreateGroupId(): string {
let v = localStorage.getItem(GROUP_KEY);
if (!v) {
v = crypto.randomUUID();
localStorage.setItem(GROUP_KEY, v);
}
return v;
}


export function getGroupId(): string | null {
return localStorage.getItem(GROUP_KEY);
}