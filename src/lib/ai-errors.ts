export function friendlyError(e: any): string {
  const raw = String(e?.message ?? e ?? "")

  const intentional = [
    "No relevant material",
    "No material found",
    "No questions generated",
    "Invalid part",
    "Invalid response format",
  ]
  if (intentional.some((k) => raw.includes(k))) return raw

  if (/no longer available|NOT_FOUND|404|model/i.test(raw))
    return "AI service is being upgraded. Please try again in a few minutes."
  if (/429|quota|rate limit|RESOURCE_EXHAUSTED|too many/i.test(raw))
    return "Too many requests right now. Please wait a few seconds and try again."
  if (/API key|API_KEY|permission|401|403/i.test(raw))
    return "AI service is temporarily unavailable. Please try again later."
  if (/fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|abort/i.test(raw))
    return "Connection issue. Please check your internet and try again."
  return "Something went wrong on our side. Please try again."
}