use reqwest::{header::HeaderMap, Client, Method};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use url::Url;

const MAX_BODY_SIZE: usize = 2 * 1024 * 1024;

#[derive(Debug, Deserialize)]
pub struct Kv {
  key: String,
  value: String,
  enabled: bool,
}

#[derive(Debug, Deserialize)]
pub struct Auth {
  #[serde(rename = "type")]
  auth_type: String,
  token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct Body {
  #[serde(rename = "type")]
  body_type: String,
  value: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct RequestPayload {
  method: String,
  url: String,
  auth: Auth,
  headers: Vec<Kv>,
  query: Vec<Kv>,
  body: Body,
  #[serde(rename = "timeoutMs")]
  timeout_ms: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct RunResult {
  status: Option<u16>,
  #[serde(rename = "durationMs")]
  duration_ms: u128,
  headers: HashMap<String, String>,
  body: String,
  error: Option<String>,
}

fn add_headers(builder: reqwest::RequestBuilder, payload: &RequestPayload) -> reqwest::RequestBuilder {
  let mut req = builder;
  for h in &payload.headers {
    if h.enabled && !h.key.is_empty() {
      req = req.header(h.key.clone(), h.value.clone());
    }
  }

  if payload.auth.auth_type == "bearer" {
    if let Some(token) = &payload.auth.token {
      if !token.is_empty() {
        req = req.header("Authorization", format!("Bearer {}", token));
      }
    }
  }

  if payload.body.body_type == "json" {
    req = req.header("Content-Type", "application/json");
  }

  if payload.body.body_type == "form" {
    req = req.header("Content-Type", "application/x-www-form-urlencoded");
  }

  req
}

fn encode_body(payload: &RequestPayload) -> Result<Option<String>, String> {
  if payload.method.to_uppercase() == "GET" || payload.body.body_type == "none" {
    return Ok(None);
  }

  match payload.body.body_type.as_str() {
    "json" => {
      // 前端 TextArea 传来的 JSON 字符串会被 serde 反序列化为 Value::String，
      // 直接取原值避免 serde_json::to_string 二次转义
      let raw = match &payload.body.value {
        serde_json::Value::String(s) => s.clone(),
        other => serde_json::to_string(other)
          .map_err(|e| format!("JSON 序列化失败: {}", e))?,
      };
      Ok(Some(raw))
    }
    "form" => {
      let arr = payload
        .body
        .value
        .as_array()
        .ok_or("form body 必须为数组")?;
      let mut serializer = url::form_urlencoded::Serializer::new(String::new());
      for item in arr {
        let key = item.get("key").and_then(|v| v.as_str()).unwrap_or("");
        let value = item.get("value").and_then(|v| v.as_str()).unwrap_or("");
        let enabled = item.get("enabled").and_then(|v| v.as_bool()).unwrap_or(false);
        if enabled && !key.is_empty() {
          serializer.append_pair(key, value);
        }
      }
      Ok(Some(serializer.finish()))
    }
    _ => Ok(Some(payload.body.value.as_str().unwrap_or("").to_string())),
  }
}

fn header_map_to_record(headers: &HeaderMap) -> HashMap<String, String> {
  let mut out: HashMap<String, String> = HashMap::new();
  for (key, value) in headers.iter() {
    let value_str = value.to_str().unwrap_or_default().to_string();
    if let Some(existing) = out.get_mut(key.as_str()) {
      existing.push(',');
      existing.push_str(&value_str);
    } else {
      out.insert(key.to_string(), value_str);
    }
  }
  out
}

pub async fn execute_request_impl(payload: RequestPayload) -> Result<RunResult, String> {
  let method = Method::from_bytes(payload.method.as_bytes()).map_err(|e| format!("非法 Method: {}", e))?;

  let mut url = Url::parse(&payload.url).map_err(|e| format!("URL 无效: {}", e))?;
  for q in &payload.query {
    if q.enabled && !q.key.is_empty() {
      url.query_pairs_mut().append_pair(&q.key, &q.value);
    }
  }

  let timeout_ms = payload.timeout_ms.unwrap_or(15000);
  let client = Client::builder()
    .timeout(Duration::from_millis(timeout_ms))
    .build()
    .map_err(|e| format!("客户端初始化失败: {}", e))?;

  let start = Instant::now();
  let body = encode_body(&payload)?;
  let mut request = client.request(method, url);
  request = add_headers(request, &payload);
  if let Some(content) = body {
    request = request.body(content);
  }

  match request.send().await {
    Ok(resp) => {
      let status = resp.status().as_u16();
      let headers = header_map_to_record(resp.headers());
      let bytes = resp.bytes().await.map_err(|e| format!("读取响应失败: {}", e))?;
      let is_truncated = bytes.len() > MAX_BODY_SIZE;
      let body_bytes = if is_truncated {
        bytes.slice(..MAX_BODY_SIZE)
      } else {
        bytes
      };
      let mut body = String::from_utf8_lossy(&body_bytes).to_string();
      if is_truncated {
        body.push_str(&format!("\n\n[Truncated: body exceeded {} bytes]", MAX_BODY_SIZE));
      }

      Ok(RunResult {
        status: Some(status),
        duration_ms: start.elapsed().as_millis(),
        headers,
        body,
        error: None,
      })
    }
    Err(e) => Ok(RunResult {
      status: None,
      duration_ms: start.elapsed().as_millis(),
      headers: HashMap::new(),
      body: String::new(),
      error: Some(format!("请求失败: {}", e)),
    }),
  }
}
