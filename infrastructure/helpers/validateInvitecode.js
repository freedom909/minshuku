import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'neo4j')
);
async function validateInviteCode(inviteCode) {
  const session = driver.session();
  
  try {
    const result = await session.run(
      `MATCH (ic:InviteCode { code: $inviteCode })
       RETURN CASE
       WHEN ic.expiresAt IS NULL THEN true
       WHEN datetime(ic.expiresAt) >= datetime() THEN true
       ELSE false END AS isValid`,
      { inviteCode }
    );

    const isValid = result.records[0].get('isValid');
    return isValid;
  } catch (error) {
    console.error('Error validating invite code:', error);
    return false;
  } finally {
    await session.close();
  }
}

export default validateInviteCode;