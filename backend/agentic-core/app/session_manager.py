"""
Multi-turn session state.

This is what lets the Planner do genuine plan *revision* ("what about the
day after?") instead of treating every message as a fresh, context-free
query. In-memory dict keyed by session_id, TTL-expired lazily on access.
Swap `_STORE` for Redis/Mongo without touching callers if you need
multi-instance deployment.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.config import settings
from app.schemas import Plan, AgentResult


@dataclass
class Turn:
    query: str
    plan: Plan
    agent_results: List[AgentResult]
    answer: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class SessionState:
    session_id: str
    language: str = "en"
    location: Optional[Dict[str, float]] = None  # last known lat/lon
    entities: Dict[str, Any] = field(default_factory=dict)  # e.g. {"place":"Ratnagiri","date":"2026-09-14"}
    turns: List[Turn] = field(default_factory=list)
    last_touched: float = field(default_factory=time.time)

    def touch(self):
        self.last_touched = time.time()

    @property
    def last_turn(self) -> Optional[Turn]:
        return self.turns[-1] if self.turns else None


class SessionManager:
    def __init__(self):
        self._store: Dict[str, SessionState] = {}

    def get_or_create(self, session_id: str) -> SessionState:
        self._evict_expired()
        state = self._store.get(session_id)
        if state is None:
            state = SessionState(session_id=session_id)
            self._store[session_id] = state
        state.touch()
        return state

    def record_turn(self, session_id: str, turn: Turn):
        state = self.get_or_create(session_id)
        state.turns.append(turn)
        # Fold newly-mentioned entities forward so follow-ups inherit them.
        for st in turn.plan.subtasks:
            for k in ("place", "location_name", "date", "radius_km"):
                if k in st.args and st.args[k]:
                    state.entities[k] = st.args[k]
        state.touch()

    def _evict_expired(self):
        cutoff = time.time() - settings.SESSION_TTL_MINUTES * 60
        expired = [sid for sid, s in self._store.items() if s.last_touched < cutoff]
        for sid in expired:
            del self._store[sid]


# Process-wide singleton; fine for a single-instance FastAPI demo/dev deploy.
session_manager = SessionManager()
