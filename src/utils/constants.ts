import type { BodyType, FormKV, HttpMethod, KV } from "../types";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];
export const BODY_TYPES: BodyType[] = [
  "none",
  "form",
  "json",
  "text",
  "html",
  "javascript",
];

export const emptyKV = (): KV => ({ key: "", value: "", enabled: true });
export const emptyFormKV = (): FormKV => ({
  key: "",
  value: "",
  valueType: "text",
  enabled: true,
});
