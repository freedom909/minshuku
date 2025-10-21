from neo4j import GraphDatabase, exceptions
import ssl
import certifi

# ===== 配置 =====
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD="princess"
# NEO4J_URI=bolt://35.201.159.192:7687
# NEO4J_USERNAME=neo4j
# NEO4J_DB=air

def print_ssl_info():
    print("🔹 Python SSL / OpenSSL 信息:")
    import ssl
    print(f"OpenSSL version: {ssl.OPENSSL_VERSION}")
    import certifi
    print(f"certifi certificate bundle: {certifi.where()}\n")

def test_connection(uri):
    try:
        print(f"🔹 尝试连接 Neo4j URI: {uri}")
        # 根据 URI 方案动态配置驱动
        if uri.startswith("neo4j+s://") or uri.startswith("bolt+s://"):
            print("🔹 使用安全连接 (neo4j+s:// 或 bolt+s://)")
            driver = GraphDatabase.driver(
                uri,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                connection_timeout=30,  # 增加超时时间
                max_connection_lifetime=60,
            )
        else:
            print("🔹 使用非安全连接 (bolt://)")
            driver = GraphDatabase.driver(
                uri,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                connection_timeout=30,  # 增加超时时间
                max_connection_lifetime=60,
            )
        print(f"🔹 解析到的服务器地址: {uri} -> ('35.201.159.192', 7687)")
        with driver.session() as session:
            result = session.run("RETURN 1 AS test")
            print(f"✅ 成功连接！查询结果: {result.single()['test']}\n")
        driver.close()
        return True
    except exceptions.ServiceUnavailable as e:
        print(f"❌ 服务不可用: {e}\n")
        print("⚠️ 请检查服务器是否运行，或网络是否正常！")
    except exceptions.AuthError as e:
        print(f"❌ 认证失败: {e}\n")
        print("⚠️ 请检查用户名和密码是否正确！")
    except exceptions.Neo4jError as e:
        print(f"❌ Neo4jError: {e}\n")
    except Exception as e:
        print(f"❌ 其他错误: {e}\n")
        print("⚠️ 请检查网络配置或服务器状态！")
    return False

def check_network_connection(host, port):
    try:
        import socket
        with socket.create_connection((host, port), timeout=5):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError) as e:
        print(f"❌ 网络连接失败 ({host}:{port}): {e}")
        return False

def validate_config():
    """验证配置是否正确"""
    print("🔹 验证配置...")
    # 检查 NEO4J_URI 格式
    if not NEO4J_URI.startswith(("neo4j://", "neo4j+s://", "bolt://", "bolt+s://")):
        print(f"❌ NEO4J_URI 格式无效: {NEO4J_URI}")
        return False
    # 检查用户名和密码
    if not NEO4J_USER or not NEO4J_PASSWORD:
        print("❌ NEO4J_USER 或 NEO4J_PASSWORD 未设置")
        return False
    print("✅ 配置验证通过")
    return True

def main():
    print_ssl_info()

    # 验证配置
    if not validate_config():
        return

    # 检查 Neo4j 服务器是否可达
    neo4j_host = "9265dc34.databases.neo4j.io"
    neo4j_port = 7687
    if not check_network_connection(neo4j_host, neo4j_port):
        print("⚠️ 请检查网络配置或服务器状态！")
        return

    # 检查 SSL 证书
    try:
        import certifi
        certifi.where()
        print(f"✅ SSL 证书路径有效: {certifi.where()}")
    except Exception as e:
        print(f"❌ SSL 证书检查失败: {e}")
        return

    # 安全连接 (neo4j+s://)
    success = test_connection(NEO4J_URI)
    if not success:
        print("⚠️ 安全连接失败，尝试非安全连接 (bolt://)")
        # 非安全连接，仅测试
        test_connection("bolt://localhost:7687")

if __name__ == "__main__":
    main()
