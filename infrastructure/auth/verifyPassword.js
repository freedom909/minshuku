import { compare } from 'bcryptjs';
const plainPassword = "Princess123.";
const storedHash = "$2b$10$vrMbpl1PC0NT6U5GwCOxC.9WKS98DHitw0/ustDOwnJ48Jpe10daW";

compare(plainPassword, storedHash).then(console.log);
