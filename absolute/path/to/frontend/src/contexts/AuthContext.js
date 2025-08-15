// ... existing code ...
  // 从 localStorage 初始化用户
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("[AuthContext] Initializing auth with token:", token);
        setLoading(true); // 确保加载状态为 true
        if (token) {
          await validateToken(token);
        } else {
          setUser(null);
          setLoading(false);
          console.log("[AuthContext] No token found, user not authenticated");
        }
      } catch (err) {
        console.error("[AuthContext] Auth init error:", err);
        setError(`初始化认证失败: ${err.message}`);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []); // 确保只在组件挂载时运行一次

  // 添加 token 验证函数
  const validateToken = async (token) => {
    try {
      console.log("[AuthContext] Validating token...");
      const operations = {
        query: `
          query ValidateToken {
            validateToken {
              userId
              role
              name
            }
          }
        `
      };

      const response = await axios.post('/graphql', operations, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("[AuthContext] Token validation response:", response.data);

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message || 'Token validation failed');
      }

      const userData = response.data.data?.validateToken;
      if (userData) {
        setUser(userData);
        console.log("[AuthContext] Token validated successfully, user set to:", userData);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        console.log("[AuthContext] Token invalid or no user data returned, user logged out");
      }
    } catch (err) {
      console.error("[AuthContext] Token validation error:", err);
      localStorage.removeItem('token');
      setUser(null);
      setError(`验证令牌失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
// ... existing code ...