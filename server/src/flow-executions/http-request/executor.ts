import { getPrimaryErrorCodeForStatus, HTTPSTATUS } from "@/config/http.config";
import { ErrorCode } from "@/enums/error-code.enum";
import axios, { AxiosRequestConfig } from "axios";
import { NonRetriableError } from "inngest";
import { NodeExecutor, NodeExecutorParams } from "../types";
type HttpRequestExecutor = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  variableName?: string;
};
export const httpRequestExecutor: NodeExecutor<HttpRequestExecutor> = async ({
  data,
  nodeId,
  context,
  step,
}: NodeExecutorParams<HttpRequestExecutor>) => {
  // TODO Publish "loading" state for http request

  if (!data.endpoint) {
    // TODO: Publish "error" state for http request
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }
  if (data.variableName == null || data.variableName.trim() == "") {
    // TODO: Publish "error" state for http request
    throw new NonRetriableError("Variable name not configured");
  }
  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint;
    const method = data.method || "GET";
    const options: AxiosRequestConfig = {
      method,
      url: endpoint,
      timeout: 6000,
      // headers: {
      //   "Content-Type": "application/json"
      // }
    };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.data = data.body;
    }
    const variableName = data.variableName as string;
    let responsePayload = {};
    try {
      const response = await axios(options);
      responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        },
      };
    } catch (error: any) {
      const errorStatus = error.status || HTTPSTATUS.INTERNAL_SERVER_ERROR;
      if (axios.isAxiosError(error) && error.response) {
        responsePayload = {
          httpResponse: {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          },
        };
      } else {
        responsePayload = {
          httpResponse: {
            status: errorStatus,
            statusText:
              getPrimaryErrorCodeForStatus(errorStatus) ||
              ErrorCode.INTERNAL_SERVER_ERROR,
            data: null,
          },
        };
      }
    }
    // if (variableName) {
    return {
      ...context,
      [variableName]: responsePayload,
    };
    // }
    // return {
    //   ...context,

    //   ...responsePayload,
    // };
  });
  // TODO: Publish "success" state for http request
  return result;
};
