import { TypingIndicator } from "../../types/chat";

export function TypingIndicatorText({
  typingUsers,
  currentUserName,
}: {
  typingUsers: TypingIndicator[];
  currentUserName: string;
}) {
  const others = typingUsers.filter((u) => u.personName !== currentUserName);
  const count = others.length;

  if (count === 0) return null;
  if (count === 1) return <p>{others[0].personName} is typing...</p>;
  if (count === 2)
    return <p>{others[0].personName} and {others[1].personName} are typing...</p>;

  return <p>{others[0].personName} + {count - 1} others are typing...</p>;
}
