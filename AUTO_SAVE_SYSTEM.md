# Enhanced Auto-Save & Draft System

This document describes the Phase 3 auto-save enhancements implemented across Prompt, Script, and Audio phases.

## Goals
- Silent, reliable background persistence
- Draft recovery after refresh/tab crash
- Conflict detection when remote data changes mid-edit
- Clear inline status (no toast spam)
- Extensible API for future offline/queue support

## Hook API (`useAutoSave`)
```
useAutoSave({
  data,                 // Serializable object to track
  onSave,               // Async persistence fn
  delay = 2000,         // Debounce delay
  enabled = true,       // Master flag
  storageKey?,          // Enables draft persistence if provided
  persistDraft = true,  // Disable to skip localStorage writes
  showToast = true,     // Inline UI => set false
  serverVersion?,       // Pass server updatedAt or version token
  onConflict?,          // Invoked before save if version mismatch
  onDraftRecovered?,    // Called when stale draft loaded
})
```

### Returned State
```
{
  isSaving: boolean,
  lastSaved: any,
  status: 'idle'|'dirty'|'saving'|'saved'|'error'|'conflict'|'draft',
  error: Error | null,
  hasDraft: boolean,
  restoreDraft(): any,
  discardDraft(): void,
  forceSave(): void,   // Ignore unchanged or conflict gate
  conflict: { serverVersion, lastSavedVersion } | null,
  recoveredDraft: any
}
```

## Status Semantics
| Status    | Meaning | UI Action |
|-----------|---------|-----------|
| idle      | No changes since mount/save | Subtle muted label |
| dirty     | Local changes pending | "Unsaved" pill |
| saving    | In-flight mutation | Progress pill |
| saved     | Last mutation succeeded | Success pill |
| error     | Last attempt failed | Retry on next change |
| conflict  | Server version changed before save | Offer Overwrite / Dismiss |
| draft     | Local draft differs from server state on load | Apply / Discard |

## Conflict Detection
A conflict triggers when `serverVersion` (e.g. `project.updatedAt`) differs from the version captured at last successful save. Next edits remain local until user overwrites or discards.

## Draft Persistence
- Stored in `localStorage[storageKey]` (JSON)
- Updated with a fast 400ms debounce separate from save timer
- Removed automatically after successful save when identical to remote

## Integration Points
Implemented in:
- `prompt-research.tsx` (`prompt-draft:<projectId>`) 
- `script-generation.tsx` (`script-draft:<projectId>:<episode|single>`) 
- `audio-generation.tsx` (`voice-settings-draft:<projectId>`) 

## Shared UI Component
`AutoSaveIndicator` centralizes pill rendering + action buttons (Apply Draft / Discard / Overwrite).

## Extending
1. Provide stable, minimal `data` object (avoid volatile timestamps inside).
2. Choose a deterministic `storageKey` prefix for entity scope.
3. Pass `serverVersion` (updatedAt or explicit revision counter) for conflicts.
4. Render `AutoSaveIndicator` (or custom) with hook state.
5. Avoid including `updatedAt` in `onSave`—server assigns canonical timestamp.

## Future Enhancements (Not Yet Implemented)
- Offline queue with retry backoff
- Compression for large draft payloads
- Storage quota management & eviction policy
- Merge UI for conflicts instead of overwrite
- BroadcastChannel sync across tabs

## Testing Suggestions
- Edit, wait < debounce -> status should remain `dirty`.
- Edit, pause > delay -> status transitions `saving` -> `saved`.
- Simulate conflict: open second tab, update entity, return & edit -> conflict pill.
- Hard refresh mid-edit -> draft status appears; applying draft restores content.

## Notes
- JSON stringify comparisons are shallow; large objects should remain stable in key order.
- For very large scripts, consider hashing strategy instead of full stringify to reduce CPU.

---
Maintained as part of Phase 3 baseline. Update this doc when extending capabilities.
