import axios from "axios";
import cookies from "next-cookies";
// import Router from "next/router";
const NODE_BASE_URL = "http://localhost:5000";
export const Axios = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: `${NODE_BASE_URL}/api`,
});

Axios.interceptors.request.use(
  function (config) {
    const { token, refreshToken } = cookies("");
    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";
    config.headers["content-encoding"] = "gzip, compress, br";
    config.credentials = "include";
    if (token) {
      config.headers.refreshToken = refreshToken;
      config.headers["x-auth-token"] = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // retry request with new access token when current token expire
    const originalRequest = error.config;
    if (error.config?.header) {
      error.config.headers["Content-Type"] = "application/json";
    }
    if (error?.response?.status === 401) {
      const { refreshToken: token } = cookies("");
      if (!token) {
        if (process.browser) {
          document.cookie = `token=""; path=/;`;
          document.cookie = `refreshToken=""; path=/;`;
        }
      }
      try {
        const { data } = await axios.post(
          NODE_BASE_URL + "/api/user/refreshToken",
          { token },
        );
        const newToken = data?.data?.idToken;

        if (newToken) {
          if (process.browser) {
            document.cookie = `token=${newToken}; path=/;`;
          }

          Axios.defaults.headers.common["x-auth-token"] = `Bearer ${newToken}`;
          originalRequest.headers["x-auth-token"] = `Bearer ${newToken}`;
          return Axios(originalRequest);
        }
      } catch (err) {
        console.log("error on refreshToken", err);
        if (process.browser) {
          if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel("log-out");
            channel.postMessage("log-out");
          }
          document.cookie = `token=""; path=/;`;
          document.cookie = `refreshToken=""; path=/;`;
        }
        window.location.href = "/";
        return;
        // alert("Error refresh Token!!!");
      }
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("errorAxios", error?.response?.toJSON());
      document.cookie = `token=""; path=/;`;
      document.cookie = `refreshToken=""; path=/;`;
      window.location.href = "/";
      // Router.push("/");
    }
    return Promise.reject(error);
  },
);

export default Axios;
