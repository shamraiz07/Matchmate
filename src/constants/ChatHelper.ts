//Helper function
export const buildConversationList = (messages = [], currentUserId: number) => {
  const map = {};

  messages.forEach(msg => {
    const otherUser =
      msg.sender.id === currentUserId ? msg.receiver : msg.sender;

    if (!map[otherUser.id]) {
      map[otherUser.id] = {
        id: otherUser.id,
        user: otherUser,
        lastMessage: msg.content,
        latest_message: {
          content: msg.content,
          created_at: msg.created_at,
        },
        timestamp: msg.created_at,
      };
    } else if (msg.created_at > map[otherUser.id].timestamp) {
      map[otherUser.id].lastMessage = msg.content;
      map[otherUser.id].latest_message = {
        content: msg.content,
        created_at: msg.created_at,
      };
      map[otherUser.id].timestamp = msg.created_at;
    }
  });

  // Sort by latest message timestamp (descending - newest first)
  return Object.values(map).sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

//helper function2
export const getConversationBetweenUsers = (
  messages = [],
  currentUserId,
  otherUserId,
) => {
  return messages
    .filter(
      msg =>
        (msg.sender.id === currentUserId && msg.receiver.id === otherUserId) ||
        (msg.sender.id === otherUserId && msg.receiver.id === currentUserId),
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
};
