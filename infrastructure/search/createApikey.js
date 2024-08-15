//in server/create-api-key.js
import client from './clientSide.js';

async function generateApiKeys(opts) {
  const body = await client.security.createApiKey({
    body: {
      name: 'air',
      role_descriptors: {
        air0_writer: {
          cluster: ['monitor'],
          index: [
            {
              names: ['listings'],
              privileges: ['create_index', 'write', 'read', 'manage'],
            },
          ],
        },
      },
    },
  });
  return Buffer.from(`${body.id}:${body.api_key}`).toString('base64');
}

generateApiKeys()
  .then(console.log)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
