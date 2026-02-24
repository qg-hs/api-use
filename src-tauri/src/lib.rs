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
    .setup(|app| {
      // Windows: 程序化关闭窗口装饰，实现无边框沉浸式
      #[cfg(target_os = "windows")]
      {
        use tauri::Manager;
        if let Some(window) = app.get_webview_window("main") {
          let _: Result<(), tauri::Error> = window.set_decorations(false);
        }
      }
      let _ = app; // 避免非 Windows 平台的未使用警告
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
