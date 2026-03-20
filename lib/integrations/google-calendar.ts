import { prisma } from "@/lib/prisma";

type CreateGoogleMeetEventInput = {
  bookingId: string;
  hostId: string;
  hostEmail?: string | null;
  hostTimezone?: string | null;
  eventTypeName: string;
  guestEmail: string;
  guestName?: string | null;
  guestNotes?: string | null;
  startTimeUtc: Date;
  endTimeUtc: Date;
};

type UpdateGoogleCalendarEventInput = {
  hostId: string;
  googleCalendarEventId: string;
  hostEmail?: string | null;
  hostTimezone?: string | null;
  eventTypeName: string;
  guestEmail: string;
  guestName?: string | null;
  guestNotes?: string | null;
  startTimeUtc: Date;
  endTimeUtc: Date;
};

type CreateGoogleMeetEventResult = {
  eventId: string | null;
  htmlLink: string | null;
  meetLink: string | null;
  errorCode?: string;
  errorMessage?: string;
};

type HostGoogleAccount = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
};

type GoogleRequestArgs = {
  hostId: string;
  url: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  payload?: Record<string, unknown>;
};

type GoogleRequestResult = {
  response: Response | null;
  reason?: "GOOGLE_NOT_CONNECTED" | "TOKEN_UNAVAILABLE";
};

type GoogleCalendarEventResponse = {
  id?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
};

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTokenExpired(expiresAt: Date | null) {
  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() <= Date.now() + TOKEN_REFRESH_BUFFER_MS;
}

async function getHostGoogleAccount(hostId: string): Promise<HostGoogleAccount | null> {
  return prisma.account.findFirst({
    where: {
      userId: hostId,
      providerId: "google",
    },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      accessTokenExpiresAt: true,
    },
  });
}

async function refreshGoogleAccessToken(accountId: string, refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const refreshBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: refreshBody.toString(),
  });

  if (!response.ok) {
    return null;
  }

  const tokenData = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!tokenData.access_token || !tokenData.expires_in) {
    return null;
  }

  const nextExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

  await prisma.account.update({
    where: { id: accountId },
    data: {
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: nextExpiry,
    },
  });

  return tokenData.access_token;
}

async function getValidGoogleAccessToken(account: HostGoogleAccount) {
  if (account.accessToken && !isTokenExpired(account.accessTokenExpiresAt)) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    return account.accessToken;
  }

  return refreshGoogleAccessToken(account.id, account.refreshToken);
}

