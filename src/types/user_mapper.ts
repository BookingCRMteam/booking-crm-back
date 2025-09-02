interface RawUserPayload {
  given_name?: string;
  family_name?: string;
  nickname?: string;
}

export function mapToUserEntity(payload: RawUserPayload) {
  return {
    firstPersonName: payload.given_name || payload.nickname || '',
    firstPersonSurname: payload.family_name || '',
  };
}
