import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const style = {
    backgroundColor: "#282c34",
    color: "white",
    padding: "8px"
}

export default Token= () => {
    const [token, setToken] = useState();
    const { getAccessTokenSilently, isAuthenticated, isLoading, user  } = useAuth0();
    const handleClick = () => {
        getAccessTokenSilently().then((token) => {
            setToken(token);
        });
    }
    return (
        <div style={style}>
            <button onClick={handleClick}>Get Token</button>
        </div>
    );
}