from dataclasses import dataclass, field
from typing import List


@dataclass
class Turn:
    role: str   # "user" or "assistant"
    content: str


@dataclass
class ConversationState:
    summary: str = ""
    turns: List[Turn] = field(default_factory=list)


class ConversationManager:
    def __init__(self, max_turns: int = 12):
        # max_turns = how many recent turns to keep verbatim
        self.max_turns = max_turns
        # For now we use a single global state (one conversation)
        self.state = ConversationState()

    def add_turn(self, role: str, content: str) -> None:
        self.state.turns.append(Turn(role=role, content=content))

    def get_recent_turns(self) -> List[Turn]:
        return self.state.turns[-self.max_turns :]

    def get_context_text(self) -> str:
        """
        Build the text we will send to the council as context:
        - Summary (if any)
        - Then recent turns.
        """
        parts: List[str] = []
        if self.state.summary:
            parts.append("Conversation summary so far:\n" + self.state.summary.strip() + "\n")

        if self.state.turns:
            parts.append("Recent conversation:")
            for t in self.get_recent_turns():
                prefix = "User" if t.role == "user" else "Assistant"
                parts.append(f"{prefix}: {t.content.strip()}")

        return "\n".join(parts).strip()

    def maybe_update_summary(self, summarizer) -> None:
        """
        If there are many turns, ask a model (summarizer) to
        compress the history into an updated summary.
        'summarizer' is a function we will pass in that takes
        a text prompt and returns a string summary.
        """
        # Simple rule: if more than 20 turns, summarize.
        if len(self.state.turns) < 20:
            return

        history_text = self._build_history_for_summary()
        prompt = (
            "You are summarizing a long consulting conversation between a user and an AI council.\n"
            "Write a concise summary capturing:\n"
            "- key goals and questions\n"
            "- important facts and assumptions\n"
            "- decisions made so far\n"
            "- open questions or next steps.\n\n"
            f"Full history:\n{history_text}"
        )
        new_summary = summarizer(prompt).strip()
        if new_summary:
            self.state.summary = new_summary
            # Optionally trim older turns; here we keep only the last few
            self.state.turns = self.get_recent_turns()

    def _build_history_for_summary(self) -> str:
        lines: List[str] = []
        if self.state.summary:
            lines.append("Existing summary:\n" + self.state.summary.strip() + "\n")

        for t in self.state.turns:
            prefix = "User" if t.role == "user" else "Assistant"
            lines.append(f"{prefix}: {t.content.strip()}")

        return "\n".join(lines).strip()
