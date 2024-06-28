export async function validateInviteCode(session, inviteCode) {
  const readTxResultPromise = session.readTransaction(async (txc) => {
    const result = await txc.run(
      `MATCH (ic:InviteCode { code: toUpper($inviteCode) })
       RETURN
       CASE
       WHEN ic.expiresAt IS NULL THEN true
       WHEN datetime(ic.expiresAt) >= datetime() THEN true
       ELSE false END AS result`,
      { inviteCode }
    );
    return result.records[0]?.get('result');
  });
  try {
    const txResult = await readTxResultPromise;
    return !!txResult;
  } finally {
    await session.close();
  }
}
