interface RawUserPayload {
  given_name?: string;
  family_name?: string;
  nickname?: string;
}

export function mapToUserEntity(payload: RawUserPayload) {
  return {
    firstName: payload.given_name || payload.nickname || '',
    lastName: payload.family_name || '',
  };
}
