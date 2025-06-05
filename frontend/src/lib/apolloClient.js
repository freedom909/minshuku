import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import config from '../config/config';

// 创建 HTTP 链接
const httpLink = createHttpLink({
  uri: config.API_URL,
  credentials: 'include', // 包含 cookies
});

// 错误处理链接
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// 添加认证头
const authLink = setContext((operation, { headers }) => {
  // 从 localStorage 获取 token
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('jwt_token');
  }

  // 对于登录和注册操作，不添加认证头
  const skipAuth = ['signIn', 'signUp'].includes(operation.operationName);
  if (skipAuth) {
    return { headers };
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 创建 Apollo Client 实例
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none', // 修改为 'none' 以便抛出错误
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none', // 修改为 'none' 以便抛出错误
    },
    mutate: {
      errorPolicy: 'none', // 修改为 'none' 以便抛出错误
    },
  },
});

export default client;