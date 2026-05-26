const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

export async function sendInstagramMessage(recipientId: string, text: string) {
  const accessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    console.warn("Instagram credentials not configured, skipping send.");
    return;
  }

  const response = await fetch(
    `${GRAPH_API_URL}/${accountId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
        messaging_type: "RESPONSE",
        access_token: accessToken,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Instagram send error:", error);
    throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function getInstagramUserProfile(userId: string) {
  const accessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!accessToken) return null;

  const response = await fetch(
    `${GRAPH_API_URL}/${userId}?fields=name,username,profile_pic&access_token=${accessToken}`
  );

  if (!response.ok) return null;
  return response.json() as Promise<{
    name?: string;
    username?: string;
    profile_pic?: string;
    id: string;
  }>;
}
