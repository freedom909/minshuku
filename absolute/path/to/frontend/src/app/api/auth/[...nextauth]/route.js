// ... existing code ...
          user {
            firstname
            lastname
            email
          }
        }
        success
        message
      }
    }
  `,
  variables: {
    input: { email, password }
  }
});
const result = response.data?.data?.signIn;

const { auth, success, message } = result;

if (!success || !auth?.token || !auth?.userId) {
  throw new Error(message || "Authentication failed");
}

return {
id: auth.userId,
email: auth.user.email,
name: `${auth.user.firstname} ${auth.user.lastname}`,
role: auth.role,
 token: auth.token
};
});

// ... existing code ...

export { handler as GET, handler as POST };