mod request;

use request::{execute_request_impl, RequestPayload, RunResult};

#[tauri::command]
async fn execute_request(payload: RequestPayload) -> Result<RunResult, String> {
  execute_request_impl(payload).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![execute_request])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

