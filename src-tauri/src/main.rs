// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, WebviewUrl, WebviewWindowBuilder, Manager};

#[command]
fn open_webview(app: tauri::AppHandle, title: String, url: String) -> Result<(), String> {
    let label = format!("webview_{}", title.to_lowercase().replace(" ", "_"));
    
    WebviewWindowBuilder::new(&app, &label, WebviewUrl::External(url.parse().unwrap()))
        .title(&title)
        .inner_size(1200.0, 800.0)
        .build()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_webview])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
