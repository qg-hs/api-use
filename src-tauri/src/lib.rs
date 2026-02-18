mod request;

use request::{execute_request_impl, RequestPayload, RunResult};

#[tauri::command]
async fn execute_request(payload: RequestPayload) -> Result<RunResult, String> {
  execute_request_impl(payload).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![execute_request])
    .setup(|_app| {
      // Windows: 程序化关闭窗口装饰，实现无边框沉浸式
      #[cfg(target_os = "windows")]
      {
        use tauri::Manager;
        if let Some(window) = app.get_webview_window("main") {
          let _ = window.set_decorations(false);
        }
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