async function sendGoogleCalendarRequest(args: GoogleRequestArgs): Promise<GoogleRequestResult> {
  const account = await getHostGoogleAccount(args.hostId);

  if (!account) {
    return {
      response: null,
      reason: "GOOGLE_NOT_CONNECTED",
    };
  }

  const initialAccessToken = await getValidGoogleAccessToken(account);

  if (!initialAccessToken) {
    return {
      response: null,
      reason: "TOKEN_UNAVAILABLE",
    };
  }

  const executeWithAccessToken = (accessToken: string) => {
    const requestInit: RequestInit = {
      method: args.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    if (args.payload) {
      requestInit.body = JSON.stringify(args.payload);
    }

    return fetch(args.url, requestInit);
  };

  let response = await executeWithAccessToken(initialAccessToken);

  if (response.status !== 401 || !account.refreshToken) {
    return { response };
  }

  const refreshedAccessToken = await refreshGoogleAccessToken(
    account.id,
    account.refreshToken
  );

  if (!refreshedAccessToken) {
    return { response };
  }

  response = await executeWithAccessToken(refreshedAccessToken);
  return { response };
}

async function extractGoogleApiErrorMessage(response: Response) {
  const fallbackMessage = `Google Calendar API error (${response.status})`;

  try {
    const payload = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return payload.error?.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function getCalendarEvent(args: {
  hostId: string;
  googleCalendarEventId: string;
}) {
  const requestResult = await sendGoogleCalendarRequest({
    hostId: args.hostId,
    url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      args.googleCalendarEventId
    )}?conferenceDataVersion=1`,
    method: "GET",
  });

  if (!requestResult.response || !requestResult.response.ok) {
    return null;
  }

  return (await requestResult.response.json()) as GoogleCalendarEventResponse;
}

function buildCalendarPayload(args: {
  eventTypeName: string;
  guestEmail: string;
  guestName?: string | null;
  guestNotes?: string | null;
  hostEmail?: string | null;
  hostTimezone?: string | null;
  startTimeUtc: Date;
  endTimeUtc: Date;
  includeMeetConference: boolean;
  conferenceRequestId?: string;
}) {
  const payload: Record<string, unknown> = {
    summary: args.eventTypeName,
    description: [
      args.guestName ? `Guest: ${args.guestName}` : null,
      `Guest email: ${args.guestEmail}`,
      args.guestNotes ? `Notes: ${args.guestNotes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: args.startTimeUtc.toISOString(),
      timeZone: args.hostTimezone ?? "UTC",
    },
    end: {
      dateTime: args.endTimeUtc.toISOString(),
      timeZone: args.hostTimezone ?? "UTC",
    },
    attendees: [
      { email: args.guestEmail },
      ...(args.hostEmail ? [{ email: args.hostEmail }] : []),
    ],
  };

  if (args.includeMeetConference) {
    payload.conferenceData = {
      createRequest: {
        requestId: args.conferenceRequestId,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    };
  }

  return payload;
}

function resolveMeetLink(response: GoogleCalendarEventResponse) {
  if (response.hangoutLink) {
    return response.hangoutLink;
  }

  const entryPoints = response.conferenceData?.entryPoints;

  if (!entryPoints) {
    return null;
  }

  const videoEntry = entryPoints.find((entry) => entry.entryPointType === "video");

  return videoEntry?.uri ?? null;
}

export async function createGoogleMeetEventForBooking(
  input: CreateGoogleMeetEventInput
): Promise<CreateGoogleMeetEventResult | null> {
  const calendarPayload = buildCalendarPayload({
    eventTypeName: input.eventTypeName,
    guestEmail: input.guestEmail,
    guestName: input.guestName,
    guestNotes: input.guestNotes,
    hostEmail: input.hostEmail,
    hostTimezone: input.hostTimezone,
    startTimeUtc: input.startTimeUtc,
    endTimeUtc: input.endTimeUtc,
    includeMeetConference: true,
    conferenceRequestId: `booking-${input.bookingId}`,
  });

  const requestResult = await sendGoogleCalendarRequest({
    hostId: input.hostId,
    url: "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    method: "POST",
    payload: calendarPayload,
  });

  if (!requestResult.response) {
    return {
      eventId: null,
      htmlLink: null,
      meetLink: null,
      errorCode: requestResult.reason,
      errorMessage:
        requestResult.reason === "GOOGLE_NOT_CONNECTED"
          ? "Google account is not connected"
          : "Google access token is unavailable",
    };
  }

  if (!requestResult.response.ok) {
    return {
      eventId: null,
      htmlLink: null,
      meetLink: null,
      errorCode: "GOOGLE_API_ERROR",
      errorMessage: await extractGoogleApiErrorMessage(requestResult.response),
    };
  }

  const event = (await requestResult.response.json()) as GoogleCalendarEventResponse;
  let meetLink = resolveMeetLink(event);

  // Conference data can be returned slightly after event creation; retry briefly.
  if (!meetLink && event.id) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await sleep(250);
      const latestEvent = await getCalendarEvent({
        hostId: input.hostId,
        googleCalendarEventId: event.id,
      });

      if (!latestEvent) {
        continue;
      }

      meetLink = resolveMeetLink(latestEvent) ?? meetLink;

      if (meetLink) {
        break;
      }
    }
  }

  return {
    eventId: event.id ?? null,
    htmlLink: event.htmlLink ?? null,
    meetLink,
    ...(meetLink
      ? {}
      : {
          errorCode: "MEET_LINK_PENDING",
          errorMessage:
            "Google Calendar event was created, but Meet link is not ready yet",
        }),
  };
}

export async function updateGoogleCalendarEventForBooking(
  input: UpdateGoogleCalendarEventInput
): Promise<CreateGoogleMeetEventResult | null> {
  const calendarPayload = buildCalendarPayload({
    eventTypeName: input.eventTypeName,
    guestEmail: input.guestEmail,
    guestName: input.guestName,
    guestNotes: input.guestNotes,
    hostEmail: input.hostEmail,
    hostTimezone: input.hostTimezone,
    startTimeUtc: input.startTimeUtc,
    endTimeUtc: input.endTimeUtc,
    includeMeetConference: false,
  });

  const requestResult = await sendGoogleCalendarRequest({
    hostId: input.hostId,
    url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      input.googleCalendarEventId
    )}?conferenceDataVersion=1&sendUpdates=all`,
    method: "PATCH",
    payload: calendarPayload,
  });

  if (!requestResult.response || !requestResult.response.ok) {
    return null;
  }

  const event = (await requestResult.response.json()) as GoogleCalendarEventResponse;

  return {
    eventId: event.id ?? input.googleCalendarEventId,
    htmlLink: event.htmlLink ?? null,
    meetLink: resolveMeetLink(event),
  };
}

export async function cancelGoogleCalendarEventForBooking(input: {
  hostId: string;
  googleCalendarEventId: string;
}) {
  const response = await sendGoogleCalendarRequest({
    hostId: input.hostId,
    url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      input.googleCalendarEventId
    )}?sendUpdates=all`,
    method: "DELETE",
  });

  if (!response.response) {
    return false;
  }

  return response.response.ok;
}
