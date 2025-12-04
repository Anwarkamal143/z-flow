/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL, POKEMON_API_BASE_URL } from "@/config";
export var API_POOL = {
  //   "user-mng": process.env.REACT_APP_USER_MNG_BASE_URL,
  //   "dev-sett": process.env.REACT_APP_DEV_SETT_BASE_URL,
  //   "gui-fusion": process.env.REACT_APP_GUI_FUSION_BASE_URL,
  //   "data-mng": process.env.REACT_APP_DATA_MNG_BASE_URL,
  //   contact: process.env.REACT_APP_CONTACT_BASE_URL,
  //   "public-1": process.env.REACT_APP_PUBLIC_API_1_BASE_URL,
  "public-1": API_BASE_URL,
  "pokemon-1": POKEMON_API_BASE_URL,
} as const;

const codeMessage: { [key: string]: string } = {
  200: "The request has succeeded",
  201: "New resource has been created ",
  202: "The request has been received",
  204: "No Content",
  400: "The server could not understand the request due to invalid syntax.",
  401: "Unauthorized Operation",
  403: "You do not have access rights to the content",
  404: "Not Found",
  406: "Not Acceptable",
  410: "The request content is not longer available",
  422: "The request was well-formed but was unable to be followed due to semantic errors.",
  500: "The server has encountered a situation it doesn't know how to handle",
  502: "Bad Gateway",
  503: "The server is not ready to handle the request",
  504: "Timeout",
};

const baseURL = API_POOL["public-1"];
// const baseURL = 'https://401d-182-184-90-121.eu.ngrok.io';

export interface IAxiosRequest extends Partial<AxiosRequestConfig> {
  public?: boolean;
  handleError?: boolean;
  attachToken?: boolean;
  attachAccountId?: boolean;
  token?: string;
  _retry?: boolean; // Internal flag to avoid infinite loops
}

function createAxiosInstance(base: string) {
  return axios.create({
    baseURL: base,
    // timeout: 60000,
    withCredentials: true,
  });
}
const axiosRequest = createAxiosInstance(baseURL);
const axiosSecondaryRequest = createAxiosInstance(baseURL);

// Network Check Utility
const checkNetworkConnection = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch("https://www.google.com/generate_204", {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-cache",
    });
    clearTimeout(timeoutId);
    return response.status === 204 || response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};

// Add request interceptor

axiosRequest.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig<any> & IAxiosRequest) => {
    return reqConfig;
  },
  (error) => {
    // Do something with request error here
    // notification.error({
    // 	message: 'Error'
    // })
    return Promise.reject(error);
  }
);

axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    // if (
    //   ["post", "put", "patch", "delete"].includes(response.config.method || "")
    // ) {
    //   toast.success(response.data?.message || "Success");
    // }
    return response;
  },
  async (error) => {
    // All other errors
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || codeMessage[status] || "Unknown error";

    if (status && codeMessage[status]) {
      // toast.error(message);
    }
    return Promise.reject(error);

    // return Promise.reject({
    //   ...error.response,
    //   success: false,
    //   errorHandled: true,
    //   reason: message,
    // });
  }
);

export type CustomResponse = {
  success?: boolean;
  errorHandled?: boolean;
  reason?: string;
  message?: string;
  issue?: string;
} & Partial<AxiosResponse>;

type RequestError = { response: CustomResponse };

const errorHandler = (error: RequestError): CustomResponse => {
  // if (error instanceof axios.Cancel) {
  if (axios.isCancel(error)) {
    const reason =
      ((error as any)?.config?.signal as any)?.reason ||
      ((error as any)?.message as string) ||
      "cancelled";

    return {
      success: false,
      errorHandled: true,
      reason: reason,

      ...error,
    };
  }

  const { response } = error;

  if (response && response.status) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    response.success = false;
    response.errorHandled = true;
    const errorText = codeMessage[response.status] || "Unknown error";
    return {
      message: response?.data?.message || response?.message,
      ...response,
      success: false,
      errorHandled: true,
      reason: errorText,
    };
  } else if (!response) {
    const isOnline = navigator?.onLine ? true : false;

    if (navigator) {
      if (!isOnline) {
        return {
          success: false,
          errorHandled: true,
          issue: "offline",
          message: "You are offline. Please check your internet connection.",
          reason: "network",
        };
      }
      return {
        success: false,
        errorHandled: true,
        issue: "down",
        message: "Server is not responding",
        reason: "server",
      };
    }

    // Check if server is reachable
    // try {
    //   const hasInternet = await checkNetworkConnection();
    //   return {
    //     success: false,
    //     errorHandled: true,
    //     issue: hasInternet ? "down" : "offline",
    //     message: hasInternet
    //       ? "Server is not responding"
    //       : "No internet connection",
    //     reason: hasInternet ? "server" : "network",
    //   };
    // } catch {
    //   return {
    //     success: false,
    //     errorHandled: true,
    //     reason: "network",
    //     message: "Network error occurred",
    //     issue: "unknown",
    //   };
    // }

    return {
      success: false,
      errorHandled: true,
      reason: "network",
      message: "Network error occurred",
      issue: "unknown",
    };
  }

  return {
    message:
      response?.data?.message || response?.message || "Unknown error occurred",
    ...response,
    success: false,
    errorHandled: true,
    reason: "network",
  };
};

/**
 * Fetch data from given url
 * @param {*} url
 * @param {*} options
 *
 * Note Don't add anymore params if needed add a object type called 'extra' or something
 * can tell me what's the need for includeAuthHead?
 */
async function request(
  url: string,
  options: IAxiosRequest = {
    handleError: true,
    public: true,
  }
) {
  const handleError = options.handleError ?? true;
  options.handleError = handleError;
  const isPublic = options.public != null ? options.public : true;
  options.public = isPublic;
  try {
    const res = await axiosRequest(url, options);
    return res;
  } catch (e) {
    if (handleError) {
      throw errorHandler(e as RequestError);
    } else {
      throw e;
    }
  }
}
const secondaryRequest = async (
  url: string,
  options: IAxiosRequest = {
    handleError: true,
  }
) => {
  const handleError = options.handleError ?? true;
  const isPublic = options.public != null ? options.public : true;
  options.public = isPublic;
  try {
    const res = await axiosSecondaryRequest(url, options);
    return res;
  } catch (e) {
    if (handleError) {
      throw errorHandler(e as RequestError);
    } else {
      throw e;
    }
  }
};

export default request;
export { axiosRequest, axiosSecondaryRequest, secondaryRequest };
