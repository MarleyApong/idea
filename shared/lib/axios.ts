import axios, { AxiosError } from "axios"
import { AppError } from "./errors"

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// FormData : laisser le navigateur poser le bon Content-Type avec boundary
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }
  return config
})

// Transformer les erreurs API en AppError lisibles
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ code?: string; message?: string }>) => {
    const body = err.response?.data
    const code = body?.code ?? "API_ERROR"
    const message = body?.message ?? err.message ?? "Une erreur est survenue"
    return Promise.reject(new AppError(code, message))
  }
)
