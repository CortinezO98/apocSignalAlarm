export type ClaimStatus = 'OtpPending'|'DocsValidating'|'Filed';
export interface Claim { id:string; claimantDocNumber:string; victimDocNumber:string; status:ClaimStatus; docketNumber?:string; }
export interface DocItem { type:string; status:'Uploaded'|'Valid'|'Invalid'; }
